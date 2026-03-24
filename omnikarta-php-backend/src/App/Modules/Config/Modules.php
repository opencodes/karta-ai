<?php

declare(strict_types=1);

namespace App\Modules\Config;

use App\Modules\EduKarta\EduKartaModule;
use App\Modules\PrepKarta\PrepKartaModule;
use App\Modules\TodoKarta\TodoKartaModule;

final class Modules
{
    /**
     * @return array<int, array<string, mixed>>
     */
    public static function enabled(): array
    {
        return array_values(array_filter([
            TodoKartaModule::definition(),
            EduKartaModule::definition(),
            PrepKartaModule::definition(),
        ], static fn (array $module): bool => ($module['enabled'] ?? true) !== false));
    }
}
