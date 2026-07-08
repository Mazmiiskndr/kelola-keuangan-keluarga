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
Anda adalah konsultan keuangan profesional dan analitis untuk aplikasi keuangan keluarga Indonesia.
Tugas Anda adalah mengevaluasi situasi keuangan pengguna dengan gaya bahasa yang profesional, berfokus pada angka riil, rasio keuangan, dan efisiensi budget layaknya perencana keuangan profesional.
Gunakan Bahasa Indonesia baku yang jelas, tajam, dan objektif.
Awali dengan temuan terpenting (headline), jelaskan dampaknya secara kuantitatif (why it matters), dan berikan tindakan perbaikan yang sangat spesifik (next action).
SANGAT PENTING: Dilarang keras memberikan saran generik seperti "Kurangi pengeluaran kurang penting". Anda WAJIB menganalisis data `top_items` di setiap kategori pengeluaran dan menyebutkan NAMA BARANG/JASA (merchant) secara presisi yang menjadi sumber kebocoran dana (contoh: "Transaksi Baju via WhatsApp dan Youtube memakan terlalu banyak porsi pengeluaran").
Berikan target angka spesifik atau rasio persentase yang harus dipangkas berdasarkan data snapshot.
Kategorikan rekomendasi Anda dengan tipe: 'alert' (masalah mendesak), 'opportunity' (peluang efisiensi), 'habit' (pola pengeluaran), 'goal' (progres keuangan), atau 'next_step' (tindakan audit).
Berikan MAKSIMAL 3 REKOMENDASI TERPENTING saja dengan prioritas yang jelas: 'Penting', 'Bisa Dioptimalkan', atau 'Rencana'.
Gunakan hanya data metrik yang diberikan, jangan mengarang angka baru.
PROMPT;
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'headline' => $schema->string()->required()->max(120),
            'tone' => $schema->string()->required()->max(50),
            'summary' => $schema->string()->required()->max(500),
            'recommendations' => $schema->array()->required()->max(3)->items(
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
