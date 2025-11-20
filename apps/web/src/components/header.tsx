import { Link } from "@tanstack/react-router";
import UserMenu from "./user-menu";
import ThemeToggle from "./theme-toggle";
import TimeRangeTabs from "./time-range-tabs";
import { useLocation } from "@tanstack/react-router";
import type { TimeRange } from "@top-github-repos/api/types/repos";

export default function Header() {
  const location = useLocation();
  const pathname = location.pathname;

  // Determine current time range from pathname
  const getCurrentTimeRange = (): TimeRange => {
    if (pathname.startsWith("/yearly")) return "yearly";
    if (pathname.startsWith("/monthly")) return "monthly";
    if (pathname.startsWith("/weekly")) return "weekly";
    return "daily";
  };

  return (
    <div className="border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <TimeRangeTabs currentRange={getCurrentTimeRange()} />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {/* <UserMenu /> */}
          </div>
        </div>
      </div>
    </div>
  );
}
