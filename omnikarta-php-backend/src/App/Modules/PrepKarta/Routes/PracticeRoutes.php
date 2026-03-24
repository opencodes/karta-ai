<?php

declare(strict_types=1);

namespace App\Modules\PrepKarta\Routes;

use App\Http\Request;
use App\Http\Router;
use App\Service\KartaService;

final class PracticeRoutes
{
    public static function register(Router $router, KartaService $service, string $basePath): void
    {
        $router->add('GET', $basePath . '/subjects', fn (Request $request) => $service->prepkartaSubjects($request));
        $router->add('POST', $basePath . '/subjects', fn (Request $request) => $service->prepkartaCreateSubject($request));
        $router->add('PATCH', $basePath . '/subjects/:id', fn (Request $request) => $service->prepkartaUpdateSubject($request));
        $router->add('DELETE', $basePath . '/subjects/:id', fn (Request $request) => $service->prepkartaDeleteSubject($request));
        $router->add('GET', $basePath . '/subjects/:id/concepts', fn (Request $request) => $service->prepkartaConcepts($request));
        $router->add('GET', $basePath . '/subjects/:id/chapters', fn (Request $request) => $service->prepkartaChapters($request));
        $router->add('POST', $basePath . '/subjects/:id/chapters', fn (Request $request) => $service->prepkartaCreateChapter($request));
        $router->add('PATCH', $basePath . '/chapters/:id', fn (Request $request) => $service->prepkartaUpdateChapter($request));
        $router->add('DELETE', $basePath . '/chapters/:id', fn (Request $request) => $service->prepkartaDeleteChapter($request));
        $router->add('GET', $basePath . '/chapters/:id/subchapters', fn (Request $request) => $service->prepkartaSubchapters($request));
        $router->add('POST', $basePath . '/chapters/:id/subchapters', fn (Request $request) => $service->prepkartaCreateSubchapter($request));
        $router->add('PATCH', $basePath . '/subchapters/:id', fn (Request $request) => $service->prepkartaUpdateSubchapter($request));
        $router->add('DELETE', $basePath . '/subchapters/:id', fn (Request $request) => $service->prepkartaDeleteSubchapter($request));
        $router->add('GET', $basePath . '/subchapters/:id', fn (Request $request) => $service->prepkartaSubchapterDetail($request));
        $router->add('POST', $basePath . '/subchapters/:id/summary', fn (Request $request) => $service->prepkartaSubchapterSummary($request));
        $router->add('POST', $basePath . '/subchapters/:id/mcq', fn (Request $request) => $service->prepkartaSubchapterMcq($request));
        $router->add('GET', $basePath . '/subchapters/:id/qa', fn (Request $request) => $service->prepkartaGetQa($request));
        $router->add('POST', $basePath . '/subchapters/:id/qa', fn (Request $request) => $service->prepkartaSaveQa($request));
        $router->add('GET', $basePath . '/concepts/:id/questions', fn (Request $request) => $service->prepkartaQuestion($request));
        $router->add('POST', $basePath . '/questions/:id/answer', fn (Request $request) => $service->prepkartaAnswer($request));
        $router->add('GET', $basePath . '/concepts/:id/progress', fn (Request $request) => $service->prepkartaProgress($request));
        $router->add('GET', $basePath . '/concepts/:id/resume', fn (Request $request) => $service->prepkartaResume($request));
        $router->add('GET', $basePath . '/user/analytics', fn (Request $request) => $service->prepkartaAnalytics($request));
    }
}
