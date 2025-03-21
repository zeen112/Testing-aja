
import React, { useState, useRef, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Supplier } from '@/utils/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Download, Upload } from 'lucide-react';
import AddSupplierForm from './AddSupplierForm';
import { toast } from 'sonner';

const SupplierList: React.FC = () => {
  const { suppliers, exportSuppliersToExcel, importSuppliersFromExcel } = useInventory();
  const [openAddForm, setOpenAddForm] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when unmounting to prevent memory leaks
  useEffect(() => {
    return () => {
      setOpenAddForm(false);
      setEditSupplier(undefined);
    };
  }, []);

  const filteredSuppliers = searchQuery
    ? suppliers.filter(supplier => 
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.phone.includes(searchQuery))
    : suppliers;

  const handleEdit = (supplier: Supplier, e: React.MouseEvent) => {
    // Stop event propagation to prevent issues with nested events
    e.stopPropagation();
    setEditSupplier(supplier);
    setOpenAddForm(true);
  };

  const handleImportClick = (e: React.MouseEvent) => {
    e.preventDefault();
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
        await importSuppliersFromExcel(file);
      } catch (error) {
        console.error('Import failed:', error);
      }
      
      // Reset file input
      e.target.value = '';
    }
  };

  // Close form handler to ensure proper cleanup
  const handleFormClose = () => {
    setOpenAddForm(false);
    // Small delay to ensure state updates properly
    setTimeout(() => {
      setEditSupplier(undefined);
    }, 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Suppliers</h2>
          <p className="text-muted-foreground mt-1">Manage your suppliers</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={(e) => {
            e.preventDefault();
            exportSuppliersToExcel();
          }}>
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
          <Button onClick={(e) => {
            e.preventDefault();
            setEditSupplier(undefined);
            setOpenAddForm(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b">
          <Input
            placeholder="Search suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="border-b">
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Email</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Phone</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Address</th>
                <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((supplier) => (
                  <tr
                    key={supplier.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle">{supplier.name}</td>
                    <td className="p-4 align-middle">{supplier.email}</td>
                    <td className="p-4 align-middle">{supplier.phone}</td>
                    <td className="p-4 align-middle">{supplier.address}</td>
                    <td className="p-4 text-right align-middle">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => handleEdit(supplier, e)}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="h-24 text-center">
                    No suppliers found. Add your first supplier to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <AddSupplierForm
        open={openAddForm}
        onOpenChange={handleFormClose}
        editSupplier={editSupplier}
      />
    </div>
  );
};

export default SupplierList;
