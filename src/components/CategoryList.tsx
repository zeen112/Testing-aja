
import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import AddCategoryForm from './AddCategoryForm';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, AlertTriangle, Upload } from 'lucide-react';
import { Category } from '@/utils/database';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from '@/utils/formatters';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const CategoryList: React.FC = () => {
  const { categories, deleteCategory, loading, importCategoriesFromExcel } = useInventory();
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleEdit = (category: Category) => {
    if (category.id === categories[0]?.id) {
      toast.error('Cannot edit the default category');
      return;
    }
    setEditCategory(category);
    setAddCategoryOpen(true);
  };
  
  const openDeleteDialog = (id: string) => {
    if (id === categories[0]?.id) {
      toast.error('Cannot delete the default category');
      return;
    }
    
    setCategoryToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  const handleDelete = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete);
    }
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file extension
      const validExtensions = ['.xlsx', '.xls', '.csv'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        toast.error('Please upload a valid Excel file (xlsx, xls, csv)');
        return;
      }
      
      // Display loading toast
      toast.loading('Importing categories, please wait...');
      
      // Import the file
      const importPromise = importCategoriesFromExcel(file);
      if (importPromise && importPromise instanceof Promise) {
        importPromise.finally(() => {
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          setImportOpen(false);
          // Dismiss loading toast
          toast.dismiss();
        });
      } else {
        // If it's not a promise, we still want to reset the UI
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setImportOpen(false);
        toast.dismiss();
      }
    }
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Categories</h2>
          <p className="text-muted-foreground mt-1">Organize your products</p>
        </div>
        
        <div className="flex gap-2">
          <Popover open={importOpen} onOpenChange={setImportOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import Excel
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Import Categories from Excel</h4>
                <p className="text-sm text-muted-foreground">
                  Upload an Excel file with category data. The system will automatically detect column names.
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported columns: name/kategori/nama kategori, description/deskripsi
                </p>
                <div className="space-y-2">
                  <Label htmlFor="file">Excel File</Label>
                  <Input 
                    ref={fileInputRef}
                    id="file" 
                    type="file" 
                    accept=".xlsx,.xls,.csv" 
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button onClick={() => {
            setEditCategory(undefined);
            setAddCategoryOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>
      
      {categories.length <= 1 ? (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No custom categories found</p>
          <Button onClick={() => {
            setEditCategory(undefined);
            setAddCategoryOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add your first category
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead className="hidden lg:table-cell">Updated</TableHead>
                <TableHead className="hidden sm:table-cell">Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                    {category.description}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {formatDate(category.updatedAt)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {formatDate(category.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(category)}
                        disabled={category.id === categories[0]?.id}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => openDeleteDialog(category.id)}
                        disabled={category.id === categories[0]?.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <AddCategoryForm 
        open={addCategoryOpen} 
        onOpenChange={setAddCategoryOpen}
        editCategory={editCategory}
      />
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="animate-fade-in">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-destructive">
              <AlertTriangle className="h-5 w-5 mr-2 animate-pulse" />
              Confirm Category Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category?
              All products in this category will be moved to Uncategorized.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoryList;
