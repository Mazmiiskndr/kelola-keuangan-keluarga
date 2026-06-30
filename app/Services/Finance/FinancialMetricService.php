<?php

namespace App\Services\Finance;

use App\Enums\TransactionType;
use App\Models\Budget;
use App\Models\Debt;
use App\Models\FinanceTransaction;
use App\Models\FinancialAccount;
use App\Models\SavingGoal;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class FinancialMetricService
{
    /**
     * @return array<string, mixed>
     */
    public function monthlySummary(User $user, ?string $period = null): array
    {
        $month = $period ? CarbonImmutable::parse($period) : CarbonImmutable::now();
        $start = $month->startOfMonth();
        $end = $month->endOfMonth();

        $transactions = FinanceTransaction::query()
            ->with('category')
            ->where('user_id', $user->id)
            ->whereDate('transaction_date', '>=', $start->toDateString())
            ->whereDate('transaction_date', '<=', $end->toDateString())
            ->get();

        $income = (float) $transactions->where('type', TransactionType::Income->value)->sum('amount');
        $expense = (float) $transactions->where('type', TransactionType::Expense->value)->sum('amount');
        $totalBalance = (float) FinancialAccount::query()->where('user_id', $user->id)->where('is_active', true)->sum('current_balance');
        $debtDue = (float) Debt::query()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->where('include_in_monthly_expense', true)
            ->sum('monthly_payment');
        $outstandingDebt = (float) Debt::query()->where('user_id', $user->id)->where('status', 'active')->sum('outstanding_amount');
        $budgetTotal = (float) Budget::query()->where('user_id', $user->id)->whereDate('period_start', $start)->sum('amount');
        $savingTarget = (float) SavingGoal::query()->where('user_id', $user->id)->where('status', 'active')->sum('target_amount');
        $savingCurrent = (float) SavingGoal::query()->where('user_id', $user->id)->where('status', 'active')->sum('current_amount');

        return [
            'period' => ['start' => $start->toDateString(), 'end' => $end->toDateString()],
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
            'largest_expenses' => $this->largestExpenses($transactions),
            'trend' => $this->sixMonthTrend($user, $month),
            'upcoming_debts' => $this->upcomingDebts($user),
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

    private function largestExpenses(Collection $transactions): array
    {
        return $transactions
            ->where('type', TransactionType::Expense->value)
            ->sortByDesc('amount')
            ->take(5)
            ->map(fn (FinanceTransaction $transaction): array => [
                'id' => $transaction->id,
                'description' => $transaction->description ?: $transaction->category?->name,
                'category' => $transaction->category?->name,
                'amount' => (float) $transaction->amount,
                'date' => $transaction->transaction_date?->toDateString(),
            ])
            ->values()
            ->all();
    }

    private function sixMonthTrend(User $user, CarbonImmutable $month): array
    {
        return collect(range(5, 0))
            ->map(function (int $monthsAgo) use ($user, $month): array {
                $current = $month->subMonths($monthsAgo);
                $start = $current->startOfMonth();
                $end = $current->endOfMonth();

                $rows = FinanceTransaction::query()
                    ->where('user_id', $user->id)
                    ->whereDate('transaction_date', '>=', $start->toDateString())
                    ->whereDate('transaction_date', '<=', $end->toDateString())
                    ->selectRaw('type, sum(amount) as total')
                    ->groupBy('type')
                    ->pluck('total', 'type');

                return [
                    'label' => $current->format('M'),
                    'income' => (float) ($rows[TransactionType::Income->value] ?? 0),
                    'expense' => (float) ($rows[TransactionType::Expense->value] ?? 0),
                ];
            })
            ->all();
    }

    private function upcomingDebts(User $user): array
    {
        return Debt::query()
            ->where('user_id', $user->id)
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
}
