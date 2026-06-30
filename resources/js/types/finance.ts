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
    type: 'income' | 'expense' | 'saving';
    amount: MoneyValue;
    transaction_date: string;
    description?: string;
    merchant?: string;
    visibility: string;
    need_type: string;
    account?: FinancialAccount;
    category?: Category;
    saving_goal_id?: number;
    saving_goal?: SavingGoal;
}

export interface Budget {
    id: number;
    category_id?: number;
    period_type?: string;
    amount: MoneyValue;
    period_start: string;
    period_end: string;
    category?: Category;
}

export interface SavingGoal {
    id: number;
    financial_account_id?: number;
    name: string;
    target_amount: MoneyValue;
    current_amount: MoneyValue;
    target_date?: string;
    priority: string;
    status: string;
    account?: FinancialAccount;
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
    start_date?: string;
    tenor_months?: number;
    remaining_tenor_months?: number;
    due_day?: number;
    next_due_date?: string;
    payment_account_id?: number;
    category_id?: number;
    auto_generate_expense?: boolean;
    include_in_monthly_expense?: boolean;
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
    role?: string;
    can_manage?: boolean;
    members?: FamilyMember[];
}

export interface FamilyMember {
    id: number;
    user_id: number;
    role: string;
    status: string;
    user?: {
        id?: number;
        name?: string;
        email?: string;
    };
}

export interface MemberBreakdown {
    user_id: number;
    name: string;
    role: string;
    income: number;
    expense: number;
    saving: number;
    cash_flow: number;
}

export interface SummaryMetric {
    period: { start: string; end: string };
    scope?: 'personal' | 'family';
    family?: { id: number; name: string } | null;
    family_role?: string | null;
    can_view_family_details?: boolean;
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
    largest_expenses: Array<{ id: number; description?: string; category?: string; member?: string | null; amount: number; date?: string }>;
    trend: Array<{ key?: string; label: string; income: number; expense: number }>;
    upcoming_debts: Array<{ id: number; name: string; lender?: string; amount: number; due_date?: string }>;
    member_breakdown?: MemberBreakdown[];
}
