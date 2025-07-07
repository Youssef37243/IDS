<?php

namespace App\Http\Middleware;

use Closure;

class DevCspHeader
{
    public function handle($request, Closure $next)
    {
        $response = $next($request);

        $response->headers->set('Content-Security-Policy',
            "default-src 'self'; connect-src 'self' http://localhost:8000; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
        );

        return $response;
    }
}

