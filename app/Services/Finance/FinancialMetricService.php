<?php

namespace App\Services\Finance;

use App\Enums\TransactionType;
use App\Models\Budget;
use App\Models\Debt;
use App\Models\Family;
use App\Models\FinanceTransaction;
use App\Models\FinancialAccount;
use App\Models\SavingGoal;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class FinancialMetricService
{
    public function __construct(private readonly FamilyAccessService $families) {}

    /**
     * @return array<string, mixed>
     */
    public function monthlySummary(User $user, ?string $period = null, string $scope = 'personal', ?Family $family = null): array
    {
        $month = $period ? CarbonImmutable::parse($period) : CarbonImmutable::now();
        $start = $month->startOfMonth();
        $end = $month->endOfMonth();
        $isFamilyScope = $scope === 'family' && $family;
        $memberIds = $isFamilyScope ? $this->families->activeMemberIds($family) : [$user->id];

        $transactions = FinanceTransaction::query()
            ->with(['category', 'user'])
            ->whereIn('user_id', $memberIds)
            ->whereDate('transaction_date', '>=', $start->toDateString())
            ->whereDate('transaction_date', '<=', $end->toDateString())
            ->get();

        $income = (float) $transactions->where('type', TransactionType::Income->value)->sum('amount');
        $expense = (float) $transactions->where('type', TransactionType::Expense->value)->sum('amount');
        $totalBalance = (float) FinancialAccount::query()->whereIn('user_id', $memberIds)->where('is_active', true)->sum('current_balance');
        $debtDue = (float) Debt::query()
            ->whereIn('user_id', $memberIds)
            ->where('status', 'active')
            ->where('include_in_monthly_expense', true)
            ->sum('monthly_payment');
        $outstandingDebt = (float) Debt::query()->whereIn('user_id', $memberIds)->where('status', 'active')->sum('outstanding_amount');
        $budgetTotal = (float) Budget::query()->whereIn('user_id', $memberIds)->whereDate('period_start', $start)->sum('amount');
        $savingTarget = (float) SavingGoal::query()->whereIn('user_id', $memberIds)->where('status', 'active')->sum('target_amount');
        $savingCurrent = (float) SavingGoal::query()->whereIn('user_id', $memberIds)->where('status', 'active')->sum('current_amount');
        $canViewFamilyDetails = $isFamilyScope && $this->families->canViewDetails($user, $family);

        return [
            'period' => ['start' => $start->toDateString(), 'end' => $end->toDateString()],
            'scope' => $isFamilyScope ? 'family' : 'personal',
            'family' => $isFamilyScope ? ['id' => $family->id, 'name' => $family->name] : null,
            'family_role' => $isFamilyScope ? $this->families->role($user, $family) : null,
            'can_view_family_details' => $canViewFamilyDetails,
            'totals' => [
                'balance' => $totalBalance,
                'income' => $income,
                'expense' => $expense,
                'cash_flow' => $income - $expense,
                'debt_due' => $debtDue,
                'outstanding_debt' => $outstandingDebt,
                'budget' => $budgetTotal,
                'saving_target' => $savingTarget,
                'saving_current' => $savingCurrent,
                'saving_ratio' => $income > 0 ? round((($income - $expense) / $income) * 100, 2) : 0,
                'debt_to_income_ratio' => $income > 0 ? round(($debtDue / $income) * 100, 2) : 0,
            ],
            'expense_by_category' => $this->expenseByCategory($transactions),
            'largest_expenses' => $this->largestExpenses($transactions, $isFamilyScope && ! $canViewFamilyDetails),
            'accounts' => $this->accountsBreakdown($memberIds, $isFamilyScope && $canViewFamilyDetails),
            'trend' => $this->sixMonthTrend($memberIds, $month),
            'upcoming_debts' => $this->upcomingDebts($memberIds),
            'member_breakdown' => $isFamilyScope ? $this->memberBreakdown($family, $transactions) : [],
        ];
    }

    private function expenseByCategory(Collection $transactions): array
    {
        return $transactions
            ->where('type', TransactionType::Expense->value)
            ->groupBy('category.name')
            ->map(fn (Collection $items, string $name): array => [
                'name' => $name ?: 'Tanpa kategori',
                'amount' => (float) $items->sum('amount'),
                'color' => $items->first()?->category?->color ?? '#94a3b8',
            ])
            ->values()
            ->sortByDesc('amount')
            ->values()
            ->all();
    }

    private function largestExpenses(Collection $transactions, bool $anonymize = false): array
    {
        return $transactions
            ->where('type', TransactionType::Expense->value)
            ->sortByDesc('amount')
            ->take(5)
            ->map(fn (FinanceTransaction $transaction): array => [
                'id' => $transaction->id,
                'description' => $anonymize ? 'Pengeluaran anggota keluarga' : ($transaction->description ?: $transaction->category?->name),
                'category' => $transaction->category?->name,
                'member' => $anonymize ? null : $transaction->user?->name,
                'amount' => (float) $transaction->amount,
                'date' => $transaction->transaction_date?->toDateString(),
            ])
            ->values()
            ->all();
    }

    /**
     * @param  array<int, int>  $userIds
     */
    private function accountsBreakdown(array $userIds, bool $includeOwner = false): array
    {
        return FinancialAccount::query()
            ->with('user:id,name')
            ->whereIn('user_id', $userIds)
            ->where('is_active', true)
            ->orderByDesc('current_balance')
            ->orderBy('bank_name')
            ->get(['id', 'user_id', 'name', 'bank_name', 'account_holder_name', 'type', 'current_balance', 'currency', 'visibility'])
            ->map(fn (FinancialAccount $account): array => [
                'id' => $account->id,
                'name' => $account->name,
                'display_name' => $account->display_name,
                'type' => $account->type,
                'current_balance' => (float) $account->current_balance,
                'currency' => $account->currency,
                'visibility' => $account->visibility,
                'owner' => $includeOwner ? $account->user?->name : null,
            ])
            ->values()
            ->all();
    }

    /**
     * @param  array<int, int>  $userIds
     */
    private function sixMonthTrend(array $userIds, CarbonImmutable $month): array
    {
        $baseMonth = $month->startOfMonth();

        return collect(range(5, 0))
            ->map(function (int $monthsAgo) use ($userIds, $baseMonth): array {
                $current = $baseMonth->subMonthsNoOverflow($monthsAgo);
                $start = $current->startOfMonth();
                $end = $current->endOfMonth();

                $rows = FinanceTransaction::query()
                    ->whereIn('user_id', $userIds)
                    ->whereDate('transaction_date', '>=', $start->toDateString())
                    ->whereDate('transaction_date', '<=', $end->toDateString())
                    ->selectRaw('type, sum(amount) as total')
                    ->groupBy('type')
                    ->pluck('total', 'type');

                return [
                    'key' => $current->format('Y-m'),
                    'label' => $current->format('M'),
                    'income' => (float) ($rows[TransactionType::Income->value] ?? 0),
                    'expense' => (float) ($rows[TransactionType::Expense->value] ?? 0),
                ];
            })
            ->all();
    }

    /**
     * @param  array<int, int>  $userIds
     */
    private function upcomingDebts(array $userIds): array
    {
        return Debt::query()
            ->whereIn('user_id', $userIds)
            ->where('status', 'active')
            ->whereNotNull('next_due_date')
            ->orderBy('next_due_date')
            ->take(5)
            ->get(['id', 'name', 'lender', 'monthly_payment', 'next_due_date'])
            ->map(fn (Debt $debt): array => [
                'id' => $debt->id,
                'name' => $debt->name,
                'lender' => $debt->lender,
                'amount' => (float) $debt->monthly_payment,
                'due_date' => $debt->next_due_date?->toDateString(),
            ])
            ->all();
    }

    private function memberBreakdown(Family $family, Collection $transactions): array
    {
        return $family->members
            ->where('status', 'active')
            ->map(function ($member) use ($transactions): array {
                $memberTransactions = $transactions->where('user_id', $member->user_id);
                $income = (float) $memberTransactions->where('type', TransactionType::Income->value)->sum('amount');
                $expense = (float) $memberTransactions->where('type', TransactionType::Expense->value)->sum('amount');
                $saving = (float) $memberTransactions->where('type', TransactionType::Saving->value)->sum('amount');

                return [
                    'user_id' => $member->user_id,
                    'name' => $member->user?->name ?? $member->user?->email ?? 'Anggota',
                    'role' => $member->role,
                    'income' => $income,
                    'expense' => $expense,
                    'saving' => $saving,
                    'cash_flow' => $income - $expense,
                ];
            })
            ->values()
            ->all();
    }
}
