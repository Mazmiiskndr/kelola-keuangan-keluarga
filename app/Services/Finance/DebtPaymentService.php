<?php

namespace App\Services\Finance;

use App\Enums\NeedType;
use App\Enums\TransactionType;
use App\Enums\Visibility;
use App\Models\Debt;
use App\Models\DebtPayment;
use Illuminate\Database\DatabaseManager;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class DebtPaymentService
{
    public function __construct(
        private readonly DatabaseManager $database,
        private readonly TransactionService $transactions,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function pay(Debt $debt, array $data): DebtPayment
    {
        return $this->database->transaction(function () use ($debt, $data) {
            $amount = (float) $data['amount'];

            if ($amount <= 0) {
                throw ValidationException::withMessages(['amount' => 'Nominal pembayaran harus lebih dari 0.']);
            }

            $paymentAccountId = $data['payment_account_id'] ?? $debt->payment_account_id;
            $categoryId = $data['category_id'] ?? $debt->category_id;

            if (blank($paymentAccountId)) {
                throw ValidationException::withMessages(['payment_account_id' => 'Akun pembayaran wajib dipilih.']);
            }

            if (blank($categoryId)) {
                throw ValidationException::withMessages(['category_id' => 'Kategori pembayaran hutang wajib dipilih.']);
            }

            $transaction = $this->transactions->create([
                'user_id' => $debt->user_id,
                'family_id' => $debt->family_id,
                'financial_account_id' => $paymentAccountId,
                'category_id' => $categoryId,
                'type' => TransactionType::Expense->value,
                'amount' => $amount,
                'transaction_date' => $data['paid_at'] ?? now()->toDateString(),
                'description' => 'Pembayaran hutang: '.$debt->name,
                'merchant' => $debt->lender,
                'visibility' => $data['visibility'] ?? Visibility::Private->value,
                'need_type' => NeedType::Essential->value,
                'metadata' => ['debt_id' => $debt->id],
            ]);

            $principal = (float) ($data['principal_amount'] ?? $amount);
            $debt->forceFill([
                'outstanding_amount' => max(0, (float) $debt->outstanding_amount - $principal),
                'remaining_tenor_months' => $debt->remaining_tenor_months ? max(0, $debt->remaining_tenor_months - 1) : null,
                'status' => ((float) $debt->outstanding_amount - $principal) <= 0 ? 'paid_off' : $debt->status,
            ])->save();

            return DebtPayment::query()->create([
                'debt_id' => $debt->id,
                'user_id' => $debt->user_id,
                'family_id' => $debt->family_id,
                'finance_transaction_id' => $transaction->id,
                'payment_account_id' => $transaction->financial_account_id,
                'amount' => $amount,
                'principal_amount' => $principal,
                'interest_amount' => $data['interest_amount'] ?? 0,
                'fee_amount' => $data['fee_amount'] ?? 0,
                'due_date' => $data['due_date'] ?? $debt->next_due_date,
                'paid_at' => Carbon::parse($data['paid_at'] ?? now()),
                'status' => 'paid',
                'notes' => $data['notes'] ?? null,
            ])->load(['debt', 'transaction']);
        });
    }
}
