import React, { useEffect, useState } from 'react';
import { getSubjectsFromCloud, getCurrentUser } from '@/lib/appwrite';

/**
 * A standalone component to debug grades without dependencies on contexts
 */
export default function StandaloneDebugGrades() {
  const [userId, setUserId] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manualUserId, setManualUserId] = useState('');

  // Try to get current user automatically
  useEffect(() => {
    async function getUser() {
      try {
        const user = await getCurrentUser();
        if (user?.id) {
          setUserId(user.id);
          console.log("Auto-detected user ID:", user.id);
        }
      } catch (e) {
        console.log("Not logged in:", e);
      }
    }

    getUser();
  }, []);

  // Function to fetch subjects when we have a userId
  useEffect(() => {
    async function fetchData() {
      if (!userId) {
        return; // Wait for userId to be set
      }

      setLoading(true);
      setError(null);
      
      try {
        // Fetch subjects with grades
        const subjectsData = await getSubjectsFromCloud(userId);
        console.log("Debug: Fetched subjects with grades:", subjectsData.length);
        setSubjects(subjectsData);
      } catch (e) {
        console.error("Failed to fetch subjects with grades:", e);
        setError("Failed to load subjects: " + (e as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId]);

  // Manual user ID entry form
  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (manualUserId.trim()) {
      setUserId(manualUserId.trim());
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Subject Grades Debugger</h2>
      
      {/* User ID section */}
      <div className="mb-6 p-4 border rounded-md bg-gray-50">
        {userId ? (
          <div>
            <p className="text-green-600">Using User ID: {userId}</p>
            <button 
              onClick={() => setUserId(null)}
              className="mt-2 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            >
              Change User
            </button>
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="flex flex-col space-y-2">
            <p className="text-amber-600">No user detected. Enter a user ID manually:</p>
            <div className="flex space-x-2">
              <input
                type="text"
                value={manualUserId}
                onChange={(e) => setManualUserId(e.target.value)}
                placeholder="Enter User ID"
                className="px-3 py-2 border rounded flex-grow"
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={!manualUserId.trim()}
              >
                Submit
              </button>
            </div>
          </form>
        )}
      </div>
      
      {/* Display status */}
      {loading && <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">Loading data...</div>}
      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">{error}</div>}
      
      {/* Results section */}
      {!loading && !error && userId && (
        <div className="space-y-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p>Found {subjects.length} subjects</p>
          </div>
          
          {subjects.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p>No subjects found for this user.</p>
            </div>
          ) : (
            subjects.map(subject => (
              <div key={subject.id} className="border rounded-md p-4">
                <h3 className="text-lg font-medium mb-2">
                  {subject.name} (ID: {subject.id.substring(0, 8)}...)
                </h3>
                <p>Average Grade: {subject.averageGrade}</p>
                
                <div className="mt-4">
                  <h4 className="font-medium">Grades ({subject.grades?.length || 0}):</h4>
                  {!subject.grades?.length ? (
                    <p className="text-gray-500 italic">No grades found</p>
                  ) : (
                    <div className="mt-2 overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {subject.grades.map((grade: any) => (
                            <tr key={grade.id}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                {grade.id.substring(0, 6)}...
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                {grade.name || '(No name)'}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                {grade.value}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                {grade.weight}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}