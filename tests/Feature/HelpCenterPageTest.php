<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('authenticated users can view the help center articles', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('help-center'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('help-center')
            ->has('articles', 3)
            ->where('articles.0.id', 'getting-started')
            ->where('articles.0.title', 'Getting Started With the LoE Tracker')
            ->where('articles.1.id', 'saving-and-submitting')
            ->where('articles.2.id', 'my-allocations'),
        );
});

test('guests are redirected away from the help center', function () {
    $this->get(route('help-center'))
        ->assertRedirect(route('login'));
});
