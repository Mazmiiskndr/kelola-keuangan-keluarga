<?php

namespace App\Http\Controllers;

use App\Enums\FamilyRole;
use App\Http\Requests\StoreFamilyRequest;
use App\Models\Family;
use App\Models\FamilyMember;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class FamilyController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('families/index', [
            'families' => Family::query()
                ->with('members.user')
                ->whereHas('members', fn ($query) => $query->where('user_id', $request->user()->id))
                ->get(),
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
