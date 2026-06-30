<?php

namespace App\Enums;

enum DebtType: string
{
    case PersonalLoan = 'personal_loan';
    case CreditCard = 'credit_card';
    case PayLater = 'paylater';
    case Mortgage = 'mortgage';
    case VehicleLoan = 'vehicle_loan';
    case Installment = 'installment';
    case BusinessLoan = 'business_loan';
    case Other = 'other';
}
