<?php

namespace App\Services\Finance;

use App\Enums\TransactionType;
use App\Models\FinanceTransaction;
use App\Models\FinancialAccount;
use App\Models\Transfer;

class AccountBalanceService
{
    public function applyTransaction(FinanceTransaction $transaction): void
    {
        if ($transaction->type === TransactionType::Saving->value) {
            $this->applySavingTransaction($transaction);

            return;
        }

        $account = $transaction->account()->lockForUpdate()->firstOrFail();
        $delta = (float) $transaction->amount;

        if ($transaction->type === TransactionType::Expense->value) {
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

        $this->adjust($from, -1 * (float) $transfer->amount);
        $this->adjust($to, (float) $transfer->amount);
    }

    private function adjust(FinancialAccount $account, float $amount): void
    {
        $account->forceFill([
            'current_balance' => (float) $account->current_balance + $amount,
        ])->save();
    }
}
