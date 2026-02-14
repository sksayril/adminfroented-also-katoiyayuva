import { FileText } from 'lucide-react';

export default function Default() {
  return (
    <div className="p-6">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Default</h1>
            <p className="text-sm text-gray-500">Default page content</p>
          </div>
        </div>
      </div>
    </div>
  );
}
