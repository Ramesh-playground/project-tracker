import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, DollarSign, Users, Target } from 'lucide-react';
import { projectsAPI } from '../services/api';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsAPI.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className="card p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="mt-1 text-sm text-gray-600">
              {project.projectId} • {project.clientName}
            </p>
          </div>
          <span
            className={`px-3 py-1 text-sm rounded-full ${
              project.status === 'COMPLETED'
                ? 'bg-green-100 text-green-800'
                : project.status === 'IN_PROGRESS'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {project.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Overview */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Overview</h2>
            {project.description && (
              <p className="text-gray-600 mb-4">{project.description}</p>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">{new Date(project.startDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="font-medium">{new Date(project.endDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="font-medium">${project.budget.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">PO Amount</p>
                  <p className="font-medium">${project.poAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Milestones</h2>
              <button className="btn btn-primary btn-sm">Add Milestone</button>
            </div>
            <div className="space-y-3">
              {project.milestones?.map((milestone) => (
                <div key={milestone.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center">
                    <Target className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium">{milestone.name}</p>
                      <p className="text-sm text-gray-500">
                        Due: {new Date(milestone.scheduledDate).toLocaleDateString()}
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
              )) || <p className="text-sm text-gray-500">No milestones</p>}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* PO Details */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">PO Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">PO Number</p>
                <p className="font-medium">{project.poNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">PO Date</p>
                <p className="font-medium">{new Date(project.poDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Client</p>
                <p className="font-medium">{project.clientName}</p>
              </div>
            </div>
          </div>

          {/* Resource Allocation */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Resources</h3>
              <button className="btn btn-secondary btn-sm">Allocate</button>
            </div>
            <div className="space-y-3">
              {project.allocations?.map((allocation) => (
                <div key={allocation.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm font-medium">{allocation.resource?.name}</p>
                      <p className="text-xs text-gray-500">{allocation.allocation}% allocation</p>
                    </div>
                  </div>
                </div>
              )) || <p className="text-sm text-gray-500">No resources allocated</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;