
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Category, Product } from '../utils/database';
import { toast } from 'sonner';
import { 
  getCategoriesFromSupabase, 
  addCategoryToSupabase, 
  updateCategoryInSupabase, 
  deleteCategoryFromSupabase 
} from '../utils/supabaseUtils';
import { updateProductInSupabase } from '../utils/supabaseUtils';
import { useOnlineStatus } from './BaseContext';
import { supabase } from '@/integrations/supabase/client';

interface CategoryContextType {
  categories: Category[];
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCategory: (category: Partial<Category> & { id: string }) => void;
  deleteCategory: (id: string) => void;
  importCategoriesFromExcel: (file: File) => Promise<void>;
  loading: boolean;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ 
  children: React.ReactNode; 
  products: Product[];
  updateProductsList: (products: Product[]) => void;
}> = ({ 
  children, 
  products, 
  updateProductsList 
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOnline } = useOnlineStatus();

  // Initialize categories from Supabase
  useEffect(() => {
    const initCategories = async () => {
      try {
        setLoading(true);
        const supabaseCategories = await getCategoriesFromSupabase();
        setCategories(supabaseCategories);
      } catch (error) {
        console.error('Failed to initialize categories:', error);
        toast.error('Failed to initialize categories');
      } finally {
        setLoading(false);
      }
    };
    
    initCategories();
  }, []);

  // Set up realtime subscriptions for categories when online
  useEffect(() => {
    if (!isOnline) return;
    
    const channel = supabase
      .channel('categories-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories'
        },
        async (payload) => {
          console.log('Realtime update for categories:', payload);
          const supabaseCategories = await getCategoriesFromSupabase();
          setCategories(supabaseCategories);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOnline]);

  const addCategory = async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newCategory = await addCategoryToSupabase(category);
      if (newCategory) {
        toast.success('Category added successfully');
        // We don't need to update the state as it will be updated by the subscription
      }
    } catch (error) {
      console.error('Failed to add category:', error);
      toast.error('Failed to add category');
    }
  };

  const updateCategory = async (updatedCategory: Partial<Category> & { id: string }) => {
    try {
      const category = await updateCategoryInSupabase(updatedCategory);
      if (category) {
        toast.success('Category updated successfully');
        
        // Update category name in products
        const updatedProducts = products.map(product => {
          if (product.category === category.id) {
            const updatedProduct = {
              ...product,
              updatedAt: new Date().toISOString()
            };
            
            updateProductInSupabase(updatedProduct).catch(err => {
              console.error('Failed to update product category name in Supabase:', err);
            });
            
            return updatedProduct;
          }
          return product;
        });
        
        updateProductsList(updatedProducts);
      }
    } catch (error) {
      console.error('Failed to update category:', error);
      toast.error('Failed to update category');
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const success = await deleteCategoryFromSupabase(id);
      if (success) {
        toast.success('Category deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Failed to delete category');
    }
  };

  const importCategoriesFromExcel = async (file: File): Promise<void> => {
    try {
      // For now, we'll just show a message
      toast.error('Excel import not yet supported with Supabase integration');
    } catch (error) {
      console.error('Failed to import categories:', error);
      toast.error('Failed to import categories from Excel');
    }
  };

  return (
    <CategoryContext.Provider value={{
      categories,
      addCategory,
      updateCategory,
      deleteCategory,
      importCategoriesFromExcel,
      loading
    }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};
