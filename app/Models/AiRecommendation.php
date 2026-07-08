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
        'priority',
        'why_it_matters',
        'next_action',
        'source_metric',
        'title',
        'description',
        'category_id',
        'estimated_saving_amount',
        'confidence_score',
        'status',
        'action_steps_completed',
        'due_date',
    ];

    protected function casts(): array
    {
        return [
            'estimated_saving_amount' => 'decimal:2',
            'action_steps_completed' => 'array',
            'due_date' => 'date',
        ];
    }
}
