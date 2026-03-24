<?php

declare(strict_types=1);

namespace App\Modules\TodoKarta\Routes;

use App\Http\Request;
use App\Http\Router;
use App\Service\KartaService;

final class TasksRoutes
{
    public static function register(Router $router, KartaService $service, string $basePath): void
    {
        $router->add('POST', $basePath . '/parse-create', fn (Request $request) => $service->createTask($request));
        $router->add('GET', $basePath, fn (Request $request) => $service->listTasks($request));
        $router->add('PATCH', $basePath . '/:id/feature', fn (Request $request) => $service->updateTaskFeature($request));
    }
}
