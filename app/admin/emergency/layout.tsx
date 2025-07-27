// Emergency admin layout that bypasses all auth
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111827' }}>
      {children}
    </div>
  );
}