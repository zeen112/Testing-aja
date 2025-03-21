
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, Supplier, Transaction, exportToExcel as dbExportToExcel, initializeDatabase } from '../utils/database';
import { toast } from 'sonner';
import { ProductProvider, useProducts } from './ProductContext';
import { CategoryProvider, useCategories } from './CategoryContext';
import { SupplierProvider, useSuppliers } from './SupplierContext';
import { TransactionProvider, useTransactions } from './TransactionContext';
import { useThemeManagement, useOnlineStatus } from './BaseContext';

interface InventoryContextType {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  transactions: Transaction[];
  searchResults: Product[];
  loading: boolean;
  darkMode: boolean;
  themeMode: 'dark' | 'light' | 'system';
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'sku'>) => void;
  updateProduct: (product: Partial<Product> & { id: string }) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCategory: (category: Partial<Category> & { id: string }) => void;
  deleteCategory: (id: string) => void;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSupplier: (supplier: Partial<Supplier> & { id: string }) => void;
  deleteSupplier: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<Transaction | null>;
  exportToExcel: () => void;
  importProductsFromExcel: (file: File) => Promise<void>;
  importCategoriesFromExcel: (file: File) => Promise<void>;
  exportTransactionsToExcel: () => void;
  exportSuppliersToExcel: () => void;
  importTransactionsFromExcel: (file: File) => Promise<void>;
  importSuppliersFromExcel: (file: File) => Promise<void>;
  toggleDarkMode: () => void;
  setThemeMode: (mode: 'dark' | 'light' | 'system') => void;
  syncToCloud: () => Promise<void>;
  isOnline: boolean;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

interface InventoryProviderProps {
  children: React.ReactNode;
}

const CombinedProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [updatedProducts, setUpdatedProducts] = useState<Product[]>([]);
  
  return (
    <SupplierProvider>
      <TransactionProvider>
        <ProductProvider categories={[]}>
          <ProductConsumer>
            {(productState) => (
              <CategoryProvider 
                products={productState.products} 
                updateProductsList={setUpdatedProducts}
              >
                {children}
              </CategoryProvider>
            )}
          </ProductConsumer>
        </ProductProvider>
      </TransactionProvider>
    </SupplierProvider>
  );
};

const ProductConsumer = ({ children }: { 
  children: (productState: ReturnType<typeof useProducts>) => React.ReactNode 
}) => {
  const productState = useProducts();
  return <>{children(productState)}</>;
};

export const InventoryProvider: React.FC<InventoryProviderProps> = ({ children }) => {
  const themeManager = useThemeManagement();
  const { isOnline } = useOnlineStatus();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeApp = () => {
      try {
        const storedThemeMode = localStorage.getItem('themeMode') as 'dark' | 'light' | 'system';
        if (storedThemeMode) {
          themeManager.setThemeMode(storedThemeMode);
        }
        
        themeManager.applyTheme(storedThemeMode || 'system');
      } catch (error) {
        console.error('Failed to initialize theme:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeApp();
  }, []);

  const InventoryContextValue: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const productState = useProducts();
    const categoryState = useCategories();
    const supplierState = useSuppliers();
    const transactionState = useTransactions();
    
    const exportToExcel = () => {
      dbExportToExcel();
    };
    
    return (
      <InventoryContext.Provider value={{
        products: productState.products,
        categories: categoryState.categories,
        suppliers: supplierState.suppliers,
        transactions: transactionState.transactions,
        searchResults: productState.searchResults,
        loading: productState.loading || categoryState.loading || supplierState.loading || transactionState.loading,
        darkMode: themeManager.darkMode,
        themeMode: themeManager.themeMode,
        searchQuery: productState.searchQuery,
        setSearchQuery: productState.setSearchQuery,
        addProduct: productState.addProduct,
        updateProduct: productState.updateProduct,
        deleteProduct: productState.deleteProduct,
        addCategory: categoryState.addCategory,
        updateCategory: categoryState.updateCategory,
        deleteCategory: categoryState.deleteCategory,
        addSupplier: supplierState.addSupplier,
        updateSupplier: supplierState.updateSupplier,
        deleteSupplier: supplierState.deleteSupplier,
        addTransaction: transactionState.addTransaction,
        exportToExcel,
        importProductsFromExcel: productState.importProductsFromExcel,
        importCategoriesFromExcel: categoryState.importCategoriesFromExcel,
        exportTransactionsToExcel: transactionState.exportTransactionsToExcel,
        exportSuppliersToExcel: supplierState.exportSuppliersToExcel,
        importTransactionsFromExcel: transactionState.importTransactionsFromExcel,
        importSuppliersFromExcel: supplierState.importSuppliersFromExcel,
        toggleDarkMode: themeManager.toggleDarkMode,
        setThemeMode: themeManager.setThemeMode,
        syncToCloud: productState.syncToCloud,
        isOnline
      }}>
        {children}
      </InventoryContext.Provider>
    );
  };

  return (
    <CombinedProviders>
      <InventoryContextValue>
        {children}
      </InventoryContextValue>
    </CombinedProviders>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
