import express from 'express';
import { prisma } from '../server';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { validateExpense } from '../utils/validation';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Get all expenses
router.get('/expenses', async (req: AuthRequest, res) => {
  try {
    const { projectId, category, startDate, endDate } = req.query;

    const expenses = await prisma.expense.findMany({
      where: {
        ...(projectId && { projectId: projectId as string }),
        ...(category && { category: category as any }),
        ...(startDate && endDate && {
          date: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string)
          }
        })
      },
      include: {
        project: {
          select: { name: true, projectId: true }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Create new expense
router.post('/expenses', authorize(['ADMIN', 'PROJECT_MANAGER', 'FINANCE_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.body;
    const { error, value } = validateExpense.validate(req.body);
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

    const expense = await prisma.expense.create({
      data: {
        ...value,
        projectId,
        date: new Date(value.date)
      },
      include: {
        project: {
          select: { name: true, projectId: true }
        }
      }
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// Update expense
router.put('/expenses/:id', authorize(['ADMIN', 'PROJECT_MANAGER', 'FINANCE_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { error, value } = validateExpense.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        ...value,
        date: new Date(value.date)
      },
      include: {
        project: {
          select: { name: true, projectId: true }
        }
      }
    });

    res.json(expense);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// Delete expense
router.delete('/expenses/:id', authorize(['ADMIN', 'PROJECT_MANAGER', 'FINANCE_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.expense.delete({
      where: { id }
    });

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// Get all invoices
router.get('/invoices', async (req: AuthRequest, res) => {
  try {
    const { projectId, status, milestoneId } = req.query;

    const invoices = await prisma.invoice.findMany({
      where: {
        ...(projectId && { projectId: projectId as string }),
        ...(status && { status: status as any }),
        ...(milestoneId && { milestoneId: milestoneId as string })
      },
      include: {
        project: {
          select: { name: true, projectId: true }
        },
        milestone: {
          select: { name: true }
        }
      },
      orderBy: {
        issueDate: 'desc'
      }
    });

    res.json(invoices);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Create new invoice
router.post('/invoices', authorize(['ADMIN', 'FINANCE_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const { projectId, milestoneId, amount, issueDate, dueDate } = req.body;

    if (!projectId || !amount || !issueDate || !dueDate) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if milestone exists (if provided)
    if (milestoneId) {
      const milestone = await prisma.milestone.findUnique({
        where: { id: milestoneId }
      });

      if (!milestone) {
        return res.status(404).json({ error: 'Milestone not found' });
      }
    }

    // Generate invoice number
    const invoiceCount = await prisma.invoice.count();
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(6, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        amount,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        projectId,
        milestoneId: milestoneId || null
      },
      include: {
        project: {
          select: { name: true, projectId: true }
        },
        milestone: {
          select: { name: true }
        }
      }
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Update invoice status
router.patch('/invoices/:id/status', authorize(['ADMIN', 'FINANCE_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status, paidDate } = req.body;

    const validStatuses = ['PENDING', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData: any = { status };
    
    if (status === 'PAID' && paidDate) {
      updateData.paidDate = new Date(paidDate);
    } else if (status === 'PAID' && !paidDate) {
      updateData.paidDate = new Date();
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        project: {
          select: { name: true, projectId: true }
        },
        milestone: {
          select: { name: true }
        }
      }
    });

    res.json(invoice);
  } catch (error) {
    console.error('Update invoice status error:', error);
    res.status(500).json({ error: 'Failed to update invoice status' });
  }
});

// Get project budget analysis
router.get('/budget/:projectId', async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        expenses: true,
        allocations: {
          where: { isActive: true },
          include: {
            resource: {
              select: { name: true, hourlyRate: true }
            }
          }
        },
        invoices: true
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Calculate total expenses
    const totalExpenses = project.expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

    // Calculate resource costs
    const resourceCosts = project.allocations.reduce((sum, allocation) => {
      const days = Math.ceil((allocation.endDate.getTime() - allocation.startDate.getTime()) / (1000 * 60 * 60 * 24));
      const hoursPerDay = 8; // Assuming 8 hours per day
      const totalHours = days * hoursPerDay * (Number(allocation.allocation) / 100);
      return sum + (totalHours * Number(allocation.hourlyRate));
    }, 0);

    // Calculate total invoiced
    const totalInvoiced = project.invoices.reduce((sum, invoice) => sum + Number(invoice.amount), 0);
    const totalPaid = project.invoices
      .filter(invoice => invoice.status === 'PAID')
      .reduce((sum, invoice) => sum + Number(invoice.amount), 0);

    // Calculate expense breakdown by category
    const expenseByCategory = project.expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
      return acc;
    }, {} as Record<string, number>);

    const budget = Number(project.budget);
    const budgetAnalysis = {
      project: {
        id: project.id,
        name: project.name,
        budget,
        poAmount: Number(project.poAmount)
      },
      expenses: {
        total: totalExpenses,
        byCategory: expenseByCategory,
        resourceCosts
      },
      budget: {
        allocated: budget,
        spent: totalExpenses + resourceCosts,
        remaining: budget - (totalExpenses + resourceCosts),
        utilization: ((totalExpenses + resourceCosts) / budget) * 100
      },
      invoicing: {
        totalInvoiced,
        totalPaid,
        outstanding: totalInvoiced - totalPaid
      },
      alerts: {
        budgetOverrun: (totalExpenses + resourceCosts) > budget,
        budgetWarning: ((totalExpenses + resourceCosts) / budget) > 0.8
      }
    };

    res.json(budgetAnalysis);
  } catch (error) {
    console.error('Get budget analysis error:', error);
    res.status(500).json({ error: 'Failed to fetch budget analysis' });
  }
});

// Get financial summary for all projects
router.get('/summary', async (req: AuthRequest, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        status: { not: 'ARCHIVED' }
      },
      include: {
        expenses: true,
        invoices: true,
        allocations: {
          where: { isActive: true }
        }
      }
    });

    const summary = {
      totalProjects: projects.length,
      totalBudget: projects.reduce((sum, project) => sum + Number(project.budget), 0),
      totalPO: projects.reduce((sum, project) => sum + Number(project.poAmount), 0),
      totalExpenses: projects.reduce((sum, project) => 
        sum + project.expenses.reduce((expSum, expense) => expSum + Number(expense.amount), 0), 0
      ),
      totalInvoiced: projects.reduce((sum, project) => 
        sum + project.invoices.reduce((invSum, invoice) => invSum + Number(invoice.amount), 0), 0
      ),
      totalPaid: projects.reduce((sum, project) => 
        sum + project.invoices
          .filter(invoice => invoice.status === 'PAID')
          .reduce((paidSum, invoice) => paidSum + Number(invoice.amount), 0), 0
      ),
      overBudgetProjects: projects.filter(project => {
        const totalExpenses = project.expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
        return totalExpenses > Number(project.budget);
      }).length
    };

    res.json(summary);
  } catch (error) {
    console.error('Get financial summary error:', error);
    res.status(500).json({ error: 'Failed to fetch financial summary' });
  }
});

// Get overdue invoices
router.get('/invoices/overdue', async (req: AuthRequest, res) => {
  try {
    const currentDate = new Date();

    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        AND: [
          { dueDate: { lt: currentDate } },
          { status: { not: 'PAID' } },
          { status: { not: 'CANCELLED' } }
        ]
      },
      include: {
        project: {
          select: { name: true, projectId: true, clientName: true }
        },
        milestone: {
          select: { name: true }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    });

    const overdueWithDays = overdueInvoices.map(invoice => ({
      ...invoice,
      daysOverdue: Math.floor(
        (currentDate.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
      )
    }));

    res.json(overdueWithDays);
  } catch (error) {
    console.error('Get overdue invoices error:', error);
    res.status(500).json({ error: 'Failed to fetch overdue invoices' });
  }
});

export default router;