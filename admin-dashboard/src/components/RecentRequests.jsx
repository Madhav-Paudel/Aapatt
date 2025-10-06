import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminService } from '../services/apiService'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

const RecentRequests = ({ limit = 5 }) => {
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadRecentRequests()
  }, [limit])

  const loadRecentRequests = async () => {
    try {
      setIsLoading(true)
      const response = await adminService.getRequests({
        limit,
        sortBy: 'requestedAt',
        sortOrder: 'desc',
      })
      
      if (response.success) {
        setRequests(response.data.requests)
      } else {
        toast.error('Failed to load recent requests')
      }
    } catch (error) {
      console.error('Error loading recent requests:', error)
      toast.error('Error loading recent requests')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusClasses = {
      PENDING: 'status-badge status-pending',
      ACCEPTED: 'status-badge status-accepted',
      EN_ROUTE: 'status-badge status-en-route',
      ARRIVED: 'status-badge status-arrived',
      COMPLETED: 'status-badge status-completed',
      CANCELLED: 'status-badge status-cancelled',
      EXPIRED: 'status-badge status-expired',
    }
    
    const statusLabels = {
      PENDING: 'Pending',
      ACCEPTED: 'Accepted',
      EN_ROUTE: 'En Route',
      ARRIVED: 'Arrived',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
      EXPIRED: 'Expired',
    }

    return (
      <span className={statusClasses[status] || 'status-badge status-pending'}>
        {statusLabels[status] || status}
      </span>
    )
  }

  const getServiceIcon = (serviceType) => {
    const icons = {
      AMBULANCE: '🚑',
      FIRE_BRIGADE: '🚒',
      AIR_AMBULANCE: '🚁',
      POLICE: '👮',
      SECURITY: '🛡️',
    }
    return icons[serviceType] || '🚨'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: 'text-green-600',
      MEDIUM: 'text-yellow-600',
      HIGH: 'text-orange-600',
      CRITICAL: 'text-red-600',
    }
    return colors[priority] || 'text-gray-600'
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(limit)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">📋</div>
        <p className="text-gray-500">No recent requests found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <div
          key={request.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="text-2xl">
              {getServiceIcon(request.serviceType)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {request.citizen?.name || 'Unknown Citizen'}
                </p>
                <span className={`text-xs font-medium ${getPriorityColor(request.priority)}`}>
                  {request.priority}
                </span>
              </div>
              <p className="text-sm text-gray-500 truncate">
                {request.serviceType.replace('_', ' ').toLowerCase()}
                {request.description && ` • ${request.description}`}
              </p>
              <p className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(request.requestedAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {getStatusBadge(request.status)}
            <Link
              to={`/requests/${request.id}`}
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              View
            </Link>
          </div>
        </div>
      ))}
      
      {requests.length >= limit && (
        <div className="text-center pt-2">
          <Link
            to="/requests"
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            View all requests →
          </Link>
        </div>
      )}
    </div>
  )
}

export default RecentRequests