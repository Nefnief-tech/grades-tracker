import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FallbackBannerProps {
  message?: string;
}

export function FallbackBanner({ message }: FallbackBannerProps) {
  return (
    <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 mb-4">
      <Info className="h-4 w-4 text-amber-500" />
      <AlertDescription className="text-amber-800 dark:text-amber-300">
        {message || "Using cached data. Live data is currently unavailable."}
      </AlertDescription>
    </Alert>
  );
}

export default FallbackBanner;