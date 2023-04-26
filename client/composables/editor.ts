import { useClipboard } from '@vueuse/core'

export function useCopy() {
  const clipboard = useClipboard()

  return (text: string) => {
    clipboard.copy(text)
    // TODO: show toast
  }
}
