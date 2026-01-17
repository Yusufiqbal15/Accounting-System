import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Mail, Phone, MapPin, TrendingUp, Wrench, Search, Trash2 } from 'lucide-react';
import type { Customer } from '../types';
import { toast } from 'sonner';

interface CustomerManagementProps {
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
}

export function CustomerManagement({ customers, setCustomers }: CustomerManagementProps) {
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'outstanding' | 'clear'>('all');
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    address: ''
  });

  const handleAddCustomer = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newCustomer: Customer = {
      id: `CUST-${Date.now()}`,
      name: formData.name,
      contact: formData.contact,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      outstandingBalance: 0,
      totalSales: 0,
      totalRepairs: 0
    };

    setCustomers([...customers, newCustomer]);
    setFormData({ name: '', contact: '', email: '', phone: '', address: '' });
    setShowAddCustomer(false);
    toast.success('Customer added successfully!');
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
    toast.success('Customer deleted successfully!');
  };

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'outstanding' && customer.outstandingBalance > 0) ||
                         (filterStatus === 'clear' && customer.outstandingBalance === 0);
    return matchesSearch && matchesStatus;
  });
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Customer Management (CRM)</h1>
          <p className="text-muted-foreground mt-1">Manage customer relationships and transactions</p>
        </div>
        <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Customer Name *</Label>
                <Input
                  placeholder="Enter customer name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input
                  placeholder="Enter contact person name"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowAddCustomer(false)}>Cancel</Button>
                <Button className="bg-blue-900 hover:bg-blue-800" onClick={handleAddCustomer}>Add Customer</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-900">
          <CardHeader>
            <CardTitle className="text-sm">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{customers.length}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-600">
          <CardHeader>
            <CardTitle className="text-sm">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600">
              AED {customers.reduce((sum, c) => sum + c.totalSales, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="text-sm">Outstanding Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-orange-600">
              AED {customers.reduce((sum, c) => sum + c.outstandingBalance, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader>
            <CardTitle className="text-sm">Total Repairs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {customers.reduce((sum, c) => sum + c.totalRepairs, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-xs">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterStatus} onValueChange={(val: any) => setFilterStatus(val)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            <SelectItem value="outstanding">Outstanding Payment</SelectItem>
            <SelectItem value="clear">No Outstanding</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Customer List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Customer Profiles ({filteredCustomers.length})</h2>
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <CardTitle className="text-xl">{customer.name}</CardTitle>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{customer.address}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Customer ID</p>
                    <p className="text-lg font-semibold">{customer.id}</p>
                  </div>
                  {customer.outstandingBalance > 0 && (
                    <Badge className="bg-orange-500">Outstanding Payment</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">Total Sales</span>
                  </div>
                  <p className="text-xl font-semibold text-green-600">
                    AED {customer.totalSales.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Wrench className="h-4 w-4" />
                    <span className="text-sm">Total Repairs</span>
                  </div>
                  <p className="text-xl font-semibold text-blue-600">{customer.totalRepairs}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                  <p className="text-xl font-semibold text-orange-600">
                    AED {customer.outstandingBalance.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Contact Person</p>
                  <p className="text-base font-medium">{customer.contact}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" size="sm">View Transactions</Button>
                <Button variant="outline" size="sm">Payment History</Button>
                <Button variant="outline" size="sm">Edit Profile</Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteCustomer(customer.id)}
                  className="text-red-500 hover:text-red-700 ml-auto"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No customers found matching your search
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
