import express from 'express';
import { prisma } from '../server';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { validateResource } from '../utils/validation';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Get all resources
router.get('/', async (req: AuthRequest, res) => {
  try {
    const resources = await prisma.resource.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        },
        allocations: {
          include: {
            project: {
              select: { name: true, projectId: true, status: true }
            }
          },
          where: {
            isActive: true
          }
        },
        _count: {
          select: {
            allocations: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Parse JSON fields and calculate utilization
    const resourcesWithParsedData = resources.map((resource: any) => ({
      ...resource,
      skills: JSON.parse(resource.skills),
      certifications: resource.certifications ? JSON.parse(resource.certifications) : [],
      currentUtilization: resource.allocations.reduce((sum: number, allocation: any) => sum + Number(allocation.allocation), 0)
    }));

    res.json(resourcesWithParsedData);
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// Get resource by ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, email: true }
        },
        allocations: {
          include: {
            project: true
          },
          orderBy: {
            startDate: 'desc'
          }
        }
      }
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Parse JSON fields
    const resourceWithParsedData = {
      ...resource,
      skills: JSON.parse(resource.skills),
      certifications: resource.certifications ? JSON.parse(resource.certifications) : []
    };

    res.json(resourceWithParsedData);
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({ error: 'Failed to fetch resource' });
  }
});

// Create new resource
router.post('/', authorize(['ADMIN', 'RESOURCE_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const { error, value } = validateResource.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if resource ID or email already exists
    const existingResource = await prisma.resource.findFirst({
      where: {
        OR: [
          { resourceId: value.resourceId },
          { email: value.email }
        ]
      }
    });

    if (existingResource) {
      return res.status(400).json({ error: 'Resource ID or email already exists' });
    }

    const resource = await prisma.resource.create({
      data: {
        ...value,
        skills: JSON.stringify(value.skills),
        certifications: value.certifications ? JSON.stringify(value.certifications) : null,
        createdBy: req.user!.id
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    // Parse JSON fields for response
    const responseResource = {
      ...resource,
      skills: JSON.parse(resource.skills),
      certifications: resource.certifications ? JSON.parse(resource.certifications) : []
    };

    res.status(201).json(responseResource);
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

// Update resource
router.put('/:id', authorize(['ADMIN', 'RESOURCE_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { error, value } = validateResource.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if resource exists
    const existingResource = await prisma.resource.findUnique({
      where: { id }
    });

    if (!existingResource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Check if resourceId or email is being changed and already exists
    if (value.resourceId !== existingResource.resourceId || value.email !== existingResource.email) {
      const conflictingResource = await prisma.resource.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                { resourceId: value.resourceId },
                { email: value.email }
              ]
            }
          ]
        }
      });

      if (conflictingResource) {
        return res.status(400).json({ error: 'Resource ID or email already exists' });
      }
    }

    const resource = await prisma.resource.update({
      where: { id },
      data: {
        ...value,
        skills: JSON.stringify(value.skills),
        certifications: value.certifications ? JSON.stringify(value.certifications) : null
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    // Parse JSON fields for response
    const responseResource = {
      ...resource,
      skills: JSON.parse(resource.skills),
      certifications: resource.certifications ? JSON.parse(resource.certifications) : []
    };

    res.json(responseResource);
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

// Deactivate resource
router.patch('/:id/deactivate', authorize(['ADMIN', 'RESOURCE_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const resource = await prisma.resource.update({
      where: { id },
      data: { isActive: false }
    });

    // Also deactivate all active allocations
    await prisma.resourceAllocation.updateMany({
      where: {
        resourceId: id,
        isActive: true
      },
      data: { isActive: false }
    });

    res.json({ message: 'Resource deactivated successfully', resource });
  } catch (error) {
    console.error('Deactivate resource error:', error);
    res.status(500).json({ error: 'Failed to deactivate resource' });
  }
});

// Activate resource
router.patch('/:id/activate', authorize(['ADMIN', 'RESOURCE_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const resource = await prisma.resource.update({
      where: { id },
      data: { isActive: true }
    });

    res.json({ message: 'Resource activated successfully', resource });
  } catch (error) {
    console.error('Activate resource error:', error);
    res.status(500).json({ error: 'Failed to activate resource' });
  }
});

// Allocate resource to project
router.post('/:id/allocations', authorize(['ADMIN', 'RESOURCE_MANAGER', 'PROJECT_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { projectId, startDate, endDate, allocation, hourlyRate } = req.body;

    // Validate required fields
    if (!projectId || !startDate || !endDate || !allocation || !hourlyRate) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (allocation < 0 || allocation > 100) {
      return res.status(400).json({ error: 'Allocation must be between 0 and 100' });
    }

    // Check if resource and project exist
    const [resource, project] = await Promise.all([
      prisma.resource.findUnique({ where: { id } }),
      prisma.project.findUnique({ where: { id: projectId } })
    ]);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (!resource.isActive) {
      return res.status(400).json({ error: 'Cannot allocate inactive resource' });
    }

    // Check for overlapping allocations
    const overlappingAllocations = await prisma.resourceAllocation.findMany({
      where: {
        resourceId: id,
        isActive: true,
        OR: [
          {
            AND: [
              { startDate: { lte: new Date(startDate) } },
              { endDate: { gte: new Date(startDate) } }
            ]
          },
          {
            AND: [
              { startDate: { lte: new Date(endDate) } },
              { endDate: { gte: new Date(endDate) } }
            ]
          },
          {
            AND: [
              { startDate: { gte: new Date(startDate) } },
              { endDate: { lte: new Date(endDate) } }
            ]
          }
        ]
      }
    });

    // Calculate total allocation during the period
    const totalAllocation = overlappingAllocations.reduce((sum: number, alloc: any) => sum + Number(alloc.allocation), 0) + allocation;

    if (totalAllocation > 100) {
      return res.status(400).json({ 
        error: `Resource overallocated. Current allocation: ${totalAllocation}%` 
      });
    }

    const resourceAllocation = await prisma.resourceAllocation.create({
      data: {
        resourceId: id,
        projectId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        allocation,
        hourlyRate
      },
      include: {
        resource: {
          select: { name: true, resourceId: true }
        },
        project: {
          select: { name: true, projectId: true }
        }
      }
    });

    res.status(201).json(resourceAllocation);
  } catch (error) {
    console.error('Create allocation error:', error);
    res.status(500).json({ error: 'Failed to create allocation' });
  }
});

// Get resource utilization report
router.get('/:id/utilization', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        allocations: {
          where: {
            isActive: true,
            ...(startDate && endDate && {
              OR: [
                {
                  AND: [
                    { startDate: { lte: new Date(endDate as string) } },
                    { endDate: { gte: new Date(startDate as string) } }
                  ]
                }
              ]
            })
          },
          include: {
            project: {
              select: { name: true, projectId: true, status: true }
            }
          }
        }
      }
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const utilizationReport = {
      resource: {
        id: resource.id,
        name: resource.name,
        resourceId: resource.resourceId
      },
      totalAllocations: resource.allocations.length,
      totalUtilization: resource.allocations.reduce((sum: number, alloc: any) => sum + Number(alloc.allocation), 0),
      allocations: resource.allocations.map((alloc: any) => ({
        id: alloc.id,
        project: alloc.project,
        allocation: Number(alloc.allocation),
        startDate: alloc.startDate,
        endDate: alloc.endDate,
        hourlyRate: Number(alloc.hourlyRate)
      }))
    };

    res.json(utilizationReport);
  } catch (error) {
    console.error('Get utilization error:', error);
    res.status(500).json({ error: 'Failed to fetch utilization report' });
  }
});

export default router;