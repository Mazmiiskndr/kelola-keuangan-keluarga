<?php

namespace App\Services\WhatsApp;

use App\Contracts\WhatsAppGateway;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsappWebJsGateway implements WhatsAppGateway
{
    protected string $gatewayUrl;

    protected string $secret;

    public function __construct()
    {
        $this->gatewayUrl = config('services.whatsapp.gateway_url', 'http://127.0.0.1:3100');
        $this->secret = config('services.whatsapp.internal_secret', '');
    }

    public function sendMessage(string $phone, string $message): bool
    {
        if ($this->secret === '') {
            Log::warning('WhatsAppGateway skipped send because WHATSAPP_GATEWAY_SECRET is not configured.');

            return false;
        }

        $target = $this->normalizeTarget($phone);

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$this->secret,
            ])->post("{$this->gatewayUrl}/send-message", [
                'phone' => $target,
                'message' => $message,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('WhatsAppGateway Error: '.$e->getMessage());

            return false;
        }
    }

    private function normalizeTarget(string $phone): string
    {
        if (str_contains($phone, '@')) {
            return $phone;
        }

        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);

        if (str_starts_with((string) $cleanPhone, '0')) {
            return '62'.substr((string) $cleanPhone, 1);
        }

        return (string) $cleanPhone;
    }

    public function getStatus(): array
    {
        if ($this->secret === '') {
            return $this->unavailableStatus('Gateway secret not configured.');
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$this->secret,
            ])->timeout(3)->get("{$this->gatewayUrl}/status");

            if ($response->successful()) {
                return $response->json();
            }

            return $this->unavailableStatus('Gateway returned error status.');
        } catch (\Exception $e) {
            return $this->unavailableStatus('Gateway is unreachable.');
        }
    }

    public function logout(): bool
    {
        if ($this->secret === '') {
            return false;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$this->secret,
            ])->timeout(5)->post("{$this->gatewayUrl}/logout");

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('WhatsAppGateway Logout Error: '.$e->getMessage());
            return false;
        }
    }

    public function restart(): bool
    {
        if ($this->secret === '') {
            return false;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$this->secret,
            ])->timeout(5)->post("{$this->gatewayUrl}/restart");

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('WhatsAppGateway Restart Error: '.$e->getMessage());
            return false;
        }
    }

    private function unavailableStatus(string $message): array
    {
        return [
            'ok' => false,
            'state' => 'unavailable',
            'qr_data_url' => null,
            'phone' => null,
            'message' => $message,
            'updated_at' => null,
        ];
    }
}
