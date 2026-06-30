<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAiInsightRequest;
use App\Models\AiAnalysis;
use App\Services\Ai\AiAnalysisService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AiInsightController extends Controller
{
    public function __construct(private readonly AiAnalysisService $ai) {}

    public function index(Request $request): Response
    {
        return Inertia::render('ai-insights/index', [
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
}
