<?php

namespace Tests\Feature\Finance;

use App\Models\Category;
use App\Models\Debt;
use App\Models\Family;
use App\Models\FamilyMember;
use App\Models\FinancialAccount;
use App\Models\SavingGoal;
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

    public function test_transfer_moves_balance_between_accounts(): void
    {
        $user = User::factory()->create();
        $fromAccount = $this->account($user, 4851000);
        $toAccount = $this->account($user, 4500000);

        $response = $this->actingAs($user)->post('/transfers', [
            'from_account_id' => $fromAccount->id,
            'to_account_id' => $toAccount->id,
            'amount' => 100000,
            'transfer_date' => now()->toDateString(),
            'description' => 'Pindah saldo ke BRI',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $this->assertSame(4751000.0, (float) $fromAccount->refresh()->current_balance);
        $this->assertSame(4600000.0, (float) $toAccount->refresh()->current_balance);
        $this->assertDatabaseHas('transfers', [
            'from_account_id' => $fromAccount->id,
            'to_account_id' => $toAccount->id,
            'amount' => 100000,
        ]);
    }

    public function test_saving_transaction_moves_balance_and_updates_goal_progress(): void
    {
        $user = User::factory()->create();
        $sourceAccount = $this->account($user, 5000000);
        $targetAccount = $this->account($user, 1000000);
        $category = $this->category($user, 'expense', 'Tabungan');

        $goal = SavingGoal::query()->create([
            'user_id' => $user->id,
            'financial_account_id' => $targetAccount->id,
            'name' => 'Dana Lahiran',
            'target_amount' => 10000000,
            'current_amount' => 0,
            'priority' => 'high',
            'status' => 'active',
        ]);

        $transaction = app(TransactionService::class)->create([
            'user_id' => $user->id,
            'financial_account_id' => $sourceAccount->id,
            'category_id' => $category->id,
            'saving_goal_id' => $goal->id,
            'type' => 'saving',
            'amount' => 500000,
            'transaction_date' => now()->toDateString(),
            'visibility' => 'private',
            'need_type' => 'financial',
        ]);

        $this->assertSame(4500000.0, (float) $sourceAccount->refresh()->current_balance);
        $this->assertSame(1500000.0, (float) $targetAccount->refresh()->current_balance);
        $this->assertSame(500000.0, (float) $goal->refresh()->current_amount);

        app(TransactionService::class)->delete($transaction);

        $this->assertSame(5000000.0, (float) $sourceAccount->refresh()->current_balance);
        $this->assertSame(1000000.0, (float) $targetAccount->refresh()->current_balance);
        $this->assertSame(0.0, (float) $goal->refresh()->current_amount);
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

    public function test_financial_metric_trend_uses_unique_month_keys_at_end_of_month(): void
    {
        $this->travelTo(now()->setDate(2026, 6, 30)->startOfDay());

        $user = User::factory()->create();

        $summary = app(FinancialMetricService::class)->monthlySummary($user);
        $keys = collect($summary['trend'])->pluck('key');

        $this->assertSame(['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'], $keys->all());
        $this->assertCount($keys->count(), $keys->unique());
    }

    public function test_family_summary_includes_active_family_members(): void
    {
        $admin = User::factory()->create(['name' => 'Azmi']);
        $spouse = User::factory()->create(['name' => 'Istri']);
        $inactiveMember = User::factory()->create(['name' => 'Tidak Aktif']);
        $family = $this->family($admin);
        $this->familyMember($family, $spouse, 'member');
        $this->familyMember($family, $inactiveMember, 'member', 'inactive');

        $adminAccount = $this->account($admin, 5000000);
        $spouseAccount = $this->account($spouse, 3000000);
        $inactiveAccount = $this->account($inactiveMember, 9000000);
        $adminCategory = $this->category($admin, 'expense', 'Rumah');
        $spouseCategory = $this->category($spouse, 'expense', 'Dapur');
        $inactiveCategory = $this->category($inactiveMember, 'expense', 'Diabaikan');

        app(TransactionService::class)->create([
            'user_id' => $admin->id,
            'financial_account_id' => $adminAccount->id,
            'category_id' => $adminCategory->id,
            'type' => 'expense',
            'amount' => 1000000,
            'transaction_date' => now()->toDateString(),
            'visibility' => 'private',
            'need_type' => 'essential',
        ]);

        app(TransactionService::class)->create([
            'user_id' => $spouse->id,
            'financial_account_id' => $spouseAccount->id,
            'category_id' => $spouseCategory->id,
            'type' => 'expense',
            'amount' => 750000,
            'transaction_date' => now()->toDateString(),
            'visibility' => 'private',
            'need_type' => 'essential',
        ]);

        app(TransactionService::class)->create([
            'user_id' => $inactiveMember->id,
            'financial_account_id' => $inactiveAccount->id,
            'category_id' => $inactiveCategory->id,
            'type' => 'expense',
            'amount' => 5000000,
            'transaction_date' => now()->toDateString(),
            'visibility' => 'private',
            'need_type' => 'essential',
        ]);

        $summary = app(FinancialMetricService::class)->monthlySummary($admin, now()->format('Y-m'), 'family', $family->load('members.user'));

        $this->assertSame('family', $summary['scope']);
        $this->assertSame(1750000.0, $summary['totals']['expense']);
        $this->assertCount(2, $summary['member_breakdown']);
        $this->assertSame(['Azmi', 'Istri'], collect($summary['member_breakdown'])->pluck('name')->all());
    }

    public function test_user_cannot_create_transaction_from_another_family_members_account(): void
    {
        $user = User::factory()->create();
        $spouse = User::factory()->create();
        $family = $this->family($user);
        $this->familyMember($family, $spouse, 'member');
        $spouseAccount = $this->account($spouse, 3000000);
        $category = $this->category($user, 'expense', 'Belanja');

        $response = $this->actingAs($user)->post('/transactions', [
            'financial_account_id' => $spouseAccount->id,
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 100000,
            'transaction_date' => now()->toDateString(),
            'visibility' => 'private',
            'need_type' => 'essential',
        ]);

        $response->assertNotFound();
        $this->assertSame(3000000.0, (float) $spouseAccount->refresh()->current_balance);
    }

    public function test_family_admin_can_add_existing_user_as_member(): void
    {
        $admin = User::factory()->create();
        $member = User::factory()->create(['email' => 'istri@example.com']);
        $family = $this->family($admin);

        $response = $this->actingAs($admin)->post("/families/{$family->id}/members", [
            'email' => $member->email,
            'role' => 'member',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        $this->assertDatabaseHas('family_members', [
            'family_id' => $family->id,
            'user_id' => $member->id,
            'role' => 'member',
            'status' => 'active',
        ]);
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

    private function family(User $owner): Family
    {
        $family = Family::query()->create([
            'owner_user_id' => $owner->id,
            'name' => 'Keluarga Azmi',
            'currency' => 'IDR',
        ]);

        $this->familyMember($family, $owner, 'admin');

        return $family;
    }

    private function familyMember(Family $family, User $user, string $role, string $status = 'active'): FamilyMember
    {
        return FamilyMember::query()->create([
            'family_id' => $family->id,
            'user_id' => $user->id,
            'role' => $role,
            'status' => $status,
            'joined_at' => $status === 'active' ? now() : null,
        ]);
    }
}
