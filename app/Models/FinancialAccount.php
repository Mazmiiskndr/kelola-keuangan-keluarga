<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class FinancialAccount extends Model
{
    use SoftDeletes;

    protected $appends = [
        'display_name',
    ];

    protected $fillable = [
        'user_id',
        'family_id',
        'name',
        'bank_name',
        'account_holder_name',
        'account_number',
        'type',
        'initial_balance',
        'current_balance',
        'currency',
        'visibility',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'initial_balance' => 'decimal:2',
            'current_balance' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function family(): BelongsTo
    {
        return $this->belongsTo(Family::class);
    }

    public function financeTransactions(): HasMany
    {
        return $this->hasMany(FinanceTransaction::class);
    }

    protected function displayBalance(): Attribute
    {
        return Attribute::get(fn (): string => number_format((float) $this->current_balance, 0, ',', '.'));
    }

    protected function displayName(): Attribute
    {
        return Attribute::get(function (): string {
            if (filled($this->bank_name) && filled($this->account_holder_name)) {
                return $this->bank_name.' - '.$this->account_holder_name;
            }

            return $this->name;
        });
    }
}
