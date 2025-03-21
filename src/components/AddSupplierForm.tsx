
import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Supplier } from '@/utils/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AddSupplierFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editSupplier?: Supplier;
}

const AddSupplierForm: React.FC<AddSupplierFormProps> = ({ 
  open, 
  onOpenChange,
  editSupplier
}) => {
  const { addSupplier, updateSupplier, deleteSupplier } = useInventory();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Reset form when dialog opens/closes or editSupplier changes
  useEffect(() => {
    if (open) {
      if (editSupplier) {
        setName(editSupplier.name);
        setEmail(editSupplier.email);
        setPhone(editSupplier.phone);
        setAddress(editSupplier.address);
      } else {
        setName('');
        setEmail('');
        setPhone('');
        setAddress('');
      }
      setErrors({});
    }
  }, [open, editSupplier]);
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const supplierData = {
      name,
      email,
      phone,
      address
    };
    
    if (editSupplier) {
      updateSupplier({
        id: editSupplier.id,
        ...supplierData
      });
    } else {
      addSupplier(supplierData);
    }
    
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (editSupplier && window.confirm('Are you sure you want to delete this supplier?')) {
      deleteSupplier(editSupplier.id);
      onOpenChange(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editSupplier ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
          <DialogDescription>
            Fill in the details for your supplier. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Supplier Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter supplier name"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="supplier@example.com"
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter supplier address"
              className={errors.address ? 'border-destructive' : ''}
              rows={3}
            />
            {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            {editSupplier && (
              <Button type="button" variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editSupplier ? 'Update' : 'Add'} Supplier
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSupplierForm;
