<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminProjectController extends Controller
{
    public function index(): Response
    {
        $projects = Project::query()
            ->orderByDesc('is_active')
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'stream', 'description', 'is_active', 'updated_at'])
            ->map(fn (Project $project) => [
                'id' => $project->id,
                'name' => $project->name,
                'code' => $project->code,
                'stream' => $project->stream,
                'description' => $project->description,
                'isActive' => $project->is_active,
                'updatedAt' => $project->updated_at?->toDateTimeString(),
            ]);

        return Inertia::render('Admin/Projects/Index', [
            'projects' => $projects,
        ]);
    }

    public function create(): RedirectResponse
    {
        return redirect()->route('admin.projects.index');
    }

    public function store(StoreProjectRequest $request): RedirectResponse
    {
        Project::create([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active', true),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Project created.')]);

        return redirect()->route('admin.projects.index');
    }

    public function show(Project $project): RedirectResponse
    {
        return redirect()->route('admin.projects.index');
    }

    public function edit(Project $project): RedirectResponse
    {
        return redirect()->route('admin.projects.index');
    }

    public function update(UpdateProjectRequest $request, Project $project): RedirectResponse
    {
        $project->update([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Project updated.')]);

        return redirect()->route('admin.projects.index');
    }

    public function destroy(Project $project): RedirectResponse
    {
        $project->update(['is_active' => false]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Project archived.')]);

        return redirect()->route('admin.projects.index');
    }
}
