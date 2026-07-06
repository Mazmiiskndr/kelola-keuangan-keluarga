<?php

namespace App\Http\Controllers;

use App\Enums\TransactionType;
use App\Enums\Visibility;
use App\Http\Requests\StoreFinanceTransactionRequest;
use App\Models\Category;
use App\Models\FinanceTransaction;
use App\Models\FinancialAccount;
use App\Models\SavingGoal;
use App\Services\Finance\CategoryBootstrapService;
use App\Services\Finance\FamilyAccessService;
use App\Services\Finance\TransactionService;
use App\Services\Finance\TransactionSuggestionService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FinanceTransactionController extends Controller
{
    public function __construct(
        private readonly TransactionService $transactions,
        private readonly TransactionSuggestionService $suggestions,
        private readonly CategoryBootstrapService $categories,
        private readonly FamilyAccessService $families,
    ) {}

    public function index(Request $request): Response
    {
        $this->categories->ensureDefaults($request->user());
        $user = $request->user();
        $familyIds = $this->families->activeFamilyIds($user);
        $selectedType = $this->selectedTransactionType($request);

        return Inertia::render('transactions/index', [
            'transactions' => FinanceTransaction::query()
                ->with(['account', 'category', 'savingGoal.account', 'user:id,name,email'])
                ->where(function (Builder $query) use ($user, $familyIds) {
                    $query->where('user_id', $user->id);

                    if ($familyIds !== []) {
                        $query->orWhere(function (Builder $familyQuery) use ($familyIds) {
                            $familyQuery
                                ->whereIn('family_id', $familyIds)
                                ->where('visibility', Visibility::Family->value);
                        });
                    }
                })
                ->when($selectedType !== 'all', fn ($query) => $query->where('type', $selectedType))
                ->latest('transaction_date')
                ->latest('id')
                ->paginate(10)
                ->withQueryString()
                ->through(fn (FinanceTransaction $transaction): array => [
                    ...$transaction->toArray(),
                    'can_edit' => $transaction->user_id === $user->id,
                    'can_delete' => $transaction->user_id === $user->id,
                ]),
            'accounts' => $this->families->accessibleAccountQuery($user)
                ->with('user:id,name,email')
                ->where('is_active', true)
                ->latest()
                ->get(),
            'categories' => Category::query()->where('user_id', $user->id)->orderBy('type')->orderBy('name')->get(),
            'savingGoals' => SavingGoal::query()
                ->with('account')
                ->where('user_id', $user->id)
                ->where('status', 'active')
                ->latest()
                ->get(),
            'suggestions' => $this->suggestions->forUser($user),
            'filters' => [
                'type' => $selectedType,
            ],
        ]);
    }

    private function selectedTransactionType(Request $request): string
    {
        $type = $request->string('type')->toString();
        $allowedTypes = collect(TransactionType::cases())->map->value->all();

        return in_array($type, $allowedTypes, true) ? $type : 'all';
    }

    public function store(StoreFinanceTransactionRequest $request): RedirectResponse
    {
        $payload = $this->validatedPayload($request);

        $this->transactions->create($payload);

        return back()->with('success', 'Transaksi berhasil disimpan.');
    }

    public function update(StoreFinanceTransactionRequest $request, FinanceTransaction $transaction): RedirectResponse
    {
        abort_unless($transaction->user_id === $request->user()->id, 403);

        $payload = $this->validatedPayload($request);

        $this->transactions->update($transaction, $payload);

        return back()->with('success', 'Transaksi berhasil diperbarui.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedPayload(StoreFinanceTransactionRequest $request): array
    {
        $payload = $this->transactions->normalizePayload($request->validated(), $request->user()->id);
        $account = FinancialAccount::query()->findOrFail($payload['financial_account_id']);

        abort_unless($this->families->canUseAccount($request->user(), $account), 403);

        $category = $payload['type'] === 'saving'
            ? $this->savingCategory($request)
            : Category::query()->where('user_id', $request->user()->id)->findOrFail($payload['category_id']);
        $familyId = $this->families->sharedFamilyIdForAccount($request->user(), $account);

        if ($payload['type'] === 'saving') {
            SavingGoal::query()
                ->where('user_id', $request->user()->id)
                ->where('status', 'active')
                ->findOrFail($payload['saving_goal_id']);
        }

        $payload['family_id'] = $familyId;
        $payload['visibility'] = $familyId && ($account->visibility === Visibility::Family->value || $account->user_id !== $request->user()->id)
            ? Visibility::Family->value
            : $payload['visibility'];
        $payload['category_id'] = $category->id;

        return $payload;
    }

    private function savingCategory(Request $request): Category
    {
        return Category::query()->firstOrCreate(
            [
                'user_id' => $request->user()->id,
                'name' => 'Tabungan',
            ],
            [
                'type' => 'expense',
                'color' => '#14b8a6',
                'icon' => 'PiggyBank',
                'is_default' => true,
                'is_essential' => false,
                'is_savable' => false,
                'is_lifestyle' => false,
            ],
        );
    }

    public function destroy(Request $request, FinanceTransaction $transaction): RedirectResponse
    {
        abort_unless($transaction->user_id === $request->user()->id, 403);

        $this->transactions->delete($transaction);

        return back()->with('success', 'Transaksi berhasil dihapus.');
    }
}
