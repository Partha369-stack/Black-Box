import { useState, useEffect } from "react";
import React from "react";
import { Save, Upload, Trash2, RefreshCw, Bot, CreditCard, Plus, Edit, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import { useToast } from "../hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";
import { Machine } from "../types";

export const Settings = () => {
  const [settings, setSettings] = useState({
    brandName: "VendSmart",
    machineId: "VM-001",
    location: "Main Building Lobby",
    contactInfo: "support@vendsmart.com",
    upiId: "vendsmart@okaxis",
    autoRestock: true,
    lowStockThreshold: 5,
    maintenanceMode: false,
    maxItemsPerTransaction: 10,
    sessionTimeout: 120,
  });

  const [machines, setMachines] = useState<Machine[]>([]);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [newMachine, setNewMachine] = useState({ id: '', name: '', url: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showMachineSettings, setShowMachineSettings] = useState(false);
  const [machineSettings, setMachineSettings] = useState<Record<string, any>>({});

  const { toast } = useToast();

  useEffect(() => {
    // Load machines from localStorage or API
    const storedMachines = localStorage.getItem('machines');
    if (storedMachines) {
      setMachines(JSON.parse(storedMachines));
    } else {
      // Default machines if none are stored
      const defaultMachines = [
        { id: 'VM-001', name: 'Machine 1', url: 'http://localhost:3001/api' },
        { id: 'VM-002', name: 'Machine 2', url: 'http://localhost:3001/api' }
      ];
      setMachines(defaultMachines);
      localStorage.setItem('machines', JSON.stringify(defaultMachines));
    }
    
    // Load machine settings
    const storedMachineSettings = localStorage.getItem('machineSettings');
    if (storedMachineSettings) {
      setMachineSettings(JSON.parse(storedMachineSettings));
    }
  }, []);

  useEffect(() => {
    // Save machines to localStorage whenever they change
    localStorage.setItem('machines', JSON.stringify(machines));
  }, [machines]);

  useEffect(() => {
    // Save machine settings to localStorage whenever they change
    localStorage.setItem('machineSettings', JSON.stringify(machineSettings));
  }, [machineSettings]);

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSwitchChange = (field: string) => (checked: boolean) => {
    setSettings(prev => ({ ...prev, [field]: checked }));
  };

  const handleMachineSettingChange = (machineId: string, field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setMachineSettings(prev => ({
      ...prev,
      [machineId]: {
        ...(prev[machineId] || {}),
        [field]: value
      }
    }));
  };

  const handleMachineSwitchChange = (machineId: string, field: string) => (checked: boolean) => {
    setMachineSettings(prev => ({
      ...prev,
      [machineId]: {
        ...(prev[machineId] || {}),
        [field]: checked
      }
    }));
  };

  const handleSaveSettings = () => {
    // Here you would typically save settings to a backend or local storage
    toast({
      title: "Settings Saved",
      description: "Your settings have been successfully updated.",
    });
  };

  const handleSaveMachineSettings = () => {
    toast({
      title: "Machine Settings Saved",
      description: `Settings for ${editingMachine?.name} have been updated.`,
    });
    setShowMachineSettings(false);
    setEditingMachine(null);
  };

  const addMachine = async () => {
    try {
      const response = await fetch('/api/machines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMachine)
      });
      
      if (response.ok) {
        setMachines([...machines, newMachine]);
        setNewMachine({ id: '', name: '', url: '' });
        setShowAddForm(false);
        toast({
          title: "Machine Added",
          description: `Machine ${newMachine.name} (${newMachine.id}) has been added successfully.`,
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to add machine:', error);
      toast({
        title: "Error",
        description: "Failed to add machine. Please try again.",
        variant: "destructive"
      });
    }
  };

  const removeMachine = async (machineId: string) => {
    try {
      const response = await fetch(`/api/machines/${machineId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setMachines(machines.filter(machine => machine.id !== machineId));
        toast({
          title: "Machine Removed",
          description: `Machine with ID ${machineId} has been removed.`
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to remove machine:', error);
      toast({
        title: "Error",
        description: "Failed to remove machine. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSave = () => {
    // Save settings logic here
    toast({
      title: "Settings Saved",
      description: "Your configuration has been updated successfully.",
    });
  };

  const handleReset = () => {
    // Reset to default settings
    setSettings({
      brandName: "VendSmart",
      machineId: "VM-001",
      location: "Main Building Lobby",
      contactInfo: "support@vendsmart.com",
      upiId: "vendsmart@okaxis",
      autoRestock: true,
      lowStockThreshold: 5,
      maintenanceMode: false,
      maxItemsPerTransaction: 10,
      sessionTimeout: 120,
    });
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
    });
  };

  const handleClearData = () => {
    toast({
      title: "Data Cleared",
      description: "All orders and transaction data have been cleared.",
      variant: "destructive"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Card className="bg-black border-white/10 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">General Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card className="bg-black border-white/10 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white flex items-center">
                  <Bot className="w-5 h-5 mr-2" />
                  Machine Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="brandName">Brand Name</Label>
                  <Input
                    id="brandName"
                    value={settings.brandName}
                    onChange={handleInputChange('brandName')}
                    placeholder="Enter brand name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="machineId">Machine ID</Label>
                  <Input
                    id="machineId"
                    value={settings.machineId}
                    onChange={handleInputChange('machineId')}
                    placeholder="Enter unique machine ID"
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={settings.location}
                    onChange={handleInputChange('location')}
                    placeholder="Enter machine location"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact">Contact Information</Label>
                  <Input
                    id="contact"
                    value={settings.contactInfo}
                    onChange={handleInputChange('contactInfo')}
                    placeholder="Enter contact email or phone"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Settings */}
            <Card className="bg-black border-white/10 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="upiId">UPI ID</Label>
                  <Input
                    id="upiId"
                    value={settings.upiId}
                    onChange={handleInputChange('upiId')}
                    placeholder="Enter UPI ID for payments"
                  />
                </div>
                
                <div>
                  <Label>QR Code Branding</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Logo
                    </Button>
                    <span className="text-sm text-white/70">
                      Upload your brand logo for QR code display
                    </span>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (seconds)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={handleInputChange('sessionTimeout')}
                    placeholder="120"
                  />
                </div>

                <div>
                  <Label htmlFor="maxItems">Max Items Per Transaction</Label>
                  <Input
                    id="maxItems"
                    type="number"
                    value={settings.maxItemsPerTransaction}
                    onChange={handleInputChange('maxItemsPerTransaction')}
                    placeholder="10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Operational Settings */}
            <Card className="bg-black border-white/10 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">
                  Operational Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Restock Alerts</Label>
                    <p className="text-sm text-white/70">
                      Automatically send alerts when stock is low
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoRestock}
                    onCheckedChange={handleSwitchChange('autoRestock')}
                  />
                </div>

                <div>
                  <Label htmlFor="threshold">Low Stock Threshold</Label>
                  <Input
                    id="threshold"
                    type="number"
                    value={settings.lowStockThreshold}
                    onChange={handleInputChange('lowStockThreshold')}
                    placeholder="5"
                  />
                  <p className="text-sm text-white/70 mt-1">
                    Send alerts when stock falls below this number
                  </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-white/70">
                      Temporarily disable the machine for maintenance
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={handleSwitchChange('maintenanceMode')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card className="bg-black border-white/10 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>System Backup</Label>
                  <p className="text-sm text-white/70 mb-2">
                    Download a backup of all system data and configuration
                  </p>
                  <Button variant="outline" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Download Backup
                  </Button>
                </div>

                <Separator />

                <div>
                  <Label>Reset Configuration</Label>
                  <p className="text-sm text-white/70 mb-2">
                    Reset all settings to factory defaults
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reset to Defaults
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reset Configuration</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will reset all settings to their default values. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div>
                  <Label>Clear All Data</Label>
                  <p className="text-sm text-white/70 mb-2">
                    Delete all orders, transactions, and user data
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full text-destructive border-destructive hover:bg-destructive hover:text-white">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All Data
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Clear All Data</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete all orders, transactions, and user data. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearData} className="bg-destructive hover:bg-destructive/90">
                          Clear Data
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Vending Machines */}
      <Card className="bg-black border-white/10 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Vending Machines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Registered Machines</h3>
            <Button variant="outline" onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
              {showAddForm ? 'Cancel' : 'Add Machine'}
            </Button>
          </div>
          
          {showAddForm && (
            <div className="border rounded-md p-4 space-y-3 mb-4">
              <h4 className="text-md font-medium">Add New Machine</h4>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="new-machine-id">Machine ID</Label>
                  <Input
                    id="new-machine-id"
                    value={newMachine.id}
                    onChange={(e) => setNewMachine({ ...newMachine, id: e.target.value })}
                    placeholder="VM-003"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-machine-name">Name</Label>
                  <Input
                    id="new-machine-name"
                    value={newMachine.name}
                    onChange={(e) => setNewMachine({ ...newMachine, name: e.target.value })}
                    placeholder="Machine 3"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-machine-url">API URL</Label>
                  <Input
                    id="new-machine-url"
                    value={newMachine.url}
                    onChange={(e) => setNewMachine({ ...newMachine, url: e.target.value })}
                    placeholder="http://localhost:3001/api"
                  />
                </div>
              </div>
              <Button onClick={addMachine} disabled={!newMachine.id || !newMachine.name || !newMachine.url}>
                <Plus className="mr-2 h-4 w-4" /> Add Machine
              </Button>
            </div>
          )}

          {machines.length === 0 ? (
            <div className="text-center py-6 border rounded-md bg-muted/50">
              <p className="text-muted-foreground">No machines registered. Add a machine to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {machines.map(machine => (
                <div key={machine.id} className="border rounded-md p-3 flex justify-between items-center bg-background hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium">{machine.name} ({machine.id})</p>
                    <p className="text-sm text-muted-foreground">{machine.url}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setEditingMachine(machine);
                        setShowMachineSettings(true);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" /> Edit Settings
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="mr-2 h-4 w-4" /> Remove
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove the machine {machine.name} ({machine.id}) from your dashboard. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => removeMachine(machine.id)}>
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Machine-Specific Settings */}
      <Card className="bg-black border-white/10 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Machine-Specific Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {showMachineSettings && editingMachine ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Settings for {editingMachine.name} ({editingMachine.id})</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="machine-location">Location</Label>
                  <Input
                    id="machine-location"
                    value={machineSettings[editingMachine.id]?.location || ''}
                    onChange={handleMachineSettingChange(editingMachine.id, 'location')}
                    placeholder="Enter machine location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    value={machineSettings[editingMachine.id]?.lowStockThreshold ?? 5}
                    onChange={handleMachineSettingChange(editingMachine.id, 'lowStockThreshold')}
                    placeholder="Enter low stock threshold"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxItemsPerTransaction">Max Items per Transaction</Label>
                  <Input
                    id="maxItemsPerTransaction"
                    type="number"
                    value={machineSettings[editingMachine.id]?.maxItemsPerTransaction ?? 10}
                    onChange={handleMachineSettingChange(editingMachine.id, 'maxItemsPerTransaction')}
                    placeholder="Enter max items per transaction"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (seconds)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={machineSettings[editingMachine.id]?.sessionTimeout ?? 120}
                    onChange={handleMachineSettingChange(editingMachine.id, 'sessionTimeout')}
                    placeholder="Enter session timeout"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenanceMode"
                  checked={machineSettings[editingMachine.id]?.maintenanceMode || false}
                  onCheckedChange={handleMachineSwitchChange(editingMachine.id, 'maintenanceMode')}
                />
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoRestock"
                  checked={machineSettings[editingMachine.id]?.autoRestock || false}
                  onCheckedChange={handleMachineSwitchChange(editingMachine.id, 'autoRestock')}
                />
                <Label htmlFor="autoRestock">Auto Restock Notifications</Label>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowMachineSettings(false)}>Cancel</Button>
                <Button onClick={handleSaveMachineSettings}>Save Machine Settings</Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 border rounded-md bg-muted/50">
              <p className="text-muted-foreground">Select a machine to edit its specific settings.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} className="bg-gradient-primary hover:bg-primary/90 shadow-glow">
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};