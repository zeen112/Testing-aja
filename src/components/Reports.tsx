import React, { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatToRupiah } from "../utils/formatters";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const Reports = () => {
  const { products, categories, suppliers } = useInventory();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Calculate summary statistics
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
    const outOfStock = products.filter(product => product.stock === 0).length;
    const lowStock = products.filter(product => product.stock > 0 && product.stock <= 5).length;
    
    return {
      totalProducts,
      totalCategories: categories.length,
      totalSuppliers: suppliers.length,
      totalStock,
      totalValue,
      outOfStock,
      lowStock
    };
  }, [products, categories, suppliers]);
  
  // Prepare data for category distribution chart
  const categoryChartData = useMemo(() => {
    const catCounts = {};
    
    // Count products in each category
    products.forEach(product => {
      const categoryId = product.category;
      if (!catCounts[categoryId]) {
        catCounts[categoryId] = 0;
      }
      catCounts[categoryId]++;
    });
    
    // Convert to chart data format
    return Object.entries(catCounts).map(([categoryId, count]) => {
      const category = categories.find(cat => cat.id === categoryId);
      return {
        name: category ? category.name : 'Unknown',
        value: count
      };
    });
  }, [products, categories]);
  
  // Prepare data for stock value by category chart
  const categoryValueData = useMemo(() => {
    const catValues = {};
    
    // Sum product values in each category
    products.forEach(product => {
      const categoryId = product.category;
      if (!catValues[categoryId]) {
        catValues[categoryId] = 0;
      }
      catValues[categoryId] += product.price * product.stock;
    });
    
    // Convert to chart data format
    return Object.entries(catValues).map(([categoryId, value]) => {
      const category = categories.find(cat => cat.id === categoryId);
      return {
        name: category ? category.name : 'Unknown',
        value: value as number
      };
    });
  }, [products, categories]);
  
  // Prepare data for top products by value chart
  const topProductsData = useMemo(() => {
    return [...products]
      .map(product => ({
        name: product.name,
        value: product.price * product.stock
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [products]);
  
  // Prepare data for stock status chart
  const stockStatusData = useMemo(() => {
    const outOfStock = products.filter(p => p.stock === 0).length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length;
    const healthyStock = products.filter(p => p.stock > 5).length;
    
    return [
      { name: 'Out of Stock', value: outOfStock },
      { name: 'Low Stock', value: lowStock },
      { name: 'Healthy Stock', value: healthyStock }
    ];
  }, [products]);
  
  // Prepare data for top 5 most stocked products
  const topStockedProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 5)
      .map(product => ({
        name: product.name,
        value: product.stock
      }));
  }, [products]);
  
  // Colors for pie charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9C27B0', '#673AB7'];
  
  // Prepare custom Recharts tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-background p-2 border rounded-md shadow-md">
          <p className="label text-sm font-medium">{`${payload[0].name || label}`}</p>
          <p className="value text-sm">
            {payload[0].value.toLocaleString()}
            {payload[0].unit}
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Format ticks for value charts - ensure string return type
  const formatYAxisTick = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };
  
  // Format value tooltips for currency
  const currencyFormatter = (value: number): string => {
    return formatToRupiah(value);
  };

  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">View and analyze your inventory data</p>
          </div>
          <TabsList className="mt-4 md:mt-0">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>
        </div>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Total Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalProducts}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Inventory Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatToRupiah(stats.totalValue)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Total Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalStock.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Out of Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">{stats.outOfStock}</div>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts - Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock Status Distribution */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Stock Status Distribution</CardTitle>
                <CardDescription>Distribution of products by stock status</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stockStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={(entry) => entry.name}
                    >
                      {stockStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Category Distribution */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Number of products in each category</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryChartData}
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#8884d8" name="Products" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts - Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 5 Products by Value */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Top 5 Products by Value</CardTitle>
                <CardDescription>Products with highest inventory value</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topProductsData}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={formatYAxisTick} />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip 
                      formatter={currencyFormatter}
                      labelFormatter={(label) => "Value"} 
                    />
                    <Bar dataKey="value" fill="#82ca9d" name="Value" unit=" Rp" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Top 5 Most Stocked Products */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Top 5 Most Stocked Products</CardTitle>
                <CardDescription>Products with highest stock quantities</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topStockedProducts}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#8884d8" name="Quantity" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Product Count */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Products per Category</CardTitle>
                <CardDescription>Number of products in each category</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={(entry) => entry.name}
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Category Value Distribution */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Inventory Value by Category</CardTitle>
                <CardDescription>Total value of products in each category</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryValueData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={(entry) => entry.name}
                    >
                      {categoryValueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={currencyFormatter}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Category Inventory Value</CardTitle>
              <CardDescription>Total value of inventory in each category</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryValueData}
                  margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={formatYAxisTick} />
                  <Tooltip 
                    formatter={currencyFormatter}
                    labelFormatter={(label) => `Category: ${label}`} 
                  />
                  <Bar dataKey="value" fill="#8884d8" name="Value" unit=" Rp" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products by Value */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Top Products by Value</CardTitle>
                <CardDescription>Products with highest inventory value</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topProductsData}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={formatYAxisTick} />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip 
                      formatter={currencyFormatter}
                      labelFormatter={(label) => "Value"} 
                    />
                    <Bar dataKey="value" fill="#82ca9d" name="Value" unit=" Rp" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Top Stocked Products */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Top Stocked Products</CardTitle>
                <CardDescription>Products with highest stock quantities</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topStockedProducts}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#8884d8" name="Quantity" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Stock Status Overview</CardTitle>
              <CardDescription>Distribution of products by stock level</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={(entry) => entry.name}
                  >
                    {stockStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
