<?php

declare(strict_types=1);

namespace App\Modules\PrepKarta;

use App\Modules\Types;

final class PrepKartaModule
{
    /**
     * @return array<string, mixed>
     */
    public static function definition(): array
    {
        return [
            'name' => 'prepkarta',
            'version' => '1.0.0',
            'enabled' => true,
            'backend' => [
                'routes' => [
                    [
                        Types::ROUTE_KEY => 'prepkarta.practice',
                        Types::MOUNT_PATH => '',
                        Types::REQUIRES_AUTH => true,
                    ],
                    [
                        Types::ROUTE_KEY => 'prepkarta.exams',
                        Types::MOUNT_PATH => '/exams',
                        Types::REQUIRES_AUTH => true,
                    ],
                ],
            ],
        ];
    }
}
