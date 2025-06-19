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

        $minute->update($validated);
        return response()->json($minute);
    }

    public function destroy(Minute $minute)
    {
        $minute->delete();
        return response()->json(null, 204);
    }
}