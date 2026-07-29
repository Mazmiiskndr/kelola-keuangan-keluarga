import { toFormString } from '@/lib/form-values';
import {
    type Category,
    type FinanceTransaction,
    type FinancialAccount,
    type SavingGoal,
    type TransactionSuggestion,
    type TransactionSuggestions,
} from '@/types/finance';
import { router, useForm } from '@inertiajs/react';
import type React from 'react';
import { useState } from 'react';

const nominalPresets = [10000, 20000, 30000, 40000, 50000];

export interface TransactionFormData {
    financial_account_id: string;
    category_id: string;
    saving_goal_id: string;
    type: string;
    amount: string;
    transaction_date: string;
    description: string;
    merchant: string;
    tags: string;
    visibility: string;
    need_type: string;
}

export interface TransferFormData {
    from_account_id: string;
    to_account_id: string;
    amount: string;
    transfer_date: string;
    description: string;
}

function defaultTransactionDate(): string {
    const now = new Date();

    if (now.getHours() >= 0 && now.getHours() < 4) {
        now.setDate(now.getDate() - 1);
    }

    return now.toISOString().slice(0, 10);
}

interface UseTransactionManagementProps {
    accounts: FinancialAccount[];
    categories: Category[];
    savingGoals: SavingGoal[];
    suggestions: TransactionSuggestions;
    filterType: string;
}

export function useTransactionManagement({ accounts, categories, savingGoals, suggestions, filterType }: UseTransactionManagementProps) {
    const [editingTransactionId, setEditingTransactionId] = useState<number | null>(null);
    const [quickReviewSuggestionId, setQuickReviewSuggestionId] = useState<string | null>(null);
    const form = useForm<TransactionFormData>({
        financial_account_id: accounts[0]?.id?.toString() ?? '',
        category_id: categories[0]?.id?.toString() ?? '',
        saving_goal_id: savingGoals[0]?.id?.toString() ?? '',
        type: 'expense',
        amount: '',
        transaction_date: defaultTransactionDate(),
        description: '',
        merchant: '',
        tags: '',
        visibility: accounts[0]?.visibility === 'family' ? 'family' : 'private',
        need_type: 'unclassified',
    });
    const transferForm = useForm<TransferFormData>({
        from_account_id: accounts[0]?.id?.toString() ?? '',
        to_account_id: accounts[1]?.id?.toString() ?? '',
        amount: '',
        transfer_date: new Date().toISOString().slice(0, 10),
        description: '',
    });

    const filteredCategories = form.data.type === 'saving' ? [] : categories.filter((category) => category.type === form.data.type);
    const activeSuggestions = suggestions.items.filter((suggestion) => suggestion.type === form.data.type).slice(0, 6);
    const learnedAmountPresets = suggestions.amount_presets.filter((preset) => preset.type === form.data.type).slice(0, 5);
    const amountPresetValues = learnedAmountPresets.length > 0 ? learnedAmountPresets.map((preset) => Number(preset.amount)) : nominalPresets;
    const quickReviewSuggestion = suggestions.items.find((suggestion) => suggestion.id === quickReviewSuggestionId);

    function resetTransactionForm() {
        setEditingTransactionId(null);
        setQuickReviewSuggestionId(null);
        form.clearErrors();
        form.setData({
            financial_account_id: accounts[0]?.id?.toString() ?? '',
            category_id: categories[0]?.id?.toString() ?? '',
            saving_goal_id: savingGoals[0]?.id?.toString() ?? '',
            type: 'expense',
            amount: '',
            transaction_date: defaultTransactionDate(),
            description: '',
            merchant: '',
            tags: '',
            visibility: accounts[0]?.visibility === 'family' ? 'family' : 'private',
            need_type: 'unclassified',
        });
    }

    function saveTransaction() {
        const options = { preserveScroll: true, onSuccess: resetTransactionForm };

        if (editingTransactionId) {
            form.put(`/transactions/${editingTransactionId}`, options);
            return;
        }

        form.post('/transactions', options);
    }

    function submit(event: React.FormEvent) {
        event.preventDefault();
        saveTransaction();
    }

    function submitTransfer(event: React.FormEvent) {
        event.preventDefault();
        transferForm.post('/transfers', { preserveScroll: true, onSuccess: () => transferForm.reset('amount', 'description') });
    }

    function editTransaction(transaction: FinanceTransaction) {
        setEditingTransactionId(transaction.id);
        setQuickReviewSuggestionId(null);
        form.clearErrors();
        form.setData({
            financial_account_id: transaction.account?.id?.toString() ?? accounts[0]?.id?.toString() ?? '',
            category_id: transaction.category?.id?.toString() ?? '',
            saving_goal_id: transaction.saving_goal_id?.toString() ?? transaction.saving_goal?.id?.toString() ?? savingGoals[0]?.id?.toString() ?? '',
            type: transaction.type,
            amount: toFormString(transaction.amount),
            transaction_date: transaction.transaction_date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
            description: transaction.description ?? '',
            merchant: transaction.merchant ?? '',
            tags: '',
            visibility: transaction.visibility ?? 'private',
            need_type: transaction.need_type ?? 'unclassified',
        });
    }

    function setSelectedAccount(accountId: string) {
        const account = accounts.find((item) => item.id.toString() === accountId);
        form.setData((data) => ({
            ...data,
            financial_account_id: accountId,
            visibility: account?.visibility === 'family' ? 'family' : data.visibility,
        }));
    }

    function setTransactionType(type: string) {
        const category = type === 'saving' ? undefined : categories.find((item) => item.type === type);
        setQuickReviewSuggestionId(null);
        form.setData((data) => ({
            ...data,
            type,
            category_id: category?.id?.toString() ?? '',
            saving_goal_id: type === 'saving' ? (savingGoals[0]?.id?.toString() ?? '') : data.saving_goal_id,
            need_type: type === 'saving' ? 'financial' : data.need_type,
        }));
    }

    function applySuggestion(suggestion: TransactionSuggestion) {
        const account = accounts.find((item) => item.id === suggestion.financial_account_id);
        setEditingTransactionId(null);
        setQuickReviewSuggestionId(suggestion.id);
        form.clearErrors();
        form.setData((data) => ({
            ...data,
            type: suggestion.type,
            financial_account_id: suggestion.financial_account_id.toString(),
            category_id: suggestion.type === 'saving' ? '' : (suggestion.category_id?.toString() ?? ''),
            saving_goal_id:
                suggestion.saving_goal_id?.toString() ??
                (suggestion.type === 'saving' ? (savingGoals[0]?.id?.toString() ?? '') : data.saving_goal_id),
            amount: toFormString(suggestion.amount),
            transaction_date: data.transaction_date,
            merchant: suggestion.merchant,
            need_type: suggestion.need_type,
            visibility: account?.visibility === 'family' ? 'family' : data.visibility,
        }));
    }

    function filterTransactionHistory(type: string) {
        router.get('/transactions', type === 'all' ? {} : { type }, { preserveScroll: true, preserveState: true, replace: true });
    }

    return {
        form,
        transferForm,
        editingTransactionId,
        quickReviewSuggestionId,
        selectedHistoryType: filterType || 'all',
        filteredCategories,
        activeSuggestions,
        amountPresetValues,
        quickReviewSuggestion,
        submit,
        saveTransaction,
        submitTransfer,
        resetTransactionForm,
        editTransaction,
        setSelectedAccount,
        setTransactionType,
        applySuggestion,
        filterTransactionHistory,
    };
}
