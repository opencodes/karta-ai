<?php

declare(strict_types=1);

namespace App\Modules\PrepKarta\Routes;

use App\Http\Request;
use App\Http\Router;
use App\Service\KartaService;

final class ExamsRoutes
{
    public static function register(Router $router, KartaService $service, string $basePath): void
    {
        $router->add('GET', $basePath, fn (Request $request) => $service->prepkartaExams($request));
    }
}
