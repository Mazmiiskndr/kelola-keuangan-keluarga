<?php

namespace App\Services\Finance;

use App\Models\Budget;
use App\Models\Category;
use App\Models\Debt;
use App\Models\Family;
use App\Models\FinanceTransaction;
use App\Models\FinancialAccount;
use App\Models\SavingGoal;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class GlobalSearchService
{
    public function __construct(
        private readonly FamilyAccessService $families,
    ) {}

    public function search(User $user, string $query, int $limit = 5): array
    {
        if (mb_strlen($query) < 2) {
            return [];
        }

        $familyIds = $this->families->activeFamilyIds($user);

        $results = [
            [
                'type' => 'transaction',
                'label' => 'Transaksi',
                'results' => $this->searchTransactions($user, $query, $familyIds, $limit),
            ],
            [
                'type' => 'account',
                'label' => 'Akun',
                'results' => $this->searchAccounts($user, $query, $limit),
            ],
            [
                'type' => 'category',
                'label' => 'Kategori',
                'results' => $this->searchCategories($user, $query, $familyIds, $limit),
            ],
            [
                'type' => 'budget',
                'label' => 'Budget',
                'results' => $this->searchBudgets($user, $query, $familyIds, $limit),
            ],
            [
                'type' => 'saving_goal',
                'label' => 'Tabungan',
                'results' => $this->searchSavingGoals($user, $query, $familyIds, $limit),
            ],
            [
                'type' => 'debt',
                'label' => 'Hutang',
                'results' => $this->searchDebts($user, $query, $familyIds, $limit),
            ],
            [
                'type' => 'family',
                'label' => 'Keluarga',
                'results' => $this->searchFamilies($user, $query, $limit),
            ],
        ];

        return array_values(array_filter($results, fn (array $group): bool => ! empty($group['results'])));
    }

    private function searchTransactions(User $user, string $query, array $familyIds, int $limit): array
    {
        return FinanceTransaction::query()
            ->with(['account', 'category'])
            ->where(function (Builder $q) use ($user, $familyIds) {
                $q->where('user_id', $user->id);
                if ($familyIds !== []) {
                    $q->orWhere(function (Builder $fq) use ($familyIds) {
                        $fq->whereIn('family_id', $familyIds)
                            ->where('visibility', 'family');
                    });
                }
            })
            ->where(function (Builder $q) use ($query) {
                $q->where('merchant', 'like', "%{$query}%")
                    ->orWhere('description', 'like', "%{$query}%")
                    ->orWhereHas('category', fn (Builder $cq) => $cq->where('name', 'like', "%{$query}%"))
                    ->orWhereHas('account', fn (Builder $aq) => $aq->where('name', 'like', "%{$query}%")->orWhere('bank_name', 'like', "%{$query}%"));
            })
            ->latest('transaction_date')
            ->limit($limit)
            ->get()
            ->map(function (FinanceTransaction $tx): array {
                $title = $tx->merchant ?: $tx->description ?: 'Transaksi';
                $description = $tx->description && $tx->description !== $title ? $tx->description : null;

                return [
                    'id' => $tx->id,
                    'type' => 'transaction',
                    'title' => $title,
                    'subtitle' => $tx->category?->name,
                    'description' => $description,
                    'badge' => $this->transactionTypeBadge($tx->type),
                    'amount' => (float) $tx->amount,
                    'date' => $tx->transaction_date?->toDateString(),
                    'href' => '/search?q='.urlencode($title).'&selected=transaction:'.$tx->id,
                    'detail_key' => 'transaction:'.$tx->id,
                ];
            })
            ->all();
    }

    private function searchAccounts(User $user, string $query, int $limit): array
    {
        return $this->families->accessibleAccountQuery($user)
            ->where('is_active', true)
            ->where(function (Builder $q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('bank_name', 'like', "%{$query}%")
                    ->orWhere('account_holder_name', 'like', "%{$query}%")
                    ->orWhere('account_number', 'like', "%{$query}%");
            })
            ->limit($limit)
            ->get()
            ->map(fn (FinancialAccount $acc): array => [
                'id' => $acc->id,
                'type' => 'account',
                'title' => $acc->display_name,
                'subtitle' => $this->accountTypeLabel($acc->type),
                'description' => $acc->account_number ? $this->maskAccountNumber($acc->account_number) : null,
                'badge' => $acc->is_active ? 'Aktif' : 'Nonaktif',
                'amount' => (float) $acc->current_balance,
                'date' => null,
                'href' => '/search?q='.urlencode($acc->name).'&selected=account:'.$acc->id,
                'detail_key' => 'account:'.$acc->id,
            ])
            ->all();
    }

    private function searchCategories(User $user, string $query, array $familyIds, int $limit): array
    {
        return Category::query()
            ->where(function (Builder $q) use ($user, $familyIds) {
                $q->where('user_id', $user->id);
                if ($familyIds !== []) {
                    $q->orWhereIn('family_id', $familyIds);
                }
            })
            ->where('name', 'like', "%{$query}%")
            ->limit($limit)
            ->get()
            ->map(fn (Category $cat): array => [
                'id' => $cat->id,
                'type' => 'category',
                'title' => $cat->name,
                'subtitle' => $cat->type === 'income' ? 'Pemasukan' : 'Pengeluaran',
                'description' => null,
                'badge' => null, // We will use color for icon instead in UI
                'amount' => null,
                'date' => null,
                'href' => '/search?q='.urlencode($cat->name).'&selected=category:'.$cat->id,
                'detail_key' => 'category:'.$cat->id,
            ])
            ->all();
    }

    private function searchBudgets(User $user, string $query, array $familyIds, int $limit): array
    {
        return Budget::query()
            ->with('category')
            ->where(function (Builder $q) use ($user, $familyIds) {
                $q->where('user_id', $user->id);
                if ($familyIds !== []) {
                    $q->orWhereIn('family_id', $familyIds);
                }
            })
            ->where(function (Builder $q) use ($query) {
                $q->whereHas('category', fn (Builder $cq) => $cq->where('name', 'like', "%{$query}%"))
                    ->orWhere('amount', 'like', "%{$query}%");
            })
            ->limit($limit)
            ->get()
            ->map(fn (Budget $budget): array => [
                'id' => $budget->id,
                'type' => 'budget',
                'title' => $budget->category?->name ?? 'Budget',
                'subtitle' => $budget->period_type,
                'description' => null,
                'badge' => null,
                'amount' => (float) $budget->amount,
                'date' => $budget->period_start?->toDateString(),
                'href' => '/search?q='.urlencode($budget->category?->name ?? 'Budget').'&selected=budget:'.$budget->id,
                'detail_key' => 'budget:'.$budget->id,
            ])
            ->all();
    }

    private function searchSavingGoals(User $user, string $query, array $familyIds, int $limit): array
    {
        return SavingGoal::query()
            ->with('account')
            ->where(function (Builder $q) use ($user, $familyIds) {
                $q->where('user_id', $user->id);
                if ($familyIds !== []) {
                    $q->orWhereIn('family_id', $familyIds);
                }
            })
            ->where('name', 'like', "%{$query}%")
            ->limit($limit)
            ->get()
            ->map(fn (SavingGoal $goal): array => [
                'id' => $goal->id,
                'type' => 'saving_goal',
                'title' => $goal->name,
                'subtitle' => $this->savingGoalStatusBadge($goal->status),
                'description' => null,
                'badge' => $this->savingGoalStatusBadge($goal->status),
                'amount' => (float) $goal->target_amount,
                'date' => $goal->target_date?->toDateString(),
                'href' => '/search?q='.urlencode($goal->name).'&selected=saving_goal:'.$goal->id,
                'detail_key' => 'saving_goal:'.$goal->id,
            ])
            ->all();
    }

    private function searchDebts(User $user, string $query, array $familyIds, int $limit): array
    {
        return Debt::query()
            ->where(function (Builder $q) use ($user, $familyIds) {
                $q->where('user_id', $user->id);
                if ($familyIds !== []) {
                    $q->orWhereIn('family_id', $familyIds);
                }
            })
            ->where(function (Builder $q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('lender', 'like', "%{$query}%");
            })
            ->limit($limit)
            ->get()
            ->map(fn (Debt $debt): array => [
                'id' => $debt->id,
                'type' => 'debt',
                'title' => $debt->name,
                'subtitle' => $debt->lender,
                'description' => null,
                'badge' => $this->debtStatusBadge($debt->status),
                'amount' => (float) $debt->outstanding_amount,
                'date' => $debt->next_due_date?->toDateString(),
                'href' => '/search?q='.urlencode($debt->name).'&selected=debt:'.$debt->id,
                'detail_key' => 'debt:'.$debt->id,
            ])
            ->all();
    }

    private function searchFamilies(User $user, string $query, int $limit): array
    {
        return $this->families->activeFamilies($user)
            ->filter(function (Family $family) use ($query) {
                $queryLower = strtolower($query);
                if (str_contains(strtolower($family->name), $queryLower)) {
                    return true;
                }
                foreach ($family->members as $member) {
                    if ($member->user && (str_contains(strtolower($member->user->name), $queryLower) || str_contains(strtolower($member->user->email), $queryLower))) {
                        return true;
                    }
                }

                return false;
            })
            ->take($limit)
            ->map(function (Family $family) use ($user): array {
                $role = $this->families->role($user, $family);
                $memberCount = $family->members->count();

                return [
                    'id' => $family->id,
                    'type' => 'family',
                    'title' => $family->name,
                    'subtitle' => "{$memberCount} anggota",
                    'description' => null,
                    'badge' => ucfirst((string) $role),
                    'amount' => null,
                    'date' => null,
                    'href' => '/search?q='.urlencode($family->name).'&selected=family:'.$family->id,
                    'detail_key' => 'family:'.$family->id,
                ];
            })
            ->values()
            ->all();
    }

    private function maskAccountNumber(?string $number): string
    {
        if (! $number) {
            return '';
        }

        if (strlen($number) < 4) {
            return '****';
        }

        return '**** '.substr($number, -4);
    }

    private function transactionTypeBadge(string $type): string
    {
        return match ($type) {
            'income' => 'Pemasukan',
            'expense' => 'Pengeluaran',
            'saving' => 'Tabungan',
            default => ucfirst($type),
        };
    }

    private function debtStatusBadge(string $status): string
    {
        return match ($status) {
            'active' => 'Aktif',
            'paid_off' => 'Lunas',
            'paused' => 'Dijeda',
            default => ucfirst($status),
        };
    }

    private function savingGoalStatusBadge(string $status): string
    {
        return match ($status) {
            'active' => 'Aktif',
            'completed' => 'Tercapai',
            'cancelled' => 'Dibatalkan',
            default => ucfirst($status),
        };
    }

    private function accountTypeLabel(string $type): string
    {
        return match ($type) {
            'cash' => 'Tunai',
            'bank' => 'Bank',
            'e_wallet' => 'E-Wallet',
            'credit_card' => 'Kartu Kredit',
            'loan' => 'Pinjaman',
            'investment' => 'Investasi',
            'saving_goal' => 'Tabungan',
            default => ucfirst(str_replace('_', ' ', $type)),
        };
    }
}
