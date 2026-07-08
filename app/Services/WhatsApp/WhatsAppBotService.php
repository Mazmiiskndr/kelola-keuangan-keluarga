<?php

namespace App\Services\WhatsApp;

use App\Contracts\WhatsAppGateway;
use App\Models\Category;
use App\Models\FinanceTransaction;
use App\Models\FinancialAccount;
use App\Models\User;
use App\Services\Finance\TransactionService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class WhatsAppBotService
{
    private ?array $queuedReplies = null;

    public function __construct(
        protected WhatsAppGateway $gateway,
        protected WhatsAppTransactionParser $parser,
        protected TransactionService $transactionService
    ) {}

    public function handleMessage(string $phone, string $body, ?string $replyTo = null, bool $queueReplies = false): array
    {
        $this->queuedReplies = $queueReplies ? [] : null;
        $replyTo ??= $phone;
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
        if (str_starts_with($cleanPhone, '62')) {
            $localPhone = '0'.substr($cleanPhone, 2);
        } elseif (str_starts_with($cleanPhone, '0')) {
            $localPhone = $cleanPhone;
            $cleanPhone = '62'.substr($localPhone, 1);
        } else {
            $localPhone = $cleanPhone;
        }

        $user = User::where('whatsapp_number', $cleanPhone)
            ->orWhere('whatsapp_number', $localPhone)
            ->orWhere('whatsapp_lid', $cleanPhone)
            ->first();

        if (! $user) {
            Log::warning('WhatsApp sender is not registered.', [
                'phone' => $phone,
                'clean_phone' => $cleanPhone,
                'local_phone' => $localPhone,
            ]);

            return $this->flushQueuedReplies();
        }

        $this->syncWhatsAppLid($user, $replyTo);

        $parsed = $this->parser->parse($body);

        if (! $parsed) {
            Log::warning('WhatsApp message could not be parsed.', [
                'user_id' => $user->id,
                'phone' => $phone,
                'body' => $body,
            ]);
            $this->reply($replyTo, "Maaf, saya tidak mengerti perintah tersebut. Coba format seperti: 'bensin 50k'.");

            return $this->flushQueuedReplies();
        }

        Log::info('WhatsApp message parsed.', [
            'user_id' => $user->id,
            'phone' => $phone,
            'parsed' => $parsed,
        ]);

        $command = $parsed['command'];

        if ($command === 'ok') {
            $this->handleConfirmation($user, $replyTo);

            return $this->flushQueuedReplies();
        }

        if ($command === 'batal') {
            $this->handleCancellation($user, $replyTo);

            return $this->flushQueuedReplies();
        }

        if ($command === 'budget' || $command === 'report') {
            $this->handleReport($user, $replyTo, $command);

            return $this->flushQueuedReplies();
        }

        if ($command === 'saldo_awal' || $command === 'saldo_sekarang') {
            $this->handleSaldoSnapshot($user, $replyTo, $command, $parsed['amount']);

            return $this->flushQueuedReplies();
        }

        if ($command === 'transaction') {
            $this->handleTransactionDraft($user, $replyTo, $parsed);
        }

        return $this->flushQueuedReplies();
    }

    protected function handleTransactionDraft(User $user, string $phone, array $parsed): void
    {
        $account = FinancialAccount::where('user_id', $user->id)
            ->where('is_active', true)
            ->first();

        if (! $account) {
            $this->reply($phone, 'Anda belum memiliki akun keuangan yang aktif. Silakan buat di aplikasi.');

            return;
        }

        $amountFormatted = number_format($parsed['amount'], 0, ',', '.');
        $title = $parsed['title'];
        $category = $parsed['category'];
        $type = $parsed['type'];
        $accountName = $account->name;

        Cache::put('wa_draft_'.$user->id, [
            'amount' => $parsed['amount'],
            'title' => $title,
            'category_name' => $category,
            'type' => $type,
            'account_id' => $account->id,
            'family_id' => $account->family_id,
        ], now()->addMinutes(15));

        Log::info('WhatsApp transaction draft stored.', [
            'user_id' => $user->id,
            'phone' => $phone,
            'amount' => $parsed['amount'],
            'title' => $title,
            'category' => $category,
            'type' => $type,
            'account_id' => $account->id,
        ]);

        $typeLabel = $type === 'expense' ? 'Pengeluaran' : 'Pemasukan';

        $message = "📝 *Draf Transaksi*\n💰 {$typeLabel} {$title} *Rp{$amountFormatted}*\n📂 Kategori *{$category}*\n🏦 Dari saldo *{$accountName}*\n\nBalas *OK* atau *Batal*";
        $this->reply($phone, $message);
    }

    protected function handleConfirmation(User $user, string $phone): void
    {
        $draft = Cache::get('wa_draft_'.$user->id);

        if (! $draft) {
            $this->reply($phone, 'Tidak ada draft transaksi yang menunggu konfirmasi atau draft sudah kadaluarsa.');

            return;
        }

        $category = Category::firstOrCreate(
            ['user_id' => $user->id, 'name' => $draft['category_name']],
            ['type' => $draft['type'], 'is_default' => false, 'family_id' => $draft['family_id']]
        );

        try {
            $this->transactionService->create([
                'user_id' => $user->id,
                'family_id' => $draft['family_id'],
                'financial_account_id' => $draft['account_id'],
                'category_id' => $category->id,
                'type' => $draft['type'],
                'amount' => (float) $draft['amount'],
                'transaction_date' => now()->format('Y-m-d'),
                'description' => 'Created via WhatsApp',
                'merchant' => $draft['title'],
                'visibility' => 'private',
                'need_type' => 'unclassified',
                'is_recurring' => false,
            ]);

            Cache::forget('wa_draft_'.$user->id);

            $account = FinancialAccount::find($draft['account_id']);
            $balanceFormatted = number_format($account->current_balance, 0, ',', '.');
            $amountFormatted = number_format((float) $draft['amount'], 0, ',', '.');
            $typeLabel = $draft['type'] === 'expense' ? 'Pengeluaran' : 'Pemasukan';

            $message = "✅ *Berhasil Dicatat!*\n💰 {$typeLabel} {$draft['title']} : *Rp{$amountFormatted}*\n📂 Kategori : *{$draft['category_name']}*\n💳 Akun : *{$account->name}*\n🏦 Sisa Saldo : *Rp{$balanceFormatted}*";
            $this->reply($phone, $message);
        } catch (\Exception $e) {
            $this->reply($phone, 'Gagal mencatat transaksi: '.$e->getMessage());
        }
    }

    protected function handleCancellation(User $user, string $phone): void
    {
        if (Cache::has('wa_draft_'.$user->id)) {
            Cache::forget('wa_draft_'.$user->id);
            $this->reply($phone, 'Draft dibatalkan.');
        } else {
            $this->reply($phone, 'Tidak ada draft yang aktif.');
        }
    }

    protected function handleReport(User $user, string $phone, string $type): void
    {
        $this->reply($phone, "Laporan {$type} bulan ini sedang disiapkan... (Fitur ini dapat diperluas menggunakan laporan lengkap di aplikasi)");
    }

    protected function handleSaldoSnapshot(User $user, string $phone, string $command, float $amount): void
    {
        $amountFormatted = number_format($amount, 0, ',', '.');
        if ($command === 'saldo_awal') {
            Cache::put('wa_saldo_awal_'.$user->id, $amount, now()->addDays(30));
            $this->reply($phone, "Saldo awal tercatat *Rp{$amountFormatted}*.");
        } else {
            $awal = Cache::get('wa_saldo_awal_'.$user->id, 0);

            $income = FinanceTransaction::where('user_id', $user->id)
                ->where('type', 'income')
                ->whereMonth('transaction_date', now()->month)
                ->sum('amount');

            $expense = FinanceTransaction::where('user_id', $user->id)
                ->where('type', 'expense')
                ->whereMonth('transaction_date', now()->month)
                ->sum('amount');

            $untracked = $awal + $income - $expense - $amount;

            if ($untracked > 0) {
                $untrackedFormatted = number_format($untracked, 0, ',', '.');
                $this->reply($phone, "Ada *Rp{$untrackedFormatted}* pengeluaran belum tercatat bulan ini.");
            } else {
                $this->reply($phone, 'Saldo cocok. Tidak ada pengeluaran yang belum tercatat.');
            }
        }
    }

    private function syncWhatsAppLid(User $user, string $replyTo): void
    {
        if (! str_contains($replyTo, '@lid')) {
            return;
        }

        $lid = preg_replace('/[^0-9]/', '', $replyTo);

        if (! $lid || $user->whatsapp_lid === $lid) {
            return;
        }

        $user->forceFill(['whatsapp_lid' => $lid])->save();

        Log::info('WhatsApp LID linked to user.', [
            'user_id' => $user->id,
            'whatsapp_lid' => $lid,
        ]);
    }

    private function reply(string $phone, string $message): void
    {
        if ($this->queuedReplies !== null) {
            $this->queuedReplies[] = [
                'phone' => $phone,
                'message' => $message,
            ];

            return;
        }

        $this->gateway->sendMessage($phone, $message);
    }

    private function flushQueuedReplies(): array
    {
        $replies = $this->queuedReplies ?? [];
        $this->queuedReplies = null;

        return $replies;
    }
}
