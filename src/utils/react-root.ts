import type { ReactNode } from "react"
import { createRoot } from "react-dom/client"

let root: ReturnType<typeof createRoot> | null = null

/**
 * Renders a React root that persists across HMR updates.
 */
export function renderPersistentReactRoot(
  container: Element | DocumentFragment,
  initialElement: ReactNode,
) {
  if (!root) {
    root = createRoot(container)
  }

  root.render(initialElement)

  // HMR support
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      root?.unmount()
      root = null
    })
  }
}