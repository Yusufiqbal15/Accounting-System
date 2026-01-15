import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Wrench, User, Search } from 'lucide-react';
import { mockRepairs } from '../mockData';
import type { PaymentStatus, RepairService } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner';

export function RepairMaintenance() {
  const [repairs, setRepairs] = useState<RepairService[]>(mockRepairs);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'all'>('all');
  const [showAddRepair, setShowAddRepair] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    instrument: '',
    issueDescription: '',
    laborCharges: '',
    technicianAssigned: ''
  });

  const handleAddRepair = () => {
    if (!formData.customerName || !formData.instrument || !formData.issueDescription || !formData.laborCharges || !formData.technicianAssigned) {
      toast.error('Please fill in all required fields');
      return;
    }

    const laborCost = parseFloat(formData.laborCharges);
    const subtotal = laborCost;
    const vat = subtotal * 0.05;
    const total = subtotal + vat;

    const newRepair: RepairService = {
      id: `REP${Date.now()}`,
      invoiceNumber: `INV-${Date.now()}`,
      customerId: `CUST-${Date.now()}`,
      customerName: formData.customerName,
      instrument: formData.instrument,
      issueDescription: formData.issueDescription,
      spareParts: [],
      laborCharges: laborCost,
      technicianAssigned: formData.technicianAssigned,
      subtotal: subtotal,
      vatAmount: vat,
      total: total,
      paymentStatus: 'pending',
      date: new Date().toISOString()
    };

    setRepairs([...repairs, newRepair]);
    setFormData({ customerName: '', instrument: '', issueDescription: '', laborCharges: '', technicianAssigned: '' });
    setShowAddRepair(false);
    toast.success('Repair service added successfully!');
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-600">Paid</Badge>;
      case 'partial':
        return <Badge className="bg-amber-500">Partial</Badge>;
      case 'pending':
        return <Badge className="bg-orange-500">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500">Overdue</Badge>;
    }
  };

  // Filter repairs
  const filteredRepairs = repairs.filter(repair => {
    const matchesSearch = repair.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         repair.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         repair.instrument.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || repair.paymentStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Repairs & Maintenance</h1>
          <p className="text-muted-foreground mt-1">Service tracking with spare parts management</p>
        </div>
        <Dialog open={showAddRepair} onOpenChange={setShowAddRepair}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              New Service Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Service Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    placeholder="Customer name"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instrument">Instrument *</Label>
                  <Input
                    id="instrument"
                    placeholder="Instrument type"
                    value={formData.instrument}
                    onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="issue">Issue Description *</Label>
                <textarea
                  id="issue"
                  placeholder="Describe the issue"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.issueDescription}
                  onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="laborCharges">Labor Charges (AED) *</Label>
                  <Input
                    id="laborCharges"
                    type="number"
                    placeholder="0.00"
                    value={formData.laborCharges}
                    onChange={(e) => setFormData({ ...formData, laborCharges: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="technician">Technician Assigned *</Label>
                  <Input
                    id="technician"
                    placeholder="Technician name"
                    value={formData.technicianAssigned}
                    onChange={(e) => setFormData({ ...formData, technicianAssigned: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleAddRepair} className="w-full bg-blue-600 hover:bg-blue-700">
                Create Service Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-900">
          <CardHeader>
            <CardTitle className="text-sm">Total Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{repairs.length}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-600">
          <CardHeader>
            <CardTitle className="text-sm">Service Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600">
              AED {repairs.reduce((sum, r) => sum + r.total, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader>
            <CardTitle className="text-sm">Spare Parts Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {repairs.reduce((sum, r) => sum + r.spareParts.length, 0)} items
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
              placeholder="Search by customer, invoice, or instrument..."
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
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Service Records */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Service Records ({filteredRepairs.length})</h2>
        {filteredRepairs.length > 0 ? (
          filteredRepairs.map((repair) => (
          <Card key={repair.id}>
            <CardHeader className="bg-blue-50">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Wrench className="h-5 w-5 text-blue-900" />
                    <CardTitle>{repair.invoiceNumber}</CardTitle>
                    {getPaymentBadge(repair.paymentStatus)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Customer: <strong>{repair.customerName}</strong></span>
                    <span>•</span>
                    <span>Date: {new Date(repair.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold text-green-900">AED {repair.total.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Total Charges</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Service Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Instrument</h4>
                  <p className="text-base font-medium">{repair.instrument}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Technician Assigned</h4>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base font-medium">{repair.technicianAssigned}</p>
                  </div>
                </div>
              </div>

              {/* Issue Description */}
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Issue Description</h4>
                <p className="text-base bg-muted/30 p-3 rounded">{repair.issueDescription}</p>
              </div>

              {/* Spare Parts Used */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Spare Parts Used (Auto-deducted from Inventory)</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Part Code</TableHead>
                      <TableHead>Part Name</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Cost (AED)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {repair.spareParts.map((part, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{part.itemId}</TableCell>
                        <TableCell>{part.itemName}</TableCell>
                        <TableCell className="text-right">{part.quantity}</TableCell>
                        <TableCell className="text-right">{part.cost.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Cost Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Spare Parts Cost</span>
                      <span className="text-lg font-semibold">
                        AED {repair.spareParts.reduce((sum, p) => sum + p.cost, 0).toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Labor Charges</span>
                      <span className="text-lg font-semibold">AED {repair.laborCharges.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Invoice Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-semibold">AED {repair.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">VAT (5%):</span>
                  <span className="font-semibold">AED {repair.vatAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg pt-2 border-t">
                  <span className="font-semibold">Total:</span>
                  <span className="font-semibold text-green-900">AED {repair.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="outline">Generate Service Invoice</Button>
                <Button variant="outline">Print</Button>
              </div>
            </CardContent>
          </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No repair services found matching your search
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
