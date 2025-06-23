<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Register a new user. Public endpoint.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|string|max:50',
        ]);

        $user = User::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'password_hash' => $validated['password'], // Mutator will hash
            'role' => $validated['role'],
        ]);
        $user->makeHidden(['password_hash']);
        return response()->json(['user' => $user], 201);
    }

    /**
     * Login a user and issue a token. Public endpoint.
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $credentials['email'])->first();
        if (!$user || !password_verify($credentials['password'], $user->password_hash)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Issue Sanctum token
        $token = $user->createToken('api-token')->plainTextToken;
        $user->makeHidden(['password_hash']);
        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }

    /**
     * Logout the authenticated user. Requires authentication.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Get the authenticated user's profile. Requires authentication.
     */
    public function profile(Request $request)
    {
        $user = $request->user();
        $user->makeHidden(['password_hash']);
        return response()->json(['user' => $user]);
    }

    /**
     * Login a user and issue a JWT token. Public endpoint.
     */
    public function jwtLogin(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (!$token = app('tymon.jwt.auth')->attempt(['email' => $credentials['email'], 'password' => $credentials['password']])) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = auth('api')->user();
        $user->makeHidden(['password_hash']);
        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }

    /**
     * Logout the authenticated user (JWT). Requires JWT authentication.
     */
    public function jwtLogout()
    {
        auth('api')->logout();
        return response()->json(['message' => 'Logged out successfully (JWT)']);
    }

    /**
     * Get the authenticated user's profile (JWT). Requires JWT authentication.
     */
    public function jwtProfile()
    {
        $user = auth('api')->user();
        $user->makeHidden(['password_hash']);
        return response()->json(['user' => $user]);
    }
} 