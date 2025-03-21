
import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const SearchBar: React.FC = () => {
  const { searchQuery, setSearchQuery } = useInventory();

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10 w-full bg-background border-input"
      />
    </div>
  );
};

export default SearchBar;
