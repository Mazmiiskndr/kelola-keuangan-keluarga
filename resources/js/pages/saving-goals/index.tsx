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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { accountLabel } from '@/lib/finance-labels';
import { toDateInputValue, toFormString } from '@/lib/form-values';
import { type BreadcrumbItem } from '@/types';
import { type FinancialAccount, type SavingGoal } from '@/types/finance';
import { Head, router, useForm } from '@inertiajs/react';
import { Goal, Pencil, Trash2, X } from 'lucide-react';
import { useState, type React } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Tabungan', href: '/saving-goals' }];

interface SavingGoalsProps {
    savingGoals: SavingGoal[];
    accounts: FinancialAccount[];
}

export default function SavingGoalsIndex({ savingGoals, accounts }: SavingGoalsProps) {
    const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
    const form = useForm({
        financial_account_id: '',
        name: '',
        target_amount: '',
        current_amount: '0',
        target_date: '',
        priority: 'medium',
    });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => resetForm() };

        if (editingGoalId) {
            form.put(`/saving-goals/${editingGoalId}`, options);

            return;
        }

        form.post('/saving-goals', options);
    }

    function resetForm() {
        setEditingGoalId(null);
        form.setData({
            financial_account_id: '',
            name: '',
            target_amount: '',
            current_amount: '0',
            target_date: '',
            priority: 'medium',
        });
    }

    function editGoal(goal: SavingGoal) {
        setEditingGoalId(goal.id);
        form.setData({
            financial_account_id: goal.financial_account_id?.toString() ?? goal.account?.id?.toString() ?? '',
            name: goal.name,
            target_amount: toFormString(goal.target_amount),
            current_amount: toFormString(goal.current_amount),
            target_date: toDateInputValue(goal.target_date),
            priority: goal.priority,
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs} pageTitle="Tabungan">
            <Head title="Tabungan" />
            <div className="finance-page">
                <PageHeader
                    title="Target Tabungan"
                    description="Buat target dana darurat, liburan, pendidikan, atau pembelian besar. AI akan memakai data ini saat menghitung rekomendasi hemat."
                    icon={Goal}
                />
                <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between gap-3">
                                <CardTitle>{editingGoalId ? 'Edit Target' : 'Tambah Target'}</CardTitle>
                                {editingGoalId && (
                                    <button
                                        type="button"
                                        className="text-muted-foreground rounded-md p-2 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white"
                                        onClick={resetForm}
                                        aria-label="Batal edit target"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form noValidate className="space-y-4" onSubmit={submit}>
                                <div className="space-y-2">
                                    <RequiredLabel>Nama target</RequiredLabel>
                                    <Input
                                        value={form.data.name}
                                        onChange={(event) => form.setData('name', event.target.value)}
                                        placeholder="Dana darurat 6 bulan"
                                    />
                                    <FormError message={form.errors.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Akun penampung</Label>
                                    <FinanceSelect
                                        value={form.data.financial_account_id}
                                        onValueChange={(value) => form.setData('financial_account_id', value)}
                                        options={[
                                            { value: '', label: 'Belum ditentukan' },
                                            ...accounts.map((account) => ({
                                                value: account.id.toString(),
                                                label: accountLabel(account, true),
                                            })),
                                        ]}
                                        placeholder="Pilih akun"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <RequiredLabel>Target</RequiredLabel>
                                        <CurrencyInput
                                            value={form.data.target_amount}
                                            onValueChange={(value) => form.setData('target_amount', value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Terkumpul</Label>
                                        <CurrencyInput
                                            value={form.data.current_amount}
                                            onValueChange={(value) => form.setData('current_amount', value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label>Deadline</Label>
                                        <DatePickerInput
                                            value={form.data.target_date}
                                            onValueChange={(value) => form.setData('target_date', value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <RequiredLabel>Prioritas</RequiredLabel>
                                        <FinanceSelect
                                            value={form.data.priority}
                                            onValueChange={(value) => form.setData('priority', value)}
                                            options={[
                                                { value: 'low', label: 'Rendah' },
                                                { value: 'medium', label: 'Sedang' },
                                                { value: 'high', label: 'Tinggi' },
                                            ]}
                                        />
                                    </div>
                                </div>
                                <SubmitButton processing={form.processing}>{editingGoalId ? 'Perbarui Target' : 'Simpan Target'}</SubmitButton>
                            </form>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Progress Tabungan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {savingGoals.map((goal) => (
                                <div key={goal.id} className="rounded-lg border p-4">
                                    <div className="mb-4 flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-medium">{goal.name}</p>
                                            <p className="text-muted-foreground text-sm">
                                                <DateTimeDisplay value={goal.target_date} fallback="Tanpa deadline" dateOnly />
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FinanceBadge value={goal.priority} />
                                            <button
                                                className="text-muted-foreground rounded-md p-2 hover:bg-blue-50 hover:text-blue-700"
                                                onClick={() => editGoal(goal)}
                                                aria-label="Edit target"
                                            >
                                                <Pencil className="size-4" />
                                            </button>
                                            <button
                                                className="text-muted-foreground rounded-md p-2 hover:bg-rose-50 hover:text-rose-700"
                                                onClick={() => router.delete(`/saving-goals/${goal.id}`, { preserveScroll: true })}
                                                aria-label="Hapus target"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <ProgressRow label="Terkumpul" value={goal.current_amount} target={goal.target_amount} tone="green" />
                                    <p className="text-muted-foreground mt-3 text-sm">
                                        Sisa target <MoneyDisplay value={Number(goal.target_amount) - Number(goal.current_amount)} />
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
