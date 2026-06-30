<?php

namespace App\Enums;

enum RecommendationStatus: string
{
    case New = 'new';
    case Accepted = 'accepted';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case Rejected = 'rejected';
}
