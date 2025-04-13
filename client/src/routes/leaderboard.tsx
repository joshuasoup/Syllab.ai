import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { User } from '../../types';

export default function Leaderboard() {
  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      console.log('Fetching users...');
      const result = await api.user.getAll();
      console.log('Users fetched:', result);
      return result;
    },
  });

  console.log('Current state:', { users, isLoading, error });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-8 text-center">
              <h2 className="text-red-500 mb-4">Error loading leaderboard</h2>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={
                          `${user.firstName || ''} ${
                            user.lastName || ''
                          }`.trim() || user.email
                        }
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-600 text-xl">👤</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">
                      {`${user.firstName || ''} ${
                        user.lastName || ''
                      }`.trim() || user.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {Math.floor(
                        (Date.now() - new Date(user.createdAt).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{' '}
                      XP
                    </div>
                    <div className="text-sm text-gray-500">Days Active</div>
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
