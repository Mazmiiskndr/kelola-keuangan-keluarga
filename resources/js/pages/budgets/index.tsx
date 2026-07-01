import { CurrencyInput } from '@/components/finance/currency-input';
import { DateTimeDisplay } from '@/components/finance/date-display';
import { DateRangePickerInput } from '@/components/finance/date-picker-input';
import { FinanceSelect } from '@/components/finance/finance-select';
import { FormError } from '@/components/finance/form-error';
import { MoneyDisplay } from '@/components/finance/money-display';
import { PageHeader, SubmitButton } from '@/components/finance/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { currentMonthDateRange, toDateInputValue, toFormString } from '@/lib/form-values';
import { type BreadcrumbItem } from '@/types';
import { type Budget, type Category } from '@/types/finance';
import { Head, router, useForm } from '@inertiajs/react';
import { FolderKanban, Pencil, Trash2, X } from 'lucide-react';
import { useState, type React } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Budget', href: '/budgets' }];

interface BudgetsProps {
    budgets: Budget[];
    categories: Category[];
}

export default function BudgetsIndex({ budgets, categories }: BudgetsProps) {
    const [editingBudgetId, setEditingBudgetId] = useState<number | null>(null);
    const defaultPeriod = currentMonthDateRange();
    const form = useForm({
        category_id: categories[0]?.id?.toString() ?? '',
        period_type: 'monthly',
        period_start: defaultPeriod.start,
        period_end: defaultPeriod.end,
        amount: '',
    });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => resetForm() };

        if (editingBudgetId) {
            form.put(`/budgets/${editingBudgetId}`, options);

            return;
        }

        form.post('/budgets', options);
    }

    function resetForm() {
        setEditingBudgetId(null);
        form.setData({
            category_id: categories[0]?.id?.toString() ?? '',
            period_type: 'monthly',
            period_start: defaultPeriod.start,
            period_end: defaultPeriod.end,
            amount: '',
        });
    }

    function editBudget(budget: Budget) {
        setEditingBudgetId(budget.id);
        form.setData({
            category_id: budget.category_id?.toString() ?? budget.category?.id?.toString() ?? '',
            period_type: budget.period_type ?? 'monthly',
            period_start: toDateInputValue(budget.period_start),
            period_end: toDateInputValue(budget.period_end),
            amount: toFormString(budget.amount),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Budget" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Budget Bulanan"
                    description="Tetapkan batas pengeluaran per kategori agar kebutuhan wajib, lifestyle, dan potensi hemat terlihat jelas."
                    icon={FolderKanban}
                />
                <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
                    <Card className="rounded-lg">
                        <CardHeader>
                            <div className="flex items-center justify-between gap-3">
                                <CardTitle>{editingBudgetId ? 'Edit Budget' : 'Tambah Budget'}</CardTitle>
                                {editingBudgetId && (
                                    <button
                                        type="button"
                                        className="text-muted-foreground rounded-md p-2 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white"
                                        onClick={resetForm}
                                        aria-label="Batal edit budget"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={submit}>
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
                                    <FormError message={form.errors.category_id} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Periode</Label>
                                    <DateRangePickerInput
                                        startValue={form.data.period_start}
                                        endValue={form.data.period_end}
                                        onStartChange={(value) => form.setData('period_start', value)}
                                        onEndChange={(value) => form.setData('period_end', value)}
                                    />
                                    <FormError message={form.errors.period_start || form.errors.period_end} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nominal</Label>
                                    <CurrencyInput value={form.data.amount} onValueChange={(value) => form.setData('amount', value)} />
                                    <FormError message={form.errors.amount} />
                                </div>
                                <SubmitButton processing={form.processing}>{editingBudgetId ? 'Perbarui Budget' : 'Simpan Budget'}</SubmitButton>
                            </form>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Daftar Budget</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {budgets.map((budget) => (
                                <div key={budget.id} className="flex items-center justify-between gap-4 rounded-lg border p-4">
                                    <div>
                                        <p className="font-medium">{budget.category?.name ?? 'Kategori'}</p>
                                        <p className="text-muted-foreground text-sm">
                                            <DateTimeDisplay value={budget.period_start} dateOnly /> s/d <DateTimeDisplay value={budget.period_end} dateOnly />
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MoneyDisplay value={budget.amount} className="font-semibold" />
                                        <button
                                            className="text-muted-foreground rounded-md p-2 hover:bg-blue-50 hover:text-blue-700"
                                            onClick={() => editBudget(budget)}
                                            aria-label="Edit budget"
                                        >
                                            <Pencil className="size-4" />
                                        </button>
                                        <button
                                            className="text-muted-foreground rounded-md p-2 hover:bg-rose-50 hover:text-rose-700"
                                            onClick={() => router.delete(`/budgets/${budget.id}`, { preserveScroll: true })}
                                            aria-label="Hapus budget"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
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
