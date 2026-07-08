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

        if (!$aiResult) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'ai' => 'AI gagal memproses (pastikan API Key Anda sudah diisi di menu Pengaturan dan koneksi internet stabil).'
            ]);
        }

        $healthScore = $this->calculateHealthScore($snapshot['totals']);
        $recommendations = $aiResult['recommendations'];

        $analysis = AiAnalysis::query()->create([
            'user_id' => $user->id,
            'period_start' => $snapshot['period']['start'],
            'period_end' => $snapshot['period']['end'],
            'analysis_type' => AiAnalysisType::Monthly->value,
            'headline' => $aiResult['headline'],
            'tone' => $aiResult['tone'],
            'health_score' => $healthScore,
            'input_snapshot' => $snapshot,
            'metrics_snapshot' => $snapshot['totals'],
            'result_summary' => $aiResult['summary'],
            'recommendations' => $recommendations,
            'model_name' => $aiResult['model'],
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

        if (! $this->catalog->isValidProvider($provider) || blank($user->ai_api_key)) {
            return null;
        }

        $model = $user->ai_model ?: $this->catalog->defaultModelFor($provider);

        if (! $this->catalog->isValidModel($provider, $model)) {
            $model = $this->catalog->defaultModelFor($provider);
        }

        if (! $this->catalog->isValidModel($provider, $model)) {
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
}
