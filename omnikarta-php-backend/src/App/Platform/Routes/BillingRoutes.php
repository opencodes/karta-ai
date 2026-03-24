<?php

declare(strict_types=1);

namespace App\Platform\Routes;

use App\Http\Request;
use App\Http\Router;
use App\Service\KartaService;

final class BillingRoutes
{
    public static function register(Router $router, KartaService $service): void
    {
        $router->add('GET', '/api/billing/catalog/modules', fn () => $service->catalogModules());
        $router->add('GET', '/api/billing/admin/modules', fn (Request $request) => $service->adminModules($request));
        $router->add('POST', '/api/billing/admin/modules', fn (Request $request) => $service->createAdminModule($request));
        $router->add('GET', '/api/billing/admin/org-module-requests', fn (Request $request) => $service->listOrgModuleRequests($request));
        $router->add('PATCH', '/api/billing/admin/org-module-requests/:subscriptionId', fn (Request $request) => $service->resolveOrgModuleRequest($request));
        $router->add('GET', '/api/billing/my-access', fn (Request $request) => $service->myAccess($request));
        $router->add('GET', '/api/billing/my-subscriptions', fn (Request $request) => $service->mySubscriptions($request));
        $router->add('POST', '/api/billing/buy-module', fn (Request $request) => $service->buyModule($request));
    }
}
