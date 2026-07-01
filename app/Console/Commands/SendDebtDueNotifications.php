<?php

namespace App\Console\Commands;

use App\Services\Finance\DebtDueNotificationService;
use Illuminate\Console\Command;

class SendDebtDueNotifications extends Command
{
    protected $signature = 'finance:send-debt-due-notifications';

    protected $description = 'Kirim notification cicilan yang sudah atau akan jatuh tempo dalam 7 hari.';

    public function __construct(private readonly DebtDueNotificationService $notifications)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $debts = $this->notifications->queryNotifiableDebts()->get();

        $sent = 0;

        foreach ($debts as $debt) {
            $sent += $this->notifications->notify($debt) ? 1 : 0;
        }

        $this->info("{$sent} notification cicilan dikirim.");

        return self::SUCCESS;
    }
}
