import { DateTimeDisplay } from '@/components/finance/date-display';
import { FinanceSelect } from '@/components/finance/finance-select';
import { FormError } from '@/components/finance/form-error';
import { MoneyDisplay } from '@/components/finance/money-display';
import { PageHeader, SubmitButton } from '@/components/finance/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Budget, type Category } from '@/types/finance';
import { Head, router, useForm } from '@inertiajs/react';
import { FolderKanban, Trash2 } from 'lucide-react';
import type React from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Budget', href: '/budgets' }];

interface BudgetsProps {
    budgets: Budget[];
    categories: Category[];
}

export default function BudgetsIndex({ budgets, categories }: BudgetsProps) {
    const form = useForm({
        category_id: categories[0]?.id?.toString() ?? '',
        period_type: 'monthly',
        period_start: new Date().toISOString().slice(0, 10),
        period_end: new Date().toISOString().slice(0, 10),
        amount: '',
    });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.post('/budgets', { preserveScroll: true, onSuccess: () => form.reset('amount') });
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
                            <CardTitle>Tambah Budget</CardTitle>
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
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label>Mulai</Label>
                                        <Input
                                            type="date"
                                            value={form.data.period_start}
                                            onChange={(event) => form.setData('period_start', event.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Selesai</Label>
                                        <Input
                                            type="date"
                                            value={form.data.period_end}
                                            onChange={(event) => form.setData('period_end', event.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Nominal</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={form.data.amount}
                                        onChange={(event) => form.setData('amount', event.target.value)}
                                    />
                                    <FormError message={form.errors.amount} />
                                </div>
                                <SubmitButton processing={form.processing}>Simpan Budget</SubmitButton>
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
                                            <DateTimeDisplay value={budget.period_start} /> - <DateTimeDisplay value={budget.period_end} />
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MoneyDisplay value={budget.amount} className="font-semibold" />
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
