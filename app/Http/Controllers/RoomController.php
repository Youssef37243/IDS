<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    public function index()
    {
        return Room::all();
    }

   public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:100',
        'capacity' => 'required|integer',
        'location' => 'nullable|string|max:100',
        'feature' => 'nullable|string|max:100'
    ]);

    $room = Room::create($validated);
    return response()->json($room, 201);
}


    public function show(Room $room)
    {
        return $room;
    }

    public function update(Request $request, Room $room)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'capacity' => 'sometimes|integer',
            'location' => 'nullable|string|max:100',
            'feature' => 'nullable|string|max:100'
        ]);

        $room->update($validated);
        return response()->json($room);
    }

    public function destroy(Room $room)
    {
        $room->delete();
        return response()->json(null, 204);
    }
}