<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiAnalysis extends Model
{
    protected $fillable = [
        'user_id',
        'family_id',
        'period_start',
        'period_end',
        'analysis_type',
        'input_snapshot',
        'metrics_snapshot',
        'result_summary',
        'recommendations',
        'model_name',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'period_start' => 'date',
            'period_end' => 'date',
            'input_snapshot' => 'array',
            'metrics_snapshot' => 'array',
            'recommendations' => 'array',
        ];
    }

    public function aiRecommendations(): HasMany
    {
        return $this->hasMany(AiRecommendation::class);
    }
}
