import { FinanceSelect } from '@/components/finance/finance-select';
import { FormError } from '@/components/finance/form-error';
import { MoneyDisplay } from '@/components/finance/money-display';
import { PageHeader, SubmitButton } from '@/components/finance/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { accountLabel } from '@/lib/finance-labels';
import { type BreadcrumbItem } from '@/types';
import { type FinancialAccount } from '@/types/finance';
import { Head, router, useForm } from '@inertiajs/react';
import { CreditCard, Trash2 } from 'lucide-react';
import type React from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Akun', href: '/accounts' }];

const institutionOptions = [
    { value: 'BCA', label: 'BCA' },
    { value: 'BRI', label: 'BRI' },
    { value: 'BNI', label: 'BNI' },
    { value: 'Mandiri', label: 'Mandiri' },
    { value: 'CIMB Niaga', label: 'CIMB Niaga' },
    { value: 'Permata', label: 'Permata' },
    { value: 'Danamon', label: 'Danamon' },
    { value: 'BSI', label: 'BSI' },
    { value: 'Jago', label: 'Jago' },
    { value: 'SeaBank', label: 'SeaBank' },
    { value: 'GoPay', label: 'GoPay' },
    { value: 'OVO', label: 'OVO' },
    { value: 'DANA', label: 'DANA' },
    { value: 'ShopeePay', label: 'ShopeePay' },
    { value: 'Cash', label: 'Cash' },
];

interface AccountsProps {
    accounts: FinancialAccount[];
}

export default function AccountsIndex({ accounts }: AccountsProps) {
    const form = useForm({
        name: '',
        bank_name: 'BCA',
        account_holder_name: '',
        account_number: '',
        type: 'bank',
        initial_balance: '',
        currency: 'IDR',
        visibility: 'private',
    });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.post('/accounts', {
            preserveScroll: true,
            onSuccess: () => form.reset('name', 'account_holder_name', 'account_number', 'initial_balance'),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Akun" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Akun Keuangan"
                    description="Kelola rekening per bank atau e-wallet, misalnya BRI - Moch Azmi Iskandar dengan saldo masing-masing."
                    icon={CreditCard}
                />

                <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Tambah Rekening</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={submit}>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Tipe</Label>
                                    <FinanceSelect
                                        value={form.data.type}
                                        onValueChange={(value) => form.setData('type', value)}
                                        options={[
                                            { value: 'bank', label: 'Bank' },
                                            { value: 'cash', label: 'Cash' },
                                            { value: 'ewallet', label: 'E-Wallet' },
                                            { value: 'credit_card', label: 'Kartu Kredit' },
                                            { value: 'investment', label: 'Investasi' },
                                        ]}
                                    />
                                    <FormError message={form.errors.type} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bank_name">Bank / Penyedia</Label>
                                    <FinanceSelect
                                        value={form.data.bank_name}
                                        onValueChange={(value) => form.setData('bank_name', value)}
                                        options={institutionOptions}
                                        placeholder="Pilih bank"
                                    />
                                    <FormError message={form.errors.bank_name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="account_holder_name">Nama pemilik rekening</Label>
                                    <Input
                                        id="account_holder_name"
                                        value={form.data.account_holder_name}
                                        onChange={(event) => form.setData('account_holder_name', event.target.value)}
                                        placeholder="Moch Azmi Iskandar"
                                    />
                                    <FormError message={form.errors.account_holder_name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="account_number">Nomor rekening</Label>
                                    <Input
                                        id="account_number"
                                        value={form.data.account_number}
                                        onChange={(event) => form.setData('account_number', event.target.value)}
                                        placeholder="Opsional"
                                    />
                                    <FormError message={form.errors.account_number} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Alias akun</Label>
                                    <Input
                                        id="name"
                                        value={form.data.name}
                                        onChange={(event) => form.setData('name', event.target.value)}
                                        placeholder="Opsional, contoh: Payroll"
                                    />
                                    <FormError message={form.errors.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="initial_balance">Saldo awal</Label>
                                    <Input
                                        id="initial_balance"
                                        type="number"
                                        min="0"
                                        value={form.data.initial_balance}
                                        onChange={(event) => form.setData('initial_balance', event.target.value)}
                                    />
                                    <FormError message={form.errors.initial_balance} />
                                </div>
                                <SubmitButton processing={form.processing}>Simpan Rekening</SubmitButton>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Daftar Rekening</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {accounts.map((account) => (
                                <div key={account.id} className="flex items-center justify-between gap-4 rounded-lg border p-4">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-medium">{accountLabel(account)}</p>
                                            <Badge variant="outline">{account.type}</Badge>
                                        </div>
                                        <p className="text-muted-foreground mt-1 text-sm">
                                            {account.account_number ? `${account.account_number} · ` : ''}
                                            {account.visibility} · {account.currency}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MoneyDisplay value={account.current_balance} className="font-semibold" />
                                        <button
                                            className="text-muted-foreground rounded-md p-2 hover:bg-rose-50 hover:text-rose-700"
                                            onClick={() => router.delete(`/accounts/${account.id}`, { preserveScroll: true })}
                                            aria-label="Arsipkan rekening"
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
