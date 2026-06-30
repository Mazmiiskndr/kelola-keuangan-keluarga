<?php

namespace App\Enums;

enum DebtStatus: string
{
    case Active = 'active';
    case PaidOff = 'paid_off';
    case Paused = 'paused';
}
