'use client';

import { useState } from 'react';
import { Calendar, Download, FileText, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface Sale {
  id: number;
  date: string;
  invoiceNumber: string;
  customer: string;
  items: number;
  total: number;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'refunded';
}

const salesData: Sale[] = [
  { id: 1, date: '2025-12-01', invoiceNumber: 'INV-001', customer: 'John Doe', items: 3, total: 299.97, paymentMethod: 'Credit Card', status: 'completed' },
  { id: 2, date: '2025-12-01', invoiceNumber: 'INV-002', customer: 'Jane Smith', items: 1, total: 129.99, paymentMethod: 'Cash', status: 'completed' },
  { id: 3, date: '2025-12-01', invoiceNumber: 'INV-003', customer: 'Bob Johnson', items: 5, total: 549.95, paymentMethod: 'Credit Card', status: 'completed' },
  { id: 4, date: '2025-11-30', invoiceNumber: 'INV-004', customer: 'Alice Brown', items: 2, total: 199.98, paymentMethod: 'Debit Card', status: 'completed' },
  { id: 5, date: '2025-11-30', invoiceNumber: 'INV-005', customer: 'Charlie Wilson', items: 4, total: 419.96, paymentMethod: 'Credit Card', status: 'refunded' },
  { id: 6, date: '2025-11-29', invoiceNumber: 'INV-006', customer: 'Diana Martinez', items: 1, total: 89.99, paymentMethod: 'Cash', status: 'completed' },
  { id: 7, date: '2025-11-29', invoiceNumber: 'INV-007', customer: 'Eve Davis', items: 3, total: 359.97, paymentMethod: 'Credit Card', status: 'pending' },
  { id: 8, date: '2025-11-28', invoiceNumber: 'INV-008', customer: 'Frank Miller', items: 2, total: 249.98, paymentMethod: 'Debit Card', status: 'completed' },
];

const chartData = [
  { day: 'Mon', revenue: 4200 },
  { day: 'Tue', revenue: 3800 },
  { day: 'Wed', revenue: 5100 },
  { day: 'Thu', revenue: 4600 },
  { day: 'Fri', revenue: 6200 },
  { day: 'Sat', revenue: 7100 },
  { day: 'Sun', revenue: 5800 },
];

function getStatusColor(status: Sale['status']) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-700';
    case 'pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'refunded':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export default function SalesReportsPage() {
  const [dateRange, setDateRange] = useState('last7days');
  const completedSales = salesData.filter((sale) => sale.status === 'completed');
  const totalRevenue = completedSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalSales = completedSales.length;
  const averageOrderValue = totalRevenue / (totalSales || 1);

  const handleExport = (type: 'csv' | 'pdf') => {
    alert(`Exporting to ${type.toUpperCase()}...`);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Sales Reports</h1>
          <p className="text-gray-600">Track and analyze your sales performance</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => handleExport('csv')} variant="outline">
            <FileText size={20} />
            Export CSV
          </Button>
          <Button onClick={() => handleExport('pdf')} variant="outline">
            <Download size={20} />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
                <p className="text-gray-900">₵{totalRevenue.toFixed(2)}</p>
                <p className="text-green-600 text-sm mt-1">+12.5% vs last period</p>
              </div>
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                <TrendingUp size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Sales</p>
                <p className="text-gray-900">{totalSales}</p>
                <p className="text-green-600 text-sm mt-1">+8.2% vs last period</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <FileText size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Avg. Order Value</p>
                <p className="text-gray-900">₵{averageOrderValue.toFixed(2)}</p>
                <p className="text-green-600 text-sm mt-1">+5.3% vs last period</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-gray-900">Revenue Overview</h3>
            <select
              value={dateRange}
              onChange={(event) => setDateRange(event.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="last90days">Last 90 Days</option>
              <option value="thisyear">This Year</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="revenue" fill="#2563EB" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-gray-900">Sales Transactions</h3>
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-gray-400" />
              <input
                type="date"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700 text-sm">Invoice #</th>
                  <th className="px-6 py-3 text-left text-gray-700 text-sm">Date</th>
                  <th className="px-6 py-3 text-left text-gray-700 text-sm">Customer</th>
                  <th className="px-6 py-3 text-left text-gray-700 text-sm">Items</th>
                  <th className="px-6 py-3 text-left text-gray-700 text-sm">Payment</th>
                  <th className="px-6 py-3 text-left text-gray-700 text-sm">Total</th>
                  <th className="px-6 py-3 text-left text-gray-700 text-sm">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {salesData.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-900">{sale.invoiceNumber}</td>
                    <td className="px-6 py-4 text-gray-700">{sale.date}</td>
                    <td className="px-6 py-4 text-gray-900">{sale.customer}</td>
                    <td className="px-6 py-4 text-gray-700">{sale.items}</td>
                    <td className="px-6 py-4 text-gray-700">{sale.paymentMethod}</td>
                    <td className="px-6 py-4 text-gray-900">₵{sale.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm capitalize ${getStatusColor(sale.status)}`}>
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
