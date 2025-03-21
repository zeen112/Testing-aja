
import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Database, 
  Tags, 
  Upload, 
  Settings, 
  X,
  Truck,
  BarChart,
  AlertTriangle,
  ShoppingCart,
  Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { exportToExcel } = useInventory();

  const menuItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/products', icon: <Database size={20} />, label: 'Products' },
    { to: '/categories', icon: <Tags size={20} />, label: 'Categories' },
    { to: '/suppliers', icon: <Truck size={20} />, label: 'Suppliers' },
    { to: '/stock-alerts', icon: <AlertTriangle size={20} />, label: 'Stock Alerts' },
    { to: '/reports', icon: <BarChart size={20} />, label: 'Reports' },
    { to: '/pos', icon: <ShoppingCart size={20} />, label: 'Point of Sale' },
    { to: '/transactions', icon: <Receipt size={20} />, label: 'Transaction History' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-200"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-sidebar z-50 border-r border-sidebar-border transition-transform duration-300 ease-in-out",
          isOpen ? "transform-none" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
            <h2 className="text-lg font-semibold text-sidebar-foreground">Inventory</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="lg:hidden"
            >
              <X size={20} />
            </Button>
          </div>
          
          <nav className="flex-1 overflow-y-auto py-6 px-3">
            <ul className="space-y-2">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <NavLink 
                    to={item.to} 
                    className={({ isActive }) => cn(
                      "sidebar-item",
                      isActive && "active"
                    )}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
            
            <div className="mt-6 border-t border-sidebar-border pt-6">
              <button 
                className="sidebar-item w-full"
                onClick={() => {
                  exportToExcel();
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
              >
                <Upload size={20} />
                <span>Export to Excel</span>
              </button>
            </div>
          </nav>
          
          <div className="p-4 border-t border-sidebar-border">
            <div className="text-xs text-sidebar-foreground/60">
              Database stored locally
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
