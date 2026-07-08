<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAiInsightRequest;
use App\Models\AiAnalysis;
use App\Models\AiRecommendation;
use App\Services\Ai\AiAnalysisService;
use App\Services\Ai\AiProviderCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AiInsightController extends Controller
{
    public function __construct(
        private readonly AiAnalysisService $ai,
        private readonly AiProviderCatalog $catalog,
    ) {}

    public function index(Request $request): Response
    {
        return Inertia::render('ai-insights/index', [
            'ai_model_label' => $this->catalog->resolvedModelLabelFor($request->user()->ai_provider, $request->user()->ai_model),
            'analyses' => AiAnalysis::query()
                ->with('aiRecommendations')
                ->where('user_id', $request->user()->id)
                ->latest()
                ->take(10)
                ->get(),
        ]);
    }

    public function store(StoreAiInsightRequest $request): RedirectResponse
    {
        $this->ai->generateMonthly($request->user(), $request->validated('period'));

        return back()->with('success', 'Analisis AI berhasil dibuat.');
    }

    public function updateRecommendation(Request $request, AiRecommendation $recommendation): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'sometimes|string|in:new,planned,done,dismissed',
            'action_steps_completed' => 'sometimes|array',
            'action_steps_completed.*' => 'integer',
        ]);

        $recommendation->update($validated);

        return back(303);
    }
}
