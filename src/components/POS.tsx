
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CustomButton } from '@/components/ui/custom-button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInventory } from '@/context/InventoryContext';
import { formatToRupiah } from '@/utils/formatters';
import { sendToTelegram } from '@/utils/telegramService';
import { toast } from 'sonner';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  BanknoteIcon, 
  Receipt, 
  Printer, 
  Download 
} from 'lucide-react';
import { generateTransactionId } from '@/utils/posUtils';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

const POS = () => {
  const { products, categories, updateProduct, addTransaction } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [cashReceived, setCashReceived] = useState(0);
  const [changeDue, setChangeDue] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  useEffect(() => {
    const transactionId = generateTransactionId();
    setReceiptNumber(transactionId);
  }, []);

  useEffect(() => {
    let filtered = products;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  }, [searchQuery, products, selectedCategory]);

  useEffect(() => {
    const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const calculatedGrandTotal = cartTotal;
    
    setTotal(cartTotal);
    setGrandTotal(calculatedGrandTotal);
    
    if (cashReceived >= calculatedGrandTotal) {
      setChangeDue(cashReceived - calculatedGrandTotal);
    } else {
      setChangeDue(0);
    }
  }, [cart, cashReceived]);

  const addToCart = (product: any) => {
    if (product.stock <= 0) {
      toast.error(`${product.name} is out of stock`);
      return;
    }

    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex !== -1) {
      const updatedCart = [...cart];
      
      if (updatedCart[existingItemIndex].quantity >= product.stock) {
        toast.error(`Maximum available stock reached for ${product.name}`);
        return;
      }
      
      updatedCart[existingItemIndex].quantity += 1;
      updatedCart[existingItemIndex].subtotal = updatedCart[existingItemIndex].price * updatedCart[existingItemIndex].quantity;
      setCart(updatedCart);
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        subtotal: product.price
      };
      setCart([...cart, newItem]);
    }
  };

  const removeFromCart = (id: string) => {
    const updatedCart = cart.filter(item => item.id !== id);
    setCart(updatedCart);
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const product = products.find(p => p.id === id);
    
    if (product && newQuantity > product.stock) {
      toast.error(`Maximum available stock reached for ${product.name}`);
      return;
    }
    
    const updatedCart = cart.map(item => {
      if (item.id === id) {
        return {
          ...item,
          quantity: newQuantity,
          subtotal: item.price * newQuantity
        };
      }
      return item;
    });
    
    setCart(updatedCart);
  };

  const clearCart = () => {
    setCart([]);
    setCashReceived(0);
    setChangeDue(0);
    setReceiptData(null);
  };

  const handleCashInput = (value: string) => {
    const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
    setCashReceived(numericValue);
  };

  const processTransaction = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    
    if (paymentMethod === 'cash' && cashReceived < grandTotal) {
      toast.error('Insufficient payment amount');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      for (const item of cart) {
        const product = products.find(p => p.id === item.id);
        if (product) {
          await updateProduct({
            id: product.id,
            stock: product.stock - item.quantity
          });
        }
      }
      
      const newReceiptData = {
        receiptNumber,
        date: new Date().toISOString(),
        items: cart,
        subtotal: total,
        total: grandTotal,
        paymentMethod,
        cashReceived: paymentMethod === 'cash' ? cashReceived : grandTotal,
        change: paymentMethod === 'cash' ? changeDue : 0
      };
      
      const transactionData = {
        receiptNumber: receiptNumber,
        items: cart.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          subtotal: item.subtotal
        })),
        subtotal: total,
        tax: 0,
        total: grandTotal,
        paymentMethod,
        cashReceived: paymentMethod === 'cash' ? cashReceived : grandTotal,
        change: paymentMethod === 'cash' ? changeDue : 0
      };
      
      addTransaction(transactionData);
      
      await sendToTelegram(JSON.stringify(newReceiptData));
      
      toast.success('Transaction completed successfully');
      
      setReceiptData(newReceiptData);
    } catch (error) {
      console.error('Transaction failed:', error);
      toast.error('Transaction failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateNewTransaction = () => {
    const transactionId = generateTransactionId();
    setReceiptNumber(transactionId);
    clearCart();
  };

  const printReceipt = (data: any) => {
    const printContent = `
      <html>
        <head>
          <title>Receipt ${data.receiptNumber}</title>
          <style>
            body { font-family: sans-serif; font-size: 12px; }
            .receipt { width: 300px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 10px; }
            .items { width: 100%; border-collapse: collapse; }
            .items th, .items td { text-align: left; padding: 3px 0; }
            .total-line { display: flex; justify-content: space-between; margin: 5px 0; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h2>INVENTORY SYSTEM</h2>
              <p>Receipt #: ${data.receiptNumber}</p>
              <p>Date: ${new Date(data.date).toLocaleString()}</p>
              <div class="divider"></div>
            </div>
            
            <table class="items">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${data.items.map((item: CartItem) => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${formatToRupiah(item.price)}</td>
                    <td>${formatToRupiah(item.subtotal)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="divider"></div>
            
            <div class="total-line">
              <span>Subtotal:</span>
              <span>${formatToRupiah(data.subtotal)}</span>
            </div>
            <div class="total-line" style="font-weight: bold;">
              <span>TOTAL:</span>
              <span>${formatToRupiah(data.total)}</span>
            </div>
            
            <div class="divider"></div>
            
            <div class="total-line">
              <span>Payment Method:</span>
              <span>${data.paymentMethod.toUpperCase()}</span>
            </div>
            
            ${data.paymentMethod === 'cash' ? `
              <div class="total-line">
                <span>Cash Received:</span>
                <span>${formatToRupiah(data.cashReceived)}</span>
              </div>
              <div class="total-line">
                <span>Change:</span>
                <span>${formatToRupiah(data.change)}</span>
              </div>
            ` : ''}
            
            <div class="divider"></div>
            
            <div class="header">
              <p>Thank you for your purchase!</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } else {
      toast.error('Please allow pop-ups to print receipt');
    }
  };

  const downloadReceipt = (data: any) => {
    const receiptContent = `
      INVENTORY SYSTEM
      Receipt #: ${data.receiptNumber}
      Date: ${new Date(data.date).toLocaleString()}
      ------------------------------
      
      ITEMS:
      ${data.items.map((item: CartItem) => 
        `${item.name}
         ${item.quantity} x ${formatToRupiah(item.price)} = ${formatToRupiah(item.subtotal)}`
      ).join('\n\n')}
      
      ------------------------------
      Subtotal: ${formatToRupiah(data.subtotal)}
      TOTAL: ${formatToRupiah(data.total)}
      
      Payment: ${data.paymentMethod.toUpperCase()}
      ${data.paymentMethod === 'cash' ? 
        `Cash: ${formatToRupiah(data.cashReceived)}
        Change: ${formatToRupiah(data.change)}` : ''}
      
      Thank you for your purchase!
    `;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${data.receiptNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-2xl font-bold mb-4">Point of Sale</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
        <div className="lg:col-span-2 flex flex-col h-full">
          <div className="mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <Tabs defaultValue="all" className="flex-1 flex flex-col">
            <TabsList className="mb-4 flex overflow-x-auto pb-2">
              <TabsTrigger value="all" onClick={() => setSelectedCategory('all')}>
                All
              </TabsTrigger>
              {categories.map(category => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="all" className="flex-1 overflow-y-auto mt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredProducts.map(product => (
                  <Card 
                    key={product.id} 
                    className={`cursor-pointer transition hover:border-primary ${product.stock <= 0 ? 'opacity-50' : ''}`}
                    onClick={() => addToCart(product)}
                  >
                    <CardContent className="p-3">
                      <div className="flex flex-col h-full">
                        <div className="font-medium truncate">{product.name}</div>
                        <div className="text-sm text-muted-foreground mb-1 truncate">
                          Stock: {product.stock}
                        </div>
                        <div className="mt-auto text-right font-semibold text-primary">
                          {formatToRupiah(product.price)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredProducts.length === 0 && (
                  <div className="col-span-full text-center p-8 text-muted-foreground">
                    No products found
                  </div>
                )}
              </div>
            </TabsContent>
            
            {categories.map(category => (
              <TabsContent key={category.id} value={category.id} className="flex-1 overflow-y-auto mt-0">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredProducts.map(product => (
                    <Card 
                      key={product.id} 
                      className={`cursor-pointer transition hover:border-primary ${product.stock <= 0 ? 'opacity-50' : ''}`}
                      onClick={() => addToCart(product)}
                    >
                      <CardContent className="p-3">
                        <div className="flex flex-col h-full">
                          <div className="font-medium truncate">{product.name}</div>
                          <div className="text-sm text-muted-foreground mb-1 truncate">
                            Stock: {product.stock}
                          </div>
                          <div className="mt-auto text-right font-semibold text-primary">
                            {formatToRupiah(product.price)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {filteredProducts.length === 0 && (
                    <div className="col-span-full text-center p-8 text-muted-foreground">
                      No products found in this category
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
        
        <div className="bg-muted/30 rounded-lg p-4 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Current Sale</h2>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-auto"
              onClick={clearCart}
              disabled={cart.length === 0}
            >
              Clear
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto mb-4">
            {cart.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground h-full flex flex-col items-center justify-center">
                <ShoppingCart className="h-12 w-12 mb-2 opacity-20" />
                <p>Cart is empty</p>
                <p className="text-sm">Add products to begin</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium py-2">{item.name}</TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center justify-center">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7 rounded-full"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="mx-2 text-center w-8">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7 rounded-full"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-2">
                        {formatToRupiah(item.subtotal)}
                      </TableCell>
                      <TableCell className="py-2 w-8">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between font-bold text-lg mb-4">
              <span>Total</span>
              <span>{formatToRupiah(grandTotal)}</span>
            </div>
            
            <div className="mb-4">
              <div className="flex gap-2 mb-2">
                <Button 
                  variant={paymentMethod === 'cash' ? 'default' : 'outline'} 
                  className="flex-1"
                  onClick={() => setPaymentMethod('cash')}
                >
                  <BanknoteIcon className="mr-2 h-4 w-4" />
                  Cash
                </Button>
                <Button 
                  variant={paymentMethod === 'card' ? 'default' : 'outline'} 
                  className="flex-1"
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Card
                </Button>
              </div>
              
              {paymentMethod === 'cash' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Cash Received</span>
                    <Input
                      type="text"
                      className="w-32 text-right"
                      value={cashReceived ? formatToRupiah(cashReceived) : ''}
                      onChange={(e) => handleCashInput(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Change</span>
                    <span className="font-semibold">{formatToRupiah(changeDue)}</span>
                  </div>
                </div>
              )}
            </div>
            
            {receiptData ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Receipt #{receiptData.receiptNumber}</span>
                  <span className="text-xs text-muted-foreground">Transaction complete</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="flex gap-2" onClick={() => printReceipt(receiptData)}>
                    <Printer className="h-4 w-4" />
                    Print
                  </Button>
                  <Button variant="outline" className="flex gap-2" onClick={() => downloadReceipt(receiptData)}>
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button className="col-span-2 flex gap-2" onClick={generateNewTransaction}>
                    <ShoppingCart className="h-4 w-4" />
                    New Transaction
                  </Button>
                </div>
              </div>
            ) : (
              <Tabs defaultValue="checkout" className="mt-4">
                <TabsList className="w-full">
                  <TabsTrigger value="checkout" className="flex-1">
                    Checkout
                  </TabsTrigger>
                  <TabsTrigger value="hold" className="flex-1">
                    Hold
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="checkout" className="mt-2">
                  <Button 
                    className="w-full flex gap-2" 
                    onClick={processTransaction} 
                    disabled={isProcessing || cart.length === 0}
                  >
                    <Receipt className="h-4 w-4" />
                    Complete Sale
                  </Button>
                </TabsContent>
                <TabsContent value="hold" className="mt-2">
                  <Button className="w-full" variant="outline">
                    Hold Transaction
                  </Button>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;
