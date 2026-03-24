<?php

declare(strict_types=1);

use App\Http\Request;
use App\Http\Router;
use App\Modules\LoadModules;
use App\Platform\Routes\PlatformRoutes;
use App\Service\KartaService;
use App\Support\Cache;
use App\Support\Database;
use App\Support\Env;
use App\Support\HttpException;

require_once __DIR__ . '/App/Support/Env.php';
require_once __DIR__ . '/App/Support/HttpException.php';
require_once __DIR__ . '/App/Support/Database.php';
require_once __DIR__ . '/App/Support/Jwt.php';
require_once __DIR__ . '/App/Support/Cache.php';
require_once __DIR__ . '/App/Http/Request.php';
require_once __DIR__ . '/App/Http/Router.php';
require_once __DIR__ . '/App/Service/KartaService.php';
require_once __DIR__ . '/App/Platform/Routes/AuthRoutes.php';
require_once __DIR__ . '/App/Platform/Routes/BillingRoutes.php';
require_once __DIR__ . '/App/Platform/Routes/RbacRoutes.php';
require_once __DIR__ . '/App/Platform/Routes/OrgAdminRoutes.php';
require_once __DIR__ . '/App/Platform/Routes/KnowledgeRoutes.php';
require_once __DIR__ . '/App/Platform/Routes/PlatformRoutes.php';
require_once __DIR__ . '/App/Modules/Types.php';
require_once __DIR__ . '/App/Modules/TodoKarta/TodoKartaModule.php';
require_once __DIR__ . '/App/Modules/TodoKarta/Routes/TasksRoutes.php';
require_once __DIR__ . '/App/Modules/EduKarta/EduKartaModule.php';
require_once __DIR__ . '/App/Modules/EduKarta/Routes/OverviewRoutes.php';
require_once __DIR__ . '/App/Modules/EduKarta/Routes/ProfileRoutes.php';
require_once __DIR__ . '/App/Modules/PrepKarta/PrepKartaModule.php';
require_once __DIR__ . '/App/Modules/PrepKarta/Routes/ExamsRoutes.php';
require_once __DIR__ . '/App/Modules/PrepKarta/Routes/PracticeRoutes.php';
require_once __DIR__ . '/App/Modules/Runtime/BackendRouteRegistry.php';
require_once __DIR__ . '/App/Modules/Config/Modules.php';
require_once __DIR__ . '/App/Modules/LoadModules.php';

Env::load(dirname(__DIR__) . '/.env');

$db = new Database();
$cache = new Cache();
$service = new KartaService($db, $cache);
$router = new Router();

$router->add('GET', '/health', fn () => $service->health());

PlatformRoutes::register($router, $service);
LoadModules::load($router, $service);

return [$router, $service];
