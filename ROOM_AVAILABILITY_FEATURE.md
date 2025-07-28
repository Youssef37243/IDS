# Room Availability Feature

## Overview
A comprehensive room availability system that displays room availability for the current week or month, with detailed availability information when clicking on individual rooms.

## Features Implemented

### 1. Dashboard Room Availability Section
- **Location**: Added to `/resources/views/dashboard.blade.php`
- **Features**:
  - Period selector (Week/Month view)
  - Refresh button
  - Grid layout showing all rooms
  - Visual indicators for room availability

### 2. API Endpoints
Two new endpoints added to `/routes/api.php`:

#### GET /api/rooms-availability
- **Purpose**: Get availability overview for all rooms
- **Parameters**: 
  - `period` (optional): 'week' or 'month' (default: 'week')
  - `start_date` (optional): Starting date (default: current week start)
- **Response**: JSON with room availability summary

#### GET /api/rooms/{room}/availability
- **Purpose**: Get detailed availability for a specific room
- **Parameters**: 
  - `period` (optional): 'week' or 'month' (default: 'week')
  - `start_date` (optional): Starting date (default: current week start)
- **Response**: JSON with detailed daily availability including busy periods

### 3. Backend Implementation
- **File**: `/app/Http/Controllers/RoomController.php`
- **New Methods**:
  - `availability()`: Returns overview of all rooms' availability
  - `roomAvailability()`: Returns detailed availability for a specific room

### 4. Frontend Implementation
- **File**: `/public/js/dash.js`
- **New Functions**:
  - `loadRoomAvailability()`: Loads and displays room availability grid
  - `renderRoomAvailability()`: Renders room cards with availability summary
  - `showRoomAvailabilityDetails()`: Shows detailed modal for specific room
  - `renderRoomDetails()`: Renders detailed availability in modal

### 5. Styling
- **File**: `/public/css/style.css`
- **New CSS Classes**:
  - `.room-availability-card`: Individual room card styling
  - `.availability-summary`: Day-by-day availability display
  - `.availability-status`: Status indicators (available/busy)
  - `.room-availability-modal`: Modal styling for detailed view

## How It Works

### Room Availability Grid
1. Displays all rooms in a responsive grid layout
2. Each room card shows:
   - Room name and capacity
   - Weekly/monthly availability summary
   - Visual indicators for busy vs available days

### Room Detail Modal
1. Click any room card to see detailed availability
2. Shows day-by-day breakdown:
   - "Available all day" for free days
   - List of busy periods with times and meeting titles
3. Easy navigation between different rooms

### Period Selection
- Toggle between week and month views
- Automatically refreshes data when period changes
- Maintains current selection state

## User Experience

### Visual Indicators
- **Green**: Available all day
- **Orange/Red**: Has meetings (shows count)
- **Hover Effects**: Cards lift on hover for better interaction feedback

### Interaction Flow
1. User selects time period (week/month)
2. System loads room availability data
3. Displays grid of room cards with availability summary
4. User clicks room card to see detailed breakdown
5. Modal shows exact busy periods and available times

## Technical Details

### Database Queries
- Efficient queries using Laravel's Eloquent relationships
- Date range filtering for optimal performance
- Proper grouping by date for easy processing

### Response Format
```json
{
  "period": "week",
  "start_date": "2024-01-15",
  "end_date": "2024-01-21", 
  "rooms": [
    {
      "room": {
        "id": 1,
        "name": "Conference Room A",
        "capacity": 10
      },
      "availability_summary": {
        "2024-01-15": "Available all day",
        "2024-01-16": [
          {
            "start": "09:00",
            "end": "10:30", 
            "title": "Team Meeting"
          }
        ]
      }
    }
  ]
}
```

### Error Handling
- Graceful fallback for API errors
- Loading states during data fetching
- User-friendly error messages

## Testing
- Created `test-room-availability.html` for UI testing
- Demonstrates all visual components and interactions
- Can be opened directly in browser for quick testing

## Integration
The feature is fully integrated into the existing dashboard and follows the same authentication and styling patterns as the rest of the application.