<?php

namespace App\Services\WhatsApp;

class WhatsAppTransactionParser
{
    /**
     * Parse raw text into structured data.
     * Expected returns array or null.
     */
    public function parse(string $text): ?array
    {
        $text = trim(strtolower($text));

        // Check for saldo commands
        if (str_starts_with($text, 'saldo awal')) {
            $amountStr = trim(str_replace('saldo awal', '', $text));
            $amount = $this->parseAmount($amountStr);
            if ($amount > 0) {
                return ['command' => 'saldo_awal', 'amount' => $amount];
            }

            return null;
        }

        if (str_starts_with($text, 'saldo sekarang')) {
            $amountStr = trim(str_replace('saldo sekarang', '', $text));
            $amount = $this->parseAmount($amountStr);
            if ($amount > 0) {
                return ['command' => 'saldo_sekarang', 'amount' => $amount];
            }

            return null;
        }

        if ($text === 'budget' || $text === 'report' || $text === 'batal' || $text === 'ok') {
            return ['command' => $text];
        }

        // Try to parse transaction (expense or income)
        return $this->parseTransaction($text);
    }

    protected function parseTransaction(string $text): ?array
    {
        // 1. Extract amount
        $amount = $this->extractAmount($text);
        if (! $amount) {
            return null;
        }

        // 2. Remove amount from text to get merchant/title
        $textWithoutAmount = $this->removeAmountFromText($text);

        // 3. Remove common verbs
        $verbs = ['beli', 'bayar', 'buat', 'jajan'];
        $cleanTitle = trim(str_replace($verbs, '', $textWithoutAmount));
        // remove extra spaces
        $cleanTitle = preg_replace('/\s+/', ' ', $cleanTitle);
        $cleanTitle = ucwords($cleanTitle); // Capitalize first letter of each word

        if (empty($cleanTitle)) {
            $cleanTitle = 'Pengeluaran';
        }

        // 4. Determine category and type
        $categoryAndType = $this->guessCategory($cleanTitle);

        return [
            'command' => 'transaction',
            'amount' => $amount,
            'title' => $cleanTitle,
            'category' => $categoryAndType['category'],
            'type' => $categoryAndType['type'],
        ];
    }

    protected function parseAmount(string $str): float
    {
        // Remove spaces
        $str = str_replace(' ', '', $str);
        // Replace comma with dot if it's used as decimal for juta
        $str = str_replace(',', '.', $str);

        // Handle "jt", "juta"
        if (str_contains($str, 'jt') || str_contains($str, 'juta')) {
            $num = (float) str_replace(['jt', 'juta'], '', $str);

            return $num * 1000000;
        }

        // Handle "rb", "ribu", "k"
        if (str_contains($str, 'rb') || str_contains($str, 'ribu') || str_contains($str, 'k')) {
            $num = (float) str_replace(['rb', 'ribu', 'k'], '', $str);

            return $num * 1000;
        }

        // Handle dots as thousands separator (e.g. 50.000)
        if (preg_match('/^\d+(\.\d{3})+$/', $str)) {
            $str = str_replace('.', '', $str);
        }

        return (float) preg_replace('/[^0-9]/', '', $str);
    }

    protected function extractAmount(string $text): float
    {
        // Match amounts like 50rb, 50ribu, 50k, 50.000, 50000, 1jt, 1.5jt, 1 juta
        $pattern = '/(\d+(?:[.,]\d+)?\s*(?:rb|ribu|k|jt|juta)?)(?:\s|$)/i';
        if (preg_match_all($pattern, $text, $matches)) {
            // usually the amount is at the end or the last matched number
            $amountStr = end($matches[1]);

            return $this->parseAmount($amountStr);
        }

        return 0;
    }

    protected function removeAmountFromText(string $text): string
    {
        $pattern = '/(\d+(?:[.,]\d+)?\s*(?:rb|ribu|k|jt|juta)?)(?:\s|$)/i';

        return preg_replace($pattern, '', $text);
    }

    protected function guessCategory(string $title): array
    {
        $titleLower = strtolower($title);

        $categories = [
            'Transportasi' => ['bensin', 'tol', 'parkir', 'gojek', 'grab', 'kendaraan', 'ojek'],
            'Makanan dan Minuman' => ['nasgor', 'makan', 'kopi', 'warung', 'ayam', 'bakso', 'minum'],
            'Belanja Bulanan' => ['indomaret', 'alfamart', 'supermarket', 'pasar', 'belanja'],
            'Langganan' => [
                'langganan',
                'subscription',
                'subscribe',
                'youtube',
                'yt',
                'netflix',
                'chatgpt',
                'openai',
                'spotify',
                'icloud',
                'google one',
                'google drive',
                'disney',
                'disney+',
                'prime video',
                'hbo',
                'viu',
                'vidio',
                'canva',
                'notion',
                'adobe',
                'microsoft',
                'office',
                'zoom',
                'github',
                'vpn',
                'hosting',
                'domain',
            ],
        ];

        $incomeKeywords = ['gaji', 'salary', 'bonus', 'pendapatan'];

        foreach ($incomeKeywords as $kw) {
            if (str_contains($titleLower, $kw)) {
                return ['category' => 'Gaji', 'type' => 'income'];
            }
        }

        foreach ($categories as $cat => $keywords) {
            foreach ($keywords as $kw) {
                if (str_contains($titleLower, $kw)) {
                    return ['category' => $cat, 'type' => 'expense'];
                }
            }
        }

        return ['category' => 'Lainnya', 'type' => 'expense'];
    }
}
