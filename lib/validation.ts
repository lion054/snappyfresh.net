import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'

// Base schemas
export const emailSchema = z.string().email('Invalid email address')

export const phoneSchema = z.string().regex(
  /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
  'Invalid phone number'
)

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  companyName: z.string().max(100).optional(),
  email: emailSchema,
  phoneNumber: z.string().min(1, 'Phone number is required'),
  whatsAppNumber: z.string().optional(),
  isCompany: z.boolean(),
  tin: z.string().max(50).optional(),
  vatNumber: z.string().max(50).optional(),
  password: passwordSchema,
  confirmPassword: z.string(),
  billToAddress: z.object({
    addressLine1: z.string().min(1, 'Address is required'),
    suburb: z.string().optional().default(''),
    city: z.string().min(1, 'City is required'),
    countryCode: z.string().min(1, 'Country is required'),
    countryName: z.string().optional(),
  }),
  notes: z.string().max(500).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z.object({
  email: emailSchema,
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// Checkout schema
export const checkoutSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: emailSchema,
  mobile: phoneSchema,
  billingAddress: z.string().min(5, 'Address is required').max(200),
  billingCity: z.string().min(2, 'City is required').max(50),
  paymentMethod: z.enum(['PayNow', 'InnBucks', 'Ecocash', 'COD', 'Pay on Account']),
  deliveryInstructions: z.string().max(500).optional(),
  deliveryType: z.enum(['asap', 'scheduled']),
  scheduledDate: z.string().optional(),
  scheduledTimeSlot: z.string().optional(),
  paymentPhoneNumber: phoneSchema.optional(),
}).refine((data) => {
  if (data.deliveryType === 'scheduled') {
    return !!data.scheduledDate && !!data.scheduledTimeSlot
  }
  return true
}, {
  message: 'Scheduled delivery requires date and time slot',
  path: ['scheduledDate'],
}).refine((data) => {
  if (['Ecocash', 'InnBucks'].includes(data.paymentMethod)) {
    return !!data.paymentPhoneNumber
  }
  return true
}, {
  message: 'Payment phone number is required for this payment method',
  path: ['paymentPhoneNumber'],
})

// Redirect validation
/**
 * Validate that a redirect URL is a safe relative path.
 * Prevents open redirect attacks by rejecting absolute URLs,
 * protocol-relative URLs, and other dangerous patterns.
 */
export function isSafeRedirect(url: any) {
  if (!url || typeof url !== 'string') return false
  if (!url.startsWith('/') || url.startsWith('//')) return false
  if (url.includes('\\')) return false
  if (/[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(url)) return false
  if (/[\x00-\x1f]/.test(url)) return false
  return true
}

// Sanitization helpers
export function sanitizeString(input: any) {
  if (typeof input !== 'string') return input
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] })
}

export function sanitizeObject(obj: any) {
  if (typeof obj !== 'object' || obj === null) return obj

  const sanitized: any = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value)
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value)
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

// Validation helper
export function validateData(schema: any, data: any) {
  try {
    const validated = schema.parse(data)
    return { success: true, data: sanitizeObject(validated) }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      }
    }
    return { success: false, errors: [{ message: 'Validation failed' }] }
  }
}

// Phone number masking for display
export function maskPhoneNumber(phone: any) {
  if (!phone || phone.length < 6) return phone;
  const start = phone.slice(0, 4);
  const end = phone.slice(-4);
  const masked = '*'.repeat(Math.max(0, phone.length - 8));
  return `${start}${masked}${end}`;
}

// Price formatting for consistency
export function formatPrice(amount: any) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}
