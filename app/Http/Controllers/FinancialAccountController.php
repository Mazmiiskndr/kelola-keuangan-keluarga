<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFinancialAccountRequest;
use App\Models\FinancialAccount;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FinancialAccountController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('accounts/index', [
            'accounts' => FinancialAccount::query()
                ->where('user_id', $request->user()->id)
                ->latest()
                ->get(),
        ]);
    }

    public function store(StoreFinancialAccountRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $accountName = filled($data['name'] ?? null) ? $data['name'] : $data['bank_name'].' - '.$data['account_holder_name'];

        FinancialAccount::query()->create([
            ...$data,
            'user_id' => $request->user()->id,
            'name' => $accountName,
            'currency' => $data['currency'] ?? 'IDR',
            'current_balance' => $data['initial_balance'],
            'is_active' => true,
        ]);

        return back()->with('success', 'Akun keuangan berhasil dibuat.');
    }

    public function update(StoreFinancialAccountRequest $request, FinancialAccount $account): RedirectResponse
    {
        abort_unless($account->user_id === $request->user()->id, 403);

        $data = $request->validated();
        $accountName = filled($data['name'] ?? null) ? $data['name'] : $data['bank_name'].' - '.$data['account_holder_name'];
        $balanceDelta = (float) $data['initial_balance'] - (float) $account->initial_balance;

        $account->update([
            ...$data,
            'name' => $accountName,
            'currency' => $data['currency'] ?? 'IDR',
            'current_balance' => (float) $account->current_balance + $balanceDelta,
        ]);

        return back()->with('success', 'Akun keuangan berhasil diperbarui.');
    }

    public function destroy(Request $request, FinancialAccount $account): RedirectResponse
    {
        abort_unless($account->user_id === $request->user()->id, 403);

        $account->forceFill(['is_active' => false])->save();
        $account->delete();

        return back()->with('success', 'Akun keuangan berhasil diarsipkan.');
    }
}
