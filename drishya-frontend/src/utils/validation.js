import * as yup from 'yup';

// Login validation matching backend requirements
export const loginSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required'),
});

// Register validation matching backend requirements
export const registerSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  role: yup
    .string()
    .oneOf(['admin', 'member'], 'Role must be admin or member')
    .required('Role is required'),
});

// Task validation matching backend requirements
export const taskSchema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .max(255, 'Title is too long'),
  description: yup.string(),
  status: yup
    .string()
    .oneOf(['Todo', 'In Progress', 'Done'])
    .required('Status is required'),
  priority: yup
    .string()
    .oneOf(['Low', 'Medium', 'High'])
    .required('Priority is required'),
  due_date: yup
    .date()
    .nullable()
    .min(new Date(), 'Due date cannot be in the past'),
  assignee_id: yup.string().uuid().nullable(),
  team_id: yup.string().uuid().nullable()
});
