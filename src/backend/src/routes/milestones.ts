import express from 'express';
import { prisma } from '../server';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { validateMilestone } from '../utils/validation';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Get all milestones
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { projectId, status } = req.query;

    const milestones = await prisma.milestone.findMany({
      where: {
        ...(projectId && { projectId: projectId as string }),
        ...(status && { status: status as any })
      },
      include: {
        project: {
          select: { name: true, projectId: true }
        },
        invoices: {
          select: { id: true, invoiceNumber: true, amount: true, status: true }
        }
      },
      orderBy: {
        scheduledDate: 'asc'
      }
    });

    res.json(milestones);
  } catch (error) {
    console.error('Get milestones error:', error);
    res.status(500).json({ error: 'Failed to fetch milestones' });
  }
});

// Get milestone by ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const milestone = await prisma.milestone.findUnique({
      where: { id },
      include: {
        project: {
          select: { name: true, projectId: true, budget: true, poAmount: true }
        },
        invoices: true
      }
    });

    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    res.json(milestone);
  } catch (error) {
    console.error('Get milestone error:', error);
    res.status(500).json({ error: 'Failed to fetch milestone' });
  }
});

// Create new milestone
router.post('/', authorize(['ADMIN', 'PROJECT_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.body;
    const { error, value } = validateMilestone.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const milestone = await prisma.milestone.create({
      data: {
        ...value,
        projectId,
        scheduledDate: new Date(value.scheduledDate)
      },
      include: {
        project: {
          select: { name: true, projectId: true }
        }
      }
    });

    res.status(201).json(milestone);
  } catch (error) {
    console.error('Create milestone error:', error);
    res.status(500).json({ error: 'Failed to create milestone' });
  }
});

// Update milestone
router.put('/:id', authorize(['ADMIN', 'PROJECT_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { error, value } = validateMilestone.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if milestone exists
    const existingMilestone = await prisma.milestone.findUnique({
      where: { id }
    });

    if (!existingMilestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    const milestone = await prisma.milestone.update({
      where: { id },
      data: {
        ...value,
        scheduledDate: new Date(value.scheduledDate)
      },
      include: {
        project: {
          select: { name: true, projectId: true }
        }
      }
    });

    res.json(milestone);
  } catch (error) {
    console.error('Update milestone error:', error);
    res.status(500).json({ error: 'Failed to update milestone' });
  }
});

// Update milestone status
router.patch('/:id/status', authorize(['ADMIN', 'PROJECT_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status, actualDate } = req.body;

    const validStatuses = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData: any = { status };
    
    // Set actual date if milestone is completed
    if (status === 'COMPLETED' && actualDate) {
      updateData.actualDate = new Date(actualDate);
    } else if (status === 'COMPLETED' && !actualDate) {
      updateData.actualDate = new Date();
    }

    const milestone = await prisma.milestone.update({
      where: { id },
      data: updateData,
      include: {
        project: {
          select: { name: true, projectId: true }
        }
      }
    });

    // If it's a billing milestone and completed, trigger invoice creation
    if (status === 'COMPLETED' && milestone.isBillingMilestone) {
      // This would typically trigger an invoice creation process
      // For now, we'll just return the milestone
    }

    res.json(milestone);
  } catch (error) {
    console.error('Update milestone status error:', error);
    res.status(500).json({ error: 'Failed to update milestone status' });
  }
});

// Delete milestone
router.delete('/:id', authorize(['ADMIN', 'PROJECT_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Check if milestone has any invoices
    const invoices = await prisma.invoice.findMany({
      where: { milestoneId: id }
    });

    if (invoices.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete milestone with associated invoices' 
      });
    }

    await prisma.milestone.delete({
      where: { id }
    });

    res.json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    console.error('Delete milestone error:', error);
    res.status(500).json({ error: 'Failed to delete milestone' });
  }
});

// Get milestones by project
router.get('/project/:projectId', async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;

    const milestones = await prisma.milestone.findMany({
      where: { projectId },
      include: {
        invoices: {
          select: { id: true, invoiceNumber: true, amount: true, status: true }
        }
      },
      orderBy: {
        scheduledDate: 'asc'
      }
    });

    res.json(milestones);
  } catch (error) {
    console.error('Get project milestones error:', error);
    res.status(500).json({ error: 'Failed to fetch project milestones' });
  }
});

// Get milestone timeline for a project
router.get('/project/:projectId/timeline', async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true, startDate: true, endDate: true }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const milestones = await prisma.milestone.findMany({
      where: { projectId },
      orderBy: { scheduledDate: 'asc' }
    });

    const timeline = {
      project: {
        name: project.name,
        startDate: project.startDate,
        endDate: project.endDate
      },
      milestones: milestones.map((milestone: any) => ({
        id: milestone.id,
        name: milestone.name,
        scheduledDate: milestone.scheduledDate,
        actualDate: milestone.actualDate,
        status: milestone.status,
        isBillingMilestone: milestone.isBillingMilestone,
        billingAmount: milestone.billingAmount,
        isDelayed: milestone.actualDate ? 
          new Date(milestone.actualDate) > new Date(milestone.scheduledDate) :
          new Date() > new Date(milestone.scheduledDate) && milestone.status !== 'COMPLETED'
      }))
    };

    res.json(timeline);
  } catch (error) {
    console.error('Get milestone timeline error:', error);
    res.status(500).json({ error: 'Failed to fetch milestone timeline' });
  }
});

// Get delayed milestones across all projects
router.get('/delayed/all', async (req: AuthRequest, res) => {
  try {
    const currentDate = new Date();

    const delayedMilestones = await prisma.milestone.findMany({
      where: {
        OR: [
          {
            status: 'DELAYED'
          },
          {
            AND: [
              { status: { not: 'COMPLETED' } },
              { status: { not: 'CANCELLED' } },
              { scheduledDate: { lt: currentDate } }
            ]
          }
        ]
      },
      include: {
        project: {
          select: { name: true, projectId: true }
        }
      },
      orderBy: {
        scheduledDate: 'asc'
      }
    });

    const delayedWithCalculations = delayedMilestones.map((milestone: any) => ({
      ...milestone,
      daysDelayed: Math.floor(
        (currentDate.getTime() - new Date(milestone.scheduledDate).getTime()) / (1000 * 60 * 60 * 24)
      )
    }));

    res.json(delayedWithCalculations);
  } catch (error) {
    console.error('Get delayed milestones error:', error);
    res.status(500).json({ error: 'Failed to fetch delayed milestones' });
  }
});

export default router;