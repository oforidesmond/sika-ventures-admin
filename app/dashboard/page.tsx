'use client';

import { Package, TrendingUp, ShoppingCart } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import StatCard from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const salesData = [
  { name: 'Mon', sales: 4200 },
  { name: 'Tue', sales: 3800 },
  { name: 'Wed', sales: 5100 },
  { name: 'Thu', sales: 4600 },
  { name: 'Fri', sales: 6200 },
  { name: 'Sat', sales: 7100 },
  { name: 'Sun', sales: 5800 },
];

const recentActivities = [
  { id: 1, action: 'New sale completed', product: 'Wireless Headphones', amount: '₵129.99', time: '5 min ago' },
  { id: 2, action: 'Product added', product: 'Smart Watch Pro', amount: '—', time: '12 min ago' },
  { id: 3, action: 'Low stock alert', product: 'USB-C Cable', amount: '—', time: '1 hour ago' },
  { id: 4, action: 'New sale completed', product: 'Laptop Stand', amount: '₵49.99', time: '2 hours ago' },
  { id: 5, action: 'Inventory updated', product: 'Electronics', amount: '—', time: '3 hours ago' },
];

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your store today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value="₵48,574"
          change="+12.5% from last week"
          changeType="positive"
          icon={ShoppingCart}
          iconColor="bg-green-100 text-green-600"
        />
        <StatCard
          title="Total Sales"
          value="1,284"
          change="+8.2% from last week"
          changeType="positive"
          icon={ShoppingCart}
          iconColor="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Total Products"
          value="342"
          change="+5 new products"
          changeType="positive"
          icon={Package}
          iconColor="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Today's Revenue"
          value="₵3,842"
          change="+18.3% vs yesterday"
          changeType="positive"
          icon={TrendingUp}
          iconColor="bg-orange-100 text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-gray-900">Weekly Sales Overview</h3>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#2563EB"
                  strokeWidth={3}
                  dot={{ fill: '#2563EB', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-gray-900">Quick Stats</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-900 text-sm mb-1">Average Order Value</p>
              <p className="text-blue-600">₵37.82</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-green-900 text-sm mb-1">Conversion Rate</p>
              <p className="text-green-600">3.24%</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-orange-900 text-sm mb-1">Low Stock Items</p>
              <p className="text-orange-600">12 products</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-gray-900">Recent Activity</h3>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700 text-sm">Action</th>
                  <th className="px-6 py-3 text-left text-gray-700 text-sm">Product/Category</th>
                  <th className="px-6 py-3 text-left text-gray-700 text-sm">Amount</th>
                  <th className="px-6 py-3 text-left text-gray-700 text-sm">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentActivities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-900">{activity.action}</td>
                    <td className="px-6 py-4 text-gray-700">{activity.product}</td>
                    <td className="px-6 py-4 text-gray-700">{activity.amount}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{activity.time}</td>
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
