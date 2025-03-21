
import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { formatToRupiah, formatDate } from '../utils/formatters';
import { Edit, Trash2, MoreHorizontal, AlertTriangle } from 'lucide-react';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/utils/database';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit }) => {
  const { categories, deleteProduct } = useInventory();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  
  const category = categories.find(c => c.id === product.category);
  
  const handleDelete = () => {
    deleteProduct(product.id);
    setDeleteDialogOpen(false);
  };
  
  // Determine badge variant and text based on stock level
  const getBadgeInfo = () => {
    if (product.stock === 0) {
      return { variant: "destructive" as const, text: "Habis" };
    } else if (product.stock < 5) {
      return { variant: "destructive" as const, text: "Low Stock" };
    } else if (product.stock < 10) {
      return { variant: "warning" as const, text: "Low Stock" };
    } else {
      return { variant: "success" as const, text: "Tersedia" };
    }
  };
  
  const badgeInfo = getBadgeInfo();
  
  return (
    <>
      <tr className="border-b hover:bg-muted/50 transition-colors">
        <td className="p-3 text-left">{product.name}</td>
        <td className="p-3 text-left">{category?.name || 'Uncategorized'}</td>
        <td className="p-3 text-left font-medium">{formatToRupiah(product.price)}</td>
        <td className="p-3 text-center">{product.stock}</td>
        <td className="p-3 text-center">{product.sku}</td>
        <td className="p-3 text-center">{product.rackLocation || 'N/A'}</td>
        <td className="p-3 text-center">
          <Badge variant={badgeInfo.variant}>
            {badgeInfo.text}
          </Badge>
        </td>
        <td className="p-3 text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(product)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="animate-fade-in">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-destructive">
              <AlertTriangle className="h-5 w-5 mr-2 animate-pulse" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">{product.name}</span>?
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
    </>
  );
};

export default ProductCard;
