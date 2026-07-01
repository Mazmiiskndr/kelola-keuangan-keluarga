<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFinancialAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['nullable', 'string', 'max:120'],
            'bank_name' => ['required', 'string', 'max:120'],
            'account_holder_name' => ['required', 'string', 'max:120'],
            'account_number' => ['nullable', 'string', 'max:80'],
            'type' => ['required', 'string', 'max:40'],
            'initial_balance' => ['required', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'visibility' => ['required', 'in:private,family,shared_goal'],
            'family_id' => ['nullable', 'exists:families,id'],
        ];
    }
}
