'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Mail, Phone, MapPin, ShoppingCart, Search, Trash2 } from 'lucide-react';
import { mockSuppliers } from '../mockData';
import type { Supplier } from '../types';
import { toast } from 'sonner';

export function SupplierManagement() {
  const { t } = useTranslation();
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'due' | 'paid'>('all');
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    address: ''
  });

  const handleAddSupplier = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error(t('accounting.fillAllFields'));
      return;
    }

    const newSupplier: Supplier = {
      id: `SUP-${Date.now()}`,
      name: formData.name,
      contact: formData.contact,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      outstandingPayable: 0,
      totalPurchases: 0
    };

    setSuppliers([...suppliers, newSupplier]);
    setFormData({ name: '', contact: '', email: '', phone: '', address: '' });
    setShowAddSupplier(false);
    toast.success(t('suppliers.supplierAddedSuccessfully'));
  };

  const handleDeleteSupplier = (id: string) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
    toast.success(t('suppliers.supplierDeletedSuccessfully'));
  };

  // Filter suppliers
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'due' && supplier.outstandingPayable > 0) ||
                         (filterStatus === 'paid' && supplier.outstandingPayable === 0);
    return matchesSearch && matchesStatus;
  });
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">{t('suppliers.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('suppliers.title')}</p>
        </div>
        <Dialog open={showAddSupplier} onOpenChange={setShowAddSupplier}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              {t('suppliersModule.addNewSupplier')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('suppliersModule.addNewSupplier')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Supplier Name *</Label>
                <Input
                  placeholder="Enter supplier name"
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
                <Button variant="outline" onClick={() => setShowAddSupplier(false)}>{t('common.cancel')}</Button>
                <Button className="bg-blue-900 hover:bg-blue-800" onClick={handleAddSupplier}>{t('suppliers.addSupplier')}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-900">
          <CardHeader>
            <CardTitle className="text-sm">{t('suppliersModule.totalSuppliers')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{suppliers.length}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-600">
          <CardHeader>
            <CardTitle className="text-sm">{t('suppliersModule.totalPurchases')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              AED {suppliers.reduce((sum, s) => sum + s.totalPurchases, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="text-sm">Outstanding Payables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-red-600">
              AED {suppliers.reduce((sum, s) => sum + s.outstandingPayable, 0).toLocaleString()}
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
            <SelectItem value="all">All Suppliers</SelectItem>
            <SelectItem value="due">Payment Due</SelectItem>
            <SelectItem value="paid">All Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Supplier List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Supplier Profiles ({filteredSuppliers.length})</h2>
        {filteredSuppliers.length > 0 ? (
          filteredSuppliers.map((supplier) => (
          <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <CardTitle className="text-xl">{supplier.name}</CardTitle>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{supplier.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{supplier.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{supplier.address}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Supplier ID</p>
                    <p className="text-lg font-semibold">{supplier.id}</p>
                  </div>
                  {supplier.outstandingPayable > 0 ? (
                    <Badge className="bg-red-500">Payment Due</Badge>
                  ) : (
                    <Badge className="bg-green-600">All Paid</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ShoppingCart className="h-4 w-4" />
                    <span className="text-sm">Total Purchases</span>
                  </div>
                  <p className="text-xl font-semibold">
                    AED {supplier.totalPurchases.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Outstanding Payable</p>
                  <p className={`text-xl font-semibold ${supplier.outstandingPayable > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    AED {supplier.outstandingPayable.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Contact Person</p>
                  <p className="text-base font-medium">{supplier.contact}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" size="sm">Purchase History</Button>
                <Button variant="outline" size="sm">Payment Schedule</Button>
                <Button variant="outline" size="sm">Edit Profile</Button>
                {supplier.outstandingPayable > 0 && (
                  <Button size="sm" className="bg-blue-900 hover:bg-blue-800">
                    Make Payment
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteSupplier(supplier.id)}
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
              No suppliers found matching your search
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
