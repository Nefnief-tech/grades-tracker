'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Settings, Globe, User, Lock, Wand2, Clock } from 'lucide-react';
import { 
  loadPortalConfig, 
  savePortalConfig, 
  clearPortalConfig, 
  testPortalConnection,
  generateVertretungsplanUrl,
  generateTimetableUrl,
  validatePortalConfig,
  type SchoolPortalConfig 
} from '@/app/utils/portalConfig';

export default function PortalSetupPage() {  const [config, setConfig] = useState<SchoolPortalConfig>({
    username: '',
    password: '',
    baseUrl: '',
    vertretungsplanUrl: '',
    timetableUrl: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  
  const [savedConfig, setSavedConfig] = useState<SchoolPortalConfig | null>(null);
  // Load saved configuration on component mount
  useEffect(() => {
    const saved = loadPortalConfig();
    if (saved) {
      setConfig(saved);
      setSavedConfig(saved);
    }
  }, []);

  const handleInputChange = (field: keyof SchoolPortalConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const autoGenerateVertretungsplanUrl = () => {
    if (config.baseUrl) {
      const generated = generateVertretungsplanUrl(config.baseUrl);
      setConfig(prev => ({
        ...prev,
        vertretungsplanUrl: generated
      }));
    }
  };

  const autoGenerateTimetableUrl = () => {
    if (config.baseUrl) {
      const generated = generateTimetableUrl(config.baseUrl);
      setConfig(prev => ({
        ...prev,
        timetableUrl: generated
      }));
    }
  };

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult(null);

    // Validate configuration first
    const validation = validatePortalConfig(config);
    if (!validation.isValid) {
      setTestResult({
        success: false,
        message: 'Configuration is invalid: ' + validation.errors.join(', ')
      });
      setIsLoading(false);
      return;
    }

    try {
      const result = await testPortalConnection(config);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Network error. Please check your internet connection and try again.',
        details: error
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = () => {
    try {
      const validation = validatePortalConfig(config);
      if (!validation.isValid) {
        setTestResult({
          success: false,
          message: 'Cannot save invalid configuration: ' + validation.errors.join(', ')
        });
        return;
      }

      const saved = savePortalConfig(config);
      setSavedConfig(saved);
      
      // Show success message
      setTestResult({
        success: true,
        message: 'Configuration saved successfully!',
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to save configuration. Please try again.',
      });
    }
  };
  const clearConfiguration = () => {
    clearPortalConfig();
    setConfig({
      username: '',
      password: '',
      baseUrl: '',
      vertretungsplanUrl: '',
      timetableUrl: ''
    });
    setSavedConfig(null);
    setTestResult(null);
  };
  const isFormValid = config.username && config.password && config.baseUrl && config.vertretungsplanUrl;
  const hasUnsavedChanges = JSON.stringify(config) !== JSON.stringify(savedConfig);
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">          <div className="flex items-center justify-center gap-3 mb-4">
            <Settings className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Portal Setup</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Configure your school portal credentials to access substitute plans and timetables.
            Your credentials are stored securely in your browser.
          </p>
        </div>

        {/* Configuration Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              School Portal Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Base URL */}
            <div className="space-y-2">
              <Label htmlFor="baseUrl" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Base URL
              </Label>
              <Input
                id="baseUrl"
                type="url"
                placeholder="https://yourschool.eltern-portal.org/"
                value={config.baseUrl}
                onChange={(e) => handleInputChange('baseUrl', e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-sm text-gray-500">
                The main URL of your school's portal (e.g., https://yourschool.eltern-portal.org/)
              </p>
            </div>            {/* Vertretungsplan URL */}
            <div className="space-y-2">
              <Label htmlFor="vertretungsplanUrl" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Substitute Plan URL
              </Label>
              <div className="flex gap-2">
                <Input
                  id="vertretungsplanUrl"
                  type="url"
                  placeholder="https://yourschool.eltern-portal.org/service/vertretungsplan"
                  value={config.vertretungsplanUrl}
                  onChange={(e) => handleInputChange('vertretungsplanUrl', e.target.value)}
                  className="font-mono text-sm flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={autoGenerateVertretungsplanUrl}
                  disabled={!config.baseUrl}
                  className="flex items-center gap-1 whitespace-nowrap"
                >
                  <Wand2 className="w-3 h-3" />
                  Auto
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                The direct URL to the substitute plan service (click "Auto" to generate from base URL)
              </p>            </div>

            {/* Timetable URL */}
            <div className="space-y-2">
              <Label htmlFor="timetableUrl" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Timetable URL (Optional)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="timetableUrl"
                  type="url"
                  placeholder="https://yourschool.eltern-portal.org/service/stundenplan"
                  value={config.timetableUrl || ''}
                  onChange={(e) => handleInputChange('timetableUrl', e.target.value)}
                  className="font-mono text-sm flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={autoGenerateTimetableUrl}
                  disabled={!config.baseUrl}
                  className="flex items-center gap-1 whitespace-nowrap"
                >
                  <Wand2 className="w-3 h-3" />
                  Auto
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                The direct URL to the timetable/schedule service (optional - click "Auto" to generate)
              </p>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="student123"
                value={config.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                autoComplete="username"
              />
              <p className="text-sm text-gray-500">
                Your portal username or student ID
              </p>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={config.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                autoComplete="current-password"
              />              <p className="text-sm text-muted-foreground">
                Your portal password
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
              <Button
                onClick={testConnection}
                disabled={!isFormValid || isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Test Connection
              </Button>

              <Button
                onClick={saveConfiguration}
                disabled={!isFormValid || !hasUnsavedChanges}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Save Configuration
              </Button>

              <Button
                onClick={clearConfiguration}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResult && (
          <Alert className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <AlertDescription className={testResult.success ? "text-green-800" : "text-red-800"}>
                {testResult.message}
              </AlertDescription>
            </div>
            {testResult.details && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium">
                  Show technical details
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(testResult.details, null, 2)}
                </pre>
              </details>
            )}
          </Alert>
        )}        {/* Current Configuration Status */}
        {savedConfig && (
          <Card className="bg-green-950/50 border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <h3 className="font-semibold text-green-300">Configuration Saved</h3>
              </div>              <div className="text-sm text-green-200 space-y-1">
                <p><strong>Base URL:</strong> {savedConfig.baseUrl}</p>
                <p><strong>Username:</strong> {savedConfig.username}</p>
                <p><strong>Substitute Plan URL:</strong> {savedConfig.vertretungsplanUrl}</p>
                {savedConfig.timetableUrl && (
                  <p><strong>Timetable URL:</strong> {savedConfig.timetableUrl}</p>
                )}
              </div>{hasUnsavedChanges && (
                <p className="text-orange-300 text-sm mt-2 font-medium">
                  You have unsaved changes. Click "Save Configuration" to update.
                </p>
              )}
            </CardContent>
          </Card>
        )}        {/* Help Section */}
        <Card className="bg-blue-950/50 border-blue-800">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Setup Help
            </h3>
            <div className="text-sm text-blue-200 space-y-2">
              <p><strong>Base URL:</strong> This is the main website of your school portal (e.g., https://yourschool.eltern-portal.org/)</p>
              <p><strong>Substitute Plan URL:</strong> Usually the base URL followed by /service/vertretungsplan</p>
              <p><strong>Credentials:</strong> Use the same username and password you use to log into the portal</p>
              <p><strong>Testing:</strong> Always test your connection before saving to ensure everything works correctly</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}