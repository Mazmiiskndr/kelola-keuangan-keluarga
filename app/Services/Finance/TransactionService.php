<?php

namespace App\Services\Finance;

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
        return $this->database->transaction(function () use ($data) {
            $transaction = FinanceTransaction::query()->create($data);
            $this->balances->applyTransaction($transaction);

            return $transaction->load(['account', 'category']);
        });
    }

    public function delete(FinanceTransaction $transaction): void
    {
        $this->database->transaction(function () use ($transaction) {
            $this->balances->reverseTransaction($transaction);
            $transaction->delete();
        });
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function normalizePayload(array $data, int $userId): array
    {
        return [
            ...Arr::except($data, ['tags']),
            'user_id' => $userId,
            'tags' => filled($data['tags'] ?? null) ? array_map('trim', explode(',', (string) $data['tags'])) : null,
        ];
    }
}
