<?php

namespace App\Console\Commands;

use App\Contracts\WhatsAppGateway;
use App\Models\FinanceTransaction;
use App\Models\User;
use Illuminate\Console\Command;

class SendWhatsAppReminders extends Command
{
    protected $signature = 'whatsapp:reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send WhatsApp daily reminders for transactions';

    /**
     * Execute the console command.
     */
    public function handle(WhatsAppGateway $gateway)
    {
        $users = User::whereNotNull('whatsapp_number')->get();

        foreach ($users as $user) {
            // Check if user has recorded any transaction today
            $hasTransactionToday = FinanceTransaction::where('user_id', $user->id)
                ->whereDate('transaction_date', now()->toDateString())
                ->exists();

            if (! $hasTransactionToday) {
                $gateway->sendMessage($user->whatsapp_number, 'Hari ini ada pengeluaran? Catat cepat.');
                $this->info("Reminder sent to {$user->whatsapp_number}");
            }
        }

        $this->info('All reminders processed.');
    }
}
