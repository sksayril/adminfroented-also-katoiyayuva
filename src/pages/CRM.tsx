import { Users } from 'lucide-react';

export default function CRM() {
  return (
    <div className="p-6">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">CRM</h1>
            <p className="text-sm text-gray-500">Customer relationship management</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[
              { name: 'John Doe', email: 'john@example.com', status: 'Active', revenue: '$2,400' },
              { name: 'Jane Smith', email: 'jane@example.com', status: 'Active', revenue: '$3,200' },
              { name: 'Bob Johnson', email: 'bob@example.com', status: 'Inactive', revenue: '$1,800' },
            ].map((customer, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-800">{customer.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{customer.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    customer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {customer.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">{customer.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
