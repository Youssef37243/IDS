<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Display a listing of the users. Requires authentication.
     */
    public function index()
    {
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        return User::all()->makeHidden(['password_hash']);
    }

    /**
     * Store a newly created user. Requires admin authentication.
     */
    public function store(Request $request)
    {
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|string|max:50'
        ]);

        $user = User::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'password_hash' => $validated['password'], // Mutator will hash
            'role' => $validated['role'],
        ]);
        $user->makeHidden(['password_hash']);
        return response()->json($user, 201);
    }

    /**
     * Display the specified user. Requires authentication.
     */
    public function show(User $user)
    {
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        $user->makeHidden(['password_hash']);
        return $user;
    }

    /**
     * Update the specified user. Requires authentication and ownership or admin.
     */
public function update(Request $request, User $user)
{
    \Log::debug('Update Request:', [
        'auth_user' => auth()->id(),
        'target_user' => $user->id,
        'input_data' => $request->all()
    ]);
    if (!auth()->check()) {
        \Log::warning('Unauthorized access attempt');
        return response()->json(['message' => 'Unauthorized'], 401);
    }

    if (!auth()->check()) {
        return response()->json(['message' => 'Unauthorized'], 401);
    }
    if (auth()->user()->id !== $user->id && auth()->user()->role !== 'admin') {
        return response()->json(['message' => 'Forbidden'], 403);
    }

    $validated = $request->validate([
        'first_name' => 'sometimes|string|max:100',
        'last_name' => 'sometimes|string|max:100',
        'email' => 'sometimes|email|unique:users,email,'.$user->id,
        'old_password' => 'sometimes|required_with:password|string|min:8',
        'password' => 'sometimes|string|min:8|confirmed',
    ]);

    // Verify old password if changing password
    if (isset($validated['password'])) {
        if (!isset($validated['old_password'])) {
            return response()->json(['message' => 'Current password is required to change password'], 422);
        }
        
        if (!password_verify($validated['old_password'], $user->password_hash)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }
        
        $validated['password_hash'] = $validated['password']; // Mutator will hash
        unset($validated['password']);
        unset($validated['old_password']);
    }

    try {
        $user->update($validated);
        $user->makeHidden(['password_hash']);
        return response()->json([
            'message' => 'User updated successfully',
            'data' => $user
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to update user',
            'error' => $e->getMessage()
        ], 500);
    }
}

    /**
     * Remove the specified user. Requires authentication and ownership or admin.
     */
    public function destroy(User $user)
    {
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        if (auth()->user()->id !== $user->id && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        try {
            $user->delete();
            return response()->json([
                'message' => 'User deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete user',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}