import { type AiAnalysis, type AiRecommendation } from '@/types/finance';

export interface DashboardAiAnalysis extends AiAnalysis {
    ai_recommendations?: AiRecommendation[];
}
