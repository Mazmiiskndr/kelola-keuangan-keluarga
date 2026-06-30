<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Models\Category;
use App\Services\Finance\CategoryBootstrapService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function __construct(private readonly CategoryBootstrapService $bootstrap) {}

    public function index(Request $request): Response
    {
        $this->bootstrap->ensureDefaults($request->user());

        return Inertia::render('categories/index', [
            'categories' => Category::query()
                ->where('user_id', $request->user()->id)
                ->orderBy('type')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        Category::query()->create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
            'is_default' => false,
        ]);

        return back()->with('success', 'Kategori berhasil dibuat.');
    }

    public function update(StoreCategoryRequest $request, Category $category): RedirectResponse
    {
        abort_unless($category->user_id === $request->user()->id, 403);

        $category->update($request->validated());

        return back()->with('success', 'Kategori berhasil diperbarui.');
    }

    public function destroy(Request $request, Category $category): RedirectResponse
    {
        abort_unless($category->user_id === $request->user()->id, 403);
        abort_if($category->is_default, 422, 'Kategori default tidak dapat dihapus.');

        $category->delete();

        return back()->with('success', 'Kategori berhasil dihapus.');
    }
}
