<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class ApplicationUsersSeeder extends Seeder
{
    /**
     * One admin and ten non-admin users for local/demo use.
     * Password for all: "password" (hashed via the model cast).
     */
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => 'password',
                'email_verified_at' => now(),
                'is_admin' => true,
            ],
        );

        foreach (range(1, 10) as $i) {
            User::query()->updateOrCreate(
                ['email' => "user{$i}@example.com"],
                [
                    'name' => "Demo User {$i}",
                    'password' => 'password',
                    'email_verified_at' => now(),
                    'is_admin' => false,
                ],
            );
        }
    }
}
