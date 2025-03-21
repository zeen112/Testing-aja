
import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { formatToRupiah } from '../utils/formatters';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Plus, Database, Tags, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AddProductForm from '@/components/AddProductForm';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#a4de6c'];

const Index: React.FC = () => {
  const { products, categories, loading } = useInventory();
  const [addProductOpen, setAddProductOpen] = useState(false);
  
  // Calculate dashboard metrics
  const totalProducts = products.length;
  const totalCategories = categories.length;
  const totalStock = products.reduce((acc, product) => acc + product.stock, 0);
  const totalValue = products.reduce((acc, product) => acc + (product.price * product.stock), 0);
  
  // Prepare chart data
  const categoryData = categories.map(category => {
    const productCount = products.filter(p => p.category === category.id).length;
    return {
      name: category.name,
      count: productCount
    };
  }).filter(item => item.count > 0);
  
  const stockData = products
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5)
    .map(product => ({
      name: product.name.length > 15 ? `${product.name.slice(0, 15)}...` : product.name,
      stock: product.stock
    }));
  
  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground mt-1">Overview of your inventory</p>
        </div>
        
        <Button onClick={() => setAddProductOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock} units</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inventory Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatToRupiah(totalValue)}</div>
          </CardContent>
        </Card>
      </div>
      
      {products.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Welcome to your Inventory System!</CardTitle>
            <CardDescription>
              Get started by adding products and categories to your inventory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <Link to="/products">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2 items-center justify-center">
                  <Database className="h-6 w-6" />
                  <span>Manage Products</span>
                </Button>
              </Link>
              
              <Link to="/categories">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2 items-center justify-center">
                  <Tags className="h-6 w-6" />
                  <span>Manage Categories</span>
                </Button>
              </Link>
              
              <Link to="/settings">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2 items-center justify-center">
                  <Settings className="h-6 w-6" />
                  <span>Settings</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Stock by Product (Top 5)</CardTitle>
              <CardDescription>
                Products with the highest stock levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stockData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={70}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} units`, 'Stock']} />
                    <Bar dataKey="stock" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Products by Category</CardTitle>
              <CardDescription>
                Distribution of products across categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => [`${value} products`, props.payload.name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your inventory is being tracked locally
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Database className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Database Initialized</p>
                    <p className="text-xs text-muted-foreground">
                      Local storage database has been set up successfully
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Tags className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Default Category Created</p>
                    <p className="text-xs text-muted-foreground">
                      'Uncategorized' category has been created
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <AddProductForm 
        open={addProductOpen} 
        onOpenChange={setAddProductOpen}
      />
    </div>
  );
};

export default Index;
