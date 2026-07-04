<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ValidationLocalizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_finance_form_validation_uses_indonesian_messages(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/debts', [
                'name' => '',
                'type' => 'installment',
                'principal_amount' => '',
                'monthly_payment' => '',
            ])
            ->assertSessionHasErrors([
                'name' => 'Nama wajib diisi.',
                'principal_amount' => 'Pokok hutang wajib diisi.',
                'monthly_payment' => 'Cicilan bulanan wajib diisi.',
            ]);
    }

    public function test_auth_validation_uses_indonesian_messages(): void
    {
        $this->post('/login', [
            'email' => '',
            'password' => '',
        ])->assertSessionHasErrors([
            'email' => 'Email wajib diisi.',
            'password' => 'Password wajib diisi.',
        ]);
    }
}
