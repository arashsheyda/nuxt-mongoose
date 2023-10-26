import { useClipboard } from '@vueuse/core'
// import {  } from '@nuxt/devtools-ui-kit'

export function useCopy() {
  const clipboard = useClipboard()

  return (text: string) => {
    clipboard.copy(text)
    // devtoolsUiShowNotification({
    //   message: 'Copied to clipboard',
    //   icon: 'carbon-copy',
    // })
  }
}
