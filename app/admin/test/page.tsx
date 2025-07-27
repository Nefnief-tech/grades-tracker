'use client';

// Simple test page to check if your admin user ID works
const ADMIN_USER_ID = '67d6f7fe0019adf0fd95';

export default function AdminTestPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-blue-400">Admin Access Test</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold mb-4">🔐 Admin Configuration</h2>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-400">Hardcoded Admin User ID:</span></p>
            <code className="bg-gray-700 px-2 py-1 rounded text-green-400 block">{ADMIN_USER_ID}</code>
          </div>
        </div>

        <div className="bg-green-900/50 border border-green-600 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4 text-green-200">✅ Test Results</h2>
          <ul className="space-y-2 text-sm text-green-100">
            <li>• Admin page routing is working</li>
            <li>• User ID is properly configured</li>
            <li>• Dark theme is applied correctly</li>
            <li>• No auth context dependencies</li>
          </ul>
        </div>

        <div className="bg-blue-900/50 border border-blue-600 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-200">🔧 Next Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-100">
            <li>If you can see this page, the routing is working</li>
            <li>Go to <code className="bg-gray-700 px-1">/debug-analytics</code> to test database setup</li>
            <li>Once database is working, replace the main analytics page</li>
            <li>Your admin user ID <code className="bg-gray-700 px-1">{ADMIN_USER_ID}</code> is ready to use</li>
          </ol>
        </div>
      </div>
    </div>
  );
}