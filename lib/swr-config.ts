// This is a temporary implementation until SWR is installed
export const SWRConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <>{children}</>;
};

// Once you've installed SWR with:
// npm install swr
// or: pnpm add swr
// Replace this file's contents with:
/*
import { SWRConfig } from "swr";

export const SWRConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <SWRConfig
      value={{
        fetcher: (resource) => fetch(resource).then((res) => res.json()),
        revalidateOnFocus: false,
        revalidateIfStale: false,
        dedupingInterval: 5000,
        errorRetryCount: 3,
      }}
    >
      {children}
    </SWRConfig>
  );
};
*/
