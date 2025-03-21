
import { supabase } from '@/integrations/supabase/client';
import { Product, Category, Supplier, Transaction, TransactionItem } from './database';
import { toast } from 'sonner';

// Define types that match Supabase database structure
type SupabaseProduct = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  categoryid: number | null;
  sku: string;
  racklocation: string | null;
  createdat: string;
  updatedat: string;
}

// Function to get categories from Supabase
export const getCategoriesFromSupabase = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*');
    
    if (error) {
      console.error('Error getting categories from Supabase:', error);
      toast.error('Error getting categories from Supabase');
      return [];
    }
    
    // Convert Supabase data to our Category type
    const categories: Category[] = data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      createdAt: item.createdat,
      updatedAt: item.updatedat
    }));
    
    return categories;
  } catch (error) {
    console.error('Error getting categories from Supabase:', error);
    toast.error('Error getting categories from Supabase');
    return [];
  }
};

// Function to add a category to Supabase
export const addCategoryToSupabase = async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category | null> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: category.name,
        description: category.description || null
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding category to Supabase:', error);
      toast.error('Error adding category to Supabase');
      return null;
    }
    
    const newCategory: Category = {
      id: data.id,
      name: data.name,
      description: data.description || '',
      createdAt: data.createdat,
      updatedAt: data.updatedat
    };
    
    return newCategory;
  } catch (error) {
    console.error('Error adding category to Supabase:', error);
    toast.error('Error adding category to Supabase');
    return null;
  }
};

// Function to update a category in Supabase
export const updateCategoryInSupabase = async (category: Partial<Category> & { id: string }): Promise<Category | null> => {
  try {
    const updateData = {
      name: category.name,
      description: category.description || null,
      updatedat: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', category.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating category in Supabase:', error);
      toast.error('Error updating category in Supabase');
      return null;
    }
    
    const updatedCategory: Category = {
      id: data.id,
      name: data.name,
      description: data.description || '',
      createdAt: data.createdat,
      updatedAt: data.updatedat
    };
    
    return updatedCategory;
  } catch (error) {
    console.error('Error updating category in Supabase:', error);
    toast.error('Error updating category in Supabase');
    return null;
  }
};

// Function to delete a category from Supabase
export const deleteCategoryFromSupabase = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting category from Supabase:', error);
      toast.error('Error deleting category from Supabase');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting category from Supabase:', error);
    toast.error('Error deleting category from Supabase');
    return false;
  }
};

// Function to get products from Supabase
export const getProductsFromSupabase = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) {
      console.error('Error getting products from Supabase:', error);
      toast.error('Error getting products from Supabase');
      return [];
    }
    
    // Convert Supabase data to our Product type
    const products: Product[] = data.map(item => ({
      id: item.id.toString(), // Convert number id to string
      name: item.name,
      description: item.description || '',
      price: Number(item.price),
      stock: Number(item.stock),
      category: item.categoryid ? item.categoryid.toString() : '', // Convert number id to string
      sku: item.sku,
      rackLocation: item.racklocation || '',
      createdAt: item.createdat,
      updatedAt: item.updatedat
    }));
    
    return products;
  } catch (error) {
    console.error('Error getting products from Supabase:', error);
    toast.error('Error getting products from Supabase');
    return [];
  }
};

// Function to add a product to Supabase
export const addProductToSupabase = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product | null> => {
  try {
    // Ensure categoryid is a valid number or null
    const categoryId = product.category ? parseInt(product.category) : null;
    if (categoryId && isNaN(categoryId)) {
      console.error('Invalid category ID, must be a valid number or empty');
      toast.error('Invalid category ID format');
      return null;
    }
    
    const supabaseProduct = {
      name: product.name,
      description: product.description || null,
      price: product.price,
      stock: product.stock,
      categoryid: categoryId,
      sku: product.sku,
      racklocation: product.rackLocation || null
    };

    const { data, error } = await supabase
      .from('products')
      .insert(supabaseProduct)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding product to Supabase:', error);
      toast.error('Error adding product to Supabase');
      return null;
    }
    
    const newProduct: Product = {
      id: data.id.toString(),
      name: data.name,
      description: data.description || '',
      price: Number(data.price),
      stock: Number(data.stock),
      category: data.categoryid ? data.categoryid.toString() : '',
      sku: data.sku,
      rackLocation: data.racklocation || '',
      createdAt: data.createdat,
      updatedAt: data.updatedat
    };
    
    return newProduct;
  } catch (error) {
    console.error('Error adding product to Supabase:', error);
    toast.error('Error adding product to Supabase');
    return null;
  }
};

// Function to update a product in Supabase
export const updateProductInSupabase = async (product: Partial<Product> & { id: string }): Promise<Product | null> => {
  try {
    // Ensure we have a valid numeric ID
    const productId = parseInt(product.id);
    if (isNaN(productId)) {
      console.error('Invalid product ID, must be a valid number');
      toast.error('Invalid product ID format');
      return null;
    }
    
    // Ensure categoryid is a valid number or null
    const categoryId = product.category ? parseInt(product.category) : null;
    if (categoryId && isNaN(categoryId)) {
      console.error('Invalid category ID, must be a valid number or empty');
      toast.error('Invalid category ID format');
      return null;
    }
    
    const supabaseProduct = {
      name: product.name,
      description: product.description || null,
      price: product.price,
      stock: product.stock,
      categoryid: categoryId,
      sku: product.sku,
      racklocation: product.rackLocation || null,
      updatedat: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('products')
      .update(supabaseProduct)
      .eq('id', productId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating product in Supabase:', error);
      toast.error('Error updating product in Supabase');
      return null;
    }
    
    const updatedProduct: Product = {
      id: data.id.toString(),
      name: data.name,
      description: data.description || '',
      price: Number(data.price),
      stock: Number(data.stock),
      category: data.categoryid ? data.categoryid.toString() : '',
      sku: data.sku,
      rackLocation: data.racklocation || '',
      createdAt: data.createdat,
      updatedAt: data.updatedat
    };
    
    return updatedProduct;
  } catch (error) {
    console.error('Error updating product in Supabase:', error);
    toast.error('Error updating product in Supabase');
    return null;
  }
};

// Function to delete a product from Supabase
export const deleteProductFromSupabase = async (id: string): Promise<boolean> => {
  try {
    // Ensure we have a valid numeric ID
    const productId = parseInt(id);
    if (isNaN(productId)) {
      console.error('Invalid product ID, must be a valid number');
      toast.error('Invalid product ID format');
      return false;
    }
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    
    if (error) {
      console.error('Error deleting product from Supabase:', error);
      toast.error('Error deleting product from Supabase');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting product from Supabase:', error);
    toast.error('Error deleting product from Supabase');
    return false;
  }
};

// Function to get suppliers from Supabase
export const getSuppliersFromSupabase = async (): Promise<Supplier[]> => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*');
    
    if (error) {
      console.error('Error getting suppliers from Supabase:', error);
      toast.error('Error getting suppliers from Supabase');
      return [];
    }
    
    // Convert Supabase data to our Supplier type
    const suppliers: Supplier[] = data.map(item => ({
      id: item.id,
      name: item.name,
      email: item.email || '',
      phone: item.phone || '',
      address: item.address || '',
      createdAt: item.createdat,
      updatedAt: item.updatedat
    }));
    
    return suppliers;
  } catch (error) {
    console.error('Error getting suppliers from Supabase:', error);
    toast.error('Error getting suppliers from Supabase');
    return [];
  }
};

// Function to add a supplier to Supabase
export const addSupplierToSupabase = async (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier | null> => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .insert({
        name: supplier.name,
        email: supplier.email || null,
        phone: supplier.phone || null,
        address: supplier.address || null
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding supplier to Supabase:', error);
      toast.error('Error adding supplier to Supabase');
      return null;
    }
    
    const newSupplier: Supplier = {
      id: data.id,
      name: data.name,
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      createdAt: data.createdat,
      updatedAt: data.updatedat
    };
    
    return newSupplier;
  } catch (error) {
    console.error('Error adding supplier to Supabase:', error);
    toast.error('Error adding supplier to Supabase');
    return null;
  }
};

// Function to update a supplier in Supabase
export const updateSupplierInSupabase = async (supplier: Partial<Supplier> & { id: string }): Promise<Supplier | null> => {
  try {
    const updateData = {
      name: supplier.name,
      email: supplier.email || null,
      phone: supplier.phone || null,
      address: supplier.address || null,
      updatedat: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('suppliers')
      .update(updateData)
      .eq('id', supplier.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating supplier in Supabase:', error);
      toast.error('Error updating supplier in Supabase');
      return null;
    }
    
    const updatedSupplier: Supplier = {
      id: data.id,
      name: data.name,
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      createdAt: data.createdat,
      updatedAt: data.updatedat
    };
    
    return updatedSupplier;
  } catch (error) {
    console.error('Error updating supplier in Supabase:', error);
    toast.error('Error updating supplier in Supabase');
    return null;
  }
};

// Function to delete a supplier from Supabase
export const deleteSupplierFromSupabase = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting supplier from Supabase:', error);
      toast.error('Error deleting supplier from Supabase');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting supplier from Supabase:', error);
    toast.error('Error deleting supplier from Supabase');
    return false;
  }
};

// Function to get transactions from Supabase
export const getTransactionsFromSupabase = async (): Promise<Transaction[]> => {
  try {
    // Get all transactions first
    const { data: transactionData, error: transactionError } = await supabase
      .from('transactions')
      .select('*');
    
    if (transactionError) {
      console.error('Error getting transactions from Supabase:', transactionError);
      toast.error('Error getting transactions from Supabase');
      return [];
    }
    
    // Get all transaction items
    const { data: itemsData, error: itemsError } = await supabase
      .from('transaction_items')
      .select('*');
    
    if (itemsError) {
      console.error('Error getting transaction items from Supabase:', itemsError);
      toast.error('Error getting transaction items from Supabase');
      return [];
    }
    
    // Convert Supabase data to our Transaction type
    const transactions: Transaction[] = transactionData.map(transaction => {
      // Find all items for this transaction
      const items: TransactionItem[] = itemsData
        .filter(item => item.transaction_id === transaction.id)
        .map(item => ({
          productId: item.product_id,
          productName: item.product_name,
          quantity: item.quantity,
          unitPrice: Number(item.unit_price),
          subtotal: Number(item.subtotal)
        }));
      
      return {
        id: transaction.id,
        receiptNumber: transaction.receiptnumber,
        items: items,
        subtotal: Number(transaction.subtotal),
        tax: Number(transaction.tax || 0),
        total: Number(transaction.total),
        paymentMethod: transaction.paymentmethod,
        cashReceived: Number(transaction.cashreceived || 0),
        change: Number(transaction.change || 0),
        createdAt: transaction.createdat
      };
    });
    
    return transactions;
  } catch (error) {
    console.error('Error getting transactions from Supabase:', error);
    toast.error('Error getting transactions from Supabase');
    return [];
  }
};

// Function to add a transaction to Supabase
export const addTransactionToSupabase = async (transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction | null> => {
  try {
    // First, insert the transaction
    const { data: transactionData, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        receiptnumber: transaction.receiptNumber,
        subtotal: transaction.subtotal,
        tax: transaction.tax || 0,
        total: transaction.total,
        paymentmethod: transaction.paymentMethod,
        cashreceived: transaction.paymentMethod === 'cash' ? transaction.cashReceived : null,
        change: transaction.paymentMethod === 'cash' ? transaction.change : null
      })
      .select()
      .single();
    
    if (transactionError) {
      console.error('Error adding transaction to Supabase:', transactionError);
      toast.error('Error adding transaction to Supabase');
      return null;
    }
    
    // Then, insert all transaction items
    const transactionItems = transaction.items.map(item => ({
      transaction_id: transactionData.id,
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      subtotal: item.subtotal
    }));
    
    const { error: itemsError } = await supabase
      .from('transaction_items')
      .insert(transactionItems);
    
    if (itemsError) {
      console.error('Error adding transaction items to Supabase:', itemsError);
      toast.error('Error adding transaction items to Supabase');
      // Should we delete the transaction here since items failed?
      return null;
    }
    
    // Construct the complete transaction object to return
    const newTransaction: Transaction = {
      id: transactionData.id,
      receiptNumber: transactionData.receiptnumber,
      items: transaction.items,
      subtotal: Number(transactionData.subtotal),
      tax: Number(transactionData.tax || 0),
      total: Number(transactionData.total),
      paymentMethod: transactionData.paymentmethod,
      cashReceived: Number(transactionData.cashreceived || 0),
      change: Number(transactionData.change || 0),
      createdAt: transactionData.createdat
    };
    
    return newTransaction;
  } catch (error) {
    console.error('Error adding transaction to Supabase:', error);
    toast.error('Error adding transaction to Supabase');
    return null;
  }
};
