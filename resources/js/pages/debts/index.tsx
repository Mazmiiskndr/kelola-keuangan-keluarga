import { DateTimeDisplay } from '@/components/finance/date-display';
import { FinanceSelect } from '@/components/finance/finance-select';
import { FormError } from '@/components/finance/form-error';
import { MoneyDisplay } from '@/components/finance/money-display';
import { PageHeader, SubmitButton } from '@/components/finance/page-header';
import { ProgressRow } from '@/components/finance/progress-row';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { accountLabel } from '@/lib/finance-labels';
import { type BreadcrumbItem } from '@/types';
import { type Category, type Debt, type FinancialAccount } from '@/types/finance';
import { Head, router, useForm } from '@inertiajs/react';
import { HandCoins, Trash2 } from 'lucide-react';
import type React from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Hutang', href: '/debts' }];

interface DebtsProps {
    debts: Debt[];
    accounts: FinancialAccount[];
    categories: Category[];
}

export default function DebtsIndex({ debts, accounts, categories }: DebtsProps) {
    const form = useForm({
        name: '',
        type: 'installment',
        lender: '',
        principal_amount: '',
        outstanding_amount: '',
        monthly_payment: '',
        minimum_payment: '',
        interest_rate: '0',
        start_date: '',
        tenor_months: '',
        remaining_tenor_months: '',
        due_day: '',
        next_due_date: '',
        payment_account_id: accounts[0]?.id?.toString() ?? '',
        category_id: categories[0]?.id?.toString() ?? '',
        auto_generate_expense: true,
        include_in_monthly_expense: true,
    });

    const paymentForm = useForm({
        debt_id: debts[0]?.id?.toString() ?? '',
        payment_account_id: accounts[0]?.id?.toString() ?? '',
        category_id: categories[0]?.id?.toString() ?? '',
        amount: '',
        principal_amount: '',
        interest_amount: '0',
        fee_amount: '0',
        due_date: '',
        paid_at: new Date().toISOString().slice(0, 10),
        notes: '',
    });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.post('/debts', {
            preserveScroll: true,
            onSuccess: () =>
                form.reset(
                    'name',
                    'lender',
                    'principal_amount',
                    'outstanding_amount',
                    'monthly_payment',
                    'minimum_payment',
                    'tenor_months',
                    'remaining_tenor_months',
                    'due_day',
                    'next_due_date',
                ),
        });
    }

    function pay(event: React.FormEvent) {
        event.preventDefault();
        if (!paymentForm.data.debt_id) {
            return;
        }

        paymentForm.post(`/debts/${paymentForm.data.debt_id}/payments`, {
            preserveScroll: true,
            onSuccess: () => paymentForm.reset('amount', 'principal_amount', 'interest_amount', 'fee_amount', 'notes'),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Hutang" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Hutang dan Cicilan"
                    description="Catat pinjaman, kartu kredit, cicilan, jatuh tempo, dan pembayaran bulanan agar masuk dalam perhitungan pengeluaran wajib."
                    icon={HandCoins}
                />
                <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
                    <div className="space-y-4">
                        <Card className="rounded-lg">
                            <CardHeader>
                                <CardTitle>Tambah Hutang</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4" onSubmit={submit}>
                                    <div className="space-y-2">
                                        <Label>Nama</Label>
                                        <Input
                                            value={form.data.name}
                                            onChange={(event) => form.setData('name', event.target.value)}
                                            placeholder="KPR rumah"
                                        />
                                        <FormError message={form.errors.name} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label>Tipe</Label>
                                            <FinanceSelect
                                                value={form.data.type}
                                                onValueChange={(value) => form.setData('type', value)}
                                                options={[
                                                    { value: 'installment', label: 'Cicilan' },
                                                    { value: 'credit_card', label: 'Kartu kredit' },
                                                    { value: 'loan', label: 'Pinjaman' },
                                                    { value: 'paylater', label: 'Paylater' },
                                                ]}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Pemberi hutang</Label>
                                            <Input value={form.data.lender} onChange={(event) => form.setData('lender', event.target.value)} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label>Pokok hutang</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={form.data.principal_amount}
                                                onChange={(event) => form.setData('principal_amount', event.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Sisa hutang</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={form.data.outstanding_amount}
                                                onChange={(event) => form.setData('outstanding_amount', event.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label>Cicilan bulanan</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={form.data.monthly_payment}
                                                onChange={(event) => form.setData('monthly_payment', event.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Bunga %</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={form.data.interest_rate}
                                                onChange={(event) => form.setData('interest_rate', event.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label>Akun bayar</Label>
                                            <FinanceSelect
                                                value={form.data.payment_account_id}
                                                onValueChange={(value) => form.setData('payment_account_id', value)}
                                                options={accounts.map((account) => ({
                                                    value: account.id.toString(),
                                                    label: accountLabel(account, true),
                                                }))}
                                                placeholder="Pilih akun"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Kategori</Label>
                                            <FinanceSelect
                                                value={form.data.category_id}
                                                onValueChange={(value) => form.setData('category_id', value)}
                                                options={categories.map((category) => ({
                                                    value: category.id.toString(),
                                                    label: category.name,
                                                }))}
                                                placeholder="Pilih kategori"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label>Jatuh tempo</Label>
                                            <Input
                                                type="date"
                                                value={form.data.next_due_date}
                                                onChange={(event) => form.setData('next_due_date', event.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Sisa tenor</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={form.data.remaining_tenor_months}
                                                onChange={(event) => form.setData('remaining_tenor_months', event.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-2 text-sm">
                                        <Checkbox
                                            checked={form.data.include_in_monthly_expense}
                                            onCheckedChange={(value) => form.setData('include_in_monthly_expense', Boolean(value))}
                                        />{' '}
                                        Masukkan ke pengeluaran wajib bulanan
                                    </label>
                                    <SubmitButton processing={form.processing}>Simpan Hutang</SubmitButton>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="rounded-lg">
                            <CardHeader>
                                <CardTitle>Bayar Cicilan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4" onSubmit={pay}>
                                    <div className="space-y-2">
                                        <Label>Hutang</Label>
                                        <FinanceSelect
                                            value={paymentForm.data.debt_id}
                                            onValueChange={(value) => {
                                                const debt = debts.find((item) => item.id.toString() === value);
                                                paymentForm.setData((data) => ({
                                                    ...data,
                                                    debt_id: value,
                                                    payment_account_id: debt?.payment_account?.id?.toString() ?? data.payment_account_id,
                                                    category_id: debt?.category?.id?.toString() ?? data.category_id,
                                                    amount: debt?.monthly_payment?.toString() ?? data.amount,
                                                    principal_amount: debt?.monthly_payment?.toString() ?? data.principal_amount,
                                                }));
                                            }}
                                            options={debts.map((debt) => ({
                                                value: debt.id.toString(),
                                                label: debt.name,
                                            }))}
                                            placeholder="Pilih hutang"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label>Nominal bayar</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={paymentForm.data.amount}
                                                onChange={(event) => paymentForm.setData('amount', event.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tanggal bayar</Label>
                                            <Input
                                                type="date"
                                                value={paymentForm.data.paid_at}
                                                onChange={(event) => paymentForm.setData('paid_at', event.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <SubmitButton processing={paymentForm.processing}>Catat Pembayaran</SubmitButton>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Daftar Hutang</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {debts.map((debt) => (
                                <div key={debt.id} className="rounded-lg border p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-medium">{debt.name}</p>
                                                <Badge variant="outline">{debt.type}</Badge>
                                                <Badge variant="secondary">{debt.status}</Badge>
                                            </div>
                                            <p className="text-muted-foreground mt-1 text-sm">
                                                {debt.lender || 'Tanpa lender'} · jatuh tempo <DateTimeDisplay value={debt.next_due_date} />
                                            </p>
                                        </div>
                                        <button
                                            className="text-muted-foreground rounded-md p-2 hover:bg-rose-50 hover:text-rose-700"
                                            onClick={() => router.delete(`/debts/${debt.id}`, { preserveScroll: true })}
                                            aria-label="Arsipkan hutang"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                                        <ProgressRow
                                            label="Sisa hutang"
                                            value={debt.outstanding_amount}
                                            target={debt.principal_amount}
                                            tone="amber"
                                        />
                                        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                                            <p className="text-muted-foreground text-sm">Cicilan bulanan</p>
                                            <p className="mt-1 text-lg font-semibold">
                                                <MoneyDisplay value={debt.monthly_payment} />
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
