/**
 * Admin Layout — uses dynamic import with ssr:false to prevent
 * hydration errors caused by session-dependent rendering.
 * The AdminShell handles all auth guards, sidebar, and topbar.
 */
import AdminShell from './AdminShell';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}