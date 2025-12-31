import { Page } from '../App';
import { Home, Info, Briefcase, Mail } from 'lucide-react';

interface NavigationProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

export function Navigation({ currentPage, setCurrentPage }: NavigationProps) {
  const navItems = [
    { id: 'home' as Page, label: 'Home', icon: Home },
    { id: 'about' as Page, label: 'About', icon: Info },
    { id: 'services' as Page, label: 'Services', icon: Briefcase },
    { id: 'contact' as Page, label: 'Contact', icon: Mail },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Home className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold text-gray-900">Stable Horse Management</span>
          </div>

          <div className="hidden md:flex space-x-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentPage(id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition ${
                  currentPage === id
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="md:hidden flex space-x-2">
            {navItems.map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentPage(id)}
                className={`p-2 rounded-md transition ${
                  currentPage === id
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
