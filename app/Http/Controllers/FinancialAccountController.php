<?php

namespace App\Http\Controllers;

use App\Enums\Visibility;
use App\Http\Requests\StoreFinancialAccountRequest;
use App\Models\Family;
use App\Models\FinancialAccount;
use App\Services\Finance\AccountBalanceService;
use App\Services\Finance\FamilyAccessService;
use Illuminate\Database\DatabaseManager;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class FinancialAccountController extends Controller
{
    public function __construct(
        private readonly DatabaseManager $database,
        private readonly AccountBalanceService $balances,
        private readonly FamilyAccessService $families,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('accounts/index', [
            'accounts' => $this->families->accessibleAccountQuery($user)
                ->with('user:id,name,email')
                ->latest()
                ->get()
                ->map(fn (FinancialAccount $account): array => [
                    ...$account->toArray(),
                    'owner' => $account->user ? [
                        'id' => $account->user->id,
                        'name' => $account->user->name,
                        'email' => $account->user->email,
                    ] : null,
                    'can_edit' => $this->families->canUseAccount($user, $account),
                    'can_delete' => $account->user_id === $user->id,
                ]),
            'families' => $this->families->activeFamilies($user)->map(fn (Family $family): array => [
                'id' => $family->id,
                'name' => $family->name,
                'currency' => $family->currency,
                'owner_user_id' => $family->owner_user_id,
            ]),
        ]);
    }

    public function store(StoreFinancialAccountRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['family_id'] = $this->resolveFamilyId($request, $data);
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
        abort_unless($this->families->canUseAccount($request->user(), $account), 403);

        $data = $request->validated();
        $data['family_id'] = $account->user_id === $request->user()->id
            ? $this->resolveFamilyId($request, $data)
            : $account->family_id;
        $data['visibility'] = $account->user_id === $request->user()->id
            ? $data['visibility']
            : $account->visibility;
        $accountName = filled($data['name'] ?? null) ? $data['name'] : $data['bank_name'].' - '.$data['account_holder_name'];

        $this->database->transaction(function () use ($account, $data, $accountName) {
            $account->update([
                ...$data,
                'name' => $accountName,
                'currency' => $data['currency'] ?? 'IDR',
            ]);

            $this->balances->recalculateCurrentBalance($account);
        });

        return back()->with('success', 'Akun keuangan berhasil diperbarui.');
    }

    public function destroy(Request $request, FinancialAccount $account): RedirectResponse
    {
        abort_unless($account->user_id === $request->user()->id, 403);

        $account->forceFill(['is_active' => false])->save();
        $account->delete();

        return back()->with('success', 'Akun keuangan berhasil diarsipkan.');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function resolveFamilyId(Request $request, array $data): ?int
    {
        if (($data['visibility'] ?? null) !== Visibility::Family->value) {
            return null;
        }

        $family = $this->families->resolveForUser($request->user(), $data['family_id'] ?? null);

        if (! $family) {
            throw ValidationException::withMessages([
                'family_id' => 'Pilih keluarga untuk rekening bersama.',
            ]);
        }

        return $family->id;
    }
}
