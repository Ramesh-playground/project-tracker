import Joi from 'joi';

export const validateProject = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  projectId: Joi.string().min(1).max(50).required(),
  description: Joi.string().max(1000).optional(),
  poNumber: Joi.string().min(1).max(100).required(),
  poDate: Joi.date().required(),
  poAmount: Joi.number().positive().required(),
  clientName: Joi.string().min(1).max(200).required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
  budget: Joi.number().positive().required()
});

export const validateResource = Joi.object({
  resourceId: Joi.string().min(1).max(50).required(),
  name: Joi.string().min(1).max(200).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().max(20).optional(),
  salary: Joi.number().positive().optional(),
  hourlyRate: Joi.number().positive().optional(),
  yearsOfExp: Joi.number().integer().min(0).required(),
  skills: Joi.array().items(Joi.string()).required(),
  certifications: Joi.array().items(Joi.string()).optional()
});

export const validateMilestone = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(1000).optional(),
  scheduledDate: Joi.date().required(),
  isBillingMilestone: Joi.boolean().default(false),
  billingAmount: Joi.number().positive().when('isBillingMilestone', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  billingPercentage: Joi.number().min(0).max(100).optional()
});

export const validateExpense = Joi.object({
  description: Joi.string().min(1).max(500).required(),
  amount: Joi.number().positive().required(),
  category: Joi.string().valid('RESOURCE_COST', 'LICENSE', 'INFRASTRUCTURE', 'TRAVEL', 'MATERIAL', 'OTHER').required(),
  date: Joi.date().required()
});

export const validateUser = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('ADMIN', 'PROJECT_MANAGER', 'RESOURCE_MANAGER', 'FINANCE_MANAGER', 'EXECUTIVE').default('PROJECT_MANAGER')
});

export const validateLogin = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});