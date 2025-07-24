import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { projectsAPI } from '../services/api';

const Projects: React.FC = () => {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsAPI.getAll,
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your project portfolio
          </p>
        </div>
        <button className="btn btn-primary flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="form-input pl-10"
            />
          </div>
          <button className="btn btn-secondary flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects?.map((project) => (
          <Link
            key={project.id}
            to={`/projects/${project.id}`}
            className="card p-6 block hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {project.name}
                  </h3>
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
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {project.clientName} • {project.projectId}
                </p>
                <div className="flex items-center space-x-6 mt-3 text-sm text-gray-500">
                  <span>Budget: ${project.budget.toLocaleString()}</span>
                  <span>
                    {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                  </span>
                  <span>{project.milestones?.length || 0} milestones</span>
                </div>
              </div>
            </div>
          </Link>
        )) || <p className="text-center text-gray-500 py-8">No projects found</p>}
      </div>
    </div>
  );
};

export default Projects;