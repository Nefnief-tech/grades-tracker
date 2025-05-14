'use client';

import { useState } from 'react';
import { Client, Databases } from 'appwrite';

export default function CollectionsDebugPage() {
  const [projectId, setProjectId] = useState('68235ffb0033b3172656');
  const [endpoint, setEndpoint] = useState('https://fra.cloud.appwrite.io/v1');
  const [databaseId, setDatabaseId] = useState('67d6b079002144822b5e');
  const [collectionId, setCollectionId] = useState('67d6b0ac000fc4ecaaaf');
  
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testCollection = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      // Initialize client
      const client = new Client();
      client.setEndpoint(endpoint).setProject(projectId);
      
      // Initialize databases
      const databases = new Databases(client);
      
      // Try to get collection details first
      try {
        const collection = await databases.getCollection(databaseId, collectionId);
        
        // Then list documents in the collection
        const documents = await databases.listDocuments(
          databaseId,
          collectionId,
          [/* no queries */] // List first few documents
        );
        
        // Show results
        setResults({
          collection,
          documents: documents.documents,
          documentCount: documents.total
        });
        
      } catch (error: any) {
        if (error.code === 401) {
          setError('Authentication error. Make sure you have permission to access this collection.');
        } else if (error.code === 404) {
          setError(`Collection not found. Verify database ID (${databaseId}) and collection ID (${collectionId}) are correct.`);
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Error testing collection:', error);
      setError(error.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Appwrite Collections Check</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endpoint URL
            </label>
            <input
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project ID
            </label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Database ID
            </label>
            <input
              type="text"
              value={databaseId}
              onChange={(e) => setDatabaseId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Collection ID
            </label>
            <input
              type="text"
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <button
          onClick={testCollection}
          disabled={loading}
          className={`mt-4 px-4 py-2 rounded-md ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {loading ? 'Checking...' : 'Check Collection'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {results && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-green-700 mb-2">Collection Found!</h3>
          
          <div className="mt-4">
            <h4 className="text-md font-semibold mb-2">Collection Details:</h4>
            <div className="bg-white p-3 rounded-md border border-green-100">
              <p><strong>Name:</strong> {results.collection.name}</p>
              <p><strong>ID:</strong> {results.collection.$id}</p>
              <p><strong>Document Count:</strong> {results.documentCount}</p>
            </div>
          </div>
          
          {results.documents.length > 0 && (
            <div className="mt-4">
              <h4 className="text-md font-semibold mb-2">Sample Document:</h4>
              <pre className="bg-white p-3 rounded-md border border-green-100 overflow-x-auto text-xs">
                {JSON.stringify(results.documents[0], null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
      
      <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
        <h2 className="text-lg font-semibold mb-2">Collection IDs in Environment</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Database ID:</strong> {process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'Not set'}</li>
          <li><strong>Users Collection:</strong> {process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || 'Not set'}</li>
          <li><strong>Subjects Collection:</strong> {process.env.NEXT_PUBLIC_APPWRITE_SUBJECTS_COLLECTION_ID || 'Not set'}</li>
          <li><strong>Grades Collection:</strong> {process.env.NEXT_PUBLIC_APPWRITE_GRADES_COLLECTION_ID || 'Not set'}</li>
          <li><strong>Timetable Collection:</strong> {process.env.NEXT_PUBLIC_APPWRITE_TIMETABLE_COLLECTION_ID || 'Not set'}</li>
          <li><strong>Tests Collection:</strong> {process.env.NEXT_PUBLIC_APPWRITE_TESTS_COLLECTION_ID || 'Not set'}</li>
        </ul>
      </div>
    </div>
  );
}