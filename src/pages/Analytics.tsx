import { BarChart3 } from 'lucide-react';

export default function Analytics() {
  return (
    <div className="p-6">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
            <p className="text-sm text-gray-500">Advanced analytics and reporting</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-gray-800">12,543</p>
          <p className="text-sm text-green-500 mt-2">+12.5% from last month</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm mb-2">Revenue</h3>
          <p className="text-3xl font-bold text-gray-800">$54,231</p>
          <p className="text-sm text-green-500 mt-2">+8.2% from last month</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm mb-2">Conversion Rate</h3>
          <p className="text-3xl font-bold text-gray-800">3.24%</p>
          <p className="text-sm text-red-500 mt-2">-2.1% from last month</p>
        </div>
      </div>
    </div>
  );
}
