<?php

namespace App\Enums;

enum Visibility: string
{
    case Private = 'private';
    case Family = 'family';
    case SharedGoal = 'shared_goal';
}
