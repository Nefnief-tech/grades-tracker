// This is a temporary file containing the corrected code section
// Copy this code to replace the broken section in appwrite.ts

// Try to initialize Appwrite client
if (ENABLE_CLOUD_FEATURES && isBrowser && !FORCE_LOCAL_MODE) {
  try {
    // Only initialize if we have valid configuration
    if (validateAppwriteEndpoint(appwriteEndpoint) && appwriteProjectId) {
      logger.info("Initializing Appwrite client", {
        endpoint: appwriteEndpoint,
        projectId: appwriteProjectId,
        databaseId: DATABASE_ID,
      });
      
      logAppwriteInfo("Initializing Appwrite client with:", {
        endpoint: appwriteEndpoint,
        projectId: appwriteProjectId ? "[HIDDEN FOR SECURITY]" : undefined,
        databaseId: DATABASE_ID ? "[HIDDEN FOR SECURITY]" : undefined,
      });

      appwriteClient = new Client();

      // Log complete client info for debugging
      logger.debug("Client created", { client: appwriteClient });

      // Set the endpoint first, then the project ID
      try {
        appwriteClient.setEndpoint(appwriteEndpoint);
        logger.debug("Endpoint set successfully", { endpoint: appwriteEndpoint });
        logAppwriteInfo("Endpoint set successfully");
        
        // Log client headers after endpoint set
        logger.debug("Client headers after endpoint set", { headers: (appwriteClient as any).headers });
      } catch (endpointError) {
        logger.error("Failed to set endpoint", { error: endpointError });
        logAppwriteInfo("Failed to set endpoint:", endpointError);
        throw endpointError;
      }

      try {
        appwriteClient.setProject(appwriteProjectId);
        logger.debug("Project ID set successfully", { projectId: appwriteProjectId });
        logAppwriteInfo("Project ID set successfully");
        
        // Log client headers after projectId set
        logger.debug("Client headers after project ID set", { headers: (appwriteClient as any).headers });
      } catch (projectError) {
        logger.error("Failed to set project ID", { error: projectError });
        logAppwriteInfo("Failed to set project ID:", projectError);
        throw projectError;
      }

      // Create account and databases instances
      account = new Account(appwriteClient);
      databases = new Databases(appwriteClient);
      logAppwriteInfo("Appwrite client initialized successfully");

      // Check connection
      setTimeout(() => {
        checkCloudConnection().catch((err) => {
          logAppwriteInfo("Background connection check failed:", err);
        });
      }, 1000);
    } else {
      logAppwriteInfo(
        "Appwrite configuration is invalid or missing. Cloud features will be disabled."
      );
      enableLocalModeOnly();
    }
  } catch (error) {
    logAppwriteInfo("Failed to initialize Appwrite client:", error);
    showNetworkErrorOnce();
    enableLocalModeOnly();
  }
} else {
  if (FORCE_LOCAL_MODE) {
    logAppwriteInfo("Local-only mode is active. Cloud features are disabled.");
  } else if (!ENABLE_CLOUD_FEATURES) {
    logAppwriteInfo("Cloud features are disabled in configuration.");
  } else if (!isBrowser) {
    logAppwriteInfo(
      "Not in browser environment, skipping Appwrite initialization."
    );
  }
}