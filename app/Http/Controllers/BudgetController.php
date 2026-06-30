<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBudgetRequest;
use App\Models\Budget;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BudgetController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('budgets/index', [
            'budgets' => Budget::query()->with('category')->where('user_id', $request->user()->id)->latest('period_start')->get(),
            'categories' => Category::query()->where('user_id', $request->user()->id)->where('type', 'expense')->orderBy('name')->get(),
        ]);
    }

    public function store(StoreBudgetRequest $request): RedirectResponse
    {
        Budget::query()->updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'category_id' => $request->validated('category_id'),
                'period_start' => $request->validated('period_start'),
            ],
            [
                ...$request->validated(),
                'user_id' => $request->user()->id,
                'alert_thresholds' => [50, 80, 100],
            ],
        );

        return back()->with('success', 'Budget berhasil disimpan.');
    }

    public function update(StoreBudgetRequest $request, Budget $budget): RedirectResponse
    {
        abort_unless($budget->user_id === $request->user()->id, 403);

        $budget->update([
            ...$request->validated(),
            'alert_thresholds' => $budget->alert_thresholds ?? [50, 80, 100],
        ]);

        return back()->with('success', 'Budget berhasil diperbarui.');
    }

    public function destroy(Request $request, Budget $budget): RedirectResponse
    {
        abort_unless($budget->user_id === $request->user()->id, 403);

        $budget->delete();

        return back()->with('success', 'Budget berhasil dihapus.');
    }
}
