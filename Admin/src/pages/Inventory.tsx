import { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { Plus, Edit, Trash2, Package, AlertTriangle, Search, Filter, Download, Eye } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { useToast } from "../hooks/use-toast";
import { ImageUploadZone } from "../components/ui/ImageUploadZone";

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  slot: string;
  image: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

interface OutletContext {
  machineId: string;
}

export const Inventory = () => {
  const { machineId } = useOutletContext<OutletContext>();
  const [inventory, setInventory] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  const [newProduct, setNewProduct] = useState<Omit<Product, "id" | "createdAt" | "updatedAt">>({
    name: "",
    price: 0,
    quantity: 0,
    category: "",
    slot: "",
    image: "/product_img/download.png",
    description: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!newProduct.name) newErrors.name = 'Product Name is required';
    if (newProduct.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (newProduct.quantity < 0) newErrors.quantity = 'Quantity cannot be negative';
    if (!newProduct.category) newErrors.category = 'Category is required';
    if (!newProduct.slot) newErrors.slot = 'Slot is required';
    if (!newProduct.image) newErrors.image = 'Product image is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://black-box-production.up.railway.app';
      const response = await fetch(`${apiUrl}/api/inventory`, {
        headers: {
          'X-Tenant-ID': machineId
        }
      });
      const data = await response.json();
      if (data.success) {
        setInventory(data.inventory || []);
      } else {
        setError(data.error || 'Failed to fetch inventory');
        setInventory([]);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch inventory');
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    // Removed WebSocket connection
    return () => {
      // Removed cleanup
    };
  }, [machineId]);

  const getStockStatus = (quantity: number) => {
    if (quantity <= 2) return { status: "Critical", variant: "destructive" as const };
    if (quantity <= 5) return { status: "Low", variant: "secondary" as const };
    return { status: "Good", variant: "default" as const };
  };

  const updateStock = async (id: string, newQuantity: number) => {
    try {
      const apiKey = import.meta.env.VITE_API_KEY || 'blackbox-api-key-2024';
      console.log('🔑 API Key being used:', apiKey);
      console.log('🔑 Environment VITE_API_KEY:', import.meta.env.VITE_API_KEY);
      const headers = { 
        'Content-Type': 'application/json',
        'X-Tenant-ID': machineId,
        'X-API-Key': apiKey
      };
      console.log('📡 Request headers:', headers);
      const apiUrl = import.meta.env.VITE_API_URL || 'https://black-box-production.up.railway.app';
      const res = await fetch(`${apiUrl}/api/inventory`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ id, quantity: newQuantity })
      });
      const data = await res.json();
      if (data.success) {
        // Refresh inventory to show updated stock
        fetchInventory();
        toast({
          title: "Stock Updated",
          description: `Stock updated to ${newQuantity} units`,
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update stock",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to update stock",
        variant: "destructive"
      });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://black-box-production.up.railway.app';
      const res = await fetch(`${apiUrl}/api/inventory`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'X-Tenant-ID': machineId,
          'X-API-Key': import.meta.env.VITE_API_KEY || 'blackbox-api-key-2024'
        },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        // Refresh inventory to remove deleted product from the list
        fetchInventory();
        toast({
          title: "Product Deleted",
          description: "Product removed from inventory",
        });
      } else {
        console.error('Delete failed:', data);
        toast({
          title: "Error",
          description: data.error || "Failed to delete product",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    }
  };

  const addProduct = async () => {
    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Please fill all required fields correctly",
        variant: "destructive"
      });
      return;
    }

    const payload = { ...newProduct };
    console.log('Add Product Payload:', payload);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://black-box-production.up.railway.app';
      const res = await fetch(`${apiUrl}/api/inventory`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Tenant-ID': machineId,
          'X-API-Key': import.meta.env.VITE_API_KEY || 'blackbox-api-key-2024'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      console.log('Add Product Response:', data);
      if (data.success) {
        setNewProduct({ name: "", price: 0, quantity: 0, category: "", slot: "", image: "/product_img/download.png", description: "" });
        setIsAddModalOpen(false);
        // Refresh inventory to show new product
        fetchInventory();
        toast({
          title: "Product Added",
          description: "New product added to inventory",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add product",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive"
      });
    }
  };

  const updateProduct = async () => {
    if (!editingProduct) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://black-box-production.up.railway.app';
      const res = await fetch(`${apiUrl}/api/inventory`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'X-Tenant-ID': machineId,
          'X-API-Key': import.meta.env.VITE_API_KEY || 'blackbox-api-key-2024'
        },
        body: JSON.stringify({
          id: editingProduct.id,
          name: editingProduct.name,
          price: editingProduct.price,
          category: editingProduct.category,
          slot: editingProduct.slot,
          description: editingProduct.description,
          image: editingProduct.image,
        })
      });
      const data = await res.json();
      if (data.success) {
        setEditingProduct(null);
        // Refresh inventory to show updated product
        fetchInventory();
        toast({
          title: "Product Updated",
          description: "Product details updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update product",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive"
      });
    }
  };

  // Filter and sort inventory
  const filteredInventory = inventory.filter(product => {
    const searchTermMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = categoryFilter === 'all' || product.category === categoryFilter;
    const stockMatch = stockFilter === 'all' || 
      (stockFilter === 'in-stock' && product.quantity > 0) ||
      (stockFilter === 'low-stock' && product.quantity > 0 && product.quantity <= 5) ||
      (stockFilter === 'out-of-stock' && product.quantity === 0);
    return searchTermMatch && categoryMatch && stockMatch;
  });

  const totalPages = Math.ceil(filteredInventory.length / pageSize);
  const pagedInventory = filteredInventory.slice((page - 1) * pageSize, page * pageSize);

  const lowStockCount = inventory.filter(item => item.quantity <= 5).length;
  const criticalStockCount = inventory.filter(item => item.quantity <= 2).length;
  const outOfStockCount = inventory.filter(item => item.quantity === 0).length;

  const exportToCSV = () => {
    const headers = ["ID", "Name", "Price", "Quantity", "Category", "Slot", "Description"];
    const csvContent = [
      headers.join(","),
      ...filteredInventory.map(product => [
        product.id,
        `"${product.name}"`,
        product.price,
        product.quantity,
        `"${product.category}"`,
        product.slot,
        `"${product.description}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory-export.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Add this helper function for image upload
  async function uploadProductImage(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("image", file);
    try {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://black-box-production.up.railway.app';
    const response = await fetch(`${apiUrl}/api/upload`, {
        method: "POST",
        headers: {
          'X-Tenant-ID': machineId,
          'X-API-Key': import.meta.env.VITE_API_KEY || 'blackbox-api-key-2024'
        },
        body: formData,
      });
      const data = await response.json();
      if (data.success && data.path) {
        return data.path;
      }
      return null;
    } catch {
      return null;
    }
  }

  // Helper to get full image URL
  const getImageUrl = (image: string) => {
    if (image.startsWith('http')) return image;
    return `${import.meta.env.VITE_API_URL || 'https://black-box-production.up.railway.app'}${image}`;
  };

  if (loading) return <div className="text-white">Loading inventory...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Inventory Management - {machineId}</h1>
          <p className="text-white/70">Manage product inventory and stock levels</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={exportToCSV} className="bg-white text-black hover:bg-white/80 shadow-glow">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white text-black hover:bg-white/80 shadow-glow">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg bg-black text-white border-white/20">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Form to add a new product to the inventory with image upload
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                addProduct();
              }} className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => {
                      setNewProduct(prev => ({ ...prev, name: e.target.value }));
                      setErrors(prev => ({ ...prev, name: '' }));
                    }}
                    className={`bg-black text-white border-white/20 ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Enter product name"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => {
                        setNewProduct(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }));
                        setErrors(prev => ({ ...prev, price: '' }));
                      }}
                      className={`bg-black text-white border-white/20 ${errors.price ? 'border-red-500' : ''}`}
                      placeholder="0.00"
                    />
                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                  </div>

                  <div>
                    <Label htmlFor="quantity">Current Stock *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      value={newProduct.quantity}
                      onChange={(e) => {
                        setNewProduct(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }));
                        setErrors(prev => ({ ...prev, quantity: '' }));
                      }}
                      className={`bg-black text-white border-white/20 ${errors.quantity ? 'border-red-500' : ''}`}
                      placeholder="0"
                    />
                    {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      value={newProduct.category}
                      onChange={(e) => {
                        setNewProduct(prev => ({ ...prev, category: e.target.value }));
                        setErrors(prev => ({ ...prev, category: '' }));
                      }}
                      className={`bg-black text-white border-white/20 ${errors.category ? 'border-red-500' : ''}`}
                      placeholder="Enter category"
                    />
                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                  </div>

                  <div>
                    <Label htmlFor="slot">Slot *</Label>
                    <Input
                      id="slot"
                      value={newProduct.slot}
                      onChange={(e) => {
                        setNewProduct(prev => ({ ...prev, slot: e.target.value }));
                        setErrors(prev => ({ ...prev, slot: '' }));
                      }}
                      className={`bg-black text-white border-white/20 ${errors.slot ? 'border-red-500' : ''}`}
                      placeholder="e.g. A1, B2"
                    />
                    {errors.slot && <p className="text-red-500 text-xs mt-1">{errors.slot}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-black px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-white/20"
                    placeholder="Enter product description"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="image">Product Image *</Label>
                  <ImageUploadZone
                    tenantId={machineId}
                    currentImage={newProduct.image}
                    onImageUpload={(path) => {
                      setNewProduct((prev) => ({ ...prev, image: path }));
                      setErrors(prev => ({ ...prev, image: '' }));
                    }}
                    maxSize={5}
                    className="mt-2"
                  />
                  {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Add Product</Button>
                  <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex-1">Cancel</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-black border-white/10 shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{inventory.length}</p>
            <p className="text-sm text-white/70">Unique products in inventory</p>
          </CardContent>
        </Card>
        <Card className="bg-black border-white/10 shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Total Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{inventory.reduce((sum, item) => sum + item.quantity, 0)}</p>
            <p className="text-sm text-white/70">Total items in stock</p>
          </CardContent>
        </Card>
        <Card className="bg-black border-white/10 shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{lowStockCount}</p>
            <p className="text-sm text-white/70">Items with ≤5 units</p>
          </CardContent>
        </Card>
        <Card className="bg-black border-white/10 shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-400">{criticalStockCount}</p>
            <p className="text-sm text-white/70">Items with ≤2 units</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-black border-white/10 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, description, or slot..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black text-white border-white/20 placeholder-white/50"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48 bg-black text-white border-white/20">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="bg-black text-white border-white/20">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Beverages">Beverages</SelectItem>
                <SelectItem value="Snacks">Snacks</SelectItem>
                <SelectItem value="Chocolates">Chocolates</SelectItem>
                <SelectItem value="Cookies">Cookies</SelectItem>
                <SelectItem value="Nuts">Nuts</SelectItem>
                <SelectItem value="Health">Health</SelectItem>
                <SelectItem value="Candies">Candies</SelectItem>
                <SelectItem value="Meat">Meat</SelectItem>
                <SelectItem value="Fruits">Fruits</SelectItem>
                <SelectItem value="Water">Water</SelectItem>
                <SelectItem value="Test">Test</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-48 bg-black text-white border-white/20">
                <SelectValue placeholder="Filter by stock" />
              </SelectTrigger>
              <SelectContent className="bg-black text-white border-white/20">
                <SelectItem value="all">All Stock Levels</SelectItem>
                <SelectItem value="low">Low Stock (≤5)</SelectItem>
                <SelectItem value="critical">Critical (≤2)</SelectItem>
                <SelectItem value="out">Out of Stock (0)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="bg-black border-white/10 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">
            Product Inventory ({filteredInventory.length} products)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-white/5 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-white/5 border-b border-white/5">
                  <TableHead className="font-semibold text-white border-r border-white/5">Product</TableHead>
                  <TableHead className="font-semibold text-white border-r border-white/5">Category</TableHead>
                  <TableHead className="font-semibold text-white border-r border-white/5">Slot</TableHead>
                  <TableHead className="font-semibold text-white border-r border-white/5">Stock</TableHead>
                  <TableHead className="font-semibold text-white border-r border-white/5">Price</TableHead>
                  <TableHead className="font-semibold text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-white/70">
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedInventory.map((product, index) => (
                    <TableRow 
                      key={product.id} 
                      className={`hover:bg-white/10 cursor-pointer border-b border-white/5 ${index % 2 === 0 ? 'bg-white/2' : 'bg-black'}`}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <TableCell className="font-medium text-white border-r border-white/5">
                        <div>
                          <div className="font-semibold">{product.name}</div>
                          <div className="text-sm text-white/60 truncate max-w-xs">{product.description}</div>
                          {product.image && (
                            <img src={getImageUrl(product.image)} alt={product.name} className="mt-1 w-12 h-12 object-cover border border-white/20 rounded" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-white/80 border-r border-white/5">{product.category}</TableCell>
                      <TableCell className="text-white/80 border-r border-white/5">{product.slot}</TableCell>
                      <TableCell className="border-r border-white/5">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${product.quantity <= 2 ? 'text-red-400' : product.quantity <= 5 ? 'text-yellow-400' : 'text-white'}`}>
                            {product.quantity}
                          </span>
                          <Badge variant={getStockStatus(product.quantity).variant} className={`capitalize text-white ${getStockStatus(product.quantity).variant === 'destructive' ? 'bg-red-900/50' : 'bg-black'} border-white/20`}>
                            {getStockStatus(product.quantity).status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-white border-r border-white/5">₹{product.price}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStock(product.id, product.quantity - 1);
                            }}
                            disabled={product.quantity === 0}
                            className="bg-black text-white border-white/20"
                          >
                            -1
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStock(product.id, product.quantity + 1);
                            }}
                            className="bg-black text-white border-white/20"
                          >
                            +1
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStock(product.id, 20);
                            }}
                            className="bg-black text-white border-white/20"
                          >
                            Refill
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingProduct(product);
                            }}
                            className="bg-black text-white border-white/20"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteProduct(product.id);
                            }}
                            className="bg-black text-white border-white/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <span className="text-white/70 text-xs">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="bg-black text-white border-white/20" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
              <Button size="sm" variant="outline" className="bg-black text-white border-white/20" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="sm:max-w-lg bg-black text-white border-white/20">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Form to edit an existing product in the inventory
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">              <div>
                <Label htmlFor="edit-name">Product Name</Label>
                <Input
                  id="edit-name"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="bg-black text-white border-white/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-price">Price (₹)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, price: Number(e.target.value) } : null)}
                    className="bg-black text-white border-white/20"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Input
                    id="edit-category"
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, category: e.target.value } : null)}
                    className="bg-black text-white border-white/20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-slot">Slot</Label>
                  <Input
                    id="edit-slot"
                    value={editingProduct.slot}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, slot: e.target.value } : null)}
                    className="bg-black text-white border-white/20"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-quantity">Current Stock</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    value={editingProduct.quantity}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, quantity: Number(e.target.value) } : null)}
                    className="bg-black text-white border-white/20"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="bg-black text-white border-white/20"
                />
              </div>
              <div>
                <Label htmlFor="edit-image">Product Image</Label>
                <ImageUploadZone
                  tenantId={machineId}
                  currentImage={editingProduct?.image}
                  onImageUpload={(path) => {
                    setEditingProduct((prev) => prev ? { ...prev, image: path } : null);
                  }}
                  maxSize={5}
                  className="mt-2"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={updateProduct} className="flex-1">Update Product</Button>
                <Button variant="outline" onClick={() => setEditingProduct(null)} className="flex-1">Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="sm:max-w-lg bg-black text-white border-white/20">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected product
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img 
                  src={getImageUrl(selectedProduct.image)} 
                  alt={selectedProduct.name}
                  className="w-16 h-16 object-cover rounded-lg border border-white/20"
                />
                <div>
                  <h3 className="text-lg font-semibold">{selectedProduct.name}</h3>
                  <p className="text-white/70">{selectedProduct.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold">Price:</span> ₹{selectedProduct.price}
                </div>
                <div>
                  <span className="font-semibold">Category:</span> {selectedProduct.category}
                </div>
                <div>
                  <span className="font-semibold">Slot:</span> {selectedProduct.slot}
                </div>
                <div>
                  <span className="font-semibold">Stock:</span> {selectedProduct.quantity} units
                </div>
              </div>
              {selectedProduct.createdAt && (
                <div>
                  <span className="font-semibold">Created:</span> {new Date(selectedProduct.createdAt).toLocaleDateString()}
                </div>
              )}
              {selectedProduct.updatedAt && (
                <div>
                  <span className="font-semibold">Last Updated:</span> {new Date(selectedProduct.updatedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};