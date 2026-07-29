<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use App\Services\Finance\CategoryBootstrapService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_cannot_create_a_duplicate_category_for_the_same_type(): void
    {
        $user = User::factory()->create();

        Category::query()->create([
            'user_id' => $user->id,
            'name' => 'Lainnya',
            'type' => 'expense',
            'is_default' => false,
        ]);

        $this->actingAs($user)
            ->from('/categories')
            ->post('/categories', [
                'name' => '  lainnya  ',
                'type' => 'expense',
            ])
            ->assertRedirect('/categories')
            ->assertSessionHasErrors('name');

        $this->assertSame(1, Category::query()->where('user_id', $user->id)->where('type', 'expense')->count());
    }

    public function test_default_categories_do_not_duplicate_an_existing_category(): void
    {
        $user = User::factory()->create();

        Category::query()->create([
            'user_id' => $user->id,
            'name' => ' lainnya ',
            'type' => 'expense',
            'is_default' => false,
        ]);

        app(CategoryBootstrapService::class)->ensureDefaults($user);

        $this->assertSame(
            1,
            Category::query()
                ->where('user_id', $user->id)
                ->where('type', 'expense')
                ->whereRaw('LOWER(TRIM(name)) = ?', ['lainnya'])
                ->count(),
        );
    }
}
