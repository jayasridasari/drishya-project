import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

export const registerSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(8, 'Minimum 8 characters').required('Password is required'),
  role: yup.string().oneOf(['admin', 'member']).required('Role is required'),
});

export const taskSchema = yup.object({
  title: yup.string().required('Title is required').max(255, 'Title too long'),
  description: yup.string(),
  status: yup.string().oneOf(['Todo', 'In Progress', 'Done']).required(),
  priority: yup.string().oneOf(['Low', 'Medium', 'High']).required(),
  due_date: yup.date().nullable(),
  assignee_id: yup.string().nullable(),
  team_id: yup.string().nullable()
});
