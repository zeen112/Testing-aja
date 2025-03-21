
import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { parseRupiahToNumber } from '../utils/formatters';
import { Product } from '@/utils/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { generateTransactionId } from '@/utils/posUtils';
import { toast } from 'sonner';

interface AddProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editProduct?: Product;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ 
  open, 
  onOpenChange,
  editProduct
}) => {
  const { categories, addProduct, updateProduct } = useInventory();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [rackLocation, setRackLocation] = useState('');
  const [productId, setProductId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  useEffect(() => {
    if (open) {
      if (editProduct) {
        setName(editProduct.name);
        setDescription(editProduct.description || '');
        setPrice(editProduct.price.toString());
        setStock(editProduct.stock.toString());
        setCategory(editProduct.category);
        setRackLocation(editProduct.rackLocation || '');
        setProductId(editProduct.id);
      } else {
        setName('');
        setDescription('');
        setPrice('');
        setStock('');
        setCategory(categories.length > 0 ? categories[0]?.id : '');
        setRackLocation('');
        setProductId(`PRD-${generateTransactionId().slice(4)}`);
      }
      setErrors({});
    }
  }, [open, editProduct, categories]);
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = 'Price must be a valid positive number';
    }
    
    if (!stock) {
      newErrors.stock = 'Stock is required';
    } else if (isNaN(Number(stock)) || !Number.isInteger(Number(stock))) {
      newErrors.stock = 'Stock must be a valid integer';
    }
    
    if (!category) {
      newErrors.category = 'Category is required';
    }
    
    if (!rackLocation.trim()) {
      newErrors.rackLocation = 'Rack location is required';
    }
    
    if (!productId.trim()) {
      newErrors.productId = 'Product ID is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const productData = {
      name,
      description,
      price: Number(price),
      stock: parseInt(stock),
      category,
      rackLocation
    };
    
    if (editProduct) {
      updateProduct({
        id: editProduct.id,
        ...productData
      });
    } else {
      addProduct(productData);
    }
    
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            Fill in the details for your product. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="productId">Product ID</Label>
            <Input
              id="productId"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="Enter product ID"
              className={errors.productId ? 'border-destructive' : ''}
              readOnly={!!editProduct}
            />
            {errors.productId && <p className="text-xs text-destructive mt-1">{errors.productId}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product description (optional)"
              className={errors.description ? 'border-destructive' : ''}
              rows={3}
            />
            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (Rp)</Label>
              <Input
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="10000"
                className={errors.price ? 'border-destructive' : ''}
                type="number"
                min="0"
                step="1"
              />
              {errors.price && <p className="text-xs text-destructive mt-1">{errors.price}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                value={stock}
                onChange={(e) => setStock(e.target.value.replace(/[^\d]/g, ''))}
                placeholder="10"
                className={errors.stock ? 'border-destructive' : ''}
                type="number"
                min="0"
                step="1"
              />
              {errors.stock && <p className="text-xs text-destructive mt-1">{errors.stock}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={setCategory}
              >
                <SelectTrigger id="category" className={errors.category ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-destructive mt-1">{errors.category}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rackLocation">Rack Location</Label>
              <Input
                id="rackLocation"
                value={rackLocation}
                onChange={(e) => setRackLocation(e.target.value)}
                placeholder="e.g., A3-B5"
                className={errors.rackLocation ? 'border-destructive' : ''}
              />
              {errors.rackLocation && <p className="text-xs text-destructive mt-1">{errors.rackLocation}</p>}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editProduct ? 'Update' : 'Add'} Product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductForm;
