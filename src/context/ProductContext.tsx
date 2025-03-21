
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category } from '../utils/database';
import { toast } from 'sonner';
import { useOnlineStatus } from './BaseContext';
import { 
  getProductsFromSupabase, 
  addProductToSupabase, 
  updateProductInSupabase, 
  deleteProductFromSupabase 
} from '../utils/supabaseUtils';
import { supabase } from '@/integrations/supabase/client';

interface ProductContextType {
  products: Product[];
  searchResults: Product[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'sku'>) => void;
  updateProduct: (product: Partial<Product> & { id: string }) => void;
  deleteProduct: (id: string) => void;
  importProductsFromExcel: (file: File) => Promise<void>;
  syncToCloud: () => Promise<void>;
  isOnline: boolean;
  loading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode; categories: Category[] }> = ({ children, categories }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { isOnline } = useOnlineStatus();

  // Initialize products from Supabase
  useEffect(() => {
    const initProducts = async () => {
      try {
        setLoading(true);
        
        if (isOnline) {
          try {
            const supabaseProducts = await getProductsFromSupabase();
            setProducts(supabaseProducts);
            setSearchResults(supabaseProducts);
            toast.success('Products loaded from cloud database');
          } catch (error) {
            console.error('Failed to fetch from Supabase:', error);
            toast.error('Failed to load from cloud database');
          }
        }
      } catch (error) {
        console.error('Failed to initialize products:', error);
        toast.error('Failed to initialize products');
      } finally {
        setLoading(false);
      }
    };
    
    initProducts();
  }, [isOnline]);

  // Set up realtime subscriptions for products when online
  useEffect(() => {
    if (!isOnline) return;
    
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        async (payload) => {
          console.log('Realtime update for products:', payload);
          const supabaseProducts = await getProductsFromSupabase();
          setProducts(supabaseProducts);
          
          if (!searchQuery.trim()) {
            setSearchResults(supabaseProducts);
          } else {
            const results = searchProducts(searchQuery, supabaseProducts);
            setSearchResults(results);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOnline, searchQuery]);

  // Update search results when products or search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults(products);
    } else {
      const results = searchProducts(searchQuery, products);
      setSearchResults(results);
    }
  }, [products, searchQuery]);

  // Function to search products
  const searchProducts = (query: string, productsToSearch: Product[]): Product[] => {
    if (!query) {
      return productsToSearch;
    }
    
    const lowerCaseQuery = query.toLowerCase();
    
    return productsToSearch.filter(product => 
      product.name.toLowerCase().includes(lowerCaseQuery) ||
      product.description.toLowerCase().includes(lowerCaseQuery)
    );
  };

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'sku'>) => {
    try {
      // Generate SKU
      const categoryObj = categories.find(c => c.id === product.category);
      const categoryPrefix = categoryObj ? 
        categoryObj.name.substring(0, 3).toUpperCase() : 'PRD';
      const productPrefix = product.name.substring(0, 3).toUpperCase();
      const productCount = products.filter(p => p.category === product.category).length + 1;
      const sku = `${categoryPrefix}-${productPrefix}-${productCount.toString().padStart(3, '0')}`;
      
      const productWithSku = {
        ...product,
        sku
      };
      
      const newProduct = await addProductToSupabase(productWithSku);
      
      if (newProduct) {
        toast.success('Product added successfully');
      }
    } catch (error) {
      console.error('Failed to add product:', error);
      toast.error('Failed to add product');
    }
  };

  const updateProduct = async (updatedProduct: Partial<Product> & { id: string }) => {
    try {
      const product = await updateProductInSupabase(updatedProduct);
      if (product) {
        toast.success('Product updated successfully');
      }
    } catch (error) {
      console.error('Failed to update product:', error);
      toast.error('Failed to update product');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const success = await deleteProductFromSupabase(id);
      if (success) {
        toast.success('Product deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product');
    }
  };

  const importProductsFromExcel = async (file: File): Promise<void> => {
    try {
      // For now, we'll just show a message
      toast.error('Excel import not yet supported with Supabase integration');
    } catch (error) {
      console.error('Failed to import products:', error);
      toast.error('Failed to import products from Excel');
    }
  };

  const syncToCloud = async (): Promise<void> => {
    if (!isOnline) {
      toast.error('You are offline. Please connect to the internet to sync.');
      return;
    }
    
    try {
      toast.loading('Syncing with cloud database...');
      const supabaseProducts = await getProductsFromSupabase();
      setProducts(supabaseProducts);
      setSearchResults(supabaseProducts);
      toast.dismiss();
      toast.success('Products successfully synced with cloud database');
    } catch (error) {
      toast.dismiss();
      console.error('Failed to sync with Supabase:', error);
      toast.error('Failed to sync with cloud database');
    }
  };

  return (
    <ProductContext.Provider value={{
      products,
      searchResults,
      searchQuery,
      setSearchQuery,
      addProduct,
      updateProduct,
      deleteProduct,
      importProductsFromExcel,
      syncToCloud,
      isOnline,
      loading
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
