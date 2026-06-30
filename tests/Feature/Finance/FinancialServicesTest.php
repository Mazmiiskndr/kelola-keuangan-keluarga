<?php

namespace Tests\Feature\Finance;

use App\Models\Category;
use App\Models\Debt;
use App\Models\FinancialAccount;
use App\Models\User;
use App\Services\Ai\AiAnalysisService;
use App\Services\Finance\DebtPaymentService;
use App\Services\Finance\FinancialMetricService;
use App\Services\Finance\TransactionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinancialServicesTest extends TestCase
{
    use RefreshDatabase;

    public function test_transaction_service_updates_account_balance(): void
    {
        $user = User::factory()->create();
        $account = $this->account($user, 5000);
        $incomeCategory = $this->category($user, 'income', 'Gaji');
        $expenseCategory = $this->category($user, 'expense', 'Makan');

        app(TransactionService::class)->create([
            'user_id' => $user->id,
            'financial_account_id' => $account->id,
            'category_id' => $incomeCategory->id,
            'type' => 'income',
            'amount' => 1000,
            'transaction_date' => now()->toDateString(),
            'visibility' => 'private',
            'need_type' => 'financial',
        ]);

        $this->assertSame(6000.0, (float) $account->refresh()->current_balance);

        app(TransactionService::class)->create([
            'user_id' => $user->id,
            'financial_account_id' => $account->id,
            'category_id' => $expenseCategory->id,
            'type' => 'expense',
            'amount' => 1500,
            'transaction_date' => now()->toDateString(),
            'visibility' => 'private',
            'need_type' => 'essential',
        ]);

        $this->assertSame(4500.0, (float) $account->refresh()->current_balance);
    }

    public function test_debt_payment_creates_expense_and_reduces_outstanding_debt(): void
    {
        $user = User::factory()->create();
        $account = $this->account($user, 10000);
        $category = $this->category($user, 'expense', 'Cicilan');

        $debt = Debt::query()->create([
            'user_id' => $user->id,
            'name' => 'Pinjaman kendaraan',
            'type' => 'installment',
            'principal_amount' => 8000,
            'outstanding_amount' => 8000,
            'monthly_payment' => 1000,
            'minimum_payment' => 1000,
            'interest_rate' => 0,
            'payment_account_id' => $account->id,
            'category_id' => $category->id,
            'include_in_monthly_expense' => true,
            'status' => 'active',
        ]);

        $payment = app(DebtPaymentService::class)->pay($debt, [
            'amount' => 1000,
            'principal_amount' => 1000,
            'paid_at' => now()->toDateString(),
        ]);

        $this->assertSame(9000.0, (float) $account->refresh()->current_balance);
        $this->assertSame(7000.0, (float) $debt->refresh()->outstanding_amount);
        $this->assertSame('paid', $payment->status);
        $this->assertDatabaseHas('finance_transactions', [
            'id' => $payment->finance_transaction_id,
            'type' => 'expense',
            'amount' => 1000,
        ]);
    }

    public function test_financial_metric_service_includes_debt_and_expense_breakdown(): void
    {
        $user = User::factory()->create();
        $account = $this->account($user, 12000);
        $incomeCategory = $this->category($user, 'income', 'Gaji');
        $expenseCategory = $this->category($user, 'expense', 'Rumah Tangga');

        app(TransactionService::class)->create([
            'user_id' => $user->id,
            'financial_account_id' => $account->id,
            'category_id' => $incomeCategory->id,
            'type' => 'income',
            'amount' => 10000,
            'transaction_date' => now()->toDateString(),
            'visibility' => 'private',
            'need_type' => 'financial',
        ]);

        app(TransactionService::class)->create([
            'user_id' => $user->id,
            'financial_account_id' => $account->id,
            'category_id' => $expenseCategory->id,
            'type' => 'expense',
            'amount' => 2500,
            'transaction_date' => now()->toDateString(),
            'visibility' => 'private',
            'need_type' => 'essential',
        ]);

        Debt::query()->create([
            'user_id' => $user->id,
            'name' => 'KPR',
            'type' => 'installment',
            'principal_amount' => 100000,
            'outstanding_amount' => 90000,
            'monthly_payment' => 3000,
            'minimum_payment' => 3000,
            'interest_rate' => 5,
            'include_in_monthly_expense' => true,
            'status' => 'active',
        ]);

        $summary = app(FinancialMetricService::class)->monthlySummary($user, now()->format('Y-m'));

        $this->assertSame(10000.0, $summary['totals']['income']);
        $this->assertSame(2500.0, $summary['totals']['expense']);
        $this->assertSame(3000.0, $summary['totals']['debt_due']);
        $this->assertSame('Rumah Tangga', $summary['expense_by_category'][0]['name']);
    }

    public function test_ai_analysis_service_falls_back_without_openai_key(): void
    {
        config(['ai.providers.openai.key' => null]);

        $user = User::factory()->create();
        $account = $this->account($user, 8000);
        $category = $this->category($user, 'expense', 'Makan');

        app(TransactionService::class)->create([
            'user_id' => $user->id,
            'financial_account_id' => $account->id,
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 2000,
            'transaction_date' => now()->toDateString(),
            'visibility' => 'private',
            'need_type' => 'lifestyle',
        ]);

        $analysis = app(AiAnalysisService::class)->generateMonthly($user, now()->format('Y-m'));

        $this->assertSame('completed', $analysis->status);
        $this->assertNotEmpty($analysis->result_summary);
        $this->assertGreaterThan(0, $analysis->aiRecommendations()->count());
    }

    private function account(User $user, int $balance): FinancialAccount
    {
        return FinancialAccount::query()->create([
            'user_id' => $user->id,
            'name' => 'BCA - Moch Azmi Iskandar',
            'bank_name' => 'BCA',
            'account_holder_name' => 'Moch Azmi Iskandar',
            'account_number' => '1234567890',
            'type' => 'bank',
            'initial_balance' => $balance,
            'current_balance' => $balance,
            'currency' => 'IDR',
            'visibility' => 'private',
            'is_active' => true,
        ]);
    }

    private function category(User $user, string $type, string $name): Category
    {
        return Category::query()->create([
            'user_id' => $user->id,
            'name' => $name,
            'type' => $type,
            'color' => '#2563eb',
            'is_default' => false,
            'is_essential' => $type === 'expense',
            'is_savable' => $type === 'expense',
            'is_lifestyle' => false,
        ]);
    }
}
