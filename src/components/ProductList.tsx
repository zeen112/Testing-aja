import React, { useState, useEffect, useRef } from 'react';
import { useInventory } from '../context/InventoryContext';
import SearchBar from './SearchBar';
import ProductCard from './ProductCard';
import AddProductForm from './AddProductForm';
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload, Cloud, CloudOff, RefreshCw, FileUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const ProductList: React.FC = () => {
  const { 
    searchResults, 
    exportToExcel, 
    importProductsFromExcel, 
    loading, 
    isOnline, 
    syncToCloud 
  } = useInventory();
  
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [importExportOpen, setImportExportOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (importExportOpen && 
          popoverRef.current && 
          !popoverRef.current.contains(event.target as Node)) {
        setImportExportOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && importExportOpen) {
        setImportExportOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [importExportOpen]);
  
  const handleAddProduct = () => {
    setEditProduct(null);
    setAddProductOpen(true);
  };
  
  const handleEditProduct = (product) => {
    setEditProduct(product);
    setAddProductOpen(true);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validExtensions = ['.xlsx', '.xls', '.csv'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        toast.error('Please upload a valid Excel file (xlsx, xls, csv)');
        return;
      }
      
      toast.loading('Importing products, please wait...');
      
      const importPromise = Promise.resolve(importProductsFromExcel(file))
        .finally(() => {
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          setImportExportOpen(false);
          toast.dismiss();
        });
    }
  };
  
  const handleExport = () => {
    exportToExcel();
    setImportExportOpen(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleSyncToCloud = async () => {
    if (!isOnline) {
      toast.error('You are offline. Please connect to the internet to sync.');
      return;
    }
    
    setIsSyncing(true);
    try {
      await syncToCloud();
    } finally {
      setIsSyncing(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold">Products</h2>
            <Badge variant={isOnline ? "success" : "destructive"} className="ml-2">
              {isOnline ? (
                <span className="flex items-center">
                  <Cloud className="h-3 w-3 mr-1" />
                  Online
                </span>
              ) : (
                <span className="flex items-center">
                  <CloudOff className="h-3 w-3 mr-1" />
                  Offline
                </span>
              )}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">Manage your inventory</p>
        </div>
        
        <div className="flex flex-wrap gap-2 self-end sm:self-auto">
          {isOnline && (
            <Button variant="outline" onClick={handleSyncToCloud} disabled={isSyncing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync to Cloud
            </Button>
          )}
          
          <Popover open={importExportOpen} onOpenChange={setImportExportOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="group">
                <FileUp className="mr-2 h-4 w-4 transition-transform group-hover:translate-y-[-2px]" />
                Import/Export
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              ref={popoverRef}
              className="w-60 p-0 animate-fade-in animate-scale-in z-50 bg-background"
              sideOffset={5}
              onEscapeKeyDown={() => setImportExportOpen(false)}
              onInteractOutside={() => setImportExportOpen(false)}
            >
              <div className="rounded-md overflow-hidden">
                <div className="flex flex-col">
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 p-3 transition-colors hover:bg-accent text-left"
                  >
                    <Download className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Export</div>
                      <div className="text-xs text-muted-foreground">Download as Excel</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={handleImportClick}
                    className="flex items-center gap-2 p-3 transition-colors hover:bg-accent text-left"
                  >
                    <Upload className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Import</div>
                      <div className="text-xs text-muted-foreground">Upload Excel file</div>
                    </div>
                  </button>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept=".xlsx,.xls,.csv" 
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button onClick={handleAddProduct}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>
      
      <SearchBar />
      
      {loading ? (
        <div className="flex justify-center items-center h-64">Loading...</div>
      ) : searchResults.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No products found</p>
          <Button onClick={handleAddProduct}>
            <Plus className="mr-2 h-4 w-4" />
            Add your first product
          </Button>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-center">SKU</TableHead>
                <TableHead className="text-center">Rack</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {searchResults.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={handleEditProduct}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <AddProductForm 
        open={addProductOpen} 
        onOpenChange={setAddProductOpen}
        editProduct={editProduct}
      />
    </div>
  );
};

export default ProductList;

