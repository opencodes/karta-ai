<?php

declare(strict_types=1);

namespace App\Modules\Runtime;

use App\Modules\EduKarta\Routes\OverviewRoutes;
use App\Modules\EduKarta\Routes\ProfileRoutes;
use App\Modules\PrepKarta\Routes\ExamsRoutes;
use App\Modules\PrepKarta\Routes\PracticeRoutes;
use App\Modules\TodoKarta\Routes\TasksRoutes;

final class BackendRouteRegistry
{
    /**
     * @return array<string, class-string>
     */
    public static function all(): array
    {
        return [
            'todokarta.tasks' => TasksRoutes::class,
            'edukarta.overview' => OverviewRoutes::class,
            'edukarta.profile' => ProfileRoutes::class,
            'prepkarta.exams' => ExamsRoutes::class,
            'prepkarta.practice' => PracticeRoutes::class,
        ];
    }
}
