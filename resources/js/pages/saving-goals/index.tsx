import { DateTimeDisplay } from '@/components/finance/date-display';
import { FinanceSelect } from '@/components/finance/finance-select';
import { FormError } from '@/components/finance/form-error';
import { MoneyDisplay } from '@/components/finance/money-display';
import { PageHeader, SubmitButton } from '@/components/finance/page-header';
import { ProgressRow } from '@/components/finance/progress-row';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { accountLabel } from '@/lib/finance-labels';
import { type BreadcrumbItem } from '@/types';
import { type FinancialAccount, type SavingGoal } from '@/types/finance';
import { Head, router, useForm } from '@inertiajs/react';
import { Goal, Trash2 } from 'lucide-react';
import type React from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Tabungan', href: '/saving-goals' }];

interface SavingGoalsProps {
    savingGoals: SavingGoal[];
    accounts: FinancialAccount[];
}

export default function SavingGoalsIndex({ savingGoals, accounts }: SavingGoalsProps) {
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
        form.post('/saving-goals', { preserveScroll: true, onSuccess: () => form.reset('name', 'target_amount', 'current_amount', 'target_date') });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tabungan" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Target Tabungan"
                    description="Buat target dana darurat, liburan, pendidikan, atau pembelian besar. AI akan memakai data ini saat menghitung rekomendasi hemat."
                    icon={Goal}
                />
                <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Tambah Target</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={submit}>
                                <div className="space-y-2">
                                    <Label>Nama target</Label>
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
                                        <Label>Target</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={form.data.target_amount}
                                            onChange={(event) => form.setData('target_amount', event.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Terkumpul</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={form.data.current_amount}
                                            onChange={(event) => form.setData('current_amount', event.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label>Deadline</Label>
                                        <Input
                                            type="date"
                                            value={form.data.target_date}
                                            onChange={(event) => form.setData('target_date', event.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Prioritas</Label>
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
                                <SubmitButton processing={form.processing}>Simpan Target</SubmitButton>
                            </form>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
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
                                                <DateTimeDisplay value={goal.target_date} fallback="Tanpa deadline" />
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">{goal.priority}</Badge>
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
