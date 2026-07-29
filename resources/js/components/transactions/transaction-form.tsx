import { CurrencyInput } from '@/components/finance/currency-input';
import { DatePickerInput } from '@/components/finance/date-picker-input';
import { FinanceSelect } from '@/components/finance/finance-select';
import { FormError } from '@/components/finance/form-error';
import { formatMoney } from '@/components/finance/money-display';
import { SubmitButton } from '@/components/finance/page-header';
import { RequiredLabel } from '@/components/finance/required-label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type TransactionFormData } from '@/hooks/use-transaction-management';
import { accountLabel } from '@/lib/finance-labels';
import { type Category, type FinancialAccount, type SavingGoal, type TransactionSuggestion } from '@/types/finance';
import { type InertiaFormProps } from '@inertiajs/react';
import { CheckCircle2, Sparkles, X } from 'lucide-react';
import { type FormEvent } from 'react';

const transactionTypeOptions = [
    { value: 'expense', label: 'Pengeluaran' },
    { value: 'income', label: 'Pemasukan' },
    { value: 'saving', label: 'Tabungan' },
];

interface TransactionFormProps {
    form: InertiaFormProps<TransactionFormData>;
    accounts: FinancialAccount[];
    savingGoals: SavingGoal[];
    filteredCategories: Category[];
    activeSuggestions: TransactionSuggestion[];
    amountPresetValues: number[];
    editingTransactionId: number | null;
    quickReviewSuggestion: TransactionSuggestion | undefined;
    quickReviewSuggestionId: string | null;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onQuickSave: () => void;
    onCancelEdit: () => void;
    onSetTransactionType: (type: string) => void;
    onSetSelectedAccount: (accountId: string) => void;
    onApplySuggestion: (suggestion: TransactionSuggestion) => void;
}

export function TransactionForm({
    form,
    accounts,
    savingGoals,
    filteredCategories,
    activeSuggestions,
    amountPresetValues,
    editingTransactionId,
    quickReviewSuggestion,
    quickReviewSuggestionId,
    onSubmit,
    onQuickSave,
    onCancelEdit,
    onSetTransactionType,
    onSetSelectedAccount,
    onApplySuggestion,
}: TransactionFormProps) {
    const selectedAccountLabel = accountLabel(accounts.find((account) => account.id.toString() === form.data.financial_account_id));
    const selectedCategoryLabel =
        form.data.type === 'saving'
            ? (savingGoals.find((goal) => goal.id.toString() === form.data.saving_goal_id)?.name ?? 'Target tabungan')
            : (filteredCategories.find((category) => category.id.toString() === form.data.category_id)?.name ?? 'Kategori');

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between gap-3">
                    <CardTitle>{editingTransactionId ? 'Edit Transaksi' : 'Tambah Transaksi'}</CardTitle>
                    {editingTransactionId && (
                        <button
                            type="button"
                            className="text-muted-foreground rounded-md p-2 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white"
                            onClick={onCancelEdit}
                            aria-label="Batal edit transaksi"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <form noValidate className="space-y-4" onSubmit={onSubmit}>
                    <div className="space-y-2">
                        <RequiredLabel>Tipe</RequiredLabel>
                        <div className="border-input grid h-12 grid-cols-3 rounded-md border bg-slate-50 p-1 shadow-sm dark:bg-slate-950">
                            {transactionTypeOptions.map((typeOption) => (
                                <button
                                    key={typeOption.value}
                                    type="button"
                                    className={`rounded-sm px-2 text-sm font-semibold whitespace-nowrap transition-all ${
                                        form.data.type === typeOption.value
                                            ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-900 dark:text-blue-300'
                                            : 'text-muted-foreground hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                    onClick={() => onSetTransactionType(typeOption.value)}
                                >
                                    {typeOption.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {!editingTransactionId && (
                        <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-3 dark:border-blue-900/50 dark:bg-blue-950/20">
                            <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                                <Sparkles className="size-4 text-blue-600" /> Sering dipakai
                            </p>
                            <p className="text-muted-foreground mt-1 text-xs">Pilih dari riwayat pribadi, lalu cek ulang sebelum simpan.</p>
                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                {activeSuggestions.length === 0 ? (
                                    <p className="text-muted-foreground rounded-md border border-dashed bg-white/70 p-3 text-sm dark:bg-slate-950/70">
                                        Belum ada saran untuk tipe ini.
                                    </p>
                                ) : (
                                    activeSuggestions.map((suggestion) => (
                                        <button
                                            key={suggestion.id}
                                            type="button"
                                            className={`rounded-md border bg-white p-3 text-left transition-all hover:border-blue-300 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:bg-slate-950 ${
                                                quickReviewSuggestionId === suggestion.id
                                                    ? 'border-blue-400 ring-2 ring-blue-100 dark:ring-blue-950'
                                                    : 'border-slate-200 dark:border-slate-800'
                                            }`}
                                            onClick={() => onApplySuggestion(suggestion)}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                                                        {suggestion.merchant}
                                                    </p>
                                                    <p className="text-muted-foreground mt-1 truncate text-xs">
                                                        {suggestion.category_name ?? suggestion.saving_goal_name ?? 'Tanpa kategori'} -{' '}
                                                        {suggestion.account_label ?? 'Akun'}
                                                    </p>
                                                </div>
                                                <span className="shrink-0 text-sm font-bold text-blue-700 dark:text-blue-300">
                                                    {formatMoney(suggestion.amount)}
                                                </span>
                                            </div>
                                            <p className="text-muted-foreground mt-2 text-xs">
                                                Dipakai {suggestion.usage_count}x
                                                {suggestion.last_used_at ? ` - terakhir ${suggestion.last_used_at}` : ''}
                                            </p>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {quickReviewSuggestion && !editingTransactionId && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/20">
                            <div className="flex items-center justify-between gap-3">
                                <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                                    <CheckCircle2 className="size-4" /> Review cepat siap disimpan
                                </p>
                                <button
                                    type="button"
                                    onClick={onQuickSave}
                                    className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:bg-emerald-700 dark:hover:bg-emerald-600"
                                >
                                    Simpan Langsung
                                </button>
                            </div>
                            <div className="mt-3 grid gap-2 text-xs text-slate-700 sm:grid-cols-2 dark:text-slate-200">
                                <span>Judul: {form.data.merchant}</span>
                                <span>Nominal: {formatMoney(form.data.amount || 0)}</span>
                                <span>Akun: {selectedAccountLabel}</span>
                                <span>
                                    {form.data.type === 'saving' ? 'Target' : 'Kategori'}: {selectedCategoryLabel}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <RequiredLabel>Tanggal</RequiredLabel>
                        <DatePickerInput value={form.data.transaction_date} onValueChange={(value) => form.setData('transaction_date', value)} />
                    </div>
                    <div className="space-y-2">
                        <RequiredLabel>{form.data.type === 'saving' ? 'Akun sumber' : 'Akun'}</RequiredLabel>
                        <FinanceSelect
                            value={form.data.financial_account_id}
                            onValueChange={onSetSelectedAccount}
                            options={accounts.map((account) => ({ value: account.id.toString(), label: accountLabel(account, true) }))}
                            placeholder="Pilih akun"
                        />
                        <FormError message={form.errors.financial_account_id} />
                    </div>
                    {form.data.type === 'saving' ? (
                        <div className="space-y-2">
                            <RequiredLabel>Target tabungan</RequiredLabel>
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
                            <RequiredLabel>Kategori</RequiredLabel>
                            <FinanceSelect
                                value={form.data.category_id}
                                onValueChange={(value) => form.setData('category_id', value)}
                                options={filteredCategories.map((category) => ({ value: category.id.toString(), label: category.name }))}
                                placeholder="Pilih kategori"
                            />
                            <FormError message={form.errors.category_id} />
                        </div>
                    )}
                    <div className="space-y-2">
                        <RequiredLabel>Nominal</RequiredLabel>
                        <CurrencyInput value={form.data.amount} onValueChange={(value) => form.setData('amount', value)} />
                        <div className="flex flex-wrap gap-2">
                            {amountPresetValues.map((amount) => (
                                <button
                                    key={amount}
                                    type="button"
                                    className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200 dark:hover:bg-blue-900/50"
                                    onClick={() => form.setData('amount', amount.toString())}
                                >
                                    {formatMoney(amount)}
                                </button>
                            ))}
                        </div>
                        <FormError message={form.errors.amount} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <RequiredLabel>Judul</RequiredLabel>
                            <Input
                                value={form.data.merchant}
                                onChange={(event) => form.setData('merchant', event.target.value)}
                                placeholder="Contoh: Rokok, Bensin, dll"
                            />
                            <FormError message={form.errors.merchant} />
                        </div>
                        <div className="space-y-2">
                            <RequiredLabel>Kebutuhan</RequiredLabel>
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
                    <SubmitButton processing={form.processing}>{editingTransactionId ? 'Perbarui Transaksi' : 'Simpan Transaksi'}</SubmitButton>
                </form>
            </CardContent>
        </Card>
    );
}
