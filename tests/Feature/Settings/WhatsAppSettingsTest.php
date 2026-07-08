<?php

namespace Tests\Feature\Settings;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class WhatsAppSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_whatsapp_settings(): void
    {
        $response = $this->get('/settings/whatsapp');
        $response->assertRedirect('/login');

        $response = $this->get('/settings/whatsapp/status');
        $response->assertRedirect('/login');
    }

    public function test_authenticated_user_can_access_whatsapp_settings(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/settings/whatsapp');
        $response->assertOk();
    }

    public function test_user_can_update_whatsapp_number(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->patch('/settings/whatsapp', [
            'whatsapp_number' => '08123456789',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect('/settings/whatsapp');

        $this->assertEquals('628123456789', $user->refresh()->whatsapp_number);
    }

    public function test_invalid_whatsapp_number_fails_validation(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->patch('/settings/whatsapp', [
            'whatsapp_number' => str_repeat('1', 25), // Too long
        ]);

        $response->assertSessionHasErrors(['whatsapp_number']);
    }

    public function test_status_endpoint_returns_gateway_status(): void
    {
        config(['services.whatsapp.internal_secret' => 'secret']);
        $user = User::factory()->create();

        Http::fake([
            'http://127.0.0.1:3100/status' => Http::response([
                'ok' => true,
                'state' => 'ready',
                'qr_data_url' => null,
                'phone' => '628111',
            ], 200),
        ]);

        $response = $this->actingAs($user)->get('/settings/whatsapp/status');
        
        $response->assertOk();
        $response->assertJson([
            'ok' => true,
            'state' => 'ready',
            'phone' => '628111',
        ]);
    }

    public function test_status_endpoint_handles_gateway_down(): void
    {
        config(['services.whatsapp.internal_secret' => 'secret']);
        $user = User::factory()->create();

        Http::fake([
            'http://127.0.0.1:3100/status' => Http::response(null, 500),
        ]);

        $response = $this->actingAs($user)->get('/settings/whatsapp/status');
        
        $response->assertOk();
        $response->assertJson([
            'ok' => false,
            'state' => 'unavailable',
        ]);
    }

    public function test_logout_triggers_gateway(): void
    {
        config(['services.whatsapp.internal_secret' => 'secret']);
        $user = User::factory()->create();

        Http::fake([
            'http://127.0.0.1:3100/logout' => Http::response(['success' => true], 200),
        ]);

        $response = $this->actingAs($user)->post('/settings/whatsapp/logout');
        
        $response->assertOk();
        $response->assertJson(['success' => true]);
    }
    
    public function test_restart_triggers_gateway(): void
    {
        config(['services.whatsapp.internal_secret' => 'secret']);
        $user = User::factory()->create();

        Http::fake([
            'http://127.0.0.1:3100/restart' => Http::response(['success' => true], 200),
        ]);

        $response = $this->actingAs($user)->post('/settings/whatsapp/restart');
        
        $response->assertOk();
        $response->assertJson(['success' => true]);
    }
}
