import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import "./App.css"
import { BrowserRouter } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import { Toaster } from "./components/ui/sonner"
import { AppRoutes } from "./routes/app-routes"

const rootElement = document.getElementById("root") as HTMLElement

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <AppRoutes />
        <Toaster richColors position="top-center" duration={3000} />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
)
