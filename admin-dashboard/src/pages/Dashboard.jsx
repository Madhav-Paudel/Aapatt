import React, { useState, useEffect } from 'react';

const StatsCard = ({ title, value, icon, color, trend }) => (
  <div className={`bg-white rounded-xl p-6 shadow-lg border-l-4 border-${color}-500`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className={`text-3xl font-bold text-${color}-600 mt-2`}>{value}</p>
        {trend && (
          <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}% from last week
          </p>
        )}
      </div>
      <div className={`text-5xl text-${color}-500 opacity-20`}>{icon}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    activeEmergencies: 5,
    onlineProviders: 12,
    todayRequests: 23,
    avgResponseTime: 8,
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">Real-time emergency management overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Active Emergencies"
          value={stats.activeEmergencies}
          icon="🚨"
          color="red"
          trend={-12}
        />
        <StatsCard
          title="Online Providers"
          value={stats.onlineProviders}
          icon="🚑"
          color="blue"
          trend={8}
        />
        <StatsCard
          title="Today's Requests"
          value={stats.todayRequests}
          icon="📋"
          color="green"
          trend={15}
        />
        <StatsCard
          title="Avg Response Time"
          value={`${stats.avgResponseTime} min`}
          icon="⏱️"
          color="yellow"
          trend={-5}
        />
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Emergency Requests</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">ID</th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">Type</th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">Location</th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">Status</th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">REQ-{1000 + i}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
                      🚑 Ambulance
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">Downtown Area</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      En Route
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{i * 2} min ago</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
