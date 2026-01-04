import { Link, useLocation } from 'react-router-dom';
import { Users, Warehouse } from 'lucide-react';
import { House as HousePlus } from './HouseIcon';
import { HorseHead } from './HorseHeadIcon';

export function QuickNav() {
  const location = useLocation();

  const tabs = [
    { name: 'Horses', href: '/horses', icon: HorseHead },
    { name: 'Stalls', href: '/stalls', icon: Warehouse },
    { name: 'Owners', href: '/owners', icon: Users },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              to={tab.href}
              className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                ${
                  isActive(tab.href)
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <Icon
                className={`
                  -ml-0.5 mr-2 h-5 w-5
                  ${isActive(tab.href) ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                `}
              />
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
