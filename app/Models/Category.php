<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'family_id',
        'parent_id',
        'name',
        'type',
        'color',
        'icon',
        'is_default',
        'is_essential',
        'is_savable',
        'is_lifestyle',
    ];

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
            'is_essential' => 'boolean',
            'is_savable' => 'boolean',
            'is_lifestyle' => 'boolean',
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
}
