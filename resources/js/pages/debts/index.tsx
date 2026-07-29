import { CurrencyInput } from '@/components/finance/currency-input';
import { DateTimeDisplay } from '@/components/finance/date-display';
import { DatePickerInput } from '@/components/finance/date-picker-input';
import { DebtArchiveDialog } from '@/components/finance/debt-archive-dialog';
import { DebtBalanceSummary } from '@/components/finance/debt-balance-summary';
import { FinanceBadge } from '@/components/finance/finance-badge';
import { FinanceSelect } from '@/components/finance/finance-select';
import { FormError } from '@/components/finance/form-error';
import { formatMoney } from '@/components/finance/money-display';
import { PageHeader, SubmitButton } from '@/components/finance/page-header';
import { RequiredLabel } from '@/components/finance/required-label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { accountLabel } from '@/lib/finance-labels';
import { toDateInputValue, toFormString } from '@/lib/form-values';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { type Category, type Debt, type FinancialAccount } from '@/types/finance';
import { Head, useForm } from '@inertiajs/react';
import { Archive, Check, HandCoins, Pencil, X } from 'lucide-react';
import { useState, type React } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Hutang', href: '/debts' }];
const installmentTenors = [6, 12, 24];

function calculateRemainingTenor(outstandingAmount: string, monthlyPayment: string): string {
    const outstanding = Number(outstandingAmount);
    const payment = Number(monthlyPayment);

    if (!Number.isFinite(outstanding) || !Number.isFinite(payment) || outstanding <= 0 || payment <= 0) {
        return '';
    }

    return Math.ceil(outstanding / payment).toString();
}

interface DebtsProps {
    debts: Debt[];
    accounts: FinancialAccount[];
    categories: Category[];
}

export default function DebtsIndex({ debts, accounts, categories }: DebtsProps) {
    const [editingDebtId, setEditingDebtId] = useState<number | null>(null);
    const [selectedPaymentPreset, setSelectedPaymentPreset] = useState<'monthly' | 'minimum' | 'full' | null>(null);
    const [debtToArchive, setDebtToArchive] = useState<Debt | null>(null);
    const payableDebts = debts.filter((debt) => debt.status === 'active' && Number(debt.outstanding_amount) > 0);
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
        debt_id: payableDebts[0]?.id?.toString() ?? '',
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
    const selectedPaymentDebt = payableDebts.find((debt) => debt.id.toString() === paymentForm.data.debt_id);
    const recommendedPaymentAmount = selectedPaymentDebt
        ? Math.min(Number(selectedPaymentDebt.monthly_payment), Number(selectedPaymentDebt.outstanding_amount))
        : 0;
    const outstandingAmount = Number(form.data.outstanding_amount);
    const hasOutstandingAmount = outstandingAmount > 0;

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
            onSuccess: () => {
                paymentForm.reset('amount', 'principal_amount', 'interest_amount', 'fee_amount', 'notes');
                setSelectedPaymentPreset(null);
            },
        });
    }

    function applyPaymentPreset(amount: number, preset: 'monthly' | 'minimum' | 'full') {
        setSelectedPaymentPreset(preset);
        paymentForm.setData((data) => ({
            ...data,
            amount: amount.toString(),
            principal_amount: amount.toString(),
        }));
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
                <div className="grid gap-4 xl:grid-cols-[550px_1fr]">
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
                                            <Input
                                                value={form.data.lender}
                                                onChange={(event) => form.setData('lender', event.target.value)}
                                                placeholder="Contoh: Bank, Kredivo, atau kerabat"
                                            />
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
                                                onValueChange={(value) =>
                                                    form.setData((data) => ({
                                                        ...data,
                                                        outstanding_amount: value,
                                                        remaining_tenor_months: calculateRemainingTenor(value, data.monthly_payment),
                                                    }))
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <RequiredLabel>Cicilan bulanan</RequiredLabel>
                                            <CurrencyInput
                                                value={form.data.monthly_payment}
                                                onValueChange={(value) =>
                                                    form.setData((data) => ({
                                                        ...data,
                                                        monthly_payment: value,
                                                        remaining_tenor_months: calculateRemainingTenor(data.outstanding_amount, value),
                                                    }))
                                                }
                                                disabled={!hasOutstandingAmount}
                                                placeholder={hasOutstandingAmount ? '0' : 'Isi sisa hutang terlebih dahulu'}
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
                                    <div className="space-y-2">
                                        <Label>Rekomendasi cicilan</Label>
                                        {hasOutstandingAmount ? (
                                            <div className="flex gap-2 overflow-x-auto pb-1">
                                                {installmentTenors.map((tenor) => {
                                                    const monthlyPayment = Math.ceil(outstandingAmount / tenor);

                                                    return (
                                                        <button
                                                            key={tenor}
                                                            type="button"
                                                            className="shrink-0 rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-500/20 dark:text-blue-300"
                                                            onClick={() =>
                                                                form.setData((data) => ({
                                                                    ...data,
                                                                    monthly_payment: monthlyPayment.toString(),
                                                                    remaining_tenor_months: calculateRemainingTenor(
                                                                        data.outstanding_amount,
                                                                        monthlyPayment.toString(),
                                                                    ),
                                                                }))
                                                            }
                                                        >
                                                            {tenor}x · {formatMoney(monthlyPayment)}/bulan
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground text-xs">Isi sisa hutang untuk melihat rekomendasi cicilan.</p>
                                        )}
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
                                                readOnly
                                                placeholder="Terisi otomatis"
                                                aria-describedby="remaining-tenor-description"
                                            />
                                            <p id="remaining-tenor-description" className="text-muted-foreground text-xs">
                                                Dihitung dari sisa hutang dan cicilan bulanan.
                                            </p>
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
                                                const debt = payableDebts.find((item) => item.id.toString() === value);
                                                const recommendedAmount = debt
                                                    ? Math.min(Number(debt.monthly_payment), Number(debt.outstanding_amount))
                                                    : 0;
                                                paymentForm.setData((data) => ({
                                                    ...data,
                                                    debt_id: value,
                                                    payment_account_id: debt?.payment_account?.id?.toString() ?? data.payment_account_id,
                                                    category_id: debt?.category?.id?.toString() ?? data.category_id,
                                                    amount: recommendedAmount.toString(),
                                                    principal_amount: recommendedAmount.toString(),
                                                }));
                                                setSelectedPaymentPreset(debt ? 'monthly' : null);
                                            }}
                                            options={payableDebts.map((debt) => ({
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
                                                onValueChange={(value) => {
                                                    setSelectedPaymentPreset(null);
                                                    paymentForm.setData('amount', value);
                                                }}
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
                                    {selectedPaymentDebt && (
                                        <div className="space-y-2">
                                            <Label>Pilih nominal pembayaran</Label>
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    className={cn(
                                                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                                                        selectedPaymentPreset === 'monthly'
                                                            ? 'border-2 border-blue-600 bg-blue-100 text-blue-800 shadow-sm dark:border-blue-400 dark:bg-blue-950/70 dark:text-blue-100'
                                                            : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200',
                                                    )}
                                                    onClick={() => applyPaymentPreset(recommendedPaymentAmount, 'monthly')}
                                                >
                                                    {selectedPaymentPreset === 'monthly' && <Check className="size-3" />}
                                                    Cicilan bulanan ({formatMoney(recommendedPaymentAmount)})
                                                </button>
                                                {Number(selectedPaymentDebt.minimum_payment) > 0 &&
                                                    Number(selectedPaymentDebt.minimum_payment) !== recommendedPaymentAmount && (
                                                        <button
                                                            type="button"
                                                            className={cn(
                                                                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                                                                selectedPaymentPreset === 'minimum'
                                                                    ? 'border-2 border-amber-600 bg-amber-100 text-amber-800 shadow-sm dark:border-amber-400 dark:bg-amber-950/70 dark:text-amber-100'
                                                                    : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200',
                                                            )}
                                                            onClick={() =>
                                                                applyPaymentPreset(
                                                                    Math.min(
                                                                        Number(selectedPaymentDebt.minimum_payment),
                                                                        Number(selectedPaymentDebt.outstanding_amount),
                                                                    ),
                                                                    'minimum',
                                                                )
                                                            }
                                                        >
                                                            {selectedPaymentPreset === 'minimum' && <Check className="size-3" />}
                                                            Bayar minimum
                                                        </button>
                                                    )}
                                                <button
                                                    type="button"
                                                    className={cn(
                                                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                                                        selectedPaymentPreset === 'full'
                                                            ? 'border-2 border-emerald-600 bg-emerald-100 text-emerald-800 shadow-sm dark:border-emerald-400 dark:bg-emerald-950/70 dark:text-emerald-100'
                                                            : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200',
                                                    )}
                                                    onClick={() => applyPaymentPreset(Number(selectedPaymentDebt.outstanding_amount), 'full')}
                                                >
                                                    {selectedPaymentPreset === 'full' && <Check className="size-3" />}
                                                    Lunasi 100% ({formatMoney(selectedPaymentDebt.outstanding_amount)})
                                                </button>
                                            </div>
                                            <p className="text-muted-foreground text-xs">
                                                Maksimal {formatMoney(selectedPaymentDebt.outstanding_amount)} sesuai sisa hutang.
                                            </p>
                                        </div>
                                    )}
                                    <FormError message={paymentForm.errors.amount} />
                                    <SubmitButton processing={paymentForm.processing}>Catat Pembayaran</SubmitButton>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="h-fit self-start">
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
                                                {debt.lender || 'Tanpa lender'} · Jatuh Tempo <DateTimeDisplay value={debt.next_due_date} dateOnly />
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            {debt.status !== 'paid_off' && (
                                                <button
                                                    className="text-muted-foreground rounded-md p-2 hover:bg-blue-50 hover:text-blue-700"
                                                    onClick={() => editDebt(debt)}
                                                    aria-label="Edit hutang"
                                                >
                                                    <Pencil className="size-4" />
                                                </button>
                                            )}
                                            <button
                                                className="text-muted-foreground rounded-md p-2 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/40 dark:hover:text-amber-300"
                                                onClick={() => setDebtToArchive(debt)}
                                                aria-label="Arsipkan hutang"
                                            >
                                                <Archive className="size-4" />
                                            </button>
                                        </div>
                                    </div>
                                    {debt.status === 'paid_off' ? (
                                        <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
                                            <div>
                                                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Hutang sudah lunas</p>
                                                <p className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-300/80">
                                                    Tidak ada pembayaran atau cicilan tersisa.
                                                </p>
                                            </div>
                                            <span className="shrink-0 text-sm font-bold text-emerald-700 dark:text-emerald-200">100%</span>
                                        </div>
                                    ) : (
                                        <DebtBalanceSummary debt={debt} />
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
                <DebtArchiveDialog debt={debtToArchive} onClose={() => setDebtToArchive(null)} />
            </div>
        </AppLayout>
    );
}
