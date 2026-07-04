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
import { type Category, type FinanceTransaction, type FinancialAccount, type Paginated, type SavingGoal } from '@/types/finance';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowRightLeft, Pencil, ReceiptText, Trash2, X } from 'lucide-react';
import { useState, type React } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Transaksi', href: '/transactions' }];
const nominalPresets = [10000, 20000, 30000, 40000, 50000];
const transactionTypeFilterOptions = [
    { value: 'all', label: 'Semua tipe' },
    { value: 'income', label: 'Pemasukan' },
    { value: 'expense', label: 'Pengeluaran' },
    { value: 'saving', label: 'Tabungan' },
];

interface TransactionsProps {
    transactions: Paginated<FinanceTransaction>;
    accounts: FinancialAccount[];
    categories: Category[];
    savingGoals: SavingGoal[];
    filters: {
        type: string;
    };
}

export default function TransactionsIndex({ transactions, accounts, categories, savingGoals, filters }: TransactionsProps) {
    const [editingTransactionId, setEditingTransactionId] = useState<number | null>(null);
    const form = useForm({
        financial_account_id: accounts[0]?.id?.toString() ?? '',
        category_id: categories[0]?.id?.toString() ?? '',
        saving_goal_id: savingGoals[0]?.id?.toString() ?? '',
        type: 'expense',
        amount: '',
        transaction_date: new Date().toISOString().slice(0, 10),
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
        form.clearErrors();
        form.setData({
            financial_account_id: accounts[0]?.id?.toString() ?? '',
            category_id: categories[0]?.id?.toString() ?? '',
            saving_goal_id: savingGoals[0]?.id?.toString() ?? '',
            type: 'expense',
            amount: '',
            transaction_date: new Date().toISOString().slice(0, 10),
            description: '',
            merchant: '',
            tags: '',
            visibility: accounts[0]?.visibility === 'family' ? 'family' : 'private',
            need_type: 'unclassified',
        });
    }

    function editTransaction(transaction: FinanceTransaction) {
        setEditingTransactionId(transaction.id);
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
        return transaction.user?.name || transaction.user?.email || 'User';
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
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <RequiredLabel>Tipe</RequiredLabel>
                                            <FinanceSelect
                                                value={form.data.type}
                                                onValueChange={(nextType) => {
                                                    const nextCategory =
                                                        nextType === 'saving' ? undefined : categories.find((category) => category.type === nextType);
                                                    form.setData((data) => ({
                                                        ...data,
                                                        type: nextType,
                                                        category_id: nextCategory?.id?.toString() ?? '',
                                                        saving_goal_id:
                                                            nextType === 'saving' ? (savingGoals[0]?.id?.toString() ?? '') : data.saving_goal_id,
                                                        need_type: nextType === 'saving' ? 'financial' : data.need_type,
                                                    }));
                                                }}
                                                options={[
                                                    { value: 'expense', label: 'Pengeluaran' },
                                                    { value: 'income', label: 'Pemasukan' },
                                                    { value: 'saving', label: 'Tabungan' },
                                                ]}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <RequiredLabel>Tanggal</RequiredLabel>
                                            <DatePickerInput
                                                value={form.data.transaction_date}
                                                onValueChange={(value) => form.setData('transaction_date', value)}
                                            />
                                        </div>
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
                                            {nominalPresets.map((amount) => (
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

                    <Card>
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
                                                onClick={() => router.delete(`/transactions/${transaction.id}`, { preserveScroll: true })}
                                                aria-label="Hapus transaksi"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {transactions.links && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {transactions.links.map((link, index) => (
                                        <Link
                                            key={`${link.label}-${index}`}
                                            href={link.url || '#'}
                                            className={`rounded-md border px-3 py-1 text-sm ${link.active ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-muted-foreground'}`}
                                            preserveScroll
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
