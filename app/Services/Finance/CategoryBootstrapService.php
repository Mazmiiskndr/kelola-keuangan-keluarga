<?php

namespace App\Services\Finance;

use App\Enums\CategoryType;
use App\Models\Category;
use App\Models\User;

class CategoryBootstrapService
{
    public function ensureDefaults(User $user): void
    {
        foreach ($this->defaults() as $category) {
            if ($this->hasMatchingCategory($user, $category['name'], $category['type'])) {
                continue;
            }

            Category::query()->create([
                ...$category,
                'user_id' => $user->id,
                'is_default' => true,
            ]);
        }
    }

    private function hasMatchingCategory(User $user, string $name, string $type): bool
    {
        return $user->categories()
            ->where('type', $type)
            ->whereRaw('LOWER(TRIM(name)) = ?', [strtolower(trim($name))])
            ->exists();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function defaults(): array
    {
        return [
            ['name' => 'Gaji', 'type' => CategoryType::Income->value, 'color' => '#16a34a', 'icon' => 'Wallet'],
            ['name' => 'Bonus', 'type' => CategoryType::Income->value, 'color' => '#22c55e', 'icon' => 'BadgeDollarSign'],
            ['name' => 'Usaha', 'type' => CategoryType::Income->value, 'color' => '#0f766e', 'icon' => 'BriefcaseBusiness'],
            ['name' => 'Makanan dan Minuman', 'type' => CategoryType::Expense->value, 'color' => '#ef4444', 'icon' => 'Utensils', 'is_savable' => true],
            ['name' => 'Belanja Bulanan', 'type' => CategoryType::Expense->value, 'color' => '#f97316', 'icon' => 'ShoppingCart', 'is_essential' => true, 'is_savable' => true],
            ['name' => 'Transportasi', 'type' => CategoryType::Expense->value, 'color' => '#0ea5e9', 'icon' => 'Car', 'is_savable' => true],
            ['name' => 'Tempat Tinggal', 'type' => CategoryType::Expense->value, 'color' => '#64748b', 'icon' => 'Home', 'is_essential' => true],
            ['name' => 'Listrik, Air, Internet', 'type' => CategoryType::Expense->value, 'color' => '#6366f1', 'icon' => 'Zap', 'is_essential' => true],
            ['name' => 'Pendidikan', 'type' => CategoryType::Expense->value, 'color' => '#8b5cf6', 'icon' => 'GraduationCap', 'is_essential' => true],
            ['name' => 'Kesehatan', 'type' => CategoryType::Expense->value, 'color' => '#14b8a6', 'icon' => 'HeartPulse', 'is_essential' => true],
            ['name' => 'Cicilan dan Utang', 'type' => CategoryType::Expense->value, 'color' => '#f59e0b', 'icon' => 'ReceiptText', 'is_essential' => true],
            ['name' => 'Hiburan', 'type' => CategoryType::Expense->value, 'color' => '#ec4899', 'icon' => 'Gamepad2', 'is_lifestyle' => true, 'is_savable' => true],
            ['name' => 'Langganan', 'type' => CategoryType::Expense->value, 'color' => '#a855f7', 'icon' => 'RefreshCw', 'is_lifestyle' => true, 'is_savable' => true],
            ['name' => 'Tabungan', 'type' => CategoryType::Expense->value, 'color' => '#2563eb', 'icon' => 'PiggyBank'],
            ['name' => 'Investasi', 'type' => CategoryType::Expense->value, 'color' => '#7c3aed', 'icon' => 'TrendingUp'],
            ['name' => 'Lainnya', 'type' => CategoryType::Expense->value, 'color' => '#94a3b8', 'icon' => 'CircleEllipsis'],
        ];
    }
}
