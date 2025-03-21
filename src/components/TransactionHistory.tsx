
import React, { useState, useRef } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { formatToRupiah } from '@/utils/formatters';
import { formatDate } from '@/utils/formatters';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Printer, Download, Search, Eye, Upload } from 'lucide-react';
import { toast } from 'sonner';

const TransactionHistory = () => {
  const { 
    transactions, 
    exportTransactionsToExcel, 
    importTransactionsFromExcel 
  } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter transactions based on receipt number
  const filteredTransactions = searchQuery 
    ? transactions.filter(transaction => 
        transaction.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : transactions;

  // Sort transactions by creation date (newest first)
  const sortedTransactions = [...filteredTransactions].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleViewTransaction = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && 
          file.type !== 'application/vnd.ms-excel') {
        toast.error('Please upload an Excel file (.xlsx or .xls)');
        return;
      }
      
      try {
        await importTransactionsFromExcel(file);
      } catch (error) {
        console.error('Import failed:', error);
      }
      
      // Reset file input
      e.target.value = '';
    }
  };

  const downloadReceipt = (transaction: any) => {
    const receiptContent = `
      INVENTORY SYSTEM
      Receipt #: ${transaction.receiptNumber}
      Date: ${new Date(transaction.createdAt).toLocaleString()}
      ------------------------------
      
      ITEMS:
      ${transaction.items.map((item: any) => 
        `${item.productName}
         ${item.quantity} x ${formatToRupiah(item.unitPrice)} = ${formatToRupiah(item.subtotal)}`
      ).join('\n\n')}
      
      ------------------------------
      Subtotal: ${formatToRupiah(transaction.subtotal)}
      TOTAL: ${formatToRupiah(transaction.total)}
      
      Payment: ${transaction.paymentMethod.toUpperCase()}
      ${transaction.paymentMethod === 'cash' ? 
        `Cash: ${formatToRupiah(transaction.cashReceived)}
        Change: ${formatToRupiah(transaction.change)}` : ''}
      
      Thank you for your purchase!
    `;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${transaction.receiptNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printReceipt = (transaction: any) => {
    const printContent = `
      <html>
        <head>
          <title>Receipt ${transaction.receiptNumber}</title>
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
              <p>Receipt #: ${transaction.receiptNumber}</p>
              <p>Date: ${new Date(transaction.createdAt).toLocaleString()}</p>
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
                ${transaction.items.map((item: any) => `
                  <tr>
                    <td>${item.productName}</td>
                    <td>${item.quantity}</td>
                    <td>${formatToRupiah(item.unitPrice)}</td>
                    <td>${formatToRupiah(item.subtotal)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="divider"></div>
            
            <div class="total-line" style="font-weight: bold;">
              <span>TOTAL:</span>
              <span>${formatToRupiah(transaction.total)}</span>
            </div>
            
            <div class="divider"></div>
            
            <div class="total-line">
              <span>Payment Method:</span>
              <span>${transaction.paymentMethod.toUpperCase()}</span>
            </div>
            
            ${transaction.paymentMethod === 'cash' ? `
              <div class="total-line">
                <span>Cash Received:</span>
                <span>${formatToRupiah(transaction.cashReceived)}</span>
              </div>
              <div class="total-line">
                <span>Change:</span>
                <span>${formatToRupiah(transaction.change)}</span>
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
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Transaction History</h1>
        <div className="flex gap-2">
          <Button onClick={exportTransactionsToExcel}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleImportClick}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx,.xls"
            className="hidden"
          />
        </div>
      </div>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by receipt number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Transaction Records</CardTitle>
          <CardDescription>
            {filteredTransactions.length} transactions found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTransactions.map((transaction) => (
                  <TableRow key={transaction.receiptNumber}>
                    <TableCell className="font-medium">{transaction.receiptNumber}</TableCell>
                    <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                    <TableCell>{transaction.items.length} items</TableCell>
                    <TableCell>{formatToRupiah(transaction.total)}</TableCell>
                    <TableCell className="capitalize">{transaction.paymentMethod}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewTransaction(transaction)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => printReceipt(transaction)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => downloadReceipt(transaction)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-6 text-muted-foreground">
              No transactions found
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Transaction Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedTransaction && (
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>
                Receipt #{selectedTransaction.transactionId}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Date:</span>
                <span>{formatDate(selectedTransaction.date)}</span>
              </div>
              
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedTransaction.items.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatToRupiah(item.price)}</TableCell>
                        <TableCell className="text-right">{formatToRupiah(item.price * item.quantity)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="space-y-2 pt-2 border-t">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatToRupiah(selectedTransaction.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Payment Method</span>
                  <span className="capitalize">{selectedTransaction.paymentMethod}</span>
                </div>
                {selectedTransaction.paymentMethod === 'cash' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Cash Received</span>
                      <span>{formatToRupiah(selectedTransaction.cashReceived)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Change</span>
                      <span>{formatToRupiah(selectedTransaction.change)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <DialogFooter className="flex space-x-2 justify-end">
              <Button
                variant="outline"
                onClick={() => printReceipt(selectedTransaction)}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button
                onClick={() => downloadReceipt(selectedTransaction)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default TransactionHistory;
