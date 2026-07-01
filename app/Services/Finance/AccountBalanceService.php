<?php

namespace App\Services\Finance;

use App\Enums\TransactionType;
use App\Models\FinanceTransaction;
use App\Models\FinancialAccount;
use App\Models\SavingGoal;
use App\Models\Transfer;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class AccountBalanceService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function ensureTransactionCanApply(array $data): void
    {
        $type = (string) ($data['type'] ?? '');
        $accountId = (int) ($data['financial_account_id'] ?? 0);
        $amount = (float) ($data['amount'] ?? 0);

        if ($type === TransactionType::Expense->value) {
            $account = $this->recalculateCurrentBalance(
                FinancialAccount::query()->lockForUpdate()->findOrFail($accountId)
            );
            $this->ensureSufficientBalance($account, $amount);

            return;
        }

        if ($type !== TransactionType::Saving->value) {
            return;
        }

        $source = $this->recalculateCurrentBalance(
            FinancialAccount::query()->lockForUpdate()->findOrFail($accountId)
        );
        $savingGoal = SavingGoal::query()->lockForUpdate()->findOrFail($data['saving_goal_id']);

        if ($savingGoal->financial_account_id && $savingGoal->financial_account_id !== $source->id) {
            $this->ensureSufficientBalance($source, $amount);
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function syncTransactionAccounts(array $data): void
    {
        $type = (string) ($data['type'] ?? '');

        if (! in_array($type, [TransactionType::Expense->value, TransactionType::Saving->value], true)) {
            return;
        }

        $this->recalculateCurrentBalance(
            FinancialAccount::query()->findOrFail($data['financial_account_id'])
        );
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function ensureTransferCanApply(array $data): void
    {
        $from = $this->recalculateCurrentBalance(
            FinancialAccount::query()->lockForUpdate()->findOrFail($data['from_account_id'])
        );

        $this->ensureSufficientBalance($from, (float) ($data['amount'] ?? 0));
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function syncTransferAccounts(array $data): void
    {
        $this->recalculateCurrentBalance(
            FinancialAccount::query()->findOrFail($data['from_account_id'])
        );
    }

    public function recalculateCurrentBalance(FinancialAccount $account): FinancialAccount
    {
        $lockedAccount = FinancialAccount::query()->lockForUpdate()->findOrFail($account->id);
        $balance = (float) $lockedAccount->initial_balance;

        $transactions = FinanceTransaction::query()
            ->with('savingGoal:id,financial_account_id')
            ->where('financial_account_id', $lockedAccount->id)
            ->orWhereHas('savingGoal', function ($query) use ($lockedAccount) {
                $query->where('financial_account_id', $lockedAccount->id);
            })
            ->oldest('id')
            ->get();

        foreach ($transactions as $transaction) {
            $balance += $this->transactionBalanceDelta($transaction, $lockedAccount);
        }

        $balance -= (float) Transfer::query()
            ->where('from_account_id', $lockedAccount->id)
            ->sum('amount');

        $balance += (float) Transfer::query()
            ->where('to_account_id', $lockedAccount->id)
            ->sum('amount');

        $lockedAccount->forceFill(['current_balance' => $balance])->save();

        return $lockedAccount;
    }

    /**
     * @return Collection<int, FinancialAccount>
     */
    public function affectedAccountsForTransaction(FinanceTransaction $transaction): Collection
    {
        $accounts = collect([$transaction->account()->firstOrFail()]);

        if ($transaction->type !== TransactionType::Saving->value) {
            return $accounts;
        }

        $savingGoal = $transaction->savingGoal()->first();

        if (! $savingGoal?->financial_account_id || $savingGoal->financial_account_id === $transaction->financial_account_id) {
            return $accounts;
        }

        return $accounts
            ->push(FinancialAccount::query()->findOrFail($savingGoal->financial_account_id))
            ->unique('id')
            ->values();
    }

    /**
     * @return Collection<int, SavingGoal>
     */
    public function affectedSavingGoalsForTransaction(FinanceTransaction $transaction): Collection
    {
        if ($transaction->type !== TransactionType::Saving->value || ! $transaction->saving_goal_id) {
            return collect();
        }

        return collect([SavingGoal::query()->findOrFail($transaction->saving_goal_id)]);
    }

    public function ensureNonNegativeBalance(FinancialAccount $account): void
    {
        if ((float) $account->current_balance >= 0) {
            return;
        }

        throw ValidationException::withMessages([
            'amount' => 'Saldo akun tidak cukup untuk transaksi ini.',
        ]);
    }

    public function recalculateSavingGoal(SavingGoal $savingGoal): SavingGoal
    {
        $currentAmount = (float) FinanceTransaction::query()
            ->where('type', TransactionType::Saving->value)
            ->where('saving_goal_id', $savingGoal->id)
            ->sum('amount');

        $savingGoal->forceFill(['current_amount' => $currentAmount])->save();

        return $savingGoal;
    }

    public function applyTransaction(FinanceTransaction $transaction): void
    {
        if ($transaction->type === TransactionType::Saving->value) {
            $this->applySavingTransaction($transaction);

            return;
        }

        $account = $transaction->account()->lockForUpdate()->firstOrFail();
        $delta = (float) $transaction->amount;

        if ($transaction->type === TransactionType::Expense->value) {
            $this->ensureSufficientBalance($account, $delta);
            $delta *= -1;
        }

        $this->adjust($account, $delta);
    }

    public function reverseTransaction(FinanceTransaction $transaction): void
    {
        if ($transaction->type === TransactionType::Saving->value) {
            $this->reverseSavingTransaction($transaction);

            return;
        }

        $account = $transaction->account()->lockForUpdate()->firstOrFail();
        $delta = (float) $transaction->amount;

        if ($transaction->type === TransactionType::Income->value) {
            $delta *= -1;
        }

        $this->adjust($account, $delta);
    }

    private function applySavingTransaction(FinanceTransaction $transaction): void
    {
        $source = $transaction->account()->lockForUpdate()->firstOrFail();
        $savingGoal = $transaction->savingGoal()->lockForUpdate()->firstOrFail();
        $amount = (float) $transaction->amount;

        if ($savingGoal->financial_account_id && $savingGoal->financial_account_id !== $source->id) {
            $target = FinancialAccount::query()->lockForUpdate()->findOrFail($savingGoal->financial_account_id);

            $this->ensureSufficientBalance($source, $amount);
            $this->adjust($source, -1 * $amount);
            $this->adjust($target, $amount);
        }

        $savingGoal->forceFill([
            'current_amount' => (float) $savingGoal->current_amount + $amount,
        ])->save();
    }

    private function reverseSavingTransaction(FinanceTransaction $transaction): void
    {
        $source = $transaction->account()->lockForUpdate()->firstOrFail();
        $savingGoal = $transaction->savingGoal()->lockForUpdate()->firstOrFail();
        $amount = (float) $transaction->amount;

        if ($savingGoal->financial_account_id && $savingGoal->financial_account_id !== $source->id) {
            $target = FinancialAccount::query()->lockForUpdate()->findOrFail($savingGoal->financial_account_id);

            $this->adjust($source, $amount);
            $this->adjust($target, -1 * $amount);
        }

        $savingGoal->forceFill([
            'current_amount' => max(0, (float) $savingGoal->current_amount - $amount),
        ])->save();
    }

    public function applyTransfer(Transfer $transfer): void
    {
        $from = FinancialAccount::query()->lockForUpdate()->findOrFail($transfer->from_account_id);
        $to = FinancialAccount::query()->lockForUpdate()->findOrFail($transfer->to_account_id);

        $this->ensureSufficientBalance($from, (float) $transfer->amount);
        $this->adjust($from, -1 * (float) $transfer->amount);
        $this->adjust($to, (float) $transfer->amount);
    }

    private function ensureSufficientBalance(FinancialAccount $account, float $amount): void
    {
        if ((float) $account->current_balance >= $amount) {
            return;
        }

        throw ValidationException::withMessages([
            'amount' => 'Saldo akun tidak cukup untuk transaksi ini.',
        ]);
    }

    private function adjust(FinancialAccount $account, float $amount): void
    {
        $account->forceFill([
            'current_balance' => (float) $account->current_balance + $amount,
        ])->save();
    }

    private function transactionBalanceDelta(FinanceTransaction $transaction, FinancialAccount $account): float
    {
        $amount = (float) $transaction->amount;

        if ($transaction->type === TransactionType::Income->value && $transaction->financial_account_id === $account->id) {
            return $amount;
        }

        if ($transaction->type === TransactionType::Expense->value && $transaction->financial_account_id === $account->id) {
            return -1 * $amount;
        }

        if ($transaction->type !== TransactionType::Saving->value) {
            return 0;
        }

        $targetAccountId = $transaction->savingGoal?->financial_account_id;

        if (! $targetAccountId || $targetAccountId === $transaction->financial_account_id) {
            return 0;
        }

        if ($transaction->financial_account_id === $account->id) {
            return -1 * $amount;
        }

        if ($targetAccountId === $account->id) {
            return $amount;
        }

        return 0;
    }
}
