<?php

namespace App\Enums;

enum AiAnalysisType: string
{
    case Monthly = 'monthly';
    case Saving = 'saving';
    case Debt = 'debt';
    case Family = 'family';
}
