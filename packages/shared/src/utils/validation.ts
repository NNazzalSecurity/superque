import { z } from 'zod';
import { ValidationError } from './errors';
import {
  emailSchema,
  phoneSchema,
  coordinatesSchema,
  paginationSchema,
  searchSchema,
} from '../schemas/common';

type ValidationErrorItem = {
  field: string;
  message: string;
};

export const validateWithZod = <S extends z.ZodTypeAny>(
  schema: S,
  data: unknown,
  errorMessage = 'Validation failed'
): z.infer<S> => {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors: ValidationErrorItem[] = result.error.errors.map((err: z.ZodIssue) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    
    throw new ValidationError(errorMessage, errors);
  }
  
  return result.data as z.infer<S>;
};

export type PaginationInput = z.infer<typeof paginationSchema>;

export type SearchInput = z.infer<typeof searchSchema>;

export const validatePhoneOrEmail = (input: string): 'phone' | 'email' => {
  if (input.includes('@')) {
    emailSchema.parse(input);
    return 'email';
  }
  
  phoneSchema.parse(input);
  return 'phone';
};

export const validatePagination = (input: unknown): PaginationInput => {
  return validateWithZod(paginationSchema, input, 'Invalid pagination parameters') as PaginationInput;
};

export const validateSearch = (input: unknown): SearchInput => {
  return validateWithZod(searchSchema, input, 'Invalid search parameters') as SearchInput;
};

export const validateCoordinates = (input: unknown): z.infer<typeof coordinatesSchema> => {
  return validateWithZod(coordinatesSchema, input, 'Invalid coordinates');
};

/**
 * Validates and transforms input data using the provided Zod schema
 * @template T - The expected output type
 * @param {z.ZodSchema<T>} schema - The Zod schema to validate against
 * @param {unknown} data - The data to validate
 * @param {string} [errorMessage='Invalid input data'] - Custom error message
 * @returns {T} - The validated and transformed data
 * @throws {ValidationError} - If validation fails
 */
export const validateInput = <S extends z.ZodTypeAny>(
  schema: S,
  data: unknown,
  errorMessage = 'Invalid input data'
): z.infer<S> => {
  try {
    return schema.parse(data) as z.infer<S>;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const errors: ValidationErrorItem[] = error.errors.map((err: z.ZodIssue) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      throw new ValidationError(errorMessage, errors);
    }
    throw error;
  }
};
