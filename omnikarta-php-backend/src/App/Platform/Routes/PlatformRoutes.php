<?php

declare(strict_types=1);

namespace App\Platform\Routes;

use App\Http\Router;
use App\Service\KartaService;

final class PlatformRoutes
{
    public static function register(Router $router, KartaService $service): void
    {
        AuthRoutes::register($router, $service);
        BillingRoutes::register($router, $service);
        RbacRoutes::register($router, $service);
        OrgAdminRoutes::register($router, $service);
        KnowledgeRoutes::register($router, $service);
    }
}
