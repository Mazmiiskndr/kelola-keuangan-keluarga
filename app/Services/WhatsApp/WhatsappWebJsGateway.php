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
        $gatewayEnvPath = base_path('whatsapp-gateway/.env');
        $gatewayPort = '3100'; // Default fallback
        $gatewaySecret = '';

        if (file_exists($gatewayEnvPath)) {
            $env = parse_ini_file($gatewayEnvPath);
            if ($env !== false) {
                if (isset($env['PORT'])) {
                    $gatewayPort = $env['PORT'];
                }
                if (isset($env['SHARED_SECRET'])) {
                    $gatewaySecret = $env['SHARED_SECRET'];
                }
            }
        }

        $this->gatewayUrl = 'http://127.0.0.1:'.$gatewayPort;
        $this->secret = $gatewaySecret;
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
}
