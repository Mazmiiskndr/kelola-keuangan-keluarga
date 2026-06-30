<?php

namespace App\Enums;

enum AccountType: string
{
    case Cash = 'cash';
    case Bank = 'bank';
    case EWallet = 'e_wallet';
    case CreditCard = 'credit_card';
    case Loan = 'loan';
    case Investment = 'investment';
    case SavingGoal = 'saving_goal';
}
