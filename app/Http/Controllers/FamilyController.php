<?php

namespace App\Http\Controllers;

use App\Enums\FamilyRole;
use App\Http\Requests\StoreFamilyRequest;
use App\Models\Family;
use App\Models\FamilyMember;
use App\Services\Finance\FamilyAccessService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class FamilyController extends Controller
{
    public function __construct(private readonly FamilyAccessService $families) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('families/index', [
            'families' => $this->families->activeFamilies($user)->map(fn (Family $family): array => [
                'id' => $family->id,
                'name' => $family->name,
                'currency' => $family->currency,
                'owner_user_id' => $family->owner_user_id,
                'role' => $this->families->role($user, $family),
                'can_manage' => $this->families->canManage($user, $family),
                'members' => $family->members
                    ->where('status', 'active')
                    ->values()
                    ->map(fn (FamilyMember $member): array => [
                        'id' => $member->id,
                        'user_id' => $member->user_id,
                        'role' => $member->role,
                        'status' => $member->status,
                        'user' => [
                            'id' => $member->user?->id,
                            'name' => $member->user?->name,
                            'email' => $member->user?->email,
                        ],
                    ]),
            ]),
        ]);
    }

    public function store(StoreFamilyRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request): void {
            $family = Family::query()->create([
                ...$request->validated(),
                'owner_user_id' => $request->user()->id,
                'currency' => $request->validated('currency') ?? 'IDR',
            ]);

            FamilyMember::query()->create([
                'family_id' => $family->id,
                'user_id' => $request->user()->id,
                'role' => FamilyRole::Admin->value,
                'status' => 'active',
                'joined_at' => now(),
            ]);
        });

        return back()->with('success', 'Keluarga berhasil dibuat.');
    }
}
