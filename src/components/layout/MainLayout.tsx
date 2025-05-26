
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Calendar, List, FileText, Menu, X } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/', icon: <List className="h-5 w-5" />, label: 'Inventory' },
    { to: '/register', icon: <Calendar className="h-5 w-5" />, label: 'Register' },
    { to: '/reports', icon: <FileText className="h-5 w-5" />, label: 'Reports' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-bloodred rounded-full flex items-center justify-center mr-2">
              <span className="text-white font-bold text-sm">B+</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Blood Center Manager</h1>
          </div>
          
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden flex items-center text-gray-700 dark:text-gray-300"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar for desktop */}
        <aside className="hidden lg:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                  isActive 
                    ? "bg-bloodred text-white" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Mobile menu (overlay) */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-gray-800/50 z-40" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="w-64 bg-white dark:bg-gray-800 h-full" onClick={e => e.stopPropagation()}>
              <nav className="p-4 space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                      isActive 
                        ? "bg-bloodred text-white" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
