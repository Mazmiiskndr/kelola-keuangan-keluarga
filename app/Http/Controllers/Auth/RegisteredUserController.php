<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\FinancialProfile;
use App\Models\User;
use App\Services\Finance\CategoryBootstrapService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function __construct(private readonly CategoryBootstrapService $categories) {}

    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        FinancialProfile::query()->create([
            'user_id' => $user->id,
            'account_type' => 'personal',
            'monthly_income_estimate' => 0,
            'financial_month_start_day' => 1,
            'risk_profile' => 'moderate',
            'target_saving_ratio' => 20,
            'emergency_fund_months' => 6,
            'main_goal' => 'control_spending',
        ]);

        $this->categories->ensureDefaults($user);

        event(new Registered($user));

        Auth::login($user);

        return to_route('dashboard');
    }
}
