<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class HelpCenterController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('help-center', [
            'articles' => config('help_center.articles', []),
        ]);
    }
}
