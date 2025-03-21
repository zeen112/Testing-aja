
import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { exportToExcel } from '@/utils/database';
import { Upload, Sun, Moon, Laptop } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Settings: React.FC = () => {
  const { darkMode, themeMode, setThemeMode } = useInventory();
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Settings</h2>
        <p className="text-muted-foreground mt-1">Configure your inventory system</p>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="theme-select">Theme</Label>
              <Select 
                value={themeMode} 
                onValueChange={(value) => setThemeMode(value as 'dark' | 'light' | 'system')}
              >
                <SelectTrigger id="theme-select" className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center">
                      <Sun className="mr-2 h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center">
                      <Moon className="mr-2 h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center">
                      <Laptop className="mr-2 h-4 w-4" />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Choose between light, dark, or use your system preference
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Quick Toggle</Label>
                <p className="text-sm text-muted-foreground">
                  Quickly toggle between light and dark theme
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4 text-muted-foreground" />
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={() => setThemeMode(darkMode ? 'light' : 'dark')}
                />
                <Moon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Export and manage your inventory data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label>Export Data</Label>
                <p className="text-sm text-muted-foreground">
                  Export your inventory data to Excel format
                </p>
              </div>
              <Button onClick={exportToExcel}>
                <Upload className="mr-2 h-4 w-4" />
                Export to Excel
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>Information about this application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              Inventory Management System v1.0
            </p>
            <p className="text-sm text-muted-foreground">
              A local browser-based inventory system with automatic database creation.
              All data is stored locally in your browser.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
