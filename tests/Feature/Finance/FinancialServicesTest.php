<?php

namespace Tests\Feature\Finance;

use App\Models\Category;
use App\Models\Debt;
use App\Models\Family;
use App\Models\FamilyMember;
use App\Models\FinanceTransaction;
use App\Models\FinancialAccount;
use App\Models\SavingGoal;
use App\Models\User;
use App\Services\Ai\AiAnalysisService;
use App\Services\Finance\DebtPaymentService;
use App\Services\Finance\FinancialMetricService;
use App\Services\Finance\TransactionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\DatabaseNotification;
use Inertia\Testing\AssertableInertia as Assert;
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
            'merchant' => 'Belanja',
        ]);

        $this->assertSame(4500.0, (float) $account->refresh()->current_balance);
    }

    public function test_expense_transaction_cannot_make_account_balance_negative(): void
    {
        $user = User::factory()->create();
        $account = $this->account($user, 0);
        $category = $this->category($user, 'expense', 'Belanja');

        $response = $this->actingAs($user)->post('/transactions', [
            'user_id' => $user->id,
            'financial_account_id' => $account->id,
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 100000,
            'transaction_date' => now()->toDateString(),
            'visibility' => 'private',
            'need_type' => 'essential',
            'merchant' => 'Belanja',
        ]);

        $response->assertSessionHasErrors('amount');
        $this->assertSame(0.0, (float) $account->refresh()->current_balance);
        $this->assertDatabaseMissing('finance_transactions', [
            'financial_account_id' => $account->id,
            'amount' => 100000,
        ]);
    }

    public function test_expense_validation_uses_recalculated_account_balance(): void
    {
        $user = User::factory()->create();
        $account = $this->account($user, 0);
        $account->forceFill(['current_balance' => 200000])->save();
        $category = $this->category($user, 'expense', 'Belanja');

        $response = $this->actingAs($user)->post('/transactions', [
            'financial_account_id' => $account->id,
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 200000,
            'transaction_date' => now()->toDateString(),
            'visibility' => 'private',
            'need_type' => 'essential',
            'merchant' => 'Belanja',
        ]);

        $response->assertSessionHasErrors('amount');
        $this->assertSame(0.0, (float) $account->refresh()->current_balance);
        $this->assertDatabaseMissing('finance_transactions', [
            'financial_account_id' => $account->id,
            'amount' => 200000,
        ]);
    }

    public function test_transaction_title_is_required(): void
    {
        $user = User::factory()->create();
        $account = $this->account($user, 100000);
        $category = $this->category($user, 'expense', 'Belanja');

        $response = $this->actingAs($user)->post('/transactions', [
            'financial_account_id' => $account->id,
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 50000,
            'transaction_date' => now()->toDateString(),
            'visibility' => 'private',
            'need_type' => 'essential',
            'merchant' => '',
        ]);

        $response->assertSessionHasErrors('merchant');
        $this->assertDatabaseMissing('finance_transactions', [
            'financial_account_id' => $account->id,
            'amount' => 50000,
        ]);
    }

    public function test_account_update_recalculates_stale_current_balance(): void
    {
        $user = User::factory()->create();
        $account = $this->account($user, 0);
        $account->forceFill(['current_balance' => 200000])->save();

        $response = $this->actingAs($user)->put("/accounts/{$account->id}", [
            'name' => 'BCA - Moch Azmi Iskandar',
            'bank_name' => 'BCA',
            'account_holder_name' => 'Moch Azmi Iskandar',
            'account_number' => '1234567890',
            'type' => 'bank',
            'initial_balance' => 0,
            'currency' => 'IDR',
            'visibility' => 'private',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertSame(0.0, (float) $account->refresh()->current_balance);
    }

    public function test_deleting_transaction_recalculates_stale_account_balance(): void
    {
        $user = User::factory()->create();
        $account = $this->account($user, 500000);
        $category = $this->category($user, 'expense', 'Belanja');
        $transaction = FinanceTransaction::query()->create([
            'user_id' => $user->id,
            'financial_account_id' => $account->id,
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 200000,
            'transaction_date' => now()->toDateString(),
            'visibility' => 'private',
            'need_type' => 'essential',
            'merchant' => 'Belanja',
        ]);
        $account->forceFill(['current_balance' => 999999])->save();

        app(TransactionService::class)->delete($transaction);

        $this->assertSame(500000.0, (float) $account->refresh()->current_balance);
        $this->assertSoftDeleted($transaction);
    }

    public function test_transaction_can_be_updated_and_recalculates_account_balance(): void
    {
        $user = User::factory()->create();
        $account = $this->account($user, 100000);
        $category = $this->category($user, 'expense', 'Transportasi');

        $transaction = app(TransactionService::class)->create([
            'user_id' => $user->id,
            'financial_account_id' => $account->id,
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 240,
            'transaction_date' => now()->toDateString(),
            'visibility' => 'private',
            'need_type' => 'flexible',
            'merchant' => 'Gojek Pulang',
        ]);

        $response = $this->actingAs($user)->put("/transactions/{$transaction->id}", [
            'financial_account_id' => $account->id,
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 24000,
            'transaction_date' => now()->toDateString(),
            'visibility' => 'private',
            'need_type' => 'flexible',
            'merchant' => 'Gojek Pulang',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertSame(24000.0, (float) $transaction->refresh()->amount);
        $this->assertSame(76000.0, (float) $account->refresh()->current_balance);
    }

    public function test_transaction_history_filters_by_type_and_paginates_ten_items(): void
    {
        $user = User::factory()->create();
        $account = $this->account($user, 1000000);
        $incomeCategory = $this->category($user, 'income', 'Gaji');
        $expenseCategory = $this->category($user, 'expense', 'Belanja');

        for ($index = 0; $index < 12; $index++) {
            FinanceTransaction::query()->create([
                'user_id' => $user->id,
                'financial_account_id' => $account->id,
                'category_id' => $expenseCategory->id,
                'type' => 'expense',
                'amount' => 10000 + $index,
                'transaction_date' => now()->subDays($index)->toDateString(),
                'visibility' => 'private',
                'need_type' => 'flexible',
            ]);
        }

        for ($index = 0; $index < 3; $index++) {
            FinanceTransaction::query()->create([
                'user_id' => $user->id,
                'financial_account_id' => $account->id,
                'category_id' => $incomeCategory->id,
                'type' => 'income',
                'amount' => 100000 + $index,
                'transaction_date' => now()->subDays($index)->toDateString(),
                'visibility' => 'private',
                'need_type' => 'financial',
            ]);
        }

        $response = $this->actingAs($user)->get('/transactions?type=expense');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('transactions/index')
            ->where('filters.type', 'expense')
            ->has('transactions.data', 10)
            ->where('transactions.data.0.type', 'expense')
        );
    }

    public function test_transaction_suggestions_use_only_authenticated_users_own_history(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $account = $this->account($user, 1000000);
        $otherAccount = $this->account($otherUser, 1000000);
        $category = $this->category($user, 'expense', 'Lifestyle');
        $otherCategory = $this->category($otherUser, 'expense', 'Rahasia');

        $this->transaction($user, $account, $category, ['merchant' => 'Rokok', 'amount' => 25000]);
        $this->transaction($otherUser, $otherAccount, $otherCategory, ['merchant' => 'Data Orang Lain', 'amount' => 90000]);

        $this->actingAs($user)->get('/transactions')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('transactions/index')
                ->has('suggestions.items', 1)
                ->where('suggestions.items.0.merchant', 'Rokok')
                ->where('suggestions.items.0.usage_count', 1)
            );
    }

    public function test_transaction_suggestions_pick_most_frequent_title_details_and_amount(): void
    {
        $user = User::factory()->create();
        $cashAccount = $this->account($user, 1000000, ['name' => 'Cash']);
        $walletAccount = $this->account($user, 1000000, ['name' => 'E-Wallet', 'bank_name' => null, 'account_holder_name' => null]);
        $foodCategory = $this->category($user, 'expense', 'Makan');
        $lifestyleCategory = $this->category($user, 'expense', 'Lifestyle');

        $this->transaction($user, $cashAccount, $foodCategory, [
            'merchant' => 'Rokok',
            'amount' => 25000,
            'need_type' => 'lifestyle',
            'transaction_date' => now()->subDays(3)->toDateString(),
        ]);
        $this->transaction($user, $walletAccount, $lifestyleCategory, [
            'merchant' => 'rokok',
            'amount' => 30000,
            'need_type' => 'lifestyle',
            'transaction_date' => now()->subDays(2)->toDateString(),
        ]);
        $this->transaction($user, $walletAccount, $lifestyleCategory, [
            'merchant' => 'Rokok',
            'amount' => 30000,
            'need_type' => 'flexible',
            'transaction_date' => now()->subDay()->toDateString(),
        ]);

        $this->actingAs($user)->get('/transactions')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('transactions/index')
                ->where('suggestions.items.0.type', 'expense')
                ->where('suggestions.items.0.merchant', 'Rokok')
                ->where('suggestions.items.0.category_id', $lifestyleCategory->id)
                ->where('suggestions.items.0.financial_account_id', $walletAccount->id)
                ->where('suggestions.items.0.amount', 30000)
                ->where('suggestions.items.0.need_type', 'lifestyle')
                ->where('suggestions.items.0.usage_count', 3)
            );
    }

    public function test_transaction_suggestions_exclude_inactive_deleted_mismatched_and_inaccessible_records(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $activeAccount = $this->account($user, 1000000);
        $inactiveAccount = $this->account($user, 1000000, ['is_active' => false]);
        $otherAccount = $this->account($otherUser, 1000000);
        $expenseCategory = $this->category($user, 'expense', 'Belanja');
        $incomeCategory = $this->category($user, 'income', 'Gaji');
        $deletedCategory = $this->category($user, 'expense', 'Dihapus');

        $this->transaction($user, $activeAccount, $expenseCategory, ['merchant' => 'Valid']);
        $this->transaction($user, $inactiveAccount, $expenseCategory, ['merchant' => 'Akun Nonaktif']);
        $this->transaction($user, $activeAccount, $incomeCategory, ['merchant' => 'Kategori Salah', 'type' => 'expense']);
        $this->transaction($user, $activeAccount, $deletedCategory, ['merchant' => 'Kategori Dihapus']);
        $this->transaction($user, $otherAccount, $expenseCategory, ['merchant' => 'Akun Tidak Bisa Diakses']);
        $deletedCategory->delete();

        $this->actingAs($user)->get('/transactions')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('transactions/index')
                ->has('suggestions.items', 1)
                ->where('suggestions.items.0.merchant', 'Valid')
            );
    }

    public function test_transactions_page_includes_learned_amount_presets(): void
    {
        $user = User::factory()->create();
        $account = $this->account($user, 1000000);
        $category = $this->category($user, 'expense', 'Transportasi');

        $this->transaction($user, $account, $category, ['merchant' => 'Bensin', 'amount' => 50000]);
        $this->transaction($user, $account, $category, ['merchant' => 'Tol', 'amount' => 50000]);
        $this->transaction($user, $account, $category, ['merchant' => 'Parkir', 'amount' => 10000]);

        $this->actingAs($user)->get('/transactions')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('transactions/index')
                ->has('suggestions.amount_presets', 2)
                ->where('suggestions.amount_presets.0.type', 'expense')
                ->where('suggestions.amount_presets.0.amount', 50000)
                ->where('suggestions.amount_presets.0.usage_count', 2)
            );
    }

    public function test_transfer_cannot_make_source_account_balance_negative(): void
    {
        $user = User::factory()->create();
        $fromAccount = $this->account($user, 50000);
        $toAccount = $this->account($user, 0);

        $response = $this->actingAs($user)->post('/transfers', [
            'from_account_id' => $fromAccount->id,
            'to_account_id' => $toAccount->id,
            'amount' => 100000,
            'transfer_date' => now()->toDateString(),
            'description' => 'Pindah saldo',
        ]);

        $response->assertSessionHasErrors('amount');
        $this->assertSame(50000.0, (float) $fromAccount->refresh()->current_balance);
        $this->assertSame(0.0, (float) $toAccount->refresh()->current_balance);
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

    public function test_creating_overdue_debt_creates_unread_notification(): void
    {
        $this->travelTo(now()->setDate(2026, 7, 1)->startOfDay());

        $user = User::factory()->create();
        $account = $this->account($user, 1000000);
        $category = $this->category($user, 'expense', 'Cicilan');

        $response = $this->actingAs($user)->post('/debts', [
            'name' => 'Headshot PayLater',
            'type' => 'paylater',
            'lender' => 'Kredivo',
            'principal_amount' => 600000,
            'outstanding_amount' => 500000,
            'monthly_payment' => 100000,
            'minimum_payment' => 100000,
            'interest_rate' => 0,
            'next_due_date' => '2026-06-30',
            'payment_account_id' => $account->id,
            'category_id' => $category->id,
            'include_in_monthly_expense' => true,
        ]);

        $response->assertSessionHasNoErrors();

        $notification = DatabaseNotification::query()
            ->where('notifiable_id', $user->id)
            ->first();

        $this->assertNotNull($notification);
        $this->assertNull($notification->read_at);
        $this->assertSame('Cicilan sudah jatuh tempo', $notification->data['title']);
        $this->assertSame('2026-06-30', $notification->data['due_date']);
    }

    public function test_debt_due_command_includes_overdue_debts_once(): void
    {
        $this->travelTo(now()->setDate(2026, 7, 1)->startOfDay());

        $user = User::factory()->create();

        Debt::query()->create([
            'user_id' => $user->id,
            'name' => 'KPR',
            'type' => 'installment',
            'principal_amount' => 1000000,
            'outstanding_amount' => 900000,
            'monthly_payment' => 100000,
            'minimum_payment' => 100000,
            'interest_rate' => 0,
            'next_due_date' => '2026-06-30',
            'include_in_monthly_expense' => true,
            'status' => 'active',
        ]);

        $this->artisan('finance:send-debt-due-notifications')
            ->expectsOutput('1 notification cicilan dikirim.')
            ->assertExitCode(0);

        $this->artisan('finance:send-debt-due-notifications')
            ->expectsOutput('0 notification cicilan dikirim.')
            ->assertExitCode(0);

        $this->assertSame(1, DatabaseNotification::query()->where('notifiable_id', $user->id)->count());
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
            'merchant' => 'Rumah',
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
            'merchant' => 'Belanja',
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
            'merchant' => 'Belanja',
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
            'merchant' => 'Belanja',
        ]);

        $summary = app(FinancialMetricService::class)->monthlySummary($admin, now()->format('Y-m'), 'family', $family->load('members.user'));

        $this->assertSame('family', $summary['scope']);
        $this->assertSame(1750000.0, $summary['totals']['expense']);
        $this->assertCount(2, $summary['member_breakdown']);
        $this->assertSame(['Azmi', 'Istri'], collect($summary['member_breakdown'])->pluck('name')->all());
    }

    public function test_family_viewer_summary_does_not_expose_account_or_member_details(): void
    {
        $owner = User::factory()->create();
        $viewer = User::factory()->create();
        $family = $this->family($owner);
        $this->familyMember($family, $viewer, 'viewer');
        $this->account($owner, 100000);

        $summary = app(FinancialMetricService::class)->monthlySummary($viewer, now()->format('Y-m'), 'family', $family->load('members.user'));

        $this->assertFalse($summary['can_view_family_details']);
        $this->assertSame([], $summary['accounts']);
        $this->assertSame([], $summary['member_breakdown']);
    }

    public function test_user_cannot_create_transaction_from_unrelated_users_private_account(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $otherAccount = $this->account($otherUser, 3000000);
        $category = $this->category($user, 'expense', 'Belanja');

        $response = $this->actingAs($user)->post('/transactions', [
            'financial_account_id' => $otherAccount->id,
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 100000,
            'transaction_date' => now()->toDateString(),
            'visibility' => 'private',
            'need_type' => 'essential',
            'merchant' => 'Rumah',
        ]);

        $response->assertForbidden();
        $this->assertSame(3000000.0, (float) $otherAccount->refresh()->current_balance);
    }

    public function test_family_member_can_create_transaction_from_shared_family_account(): void
    {
        $owner = User::factory()->create(['name' => 'Azmi']);
        $member = User::factory()->create(['name' => 'Budi']);
        $family = $this->family($owner);
        $this->familyMember($family, $member, 'member');
        $sharedAccount = $this->account($owner, 3000000, [
            'family_id' => $family->id,
            'visibility' => 'family',
        ]);
        $category = $this->category($member, 'expense', 'Belanja');

        $response = $this->actingAs($member)->post('/transactions', [
            'financial_account_id' => $sharedAccount->id,
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 100000,
            'transaction_date' => now()->toDateString(),
            'visibility' => 'private',
            'need_type' => 'essential',
            'merchant' => 'Belanja',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertSame(2900000.0, (float) $sharedAccount->refresh()->current_balance);
        $this->assertDatabaseHas('finance_transactions', [
            'user_id' => $member->id,
            'family_id' => $family->id,
            'financial_account_id' => $sharedAccount->id,
            'visibility' => 'family',
            'amount' => 100000,
        ]);

        $this->actingAs($owner)->get('/transactions')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('transactions/index')
                ->where('transactions.data.0.user.name', 'Budi')
            );
    }

    public function test_family_owner_can_create_transaction_from_member_shared_family_account(): void
    {
        $owner = User::factory()->create(['name' => 'Azmi']);
        $member = User::factory()->create(['name' => 'Budi']);
        $family = $this->family($owner);
        $this->familyMember($family, $member, 'member');
        $memberAccount = $this->account($member, 1500000, [
            'family_id' => $family->id,
            'visibility' => 'family',
        ]);
        $category = $this->category($owner, 'expense', 'Rumah');

        $response = $this->actingAs($owner)->post('/transactions', [
            'financial_account_id' => $memberAccount->id,
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 250000,
            'transaction_date' => now()->toDateString(),
            'visibility' => 'private',
            'need_type' => 'essential',
            'merchant' => 'Rumah',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertSame(1250000.0, (float) $memberAccount->refresh()->current_balance);
        $this->assertDatabaseHas('finance_transactions', [
            'user_id' => $owner->id,
            'family_id' => $family->id,
            'financial_account_id' => $memberAccount->id,
            'visibility' => 'family',
            'amount' => 250000,
        ]);
    }

    public function test_family_owner_can_use_member_private_account_through_active_family_membership(): void
    {
        $owner = User::factory()->create(['name' => 'Azmi']);
        $member = User::factory()->create(['name' => 'Rara']);
        $family = $this->family($owner);
        $this->familyMember($family, $member, 'member');
        $memberAccount = $this->account($member, 8216000);
        $category = $this->category($owner, 'expense', 'Belanja');

        $this->actingAs($owner)->get('/transactions')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('transactions/index')
                ->where('accounts.0.id', $memberAccount->id)
            );

        $response = $this->actingAs($owner)->post('/transactions', [
            'financial_account_id' => $memberAccount->id,
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 216000,
            'transaction_date' => now()->toDateString(),
            'visibility' => 'private',
            'need_type' => 'essential',
            'merchant' => 'Belanja',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertSame(8000000.0, (float) $memberAccount->refresh()->current_balance);
        $this->assertDatabaseHas('finance_transactions', [
            'user_id' => $owner->id,
            'family_id' => $family->id,
            'financial_account_id' => $memberAccount->id,
            'visibility' => 'family',
            'amount' => 216000,
        ]);
    }

    public function test_family_member_can_update_shared_account_balance(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $family = $this->family($owner);
        $this->familyMember($family, $member, 'member');
        $sharedAccount = $this->account($owner, 3000000, [
            'family_id' => $family->id,
            'visibility' => 'family',
        ]);

        $response = $this->actingAs($member)->put("/accounts/{$sharedAccount->id}", [
            'name' => 'BCA - Keluarga',
            'bank_name' => 'BCA',
            'account_holder_name' => 'Keluarga',
            'account_number' => '1234567890',
            'type' => 'bank',
            'initial_balance' => 3500000,
            'currency' => 'IDR',
            'visibility' => 'private',
            'family_id' => $family->id,
        ]);

        $response->assertSessionHasNoErrors();
        $sharedAccount->refresh();

        $this->assertSame(3500000.0, (float) $sharedAccount->current_balance);
        $this->assertSame('family', $sharedAccount->visibility);
        $this->assertSame($family->id, $sharedAccount->family_id);
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

    public function test_family_admin_cannot_add_owner_email_as_member(): void
    {
        $admin = User::factory()->create(['email' => 'owner@example.com']);
        $family = $this->family($admin);

        $response = $this->actingAs($admin)->post("/families/{$family->id}/members", [
            'email' => $admin->email,
            'role' => 'member',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertSame(1, FamilyMember::query()->where('family_id', $family->id)->where('user_id', $admin->id)->count());
    }

    public function test_family_admin_cannot_add_existing_family_member_email(): void
    {
        $admin = User::factory()->create();
        $member = User::factory()->create(['email' => 'member@example.com']);
        $family = $this->family($admin);
        $this->familyMember($family, $member, 'member');

        $response = $this->actingAs($admin)->post("/families/{$family->id}/members", [
            'email' => $member->email,
            'role' => 'admin',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertDatabaseHas('family_members', [
            'family_id' => $family->id,
            'user_id' => $member->id,
            'role' => 'member',
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

    public function test_monthly_summary_merges_categories_with_equivalent_names(): void
    {
        $user = User::factory()->create();
        $account = $this->account($user, 100000);
        $other = $this->category($user, 'expense', 'Lainnya');
        $otherWithWhitespace = $this->category($user, 'expense', ' lainnya ');

        $this->transaction($user, $account, $other, ['amount' => 20000]);
        $this->transaction($user, $account, $otherWithWhitespace, ['amount' => 30000]);

        $summary = app(FinancialMetricService::class)->monthlySummary($user, now()->format('Y-m'));
        $otherCategories = collect($summary['expense_by_category'])->filter(
            fn (array $category): bool => strtolower(trim($category['name'])) === 'lainnya',
        );

        $this->assertCount(1, $otherCategories);
        $this->assertSame(50000.0, $otherCategories->first()['amount']);
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function transaction(User $user, FinancialAccount $account, Category $category, array $overrides = []): FinanceTransaction
    {
        return FinanceTransaction::query()->create([
            'user_id' => $user->id,
            'financial_account_id' => $account->id,
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 10000,
            'transaction_date' => now()->toDateString(),
            'visibility' => 'private',
            'need_type' => 'unclassified',
            'merchant' => 'Transaksi',
            ...$overrides,
        ]);
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function account(User $user, int $balance, array $overrides = []): FinancialAccount
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
            ...$overrides,
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
