import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileNavbar from "./MobileNavbar";
import useFriends from "../../hooks/useFriends";
import usePageTransition from "../../hooks/usePageTransition";

/**
 * The application shell: fixed rail on desktop, bottom nav on mobile, with
 * an optional context panel slot that individual pages fill via <Outlet />.
 *
 * Pending-request count is loaded once here and shared with both navs so
 * the badge is consistent everywhere.
 */
export default function AppLayout() {
  const location = useLocation();
  const { requests } = useFriends({ includeRequests: true });
  usePageTransition();

  const requestCount = requests.length;

  return (
    <div className="relative min-h-screen bg-surface">
      <Sidebar requestCount={requestCount} />

      <div className="lg:pl-sidebar">
        <Topbar requestCount={requestCount} />

        {/* Bottom padding clears the mobile nav bar and its floating button. */}
        <main className="relative z-10 px-5 pb-32 pt-8 md:px-8 md:pt-10 lg:px-margin-desktop lg:pb-20">
          {/* Keying on the path remounts the page, so each one replays its
              <PageTransition> entrance. Deliberately not wrapped in
              AnimatePresence — see the note in routes/AppRoutes.jsx. */}
          <div key={location.pathname}>
            <Outlet />
          </div>
        </main>
      </div>

      <MobileNavbar requestCount={requestCount} />
    </div>
  );
}
