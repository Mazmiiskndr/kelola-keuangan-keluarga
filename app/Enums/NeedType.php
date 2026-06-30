<?php

namespace App\Enums;

enum NeedType: string
{
    case Essential = 'essential';
    case Flexible = 'flexible';
    case Lifestyle = 'lifestyle';
    case Financial = 'financial';
    case Unclassified = 'unclassified';
}
