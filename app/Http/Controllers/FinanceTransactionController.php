<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFinanceTransactionRequest;
use App\Models\Category;
use App\Models\FinanceTransaction;
use App\Models\FinancialAccount;
use App\Services\Finance\CategoryBootstrapService;
use App\Services\Finance\TransactionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FinanceTransactionController extends Controller
{
    public function __construct(
        private readonly TransactionService $transactions,
        private readonly CategoryBootstrapService $categories,
    ) {}

    public function index(Request $request): Response
    {
        $this->categories->ensureDefaults($request->user());

        return Inertia::render('transactions/index', [
            'transactions' => FinanceTransaction::query()
                ->with(['account', 'category'])
                ->where('user_id', $request->user()->id)
                ->latest('transaction_date')
                ->paginate(20)
                ->withQueryString(),
            'accounts' => FinancialAccount::query()->where('user_id', $request->user()->id)->where('is_active', true)->get(),
            'categories' => Category::query()->where('user_id', $request->user()->id)->orderBy('type')->orderBy('name')->get(),
        ]);
    }

    public function store(StoreFinanceTransactionRequest $request): RedirectResponse
    {
        $payload = $this->transactions->normalizePayload($request->validated(), $request->user()->id);
        $account = FinancialAccount::query()->where('user_id', $request->user()->id)->findOrFail($payload['financial_account_id']);
        $category = Category::query()->where('user_id', $request->user()->id)->findOrFail($payload['category_id']);

        $payload['family_id'] = $account->family_id;
        $payload['category_id'] = $category->id;

        $this->transactions->create($payload);

        return back()->with('success', 'Transaksi berhasil disimpan.');
    }

    public function destroy(Request $request, FinanceTransaction $transaction): RedirectResponse
    {
        abort_unless($transaction->user_id === $request->user()->id, 403);

        $this->transactions->delete($transaction);

        return back()->with('success', 'Transaksi berhasil dihapus.');
    }
}
