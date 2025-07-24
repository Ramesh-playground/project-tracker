import express from 'express';
import { prisma } from '../server';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { validateProject } from '../utils/validation';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Get all projects
router.get('/', async (req: AuthRequest, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        },
        milestones: true,
        allocations: {
          include: {
            resource: {
              select: { name: true, resourceId: true }
            }
          }
        },
        expenses: true,
        _count: {
          select: {
            milestones: true,
            allocations: true,
            expenses: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get project by ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, email: true }
        },
        milestones: {
          orderBy: { scheduledDate: 'asc' }
        },
        allocations: {
          include: {
            resource: true
          }
        },
        expenses: {
          orderBy: { date: 'desc' }
        },
        invoices: {
          orderBy: { issueDate: 'desc' }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create new project
router.post('/', authorize(['ADMIN', 'PROJECT_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const { error, value } = validateProject.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if project ID already exists
    const existingProject = await prisma.project.findUnique({
      where: { projectId: value.projectId }
    });

    if (existingProject) {
      return res.status(400).json({ error: 'Project ID already exists' });
    }

    const project = await prisma.project.create({
      data: {
        ...value,
        createdBy: req.user!.id
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
router.put('/:id', authorize(['ADMIN', 'PROJECT_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { error, value } = validateProject.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id }
    });

    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if projectId is being changed and already exists
    if (value.projectId !== existingProject.projectId) {
      const projectIdExists = await prisma.project.findUnique({
        where: { projectId: value.projectId }
      });

      if (projectIdExists) {
        return res.status(400).json({ error: 'Project ID already exists' });
      }
    }

    const project = await prisma.project.update({
      where: { id },
      data: value,
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    res.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Update project status
router.patch('/:id/status', authorize(['ADMIN', 'PROJECT_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PLANNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const project = await prisma.project.update({
      where: { id },
      data: { status }
    });

    res.json(project);
  } catch (error) {
    console.error('Update project status error:', error);
    res.status(500).json({ error: 'Failed to update project status' });
  }
});

// Delete project (archive)
router.delete('/:id', authorize(['ADMIN', 'PROJECT_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Instead of deleting, we archive the project
    const project = await prisma.project.update({
      where: { id },
      data: { status: 'ARCHIVED' }
    });

    res.json({ message: 'Project archived successfully', project });
  } catch (error) {
    console.error('Archive project error:', error);
    res.status(500).json({ error: 'Failed to archive project' });
  }
});

// Get project dashboard data
router.get('/:id/dashboard', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        milestones: true,
        allocations: {
          include: {
            resource: true
          }
        },
        expenses: true,
        invoices: true
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Calculate financial metrics
    const totalExpenses = project.expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const totalInvoiced = project.invoices.reduce((sum, invoice) => sum + Number(invoice.amount), 0);
    const budgetUtilization = (totalExpenses / Number(project.budget)) * 100;

    // Calculate milestone metrics
    const totalMilestones = project.milestones.length;
    const completedMilestones = project.milestones.filter(m => m.status === 'COMPLETED').length;
    const delayedMilestones = project.milestones.filter(m => m.status === 'DELAYED').length;

    // Calculate resource metrics
    const totalResources = project.allocations.length;
    const totalAllocation = project.allocations.reduce((sum, alloc) => sum + Number(alloc.allocation), 0);

    const dashboard = {
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        budget: project.budget,
        poAmount: project.poAmount
      },
      financial: {
        budget: Number(project.budget),
        totalExpenses,
        totalInvoiced,
        budgetUtilization,
        remainingBudget: Number(project.budget) - totalExpenses
      },
      milestones: {
        total: totalMilestones,
        completed: completedMilestones,
        delayed: delayedMilestones,
        completionRate: totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0
      },
      resources: {
        total: totalResources,
        totalAllocation: totalAllocation,
        averageAllocation: totalResources > 0 ? totalAllocation / totalResources : 0
      }
    };

    res.json(dashboard);
  } catch (error) {
    console.error('Get project dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch project dashboard' });
  }
});

export default router;