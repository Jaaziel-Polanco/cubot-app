import { toast as showToast } from '@/components/ui/use-toast'

/**
 * Helper function to show success toast
 */
export function toastSuccess(title: string, description?: string) {
  showToast({
    title,
    description,
    variant: 'default',
  })
}

/**
 * Helper function to show error toast
 */
export function toastError(title: string, description?: string) {
  showToast({
    title,
    description,
    variant: 'destructive',
  })
}

/**
 * Helper function to show info toast
 */
export function toastInfo(title: string, description?: string) {
  showToast({
    title,
    description,
    variant: 'default',
  })
}

/**
 * Main toast function that can be used directly
 */
export const toast = {
  success: toastSuccess,
  error: toastError,
  info: toastInfo,
  default: showToast,
}

