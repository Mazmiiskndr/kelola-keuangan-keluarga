<?php

namespace App\Services\Finance;

use App\Models\Debt;
use App\Models\User;
use App\Notifications\DebtDueSoonNotification;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Notifications\DatabaseNotification;

class DebtDueNotificationService
{
    private const DUE_SOON_DAYS = 7;

    /**
     * @return Builder<Debt>
     */
    public function queryNotifiableDebts(): Builder
    {
        return Debt::query()
            ->where('status', 'active')
            ->where('outstanding_amount', '>', 0)
            ->whereNotNull('next_due_date')
            ->whereDate('next_due_date', '<=', now()->addDays(self::DUE_SOON_DAYS)->toDateString());
    }

    public function notify(Debt $debt): bool
    {
        if (! $this->shouldNotify($debt)) {
            return false;
        }

        $user = User::query()->find($debt->user_id);

        if (! $user || $this->alreadyNotified($user, $debt)) {
            return false;
        }

        $user->notify(new DebtDueSoonNotification($debt));

        return true;
    }

    public function shouldNotify(Debt $debt): bool
    {
        if ($debt->status !== 'active' || ! $debt->next_due_date || (float) $debt->outstanding_amount <= 0) {
            return false;
        }

        return $debt->next_due_date->toDateString() <= now()->addDays(self::DUE_SOON_DAYS)->toDateString();
    }

    private function alreadyNotified(User $user, Debt $debt): bool
    {
        $dueDate = $debt->next_due_date?->toDateString();

        return DatabaseNotification::query()
            ->where('notifiable_type', $user->getMorphClass())
            ->where('notifiable_id', $user->id)
            ->where('type', DebtDueSoonNotification::class)
            ->where('data', 'like', '%"debt_id":'.$debt->id.'%')
            ->where('data', 'like', '%"due_date":"'.$dueDate.'"%')
            ->exists();
    }
}
