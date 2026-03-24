<?php

declare(strict_types=1);

namespace App\Modules\EduKarta;

use App\Modules\Types;

final class EduKartaModule
{
    /**
     * @return array<string, mixed>
     */
    public static function definition(): array
    {
        return [
            'name' => 'edukarta',
            'version' => '1.0.0',
            'enabled' => true,
            'backend' => [
                'routes' => [
                    [
                        Types::ROUTE_KEY => 'edukarta.overview',
                        Types::MOUNT_PATH => '/overview',
                        Types::REQUIRES_AUTH => true,
                    ],
                    [
                        Types::ROUTE_KEY => 'edukarta.profile',
                        Types::MOUNT_PATH => '/profile',
                        Types::REQUIRES_AUTH => true,
                    ],
                ],
            ],
        ];
    }
}
