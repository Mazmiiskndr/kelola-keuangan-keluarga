<?php

namespace App\Services\Finance;

use App\Enums\TransactionType;
use App\Models\FinanceTransaction;
use Illuminate\Database\DatabaseManager;
use Illuminate\Support\Arr;

class TransactionService
{
    public function __construct(
        private readonly DatabaseManager $database,
        private readonly AccountBalanceService $balances,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): FinanceTransaction
    {
        $this->balances->syncTransactionAccounts($data);

        return $this->database->transaction(function () use ($data) {
            $this->balances->ensureTransactionCanApply($data);

            $transaction = FinanceTransaction::query()->create($data);
            $this->balances->applyTransaction($transaction);

            return $transaction->load(['account', 'category']);
        });
    }

    public function delete(FinanceTransaction $transaction): void
    {
        $this->database->transaction(function () use ($transaction) {
            $affectedAccounts = $this->balances->affectedAccountsForTransaction($transaction);

            $this->balances->reverseTransaction($transaction);
            $transaction->delete();

            $affectedAccounts->each(fn ($account) => $this->balances->recalculateCurrentBalance($account));
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(FinanceTransaction $transaction, array $data): FinanceTransaction
    {
        $this->balances->syncTransactionAccounts($data);

        return $this->database->transaction(function () use ($transaction, $data) {
            $oldAffectedAccounts = $this->balances->affectedAccountsForTransaction($transaction);
            $oldAffectedSavingGoals = $this->balances->affectedSavingGoalsForTransaction($transaction);

            $transaction->forceFill($data)->save();

            $newAffectedAccounts = $this->balances->affectedAccountsForTransaction($transaction);
            $newAffectedSavingGoals = $this->balances->affectedSavingGoalsForTransaction($transaction);

            $oldAffectedAccounts
                ->merge($newAffectedAccounts)
                ->unique('id')
                ->each(function ($account) {
                    $account = $this->balances->recalculateCurrentBalance($account);
                    $this->balances->ensureNonNegativeBalance($account);
                });

            $oldAffectedSavingGoals
                ->merge($newAffectedSavingGoals)
                ->unique('id')
                ->each(fn ($savingGoal) => $this->balances->recalculateSavingGoal($savingGoal));

            return $transaction->load(['account', 'category', 'savingGoal.account']);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function normalizePayload(array $data, int $userId): array
    {
        $payload = [
            ...Arr::except($data, ['tags']),
            'user_id' => $userId,
            'tags' => filled($data['tags'] ?? null) ? array_map('trim', explode(',', (string) $data['tags'])) : null,
        ];

        if (isset($payload['type']) && $payload['type'] !== TransactionType::Saving->value) {
            $payload['saving_goal_id'] = null;
        }

        return $payload;
    }
}
