import { CurrencyInput } from '@/components/finance/currency-input';
import { FinanceBadge } from '@/components/finance/finance-badge';
import { FinanceSelect } from '@/components/finance/finance-select';
import { FormError } from '@/components/finance/form-error';
import { MoneyDisplay } from '@/components/finance/money-display';
import { PageHeader, SubmitButton } from '@/components/finance/page-header';
import { RequiredLabel } from '@/components/finance/required-label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { accountLabel } from '@/lib/finance-labels';
import { toFormString } from '@/lib/form-values';
import { type BreadcrumbItem } from '@/types';
import { type Family, type FinancialAccount } from '@/types/finance';
import { Head, router, useForm } from '@inertiajs/react';
import { CreditCard, Pencil, Trash2, X } from 'lucide-react';
import { useState, type React } from 'react';

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
    families: Family[];
}

export default function AccountsIndex({ accounts, families }: AccountsProps) {
    const [editingAccountId, setEditingAccountId] = useState<number | null>(null);
    const editingAccount = accounts.find((account) => account.id === editingAccountId);
    const canChangeSharing = !editingAccount || editingAccount.can_delete !== false;
    const form = useForm({
        name: '',
        bank_name: 'BCA',
        account_holder_name: '',
        account_number: '',
        type: 'bank',
        initial_balance: '',
        currency: 'IDR',
        visibility: 'private',
        family_id: families[0]?.id?.toString() ?? '',
    });

    function submit(event: React.FormEvent) {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => resetForm(),
        };

        if (editingAccountId) {
            form.put(`/accounts/${editingAccountId}`, options);

            return;
        }

        form.post('/accounts', options);
    }

    function resetForm() {
        setEditingAccountId(null);
        form.setData({
            name: '',
            bank_name: 'BCA',
            account_holder_name: '',
            account_number: '',
            type: 'bank',
            initial_balance: '',
            currency: 'IDR',
            visibility: 'private',
            family_id: families[0]?.id?.toString() ?? '',
        });
    }

    function editAccount(account: FinancialAccount) {
        setEditingAccountId(account.id);
        form.setData({
            name: account.name ?? '',
            bank_name: account.bank_name ?? 'BCA',
            account_holder_name: account.account_holder_name ?? '',
            account_number: account.account_number ?? '',
            type: account.type,
            initial_balance: toFormString(account.initial_balance),
            currency: account.currency ?? 'IDR',
            visibility: account.visibility ?? 'private',
            family_id: account.family_id?.toString() ?? families[0]?.id?.toString() ?? '',
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
                            <div className="flex items-center justify-between gap-3">
                                <CardTitle>{editingAccountId ? 'Edit Rekening' : 'Tambah Rekening'}</CardTitle>
                                {editingAccountId && (
                                    <button
                                        type="button"
                                        className="text-muted-foreground rounded-md p-2 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white"
                                        onClick={resetForm}
                                        aria-label="Batal edit rekening"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={submit}>
                                <div className="space-y-2">
                                    <RequiredLabel htmlFor="type">Tipe</RequiredLabel>
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
                                    <RequiredLabel htmlFor="bank_name">Bank / Penyedia</RequiredLabel>
                                    <FinanceSelect
                                        value={form.data.bank_name}
                                        onValueChange={(value) => form.setData('bank_name', value)}
                                        options={institutionOptions}
                                        placeholder="Pilih bank"
                                    />
                                    <FormError message={form.errors.bank_name} />
                                </div>
                                <div className="space-y-2">
                                    <RequiredLabel htmlFor="account_holder_name">Nama pemilik rekening</RequiredLabel>
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
                                    <RequiredLabel htmlFor="initial_balance">{editingAccountId ? 'Saldo akun' : 'Saldo awal'}</RequiredLabel>
                                    <CurrencyInput
                                        id="initial_balance"
                                        value={form.data.initial_balance}
                                        onValueChange={(value) => form.setData('initial_balance', value)}
                                    />
                                    <FormError message={form.errors.initial_balance} />
                                </div>
                                {canChangeSharing && (
                                    <>
                                        <div className="space-y-2">
                                            <RequiredLabel>Visibilitas</RequiredLabel>
                                            <FinanceSelect
                                                value={form.data.visibility}
                                                onValueChange={(value) => form.setData('visibility', value)}
                                                options={[
                                                    { value: 'private', label: 'Pribadi' },
                                                    { value: 'family', label: 'Keluarga' },
                                                ]}
                                            />
                                            <FormError message={form.errors.visibility} />
                                        </div>
                                        {form.data.visibility === 'family' && (
                                            <div className="space-y-2">
                                                <RequiredLabel>Keluarga</RequiredLabel>
                                                <FinanceSelect
                                                    value={form.data.family_id}
                                                    onValueChange={(value) => form.setData('family_id', value)}
                                                    options={families.map((family) => ({
                                                        value: family.id.toString(),
                                                        label: family.name,
                                                    }))}
                                                    placeholder="Pilih keluarga"
                                                />
                                                <FormError message={form.errors.family_id} />
                                            </div>
                                        )}
                                    </>
                                )}
                                <SubmitButton processing={form.processing}>{editingAccountId ? 'Perbarui Rekening' : 'Simpan Rekening'}</SubmitButton>
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
                                            <FinanceBadge value={account.type} />
                                        </div>
                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                            {account.account_number && (
                                                <span className="text-muted-foreground text-sm">{account.account_number}</span>
                                            )}
                                            {(account.owner?.name || account.user?.name) && (
                                                <span className="text-muted-foreground text-sm">Pemilik: {account.owner?.name ?? account.user?.name}</span>
                                            )}
                                            <FinanceBadge value={account.visibility} />
                                            <FinanceBadge value={account.currency} />
                                        </div>
                                        <p className="hidden">
                                            {account.account_number ? `${account.account_number} · ` : ''}
                                            {account.visibility} · {account.currency}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MoneyDisplay value={account.current_balance} className="font-semibold" />
                                        {account.can_edit !== false && (
                                            <button
                                                className="text-muted-foreground rounded-md p-2 hover:bg-blue-50 hover:text-blue-700"
                                                onClick={() => editAccount(account)}
                                                aria-label="Edit rekening"
                                            >
                                                <Pencil className="size-4" />
                                            </button>
                                        )}
                                        {account.can_delete !== false && (
                                            <button
                                                className="text-muted-foreground rounded-md p-2 hover:bg-rose-50 hover:text-rose-700"
                                                onClick={() => router.delete(`/accounts/${account.id}`, { preserveScroll: true })}
                                                aria-label="Arsipkan rekening"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        )}
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
