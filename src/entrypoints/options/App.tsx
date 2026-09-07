import { lazy, Suspense } from "react"
import { Route, Routes } from "react-router"
import { Loader2 } from "lucide-react"

const ApiProvidersPage = lazy(() =>
  import("./pages/api-providers").then((module) => ({ default: module.ApiProvidersPage })),
)

const PreferencesPage = lazy(() =>
  import("./pages/preferences").then((module) => ({ default: module.PreferencesPage })),
)

const ShortcutsPage = lazy(() =>
  import("./pages/shortcuts").then((module) => ({ default: module.ShortcutsPage })),
)

const AboutPage = lazy(() =>
  import("./pages/about").then((module) => ({ default: module.AboutPage })),
)

function App() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <Loader2 className="size-6 animate-spin" />
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<ApiProvidersPage />} />
        <Route path="/api-providers" element={<ApiProvidersPage />} />
        <Route path="/preferences" element={<PreferencesPage />} />
        <Route path="/shortcuts" element={<ShortcutsPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Suspense>
  )
}

export default App