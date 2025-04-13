// src/components/Leaderboard.tsx
import React from 'react';
import { Trophy } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { User } from '@/types';

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  rank: number;
}

const Leaderboard: React.FC = () => {
  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      console.log('Starting to fetch users...');
      try {
        const result = await api.user.getAll();
        console.log('Users fetched successfully:', result);
        return result;
      } catch (err) {
        console.error('Error fetching users:', err);
        throw err;
      }
    },
  });

  console.log('Current state:', { users, isLoading, error });

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center mb-10">
          <Trophy className="h-10 w-10 text-yellow-500 mr-4" />
          <h2 className="text-4xl font-bold text-gray-900">Leaderboard</h2>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Error in leaderboard:', error);
    return (
      <div className="w-full">
        <div className="flex items-center mb-10">
          <Trophy className="h-10 w-10 text-yellow-500 mr-4" />
          <h2 className="text-4xl font-bold text-gray-900">Leaderboard</h2>
        </div>
        <div className="text-center text-red-500">
          <p>Error loading leaderboard</p>
          <p className="text-sm mt-2">
            {(error as Error)?.message || 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  // Convert users to leaderboard entries
  const leaderboardEntries =
    users?.map((user, index) => ({
      id: user.id,
      name:
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.email,
      score: Math.floor(
        (new Date().getTime() - new Date(user.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      ),
      rank: index + 1,
    })) || [];

  return (
    <div className="w-full">
      <div className="flex items-center mb-10">
        <Trophy className="h-10 w-10 text-yellow-500 mr-4" />
        <h2 className="text-4xl font-bold text-gray-900">Leaderboard</h2>
      </div>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue-100 p-5 flex font-semibold text-gray-700 text-lg">
          <div className="w-20 text-center">Rank</div>
          <div className="flex-1">Name</div>
          <div className="w-32 text-right">Score</div>
        </div>
        <div className="divide-y divide-gray-200">
          {leaderboardEntries.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center p-5 ${
                entry.rank === 1 ? 'bg-blue-50' : ''
              } text-lg`}
            >
              <div className="w-20 text-center">
                {entry.rank === 1 && (
                  <span className="text-yellow-500 text-2xl">🏆</span>
                )}
                {entry.rank === 2 && (
                  <span className="text-gray-400 text-2xl">🥈</span>
                )}
                {entry.rank === 3 && (
                  <span className="text-amber-600 text-2xl">🥉</span>
                )}
                {entry.rank > 3 && (
                  <span className="text-xl">{entry.rank}</span>
                )}
              </div>
              <div className="flex-1 font-medium">{entry.name}</div>
              <div className="w-32 text-right font-semibold">
                {entry.score} pts
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
