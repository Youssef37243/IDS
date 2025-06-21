<?php

namespace App\Http\Controllers;

use App\Models\Minute;
use Illuminate\Http\Request;

class MinuteController extends Controller
{
    public function index()
    {
        return Minute::with(['user', 'meeting', 'actionItems'])->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'meeting_id' => 'required|exists:meetings,id',
            'discussion_points' => 'nullable|string',
            'decisions' => 'nullable|string',
            'summary_pdf' => 'nullable|string|max:255'
        ]);

        $minute = Minute::create($validated);
        return response()->json($minute, 201);
    }

    public function show(Minute $minute)
    {
        return $minute->load(['user', 'meeting', 'actionItems']);
    }

    public function update(Request $request, Minute $minute)
    {
        $validated = $request->validate([
            'user_id' => 'sometimes|exists:users,id',
            'meeting_id' => 'sometimes|exists:meetings,id',
            'discussion_points' => 'nullable|string',
            'decisions' => 'nullable|string',
            'summary_pdf' => 'nullable|string|max:255'
        ]);

        try {
            $minute->update($validated);
            return response()->json([
                'message' => 'Minute updated successfully',
                'data' => $minute->load(['user', 'meeting', 'actionItems'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update minute',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Minute $minute)
    {
        try {
            $minute->delete();
            return response()->json([
                'message' => 'Minute deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete minute',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}