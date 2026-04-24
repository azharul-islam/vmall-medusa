import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"

const LogoutCleanup = () => {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === "/login" || location.pathname === "/") {
      localStorage.removeItem("vmall_actor_type")
      document.documentElement.classList.remove("vendor-user")
    }
  }, [location.pathname])

  return null
}

export const config = defineWidgetConfig({
  zone: "order.list.before",
})

export default LogoutCleanup
