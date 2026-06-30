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
        $account = $transaction->account()->lockForUpdate()->firstOrFail();
        $delta = (float) $transaction->amount;

        if ($transaction->type === TransactionType::Expense->value) {
            $delta *= -1;
        }

        $this->adjust($account, $delta);
    }

    public function reverseTransaction(FinanceTransaction $transaction): void
    {
        $account = $transaction->account()->lockForUpdate()->firstOrFail();
        $delta = (float) $transaction->amount;

        if ($transaction->type === TransactionType::Income->value) {
            $delta *= -1;
        }

        $this->adjust($account, $delta);
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
