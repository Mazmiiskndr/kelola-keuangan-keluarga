<?php

namespace App\Services\Finance;

use App\Models\Transfer;
use Illuminate\Database\DatabaseManager;

class TransferService
{
    public function __construct(
        private readonly DatabaseManager $database,
        private readonly AccountBalanceService $balances,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Transfer
    {
        $this->balances->syncTransferAccounts($data);

        return $this->database->transaction(function () use ($data) {
            $this->balances->ensureTransferCanApply($data);

            $transfer = Transfer::query()->create($data);
            $this->balances->applyTransfer($transfer);

            return $transfer->load(['fromAccount', 'toAccount']);
        });
    }
}
