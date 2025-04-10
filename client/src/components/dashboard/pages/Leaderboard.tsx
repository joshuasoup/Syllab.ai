// src/components/Leaderboard.tsx
import React from 'react';
import { Trophy } from 'lucide-react';

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  rank: number;
}

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ leaderboard }) => {
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
          {leaderboard.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center p-5 ${entry.id === '1' ? 'bg-blue-50' : ''} text-lg`}
            >
              <div className="w-20 text-center">
                {entry.rank === 1 && <span className="text-yellow-500 text-2xl">🏆</span>}
                {entry.rank === 2 && <span className="text-gray-400 text-2xl">🥈</span>}
                {entry.rank === 3 && <span className="text-amber-600 text-2xl">🥉</span>}
                {entry.rank > 3 && <span className="text-xl">{entry.rank}</span>}
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