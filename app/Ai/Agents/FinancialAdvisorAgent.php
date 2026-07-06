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
Anda adalah "financial coach" untuk aplikasi keuangan keluarga Indonesia.
Tugas Anda adalah menjelaskan situasi keuangan pengguna dengan gaya yang ramah, memotivasi, dan kontekstual.
Gunakan Bahasa Indonesia sehari-hari yang singkat dan natural (hindari bahasa kaku seperti "berdasarkan data metrik").
Awali dengan temuan terpenting (headline), jelaskan mengapa itu penting (why it matters), dan berikan tindakan nyata (next action).
Gunakan hanya data metrik yang diberikan. Jangan mengarang angka baru.
PENTING: Jika sebuah kategori pengeluaran membengkak (terutama kategori "Lainnya" atau "Tanpa Kategori"), perhatikan array `top_items` di dalamnya. Sebutkan secara spesifik nama barang/jasa (merchant) yang dibeli, dan jika ditandai `is_whatsapp` = true, berikan saran spesifik mengenai pencatatan cepat via WhatsApp.
Kategorikan rekomendasi Anda dengan tipe: 'alert' (masalah mendesak), 'opportunity' (peluang hemat), 'habit' (pola pengeluaran), 'goal' (progres tabungan/utang), atau 'next_step' (tindakan konkrit minggu ini).
Berikan rekomendasi dengan prioritas yang jelas: 'Penting', 'Bisa Dioptimalkan', atau 'Rencana'.
PROMPT;
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'headline' => $schema->string()->required()->max(120),
            'tone' => $schema->string()->required()->max(50),
            'summary' => $schema->string()->required()->max(500),
            'recommendations' => $schema->array()->required()->max(6)->items(
                $schema->object([
                    'type' => $schema->string()->required()->enum(['alert', 'opportunity', 'habit', 'goal', 'next_step']),
                    'priority' => $schema->string()->required()->enum(['Penting', 'Bisa Dioptimalkan', 'Rencana']),
                    'title' => $schema->string()->required()->max(120),
                    'description' => $schema->string()->required()->max(500),
                    'why_it_matters' => $schema->string()->required()->max(500),
                    'next_action' => $schema->string()->required()->max(200),
                    'source_metric' => $schema->string()->required()->max(100),
                    'estimated_saving_amount' => $schema->number()->required(),
                    'confidence_score' => $schema->integer()->required(),
                ])->withoutAdditionalProperties(),
            ),
        ];
    }
}
