
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGym } from '../context/GymContext';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Dumbbell, 
  ClipboardList, 
  Package, 
  Menu, 
  X,
  FileText,
  Activity,
  Ruler,
  LogOut,
  ShieldCheck
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { logout, currentUser } = useGym();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { label: 'Clientes', path: '/clients', icon: <Users size={20} /> },
    { label: 'Medidas', path: '/measurements', icon: <Ruler size={20} /> },
    { label: 'Pagos', path: '/payments', icon: <CreditCard size={20} /> },
    { label: 'Personal', path: '/staff', icon: <ClipboardList size={20} /> },
    { label: 'Inventario', path: '/inventory', icon: <Package size={20} /> },
    { label: 'Documentación Técnica', path: '/docs', icon: <FileText size={20} /> },
  ];

  // Add Admin only items
  if (currentUser?.role === 'admin') {
      navItems.push({ label: 'Usuarios', path: '/users', icon: <ShieldCheck size={20} /> });
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Activity className="text-emerald-500" />
            <span>GymFlow<span className="text-emerald-500">Pro</span></span>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 bg-slate-950 border-t border-slate-800">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                <img 
                  src={currentUser?.avatarUrl || "https://picsum.photos/seed/admin/40/40"} 
                  alt="User" 
                  className="w-10 h-10 rounded-full border-2 border-slate-700"
                />
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-white truncate w-24">{currentUser?.fullName || 'Usuario'}</p>
                  <p className="text-xs text-slate-500 capitalize">{currentUser?.role || 'Invitado'}</p>
                </div>
            </div>
            <button 
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                title="Cerrar Sesión"
            >
                <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8">
          <button onClick={toggleSidebar} className="p-2 text-slate-500 lg:hidden hover:bg-slate-100 rounded-md">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-sm text-right hidden sm:block">
              <p className="text-slate-900 font-medium">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;