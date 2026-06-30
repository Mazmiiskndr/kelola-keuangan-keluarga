<?php

namespace App\Console\Commands;

use App\Models\Debt;
use App\Models\User;
use App\Notifications\DebtDueSoonNotification;
use Illuminate\Console\Command;
use Illuminate\Notifications\DatabaseNotification;

class SendDebtDueNotifications extends Command
{
    protected $signature = 'finance:send-debt-due-notifications';

    protected $description = 'Kirim notification cicilan yang akan jatuh tempo dalam 7 hari.';

    public function handle(): int
    {
        $debts = Debt::query()
            ->where('status', 'active')
            ->whereNotNull('next_due_date')
            ->whereDate('next_due_date', '>=', now()->toDateString())
            ->whereDate('next_due_date', '<=', now()->addDays(7)->toDateString())
            ->get();

        $sent = 0;

        foreach ($debts as $debt) {
            $user = User::query()->find($debt->user_id);

            if (! $user || $this->alreadyNotified($user, $debt)) {
                continue;
            }

            $user->notify(new DebtDueSoonNotification($debt));
            $sent++;
        }

        $this->info("{$sent} notification cicilan dikirim.");

        return self::SUCCESS;
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
