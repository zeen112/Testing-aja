import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { formatToRupiah } from '../utils/formatters';
import { Product } from '../utils/database';
import { 
  Send,
  AlertCircle, 
  AlertTriangle, 
  SortAsc, 
  SortDesc, 
  Filter, 
  Loader2
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CustomButton as Button } from "@/components/ui/custom-button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { sendToTelegram } from "../utils/telegramService";

// Define enum for filter options
enum StockFilter {
  ALL = 'all',
  OUT_OF_STOCK = 'out',
  LOW_STOCK = 'low'
}

const StockAlerts: React.FC = () => {
  const { products, categories } = useInventory();
  const [filter, setFilter] = useState<StockFilter>(StockFilter.ALL);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock'>('stock');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isSendingLowStock, setIsSendingLowStock] = useState(false);

  // Filter and sort products
  useEffect(() => {
    let result = [...products];
    
    // Filter by stock status
    if (filter === StockFilter.OUT_OF_STOCK) {
      result = result.filter(product => product.stock === 0);
    } else if (filter === StockFilter.LOW_STOCK) {
      result = result.filter(product => product.stock > 0 && product.stock <= 3);
    } else {
      result = result.filter(product => product.stock <= 3);
    }
    
    // Filter by category
    if (categoryFilter !== 'all') {
      result = result.filter(product => product.category === categoryFilter);
    }
    
    // Sort products
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else {
        return sortOrder === 'asc' 
          ? a.stock - b.stock 
          : b.stock - a.stock;
      }
    });
    
    setFilteredProducts(result);
  }, [products, filter, categoryFilter, sortBy, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleSendToTelegram = async () => {
    try {
      setIsSending(true);
      toast.loading("Mengirim laporan stok habis ke Telegram...");
      
      // Get out of stock products
      const outOfStockProducts = products.filter(p => p.stock === 0);
      
      if (outOfStockProducts.length === 0) {
        toast.dismiss();
        toast.info("Tidak ada produk dengan stok kosong untuk dilaporkan.");
        setIsSending(false);
        return;
      }
      
      // Format the message
      const formattedDate = new Date().toLocaleDateString('id-ID', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      let message = `🚨 *LAPORAN STOK BARANG HABIS*\n📅 ${formattedDate}\n\n`;
      
      // Group by category for better readability
      const productsByCategory: Record<string, Product[]> = {};
      
      outOfStockProducts.forEach(product => {
        const categoryObj = categories.find(c => c.id === product.category);
        const categoryName = categoryObj ? categoryObj.name : 'Tidak Terkategori';
        
        if (!productsByCategory[categoryName]) {
          productsByCategory[categoryName] = [];
        }
        
        productsByCategory[categoryName].push(product);
      });
      
      // Build message with products grouped by category
      Object.entries(productsByCategory).forEach(([categoryName, products], index) => {
        message += `📦 *${categoryName}*\n`;
        
        products.forEach((product, i) => {
          message += `${i+1}. ${product.name} (SKU: ${product.sku})\n   💰 Harga: ${formatToRupiah(product.price)}\n   📍 Lokasi: ${product.rackLocation || 'N/A'}\n`;
        });
        
        if (index < Object.entries(productsByCategory).length - 1) {
          message += '\n';
        }
      });
      
      message += `\n🔢 *Total Produk Habis: ${outOfStockProducts.length}*\n`;
      message += `💬 Segera lakukan pembelian untuk mengisi kembali stok yang habis.`;
      
      console.log("Prepared message:", message.substring(0, 100) + "...");
      
      // Send to Telegram
      const success = await sendToTelegram(message);
      
      toast.dismiss();
      
      if (success) {
        toast.success("Laporan stok habis berhasil dikirim ke Telegram!");
      } else {
        toast.error("Gagal mengirim laporan ke Telegram. Coba lagi nanti.");
      }
    } catch (error) {
      console.error('Failed to send to Telegram:', error);
      toast.dismiss();
      toast.error("Terjadi kesalahan saat mengirim ke Telegram.");
    } finally {
      setIsSending(false);
    }
  };

  // New function to send low stock alerts to Telegram
  const handleSendLowStockToTelegram = async () => {
    try {
      setIsSendingLowStock(true);
      toast.loading("Mengirim laporan stok menipis ke Telegram...");
      
      // Get low stock products (stock between 1-3)
      const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 3);
      
      if (lowStockProducts.length === 0) {
        toast.dismiss();
        toast.info("Tidak ada produk dengan stok menipis untuk dilaporkan.");
        setIsSendingLowStock(false);
        return;
      }
      
      // Format the message
      const formattedDate = new Date().toLocaleDateString('id-ID', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      let message = `⚠️ *LAPORAN STOK BARANG MENIPIS*\n📅 ${formattedDate}\n\n`;
      
      // Group by category for better readability
      const productsByCategory: Record<string, Product[]> = {};
      
      lowStockProducts.forEach(product => {
        const categoryObj = categories.find(c => c.id === product.category);
        const categoryName = categoryObj ? categoryObj.name : 'Tidak Terkategori';
        
        if (!productsByCategory[categoryName]) {
          productsByCategory[categoryName] = [];
        }
        
        productsByCategory[categoryName].push(product);
      });
      
      // Build message with products grouped by category
      Object.entries(productsByCategory).forEach(([categoryName, products], index) => {
        message += `📦 *${categoryName}*\n`;
        
        products.forEach((product, i) => {
          message += `${i+1}. ${product.name} (SKU: ${product.sku})\n   💰 Harga: ${formatToRupiah(product.price)}\n   📍 Lokasi: ${product.rackLocation || 'N/A'}\n   📊 Stok Tersisa: ${product.stock}\n`;
        });
        
        if (index < Object.entries(productsByCategory).length - 1) {
          message += '\n';
        }
      });
      
      message += `\n🔢 *Total Produk Stok Menipis: ${lowStockProducts.length}*\n`;
      message += `💬 Segera persiapkan pembelian untuk mengisi kembali stok yang menipis.`;
      
      console.log("Prepared low stock message:", message.substring(0, 100) + "...");
      
      // Send to Telegram
      const success = await sendToTelegram(message);
      
      toast.dismiss();
      
      if (success) {
        toast.success("Laporan stok menipis berhasil dikirim ke Telegram!");
      } else {
        toast.error("Gagal mengirim laporan ke Telegram. Coba lagi nanti.");
      }
    } catch (error) {
      console.error('Failed to send low stock report to Telegram:', error);
      toast.dismiss();
      toast.error("Terjadi kesalahan saat mengirim ke Telegram.");
    } finally {
      setIsSendingLowStock(false);
    }
  };

  const getSummary = () => {
    const outOfStock = products.filter(p => p.stock === 0).length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 3).length;
    const totalAlerts = outOfStock + lowStock;
    
    return { outOfStock, lowStock, totalAlerts };
  };
  
  const summary = getSummary();
  
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Stock Alerts</h1>
          <p className="text-muted-foreground">Monitor and manage low and out-of-stock products</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={handleSendToTelegram} 
            className="flex items-center gap-2"
            variant="destructive"
            disabled={isSending || products.filter(p => p.stock === 0).length === 0}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Kirim Laporan Stok Habis
          </Button>
          
          <Button 
            onClick={handleSendLowStockToTelegram} 
            className="flex items-center gap-2"
            variant="warning"
            disabled={isSendingLowStock || products.filter(p => p.stock > 0 && p.stock <= 3).length === 0}
          >
            {isSendingLowStock ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Kirim Laporan Stok Menipis
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Alerts</CardTitle>
            <CardDescription>Products that need attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.totalAlerts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Out of Stock</CardTitle>
            <CardDescription>Products with zero stock</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{summary.outOfStock}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Low Stock</CardTitle>
            <CardDescription>Products with stock level 1-3</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">{summary.lowStock}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stock Status
              </label>
              <Select 
                value={filter} 
                onValueChange={(value) => setFilter(value as StockFilter)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by stock status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={StockFilter.ALL}>All Alerts</SelectItem>
                  <SelectItem value={StockFilter.OUT_OF_STOCK}>Out of Stock Only</SelectItem>
                  <SelectItem value={StockFilter.LOW_STOCK}>Low Stock Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-1/3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <Select 
                value={categoryFilter} 
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-1/3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sort By
              </label>
              <div className="flex gap-2">
                <Select 
                  value={sortBy} 
                  onValueChange={(value) => setSortBy(value as 'name' | 'stock')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Product Name</SelectItem>
                    <SelectItem value="stock">Stock Level</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={toggleSortOrder}
                  className="shrink-0"
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Product Table */}
      <Card>
        <CardHeader>
          <CardTitle>Critical Stock Products</CardTitle>
          <CardDescription>
            Products that require immediate attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProducts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.stock === 0 ? (
                        <Badge variant="destructive" className="flex gap-1 items-center">
                          <AlertCircle className="h-3 w-3" />
                          Out of Stock
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="flex gap-1 items-center">
                          <AlertTriangle className="h-3 w-3" />
                          Low Stock
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{getCategoryName(product.category)}</TableCell>
                    <TableCell>{formatToRupiah(product.price)}</TableCell>
                    <TableCell className="font-bold">
                      <span className={product.stock === 0 ? "text-destructive" : "text-amber-500"}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>{product.rackLocation || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {filter === StockFilter.OUT_OF_STOCK 
                  ? "No out-of-stock products found." 
                  : filter === StockFilter.LOW_STOCK 
                    ? "No low-stock products found."
                    : "No critical stock products found."}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t bg-muted/50 px-6 py-3">
          <div className="text-xs text-muted-foreground">
            Showing {filteredProducts.length} alerts out of {summary.totalAlerts} total
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default StockAlerts;
