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
        $healthScore = $this->calculateHealthScore($snapshot['totals']);

        $fallback = $this->fallbackAnalysis($snapshot);

        $recommendations = $aiResult['recommendations'] ?? $this->deterministicRecommendations($snapshot);

        $analysis = AiAnalysis::query()->create([
            'user_id' => $user->id,
            'period_start' => $snapshot['period']['start'],
            'period_end' => $snapshot['period']['end'],
            'analysis_type' => AiAnalysisType::Monthly->value,
            'headline' => $aiResult['headline'] ?? $fallback['headline'],
            'tone' => $aiResult['tone'] ?? $fallback['tone'],
            'health_score' => $healthScore,
            'input_snapshot' => $snapshot,
            'metrics_snapshot' => $snapshot['totals'],
            'result_summary' => $aiResult['summary'] ?? $fallback['summary'],
            'recommendations' => $recommendations,
            'model_name' => $aiResult['model'] ?? config('ai.finance_analysis_model', 'deterministic-rules'),
            'status' => 'completed',
        ]);

        foreach ($recommendations as $recommendation) {
            AiRecommendation::query()->create([
                'ai_analysis_id' => $analysis->id,
                'user_id' => $user->id,
                'type' => $recommendation['type'],
                'priority' => $recommendation['priority'] ?? 'Bisa Dioptimalkan',
                'title' => $recommendation['title'],
                'description' => $recommendation['description'],
                'why_it_matters' => $recommendation['why_it_matters'] ?? '',
                'next_action' => $recommendation['next_action'] ?? '',
                'source_metric' => $recommendation['source_metric'] ?? '',
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
                    'type' => $item['type'] ?? 'next_step',
                    'priority' => $item['priority'] ?? 'Bisa Dioptimalkan',
                    'title' => (string) $item['title'],
                    'description' => (string) $item['description'],
                    'why_it_matters' => (string) ($item['why_it_matters'] ?? ''),
                    'next_action' => (string) ($item['next_action'] ?? ''),
                    'source_metric' => (string) ($item['source_metric'] ?? ''),
                    'estimated_saving_amount' => max(0, (float) ($item['estimated_saving_amount'] ?? 0)),
                    'confidence_score' => max(0, min(100, (int) ($item['confidence_score'] ?? 70))),
                ])
                ->values()
                ->all();

            return [
                'headline' => filled($payload['headline'] ?? null) ? (string) $payload['headline'] : null,
                'tone' => filled($payload['tone'] ?? null) ? (string) $payload['tone'] : null,
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

    private function calculateHealthScore(array $totals): int
    {
        $score = 50;
        $cashFlow = (float) Arr::get($totals, 'cash_flow', 0);
        $savingRatio = (float) Arr::get($totals, 'saving_ratio', 0);
        $debtRatio = (float) Arr::get($totals, 'debt_to_income_ratio', 0);

        if ($cashFlow > 0) {
            $score += 20;
        } elseif ($cashFlow < 0) {
            $score -= 20;
        }

        if ($savingRatio >= 20) {
            $score += 20;
        } elseif ($savingRatio >= 10) {
            $score += 10;
        }

        if ($debtRatio <= 30) {
            $score += 10;
        } elseif ($debtRatio > 40) {
            $score -= 10;
        }

        return max(0, min(100, (int) $score));
    }

    private function fallbackAnalysis(array $snapshot): array
    {
        $cashFlow = (float) Arr::get($snapshot, 'totals.cash_flow', 0);
        $expense = (float) Arr::get($snapshot, 'totals.expense', 0);
        $debtRatio = (float) Arr::get($snapshot, 'totals.debt_to_income_ratio', 0);

        if ($cashFlow < 0) {
            return [
                'headline' => 'Cash flow bulan ini negatif, butuh penyesuaian segera',
                'tone' => 'alert',
                'summary' => 'Pengeluaranmu saat ini lebih besar dari pemasukan. Jangan panik, tapi kita perlu segera mencari pos pengeluaran fleksibel yang bisa dikurangi bulan ini agar tidak menggerus tabungan.',
            ];
        }

        if ($debtRatio >= 30) {
            return [
                'headline' => 'Hati-hati, beban cicilanmu cukup tinggi',
                'tone' => 'caution',
                'summary' => 'Cash flow kamu positif, tapi rasio cicilan terhadap pendapatan sudah di batas atas. Usahakan jangan menambah utang baru dulu dan fokus bereskan cicilan berjalan.',
            ];
        }

        if ($expense > 0) {
            return [
                'headline' => 'Keuangan bulan ini aman terkendali!',
                'tone' => 'encouraging',
                'summary' => 'Pemasukan dan pengeluaran kamu cukup berimbang. Masih ada peluang untuk mengoptimalkan sisa uang ke tabungan atau dana darurat tanpa mengganggu kenyamanan hidup.',
            ];
        }

        return [
            'headline' => 'Belum banyak transaksi bulan ini',
            'tone' => 'neutral',
            'summary' => 'Data pengeluaranmu belum cukup untuk dianalisis lebih dalam. Yuk rutin catat setiap transaksi agar ke depannya insight ini lebih akurat.',
        ];
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
                'type' => 'opportunity',
                'priority' => 'Bisa Dioptimalkan',
                'title' => 'Kurangi Pengeluaran '.$largestCategory['name'],
                'description' => 'Ini adalah pos pengeluaran terbesar kamu bulan ini.',
                'why_it_matters' => 'Mengurangi 15-20% dari kategori ini bisa langsung memberikan ruang bernapas untuk cash flow bulan depan.',
                'next_action' => 'Evaluasi kembali budget untuk kategori ini',
                'source_metric' => 'expense_by_category',
                'estimated_saving_amount' => $savingAmount,
                'confidence_score' => 78,
            ];
        }

        if ($debtDue > 0) {
            $recommendations[] = [
                'type' => 'alert',
                'priority' => 'Penting',
                'title' => 'Amankan Dana Cicilan Dulu',
                'description' => 'Beban cicilan bulanan kamu butuh perhatian ekstra.',
                'why_it_matters' => 'Gagal bayar cicilan berdampak panjang ke skor kredit. Pastikan dana ini dialokasikan di awal sebelum kamu menabung atau investasi.',
                'next_action' => 'Bayar cicilan sebelum tanggal jatuh tempo',
                'source_metric' => 'debt_due',
                'estimated_saving_amount' => 0,
                'confidence_score' => 86,
            ];
        }

        $recommendations[] = [
            'type' => 'goal',
            'priority' => $cashFlow > 0 ? 'Rencana' : 'Penting',
            'title' => $cashFlow > 0 ? 'Tabung Sisa Uang Bulan Ini' : 'Pulihkan Kondisi Keuangan',
            'description' => $cashFlow > 0
                ? 'Ada uang lebih yang sayang kalau habis begitu saja.'
                : 'Fokus pangkas pengeluaran yang kurang penting.',
            'why_it_matters' => $cashFlow > 0
                ? 'Mengalokasikan sisa cash flow ke tabungan akan mempercepat tercapainya tujuan keuanganmu.'
                : 'Cash flow negatif akan memaksa kamu menggerus tabungan atau berutang jika dibiarkan.',
            'next_action' => $cashFlow > 0 ? 'Transfer ke rekening tabungan' : 'Hentikan belanja non-esensial sementara waktu',
            'source_metric' => 'cash_flow',
            'estimated_saving_amount' => max(0, round($cashFlow * 0.5)),
            'confidence_score' => 72,
        ];

        return $recommendations;
    }
}
