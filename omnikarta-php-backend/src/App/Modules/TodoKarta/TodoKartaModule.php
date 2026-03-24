<?php

declare(strict_types=1);

namespace App\Modules\TodoKarta;

use App\Modules\Types;

final class TodoKartaModule
{
    /**
     * @return array<string, mixed>
     */
    public static function definition(): array
    {
        return [
            'name' => 'todokarta',
            'version' => '1.0.0',
            'enabled' => true,
            'backend' => [
                'routes' => [
                    [
                        Types::ROUTE_KEY => 'todokarta.tasks',
                        Types::MOUNT_PATH => '/tasks',
                        Types::REQUIRES_AUTH => true,
                    ],
                ],
            ],
        ];
    }
}
