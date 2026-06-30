<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSavingGoalRequest;
use App\Models\FinancialAccount;
use App\Models\SavingGoal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SavingGoalController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('saving-goals/index', [
            'savingGoals' => SavingGoal::query()->with('account')->where('user_id', $request->user()->id)->latest()->get(),
            'accounts' => FinancialAccount::query()->where('user_id', $request->user()->id)->where('is_active', true)->get(),
        ]);
    }

    public function store(StoreSavingGoalRequest $request): RedirectResponse
    {
        SavingGoal::query()->create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
            'current_amount' => $request->validated('current_amount') ?? 0,
            'status' => 'active',
        ]);

        return back()->with('success', 'Target tabungan berhasil dibuat.');
    }

    public function update(StoreSavingGoalRequest $request, SavingGoal $savingGoal): RedirectResponse
    {
        abort_unless($savingGoal->user_id === $request->user()->id, 403);

        $savingGoal->update([
            ...$request->validated(),
            'current_amount' => $request->validated('current_amount') ?? 0,
        ]);

        return back()->with('success', 'Target tabungan berhasil diperbarui.');
    }

    public function destroy(Request $request, SavingGoal $savingGoal): RedirectResponse
    {
        abort_unless($savingGoal->user_id === $request->user()->id, 403);

        $savingGoal->delete();

        return back()->with('success', 'Target tabungan berhasil dihapus.');
    }
}
