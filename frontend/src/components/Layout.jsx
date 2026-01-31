import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  GitBranch, 
  LogOut, 
  User,
  Brain
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary-600" />
              <span className="font-bold text-xl text-gray-900">
                Codebase Memory Explorer
              </span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-6">
              <Link 
                to="/dashboard" 
                className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>

              {/* User Menu */}
              <div className="flex items-center gap-4 border-l pl-6">
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="h-5 w-5" />
                  <span className="font-medium">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-500 text-sm">
            Codebase Memory Explorer - Turn Git repositories into self-explainable systems
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
