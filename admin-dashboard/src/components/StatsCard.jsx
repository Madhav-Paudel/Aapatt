import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

const StatsCard = ({ title, value, icon, color, trend, subtitle }) => {
  const getColorClasses = (color) => {
    const colors = {
      primary: 'bg-primary text-white',
      secondary: 'bg-secondary text-white',
      success: 'bg-success text-white',
      warning: 'bg-warning text-white',
      danger: 'bg-danger text-white',
      info: 'bg-info text-white',
    }
    return colors[color] || 'bg-gray-500 text-white'
  }

  const getIconColorClasses = (color) => {
    const colors = {
      primary: 'text-primary',
      secondary: 'text-secondary',
      success: 'text-success',
      warning: 'text-warning',
      danger: 'text-danger',
      info: 'text-info',
    }
    return colors[color] || 'text-gray-500'
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend !== null && trend !== undefined && (
            <div className="flex items-center mt-2">
              {trend > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span
                className={`ml-1 text-sm font-medium ${
                  trend > 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {Math.abs(trend)}%
              </span>
              <span className="ml-1 text-sm text-gray-500">from last period</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${getColorClasses(color)}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  )
}

export default StatsCard