'use client';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Package, Users, Zap, Search } from 'lucide-react';
import { mockBOMs } from '../mockData';
import type { BOM } from '../types';
import { toast } from 'sonner';

export function ProductionBOM() {
  const { t, i18n } = useTranslation();
  const [boms, setBOMs] = useState<BOM[]>(mockBOMs);
  const [showAddBOM, setShowAddBOM] = useState(false);

  React.useEffect(() => {
    // Force re-render when language changes
  }, [i18n.language]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    productName: '',
    laborCost: '',
    overheadCost: ''
  });

  const handleAddBOM = () => {
    if (!formData.productName || !formData.laborCost || !formData.overheadCost) {
      toast.error(t('accounting.fillAllFields'));
      return;
    }

    const newBOM: BOM = {
      id: `BOM${Date.now()}`,
      productName: formData.productName,
      rawMaterials: [],
      laborCost: parseFloat(formData.laborCost),
      overheadCost: parseFloat(formData.overheadCost),
      totalProductionCost: parseFloat(formData.laborCost) + parseFloat(formData.overheadCost),
      costPerUnit: parseFloat(formData.laborCost) + parseFloat(formData.overheadCost)
    };

    setBOMs([...boms, newBOM]);
    setFormData({ productName: '', laborCost: '', overheadCost: '' });
    setShowAddBOM(false);
    toast.success(t('messages.bomCreatedSuccessfully'));
  };

  const filteredBOMs = boms.filter(bom => 
    bom.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bom.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">{t('production.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('production.billOfMaterials')}</p>
        </div>
        <Dialog open={showAddBOM} onOpenChange={setShowAddBOM}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              {t('production.createNewBOM')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('production.createNewBOM')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t('production.productName')} *</Label>
                <Input
                  placeholder="Enter product name"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('production.laborCost')} *</Label>
                  <Input
                    type="number"
                    placeholder="Enter labor cost"
                    value={formData.laborCost}
                    onChange={(e) => setFormData({ ...formData, laborCost: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('production.overheadCost')} *</Label>
                  <Input
                    type="number"
                    placeholder="Enter overhead cost"
                    value={formData.overheadCost}
                    onChange={(e) => setFormData({ ...formData, overheadCost: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowAddBOM(false)}>Cancel</Button>
                <Button className="bg-blue-900 hover:bg-blue-800" onClick={handleAddBOM}>Create BOM</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('production.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* BOM List */}
      <div className="space-y-6">
        {filteredBOMs.length > 0 ? filteredBOMs.map((bom) => (
          <Card key={bom.id} className="border-l-4 border-l-blue-900">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{bom.productName}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{t('production.bomId')}: {bom.id}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold text-blue-900">
                    AED {bom.totalProductionCost.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">{t('production.totalProductionCost')}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Raw Materials */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {t('production.rawMaterialsUsed')}
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('production.itemCode')}</TableHead>
                      <TableHead>{t('production.itemName')}</TableHead>
                      <TableHead className="text-right">{t('production.quantity')}</TableHead>
                      <TableHead className="text-right">{t('production.volume')}</TableHead>
                      <TableHead className="text-right">{t('production.cost')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bom.rawMaterials.map((material, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{material.itemId}</TableCell>
                        <TableCell>{material.itemName}</TableCell>
                        <TableCell className="text-right">{material.quantity}</TableCell>
                        <TableCell className="text-right">{material.volume.toFixed(4)}</TableCell>
                        <TableCell className="text-right">{material.cost.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={4} className="font-semibold">{t('production.materialCostTotal')}</TableCell>
                      <TableCell className="text-right font-semibold">
                        AED {bom.rawMaterials.reduce((sum, m) => sum + m.cost, 0).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Cost Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-900 flex items-center justify-center">
                        <Package className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t('production.materialCost')}</p>
                        <p className="text-lg font-semibold">
                          AED {bom.rawMaterials.reduce((sum, m) => sum + m.cost, 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t('production.laborCost')}</p>
                        <p className="text-lg font-semibold">AED {bom.laborCost.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-amber-50 border-amber-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t('production.overheadCost')}</p>
                        <p className="text-lg font-semibold">AED {bom.overheadCost.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-900 text-white">
                  <CardContent className="pt-6">
                    <div>
                      <p className="text-xs opacity-80">{t('production.finalCostPerUnit')}</p>
                      <p className="text-xl font-semibold mt-1">AED {bom.costPerUnit.toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )) : (
          <Card>
            <CardContent className="pt-6 text-center py-8 text-muted-foreground">
              {t('common.noData')}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
