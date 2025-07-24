import express from 'express';
import { prisma } from '../server';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Get project status report
router.get('/project-status', async (req: AuthRequest, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        milestones: true,
        allocations: {
          where: { isActive: true },
          include: {
            resource: {
              select: { name: true }
            }
          }
        },
        expenses: true,
        invoices: true
      }
    });

    const report = projects.map(project => {
      const totalExpenses = project.expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      const totalMilestones = project.milestones.length;
      const completedMilestones = project.milestones.filter(m => m.status === 'COMPLETED').length;
      const delayedMilestones = project.milestones.filter(m => m.status === 'DELAYED').length;
      const budgetUtilization = (totalExpenses / Number(project.budget)) * 100;

      return {
        id: project.id,
        name: project.name,
        projectId: project.projectId,
        status: project.status,
        client: project.clientName,
        budget: Number(project.budget),
        totalExpenses,
        budgetUtilization,
        milestones: {
          total: totalMilestones,
          completed: completedMilestones,
          delayed: delayedMilestones,
          completionRate: totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0
        },
        resources: project.allocations.length,
        startDate: project.startDate,
        endDate: project.endDate
      };
    });

    res.json(report);
  } catch (error) {
    console.error('Get project status report error:', error);
    res.status(500).json({ error: 'Failed to generate project status report' });
  }
});

// Get resource utilization report
router.get('/resource-utilization', async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate } = req.query;

    const resources = await prisma.resource.findMany({
      where: { isActive: true },
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

    const report = resources.map(resource => {
      const totalUtilization = resource.allocations.reduce((sum, alloc) => sum + Number(alloc.allocation), 0);
      const activeProjects = resource.allocations.length;

      return {
        id: resource.id,
        name: resource.name,
        resourceId: resource.resourceId,
        email: resource.email,
        skills: JSON.parse(resource.skills),
        utilization: {
          total: totalUtilization,
          average: activeProjects > 0 ? totalUtilization / activeProjects : 0,
          isOverallocated: totalUtilization > 100
        },
        activeProjects,
        allocations: resource.allocations.map(alloc => ({
          project: alloc.project,
          allocation: Number(alloc.allocation),
          startDate: alloc.startDate,
          endDate: alloc.endDate,
          hourlyRate: Number(alloc.hourlyRate)
        }))
      };
    });

    res.json(report);
  } catch (error) {
    console.error('Get resource utilization report error:', error);
    res.status(500).json({ error: 'Failed to generate resource utilization report' });
  }
});

// Get financial summary report
router.get('/financial-summary', async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate } = req.query;

    const projects = await prisma.project.findMany({
      include: {
        expenses: {
          where: startDate && endDate ? {
            date: {
              gte: new Date(startDate as string),
              lte: new Date(endDate as string)
            }
          } : undefined
        },
        invoices: {
          where: startDate && endDate ? {
            issueDate: {
              gte: new Date(startDate as string),
              lte: new Date(endDate as string)
            }
          } : undefined
        },
        allocations: {
          where: { isActive: true }
        }
      }
    });

    const summary = {
      overview: {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'IN_PROGRESS').length,
        completedProjects: projects.filter(p => p.status === 'COMPLETED').length,
        totalBudget: projects.reduce((sum, p) => sum + Number(p.budget), 0),
        totalPOValue: projects.reduce((sum, p) => sum + Number(p.poAmount), 0)
      },
      expenses: {
        total: projects.reduce((sum, p) => 
          sum + p.expenses.reduce((expSum, exp) => expSum + Number(exp.amount), 0), 0
        ),
        byCategory: projects.reduce((acc, p) => {
          p.expenses.forEach(exp => {
            acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
          });
          return acc;
        }, {} as Record<string, number>)
      },
      invoicing: {
        totalInvoiced: projects.reduce((sum, p) => 
          sum + p.invoices.reduce((invSum, inv) => invSum + Number(inv.amount), 0), 0
        ),
        totalPaid: projects.reduce((sum, p) => 
          sum + p.invoices
            .filter(inv => inv.status === 'PAID')
            .reduce((paidSum, inv) => paidSum + Number(inv.amount), 0), 0
        ),
        pendingInvoices: projects.reduce((sum, p) => 
          sum + p.invoices.filter(inv => inv.status === 'PENDING').length, 0
        )
      },
      projectHealth: {
        onBudget: projects.filter(p => {
          const totalExpenses = p.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
          return totalExpenses <= Number(p.budget);
        }).length,
        overBudget: projects.filter(p => {
          const totalExpenses = p.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
          return totalExpenses > Number(p.budget);
        }).length
      }
    };

    res.json(summary);
  } catch (error) {
    console.error('Get financial summary report error:', error);
    res.status(500).json({ error: 'Failed to generate financial summary report' });
  }
});

// Get milestone slippage report
router.get('/milestone-slippage', async (req: AuthRequest, res) => {
  try {
    const currentDate = new Date();

    const milestones = await prisma.milestone.findMany({
      include: {
        project: {
          select: { name: true, projectId: true, clientName: true }
        }
      }
    });

    const slippageReport = milestones.map(milestone => {
      let slippageDays = 0;
      let status = 'ON_TRACK';

      if (milestone.status === 'COMPLETED' && milestone.actualDate) {
        slippageDays = Math.floor(
          (new Date(milestone.actualDate).getTime() - new Date(milestone.scheduledDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        status = slippageDays > 0 ? 'COMPLETED_LATE' : 'COMPLETED_ON_TIME';
      } else if (milestone.status !== 'COMPLETED' && currentDate > milestone.scheduledDate) {
        slippageDays = Math.floor(
          (currentDate.getTime() - new Date(milestone.scheduledDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        status = 'DELAYED';
      }

      return {
        id: milestone.id,
        name: milestone.name,
        project: milestone.project,
        scheduledDate: milestone.scheduledDate,
        actualDate: milestone.actualDate,
        status: milestone.status,
        slippageStatus: status,
        slippageDays,
        isBillingMilestone: milestone.isBillingMilestone,
        billingAmount: milestone.billingAmount
      };
    });

    // Filter and sort by slippage
    const slippedMilestones = slippageReport
      .filter(m => m.slippageDays > 0)
      .sort((a, b) => b.slippageDays - a.slippageDays);

    res.json({
      totalMilestones: milestones.length,
      slippedMilestones: slippedMilestones.length,
      averageSlippage: slippedMilestones.length > 0 ? 
        slippedMilestones.reduce((sum, m) => sum + m.slippageDays, 0) / slippedMilestones.length : 0,
      milestones: slippageReport
    });
  } catch (error) {
    console.error('Get milestone slippage report error:', error);
    res.status(500).json({ error: 'Failed to generate milestone slippage report' });
  }
});

// Get dashboard overview
router.get('/dashboard', async (req: AuthRequest, res) => {
  try {
    const currentDate = new Date();

    // Get counts
    const [
      totalProjects,
      activeProjects,
      totalResources,
      totalMilestones,
      delayedMilestones,
      overdueInvoices,
      overBudgetProjects
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.resource.count({ where: { isActive: true } }),
      prisma.milestone.count(),
      prisma.milestone.count({
        where: {
          OR: [
            { status: 'DELAYED' },
            {
              AND: [
                { status: { not: 'COMPLETED' } },
                { scheduledDate: { lt: currentDate } }
              ]
            }
          ]
        }
      }),
      prisma.invoice.count({
        where: {
          AND: [
            { dueDate: { lt: currentDate } },
            { status: { not: 'PAID' } },
            { status: { not: 'CANCELLED' } }
          ]
        }
      }),
      prisma.$queryRaw`
        SELECT COUNT(*) as count FROM projects p
        WHERE (
          SELECT COALESCE(SUM(e.amount), 0) FROM expenses e WHERE e.projectId = p.id
        ) > p.budget
      `
    ]);

    // Get recent activities
    const recentProjects = await prisma.project.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, status: true, createdAt: true }
    });

    const recentMilestones = await prisma.milestone.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: {
        project: { select: { name: true } }
      }
    });

    // Get financial summary
    const projects = await prisma.project.findMany({
      include: {
        expenses: true,
        invoices: true
      }
    });

    const financialSummary = {
      totalBudget: projects.reduce((sum, p) => sum + Number(p.budget), 0),
      totalExpenses: projects.reduce((sum, p) => 
        sum + p.expenses.reduce((expSum, exp) => expSum + Number(exp.amount), 0), 0
      ),
      totalInvoiced: projects.reduce((sum, p) => 
        sum + p.invoices.reduce((invSum, inv) => invSum + Number(inv.amount), 0), 0
      )
    };

    const dashboard = {
      metrics: {
        projects: {
          total: totalProjects,
          active: activeProjects,
          overBudget: (overBudgetProjects as any)[0]?.count || 0
        },
        resources: {
          total: totalResources
        },
        milestones: {
          total: totalMilestones,
          delayed: delayedMilestones
        },
        financial: {
          ...financialSummary,
          overdueInvoices
        }
      },
      recentActivity: {
        projects: recentProjects,
        milestones: recentMilestones
      },
      alerts: {
        delayedMilestones: delayedMilestones > 0,
        overdueInvoices: overdueInvoices > 0,
        overBudgetProjects: (overBudgetProjects as any)[0]?.count > 0
      }
    };

    res.json(dashboard);
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Failed to generate dashboard' });
  }
});

// Get custom report based on filters
router.post('/custom', async (req: AuthRequest, res) => {
  try {
    const { 
      projectIds, 
      resourceIds, 
      startDate, 
      endDate, 
      reportType, 
      groupBy 
    } = req.body;

    let data: any = {};

    switch (reportType) {
      case 'PROJECT_PERFORMANCE':
        data = await prisma.project.findMany({
          where: {
            ...(projectIds && { id: { in: projectIds } }),
            ...(startDate && endDate && {
              createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate)
              }
            })
          },
          include: {
            milestones: true,
            expenses: true,
            allocations: {
              include: { resource: true }
            }
          }
        });
        break;

      case 'RESOURCE_ALLOCATION':
        data = await prisma.resourceAllocation.findMany({
          where: {
            ...(resourceIds && { resourceId: { in: resourceIds } }),
            ...(startDate && endDate && {
              OR: [
                {
                  AND: [
                    { startDate: { lte: new Date(endDate) } },
                    { endDate: { gte: new Date(startDate) } }
                  ]
                }
              ]
            })
          },
          include: {
            resource: true,
            project: true
          }
        });
        break;

      case 'FINANCIAL_ANALYSIS':
        data = await prisma.expense.findMany({
          where: {
            ...(projectIds && { projectId: { in: projectIds } }),
            ...(startDate && endDate && {
              date: {
                gte: new Date(startDate),
                lte: new Date(endDate)
              }
            })
          },
          include: {
            project: true
          }
        });
        break;

      default:
        return res.status(400).json({ error: 'Invalid report type' });
    }

    res.json({
      reportType,
      groupBy,
      filters: { projectIds, resourceIds, startDate, endDate },
      data,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Generate custom report error:', error);
    res.status(500).json({ error: 'Failed to generate custom report' });
  }
});

export default router;