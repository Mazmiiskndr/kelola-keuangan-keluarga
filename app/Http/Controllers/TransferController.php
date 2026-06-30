<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransferRequest;
use App\Models\FinancialAccount;
use App\Services\Finance\TransferService;
use Illuminate\Http\RedirectResponse;

class TransferController extends Controller
{
    public function __construct(private readonly TransferService $transfers) {}

    public function store(StoreTransferRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $from = FinancialAccount::query()->where('user_id', $request->user()->id)->findOrFail($data['from_account_id']);
        $to = FinancialAccount::query()->where('user_id', $request->user()->id)->findOrFail($data['to_account_id']);

        $this->transfers->create([
            ...$data,
            'user_id' => $request->user()->id,
            'family_id' => $from->family_id ?? $to->family_id,
        ]);

        return back()->with('success', 'Transfer berhasil disimpan.');
    }
}
