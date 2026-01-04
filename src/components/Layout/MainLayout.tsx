import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  Activity,
  Stethoscope,
  Calendar,
  Home,
  UserCog,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react';
import { horseHead as HorseHead } from '@lucide/lab';

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['admin', 'staff', 'owner'] },
    { name: 'Horses', href: '/horses', icon: HorseHead, roles: ['admin', 'staff', 'owner'] },
    { name: 'Stalls', href: '/stalls', icon: Building2, roles: ['admin', 'staff'] },
    { name: 'Owners', href: '/owners', icon: Users, roles: ['admin', 'staff'] },
    { name: 'Vets & Farriers', href: '/vets-farriers', icon: Stethoscope, roles: ['admin', 'staff'] },
    { name: 'Whiteboard', href: '/whiteboard', icon: Calendar, roles: ['admin', 'staff'] },
    { name: 'Home Assistant', href: '/home-assistant', icon: Home, roles: ['admin', 'staff'] },
    { name: 'Admin', href: '/admin', icon: UserCog, roles: ['admin'] },
  ];

  const filteredNavigation = navigation.filter(item =>
    user && item.roles.includes(user.role)
  );

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:flex">
        <div
          className={`fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden transition-opacity ${
            sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-green-600" />
                <span className="text-xl font-bold text-gray-800">StableManager</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-green-50 text-green-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t">
              <div className="flex items-center mb-3 px-2">
                <User className="h-5 w-5 text-gray-600 mr-2" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {user?.full_name || user?.email}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-screen">
          <header className="bg-white shadow-sm lg:hidden">
            <div className="px-4 py-3 flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-gray-600 hover:text-gray-900"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-2">
                <Activity className="h-6 w-6 text-green-600" />
                <span className="text-lg font-bold text-gray-800">StableManager</span>
              </div>
              <div className="w-6" />
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-8 max-w-[1920px] w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
