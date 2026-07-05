<?php

namespace App\Services\Ai;

use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Promptable;
use Stringable;

class AiConnectionTestAgent implements Agent
{
    use Promptable;

    public function instructions(): Stringable|string
    {
        return 'Anda hanya membantu menguji koneksi API AI. Ikuti instruksi output secara tepat.';
    }
}
