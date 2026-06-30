import { CurrencyInput } from '@/components/finance/currency-input';
import { DateTimeDisplay } from '@/components/finance/date-display';
import { DatePickerInput } from '@/components/finance/date-picker-input';
import { FinanceBadge } from '@/components/finance/finance-badge';
import { FinanceSelect } from '@/components/finance/finance-select';
import { FormError } from '@/components/finance/form-error';
import { MoneyDisplay } from '@/components/finance/money-display';
import { PageHeader, SubmitButton } from '@/components/finance/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { accountLabel } from '@/lib/finance-labels';
import { type BreadcrumbItem } from '@/types';
import { type Category, type FinanceTransaction, type FinancialAccount, type Paginated, type SavingGoal } from '@/types/finance';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowRightLeft, ReceiptText, Trash2 } from 'lucide-react';
import type React from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Transaksi', href: '/transactions' }];

interface TransactionsProps {
    transactions: Paginated<FinanceTransaction>;
    accounts: FinancialAccount[];
    categories: Category[];
    savingGoals: SavingGoal[];
}

export default function TransactionsIndex({ transactions, accounts, categories, savingGoals }: TransactionsProps) {
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
        visibility: 'private',
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

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.post('/transactions', { preserveScroll: true, onSuccess: () => form.reset('amount', 'description', 'merchant', 'tags') });
    }

    function submitTransfer(event: React.FormEvent) {
        event.preventDefault();
        transferForm.post('/transfers', { preserveScroll: true, onSuccess: () => transferForm.reset('amount', 'description') });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transaksi" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Transaksi"
                    description="Catat pemasukan, pengeluaran, dan transfer antar akun. Perubahan saldo dihitung oleh service Laravel."
                    icon={ReceiptText}
                />

                <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
                    <div className="space-y-4">
                        <Card className="rounded-lg">
                            <CardHeader>
                                <CardTitle>Tambah Transaksi</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4" onSubmit={submit}>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label>Tipe</Label>
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
                                            <Label>Tanggal</Label>
                                            <DatePickerInput
                                                value={form.data.transaction_date}
                                                onValueChange={(value) => form.setData('transaction_date', value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{form.data.type === 'saving' ? 'Akun sumber' : 'Akun'}</Label>
                                        <FinanceSelect
                                            value={form.data.financial_account_id}
                                            onValueChange={(value) => form.setData('financial_account_id', value)}
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
                                            <Label>Target tabungan</Label>
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
                                            <Label>Kategori</Label>
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
                                        <Label>Nominal</Label>
                                        <CurrencyInput value={form.data.amount} onValueChange={(value) => form.setData('amount', value)} />
                                        <FormError message={form.errors.amount} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label>Judul</Label>
                                            <Input
                                                value={form.data.merchant}
                                                onChange={(event) => form.setData('merchant', event.target.value)}
                                                placeholder="Contoh: Rokok, Bensin, dll"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Kebutuhan</Label>
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
                                    <SubmitButton processing={form.processing}>Simpan Transaksi</SubmitButton>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="rounded-lg">
                            <CardHeader>
                                <CardTitle className="inline-flex items-center gap-2">
                                    <ArrowRightLeft className="size-4" /> Transfer
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4" onSubmit={submitTransfer}>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label>Dari</Label>
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
                                            <Label>Ke</Label>
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
                                            <Label>Nominal</Label>
                                            <CurrencyInput
                                                value={transferForm.data.amount}
                                                onValueChange={(value) => transferForm.setData('amount', value)}
                                            />
                                            <FormError message={transferForm.errors.amount} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tanggal</Label>
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

                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Riwayat Transaksi</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {transactions.data.map((transaction) => (
                                <div key={transaction.id} className="flex items-center justify-between gap-4 rounded-lg border p-4">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-medium">
                                                {transaction.type === 'saving'
                                                    ? transaction.saving_goal?.name || transaction.description || 'Tabungan'
                                                    : transaction.merchant || transaction.description || transaction.category?.name || 'Transaksi'}
                                            </p>
                                            <FinanceBadge value={transaction.type} />
                                        </div>
                                        <p className="text-muted-foreground mt-1 text-sm">
                                            {accountLabel(transaction.account)} · {transaction.category?.name} ·{' '}
                                            <DateTimeDisplay value={transaction.transaction_date} />
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
                                        <button
                                            className="text-muted-foreground rounded-md p-2 hover:bg-rose-50 hover:text-rose-700"
                                            onClick={() => router.delete(`/transactions/${transaction.id}`, { preserveScroll: true })}
                                            aria-label="Hapus transaksi"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
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
