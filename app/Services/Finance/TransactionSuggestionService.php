<?php

namespace App\Services\Finance;

use App\Models\FinanceTransaction;
use App\Models\SavingGoal;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class TransactionSuggestionService
{
    private const HISTORY_LIMIT = 300;

    private const TITLE_LIMIT = 6;

    private const AMOUNT_LIMIT = 5;

    public function __construct(private readonly FamilyAccessService $families) {}

    /**
     * @return array{items: array<int, array<string, mixed>>, amount_presets: array<int, array<string, mixed>>}
     */
    public function forUser(User $user): array
    {
        $accessibleAccountIds = $this->families
            ->accessibleAccountQuery($user)
            ->where('is_active', true)
            ->pluck('id')
            ->all();

        if ($accessibleAccountIds === []) {
            return ['items' => [], 'amount_presets' => []];
        }

        $activeSavingGoalIds = SavingGoal::query()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->pluck('id')
            ->all();

        $transactions = FinanceTransaction::query()
            ->with(['account', 'category', 'savingGoal'])
            ->where('user_id', $user->id)
            ->whereIn('financial_account_id', $accessibleAccountIds)
            ->whereNotNull('merchant')
            ->where('merchant', '<>', '')
            ->latest('transaction_date')
            ->latest('id')
            ->limit(self::HISTORY_LIMIT)
            ->get()
            ->filter(fn (FinanceTransaction $transaction): bool => $this->isUsableSuggestionSource($transaction, $activeSavingGoalIds))
            ->values();

        return [
            'items' => $this->titleSuggestions($transactions),
            'amount_presets' => $this->amountPresets($transactions),
        ];
    }

    /**
     * @param  Collection<int, FinanceTransaction>  $transactions
     * @return array<int, array<string, mixed>>
     */
    private function titleSuggestions(Collection $transactions): array
    {
        return $transactions
            ->groupBy(fn (FinanceTransaction $transaction): string => $this->suggestionKey($transaction))
            ->map(fn (Collection $group): array => $this->formatTitleSuggestion($group))
            ->sortBy([
                ['usage_count', 'desc'],
                ['last_used_at', 'desc'],
            ])
            ->take(self::TITLE_LIMIT)
            ->values()
            ->all();
    }

    /**
     * @param  Collection<int, FinanceTransaction>  $transactions
     * @return array<int, array<string, mixed>>
     */
    private function amountPresets(Collection $transactions): array
    {
        return $transactions
            ->groupBy(fn (FinanceTransaction $transaction): string => $transaction->type.'|'.(string) (float) $transaction->amount)
            ->map(function (Collection $group): array {
                $latest = $this->latestTransaction($group);

                return [
                    'id' => $latest->type.'-amount-'.(int) round((float) $latest->amount),
                    'type' => $latest->type,
                    'amount' => (float) $latest->amount,
                    'usage_count' => $group->count(),
                    'last_used_at' => $latest->transaction_date?->toDateString(),
                ];
            })
            ->sortBy([
                ['usage_count', 'desc'],
                ['last_used_at', 'desc'],
            ])
            ->take(self::AMOUNT_LIMIT)
            ->values()
            ->all();
    }

    /**
     * @param  Collection<int, FinanceTransaction>  $transactions
     * @return array<string, mixed>
     */
    private function formatTitleSuggestion(Collection $transactions): array
    {
        $latest = $this->latestTransaction($transactions);
        $amount = $this->mostFrequentValue($transactions, fn (FinanceTransaction $transaction): float => (float) $transaction->amount);
        $categoryId = $this->mostFrequentValue($transactions, fn (FinanceTransaction $transaction): ?int => $transaction->category_id);
        $accountId = $this->mostFrequentValue($transactions, fn (FinanceTransaction $transaction): int => $transaction->financial_account_id);
        $needType = $this->mostFrequentValue($transactions, fn (FinanceTransaction $transaction): string => $transaction->need_type);
        $savingGoalId = $latest->type === 'saving'
            ? $this->mostFrequentValue($transactions, fn (FinanceTransaction $transaction): ?int => $transaction->saving_goal_id)
            : null;
        $sourceForAccount = $transactions->firstWhere('financial_account_id', $accountId) ?? $latest;
        $sourceForCategory = $transactions->firstWhere('category_id', $categoryId) ?? $latest;
        $sourceForSavingGoal = $savingGoalId ? ($transactions->firstWhere('saving_goal_id', $savingGoalId) ?? $latest) : null;

        return [
            'id' => $this->suggestionKey($latest),
            'type' => $latest->type,
            'merchant' => $latest->merchant,
            'category_id' => $categoryId,
            'category_name' => $sourceForCategory->category?->name,
            'financial_account_id' => $accountId,
            'account_label' => $sourceForAccount->account?->display_name ?? $sourceForAccount->account?->name,
            'amount' => $amount,
            'need_type' => $needType,
            'saving_goal_id' => $savingGoalId,
            'saving_goal_name' => $sourceForSavingGoal?->savingGoal?->name,
            'usage_count' => $transactions->count(),
            'last_used_at' => $latest->transaction_date?->toDateString(),
        ];
    }

    private function isUsableSuggestionSource(FinanceTransaction $transaction, array $activeSavingGoalIds): bool
    {
        if (! $transaction->account || ! $transaction->account->is_active || ! $transaction->category) {
            return false;
        }

        if (in_array($transaction->type, ['income', 'expense'], true) && $transaction->category->type !== $transaction->type) {
            return false;
        }

        if ($transaction->type === 'saving' && ! in_array($transaction->saving_goal_id, $activeSavingGoalIds, true)) {
            return false;
        }

        return filled($transaction->merchant);
    }

    /**
     * @param  Collection<int, FinanceTransaction>  $transactions
     */
    private function latestTransaction(Collection $transactions): FinanceTransaction
    {
        return $transactions
            ->sortByDesc(fn (FinanceTransaction $transaction): string => sprintf(
                '%s-%010d',
                $transaction->transaction_date?->toDateString() ?? '',
                $transaction->id,
            ))
            ->first();
    }

    /**
     * @param  Collection<int, FinanceTransaction>  $transactions
     */
    private function mostFrequentValue(Collection $transactions, callable $selector): mixed
    {
        return $transactions
            ->groupBy(fn (FinanceTransaction $transaction): string => (string) $selector($transaction))
            ->map(function (Collection $group) use ($selector): array {
                $latest = $this->latestTransaction($group);

                return [
                    'value' => $selector($latest),
                    'usage_count' => $group->count(),
                    'last_used_at' => $latest->transaction_date?->toDateString(),
                    'latest_id' => $latest->id,
                ];
            })
            ->sortBy([
                ['usage_count', 'desc'],
                ['last_used_at', 'desc'],
                ['latest_id', 'desc'],
            ])
            ->first()['value'];
    }

    private function suggestionKey(FinanceTransaction $transaction): string
    {
        return $transaction->type.'-'.Str::slug(Str::lower(trim((string) $transaction->merchant)));
    }
}
