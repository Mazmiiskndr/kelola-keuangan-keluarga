<?php

namespace Database\Seeders;

use App\Enums\NeedType;
use App\Enums\TransactionType;
use App\Enums\Visibility;
use App\Models\Budget;
use App\Models\Debt;
use App\Models\FinanceTransaction;
use App\Models\FinancialAccount;
use App\Models\FinancialProfile;
use App\Models\SavingGoal;
use App\Models\User;
use App\Services\Finance\CategoryBootstrapService;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        FinancialProfile::query()->create([
            'user_id' => $user->id,
            'account_type' => 'personal',
            'monthly_income_estimate' => 12000000,
            'financial_month_start_day' => 1,
            'risk_profile' => 'moderate',
            'target_saving_ratio' => 20,
            'emergency_fund_months' => 6,
            'main_goal' => 'saving',
        ]);

        app(CategoryBootstrapService::class)->ensureDefaults($user);

        $account = FinancialAccount::query()->create([
            'user_id' => $user->id,
            'name' => 'BCA - Moch Azmi Iskandar',
            'bank_name' => 'BCA',
            'account_holder_name' => 'Moch Azmi Iskandar',
            'account_number' => '1234567890',
            'type' => 'bank',
            'initial_balance' => 15000000,
            'current_balance' => 15000000,
            'currency' => 'IDR',
            'visibility' => Visibility::Private->value,
            'is_active' => true,
        ]);

        $incomeCategory = $user->categories()->where('name', 'Gaji')->firstOrFail();
        $foodCategory = $user->categories()->where('name', 'Makanan dan Minuman')->firstOrFail();
        $debtCategory = $user->categories()->where('name', 'Cicilan dan Utang')->firstOrFail();

        FinanceTransaction::query()->create([
            'user_id' => $user->id,
            'financial_account_id' => $account->id,
            'category_id' => $incomeCategory->id,
            'type' => TransactionType::Income->value,
            'amount' => 12000000,
            'transaction_date' => now()->startOfMonth()->addDays(1),
            'description' => 'Gaji bulanan',
            'visibility' => Visibility::Private->value,
            'need_type' => NeedType::Financial->value,
        ]);

        FinanceTransaction::query()->create([
            'user_id' => $user->id,
            'financial_account_id' => $account->id,
            'category_id' => $foodCategory->id,
            'type' => TransactionType::Expense->value,
            'amount' => 1850000,
            'transaction_date' => now()->startOfMonth()->addDays(5),
            'description' => 'Makan dan belanja dapur',
            'merchant' => 'Supermarket',
            'visibility' => Visibility::Private->value,
            'need_type' => NeedType::Flexible->value,
        ]);

        Budget::query()->create([
            'user_id' => $user->id,
            'category_id' => $foodCategory->id,
            'period_type' => 'monthly',
            'period_start' => now()->startOfMonth()->toDateString(),
            'period_end' => now()->endOfMonth()->toDateString(),
            'amount' => 2200000,
            'alert_thresholds' => [50, 80, 100],
        ]);

        SavingGoal::query()->create([
            'user_id' => $user->id,
            'name' => 'Dana Darurat',
            'target_amount' => 36000000,
            'current_amount' => 8500000,
            'target_date' => now()->addYear()->toDateString(),
            'priority' => 'high',
            'status' => 'active',
        ]);

        Debt::query()->create([
            'user_id' => $user->id,
            'name' => 'Cicilan Kendaraan',
            'type' => 'vehicle_loan',
            'lender' => 'Leasing',
            'principal_amount' => 48000000,
            'outstanding_amount' => 36000000,
            'monthly_payment' => 2000000,
            'minimum_payment' => 2000000,
            'interest_rate' => 9.5,
            'start_date' => now()->subMonths(6)->toDateString(),
            'tenor_months' => 24,
            'remaining_tenor_months' => 18,
            'due_day' => 25,
            'next_due_date' => now()->day(25)->toDateString(),
            'payment_account_id' => $account->id,
            'category_id' => $debtCategory->id,
            'include_in_monthly_expense' => true,
            'status' => 'active',
        ]);
    }
}
