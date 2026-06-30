<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFamilyMemberRequest;
use App\Models\Family;
use App\Models\FamilyMember;
use App\Models\User;
use App\Services\Finance\FamilyAccessService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FamilyMemberController extends Controller
{
    public function __construct(private readonly FamilyAccessService $families) {}

    public function store(StoreFamilyMemberRequest $request, Family $family): RedirectResponse
    {
        abort_unless($this->families->canManage($request->user(), $family->load('members')), 403);

        $memberUser = User::query()->where('email', $request->validated('email'))->firstOrFail();

        FamilyMember::query()->updateOrCreate(
            [
                'family_id' => $family->id,
                'user_id' => $memberUser->id,
            ],
            [
                'role' => $request->validated('role'),
                'status' => 'active',
                'joined_at' => now(),
            ],
        );

        return back()->with('success', 'Anggota keluarga berhasil ditambahkan.');
    }

    public function destroy(Request $request, Family $family, FamilyMember $member): RedirectResponse
    {
        abort_unless($this->families->canManage($request->user(), $family->load('members')), 403);
        abort_unless($member->family_id === $family->id, 404);
        abort_if($family->owner_user_id === $member->user_id, 422, 'Pemilik keluarga tidak dapat dihapus.');

        $member->delete();

        return back()->with('success', 'Anggota keluarga berhasil dihapus.');
    }
}
