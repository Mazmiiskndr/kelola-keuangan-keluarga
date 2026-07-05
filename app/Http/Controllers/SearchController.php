<?php

namespace App\Http\Controllers;

use App\Services\Finance\GlobalSearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    public function __construct(
        private readonly GlobalSearchService $search,
    ) {}

    public function index(Request $request): Response
    {
        $query = $request->string('q')->trim()->toString();
        $selected = $request->string('selected')->trim()->toString();
        $user = $request->user();

        $results = mb_strlen($query) >= 2
            ? $this->search->search($user, $query, 20)
            : [];

        return Inertia::render('search/index', [
            'results' => $results,
            'query' => $query,
            'selected' => $selected ?: null,
        ]);
    }

    public function suggestions(Request $request): JsonResponse
    {
        $query = $request->string('q')->trim()->toString();
        $user = $request->user();

        $groups = mb_strlen($query) >= 2
            ? $this->search->search($user, $query, 5)
            : [];

        return response()->json(['groups' => $groups]);
    }
}
