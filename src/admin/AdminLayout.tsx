import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Church, Loader2 } from 'lucide-react';
import { verifyAuth, clearToken, isLoggedIn } from './api';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/admin', { replace: true });
      return;
    }
    verifyAuth()
      .then(setUser)
      .catch(() => {
        clearToken();
        navigate('/admin', { replace: true });
      })
      .finally(() => setChecking(false));
  }, [navigate]);

  const handleLogout = () => {
    clearToken();
    navigate('/admin');
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Content' },
    ...(user?.role === 'owner' ? [{ to: '/admin/users', icon: Users, label: 'Users' }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Church size={24} className="text-accent" />
            <span className="font-serif font-bold text-lg">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors no-underline ${
                      isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  <item.icon size={16} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center gap-3 border-l border-white/20 pl-4">
              <span className="text-sm text-white/70">{user?.username}</span>
              <button
                onClick={handleLogout}
                className="text-white/70 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-1"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-6">
          Admin / {location.pathname.includes('users') ? 'Users' : 'Content Editor'}
        </div>
        <Outlet />
      </main>
    </div>
  );
}
