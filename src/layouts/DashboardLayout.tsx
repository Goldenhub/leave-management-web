import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useUIStore } from "../stores/uiStore";

import { employeesApi } from "../api";
import { useQuery } from "@tanstack/react-query";

interface SubLinksTypes {
  label: string;
  url: string;
  permissions: [];
}

interface NavItem {
  name: string;
  url: string;
  icon: React.ReactNode;
  label?: string;
  permissions?: string[];
  subLinks?: SubLinksTypes[];
}

const Icons = {
  viewList: <p></p>,
};

export function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const navigate = useNavigate();

  const { data: menu, isLoading: MenuLoading } = useQuery({
    queryKey: ["NavMenu"],
    queryFn: () => employeesApi.getMenu(),
    enabled: !!user,
  });

  const Links = menu?.data?.menu || [];

  const navItems: NavItem[] = (Array.isArray(Links) ? Links : []).map((link) => ({
    name: link.label ?? "",
    url: `${link.url}`,
    icon: Icons[link.icon as keyof typeof Icons],
    permissions: link.permissions ?? [],
    subLinks: link?.subLinks,
  }));

  const toggleSubMenu = (name: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // const hasSubLinks = (item: string,) => {

  //   setHasSublinks(!hasSubLink);
  // }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile menu backdrop */}
      {mobileMenuOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileMenuOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full bg-white border-r border-neutral-200
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? "w-20" : "w-64"}
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            {!sidebarCollapsed && <span className="font-bold text-neutral-900">Leave Manager</span>}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `w-full flex items-center 
            justify-between cursor-pointer px-3 
            py-2.5 rounded-lg text-sm font-medium text-neutral-600 
               ${isActive ? "bg-primary-400 text-neutral-900" : " text-neutral-900 hover:bg-neutral-100 "}`}
          >
            Overview
          </NavLink>

          {navItems.map((item) => {
            const isOpen = openMenus[item.name];

            return (
              <div key={item.url}>
                {/* MAIN ITEM */}

                {item.subLinks && item.subLinks.length > 0 ? (
                  <div>
                    <button onClick={() => toggleSubMenu(item.name)} className="w-full flex items-center justify-between cursor-pointer px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900">
                      <span>{item.name}</span>
                      <span className={`transition-transform ${isOpen ? "rotate-90" : ""}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </button>
                  </div>
                ) : (
                  <div>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300
                         ${isActive ? "bg-primary-400 text-primary-700" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"}`
                      }
                    >
                      {item.name}
                    </NavLink>
                  </div>
                )}

                {/* SUB LINKS */}
                {isOpen && item.subLinks && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.subLinks.map((subLink) => (
                      <NavLink
                        key={subLink.url}
                        to={subLink.url}
                        className={({ isActive }) =>
                          `block px-3 py-2 rounded-lg text-sm transition-all duration-500
                  ${isActive ? "bg-primary-50 text-primary-700" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"}`
                        }
                      >
                        {subLink.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Collapse button - desktop only */}
        <button onClick={toggleSidebar} className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-neutral-200 shadow-sm items-center justify-center text-neutral-500 hover:text-neutral-700">
          <svg className={`w-4 h-4 transition-transform ${sidebarCollapsed ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"}`}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-neutral-200 sticky top-0 z-30">
          <div className="h-full px-4 lg:px-8 flex items-center justify-between">
            {/* Mobile menu button */}
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 rounded-lg text-neutral-500 hover:bg-neutral-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Search - placeholder */}
            <div className="hidden md:flex flex-1 max-w-md ml-4">
              <div className="relative w-full">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 bg-neutral-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
              </div>
            </div>

            {/* User menu */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full" />
              </button>

              {/* User dropdown */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-700">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-neutral-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-neutral-500">{user?.role?.name}</p>
                </div>
                <button onClick={handleLogout} className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-danger-600" title="Logout">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
