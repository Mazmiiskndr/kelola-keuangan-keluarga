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
        'headline',
        'tone',
        'health_score',
        'input_snapshot',
        'metrics_snapshot',
        'result_summary',
        'recommendations',
        'model_name',
        'status',
    ];

    protected $appends = ['model_label'];

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
    public function getModelLabelAttribute(): string
    {
        if (! $this->model_name) {
            return 'deterministic-rules';
        }

        $catalog = app(\App\Services\Ai\AiProviderCatalog::class);

        return $catalog->displayModelName($this->model_name);
    }
}
