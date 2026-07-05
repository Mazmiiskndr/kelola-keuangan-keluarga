<?php

namespace App\Services\Ai;

use App\Ai\Agents\FinancialAdvisorAgent;
use App\Enums\AiAnalysisType;
use App\Models\AiAnalysis;
use App\Models\AiRecommendation;
use App\Models\User;
use App\Services\Finance\FinancialMetricService;
use Illuminate\Support\Arr;
use Laravel\Ai\Ai;
use Throwable;

class AiAnalysisService
{
    public function __construct(
        private readonly FinancialMetricService $metrics,
        private readonly AiProviderCatalog $catalog,
    ) {}

    public function generateMonthly(User $user, ?string $period = null): AiAnalysis
    {
        $snapshot = $this->metrics->monthlySummary($user, $period);
        $aiResult = $this->generateWithConfiguredProvider($user, $snapshot);
        $recommendations = $aiResult['recommendations'] ?? $this->deterministicRecommendations($snapshot);

        $analysis = AiAnalysis::query()->create([
            'user_id' => $user->id,
            'period_start' => $snapshot['period']['start'],
            'period_end' => $snapshot['period']['end'],
            'analysis_type' => AiAnalysisType::Monthly->value,
            'input_snapshot' => $snapshot,
            'metrics_snapshot' => $snapshot['totals'],
            'result_summary' => $aiResult['summary'] ?? $this->summary($snapshot),
            'recommendations' => $recommendations,
            'model_name' => $aiResult['model'] ?? config('ai.finance_analysis_model', 'deterministic-rules'),
            'status' => 'completed',
        ]);

        foreach ($recommendations as $recommendation) {
            AiRecommendation::query()->create([
                'ai_analysis_id' => $analysis->id,
                'user_id' => $user->id,
                'type' => $recommendation['type'],
                'title' => $recommendation['title'],
                'description' => $recommendation['description'],
                'estimated_saving_amount' => $recommendation['estimated_saving_amount'] ?? 0,
                'confidence_score' => $recommendation['confidence_score'] ?? 75,
                'status' => 'new',
            ]);
        }

        return $analysis->load('aiRecommendations');
    }

    private function generateWithConfiguredProvider(User $user, array $snapshot): ?array
    {
        $provider = $user->ai_provider ?: $this->catalog->defaultProvider();
        $model = $user->ai_model ?: $this->catalog->defaultModelFor($provider);

        if (! $this->catalog->isValidProvider($provider) || ! $this->catalog->isValidModel($provider, $model) || blank($user->ai_api_key)) {
            return null;
        }

        $configKey = "ai.providers.{$provider}.key";
        $previousKey = config($configKey);

        config([$configKey => $user->ai_api_key]);
        Ai::forgetInstance($provider);

        try {
            $response = (new FinancialAdvisorAgent)->prompt(
                prompt: 'Analisis metrik keuangan berikut dan berikan output sesuai schema: '.json_encode($snapshot, JSON_THROW_ON_ERROR),
                provider: $provider,
                model: $model,
                timeout: 60,
            );

            if (! method_exists($response, 'toArray')) {
                return null;
            }

            $payload = $response->toArray();
            $recommendations = collect($payload['recommendations'] ?? [])
                ->filter(fn ($item) => is_array($item) && filled($item['title'] ?? null) && filled($item['description'] ?? null))
                ->map(fn (array $item): array => [
                    'type' => $item['type'] ?? 'saving_plan',
                    'title' => (string) $item['title'],
                    'description' => (string) $item['description'],
                    'estimated_saving_amount' => max(0, (float) ($item['estimated_saving_amount'] ?? 0)),
                    'confidence_score' => max(0, min(100, (int) ($item['confidence_score'] ?? 70))),
                ])
                ->values()
                ->all();

            return [
                'summary' => filled($payload['summary'] ?? null) ? (string) $payload['summary'] : null,
                'recommendations' => $recommendations ?: null,
                'model' => "{$provider}:{$model}",
            ];
        } catch (Throwable $exception) {
            report($exception);

            return null;
        } finally {
            config([$configKey => $previousKey]);
            Ai::forgetInstance($provider);
        }
    }

    private function summary(array $snapshot): string
    {
        $cashFlow = (float) Arr::get($snapshot, 'totals.cash_flow', 0);
        $expense = (float) Arr::get($snapshot, 'totals.expense', 0);
        $debtRatio = (float) Arr::get($snapshot, 'totals.debt_to_income_ratio', 0);

        if ($cashFlow < 0) {
            return 'Cash flow bulan ini negatif. Prioritaskan pengurangan pengeluaran fleksibel dan evaluasi cicilan.';
        }

        if ($debtRatio >= 30) {
            return 'Cash flow masih positif, tetapi rasio cicilan tinggi sehingga tabungan dan investasi perlu dibuat konservatif.';
        }

        return $expense > 0
            ? 'Cash flow bulan ini masih terkendali. Ada peluang optimasi dari kategori pengeluaran terbesar.'
            : 'Data pengeluaran belum cukup. Tambahkan transaksi agar analisis AI lebih akurat.';
    }

    private function deterministicRecommendations(array $snapshot): array
    {
        $largestCategory = $snapshot['expense_by_category'][0] ?? null;
        $cashFlow = (float) Arr::get($snapshot, 'totals.cash_flow', 0);
        $debtDue = (float) Arr::get($snapshot, 'totals.debt_due', 0);

        $recommendations = [];

        if ($largestCategory) {
            $savingAmount = round(((float) $largestCategory['amount']) * 0.15);
            $recommendations[] = [
                'type' => 'savable',
                'title' => 'Tekan pengeluaran '.$largestCategory['name'],
                'description' => 'Kategori ini menjadi pengeluaran terbesar bulan ini. Target hemat realistis sekitar 15% tanpa mengganggu kebutuhan utama.',
                'estimated_saving_amount' => $savingAmount,
                'confidence_score' => 78,
            ];
        }

        if ($debtDue > 0) {
            $recommendations[] = [
                'type' => 'debt',
                'title' => 'Prioritaskan cicilan sebelum tabungan agresif',
                'description' => 'Total cicilan bulan ini harus dianggap kebutuhan wajib sebelum menentukan nominal tabungan atau investasi.',
                'estimated_saving_amount' => 0,
                'confidence_score' => 86,
            ];
        }

        $recommendations[] = [
            'type' => 'saving_plan',
            'title' => $cashFlow > 0 ? 'Sisihkan cash flow positif' : 'Pulihkan cash flow terlebih dahulu',
            'description' => $cashFlow > 0
                ? 'Gunakan sebagian cash flow positif untuk target tabungan, sisanya untuk buffer kebutuhan tidak terduga.'
                : 'Tunda investasi tambahan sampai cash flow kembali positif.',
            'estimated_saving_amount' => max(0, round($cashFlow * 0.5)),
            'confidence_score' => 72,
        ];

        return $recommendations;
    }
}
