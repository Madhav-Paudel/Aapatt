import React, { useState } from 'react';

const Providers = () => {
  const [providers] = useState([
    { id: 1, name: 'John Doe', type: 'AMBULANCE', vehicle: 'AMB-001', status: 'ONLINE', rating: 4.8, jobs: 234 },
    { id: 2, name: 'Jane Smith', type: 'FIRE_BRIGADE', vehicle: 'FIRE-001', status: 'ONLINE', rating: 4.9, jobs: 189 },
    { id: 3, name: 'Mike Johnson', type: 'AIR_AMBULANCE', vehicle: 'AIR-001', status: 'OFFLINE', rating: 4.7, jobs: 156 },
    { id: 4, name: 'Sarah Williams', type: 'AMBULANCE', vehicle: 'AMB-002', status: 'BUSY', rating: 4.9, jobs: 298 },
    { id: 5, name: 'Tom Brown', type: 'FIRE_BRIGADE', vehicle: 'FIRE-002', status: 'ONLINE', rating: 4.6, jobs: 167 },
  ]);

  const getStatusColor = (status) => {
    const colors = {
      ONLINE: 'bg-green-100 text-green-800',
      OFFLINE: 'bg-gray-100 text-gray-800',
      BUSY: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status];
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Provider Management</h1>
        <p className="text-gray-600 mt-2">Manage and monitor emergency service providers</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Providers</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{providers.length}</p>
            </div>
            <div className="text-4xl">🚑</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Online Now</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {providers.filter(p => p.status === 'ONLINE').length}
              </p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Average Rating</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">4.78</p>
            </div>
            <div className="text-4xl">⭐</div>
          </div>
        </div>
      </div>

      {/* Providers Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-gray-600 font-semibold">Provider</th>
                <th className="text-left py-4 px-6 text-gray-600 font-semibold">Type</th>
                <th className="text-left py-4 px-6 text-gray-600 font-semibold">Vehicle</th>
                <th className="text-left py-4 px-6 text-gray-600 font-semibold">Status</th>
                <th className="text-left py-4 px-6 text-gray-600 font-semibold">Rating</th>
                <th className="text-left py-4 px-6 text-gray-600 font-semibold">Jobs</th>
                <th className="text-left py-4 px-6 text-gray-600 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((provider) => (
                <tr key={provider.id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                        👤
                      </div>
                      <span className="ml-3 font-medium text-gray-800">{provider.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-600">{provider.type.replace('_', ' ')}</span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{provider.vehicle}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(provider.status)}`}>
                      {provider.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <span className="text-yellow-500">⭐</span>
                      <span className="ml-1 text-sm font-medium">{provider.rating}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{provider.jobs}</td>
                  <td className="py-4 px-6">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Providers;
