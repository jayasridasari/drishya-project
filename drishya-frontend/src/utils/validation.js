import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required')
});

export const registerSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  role: yup.string().oneOf(['member', 'admin']).required('Role is required'),
});

export const taskSchema = yup.object({
  title: yup.string().required('Title is required').max(255, 'Title too long'),
  description: yup.string(),
  status: yup.string().oneOf(['Todo', 'In Progress', 'Done']).required(),
  priority: yup.string().oneOf(['Low', 'Medium', 'High']).required(),
  due_date: yup.date().nullable().min(new Date(), 'Due date cannot be in the past'),
  assignee_id: yup.string().uuid().nullable(),
  team_id: yup.string().uuid().nullable()
});
