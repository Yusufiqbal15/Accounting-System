'use client';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Package,
  AlertCircle
} from 'lucide-react';
import { mockInventory } from '../mockData';
import { useState } from 'react';
import { ItemFormDialog } from './ItemFormDialog';
import { ItemDeleteDialog } from './ItemDeleteDialog';
import { ItemDetailsDialog } from './ItemDetailsDialog';
import type { InventoryItem } from '../types';

export function ItemsManagement() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [itemDeleteOpen, setItemDeleteOpen] = useState(false);
  const [itemDetailsOpen, setItemDetailsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const itemsPerPage = 10;

  // Filter items
  const filteredItems = mockInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const handleAddItem = () => {
    setSelectedItem(null);
    setIsEditing(false);
    setItemFormOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsEditing(true);
    setItemFormOpen(true);
  };

  const handleDeleteItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setItemDeleteOpen(true);
  };

  const handleViewDetails = (item: InventoryItem) => {
    setSelectedItem(item);
    setItemDetailsOpen(true);
  };

  const getStockStatusBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <Badge className="bg-green-600">{t('itemsManagement.inStock')}</Badge>;
      case 'low_stock':
        return <Badge variant="destructive">{t('itemsManagement.lowStock')}</Badge>;
      case 'out_of_stock':
        return <Badge variant="secondary">{t('itemsManagement.outOfStock')}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'raw_materials':
        return <Badge variant="outline">{t('itemsManagement.rawMaterial')}</Badge>;
      case 'finished_goods':
        return <Badge className="bg-blue-900">{t('itemsManagement.finishedGoods')}</Badge>;
      case 'trading_items':
        return <Badge className="bg-amber-600">{t('itemsManagement.tradingItem')}</Badge>;
      default:
        return <Badge>{category}</Badge>;
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">{t('itemsManagement.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('itemsManagement.title')}</p>
        </div>
        <Button 
          className="bg-green-600 hover:bg-green-700"
          onClick={handleAddItem}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('itemsManagement.addItem')}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-900 hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">{t('itemsManagement.itemId')}</CardTitle>
            <Package className="h-5 w-5 text-blue-900" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{mockInventory.length}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-600 hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">{t('itemsManagement.inStock')}</CardTitle>
            <Package className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600">
              {mockInventory.filter(i => i.stockStatus === 'in_stock').length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">{t('itemsManagement.lowStock')}</CardTitle>
            <AlertCircle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-red-500">
              {mockInventory.filter(i => i.stockStatus === 'low_stock').length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-900 hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">{t('itemsManagement.quantity')}</CardTitle>
            <Package className="h-5 w-5 text-blue-900" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              AED {mockInventory.reduce((sum, item) => sum + (item.costPerUnit * item.quantity), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('itemsManagement.searchPlaceholder')}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Select 
              value={categoryFilter} 
              onValueChange={(value) => {
                setCategoryFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('itemsManagement.category')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('itemsManagement.all')}</SelectItem>
                <SelectItem value="raw_materials">{t('itemsManagement.rawMaterial')}</SelectItem>
                <SelectItem value="finished_goods">{t('itemsManagement.finishedGoods')}</SelectItem>
                <SelectItem value="trading_items">{t('itemsManagement.tradingItem')}</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setCurrentPage(1);
              }}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('itemsManagement.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('itemsManagement.itemId')}</TableHead>
                <TableHead>{t('itemsManagement.itemName')}</TableHead>
                <TableHead className="text-center">{t('itemsManagement.category')}</TableHead>
                <TableHead className="text-center">{t('itemsManagement.type')}</TableHead>
                <TableHead className="text-right">{t('itemsManagement.quantity')}</TableHead>
                <TableHead className="text-right">{t('itemsManagement.price')}</TableHead>
                <TableHead className="text-center">{t('itemsManagement.status')}</TableHead>
                <TableHead className="text-center">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {t('itemsManagement.noItemsFound')}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-center">{getCategoryBadge(item.category)}</TableCell>
                    <TableCell className="text-center">
                      <span className="capitalize">{item.type.replace('_', ' ')}</span>
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">AED {item.costPerUnit.toLocaleString()}</TableCell>
                    <TableCell className="text-center">{getStockStatusBadge(item.stockStatus)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDetails(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditItem(item)}
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteItem(item)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                {t('common.page')} {currentPage} {t('common.of')} {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {t('common.previous')}
                </Button>
                <span className="text-sm">
                  {t('common.page')} {currentPage} {t('common.of')} {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  {t('common.next')}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ItemFormDialog 
        open={itemFormOpen}
        onOpenChange={setItemFormOpen}
        item={selectedItem}
        isEditing={isEditing}
      />
      <ItemDeleteDialog
        open={itemDeleteOpen}
        onOpenChange={setItemDeleteOpen}
        item={selectedItem}
      />
      <ItemDetailsDialog
        open={itemDetailsOpen}
        onOpenChange={setItemDetailsOpen}
        item={selectedItem}
      />
    </div>
  );
}