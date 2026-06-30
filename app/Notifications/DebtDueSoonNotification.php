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
        return new DatabaseMessage([
            'type' => 'debt_due_soon',
            'debt_id' => $this->debt->id,
            'title' => 'Cicilan akan jatuh tempo',
            'message' => $this->debt->name.' jatuh tempo pada '.$this->debt->next_due_date?->format('d - F - y H:i:s').'.',
            'amount' => (float) $this->debt->monthly_payment,
            'due_date' => $this->debt->next_due_date?->toDateString(),
            'url' => '/debts',
        ]);
    }
}
