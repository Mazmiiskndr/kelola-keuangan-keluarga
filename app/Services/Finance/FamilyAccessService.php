<?php

namespace App\Services\Finance;

use App\Enums\FamilyRole;
use App\Models\Family;
use App\Models\FamilyMember;
use App\Models\User;
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
    public function activeMemberIds(Family $family): array
    {
        return $family->members
            ->where('status', 'active')
            ->pluck('user_id')
            ->values()
            ->all();
    }
}
