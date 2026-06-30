<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Debt extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'family_id',
        'name',
        'type',
        'lender',
        'principal_amount',
        'outstanding_amount',
        'monthly_payment',
        'minimum_payment',
        'interest_rate',
        'start_date',
        'tenor_months',
        'remaining_tenor_months',
        'due_day',
        'next_due_date',
        'payment_account_id',
        'category_id',
        'auto_generate_expense',
        'include_in_monthly_expense',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'principal_amount' => 'decimal:2',
            'outstanding_amount' => 'decimal:2',
            'monthly_payment' => 'decimal:2',
            'minimum_payment' => 'decimal:2',
            'interest_rate' => 'decimal:2',
            'start_date' => 'date',
            'next_due_date' => 'date',
            'auto_generate_expense' => 'boolean',
            'include_in_monthly_expense' => 'boolean',
        ];
    }

    public function paymentAccount(): BelongsTo
    {
        return $this->belongsTo(FinancialAccount::class, 'payment_account_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(DebtPayment::class);
    }
}
