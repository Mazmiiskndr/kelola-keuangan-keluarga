<?php

namespace App\Services\Ai;

use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Log;
use Laravel\Ai\Ai;
use Throwable;

class AiProviderConnectionService
{
    private const EXPECTED_RESPONSE = 'KONEKSI_VALID';

    public function __construct(private readonly AiProviderCatalog $catalog) {}

    public function test(string $provider, string $model, string $apiKey): AiProviderConnectionResult
    {
        if (! $this->catalog->isValidProvider($provider)) {
            return new AiProviderConnectionResult(false, 'Provider AI tidak valid.', status: 'invalid_provider');
        }

        if (! $this->catalog->isValidModel($provider, $model)) {
            return new AiProviderConnectionResult(false, 'Model tidak valid untuk provider yang dipilih.', status: 'invalid_model');
        }

        if (blank($apiKey)) {
            return new AiProviderConnectionResult(false, 'API Key tidak boleh kosong untuk pengujian.', status: 'missing_key');
        }

        $configKey = "ai.providers.{$provider}.key";
        $previousKey = config($configKey);

        config([$configKey => $apiKey]);
        Ai::forgetInstance($provider);

        try {
            $response = (new AiConnectionTestAgent)->prompt(
                prompt: 'Balas tepat dengan teks berikut tanpa tambahan apa pun: '.self::EXPECTED_RESPONSE,
                provider: $provider,
                model: $model,
                timeout: 30,
            );

            $text = trim((string) $response->text);

            if ($text === '') {
                return new AiProviderConnectionResult(false, 'AI terhubung, tetapi tidak mengirim respons teks.', status: 'empty_response');
            }

            if (! str_contains(strtoupper($text), self::EXPECTED_RESPONSE)) {
                return new AiProviderConnectionResult(false, 'AI merespons, tetapi hasil uji tidak sesuai instruksi validasi.', $this->preview($text), 'unexpected_response');
            }

            return new AiProviderConnectionResult(
                true,
                'Koneksi API berhasil dan AI memberikan respons valid.',
                $this->preview($text),
            );
        } catch (Throwable $exception) {
            $status = $this->statusFor($exception);

            Log::warning('AI provider connection test failed.', [
                'provider' => $provider,
                'model' => $model,
                'status' => $status,
                'exception' => $exception::class,
            ]);

            return new AiProviderConnectionResult(false, $this->messageFor($status), status: $status);
        } finally {
            config([$configKey => $previousKey]);
            Ai::forgetInstance($provider);
        }
    }

    private function preview(string $text): string
    {
        return str($text)->squish()->limit(140)->toString();
    }

    private function statusFor(Throwable $exception): string
    {
        if ($exception instanceof RequestException) {
            return match ($exception->response->status()) {
                401, 403 => 'invalid_key',
                404 => 'invalid_model',
                429 => 'quota_or_billing',
                default => $this->statusForMessage($exception->getMessage()),
            };
        }

        return $this->statusForMessage($exception->getMessage());
    }

    private function statusForMessage(string $exceptionMessage): string
    {
        $message = strtolower($exceptionMessage);

        return match (true) {
            str_contains($message, 'api key'), str_contains($message, 'unauthorized'), str_contains($message, 'authentication'), str_contains($message, '401') => 'invalid_key',
            str_contains($message, 'quota'), str_contains($message, 'billing'), str_contains($message, 'payment'), str_contains($message, '429') => 'quota_or_billing',
            str_contains($message, 'model'), str_contains($message, '404') => 'invalid_model',
            str_contains($message, 'timed out'), str_contains($message, 'timeout'), str_contains($message, 'curl error 28') => 'timeout',
            default => 'provider_error',
        };
    }

    private function messageFor(string $status): string
    {
        return match ($status) {
            'invalid_key' => 'API Key tidak valid atau tidak punya akses ke provider yang dipilih.',
            'quota_or_billing' => 'API Key valid, tetapi model ini membutuhkan kuota atau billing yang belum tersedia. Gunakan model Flash atau aktifkan billing di Google AI Studio.',
            'invalid_model' => 'Model tidak tersedia untuk API Key atau provider yang dipilih.',
            'timeout' => 'Koneksi ke provider AI timeout. Coba lagi beberapa saat.',
            default => 'Gagal terhubung ke layanan AI. Periksa API Key, model, dan jaringan server.',
        };
    }
}
