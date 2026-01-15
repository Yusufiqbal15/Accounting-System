import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Progress } from './ui/progress';
import { Plus, Calendar, User, CheckCircle2, Clock, AlertCircle, PlayCircle, Search } from 'lucide-react';
import { mockWorkOrders } from '../mockData';
import type { WorkOrderStatus, WorkOrder } from '../types';
import { toast } from 'sonner';

export function WorkOrders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<WorkOrderStatus | 'all'>('all');
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(mockWorkOrders);
  const [showAddWO, setShowAddWO] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    quantity: '',
    assignedTechnician: '',
    dueDate: ''
  });

  const handleAddWorkOrder = () => {
    if (!formData.productName || !formData.quantity || !formData.assignedTechnician || !formData.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newWO: WorkOrder = {
      id: `WO${Date.now()}`,
      productName: formData.productName,
      bomId: `BOM-${Date.now()}`,
      quantity: parseFloat(formData.quantity),
      assignedTechnician: formData.assignedTechnician,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: formData.dueDate,
      status: 'pending',
      progress: 0
    };

    setWorkOrders([...workOrders, newWO]);
    setFormData({ productName: '', quantity: '', assignedTechnician: '', dueDate: '' });
    setShowAddWO(false);
    toast.success('Work order created successfully!');
  };

  const getStatusBadge = (status: WorkOrderStatus) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-gray-500">Pending</Badge>;
      case 'wip':
        return <Badge className="bg-blue-600">Work in Progress</Badge>;
      case 'quality_check':
        return <Badge className="bg-amber-500">Quality Check</Badge>;
      case 'completed':
        return <Badge className="bg-green-600">Completed</Badge>;
    }
  };

  const getStatusIcon = (status: WorkOrderStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-500" />;
      case 'wip':
        return <PlayCircle className="h-5 w-5 text-blue-600" />;
      case 'quality_check':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    }
  };

  // Filter work orders
  const filteredWorkOrders = workOrders.filter(wo => {
    const matchesSearch = wo.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         wo.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         wo.assignedTechnician.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || wo.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const inProgress = filteredWorkOrders.filter(wo => wo.status === 'wip' || wo.status === 'quality_check');
  const completed = filteredWorkOrders.filter(wo => wo.status === 'completed');
  const pending = filteredWorkOrders.filter(wo => wo.status === 'pending');

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Work Orders</h1>
          <p className="text-muted-foreground mt-1">Production workflow tracking</p>
        </div>
        <Dialog open={showAddWO} onOpenChange={setShowAddWO}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Work Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Work Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Product Name *</Label>
                <Input
                  placeholder="Enter product name"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Assigned Technician *</Label>
                <Input
                  placeholder="Enter technician name"
                  value={formData.assignedTechnician}
                  onChange={(e) => setFormData({ ...formData, assignedTechnician: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    placeholder="Enter quantity"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Date *</Label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowAddWO(false)}>Cancel</Button>
                <Button className="bg-blue-900 hover:bg-blue-800" onClick={handleAddWorkOrder}>Create Work Order</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-gray-500">
          <CardHeader>
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{pending.length}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader>
            <CardTitle className="text-sm">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{inProgress.length}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-600">
          <CardHeader>
            <CardTitle className="text-sm">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{completed.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-xs">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by product, WO ID, or technician..."
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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="wip">Work in Progress</SelectItem>
            <SelectItem value="quality_check">Quality Check</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Work Order List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">All Work Orders ({filteredWorkOrders.length})</h2>
        {filteredWorkOrders.length > 0 ? (
          filteredWorkOrders.map((wo) => (
          <Card key={wo.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Status Icon */}
                <div className="lg:col-span-1 flex lg:items-center justify-center">
                  {getStatusIcon(wo.status)}
                </div>

                {/* Work Order Info */}
                <div className="lg:col-span-5 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{wo.productName}</h3>
                    {getStatusBadge(wo.status)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">WO ID:</span>
                    <span>{wo.id}</span>
                    <span>•</span>
                    <span className="font-medium">BOM:</span>
                    <span>{wo.bomId}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Assigned to:</span>
                    <span className="font-medium">{wo.assignedTechnician}</span>
                  </div>
                </div>

                {/* Dates */}
                <div className="lg:col-span-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Start:</span>
                    <span className="font-medium">{new Date(wo.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Due:</span>
                    <span className="font-medium">{new Date(wo.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Quantity:</span>
                    <span className="font-semibold ml-2">{wo.quantity} units</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="lg:col-span-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className="text-sm font-semibold">{wo.progress}%</span>
                  </div>
                  <Progress value={wo.progress} className="h-2" />
                  {wo.status === 'completed' && (
                    <div className="flex items-center gap-2 text-sm text-green-600 mt-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Moved to Finished Goods</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Flow */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between max-w-2xl mx-auto">
                  <div className={`flex flex-col items-center ${wo.progress >= 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${wo.progress >= 0 ? 'bg-green-600' : 'bg-gray-300'}`}>
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs mt-1">Pending</span>
                  </div>
                  <div className={`flex-1 h-1 mx-2 ${wo.progress >= 25 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                  <div className={`flex flex-col items-center ${wo.progress >= 25 ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${wo.progress >= 25 ? 'bg-blue-600' : 'bg-gray-300'}`}>
                      <PlayCircle className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs mt-1">WIP</span>
                  </div>
                  <div className={`flex-1 h-1 mx-2 ${wo.progress >= 75 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                  <div className={`flex flex-col items-center ${wo.progress >= 75 ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${wo.progress >= 75 ? 'bg-amber-500' : 'bg-gray-300'}`}>
                      <AlertCircle className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs mt-1">QC</span>
                  </div>
                  <div className={`flex-1 h-1 mx-2 ${wo.progress === 100 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                  <div className={`flex flex-col items-center ${wo.progress === 100 ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${wo.progress === 100 ? 'bg-green-600' : 'bg-gray-300'}`}>
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs mt-1">Completed</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No work orders found matching your search
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
