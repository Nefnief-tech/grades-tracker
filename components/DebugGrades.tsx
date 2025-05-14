import React, { useEffect, useState } from 'react';
import { getSubjectsFromCloud, getCurrentUser } from '@/lib/appwrite';

/**
 * A component to debug and display information about grades
 */
export default function DebugGrades() {
  const [user, setUser] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get the current user
  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (e) {
        console.error("Failed to get current user:", e);
        setError("Not logged in or authentication error");
        setLoading(false);
      }
    }
    
    loadUser();
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) {
        setError("No user logged in");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        // Use the direct function to get subjects with grades
        const subjectsData = await getSubjectsFromCloud(user.id);
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
  }, [user]);

  if (loading) return <div className="p-4">Loading subjects and grades...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!subjects?.length) return <div className="p-4">No subjects found</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Subject Grades Debug</h2>
      
      <div className="space-y-6">
        {subjects.map(subject => (
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
        ))}
      </div>
    </div>
  );
}