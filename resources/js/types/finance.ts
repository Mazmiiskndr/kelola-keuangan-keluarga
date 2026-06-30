export type MoneyValue = number | string;

export interface FinancialAccount {
    id: number;
    name: string;
    display_name?: string;
    bank_name?: string;
    account_holder_name?: string;
    account_number?: string;
    type: string;
    initial_balance: MoneyValue;
    current_balance: MoneyValue;
    currency: string;
    visibility: string;
    is_active: boolean;
}

export interface Paginated<T> {
    data: T[];
    links?: Array<{ url: string | null; label: string; active: boolean }>;
    meta?: Record<string, unknown>;
}

export interface Category {
    id: number;
    name: string;
    type: 'income' | 'expense';
    color?: string;
    icon?: string;
    is_default?: boolean;
    is_essential?: boolean;
    is_savable?: boolean;
    is_lifestyle?: boolean;
}

export interface FinanceTransaction {
    id: number;
    type: 'income' | 'expense';
    amount: MoneyValue;
    transaction_date: string;
    description?: string;
    merchant?: string;
    visibility: string;
    need_type: string;
    account?: FinancialAccount;
    category?: Category;
}

export interface Budget {
    id: number;
    amount: MoneyValue;
    period_start: string;
    period_end: string;
    category?: Category;
}

export interface SavingGoal {
    id: number;
    name: string;
    target_amount: MoneyValue;
    current_amount: MoneyValue;
    target_date?: string;
    priority: string;
    status: string;
}

export interface Debt {
    id: number;
    name: string;
    type: string;
    lender?: string;
    principal_amount: MoneyValue;
    outstanding_amount: MoneyValue;
    monthly_payment: MoneyValue;
    minimum_payment: MoneyValue;
    interest_rate: MoneyValue;
    next_due_date?: string;
    status: string;
    payment_account?: FinancialAccount;
    category?: Category;
}

export interface AiRecommendation {
    id: number;
    type: string;
    title: string;
    description: string;
    estimated_saving_amount?: MoneyValue;
    confidence_score?: MoneyValue;
    status: string;
}

export interface AiAnalysis {
    id: number;
    analysis_type: string;
    period_start: string;
    period_end: string;
    result_summary?: string;
    recommendations?: AiRecommendation[];
    aiRecommendations?: AiRecommendation[];
    model_name?: string;
    status: string;
    created_at: string;
}

export interface Family {
    id: number;
    name: string;
    currency: string;
    owner_user_id: number;
}

export interface SummaryMetric {
    period: { start: string; end: string };
    totals: {
        balance: number;
        income: number;
        expense: number;
        cash_flow: number;
        debt_due: number;
        outstanding_debt: number;
        budget: number;
        saving_target: number;
        saving_current: number;
        saving_ratio: number;
        debt_to_income_ratio: number;
    };
    expense_by_category: Array<{ name: string; amount: number; color: string }>;
    largest_expenses: Array<{ id: number; description?: string; category?: string; amount: number; date?: string }>;
    trend: Array<{ label: string; income: number; expense: number }>;
    upcoming_debts: Array<{ id: number; name: string; lender?: string; amount: number; due_date?: string }>;
}
