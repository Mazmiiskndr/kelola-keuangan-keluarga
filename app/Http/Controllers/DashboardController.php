<?php

namespace App\Http\Controllers;

use App\Services\Finance\CategoryBootstrapService;
use App\Services\Finance\FinancialMetricService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly FinancialMetricService $metrics,
        private readonly CategoryBootstrapService $categories,
    ) {}

    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $this->categories->ensureDefaults($user);

        return Inertia::render('dashboard', [
            'summary' => $this->metrics->monthlySummary($user, $request->string('period')->toString() ?: null),
        ]);
    }
}
