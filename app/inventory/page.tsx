'use client';

import { useMemo, useState } from 'react';
import { Search, Filter, AlertTriangle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  stock: number;
  reorderLevel: number;
  lastRestocked: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

const inventoryData: InventoryItem[] = [
  { id: 1, name: 'Wireless Headphones', sku: 'WH-001', stock: 45, reorderLevel: 20, lastRestocked: '2025-11-28', status: 'in-stock' },
  { id: 2, name: 'Smart Watch Pro', sku: 'SW-002', stock: 28, reorderLevel: 15, lastRestocked: '2025-11-25', status: 'in-stock' },
  { id: 3, name: 'Laptop Stand', sku: 'LS-003', stock: 67, reorderLevel: 25, lastRestocked: '2025-11-30', status: 'in-stock' },
  { id: 4, name: 'USB-C Cable', sku: 'UC-004', stock: 5, reorderLevel: 30, lastRestocked: '2025-11-20', status: 'low-stock' },
  { id: 5, name: 'Mechanical Keyboard', sku: 'MK-005', stock: 32, reorderLevel: 15, lastRestocked: '2025-11-27', status: 'in-stock' },
  { id: 6, name: 'Wireless Mouse', sku: 'WM-006', stock: 8, reorderLevel: 20, lastRestocked: '2025-11-22', status: 'low-stock' },
  { id: 7, name: 'Phone Case', sku: 'PC-007', stock: 89, reorderLevel: 40, lastRestocked: '2025-12-01', status: 'in-stock' },
  { id: 8, name: 'Portable Charger', sku: 'PC-008', stock: 0, reorderLevel: 20, lastRestocked: '2025-11-15', status: 'out-of-stock' },
  { id: 9, name: 'Screen Protector', sku: 'SP-009', stock: 12, reorderLevel: 25, lastRestocked: '2025-11-18', status: 'low-stock' },
  { id: 10, name: 'Bluetooth Speaker', sku: 'BS-010', stock: 38, reorderLevel: 15, lastRestocked: '2025-11-29', status: 'in-stock' },
];

function getStatusColor(status: InventoryItem['status']) {
  switch (status) {
    case 'in-stock':
      return 'bg-green-100 text-green-700';
    case 'low-stock':
      return 'bg-yellow-100 text-yellow-700';
    case 'out-of-stock':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function getStockPercentage(stock: number, reorderLevel: number) {
  const percentage = (stock / (reorderLevel * 2)) * 100;
  return Math.min(percentage, 100);
}

export default function InventoryPage() {
  const [inventory] = useState<InventoryItem[]>(inventoryData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | InventoryItem['status']>('all');

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [inventory, searchTerm, filterStatus]);

  const lowStockCount = inventory.filter((item) => item.status === 'low-stock').length;
  const outOfStockCount = inventory.filter((item) => item.status === 'out-of-stock').length;
  const totalItems = inventory.reduce((sum, item) => sum + item.stock, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Inventory Management</h1>
        <p className="text-gray-600">Monitor and manage your stock levels</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Items in Stock</p>
                <p className="text-gray-900">{totalItems} units</p>
                <p className="text-gray-500 text-sm mt-1">{inventory.length} products</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <Package size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Low Stock Items</p>
                <p className="text-gray-900">{lowStockCount} products</p>
                <p className="text-yellow-600 text-sm mt-1">Needs attention</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center">
                <AlertTriangle size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Out of Stock</p>
                <p className="text-gray-900">{outOfStockCount} products</p>
                <p className="text-red-600 text-sm mt-1">Restock immediately</p>
              </div>
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                <AlertTriangle size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {lowStockCount > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
          <AlertTriangle size={20} className="text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-yellow-900">Low Stock Alert</p>
            <p className="text-yellow-700 text-sm mt-1">
              You have {lowStockCount} product{lowStockCount > 1 ? 's' : ''} running low on stock. Consider restocking soon.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-3">
              <select
                value={filterStatus}
                onChange={(event) => setFilterStatus(event.target.value as typeof filterStatus)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
              <Button variant="outline">
                <Filter size={20} />
                More Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700 text-sm">Product Name</th>
                  <th className="px-6 py-3 text-left text-gray-700 text-sm">SKU</th>
                  <th className="px-6 py-3 text-left text-gray-700 text-sm">Current Stock</th>
                  <th className="px-6 py-3 text-left text-gray-700 text-sm">Stock Level</th>
                  <th className="px-6 py-3 text-left text-gray-700 text-sm">Reorder Level</th>
                  <th className="px-6 py-3 text-left text-gray-700 text-sm">Last Restocked</th>
                  <th className="px-6 py-3 text-left text-gray-700 text-sm">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInventory.map((item) => {
                  const stockPercentage = getStockPercentage(item.stock, item.reorderLevel);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 text-gray-700">{item.sku}</td>
                      <td className="px-6 py-4 text-gray-900">{item.stock} units</td>
                      <td className="px-6 py-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              item.status === 'in-stock'
                                ? 'bg-green-500'
                                : item.status === 'low-stock'
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${stockPercentage}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{item.reorderLevel} units</td>
                      <td className="px-6 py-4 text-gray-700">{item.lastRestocked}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm capitalize ${getStatusColor(item.status)}`}>
                          {item.status.replace('-', ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
