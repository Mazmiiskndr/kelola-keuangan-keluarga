<?php

namespace Tests\Feature\Settings;

use App\Ai\Agents\FinancialAdvisorAgent;
use App\Models\AiAnalysis;
use App\Models\Category;
use App\Models\FinanceTransaction;
use App\Models\FinancialAccount;
use App\Models\User;
use App\Services\Ai\AiAnalysisService;
use App\Services\Ai\AiConnectionTestAgent;
use App\Services\Ai\AiProviderCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AiSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_ai_connection_test_returns_verification_token_for_real_ai_response(): void
    {
        AiConnectionTestAgent::fake(['KONEKSI_VALID']);

        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/settings/ai/test', [
            'ai_provider' => 'gemini',
            'ai_model' => 'gemini-3.5-flash',
            'ai_api_key' => 'valid-test-key',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('provider', 'gemini')
            ->assertJsonPath('model', 'gemini-3.5-flash')
            ->assertJsonStructure(['verification_token', 'response_preview']);
    }

    public function test_ai_settings_cannot_be_saved_when_auto_connection_test_fails(): void
    {
        AiConnectionTestAgent::fake(['RESPONS_TIDAK_VALID']);

        $user = User::factory()->create();

        $response = $this->actingAs($user)->put('/settings/ai', [
            'ai_provider' => 'gemini',
            'ai_model' => 'gemini-3.5-flash',
            'ai_api_key' => 'untested-key',
        ]);

        $response->assertSessionHasErrors('ai_api_key');
        $this->assertNull($user->fresh()->ai_api_key);
    }

    public function test_ai_settings_save_can_auto_validate_without_manual_connection_test(): void
    {
        AiConnectionTestAgent::fake(['KONEKSI_VALID']);

        $user = User::factory()->create();

        $response = $this->actingAs($user)->put('/settings/ai', [
            'ai_provider' => 'gemini',
            'ai_model' => 'gemini-3.5-flash',
            'ai_api_key' => 'valid-test-key',
        ]);

        $response->assertSessionHasNoErrors();

        $user->refresh();
        $this->assertSame('gemini', $user->ai_provider);
        $this->assertSame('gemini-3.5-flash', $user->ai_model);
        $this->assertSame('valid-test-key', $user->ai_api_key);
    }

    public function test_ai_settings_save_after_successful_connection_test(): void
    {
        AiConnectionTestAgent::fake(['KONEKSI_VALID']);

        $user = User::factory()->create();

        $testResponse = $this->actingAs($user)->postJson('/settings/ai/test', [
            'ai_provider' => 'gemini',
            'ai_model' => 'gemini-3.1-pro-preview',
            'ai_api_key' => 'valid-test-key',
        ]);

        $token = $testResponse->json('verification_token');

        $response = $this->actingAs($user)->put('/settings/ai', [
            'ai_provider' => 'gemini',
            'ai_model' => 'gemini-3.1-pro-preview',
            'ai_api_key' => 'valid-test-key',
            'verification_token' => $token,
        ]);

        $response->assertSessionHasNoErrors();

        $user->refresh();
        $this->assertSame('gemini', $user->ai_provider);
        $this->assertSame('gemini-3.1-pro-preview', $user->ai_model);
        $this->assertSame('valid-test-key', $user->ai_api_key);
    }

    public function test_masked_key_uses_existing_encrypted_key_for_test_and_save(): void
    {
        AiConnectionTestAgent::fake(['KONEKSI_VALID']);

        $user = User::factory()->create([
            'ai_provider' => 'gemini',
            'ai_model' => 'gemini-3.5-flash',
            'ai_api_key' => 'stored-key',
        ]);

        $testResponse = $this->actingAs($user)->postJson('/settings/ai/test', [
            'ai_provider' => 'gemini',
            'ai_model' => 'gemini-3.5-flash',
            'ai_api_key' => AiProviderCatalog::MASKED_KEY,
        ]);

        $response = $this->actingAs($user)->put('/settings/ai', [
            'ai_provider' => 'gemini',
            'ai_model' => 'gemini-3.5-flash',
            'ai_api_key' => AiProviderCatalog::MASKED_KEY,
            'verification_token' => $testResponse->json('verification_token'),
        ]);

        $response->assertSessionHasNoErrors();

        $user->refresh();
        $this->assertSame('gemini-3.5-flash', $user->ai_model);
        $this->assertSame('stored-key', $user->ai_api_key);
    }

    public function test_gemini_models_below_version_three_are_rejected(): void
    {
        AiConnectionTestAgent::fake(['KONEKSI_VALID']);

        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/settings/ai/test', [
            'ai_provider' => 'gemini',
            'ai_model' => 'gemini-2.5-flash',
            'ai_api_key' => 'valid-test-key',
        ])->assertUnprocessable();

        AiConnectionTestAgent::assertNeverPrompted();
    }

    public function test_invalid_model_is_rejected_before_connection_test(): void
    {
        AiConnectionTestAgent::fake(['KONEKSI_VALID']);

        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/settings/ai/test', [
            'ai_provider' => 'gemini',
            'ai_model' => 'gemini-3.1-pro-high',
            'ai_api_key' => 'valid-test-key',
        ])->assertUnprocessable();

        AiConnectionTestAgent::assertNeverPrompted();
    }

    public function test_empty_key_can_clear_saved_api_key(): void
    {
        $user = User::factory()->create([
            'ai_provider' => 'gemini',
            'ai_model' => 'gemini-3.5-flash',
            'ai_api_key' => 'stored-key',
        ]);

        $response = $this->actingAs($user)->put('/settings/ai', [
            'ai_provider' => 'gemini',
            'ai_model' => 'gemini-3.5-flash',
            'ai_api_key' => '',
            'clear_api_key' => true,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertNull($user->fresh()->ai_api_key);
    }

    public function test_debug_ai_route_is_removed(): void
    {
        $this->get('/debug-ai')->assertNotFound();
    }

    public function test_ai_analysis_uses_saved_provider_model_and_api_key(): void
    {
        FinancialAdvisorAgent::fake([[
            'summary' => 'Cash flow positif dan rekomendasi sudah memakai provider pilihan.',
            'recommendations' => [
                [
                    'type' => 'saving_plan',
                    'title' => 'Sisihkan cash flow positif',
                    'description' => 'Gunakan sebagian cash flow positif untuk dana darurat.',
                    'estimated_saving_amount' => 1000,
                    'confidence_score' => 80,
                ],
            ],
        ]]);

        $user = User::factory()->create([
            'ai_provider' => 'gemini',
            'ai_model' => 'gemini-3.5-flash',
            'ai_api_key' => 'stored-key',
        ]);
        $account = FinancialAccount::query()->create([
            'user_id' => $user->id,
            'name' => 'BCA',
            'type' => 'bank',
            'initial_balance' => 10000,
            'current_balance' => 10000,
            'currency' => 'IDR',
            'visibility' => 'private',
            'is_active' => true,
        ]);
        $category = Category::query()->create([
            'user_id' => $user->id,
            'name' => 'Makan',
            'type' => 'expense',
            'is_default' => false,
        ]);
        FinanceTransaction::query()->create([
            'user_id' => $user->id,
            'financial_account_id' => $account->id,
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 2000,
            'transaction_date' => now()->toDateString(),
            'visibility' => 'private',
            'need_type' => 'lifestyle',
            'merchant' => 'Makan',
        ]);

        $analysis = app(AiAnalysisService::class)->generateMonthly($user, now()->format('Y-m'));

        $this->assertSame('gemini:gemini-3.5-flash', $analysis->model_name);
        $this->assertSame('Cash flow positif dan rekomendasi sudah memakai provider pilihan.', $analysis->result_summary);
        $this->assertSame(1, $analysis->aiRecommendations()->count());
    }

    public function test_ai_analysis_uses_default_gemini_three_model_when_saved_model_is_legacy(): void
    {
        FinancialAdvisorAgent::fake([[
            'summary' => 'Analisis memakai default Gemini 3 karena model lama tidak valid.',
            'recommendations' => [
                [
                    'type' => 'saving_plan',
                    'title' => 'Pakai model terbaru',
                    'description' => 'Model lama otomatis diganti ke default yang valid.',
                ],
            ],
        ]]);

        $user = User::factory()->create([
            'ai_provider' => 'gemini',
            'ai_model' => 'gemini-1.5-pro',
            'ai_api_key' => 'stored-key',
        ]);
        $account = FinancialAccount::query()->create([
            'user_id' => $user->id,
            'name' => 'BCA',
            'type' => 'bank',
            'initial_balance' => 10000,
            'current_balance' => 10000,
            'currency' => 'IDR',
            'visibility' => 'private',
            'is_active' => true,
        ]);
        $category = Category::query()->create([
            'user_id' => $user->id,
            'name' => 'Makan',
            'type' => 'expense',
            'is_default' => false,
        ]);
        FinanceTransaction::query()->create([
            'user_id' => $user->id,
            'financial_account_id' => $account->id,
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 2000,
            'transaction_date' => now()->toDateString(),
            'visibility' => 'private',
            'need_type' => 'lifestyle',
            'merchant' => 'Makan',
        ]);

        $analysis = app(AiAnalysisService::class)->generateMonthly($user, now()->format('Y-m'));

        $this->assertSame('gemini:gemini-3.5-flash', $analysis->model_name);
        $this->assertSame('Gemini 3.5 Flash', $analysis->model_label);
    }

    public function test_legacy_gemini_model_label_does_not_display_raw_model_id(): void
    {
        $analysis = new AiAnalysis([
            'model_name' => 'gemini-1.5-pro',
        ]);

        $this->assertSame('Gemini Legacy Model', $analysis->model_label);
    }

    public function test_configured_model_label_falls_back_to_default_when_saved_gemini_model_is_invalid(): void
    {
        $catalog = app(AiProviderCatalog::class);

        $this->assertSame('Gemini 3.5 Flash', $catalog->resolvedModelLabelFor('gemini', 'gemini-1.5-pro'));
    }
}
