import React, { useState, useEffect } from "react";
import {
  Alert,
  TextInput,
  Button,
  Box,
  Center,
  Group,
  Text,
} from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";

interface MaintenanceModeProps {
  isActive: boolean;
}

const MaintenanceMode: React.FC<MaintenanceModeProps> = ({ isActive }) => {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // You can change this to your preferred maintenance mode password
  const MAINTENANCE_PASSWORD = "admin123";

  // Check if there's a stored unlock state in local storage
  useEffect(() => {
    const storedUnlockState = localStorage.getItem("maintenanceUnlocked");
    if (storedUnlockState === "true") {
      setUnlocked(true);
    }
  }, []);

  const handleUnlock = () => {
    if (password === MAINTENANCE_PASSWORD) {
      setUnlocked(true);
      setError("");
      // Store the unlock state in local storage for the current session
      localStorage.setItem("maintenanceUnlocked", "true");

      // Disable FORCE_LOCAL_MODE to allow Appwrite sync during maintenance
      try {
        // Import dynamically to avoid circular dependencies
        import("@/lib/appwrite").then((appwrite) => {
          // Set FORCE_LOCAL_MODE to false to enable cloud sync
          appwrite.FORCE_LOCAL_MODE = false;
          console.log(
            "[MaintenanceMode] Disabled FORCE_LOCAL_MODE to allow cloud sync"
          );
        });
      } catch (error) {
        console.error("Failed to disable local mode:", error);
      }
    } else {
      setError("Invalid password");
    }
  };

  if (!isActive || unlocked) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <Center mb={30}>
        <IconAlertTriangle size={48} color="orange" />
      </Center>
      <Alert
        title="System Under Maintenance"
        color="orange"
        radius="md"
        sx={{ maxWidth: 500, marginBottom: 20 }}
      >
        Our system is currently undergoing scheduled maintenance. We apologize
        for any inconvenience this may cause. The system will be available again
        shortly.
      </Alert>

      <Box sx={{ maxWidth: 300, width: "100%" }}>
        <Text size="sm" mb={5}>
          Administrator unlock:
        </Text>
        <Group spacing="xs" grow>
          <TextInput
            placeholder="Enter maintenance key"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
          />
          <Button onClick={handleUnlock} compact>
            Unlock
          </Button>
        </Group>
      </Box>
    </Box>
  );
};

export default MaintenanceMode;
