<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Services\Ai\AiProviderCatalog;
use App\Services\Ai\AiProviderConnectionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AiController extends Controller
{
    public function __construct(
        private readonly AiProviderCatalog $catalog,
        private readonly AiProviderConnectionService $connections,
    ) {}

    /**
     * Show the user's AI settings.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/ai', [
            'ai_provider' => $request->user()->ai_provider ?: $this->catalog->defaultProvider(),
            'ai_model' => $request->user()->ai_model ?: $this->catalog->defaultModelFor($this->catalog->defaultProvider()),
            'has_api_key' => filled($request->user()->ai_api_key),
            'provider_options' => $this->catalog->providers(),
        ]);
    }

    /**
     * Update the user's AI settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $provider = (string) $request->input('ai_provider', '');

        $validated = Validator::make($request->all(), [
            'ai_provider' => ['required', 'string', 'max:50', $this->catalog->providerRule()],
            'ai_model' => ['required', 'string', 'max:100', $this->catalog->modelRuleFor($provider)],
            'ai_api_key' => ['nullable', 'string'],
            'verification_token' => ['nullable', 'string'],
            'clear_api_key' => ['nullable', 'boolean'],
        ])->validate();

        $user = $request->user();
        $apiKeyInput = (string) ($validated['ai_api_key'] ?? '');
        $clearApiKey = (bool) ($validated['clear_api_key'] ?? false);

        if ($clearApiKey) {
            $user->forceFill([
                'ai_provider' => $validated['ai_provider'],
                'ai_model' => $validated['ai_model'],
                'ai_api_key' => null,
            ])->save();

            $request->session()->forget('ai_connection_test');

            return back()->with('flash', [
                'type' => 'success',
                'title' => 'API Key AI dihapus',
                'message' => 'Pengaturan provider tetap disimpan, tetapi fitur AI akan memakai fallback sampai API Key baru ditambahkan.',
            ]);
        }

        $resolvedKey = $this->resolveApiKey($apiKeyInput, $user->ai_api_key);

        if (blank($resolvedKey)) {
            throw ValidationException::withMessages([
                'ai_api_key' => 'API Key wajib diisi sebelum pengaturan AI dapat disimpan.',
            ]);
        }

        if (! $this->hasVerifiedTest(
            $request,
            $validated['ai_provider'],
            $validated['ai_model'],
            $resolvedKey,
            (string) ($validated['verification_token'] ?? ''),
        )) {
            $result = $this->connections->test($validated['ai_provider'], $validated['ai_model'], $resolvedKey);

            if (! $result->success) {
                throw ValidationException::withMessages([
                    'ai_api_key' => $result->message,
                ]);
            }
        }

        $user->forceFill([
            'ai_provider' => $validated['ai_provider'],
            'ai_model' => $validated['ai_model'],
            'ai_api_key' => $apiKeyInput === AiProviderCatalog::MASKED_KEY ? $user->ai_api_key : $resolvedKey,
        ])->save();

        $request->session()->forget('ai_connection_test');

        return back()->with('flash', [
            'type' => 'success',
            'title' => 'Pengaturan AI tersimpan',
            'message' => sprintf(
                '%s siap digunakan dengan model %s.',
                $this->catalog->labelFor($validated['ai_provider']),
                $this->catalog->modelLabelFor($validated['ai_provider'], $validated['ai_model']),
            ),
        ]);
    }

    /**
     * Test the AI connection.
     */
    public function test(Request $request)
    {
        $provider = (string) $request->input('ai_provider', '');

        $validated = Validator::make($request->all(), [
            'ai_provider' => ['required', 'string', 'max:50', $this->catalog->providerRule()],
            'ai_model' => ['required', 'string', 'max:100', $this->catalog->modelRuleFor($provider)],
            'ai_api_key' => ['nullable', 'string'],
        ])->validate();

        $apiKey = $this->resolveApiKey((string) ($validated['ai_api_key'] ?? ''), $request->user()->ai_api_key);

        if (blank($apiKey)) {
            throw ValidationException::withMessages([
                'ai_api_key' => 'API Key tidak boleh kosong untuk pengujian.',
            ]);
        }

        $result = $this->connections->test($validated['ai_provider'], $validated['ai_model'], $apiKey);

        if (! $result->success) {
            return response()->json([
                'success' => false,
                'message' => $result->message,
                'provider' => $validated['ai_provider'],
                'model' => $validated['ai_model'],
                'response_preview' => $result->responsePreview,
            ], $this->statusCodeForConnectionResult($result->status));
        }

        $token = $this->verificationToken();
        $request->session()->put('ai_connection_test', [
            'token' => $token,
            'provider' => $validated['ai_provider'],
            'model' => $validated['ai_model'],
            'key_fingerprint' => hash('sha256', $apiKey),
            'verified_at' => now()->timestamp,
        ]);

        return response()->json([
            'success' => true,
            'message' => $result->message,
            'provider' => $validated['ai_provider'],
            'model' => $validated['ai_model'],
            'response_preview' => $result->responsePreview,
            'verification_token' => $token,
        ]);
    }

    private function resolveApiKey(string $input, ?string $storedKey): string
    {
        if ($input === AiProviderCatalog::MASKED_KEY) {
            return (string) $storedKey;
        }

        return trim($input);
    }

    private function hasVerifiedTest(Request $request, string $provider, string $model, string $apiKey, string $token): bool
    {
        $test = $request->session()->get('ai_connection_test');

        return is_array($test)
            && hash_equals((string) ($test['token'] ?? ''), $token)
            && ($test['provider'] ?? null) === $provider
            && ($test['model'] ?? null) === $model
            && hash_equals((string) ($test['key_fingerprint'] ?? ''), hash('sha256', $apiKey))
            && now()->timestamp - (int) ($test['verified_at'] ?? 0) <= 600;
    }

    private function verificationToken(): string
    {
        return bin2hex(random_bytes(24));
    }

    private function statusCodeForConnectionResult(string $status): int
    {
        return match ($status) {
            'invalid_provider', 'invalid_model', 'missing_key' => 422,
            'timeout', 'provider_error', 'quota_or_billing' => 503,
            default => 400,
        };
    }
}
