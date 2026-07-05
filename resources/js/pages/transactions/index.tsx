import { CurrencyInput } from '@/components/finance/currency-input';
import { DateTimeDisplay } from '@/components/finance/date-display';
import { DatePickerInput } from '@/components/finance/date-picker-input';
import { FinanceBadge } from '@/components/finance/finance-badge';
import { FinanceSelect } from '@/components/finance/finance-select';
import { FormError } from '@/components/finance/form-error';
import { formatMoney, MoneyDisplay } from '@/components/finance/money-display';
import { PageHeader, SubmitButton } from '@/components/finance/page-header';
import { RequiredLabel } from '@/components/finance/required-label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { accountLabel } from '@/lib/finance-labels';
import { toFormString } from '@/lib/form-values';
import { type BreadcrumbItem } from '@/types';
import {
    type Category,
    type FinanceTransaction,
    type FinancialAccount,
    type Paginated,
    type SavingGoal,
    type TransactionSuggestion,
    type TransactionSuggestions,
} from '@/types/finance';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowRightLeft, CheckCircle2, ChevronLeft, ChevronRight, MoreHorizontal, Pencil, ReceiptText, Sparkles, Trash2, X } from 'lucide-react';
import { useState, type React } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Transaksi', href: '/transactions' }];
const nominalPresets = [10000, 20000, 30000, 40000, 50000];
const transactionTypeFilterOptions = [
    { value: 'all', label: 'Semua tipe' },
    { value: 'income', label: 'Pemasukan' },
    { value: 'expense', label: 'Pengeluaran' },
    { value: 'saving', label: 'Tabungan' },
];
const transactionTypeOptions = [
    { value: 'expense', label: 'Pengeluaran' },
    { value: 'income', label: 'Pemasukan' },
    { value: 'saving', label: 'Tabungan' },
];

interface TransactionsProps {
    transactions: Paginated<FinanceTransaction>;
    accounts: FinancialAccount[];
    categories: Category[];
    savingGoals: SavingGoal[];
    suggestions: TransactionSuggestions;
    filters: {
        type: string;
    };
}

export default function TransactionsIndex({
    transactions,
    accounts,
    categories,
    savingGoals,
    suggestions = { items: [], amount_presets: [] },
    filters,
}: TransactionsProps) {
    const getDefaultDate = () => {
        const now = new Date();
        if (now.getHours() >= 0 && now.getHours() < 4) {
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            return yesterday.toISOString().slice(0, 10);
        }
        return now.toISOString().slice(0, 10);
    };

    const { auth } = usePage().props;
    const [editingTransactionId, setEditingTransactionId] = useState<number | null>(null);
    const [quickReviewSuggestionId, setQuickReviewSuggestionId] = useState<string | null>(null);
    const form = useForm({
        financial_account_id: accounts[0]?.id?.toString() ?? '',
        category_id: categories[0]?.id?.toString() ?? '',
        saving_goal_id: savingGoals[0]?.id?.toString() ?? '',
        type: 'expense',
        amount: '',
        transaction_date: getDefaultDate(),
        description: '',
        merchant: '',
        tags: '',
        visibility: accounts[0]?.visibility === 'family' ? 'family' : 'private',
        need_type: 'unclassified',
    });

    const transferForm = useForm({
        from_account_id: accounts[0]?.id?.toString() ?? '',
        to_account_id: accounts[1]?.id?.toString() ?? '',
        amount: '',
        transfer_date: new Date().toISOString().slice(0, 10),
        description: '',
    });

    const filteredCategories = form.data.type === 'saving' ? [] : categories.filter((category) => category.type === form.data.type);
    const selectedHistoryType = filters.type || 'all';
    const activeSuggestions = suggestions.items.filter((suggestion) => suggestion.type === form.data.type).slice(0, 6);
    const learnedAmountPresets = suggestions.amount_presets.filter((preset) => preset.type === form.data.type).slice(0, 5);
    const amountPresetValues = learnedAmountPresets.length > 0 ? learnedAmountPresets.map((preset) => Number(preset.amount)) : nominalPresets;
    const quickReviewSuggestion = suggestions.items.find((suggestion) => suggestion.id === quickReviewSuggestionId);
    const selectedAccountLabel = accountLabel(accounts.find((account) => account.id.toString() === form.data.financial_account_id));
    const selectedCategoryLabel =
        form.data.type === 'saving'
            ? (savingGoals.find((goal) => goal.id.toString() === form.data.saving_goal_id)?.name ?? 'Target tabungan')
            : (categories.find((category) => category.id.toString() === form.data.category_id)?.name ?? 'Kategori');

    function submit(event: React.FormEvent) {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => resetTransactionForm(),
        };

        if (editingTransactionId) {
            form.put(`/transactions/${editingTransactionId}`, options);

            return;
        }

        form.post('/transactions', options);
    }

    function submitTransfer(event: React.FormEvent) {
        event.preventDefault();
        transferForm.post('/transfers', { preserveScroll: true, onSuccess: () => transferForm.reset('amount', 'description') });
    }

    function resetTransactionForm() {
        setEditingTransactionId(null);
        setQuickReviewSuggestionId(null);
        form.clearErrors();
        form.setData({
            financial_account_id: accounts[0]?.id?.toString() ?? '',
            category_id: categories[0]?.id?.toString() ?? '',
            saving_goal_id: savingGoals[0]?.id?.toString() ?? '',
            type: 'expense',
            amount: '',
            transaction_date: getDefaultDate(),
            description: '',
            merchant: '',
            tags: '',
            visibility: accounts[0]?.visibility === 'family' ? 'family' : 'private',
            need_type: 'unclassified',
        });
    }

    function editTransaction(transaction: FinanceTransaction) {
        setEditingTransactionId(transaction.id);
        setQuickReviewSuggestionId(null);
        form.clearErrors();
        form.setData({
            financial_account_id: transaction.account?.id?.toString() ?? accounts[0]?.id?.toString() ?? '',
            category_id: transaction.category?.id?.toString() ?? '',
            saving_goal_id: transaction.saving_goal_id?.toString() ?? transaction.saving_goal?.id?.toString() ?? savingGoals[0]?.id?.toString() ?? '',
            type: transaction.type,
            amount: toFormString(transaction.amount),
            transaction_date: transaction.transaction_date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
            description: transaction.description ?? '',
            merchant: transaction.merchant ?? '',
            tags: '',
            visibility: transaction.visibility ?? 'private',
            need_type: transaction.need_type ?? 'unclassified',
        });
    }

    function filterTransactionHistory(type: string) {
        router.get('/transactions', type === 'all' ? {} : { type }, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    }

    function transactionTitle(transaction: FinanceTransaction) {
        return transaction.merchant?.trim() || '-';
    }

    function setSelectedAccount(accountId: string) {
        const selectedAccount = accounts.find((account) => account.id.toString() === accountId);

        form.setData((data) => ({
            ...data,
            financial_account_id: accountId,
            visibility: selectedAccount?.visibility === 'family' ? 'family' : data.visibility,
        }));
    }

    function transactionCreator(transaction: FinanceTransaction) {
        const name = transaction.user?.name || transaction.user?.email || 'User';
        return transaction.user?.id === auth.user.id ? `${name} (Anda)` : name;
    }

    function paginationContent(label: string) {
        const normalizedLabel = label.toLowerCase();

        if (normalizedLabel.includes('previous') || normalizedLabel.includes('pagination.previous')) {
            return <ChevronLeft className="size-4" />;
        }

        if (normalizedLabel.includes('next') || normalizedLabel.includes('pagination.next')) {
            return <ChevronRight className="size-4" />;
        }

        if (label.includes('...')) {
            return <MoreHorizontal className="size-4" />;
        }

        return <span>{label}</span>;
    }

    function paginationAriaLabel(label: string) {
        const normalizedLabel = label.toLowerCase();

        if (normalizedLabel.includes('previous') || normalizedLabel.includes('pagination.previous')) {
            return 'Halaman sebelumnya';
        }

        if (normalizedLabel.includes('next') || normalizedLabel.includes('pagination.next')) {
            return 'Halaman berikutnya';
        }

        return label.includes('...') ? 'Halaman lainnya' : `Halaman ${label}`;
    }

    function setTransactionType(nextType: string) {
        const nextCategory = nextType === 'saving' ? undefined : categories.find((category) => category.type === nextType);

        setQuickReviewSuggestionId(null);
        form.setData((data) => ({
            ...data,
            type: nextType,
            category_id: nextCategory?.id?.toString() ?? '',
            saving_goal_id: nextType === 'saving' ? (savingGoals[0]?.id?.toString() ?? '') : data.saving_goal_id,
            need_type: nextType === 'saving' ? 'financial' : data.need_type,
        }));
    }

    function applySuggestion(suggestion: TransactionSuggestion) {
        const selectedAccount = accounts.find((account) => account.id === suggestion.financial_account_id);

        setEditingTransactionId(null);
        setQuickReviewSuggestionId(suggestion.id);
        form.clearErrors();
        form.setData((data) => ({
            ...data,
            type: suggestion.type,
            financial_account_id: suggestion.financial_account_id.toString(),
            category_id: suggestion.type === 'saving' ? '' : (suggestion.category_id?.toString() ?? ''),
            saving_goal_id:
                suggestion.saving_goal_id?.toString() ??
                (suggestion.type === 'saving' ? (savingGoals[0]?.id?.toString() ?? '') : data.saving_goal_id),
            amount: toFormString(suggestion.amount),
            transaction_date: data.transaction_date, // Preserve user-selected date
            merchant: suggestion.merchant,
            need_type: suggestion.need_type,
            visibility: selectedAccount?.visibility === 'family' ? 'family' : data.visibility,
        }));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs} pageTitle="Transaksi">
            <Head title="Transaksi" />
            <div className="finance-page">
                <PageHeader
                    title="Transaksi"
                    description="Catat pemasukan, pengeluaran, dan transfer antar akun. Perubahan saldo dihitung oleh service Laravel."
                    icon={ReceiptText}
                />

                <div className="grid gap-4 xl:grid-cols-[520px_1fr]">
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between gap-3">
                                    <CardTitle>{editingTransactionId ? 'Edit Transaksi' : 'Tambah Transaksi'}</CardTitle>
                                    {editingTransactionId && (
                                        <button
                                            type="button"
                                            className="text-muted-foreground rounded-md p-2 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white"
                                            onClick={resetTransactionForm}
                                            aria-label="Batal edit transaksi"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <form noValidate className="space-y-4" onSubmit={submit}>
                                    <div className="space-y-2">
                                        <RequiredLabel>Tipe</RequiredLabel>
                                        <div className="border-input grid h-12 grid-cols-3 rounded-md border bg-slate-50 p-1 shadow-sm dark:bg-slate-950">
                                            {transactionTypeOptions.map((typeOption) => (
                                                <button
                                                    key={typeOption.value}
                                                    type="button"
                                                    className={`rounded-sm px-2 text-sm font-semibold whitespace-nowrap transition-all ${
                                                        form.data.type === typeOption.value
                                                            ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-900 dark:text-blue-300'
                                                            : 'text-muted-foreground hover:text-slate-900 dark:hover:text-white'
                                                    }`}
                                                    onClick={() => setTransactionType(typeOption.value)}
                                                >
                                                    {typeOption.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {!editingTransactionId && (
                                        <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-3 dark:border-blue-900/50 dark:bg-blue-950/20">
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                                                        <Sparkles className="size-4 text-blue-600" /> Sering dipakai
                                                    </p>
                                                    <p className="text-muted-foreground mt-1 text-xs">
                                                        Pilih dari riwayat pribadi, lalu cek ulang sebelum simpan.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                                {activeSuggestions.length === 0 ? (
                                                    <p className="text-muted-foreground rounded-md border border-dashed bg-white/70 p-3 text-sm dark:bg-slate-950/70">
                                                        Belum ada saran untuk tipe ini.
                                                    </p>
                                                ) : (
                                                    activeSuggestions.map((suggestion) => (
                                                        <button
                                                            key={suggestion.id}
                                                            type="button"
                                                            className={`rounded-md border bg-white p-3 text-left transition-all hover:border-blue-300 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:bg-slate-950 ${
                                                                quickReviewSuggestionId === suggestion.id
                                                                    ? 'border-blue-400 ring-2 ring-blue-100 dark:ring-blue-950'
                                                                    : 'border-slate-200 dark:border-slate-800'
                                                            }`}
                                                            onClick={() => applySuggestion(suggestion)}
                                                        >
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="min-w-0">
                                                                    <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                                                                        {suggestion.merchant}
                                                                    </p>
                                                                    <p className="text-muted-foreground mt-1 truncate text-xs">
                                                                        {suggestion.category_name ?? suggestion.saving_goal_name ?? 'Tanpa kategori'}{' '}
                                                                        - {suggestion.account_label ?? 'Akun'}
                                                                    </p>
                                                                </div>
                                                                <span className="shrink-0 text-sm font-bold text-blue-700 dark:text-blue-300">
                                                                    {formatMoney(suggestion.amount)}
                                                                </span>
                                                            </div>
                                                            <p className="text-muted-foreground mt-2 text-xs">
                                                                Dipakai {suggestion.usage_count}x
                                                                {suggestion.last_used_at ? ` - terakhir ${suggestion.last_used_at}` : ''}
                                                            </p>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {quickReviewSuggestion && !editingTransactionId && (
                                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/20">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                                                    <CheckCircle2 className="size-4" /> Review cepat siap disimpan
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={submit}
                                                    className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:bg-emerald-700 dark:hover:bg-emerald-600"
                                                >
                                                    Simpan Langsung
                                                </button>
                                            </div>
                                            <div className="mt-3 grid gap-2 text-xs text-slate-700 sm:grid-cols-2 dark:text-slate-200">
                                                <span>Judul: {form.data.merchant}</span>
                                                <span>Nominal: {formatMoney(form.data.amount || 0)}</span>
                                                <span>Akun: {selectedAccountLabel}</span>
                                                <span>
                                                    {form.data.type === 'saving' ? 'Target' : 'Kategori'}: {selectedCategoryLabel}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <RequiredLabel>Tanggal</RequiredLabel>
                                        <DatePickerInput
                                            value={form.data.transaction_date}
                                            onValueChange={(value) => form.setData('transaction_date', value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <RequiredLabel>{form.data.type === 'saving' ? 'Akun sumber' : 'Akun'}</RequiredLabel>
                                        <FinanceSelect
                                            value={form.data.financial_account_id}
                                            onValueChange={setSelectedAccount}
                                            options={accounts.map((account) => ({
                                                value: account.id.toString(),
                                                label: accountLabel(account, true),
                                            }))}
                                            placeholder="Pilih akun"
                                        />
                                        <FormError message={form.errors.financial_account_id} />
                                    </div>
                                    {form.data.type === 'saving' ? (
                                        <div className="space-y-2">
                                            <RequiredLabel>Target tabungan</RequiredLabel>
                                            <FinanceSelect
                                                value={form.data.saving_goal_id}
                                                onValueChange={(value) => form.setData('saving_goal_id', value)}
                                                options={savingGoals.map((goal) => ({
                                                    value: goal.id.toString(),
                                                    label: goal.account ? `${goal.name} - ${accountLabel(goal.account, true)}` : goal.name,
                                                }))}
                                                placeholder="Pilih target tabungan"
                                            />
                                            <FormError message={form.errors.saving_goal_id} />
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <RequiredLabel>Kategori</RequiredLabel>
                                            <FinanceSelect
                                                value={form.data.category_id}
                                                onValueChange={(value) => form.setData('category_id', value)}
                                                options={filteredCategories.map((category) => ({
                                                    value: category.id.toString(),
                                                    label: category.name,
                                                }))}
                                                placeholder="Pilih kategori"
                                            />
                                            <FormError message={form.errors.category_id} />
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <RequiredLabel>Nominal</RequiredLabel>
                                        <CurrencyInput value={form.data.amount} onValueChange={(value) => form.setData('amount', value)} />
                                        <div className="flex flex-wrap gap-2">
                                            {amountPresetValues.map((amount) => (
                                                <button
                                                    key={amount}
                                                    type="button"
                                                    className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200 dark:hover:bg-blue-900/50"
                                                    onClick={() => form.setData('amount', amount.toString())}
                                                >
                                                    {formatMoney(amount)}
                                                </button>
                                            ))}
                                        </div>
                                        <FormError message={form.errors.amount} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <RequiredLabel>Judul</RequiredLabel>
                                            <Input
                                                value={form.data.merchant}
                                                onChange={(event) => form.setData('merchant', event.target.value)}
                                                placeholder="Contoh: Rokok, Bensin, dll"
                                            />
                                            <FormError message={form.errors.merchant} />
                                        </div>
                                        <div className="space-y-2">
                                            <RequiredLabel>Kebutuhan</RequiredLabel>
                                            <FinanceSelect
                                                value={form.data.need_type}
                                                onValueChange={(value) => form.setData('need_type', value)}
                                                options={[
                                                    { value: 'essential', label: 'Wajib' },
                                                    { value: 'flexible', label: 'Fleksibel' },
                                                    { value: 'lifestyle', label: 'Lifestyle' },
                                                    { value: 'financial', label: 'Finansial' },
                                                    { value: 'unclassified', label: 'Belum diklasifikasi' },
                                                ]}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Deskripsi</Label>
                                        <Input
                                            value={form.data.description}
                                            onChange={(event) => form.setData('description', event.target.value)}
                                            placeholder="Belanja bulanan"
                                        />
                                    </div>
                                    <SubmitButton processing={form.processing}>
                                        {editingTransactionId ? 'Perbarui Transaksi' : 'Simpan Transaksi'}
                                    </SubmitButton>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="inline-flex items-center gap-2">
                                    <ArrowRightLeft className="size-4" /> Transfer
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form noValidate className="space-y-4" onSubmit={submitTransfer}>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <RequiredLabel>Dari</RequiredLabel>
                                            <FinanceSelect
                                                value={transferForm.data.from_account_id}
                                                onValueChange={(value) => transferForm.setData('from_account_id', value)}
                                                options={accounts.map((account) => ({
                                                    value: account.id.toString(),
                                                    label: accountLabel(account, true),
                                                }))}
                                                placeholder="Pilih akun"
                                            />
                                            <FormError message={transferForm.errors.from_account_id} />
                                        </div>
                                        <div className="space-y-2">
                                            <RequiredLabel>Ke</RequiredLabel>
                                            <FinanceSelect
                                                value={transferForm.data.to_account_id}
                                                onValueChange={(value) => transferForm.setData('to_account_id', value)}
                                                options={accounts.map((account) => ({
                                                    value: account.id.toString(),
                                                    label: accountLabel(account, true),
                                                }))}
                                                placeholder="Pilih akun"
                                            />
                                            <FormError message={transferForm.errors.to_account_id} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <RequiredLabel>Nominal</RequiredLabel>
                                            <CurrencyInput
                                                value={transferForm.data.amount}
                                                onValueChange={(value) => transferForm.setData('amount', value)}
                                            />
                                            <FormError message={transferForm.errors.amount} />
                                        </div>
                                        <div className="space-y-2">
                                            <RequiredLabel>Tanggal</RequiredLabel>
                                            <DatePickerInput
                                                value={transferForm.data.transfer_date}
                                                onValueChange={(value) => transferForm.setData('transfer_date', value)}
                                            />
                                            <FormError message={transferForm.errors.transfer_date} />
                                        </div>
                                    </div>
                                    <SubmitButton processing={transferForm.processing}>Simpan Transfer</SubmitButton>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="h-fit self-start">
                        <CardHeader>
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <CardTitle>Riwayat Transaksi</CardTitle>
                                <div className="w-full md:w-56">
                                    <FinanceSelect
                                        value={selectedHistoryType}
                                        onValueChange={filterTransactionHistory}
                                        options={transactionTypeFilterOptions}
                                        searchPlaceholder="Cari tipe..."
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {transactions.data.length === 0 && (
                                <p className="text-muted-foreground rounded-lg border p-4 text-sm">Belum ada transaksi untuk tipe ini.</p>
                            )}
                            {transactions.data.map((transaction) => (
                                <div key={transaction.id} className="finance-panel-list">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-medium">{transactionTitle(transaction)}</p>
                                            <FinanceBadge value={transaction.type} />
                                        </div>
                                        <p className="text-muted-foreground mt-1 text-sm">
                                            {accountLabel(transaction.account)} · {transaction.category?.name} ·{' '}
                                            <DateTimeDisplay
                                                value={transaction.transaction_date}
                                                timeSource={transaction.updated_at ?? transaction.created_at}
                                            />
                                        </p>
                                        <p className="text-muted-foreground mt-1 text-xs">
                                            Dibuat oleh {transactionCreator(transaction)}
                                            {transaction.created_at && (
                                                <>
                                                    {' '}
                                                    - <DateTimeDisplay value={transaction.created_at} />
                                                </>
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MoneyDisplay
                                            value={transaction.amount}
                                            className={
                                                transaction.type === 'income'
                                                    ? 'font-semibold text-emerald-600'
                                                    : transaction.type === 'saving'
                                                      ? 'font-semibold text-teal-600'
                                                      : 'font-semibold text-rose-600'
                                            }
                                        />
                                        {transaction.can_edit !== false && (
                                            <button
                                                className="text-muted-foreground rounded-md p-2 hover:bg-blue-50 hover:text-blue-700"
                                                onClick={() => editTransaction(transaction)}
                                                aria-label="Edit transaksi"
                                            >
                                                <Pencil className="size-4" />
                                            </button>
                                        )}
                                        {transaction.can_delete !== false && (
                                            <button
                                                className="text-muted-foreground rounded-md p-2 hover:bg-rose-50 hover:text-rose-700"
                                                onClick={() => {
                                                    if (window.confirm('Yakin ingin menghapus transaksi ini?')) {
                                                        router.delete(`/transactions/${transaction.id}`, { preserveScroll: true });
                                                    }
                                                }}
                                                aria-label="Hapus transaksi"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {transactions.links && transactions.links.length > 3 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {transactions.links.map((link, index) => {
                                        const isDisabled = !link.url;
                                        const itemClassName = `inline-flex size-10 items-center justify-center rounded-md border text-sm font-semibold transition-colors ${
                                            link.active
                                                ? 'border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950'
                                                : isDisabled
                                                  ? 'cursor-not-allowed border-slate-200 text-slate-300 dark:border-slate-800 dark:text-slate-700'
                                                  : 'text-muted-foreground hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:border-blue-900 dark:hover:bg-blue-950 dark:hover:text-blue-300'
                                        }`;

                                        return isDisabled ? (
                                            <span
                                                key={`${link.label}-${index}`}
                                                className={itemClassName}
                                                aria-label={paginationAriaLabel(link.label)}
                                            >
                                                {paginationContent(link.label)}
                                            </span>
                                        ) : (
                                            <Link
                                                key={`${link.label}-${index}`}
                                                href={link.url}
                                                className={itemClassName}
                                                preserveScroll
                                                aria-label={paginationAriaLabel(link.label)}
                                            >
                                                {paginationContent(link.label)}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
