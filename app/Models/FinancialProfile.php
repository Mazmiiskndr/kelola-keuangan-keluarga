<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancialProfile extends Model
{
    protected $fillable = [
        'user_id',
        'account_type',
        'monthly_income_estimate',
        'financial_month_start_day',
        'dependents_count',
        'risk_profile',
        'target_saving_ratio',
        'emergency_fund_months',
        'main_goal',
    ];

    protected function casts(): array
    {
        return [
            'monthly_income_estimate' => 'decimal:2',
            'target_saving_ratio' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
