import { Settings, Users, Shield, Database, Activity } from 'lucide-react';

export function AdminPanel() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Shield className="w-4 h-4" />
          <span>Administrator Access</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Status</p>
              <p className="text-2xl font-bold text-green-600">Online</p>
            </div>
            <Activity className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Database Size</p>
              <p className="text-2xl font-bold text-gray-900">2.4 GB</p>
            </div>
            <Database className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Settings</p>
              <p className="text-2xl font-bold text-gray-900">Active</p>
            </div>
            <Settings className="w-8 h-8 text-gray-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
          </div>
          <div className="p-6 space-y-4">
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-medium">Manage Users</span>
                <Users className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mt-1">Add, edit, or remove user accounts</p>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-medium">User Permissions</span>
                <Shield className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mt-1">Configure user roles and permissions</p>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">System Settings</h2>
          </div>
          <div className="p-6 space-y-4">
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-medium">General Settings</span>
                <Settings className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mt-1">Configure application settings</p>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-medium">Database Management</span>
                <Database className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mt-1">Backup and maintenance tools</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}