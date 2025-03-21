import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export interface Product {
  id: string;
  sku: string;  // Auto-generated SKU
  name: string;
  description?: string; // Made optional
  price: number;
  stock: number;
  category: string;
  rackLocation: string; // New field for rack location
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  receiptNumber: string;
  items: TransactionItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  cashReceived: number;
  change: number;
  createdAt: string;
}

export interface Database {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  transactions: Transaction[];
}

const DB_KEY = 'inventory_database';

export const initializeDatabase = (): Database => {
  try {
    const existingData = localStorage.getItem(DB_KEY);
    
    if (existingData) {
      const data = JSON.parse(existingData);
      
      // If suppliers is missing, add it
      if (!data.suppliers) {
        data.suppliers = [];
      }
      
      // If transactions is missing, add it
      if (!data.transactions) {
        data.transactions = [];
      }
      
      localStorage.setItem(DB_KEY, JSON.stringify(data));
      return data;
    }
    
    // Create default database
    const defaultDb: Database = {
      products: [],
      categories: [
        {
          id: crypto.randomUUID(),
          name: 'Uncategorized',
          description: 'Default category for products',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      suppliers: [],
      transactions: []
    };
    
    // Save default database to localStorage
    localStorage.setItem(DB_KEY, JSON.stringify(defaultDb));
    console.log('Created new database.json in localStorage');
    
    return defaultDb;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    toast.error('Failed to initialize database');
    
    // Return empty database on error
    return { products: [], categories: [], suppliers: [], transactions: [] };
  }
};

export const saveDatabase = (database: Database): void => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(database));
  } catch (error) {
    console.error('Failed to save database:', error);
    toast.error('Failed to save to database');
  }
};

const generateSKU = (name: string, category: string, db: Database): string => {
  try {
    // Get the corresponding category
    const categoryObj = db.categories.find(c => c.id === category);
    
    // Create SKU components
    const categoryPrefix = categoryObj ? 
      categoryObj.name.substring(0, 3).toUpperCase() : 'PRD';
    
    // Product prefix from name (first 3 chars)
    const productPrefix = name.substring(0, 3).toUpperCase();
    
    // Count existing products in this category + 1 for the new one
    const productCount = db.products.filter(p => p.category === category).length + 1;
    
    // Format as XXX-YYY-001
    return `${categoryPrefix}-${productPrefix}-${productCount.toString().padStart(3, '0')}`;
  } catch (error) {
    console.error('Failed to generate SKU:', error);
    return `PRD-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  }
};

export const addProduct = (product: Omit<Product, 'id' | 'sku' | 'createdAt' | 'updatedAt'>): Product | null => {
  try {
    const db = initializeDatabase();
    
    // Generate SKU
    const sku = generateSKU(product.name, product.category, db);
    
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      sku,
      description: product.description || '', // Add default empty string for optional description
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.products.push(newProduct);
    saveDatabase(db);
    toast.success('Product added successfully');
    
    return newProduct;
  } catch (error) {
    console.error('Failed to add product:', error);
    toast.error('Failed to add product');
    return null;
  }
};

export const updateProduct = (updatedProduct: Partial<Product> & { id: string }): Product | null => {
  try {
    const db = initializeDatabase();
    
    const index = db.products.findIndex(p => p.id === updatedProduct.id);
    
    if (index === -1) {
      toast.error('Product not found');
      return null;
    }
    
    // Don't update SKU when updating a product
    const product = {
      ...db.products[index],
      ...updatedProduct,
      sku: db.products[index].sku, // Keep the original SKU
      updatedAt: new Date().toISOString()
    };
    
    db.products[index] = product;
    saveDatabase(db);
    toast.success('Product updated successfully');
    
    return product;
  } catch (error) {
    console.error('Failed to update product:', error);
    toast.error('Failed to update product');
    return null;
  }
};

export const deleteProduct = (id: string): boolean => {
  try {
    const db = initializeDatabase();
    
    const index = db.products.findIndex(p => p.id === id);
    
    if (index === -1) {
      toast.error('Product not found');
      return false;
    }
    
    db.products.splice(index, 1);
    saveDatabase(db);
    toast.success('Product deleted successfully');
    
    return true;
  } catch (error) {
    console.error('Failed to delete product:', error);
    toast.error('Failed to delete product');
    return false;
  }
};

export const addCategory = (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Category | null => {
  try {
    const db = initializeDatabase();
    
    // Check if category with same name already exists
    const exists = db.categories.some(c => c.name.toLowerCase() === category.name.toLowerCase());
    
    if (exists) {
      toast.error('Category with this name already exists');
      return null;
    }
    
    const newCategory: Category = {
      ...category,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.categories.push(newCategory);
    saveDatabase(db);
    toast.success('Category added successfully');
    
    return newCategory;
  } catch (error) {
    console.error('Failed to add category:', error);
    toast.error('Failed to add category');
    return null;
  }
};

export const updateCategory = (updatedCategory: Partial<Category> & { id: string }): Category | null => {
  try {
    const db = initializeDatabase();
    
    const index = db.categories.findIndex(c => c.id === updatedCategory.id);
    
    if (index === -1) {
      toast.error('Category not found');
      return null;
    }
    
    // Don't allow updating the Uncategorized category (first default one)
    if (index === 0) {
      toast.error('Cannot update the default category');
      return null;
    }
    
    const category = {
      ...db.categories[index],
      ...updatedCategory,
      updatedAt: new Date().toISOString()
    };
    
    db.categories[index] = category;
    saveDatabase(db);
    toast.success('Category updated successfully');
    
    return category;
  } catch (error) {
    console.error('Failed to update category:', error);
    toast.error('Failed to update category');
    return null;
  }
};

export const deleteCategory = (id: string): boolean => {
  try {
    const db = initializeDatabase();
    
    const index = db.categories.findIndex(c => c.id === id);
    
    if (index === -1) {
      toast.error('Category not found');
      return false;
    }
    
    // Don't allow deleting the Uncategorized category (first default one)
    if (index === 0) {
      toast.error('Cannot delete the default category');
      return false;
    }
    
    // Move all products in this category to "Uncategorized"
    db.products.forEach(product => {
      if (product.category === db.categories[index].id) {
        product.category = db.categories[0].id;
        product.updatedAt = new Date().toISOString();
      }
    });
    
    db.categories.splice(index, 1);
    saveDatabase(db);
    toast.success('Category deleted successfully');
    
    return true;
  } catch (error) {
    console.error('Failed to delete category:', error);
    toast.error('Failed to delete category');
    return false;
  }
};

export const searchProducts = (query: string, productsToSearch?: Product[]): Product[] => {
  try {
    const db = initializeDatabase();
    
    // Use provided products or get from database
    const products = productsToSearch || db.products;
    
    if (!query) {
      return products;
    }
    
    const lowerCaseQuery = query.toLowerCase();
    
    return products.filter(product => 
      product.name.toLowerCase().includes(lowerCaseQuery) ||
      product.description.toLowerCase().includes(lowerCaseQuery)
    );
  } catch (error) {
    console.error('Failed to search products:', error);
    toast.error('Failed to search products');
    return [];
  }
};

export const exportToExcel = (): void => {
  try {
    const db = initializeDatabase();
    
    // Create a CSV string for products
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Headers
    csvContent += "ID,Name,Description,Price,Stock,Category,Created At,Updated At\n";
    
    // Rows
    db.products.forEach(product => {
      const category = db.categories.find(c => c.id === product.category);
      const productRow = [
        product.id,
        `"${product.name.replace(/"/g, '""')}"`, // Handle quotes in strings
        `"${product.description.replace(/"/g, '""')}"`,
        product.price,
        product.stock,
        `"${category?.name || 'Unknown'}"`,
        product.createdAt,
        product.updatedAt
      ].join(",");
      
      csvContent += productRow + "\n";
    });
    
    // Create a download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    document.body.removeChild(link);
    
    toast.success('Exported to Excel successfully');
  } catch (error) {
    console.error('Failed to export to Excel:', error);
    toast.error('Failed to export to Excel');
  }
};

export const addTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt'>): Transaction | null => {
  try {
    const db = initializeDatabase();
    
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    
    db.transactions.push(newTransaction);
    saveDatabase(db);
    
    return newTransaction;
  } catch (error) {
    console.error('Failed to add transaction:', error);
    toast.error('Failed to add transaction');
    return null;
  }
};

export const getAllTransactions = (): Transaction[] => {
  try {
    const db = initializeDatabase();
    return db.transactions;
  } catch (error) {
    console.error('Failed to get transactions:', error);
    toast.error('Failed to get transactions');
    return [];
  }
};

export const addSupplier = (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Supplier | null => {
  try {
    const db = initializeDatabase();
    
    const newSupplier: Supplier = {
      ...supplier,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.suppliers.push(newSupplier);
    saveDatabase(db);
    toast.success('Supplier added successfully');
    
    return newSupplier;
  } catch (error) {
    console.error('Failed to add supplier:', error);
    toast.error('Failed to add supplier');
    return null;
  }
};

export const updateSupplier = (updatedSupplier: Partial<Supplier> & { id: string }): Supplier | null => {
  try {
    const db = initializeDatabase();
    
    const index = db.suppliers.findIndex(s => s.id === updatedSupplier.id);
    
    if (index === -1) {
      toast.error('Supplier not found');
      return null;
    }
    
    const supplier = {
      ...db.suppliers[index],
      ...updatedSupplier,
      updatedAt: new Date().toISOString()
    };
    
    db.suppliers[index] = supplier;
    saveDatabase(db);
    toast.success('Supplier updated successfully');
    
    return supplier;
  } catch (error) {
    console.error('Failed to update supplier:', error);
    toast.error('Failed to update supplier');
    return null;
  }
};

export const deleteSupplier = (id: string): boolean => {
  try {
    const db = initializeDatabase();
    
    const index = db.suppliers.findIndex(s => s.id === id);
    
    if (index === -1) {
      toast.error('Supplier not found');
      return false;
    }
    
    db.suppliers.splice(index, 1);
    saveDatabase(db);
    toast.success('Supplier deleted successfully');
    
    return true;
  } catch (error) {
    console.error('Failed to delete supplier:', error);
    toast.error('Failed to delete supplier');
    return false;
  }
};

export const importProductsFromExcel = async (file: File): Promise<{ products: Product[], count: number } | null> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          if (!jsonData || jsonData.length === 0) {
            toast.error('No data found in the Excel file');
            reject(new Error('No data found in the Excel file'));
            return;
          }
          
          const db = initializeDatabase();
          const importedProducts: Product[] = [];
          let count = 0;
          
          // Process each row
          jsonData.forEach((row: any) => {
            // Map Excel columns to our product fields with flexibility
            // This allows for different column names in Excel
            const productData = normalizeProductData(row);
            
            // Only proceed if we have at least a name
            if (!productData.name) {
              return; // Skip invalid rows
            }
            
            // Find category by name if provided
            let categoryId = db.categories[0].id; // Default to uncategorized
            if (productData.categoryName) {
              const category = db.categories.find(c => 
                c.name.toLowerCase() === productData.categoryName.toLowerCase()
              );
              if (category) {
                categoryId = category.id;
              } else {
                // If category doesn't exist, create it
                const newCategory = addCategory({
                  name: productData.categoryName,
                  description: `Auto-created from Excel import`
                });
                if (newCategory) {
                  categoryId = newCategory.id;
                  db.categories.push(newCategory);
                }
              }
            }
            
            // Create new product
            const newProduct: Product = {
              id: crypto.randomUUID(),
              sku: generateSKU(productData.name, categoryId, db),
              name: productData.name,
              description: productData.description || '',
              price: productData.price,
              stock: productData.stock,
              category: categoryId,
              rackLocation: productData.rackLocation || 'A1', // Default if not provided
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            importedProducts.push(newProduct);
            count++;
          });
          
          if (count === 0) {
            toast.error('No valid products found in the Excel file');
            reject(new Error('No valid products found in the Excel file'));
            return;
          }
          
          // Add imported products to database
          db.products = [...db.products, ...importedProducts];
          saveDatabase(db);
          
          resolve({ products: db.products, count });
        } catch (error) {
          console.error('Error parsing Excel file:', error);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Failed to import products from Excel:', error);
      reject(error);
    }
  });
};

// Helper function to normalize product data from Excel with different column names
const normalizeProductData = (row: any) => {
  // Default values
  const normalizedData: {
    name: string,
    description: string,
    price: number,
    stock: number,
    categoryName?: string,
    rackLocation: string
  } = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    rackLocation: 'A1'
  };
  
  // Map various possible column names to our fields
  const columnMap: Record<string, (value: any) => void> = {
    // Name variations
    'name': (val) => { normalizedData.name = String(val) },
    'product': (val) => { normalizedData.name = String(val) },
    'product name': (val) => { normalizedData.name = String(val) },
    'nama': (val) => { normalizedData.name = String(val) },
    'nama produk': (val) => { normalizedData.name = String(val) },
    
    // Description variations
    'description': (val) => { normalizedData.description = String(val) },
    'desc': (val) => { normalizedData.description = String(val) },
    'deskripsi': (val) => { normalizedData.description = String(val) },
    
    // Price variations
    'price': (val) => { normalizedData.price = Number(val) || 0 },
    'harga': (val) => { normalizedData.price = Number(val) || 0 },
    
    // Stock variations
    'stock': (val) => { normalizedData.stock = Number(val) || 0 },
    'inventory': (val) => { normalizedData.stock = Number(val) || 0 },
    'quantity': (val) => { normalizedData.stock = Number(val) || 0 },
    'qty': (val) => { normalizedData.stock = Number(val) || 0 },
    'stok': (val) => { normalizedData.stock = Number(val) || 0 },
    
    // Category variations
    'category': (val) => { normalizedData.categoryName = String(val) },
    'kategori': (val) => { normalizedData.categoryName = String(val) },
    
    // Location variations
    'racklocation': (val) => { normalizedData.rackLocation = String(val) },
    'rack': (val) => { normalizedData.rackLocation = String(val) },
    'location': (val) => { normalizedData.rackLocation = String(val) },
    'lokasi': (val) => { normalizedData.rackLocation = String(val) },
    'lokasi rak': (val) => { normalizedData.rackLocation = String(val) },
  };
  
  // Apply each key in the row to our normalized data
  Object.keys(row).forEach(key => {
    const lowerKey = key.toLowerCase();
    if (columnMap[lowerKey]) {
      columnMap[lowerKey](row[key]);
    }
  });
  
  return normalizedData;
};

export const importCategoriesFromExcel = async (file: File): Promise<{ categories: Category[], count: number } | null> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          if (!jsonData || jsonData.length === 0) {
            toast.error('No data found in the Excel file');
            reject(new Error('No data found in the Excel file'));
            return;
          }
          
          const db = initializeDatabase();
          const importedCategories: Category[] = [];
          let count = 0;
          
          // Process each row
          jsonData.forEach((row: any) => {
            // Map Excel columns to our category fields with flexibility
            const categoryData = normalizeCategoryData(row);
            
            // Only proceed if we have a name
            if (!categoryData.name) {
              return; // Skip invalid rows
            }
            
            // Check if category with same name already exists
            const exists = db.categories.some(c => 
              c.name.toLowerCase() === categoryData.name.toLowerCase()
            );
            
            if (exists) {
              return; // Skip duplicates
            }
            
            // Create new category
            const newCategory: Category = {
              id: crypto.randomUUID(),
              name: categoryData.name,
              description: categoryData.description || '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            importedCategories.push(newCategory);
            count++;
          });
          
          if (count === 0) {
            toast.error('No valid categories found in the Excel file');
            reject(new Error('No valid categories found in the Excel file'));
            return;
          }
          
          // Add imported categories to database
          db.categories = [...db.categories, ...importedCategories];
          saveDatabase(db);
          
          resolve({ categories: db.categories, count });
        } catch (error) {
          console.error('Error parsing Excel file:', error);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Failed to import categories from Excel:', error);
      reject(error);
    }
  });
};

// Helper function to normalize category data from Excel with different column names
const normalizeCategoryData = (row: any) => {
  // Default values
  const normalizedData: {
    name: string,
    description: string
  } = {
    name: '',
    description: ''
  };
  
  // Map various possible column names to our fields
  const columnMap: Record<string, (value: any) => void> = {
    // Name variations
    'name': (val) => { normalizedData.name = String(val) },
    'category': (val) => { normalizedData.name = String(val) },
    'category name': (val) => { normalizedData.name = String(val) },
    'nama': (val) => { normalizedData.name = String(val) },
    'kategori': (val) => { normalizedData.name = String(val) },
    'nama kategori': (val) => { normalizedData.name = String(val) },
    
    // Description variations
    'description': (val) => { normalizedData.description = String(val) },
    'desc': (val) => { normalizedData.description = String(val) },
    'deskripsi': (val) => { normalizedData.description = String(val) },
  };
  
  // Apply each key in the row to our normalized data
  Object.keys(row).forEach(key => {
    const lowerKey = key.toLowerCase();
    if (columnMap[lowerKey]) {
      columnMap[lowerKey](row[key]);
    }
  });
  
  return normalizedData;
};

export const exportTransactionsToExcel = (): void => {
  try {
    const db = initializeDatabase();
    
    // Create a workbook
    const wb = XLSX.utils.book_new();
    
    // Format transaction data for export
    const transactionData = db.transactions.map(transaction => {
      return {
        ReceiptNumber: transaction.receiptNumber,
        Date: new Date(transaction.createdAt).toLocaleString(),
        ItemsCount: transaction.items.length,
        Subtotal: transaction.subtotal,
        Total: transaction.total,
        PaymentMethod: transaction.paymentMethod,
        CashReceived: transaction.paymentMethod === 'cash' ? transaction.cashReceived : 'N/A',
        Change: transaction.paymentMethod === 'cash' ? transaction.change : 'N/A'
      };
    });
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(transactionData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    
    // Write to file and trigger download
    XLSX.writeFile(wb, `transaction_history_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast.success('Transactions exported to Excel successfully');
  } catch (error) {
    console.error('Failed to export transactions to Excel:', error);
    toast.error('Failed to export transactions to Excel');
  }
};

export const exportSuppliersToExcel = (): void => {
  try {
    const db = initializeDatabase();
    
    // Create a workbook
    const wb = XLSX.utils.book_new();
    
    // Format supplier data for export
    const supplierData = db.suppliers.map(supplier => {
      return {
        Name: supplier.name,
        Email: supplier.email,
        Phone: supplier.phone,
        Address: supplier.address,
        CreatedAt: new Date(supplier.createdAt).toLocaleString(),
        UpdatedAt: new Date(supplier.updatedAt).toLocaleString()
      };
    });
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(supplierData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Suppliers");
    
    // Write to file and trigger download
    XLSX.writeFile(wb, `suppliers_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast.success('Suppliers exported to Excel successfully');
  } catch (error) {
    console.error('Failed to export suppliers to Excel:', error);
    toast.error('Failed to export suppliers to Excel');
  }
};

export const importTransactionsFromExcel = async (file: File): Promise<{ transactions: Transaction[], count: number } | null> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          if (!jsonData || jsonData.length === 0) {
            toast.error('No data found in the Excel file');
            reject(new Error('No data found in the Excel file'));
            return;
          }
          
          const db = initializeDatabase();
          const importedTransactions: Transaction[] = [];
          let count = 0;
          
          // Process each row
          jsonData.forEach((row: any) => {
            // Normalize transaction data
            const transactionData = normalizeTransactionData(row);
            
            if (!transactionData.receiptNumber || !transactionData.items || transactionData.items.length === 0) {
              return; // Skip invalid rows
            }
            
            // Check if transaction with same receipt number already exists
            const exists = db.transactions.some(t => 
              t.receiptNumber === transactionData.receiptNumber
            );
            
            if (exists) {
              return; // Skip duplicates
            }
            
            // Create new transaction
            const newTransaction: Transaction = {
              id: crypto.randomUUID(),
              receiptNumber: transactionData.receiptNumber,
              items: transactionData.items,
              subtotal: transactionData.subtotal,
              tax: 0, // We removed tax from the system
              total: transactionData.total,
              paymentMethod: transactionData.paymentMethod,
              cashReceived: transactionData.cashReceived,
              change: transactionData.change,
              createdAt: transactionData.createdAt || new Date().toISOString()
            };
            
            importedTransactions.push(newTransaction);
            count++;
          });
          
          if (count === 0) {
            toast.error('No valid transactions found in the Excel file');
            reject(new Error('No valid transactions found in the Excel file'));
            return;
          }
          
          // Add imported transactions to database
          db.transactions = [...db.transactions, ...importedTransactions];
          saveDatabase(db);
          
          resolve({ transactions: db.transactions, count });
        } catch (error) {
          console.error('Error parsing Excel file:', error);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Failed to import transactions from Excel:', error);
      reject(error);
    }
  });
};

// Helper to normalize transaction data from Excel
const normalizeTransactionData = (row: any) => {
  // Default values
  const normalizedData: {
    receiptNumber: string,
    items: TransactionItem[],
    subtotal: number,
    total: number,
    paymentMethod: string,
    cashReceived: number,
    change: number,
    createdAt?: string
  } = {
    receiptNumber: '',
    items: [],
    subtotal: 0,
    total: 0,
    paymentMethod: 'cash',
    cashReceived: 0,
    change: 0
  };
  
  // Map various possible column names to our fields
  if (row.ReceiptNumber || row.receiptNumber || row['Receipt Number'] || row['receipt number']) {
    normalizedData.receiptNumber = String(row.ReceiptNumber || row.receiptNumber || row['Receipt Number'] || row['receipt number']);
  }
  
  if (row.Total || row.total) {
    normalizedData.total = Number(row.Total || row.total) || 0;
    normalizedData.subtotal = normalizedData.total; // Since we don't have tax
  }
  
  if (row.PaymentMethod || row.paymentMethod || row['Payment Method'] || row['payment method']) {
    normalizedData.paymentMethod = String(row.PaymentMethod || row.paymentMethod || row['Payment Method'] || row['payment method']).toLowerCase();
  }
  
  if (row.CashReceived || row.cashReceived || row['Cash Received'] || row['cash received']) {
    normalizedData.cashReceived = Number(row.CashReceived || row.cashReceived || row['Cash Received'] || row['cash received']) || 0;
  }
  
  if (row.Change || row.change) {
    normalizedData.change = Number(row.Change || row.change) || 0;
  }
  
  if (row.Date || row.date || row.CreatedAt || row.createdAt) {
    const dateStr = row.Date || row.date || row.CreatedAt || row.createdAt;
    try {
      // Try to parse the date
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        normalizedData.createdAt = date.toISOString();
      }
    } catch (e) {
      // If date parsing fails, use current date
      normalizedData.createdAt = new Date().toISOString();
    }
  }
  
  // Create a dummy item if items are not specified
  normalizedData.items = [{
    productId: crypto.randomUUID(),
    productName: 'Imported Item',
    quantity: 1,
    unitPrice: normalizedData.total,
    subtotal: normalizedData.total
  }];
  
  return normalizedData;
};

export const importSuppliersFromExcel = async (file: File): Promise<{ suppliers: Supplier[], count: number } | null> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          if (!jsonData || jsonData.length === 0) {
            toast.error('No data found in the Excel file');
            reject(new Error('No data found in the Excel file'));
            return;
          }
          
          const db = initializeDatabase();
          const importedSuppliers: Supplier[] = [];
          let count = 0;
          
          // Process each row
          jsonData.forEach((row: any) => {
            // Normalize supplier data
            const supplierData = normalizeSupplierData(row);
            
            if (!supplierData.name) {
              return; // Skip invalid rows
            }
            
            // Check if supplier with same name or email already exists
            const exists = db.suppliers.some(s => 
              (s.name.toLowerCase() === supplierData.name.toLowerCase()) ||
              (supplierData.email && s.email.toLowerCase() === supplierData.email.toLowerCase())
            );
            
            if (exists) {
              return; // Skip duplicates
            }
            
            // Create new supplier
            const newSupplier: Supplier = {
              id: crypto.randomUUID(),
              name: supplierData.name,
              email: supplierData.email,
              phone: supplierData.phone,
              address: supplierData.address,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            importedSuppliers.push(newSupplier);
            count++;
          });
          
          if (count === 0) {
            toast.error('No valid suppliers found in the Excel file');
            reject(new Error('No valid suppliers found in the Excel file'));
            return;
          }
          
          // Add imported suppliers to database
          db.suppliers = [...db.suppliers, ...importedSuppliers];
          saveDatabase(db);
          
          resolve({ suppliers: db.suppliers, count });
        } catch (error) {
          console.error('Error parsing Excel file:', error);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Failed to import suppliers from Excel:', error);
      reject(error);
    }
  });
};

// Helper to normalize supplier data from Excel
const normalizeSupplierData = (row: any) => {
  // Default values
  const normalizedData: {
    name: string,
    email: string,
    phone: string,
    address: string
  } = {
    name: '',
    email: '',
    phone: '',
    address: ''
  };
  
  // Map various possible column names to our fields
  if (row.Name || row.name || row.SupplierName || row['Supplier Name']) {
    normalizedData.name = String(row.Name || row.name || row.SupplierName || row['Supplier Name']);
  }
  
  if (row.Email || row.email) {
    normalizedData.email = String(row.Email || row.email);
  }
  
  if (row.Phone || row.phone || row.PhoneNumber || row['Phone Number']) {
    normalizedData.phone = String(row.Phone || row.phone || row.PhoneNumber || row['Phone Number']);
  }
  
  if (row.Address || row.address) {
    normalizedData.address = String(row.Address || row.address);
  }
  
  return normalizedData;
};

