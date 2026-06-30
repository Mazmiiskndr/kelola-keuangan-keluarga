<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDebtRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'type' => ['required', 'string', 'max:60'],
            'lender' => ['nullable', 'string', 'max:120'],
            'principal_amount' => ['required', 'numeric', 'min:1'],
            'outstanding_amount' => ['nullable', 'numeric', 'min:0'],
            'monthly_payment' => ['required', 'numeric', 'min:1'],
            'minimum_payment' => ['nullable', 'numeric', 'min:0'],
            'interest_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'start_date' => ['nullable', 'date'],
            'tenor_months' => ['nullable', 'integer', 'min:1'],
            'remaining_tenor_months' => ['nullable', 'integer', 'min:0'],
            'due_day' => ['nullable', 'integer', 'min:1', 'max:31'],
            'next_due_date' => ['nullable', 'date'],
            'payment_account_id' => ['nullable', 'exists:financial_accounts,id'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'auto_generate_expense' => ['boolean'],
            'include_in_monthly_expense' => ['boolean'],
        ];
    }
}
