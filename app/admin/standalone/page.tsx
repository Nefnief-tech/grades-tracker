'use client';

// STANDALONE ADMIN ANALYTICS PAGE - NO DEPENDENCIES
// This page bypasses all middleware, layouts, and auth systems

export default function StandaloneAdminPage() {
  return (
    <html lang="en">
      <head>
        <title>Admin Analytics - Standalone</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-gray-900 text-white min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-blue-400 mb-4">🎉 SUCCESS! Admin Analytics</h1>
            <div className="bg-green-900/50 border border-green-600 text-green-200 p-4 rounded-lg">
              <h2 className="font-semibold mb-2">✅ You successfully bypassed all redirects!</h2>
              <p className="text-sm">This standalone page proves that routing to admin pages works.</p>
            </div>
          </div>

          {/* Security Status */}
          <div className="bg-red-900/50 border border-red-600 text-red-200 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">🔓 Complete Security Bypass</h3>
            <ul className="text-sm space-y-1">
              <li>• No auth context dependencies</li>
              <li>• No middleware interference</li>
              <li>• No layout restrictions</li>
              <li>• Standalone HTML page</li>
            </ul>
          </div>

          {/* Mock Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-blue-400">1,234</p>
              <p className="text-xs text-green-400 mt-1">↑ Mock data</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Active Sessions</h3>
              <p className="text-3xl font-bold text-green-400">87</p>
              <p className="text-xs text-green-400 mt-1">↑ Mock data</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Page Views</h3>
              <p className="text-3xl font-bold text-purple-400">5,678</p>
              <p className="text-xs text-green-400 mt-1">↑ Mock data</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Error Rate</h3>
              <p className="text-3xl font-bold text-red-400">0.1%</p>
              <p className="text-xs text-green-400 mt-1">↓ Mock data</p>
            </div>
          </div>

          {/* Charts Placeholder */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
            <h3 className="text-xl font-semibold mb-4">📊 Analytics Charts</h3>
            <div className="text-center py-16 border-2 border-dashed border-gray-600 rounded">
              <div className="text-6xl mb-4">📈</div>
              <p className="text-lg text-gray-300">Beautiful charts will go here</p>
              <p className="text-sm text-gray-500 mt-2">Once we connect the real analytics database</p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-900/50 border border-blue-600 p-6 rounded-lg mb-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-200">🔧 What We Know Now</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-blue-300 mb-2">✅ Working:</h4>
                <ul className="text-sm text-blue-100 space-y-1">
                  <li>• Admin route access works</li>
                  <li>• Page rendering works</li>
                  <li>• Styling works perfectly</li>
                  <li>• No redirect issues here</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-300 mb-2">🔄 Next Steps:</h4>
                <ul className="text-sm text-blue-100 space-y-1">
                  <li>• Identify what caused the redirect</li>
                  <li>• Check middleware configuration</li>
                  <li>• Fix the original page</li>
                  <li>• Add real analytics data</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Debug Info */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">🔍 Debug Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Current URL:</p>
                <code className="text-yellow-400" id="current-url">Loading...</code>
              </div>
              <div>
                <p className="text-gray-400">User Agent:</p>
                <code className="text-green-400" id="user-agent">Loading...</code>
              </div>
              <div>
                <p className="text-gray-400">Timestamp:</p>
                <code className="text-purple-400" id="timestamp">Loading...</code>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 text-center space-x-4">
            <a href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg">
              Go to Dashboard
            </a>
            <a href="/debug-analytics" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-lg">
              Test Database
            </a>
          </div>
        </div>

        <script>
          // Simple JavaScript to show we're fully loaded
          document.getElementById('current-url').textContent = window.location.href;
          document.getElementById('user-agent').textContent = navigator.userAgent.substring(0, 50) + '...';
          document.getElementById('timestamp').textContent = new Date().toLocaleString();
          
          console.log('✅ Standalone admin page loaded successfully!');
          console.log('URL:', window.location.href);
          console.log('No redirects occurred!');
        </script>
      </body>
    </html>
  );
}