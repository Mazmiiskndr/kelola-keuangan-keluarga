export type MoneyValue = number | string;

export interface FinancialAccount {
    id: number;
    user_id?: number;
    family_id?: number | null;
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
    owner?: {
        id?: number;
        name?: string;
        email?: string;
    } | null;
    user?: {
        id?: number;
        name?: string;
        email?: string;
    } | null;
    can_edit?: boolean;
    can_delete?: boolean;
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
    created_at?: string;
    updated_at?: string;
    description?: string;
    merchant?: string;
    visibility: string;
    need_type: string;
    account?: FinancialAccount;
    category?: Category;
    user?: {
        id?: number;
        name?: string;
        email?: string;
    } | null;
    can_edit?: boolean;
    can_delete?: boolean;
    saving_goal_id?: number;
    saving_goal?: SavingGoal;
}

export interface TransactionSuggestion {
    id: string;
    type: 'income' | 'expense' | 'saving';
    merchant: string;
    category_id?: number | null;
    category_name?: string | null;
    financial_account_id: number;
    account_label?: string | null;
    amount: MoneyValue;
    need_type: string;
    saving_goal_id?: number | null;
    saving_goal_name?: string | null;
    usage_count: number;
    last_used_at?: string | null;
}

export interface TransactionAmountPreset {
    id: string;
    type: 'income' | 'expense' | 'saving';
    amount: MoneyValue;
    usage_count: number;
    last_used_at?: string | null;
}

export interface TransactionSuggestions {
    items: TransactionSuggestion[];
    amount_presets: TransactionAmountPreset[];
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
    priority?: string;
    title: string;
    description: string;
    why_it_matters?: string;
    next_action?: string;
    source_metric?: string;
    estimated_saving_amount?: MoneyValue;
    confidence_score?: MoneyValue;
    status: string;
}

export interface AiAnalysis {
    id: number;
    analysis_type: string;
    period_start: string;
    period_end: string;
    headline?: string;
    tone?: string;
    health_score?: number;
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

export interface AccountBalanceBreakdown {
    id: number;
    name: string;
    display_name?: string;
    type: string;
    current_balance: MoneyValue;
    currency: string;
    visibility: string;
    owner?: string | null;
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
    accounts?: AccountBalanceBreakdown[];
    trend: Array<{ key?: string; label: string; income: number; expense: number }>;
    upcoming_debts: Array<{ id: number; name: string; lender?: string; amount: number; due_date?: string }>;
    member_breakdown?: MemberBreakdown[];
}

export type SearchResultType = 'transaction' | 'account' | 'category' | 'budget' | 'saving_goal' | 'debt' | 'family';

export interface SearchResult {
    id: number;
    type: SearchResultType;
    title: string;
    subtitle: string | null;
    description: string | null;
    badge: string | null;
    amount: number | null;
    date: string | null;
    href: string;
    detail_key: string;
}

export interface SearchResultGroup {
    type: SearchResultType;
    label: string;
    results: SearchResult[];
}
