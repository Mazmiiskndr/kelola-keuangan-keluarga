<?php

namespace App\Http\Controllers;

use App\Services\Finance\CategoryBootstrapService;
use App\Services\Finance\FamilyAccessService;
use App\Services\Finance\FinancialMetricService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly FinancialMetricService $metrics,
        private readonly CategoryBootstrapService $categories,
        private readonly FamilyAccessService $families,
    ) {}

    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $this->categories->ensureDefaults($user);
        $scope = $request->string('scope')->toString() === 'family' ? 'family' : 'personal';
        $family = $scope === 'family' ? $this->families->resolveForUser($user, $request->query('family_id')) : null;

        return Inertia::render('dashboard', [
            'summary' => $this->metrics->monthlySummary($user, $request->string('period')->toString() ?: null, $family ? 'family' : 'personal', $family),
            'families' => $this->families->activeFamilies($user)->map(fn ($family): array => [
                'id' => $family->id,
                'name' => $family->name,
                'currency' => $family->currency,
                'owner_user_id' => $family->owner_user_id,
            ]),
        ]);
    }
}
