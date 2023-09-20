let _showNotification: typeof showNotification

export function showNotification(data: {
  message: string
  icon?: string
  classes?: string
  duration?: number
}) {
  _showNotification?.(data)
}

export function provideNotificationFn(fn: typeof showNotification) {
  _showNotification = fn
}
