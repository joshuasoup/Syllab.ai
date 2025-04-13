# Leaderboard Implementation Guide

## Overview

This guide outlines the steps needed to connect the database to the leaderboard component and display user information.

## Prerequisites

- Supabase database connection is already set up
- User authentication is implemented
- Basic leaderboard UI is in place

## Implementation Steps

### 1. Database Setup

- Ensure the `users` table exists in your Supabase database with the following columns:
  - `id` (UUID)
  - `email` (string)
  - `first_name` (string)
  - `last_name` (string)
  - `created_at` (timestamp)

### 2. API Service Update

Add a new method to fetch users in `client/src/services/api.ts`:

```typescript
// Add to the user API object
getAll: () => fetchApi<User[]>('/user/all');
```

### 3. Backend Endpoint

Create a new endpoint in your backend to fetch all users:

```typescript
// Example endpoint in your backend
app.get('/user/all', async (req, res) => {
  try {
    const { data: users, error } = await supabase.from('users').select('*');
    if (error) throw error;
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});
```

### 4. Leaderboard Component Update

Update the leaderboard component to fetch and display users:

```typescript
import { useFindMany } from '@tanstack/react-query';
import { api } from '../../services/api';
import { User } from '../../types';

export default function Leaderboard() {
  const {
    data: users,
    isLoading,
    error,
  } = useFindMany({
    queryKey: ['users'],
    queryFn: () => api.user.getAll(),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading leaderboard</div>;
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-center mb-8">
              SyllabAI Leaders
            </h1>

            {/* Trophy Icons */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="bg-amber-200 rounded-full p-3">
                <span className="text-amber-800 text-xl">🏆</span>
              </div>
              <div className="bg-gray-100 rounded-full p-3">
                <span className="text-xl">🥈</span>
              </div>
              <div className="bg-gray-100 rounded-full p-3">
                <span className="text-xl">🥉</span>
              </div>
            </div>

            {/* Leaderboard List */}
            <div className="border-t border-gray-200 pt-6">
              {users?.map((user, index) => (
                <div
                  key={user.id}
                  className="flex items-center py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 text-gray-500 font-medium text-lg">
                    {index + 1}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-4 overflow-hidden">
                    <span className="text-gray-600 text-xl">👤</span>
                  </div>
                  <div className="flex-grow font-medium text-lg">
                    {user.first_name && user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user.email}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 5. Testing

1. Start your development server
2. Navigate to the leaderboard page
3. Verify that:
   - Users are displayed correctly
   - Names are shown properly
   - Loading state works
   - Error handling works

## Notes

- The implementation assumes basic user data structure
- No sorting logic is implemented (can be added later)
- Error handling is basic and can be enhanced
- Loading states can be improved with better UI components

## Next Steps

- Implement sorting based on user activity/points
- Add user avatars
- Implement pagination for large user lists
- Add filtering options
- Enhance error handling and loading states
