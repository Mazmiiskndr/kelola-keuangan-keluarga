<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;

class FinancialAdvisorAgent implements Agent, HasStructuredOutput
{
    use Promptable;

    public function instructions(): string
    {
        return <<<'PROMPT'
Anda adalah financial advisor untuk aplikasi keuangan keluarga Indonesia.
Gunakan hanya data metrik yang diberikan. Jangan mengarang angka baru.
Prioritaskan cicilan/hutang minimum, kebutuhan wajib, dana darurat, tabungan, lalu investasi.
Berikan rekomendasi hemat yang realistis, sopan, spesifik, dan bisa ditindaklanjuti.
Jawab dalam Bahasa Indonesia.
PROMPT;
    }

    public function model(): string
    {
        return (string) config('ai.finance_analysis_model', 'gpt-4.1-mini');
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'summary' => $schema->string()->required()->max(500),
            'recommendations' => $schema->array()->required()->max(6)->items(
                $schema->object([
                    'type' => $schema->string()->required()->enum(['saving', 'debt', 'budget', 'investment', 'cash_flow', 'saving_plan']),
                    'title' => $schema->string()->required()->max(120),
                    'description' => $schema->string()->required()->max(500),
                    'estimated_saving_amount' => $schema->number()->required(),
                    'confidence_score' => $schema->integer()->required(),
                ])->withoutAdditionalProperties(),
            ),
        ];
    }
}
