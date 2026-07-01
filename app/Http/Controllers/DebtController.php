<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDebtPaymentRequest;
use App\Http\Requests\StoreDebtRequest;
use App\Models\Category;
use App\Models\Debt;
use App\Models\FinancialAccount;
use App\Services\Finance\DebtDueNotificationService;
use App\Services\Finance\DebtPaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DebtController extends Controller
{
    public function __construct(
        private readonly DebtPaymentService $payments,
        private readonly DebtDueNotificationService $notifications,
    ) {}

    public function index(Request $request): Response
    {
        return Inertia::render('debts/index', [
            'debts' => Debt::query()->with(['paymentAccount', 'category', 'payments'])->where('user_id', $request->user()->id)->latest()->get(),
            'accounts' => FinancialAccount::query()->where('user_id', $request->user()->id)->where('is_active', true)->get(),
            'categories' => Category::query()->where('user_id', $request->user()->id)->where('type', 'expense')->orderBy('name')->get(),
        ]);
    }

    public function store(StoreDebtRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $debt = Debt::query()->create([
            ...$data,
            'user_id' => $request->user()->id,
            'outstanding_amount' => $data['outstanding_amount'] ?? $data['principal_amount'],
            'minimum_payment' => $data['minimum_payment'] ?? $data['monthly_payment'],
            'status' => 'active',
        ]);

        $this->notifications->notify($debt);

        return back()->with('success', 'Hutang berhasil disimpan.');
    }

    public function update(StoreDebtRequest $request, Debt $debt): RedirectResponse
    {
        abort_unless($debt->user_id === $request->user()->id, 403);

        $data = $request->validated();

        $debt->update([
            ...$data,
            'outstanding_amount' => $data['outstanding_amount'] ?? $data['principal_amount'],
            'minimum_payment' => $data['minimum_payment'] ?? $data['monthly_payment'],
        ]);

        $this->notifications->notify($debt->refresh());

        return back()->with('success', 'Hutang berhasil diperbarui.');
    }

    public function pay(StoreDebtPaymentRequest $request, Debt $debt): RedirectResponse
    {
        abort_unless($debt->user_id === $request->user()->id, 403);

        $this->payments->pay($debt, $request->validated());

        return back()->with('success', 'Pembayaran hutang berhasil dicatat.');
    }

    public function destroy(Request $request, Debt $debt): RedirectResponse
    {
        abort_unless($debt->user_id === $request->user()->id, 403);

        $debt->delete();

        return back()->with('success', 'Hutang berhasil diarsipkan.');
    }
}
