<?php

namespace App\Services\Finance;

use App\Enums\FamilyRole;
use App\Models\Family;
use App\Models\FamilyMember;
use App\Models\FinancialAccount;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class FamilyAccessService
{
    /**
     * @return Collection<int, Family>
     */
    public function activeFamilies(User $user): Collection
    {
        return Family::query()
            ->with('members.user')
            ->whereHas('members', fn ($query) => $query
                ->where('user_id', $user->id)
                ->where('status', 'active'))
            ->orderBy('name')
            ->get();
    }

    public function resolveForUser(User $user, mixed $familyId): ?Family
    {
        $query = Family::query()
            ->with('members.user')
            ->whereHas('members', fn ($memberQuery) => $memberQuery
                ->where('user_id', $user->id)
                ->where('status', 'active'));

        if ($familyId) {
            return $query->whereKey($familyId)->firstOrFail();
        }

        return $query->orderBy('name')->first();
    }

    public function membership(User $user, Family $family): ?FamilyMember
    {
        return $family->members
            ->first(fn (FamilyMember $member): bool => $member->user_id === $user->id && $member->status === 'active');
    }

    public function role(User $user, Family $family): ?string
    {
        return $this->membership($user, $family)?->role;
    }

    public function canManage(User $user, Family $family): bool
    {
        return in_array($this->role($user, $family), [FamilyRole::Admin->value], true)
            || $family->owner_user_id === $user->id;
    }

    public function canViewDetails(User $user, Family $family): bool
    {
        return $this->canManage($user, $family);
    }

    /**
     * @return array<int, int>
     */
    public function activeFamilyIds(User $user): array
    {
        return FamilyMember::query()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->pluck('family_id')
            ->values()
            ->all();
    }

    /**
     * @return Builder<FinancialAccount>
     */
    public function accessibleAccountQuery(User $user): Builder
    {
        $memberIds = $this->activeRelatedUserIds($user);

        return FinancialAccount::query()
            ->whereIn('user_id', $memberIds);
    }

    public function canUseAccount(User $user, FinancialAccount $account): bool
    {
        if ($account->user_id === $user->id) {
            return true;
        }

        return $this->sharedFamilyIdForAccount($user, $account) !== null;
    }

    public function sharedFamilyIdForAccount(User $user, FinancialAccount $account): ?int
    {
        if ($account->user_id === $user->id) {
            return $account->family_id;
        }

        $familyIds = $this->activeFamilyIds($user);

        if ($familyIds === []) {
            return null;
        }

        $familyId = FamilyMember::query()
            ->where('user_id', $account->user_id)
            ->where('status', 'active')
            ->whereIn('family_id', $familyIds)
            ->value('family_id');

        return $familyId ? (int) $familyId : null;
    }

    /**
     * @return array<int, int>
     */
    private function activeRelatedUserIds(User $user): array
    {
        $familyIds = $this->activeFamilyIds($user);

        if ($familyIds === []) {
            return [$user->id];
        }

        return FamilyMember::query()
            ->whereIn('family_id', $familyIds)
            ->where('status', 'active')
            ->pluck('user_id')
            ->push($user->id)
            ->unique()
            ->values()
            ->all();
    }

    /**
     * @return array<int, int>
     */
    public function activeMemberIds(Family $family): array
    {
        return $family->members
            ->where('status', 'active')
            ->pluck('user_id')
            ->values()
            ->all();
    }
}
