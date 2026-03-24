<?php

declare(strict_types=1);

namespace App\Modules\EduKarta\Routes;

use App\Http\Request;
use App\Http\Router;
use App\Service\KartaService;

final class ProfileRoutes
{
    public static function register(Router $router, KartaService $service, string $basePath): void
    {
        $router->add('GET', $basePath, fn (Request $request) => $service->edukartaGetProfile($request));
        $router->add('PUT', $basePath, fn (Request $request) => $service->edukartaSaveProfile($request));
        $router->add('GET', $basePath . '/chapters', fn (Request $request) => $service->edukartaGetChapters($request));
        $router->add('PUT', $basePath . '/chapters', fn (Request $request) => $service->edukartaSaveChapters($request));
        $router->add('POST', $basePath . '/chapters/suggest', fn (Request $request) => $service->edukartaSuggestChapters($request));
        $router->add('POST', $basePath . '/chapters/extract-from-image', fn (Request $request) => $service->edukartaExtractChaptersFromImage($request));
        $router->add('POST', $basePath . '/chapters/summary', fn (Request $request) => $service->edukartaSummary($request));
        $router->add('GET', $basePath . '/chapters/qa', fn (Request $request) => $service->edukartaGetQa($request));
        $router->add('POST', $basePath . '/chapters/qa', fn (Request $request) => $service->edukartaSaveQa($request));
        $router->add('GET', $basePath . '/progress', fn (Request $request) => $service->edukartaGetProgress($request));
        $router->add('PUT', $basePath . '/progress', fn (Request $request) => $service->edukartaSaveProgress($request));
    }
}
