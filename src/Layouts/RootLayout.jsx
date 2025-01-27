import React,{ useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sigma, Home, BookOpen, BarChart as ChartBar, Brain, Menu, X, ChartScatter, MoreVertical, AlignHorizontalSpaceAround } from 'lucide-react';
import { NavLink } from 'react-router-dom';

function RootLayout() {
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: ChartScatter, label: 'Regresstion', path: '/regression' },
    { icon: AlignHorizontalSpaceAround, label: 'Dirstibutions', path: '/distributions' },
    { icon: MoreVertical, label: 'More', path: '/more' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav 
        className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-[width] duration-300 ease-in-out z-50
          ${isNavExpanded ? 'w-64' : 'w-20'} 
          hover:w-64`}
        onMouseEnter={() => setIsNavExpanded(true)}
        onMouseLeave={() => setIsNavExpanded(false)}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8 relative h-8">
            <div className={`flex items-center space-x-3 absolute left-0 transition-opacity duration-300 ease-in-out ${isNavExpanded ? 'opacity-100' : 'opacity-0'}`}>
              <Sigma size={32} className="text-indigo-600 min-w-8" />
              <span className="font-bold text-xl text-gray-800 whitespace-nowrap">
                Art of Stats
              </span>
            </div>
            <div className={`transition-opacity duration-300 ease-in-out ${isNavExpanded ? 'opacity-0' : 'opacity-100'}`}>
              <Sigma size={32} className="text-indigo-600" />
            </div>
          </div>

          <div className="space-y-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={index}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center space-x-3 p-3 rounded-lg hover:bg-indigo-50 
                    transition-colors duration-200 group/item
                    ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:text-indigo-600'}
                  `}
                >
                  <Icon size={24} className="min-w-6" />
                  <span className={`whitespace-nowrap transition-opacity duration-300 ease-in-out ${isNavExpanded ? 'opacity-100' : 'opacity-0'}`}>
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="lg:hidden">
        <button
          onClick={() => setIsNavExpanded(!isNavExpanded)}
          className="fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-lg"
        >
          {isNavExpanded ? <X size={24} /> : <Menu size={24} />}
        </button>

        {isNavExpanded && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsNavExpanded(false)}
          />
        )}

        <nav className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-transform duration-300 ease-in-out z-50 
          ${isNavExpanded ? 'translate-x-0 w-64' : '-translate-x-full w-64'}`}
        >
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-8">
              <Sigma size={32} className="text-indigo-600" />
              <span className="font-bold text-xl text-gray-800">Art of Stats</span>
            </div>

            <div className="space-y-2">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={index}
                    to={item.path}
                    className={({ isActive }) => `
                      flex items-center space-x-3 p-3 rounded-lg hover:bg-indigo-50 
                      transition-colors duration-200
                      ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:text-indigo-600'}
                    `}
                    onClick={() => setIsNavExpanded(false)}
                  >
                    <Icon size={24} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </nav>
      </div>

      <div className={`transition-[margin] duration-300 ease-in-out ${isNavExpanded ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <Outlet />
      </div>
    </div>
  );
}

export default RootLayout;