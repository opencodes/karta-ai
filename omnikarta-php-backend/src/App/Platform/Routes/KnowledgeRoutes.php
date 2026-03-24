<?php

declare(strict_types=1);

namespace App\Platform\Routes;

use App\Http\Request;
use App\Http\Router;
use App\Service\KartaService;

final class KnowledgeRoutes
{
    public static function register(Router $router, KartaService $service): void
    {
        $router->add('POST', '/api/knowledge/upload', fn (Request $request) => $service->knowledgeUpload($request));
        $router->add('POST', '/api/knowledge/ask', fn (Request $request) => $service->knowledgeAsk($request));
    }
}
