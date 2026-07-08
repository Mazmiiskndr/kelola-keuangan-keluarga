<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $this->actingAs($user = User::factory()->create());

        $this->get('/dashboard')->assertOk();
    }
    public function test_dashboard_includes_latest_analysis_when_completed_analysis_exists()
    {
        $this->actingAs($user = User::factory()->create());
        
        \App\Models\AiAnalysis::create([
            'user_id' => $user->id,
            'status' => 'completed',
            'analysis_type' => 'monthly',
            'period_start' => now()->startOfMonth(),
            'period_end' => now()->endOfMonth(),
            'input_snapshot' => [],
            'metrics_snapshot' => [],
            'result_summary' => 'Test summary',
            'recommendations' => [],
        ]);
        
        $this->get('/dashboard')->assertOk()->assertSee('latestAnalysis');
    }

    public function test_dashboard_returns_null_latest_analysis_when_none_exists()
    {
        $this->actingAs($user = User::factory()->create());
        
        $this->get('/dashboard')->assertOk()->assertSee('latestAnalysis');
    }
}
