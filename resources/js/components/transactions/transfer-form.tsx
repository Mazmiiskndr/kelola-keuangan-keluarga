import { CurrencyInput } from '@/components/finance/currency-input';
import { DatePickerInput } from '@/components/finance/date-picker-input';
import { FinanceSelect } from '@/components/finance/finance-select';
import { FormError } from '@/components/finance/form-error';
import { SubmitButton } from '@/components/finance/page-header';
import { RequiredLabel } from '@/components/finance/required-label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type TransferFormData } from '@/hooks/use-transaction-management';
import { accountLabel } from '@/lib/finance-labels';
import { type FinancialAccount } from '@/types/finance';
import { type InertiaFormProps } from '@inertiajs/react';
import { ArrowRightLeft } from 'lucide-react';
import { type FormEvent } from 'react';

interface TransferFormProps {
    form: InertiaFormProps<TransferFormData>;
    accounts: FinancialAccount[];
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function TransferForm({ form, accounts, onSubmit }: TransferFormProps) {
    const accountOptions = accounts.map((account) => ({ value: account.id.toString(), label: accountLabel(account, true) }));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="inline-flex items-center gap-2">
                    <ArrowRightLeft className="size-4" /> Transfer
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form noValidate className="space-y-4" onSubmit={onSubmit}>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <RequiredLabel>Dari</RequiredLabel>
                            <FinanceSelect
                                value={form.data.from_account_id}
                                onValueChange={(value) => form.setData('from_account_id', value)}
                                options={accountOptions}
                                placeholder="Pilih akun"
                            />
                            <FormError message={form.errors.from_account_id} />
                        </div>
                        <div className="space-y-2">
                            <RequiredLabel>Ke</RequiredLabel>
                            <FinanceSelect
                                value={form.data.to_account_id}
                                onValueChange={(value) => form.setData('to_account_id', value)}
                                options={accountOptions}
                                placeholder="Pilih akun"
                            />
                            <FormError message={form.errors.to_account_id} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <RequiredLabel>Nominal</RequiredLabel>
                            <CurrencyInput value={form.data.amount} onValueChange={(value) => form.setData('amount', value)} />
                            <FormError message={form.errors.amount} />
                        </div>
                        <div className="space-y-2">
                            <RequiredLabel>Tanggal</RequiredLabel>
                            <DatePickerInput value={form.data.transfer_date} onValueChange={(value) => form.setData('transfer_date', value)} />
                            <FormError message={form.errors.transfer_date} />
                        </div>
                    </div>
                    <SubmitButton processing={form.processing}>Simpan Transfer</SubmitButton>
                </form>
            </CardContent>
        </Card>
    );
}
