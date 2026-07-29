import { PageHeader } from '@/components/finance/page-header';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { TransactionHistory } from '@/components/transactions/transaction-history';
import { TransferForm } from '@/components/transactions/transfer-form';
import { useTransactionManagement } from '@/hooks/use-transaction-management';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    type Category,
    type FinanceTransaction,
    type FinancialAccount,
    type Paginated,
    type SavingGoal,
    type TransactionSuggestions,
} from '@/types/finance';
import { Head, usePage } from '@inertiajs/react';
import { ReceiptText } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Transaksi', href: '/transactions' }];

interface TransactionsProps {
    transactions: Paginated<FinanceTransaction>;
    accounts: FinancialAccount[];
    categories: Category[];
    savingGoals: SavingGoal[];
    suggestions: TransactionSuggestions;
    filters: {
        type: string;
    };
}

export default function TransactionsIndex({
    transactions,
    accounts,
    categories,
    savingGoals,
    suggestions = { items: [], amount_presets: [] },
    filters,
}: TransactionsProps) {
    const { auth } = usePage().props;
    const transactionManager = useTransactionManagement({
        accounts,
        categories,
        savingGoals,
        suggestions,
        filterType: filters.type,
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs} pageTitle="Transaksi">
            <Head title="Transaksi" />
            <div className="finance-page">
                <PageHeader
                    title="Transaksi"
                    description="Catat pemasukan, pengeluaran, dan transfer antar akun. Perubahan saldo dihitung oleh service Laravel."
                    icon={ReceiptText}
                />

                <div className="grid gap-4 xl:grid-cols-[520px_1fr]">
                    <div className="space-y-4">
                        <TransactionForm
                            form={transactionManager.form}
                            accounts={accounts}
                            savingGoals={savingGoals}
                            filteredCategories={transactionManager.filteredCategories}
                            activeSuggestions={transactionManager.activeSuggestions}
                            amountPresetValues={transactionManager.amountPresetValues}
                            editingTransactionId={transactionManager.editingTransactionId}
                            quickReviewSuggestion={transactionManager.quickReviewSuggestion}
                            quickReviewSuggestionId={transactionManager.quickReviewSuggestionId}
                            onSubmit={transactionManager.submit}
                            onQuickSave={transactionManager.saveTransaction}
                            onCancelEdit={transactionManager.resetTransactionForm}
                            onSetTransactionType={transactionManager.setTransactionType}
                            onSetSelectedAccount={transactionManager.setSelectedAccount}
                            onApplySuggestion={transactionManager.applySuggestion}
                        />
                        <TransferForm form={transactionManager.transferForm} accounts={accounts} onSubmit={transactionManager.submitTransfer} />
                    </div>

                    <TransactionHistory
                        transactions={transactions}
                        selectedType={transactionManager.selectedHistoryType}
                        currentUserId={auth.user.id}
                        onFilterChange={transactionManager.filterTransactionHistory}
                        onEdit={transactionManager.editTransaction}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
