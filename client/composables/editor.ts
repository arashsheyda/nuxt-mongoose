import { useClipboard } from '@vueuse/core'
import { showNotification } from './dialog'

export function useCopy() {
  const clipboard = useClipboard()

  return (text: string) => {
    clipboard.copy(text)
    showNotification({
      message: 'Copied to clipboard',
      icon: 'carbon-copy',
    })
  }
}
