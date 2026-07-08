<?php

namespace App\Http\Controllers;

use App\Models\Family;
use App\Services\Ai\AiProviderCatalog;
use App\Services\Finance\CategoryBootstrapService;
use App\Services\Finance\FamilyAccessService;
use App\Services\Finance\FinancialMetricService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const SESSION_FAMILY_ID = 'dashboard.family_id';

    private const SESSION_SCOPE = 'dashboard.scope';

    public function __construct(
        private readonly FinancialMetricService $metrics,
        private readonly CategoryBootstrapService $categories,
        private readonly FamilyAccessService $families,
        private readonly AiProviderCatalog $catalog,
    ) {}

    public function __invoke(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        $this->categories->ensureDefaults($user);
        $families = $this->families->activeFamilies($user);

        if ($request->hasAny(['scope', 'family_id'])) {
            $this->storeScope($request, $request->string('scope')->toString(), $request->query('family_id'), $families);

            return to_route('dashboard');
        }

        $scope = $request->session()->get(self::SESSION_SCOPE) === 'family' ? 'family' : 'personal';
        $family = $scope === 'family' ? $this->selectedFamily($families, $request->session()->get(self::SESSION_FAMILY_ID)) : null;

        if ($scope === 'family' && ! $family) {
            $this->storePersonalScope($request);
        }

        return Inertia::render('dashboard', [
            'summary' => $this->metrics->monthlySummary($user, $request->string('period')->toString() ?: null, $family ? 'family' : 'personal', $family),
            'latestAnalysis' => \App\Models\AiAnalysis::query()
                ->with('aiRecommendations')
                ->where('user_id', $user->id)
                ->latest()
                ->first(),
            'aiModelLabel' => $this->catalog->resolvedModelLabelFor($user->ai_provider, $user->ai_model),
            'families' => $families->map(fn (Family $family): array => [
                'id' => $family->id,
                'name' => $family->name,
                'currency' => $family->currency,
                'owner_user_id' => $family->owner_user_id,
            ]),
        ]);
    }

    public function scope(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'scope' => ['required', 'in:personal,family'],
            'family_id' => ['nullable', 'integer'],
        ]);

        $this->storeScope($request, $data['scope'], $data['family_id'] ?? null, $this->families->activeFamilies($request->user()));

        return to_route('dashboard');
    }

    /**
     * @param  Collection<int, Family>  $families
     */
    private function storeScope(Request $request, string $scope, mixed $familyId, Collection $families): void
    {
        if ($scope !== 'family') {
            $this->storePersonalScope($request);

            return;
        }

        $family = $this->selectedFamily($families, $familyId);

        if (! $family) {
            $this->storePersonalScope($request);

            return;
        }

        $request->session()->put(self::SESSION_SCOPE, 'family');
        $request->session()->put(self::SESSION_FAMILY_ID, $family->id);
    }

    private function storePersonalScope(Request $request): void
    {
        $request->session()->put(self::SESSION_SCOPE, 'personal');
        $request->session()->forget(self::SESSION_FAMILY_ID);
    }

    /**
     * @param  Collection<int, Family>  $families
     */
    private function selectedFamily(Collection $families, mixed $familyId): ?Family
    {
        if ($familyId) {
            return $families->firstWhere('id', (int) $familyId);
        }

        return $families->first();
    }
}
