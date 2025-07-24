import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  FolderOpen, 
  Users, 
  Target, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp
} from 'lucide-react';
import { reportsAPI } from '../services/api';

const Dashboard: React.FC = () => {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: reportsAPI.getDashboard,
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { metrics, recentActivity, alerts } = dashboard || {};

  const statsCards = [
    {
      title: 'Total Projects',
      value: metrics?.projects?.total || 0,
      subtitle: `${metrics?.projects?.active || 0} active`,
      icon: FolderOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      link: '/projects',
    },
    {
      title: 'Resources',
      value: metrics?.resources?.total || 0,
      subtitle: 'Available resources',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      link: '/resources',
    },
    {
      title: 'Milestones',
      value: metrics?.milestones?.total || 0,
      subtitle: `${metrics?.milestones?.delayed || 0} delayed`,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      link: '/milestones',
    },
    {
      title: 'Budget',
      value: `$${(metrics?.financial?.totalBudget || 0).toLocaleString()}`,
      subtitle: `$${(metrics?.financial?.totalExpenses || 0).toLocaleString()} spent`,
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      link: '/financial',
    },
  ];

  const alertsData = [
    {
      condition: alerts?.delayedMilestones,
      message: `${metrics?.milestones?.delayed || 0} delayed milestones need attention`,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      icon: AlertTriangle,
    },
    {
      condition: alerts?.overdueInvoices,
      message: `${metrics?.financial?.overdueInvoices || 0} overdue invoices`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      icon: DollarSign,
    },
    {
      condition: alerts?.overBudgetProjects,
      message: `${metrics?.projects?.overBudget || 0} projects over budget`,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      icon: TrendingUp,
    },
  ].filter(alert => alert.condition);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Overview of your project tracking metrics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="card p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.subtitle}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Alerts */}
      {alertsData.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Alerts</h2>
          <div className="space-y-3">
            {alertsData.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${alert.bgColor} border-opacity-20`}
              >
                <div className="flex items-center">
                  <alert.icon className={`h-5 w-5 ${alert.color} mr-3`} />
                  <p className={`text-sm font-medium ${alert.color}`}>
                    {alert.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
            <Link to="/projects" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivity?.projects?.slice(0, 5).map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <FolderOpen className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {project.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    project.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-800'
                      : project.status === 'IN_PROGRESS'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {project.status.replace('_', ' ')}
                </span>
              </Link>
            )) || <p className="text-sm text-gray-500">No recent projects</p>}
          </div>
        </div>

        {/* Recent Milestones */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Milestones</h2>
            <Link to="/milestones" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivity?.milestones?.slice(0, 5).map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <Target className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {milestone.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {milestone.project?.name}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    milestone.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-800'
                      : milestone.status === 'DELAYED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {milestone.status}
                </span>
              </div>
            )) || <p className="text-sm text-gray-500">No recent milestones</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;