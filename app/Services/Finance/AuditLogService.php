<?php

namespace App\Services\Finance;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class AuditLogService
{
    public function record(string $action, Model $entity, ?Request $request = null, ?array $oldValues = null): void
    {
        AuditLog::query()->create([
            'actor_user_id' => $request?->user()?->id,
            'family_id' => $entity->family_id ?? null,
            'action' => $action,
            'entity_type' => $entity::class,
            'entity_id' => $entity->getKey(),
            'old_values' => $oldValues,
            'new_values' => $entity->getAttributes(),
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);
    }
}
