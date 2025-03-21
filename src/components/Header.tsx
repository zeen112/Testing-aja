
import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { Sun, Moon, Laptop, Menu, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchBar from './SearchBar';
import { Link } from 'react-router-dom';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { darkMode, themeMode, toggleDarkMode } = useInventory();

  const getThemeIcon = () => {
    if (themeMode === 'system') {
      return <Laptop className="h-5 w-5" />;
    }
    return darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />;
  };

  return (
    <header className="h-16 w-full flex items-center justify-between px-4 border-b border-border bg-background/80 backdrop-blur-sm z-10">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2 lg:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-display font-medium">Inventory System</h1>
      </div>

      <div className="flex-1 mx-4 max-w-xl hidden md:block">
        <SearchBar />
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant="outline"
          size="sm"
          asChild
          className="gap-1 hidden sm:flex"
        >
          <Link to="/pos">
            <ShoppingCart className="h-4 w-4" />
            <span>POS</span>
          </Link>
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleDarkMode}
          className="transition-transform hover:scale-110 duration-300"
          title={themeMode === 'system' ? 'Using system preference' : (darkMode ? 'Switch to light mode' : 'Switch to dark mode')}
        >
          {getThemeIcon()}
        </Button>
      </div>
    </header>
  );
};

export default Header;
