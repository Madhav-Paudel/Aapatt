import React, { useState, useEffect } from 'react'
import { useSocket } from '../contexts/SocketContext'
import { adminService } from '../services/apiService'
import StatsCard from '../components/StatsCard'
import RecentRequests from '../components/RecentRequests'
import ProviderStatus from '../components/ProviderStatus'
import ResponseTimeChart from '../components/ResponseTimeChart'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('24h')
  const { lastMessage } = useSocket()

  useEffect(() => {
    loadDashboardData()
  }, [selectedPeriod])

  useEffect(() => {
    if (lastMessage) {
      // Refresh data when receiving real-time updates
      loadDashboardData()
      
      // Show toast notification for important events
      if (lastMessage.type === 'new_emergency_request') {
        toast.success(`New ${lastMessage.data.serviceType} emergency request received`)
      } else if (lastMessage.type === 'provider_status_changed') {
        toast.info(`Provider ${lastMessage.data.isOnline ? 'came online' : 'went offline'}`)
      }
    }
  }, [lastMessage])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const response = await adminService.getDashboard(selectedPeriod)
      
      if (response.success) {
        setDashboardData(response.data)
      } else {
        toast.error('Failed to load dashboard data')
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Error loading dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const periodOptions = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load dashboard data</p>
        <button
          onClick={loadDashboardData}
          className="mt-4 btn-primary"
        >
          Retry
        </button>
      </div>
    )
  }

  const { overview, requestsByType, requestsByStatus } = dashboardData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Emergency response overview and statistics</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Period:</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input py-1 text-sm"
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Requests"
          value={overview.totalRequests}
          icon="🚨"
          color="primary"
          trend={null}
        />
        <StatsCard
          title="Active Requests"
          value={overview.activeRequests}
          icon="⏳"
          color="warning"
          trend={null}
        />
        <StatsCard
          title="Completed"
          value={overview.completedRequests}
          icon="✅"
          color="success"
          trend={null}
        />
        <StatsCard
          title="Online Providers"
          value={`${overview.onlineProviders}/${overview.totalProviders}`}
          icon="👥"
          color="info"
          trend={null}
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Average Response Time
          </h3>
          <ResponseTimeChart data={overview.avgResponseTime} />
        </div>

        {/* Provider Status */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Provider Status
          </h3>
          <ProviderStatus
            online={overview.onlineProviders}
            total={overview.totalProviders}
          />
        </div>
      </div>

      {/* Requests by Type */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Requests by Service Type
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {requestsByType?.map((item) => (
            <div key={item.serviceType} className="text-center">
              <div className="text-2xl font-bold text-primary">
                {item._count.serviceType}
              </div>
              <div className="text-sm text-gray-600 capitalize">
                {item.serviceType.replace('_', ' ').toLowerCase()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Requests */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Emergency Requests
        </h3>
        <RecentRequests limit={10} />
      </div>
    </div>
  )
}

export default Dashboard