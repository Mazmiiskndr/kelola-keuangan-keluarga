<?php

namespace App\Http\Requests;

use App\Models\Category;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:120',
                function (string $attribute, mixed $value, Closure $fail): void {
                    $category = $this->route('category');
                    $categoryId = $category instanceof Category ? $category->id : null;

                    $exists = Category::query()
                        ->where('user_id', $this->user()->id)
                        ->where('type', $this->input('type'))
                        ->when($categoryId, fn ($query) => $query->where('id', '!=', $categoryId))
                        ->whereRaw('LOWER(TRIM(name)) = ?', [strtolower((string) $value)])
                        ->exists();

                    if ($exists) {
                        $fail('Kategori dengan nama dan tipe yang sama sudah ada.');
                    }
                },
            ],
            'type' => ['required', 'in:income,expense'],
            'color' => ['nullable', 'string', 'max:20'],
            'icon' => ['nullable', 'string', 'max:80'],
            'is_essential' => ['boolean'],
            'is_savable' => ['boolean'],
            'is_lifestyle' => ['boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => Str::squish((string) $this->input('name')),
        ]);
    }
}
