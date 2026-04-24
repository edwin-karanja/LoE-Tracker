<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateMonthlyAllocationsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() === true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'allocations' => ['required', 'array'],
            'allocations.*.user_id' => ['required', 'integer', 'exists:users,id'],
            'allocations.*.project_id' => ['required', 'integer', 'exists:projects,id'],
            'allocations.*.allocation_percent' => ['required', 'integer', 'min:0', 'max:200'],
        ];
    }
}
