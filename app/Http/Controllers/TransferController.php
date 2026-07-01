<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransferRequest;
use App\Models\FinancialAccount;
use App\Services\Finance\FamilyAccessService;
use App\Services\Finance\TransferService;
use Illuminate\Http\RedirectResponse;

class TransferController extends Controller
{
    public function __construct(
        private readonly TransferService $transfers,
        private readonly FamilyAccessService $families,
    ) {}

    public function store(StoreTransferRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $from = FinancialAccount::query()->findOrFail($data['from_account_id']);
        $to = FinancialAccount::query()->findOrFail($data['to_account_id']);

        abort_unless($this->families->canUseAccount($request->user(), $from), 403);
        abort_unless($this->families->canUseAccount($request->user(), $to), 403);

        $this->transfers->create([
            ...$data,
            'user_id' => $request->user()->id,
            'family_id' => $this->families->sharedFamilyIdForAccount($request->user(), $from)
                ?? $this->families->sharedFamilyIdForAccount($request->user(), $to),
        ]);

        return back()->with('success', 'Transfer berhasil disimpan.');
    }
}
