import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters long'),
});

export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must be less than 50 characters long'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters long'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export const productSchema = z.object({
  name: z.string().min(1, 'Product Name is required'),
  description: z.string().default(''),
  price: z.coerce.number().gt(0, 'Price must be greater than $0.00'),
  stockStatus: z.enum(['instock', 'outstock']),
  categoryId: z.coerce.number().int().positive('Please select a Category'),
  imageUrls: z.array(z.string()).default([]),
});

export type ProductInput = z.infer<typeof productSchema>;
