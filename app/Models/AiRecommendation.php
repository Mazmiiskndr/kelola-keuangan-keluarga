<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiRecommendation extends Model
{
    protected $fillable = [
        'ai_analysis_id',
        'user_id',
        'family_id',
        'type',
        'title',
        'description',
        'category_id',
        'estimated_saving_amount',
        'confidence_score',
        'status',
        'due_date',
    ];

    protected function casts(): array
    {
        return [
            'estimated_saving_amount' => 'decimal:2',
            'due_date' => 'date',
        ];
    }
}
