<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Investment extends Model
{
    protected $fillable = [
        'user_id',
        'family_id',
        'financial_account_id',
        'name',
        'type',
        'initial_amount',
        'current_value',
        'purchase_date',
        'risk_level',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'initial_amount' => 'decimal:2',
            'current_value' => 'decimal:2',
            'purchase_date' => 'date',
        ];
    }
}
