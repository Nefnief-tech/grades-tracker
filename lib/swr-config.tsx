import React from "react";

// Since we don't have SWR installed yet, provide a simple passthrough component
export const SWRConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <>{children}</>;
};

/*
// IMPORTANT: Run the following command to install SWR:
// npm install swr
// or
// pnpm add swr

// Then replace this file with:

import { SWRConfig } from "swr";
import React from "react";

export const SWRConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <SWRConfig
      value={{
        fetcher: (resource) => fetch(resource).then((res) => res.json()),
        revalidateOnFocus: false,
        revalidateIfStale: true,
        dedupingInterval: 30000, // 30 seconds to prevent excessive fetching
        errorRetryCount: 3,
        refreshInterval: 0, // Disable auto-refreshing to prevent excessive fetching
        suspense: false,
      }}
    >
      {children}
    </SWRConfig>
  );
};
*/
