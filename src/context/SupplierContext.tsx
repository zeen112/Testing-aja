
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Supplier } from '../utils/database';
import { toast } from 'sonner';
import { 
  getSuppliersFromSupabase, 
  addSupplierToSupabase, 
  updateSupplierInSupabase, 
  deleteSupplierFromSupabase 
} from '../utils/supabaseUtils';
import { useOnlineStatus } from './BaseContext';
import { supabase } from '@/integrations/supabase/client';

interface SupplierContextType {
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSupplier: (supplier: Partial<Supplier> & { id: string }) => void;
  deleteSupplier: (id: string) => void;
  importSuppliersFromExcel: (file: File) => Promise<void>;
  exportSuppliersToExcel: () => void;
  loading: boolean;
}

const SupplierContext = createContext<SupplierContextType | undefined>(undefined);

export const SupplierProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOnline } = useOnlineStatus();

  // Initialize suppliers from Supabase
  useEffect(() => {
    const initSuppliers = async () => {
      try {
        setLoading(true);
        const supabaseSuppliers = await getSuppliersFromSupabase();
        setSuppliers(supabaseSuppliers);
      } catch (error) {
        console.error('Failed to initialize suppliers:', error);
        toast.error('Failed to initialize suppliers');
      } finally {
        setLoading(false);
      }
    };
    
    initSuppliers();
  }, []);

  // Set up realtime subscriptions for suppliers when online
  useEffect(() => {
    if (!isOnline) return;
    
    const channel = supabase
      .channel('suppliers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'suppliers'
        },
        async (payload) => {
          console.log('Realtime update for suppliers:', payload);
          const supabaseSuppliers = await getSuppliersFromSupabase();
          setSuppliers(supabaseSuppliers);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOnline]);

  const addSupplier = async (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newSupplier = await addSupplierToSupabase(supplier);
      if (newSupplier) {
        toast.success('Supplier added successfully');
        // We don't need to update the state as it will be updated by the subscription
      }
    } catch (error) {
      console.error('Failed to add supplier:', error);
      toast.error('Failed to add supplier');
    }
  };

  const updateSupplier = async (updatedSupplier: Partial<Supplier> & { id: string }) => {
    try {
      const supplier = await updateSupplierInSupabase(updatedSupplier);
      if (supplier) {
        toast.success('Supplier updated successfully');
      }
    } catch (error) {
      console.error('Failed to update supplier:', error);
      toast.error('Failed to update supplier');
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      const success = await deleteSupplierFromSupabase(id);
      if (success) {
        toast.success('Supplier deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete supplier:', error);
      toast.error('Failed to delete supplier');
    }
  };

  const importSuppliersFromExcel = async (file: File): Promise<void> => {
    try {
      // For now, we'll just show a message
      toast.error('Excel import not yet supported with Supabase integration');
    } catch (error) {
      console.error('Failed to import suppliers:', error);
      toast.error('Failed to import suppliers from Excel');
    }
  };

  const exportSuppliersToExcel = () => {
    try {
      // For now, we'll just show a message
      toast.error('Excel export not yet supported with Supabase integration');
    } catch (error) {
      console.error('Failed to export suppliers to Excel:', error);
      toast.error('Failed to export suppliers to Excel');
    }
  };

  return (
    <SupplierContext.Provider value={{
      suppliers,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      importSuppliersFromExcel,
      exportSuppliersToExcel,
      loading
    }}>
      {children}
    </SupplierContext.Provider>
  );
};

export const useSuppliers = () => {
  const context = useContext(SupplierContext);
  if (context === undefined) {
    throw new Error('useSuppliers must be used within a SupplierProvider');
  }
  return context;
};
