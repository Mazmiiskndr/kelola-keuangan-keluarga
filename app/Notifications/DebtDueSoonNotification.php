<?php

namespace App\Notifications;

use App\Models\Debt;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Notification;

class DebtDueSoonNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly Debt $debt) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): DatabaseMessage
    {
        $dueDate = $this->debt->next_due_date;
        $isOverdue = $dueDate?->isBefore(now()->startOfDay()) ?? false;

        return new DatabaseMessage([
            'type' => 'debt_due_soon',
            'debt_id' => $this->debt->id,
            'title' => $isOverdue ? 'Cicilan sudah jatuh tempo' : 'Cicilan akan jatuh tempo',
            'message' => $this->debt->name.' jatuh tempo pada '.$dueDate?->format('d-m-y').'.',
            'amount' => (float) $this->debt->monthly_payment,
            'due_date' => $dueDate?->toDateString(),
            'url' => '/debts',
        ]);
    }
}
