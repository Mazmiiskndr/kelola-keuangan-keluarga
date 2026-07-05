import { CurrencyInput } from '@/components/finance/currency-input';
import { DateTimeDisplay } from '@/components/finance/date-display';
import { DatePickerInput } from '@/components/finance/date-picker-input';
import { FinanceBadge } from '@/components/finance/finance-badge';
import { FinanceSelect } from '@/components/finance/finance-select';
import { FormError } from '@/components/finance/form-error';
import { MoneyDisplay } from '@/components/finance/money-display';
import { PageHeader, SubmitButton } from '@/components/finance/page-header';
import { ProgressRow } from '@/components/finance/progress-row';
import { RequiredLabel } from '@/components/finance/required-label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { accountLabel } from '@/lib/finance-labels';
import { toDateInputValue, toFormString } from '@/lib/form-values';
import { type BreadcrumbItem } from '@/types';
import { type Category, type Debt, type FinancialAccount } from '@/types/finance';
import { Head, router, useForm } from '@inertiajs/react';
import { HandCoins, Pencil, Trash2, X } from 'lucide-react';
import { useState, type React } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Hutang', href: '/debts' }];

interface DebtsProps {
    debts: Debt[];
    accounts: FinancialAccount[];
    categories: Category[];
}

export default function DebtsIndex({ debts, accounts, categories }: DebtsProps) {
    const [editingDebtId, setEditingDebtId] = useState<number | null>(null);
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
        const options = {
            preserveScroll: true,
            onSuccess: () => resetDebtForm(),
        };

        if (editingDebtId) {
            form.put(`/debts/${editingDebtId}`, options);

            return;
        }

        form.post('/debts', options);
    }

    function resetDebtForm() {
        setEditingDebtId(null);
        form.setData({
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
    }

    function editDebt(debt: Debt) {
        setEditingDebtId(debt.id);
        form.setData({
            name: debt.name,
            type: debt.type,
            lender: debt.lender ?? '',
            principal_amount: toFormString(debt.principal_amount),
            outstanding_amount: toFormString(debt.outstanding_amount),
            monthly_payment: toFormString(debt.monthly_payment),
            minimum_payment: toFormString(debt.minimum_payment),
            interest_rate: toFormString(debt.interest_rate),
            start_date: toDateInputValue(debt.start_date),
            tenor_months: toFormString(debt.tenor_months),
            remaining_tenor_months: toFormString(debt.remaining_tenor_months),
            due_day: toFormString(debt.due_day),
            next_due_date: toDateInputValue(debt.next_due_date),
            payment_account_id: debt.payment_account_id?.toString() ?? debt.payment_account?.id?.toString() ?? '',
            category_id: debt.category_id?.toString() ?? debt.category?.id?.toString() ?? '',
            auto_generate_expense: Boolean(debt.auto_generate_expense),
            include_in_monthly_expense: Boolean(debt.include_in_monthly_expense),
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
        <AppLayout breadcrumbs={breadcrumbs} pageTitle="Hutang">
            <Head title="Hutang" />
            <div className="finance-page">
                <PageHeader
                    title="Hutang dan Cicilan"
                    description="Catat pinjaman, kartu kredit, cicilan, jatuh tempo, dan pembayaran bulanan agar masuk dalam perhitungan pengeluaran wajib."
                    icon={HandCoins}
                />
                <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between gap-3">
                                    <CardTitle>{editingDebtId ? 'Edit Hutang' : 'Tambah Hutang'}</CardTitle>
                                    {editingDebtId && (
                                        <button
                                            type="button"
                                            className="text-muted-foreground rounded-md p-2 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white"
                                            onClick={resetDebtForm}
                                            aria-label="Batal edit hutang"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <form noValidate className="space-y-4" onSubmit={submit}>
                                    <div className="space-y-2">
                                        <RequiredLabel>Nama</RequiredLabel>
                                        <Input
                                            value={form.data.name}
                                            onChange={(event) => form.setData('name', event.target.value)}
                                            placeholder="KPR rumah"
                                        />
                                        <FormError message={form.errors.name} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <RequiredLabel>Tipe</RequiredLabel>
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
                                            <RequiredLabel>Pokok hutang</RequiredLabel>
                                            <CurrencyInput
                                                value={form.data.principal_amount}
                                                onValueChange={(value) => form.setData('principal_amount', value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Sisa hutang</Label>
                                            <CurrencyInput
                                                value={form.data.outstanding_amount}
                                                onValueChange={(value) => form.setData('outstanding_amount', value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <RequiredLabel>Cicilan bulanan</RequiredLabel>
                                            <CurrencyInput
                                                value={form.data.monthly_payment}
                                                onValueChange={(value) => form.setData('monthly_payment', value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Bunga %</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                inputMode="decimal"
                                                value={form.data.interest_rate}
                                                onChange={(event) => form.setData('interest_rate', event.target.value)}
                                            />
                                            <FormError message={form.errors.interest_rate} />
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
                                            <DatePickerInput
                                                value={form.data.next_due_date}
                                                onValueChange={(value) => form.setData('next_due_date', value)}
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
                                    <SubmitButton processing={form.processing}>{editingDebtId ? 'Perbarui Hutang' : 'Simpan Hutang'}</SubmitButton>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Bayar Cicilan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form noValidate className="space-y-4" onSubmit={pay}>
                                    <div className="space-y-2">
                                        <RequiredLabel>Hutang</RequiredLabel>
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
                                            <RequiredLabel>Nominal bayar</RequiredLabel>
                                            <CurrencyInput
                                                value={paymentForm.data.amount}
                                                onValueChange={(value) => paymentForm.setData('amount', value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tanggal bayar</Label>
                                            <DatePickerInput
                                                value={paymentForm.data.paid_at}
                                                onValueChange={(value) => paymentForm.setData('paid_at', value)}
                                            />
                                        </div>
                                    </div>
                                    <SubmitButton processing={paymentForm.processing}>Catat Pembayaran</SubmitButton>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
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
                                                <FinanceBadge value={debt.type} />
                                                <FinanceBadge value={debt.status} />
                                            </div>
                                            <p className="text-muted-foreground mt-1 text-sm">
                                                {debt.lender || 'Tanpa lender'} · jatuh tempo <DateTimeDisplay value={debt.next_due_date} dateOnly />
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <button
                                                className="text-muted-foreground rounded-md p-2 hover:bg-blue-50 hover:text-blue-700"
                                                onClick={() => editDebt(debt)}
                                                aria-label="Edit hutang"
                                            >
                                                <Pencil className="size-4" />
                                            </button>
                                            <button
                                                className="text-muted-foreground rounded-md p-2 hover:bg-rose-50 hover:text-rose-700"
                                                onClick={() => {
                                                    if (window.confirm('Yakin ingin mengarsipkan hutang ini?')) {
                                                        router.delete(`/debts/${debt.id}`, { preserveScroll: true });
                                                    }
                                                }}
                                                aria-label="Arsipkan hutang"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                                        <ProgressRow
                                            label="Sisa hutang"
                                            value={debt.outstanding_amount}
                                            target={debt.principal_amount}
                                            semantic="budget"
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
