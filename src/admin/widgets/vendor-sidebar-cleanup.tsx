import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect } from "react"

const VendorSidebarCleanup = () => {
  useEffect(() => {
    const actorType = localStorage.getItem("vmall_actor_type")
    if (actorType === "vendor") {
      document.documentElement.classList.add("vendor-user")
    } else {
      document.documentElement.classList.remove("vendor-user")
    }

    const handleStorage = () => {
      const updated = localStorage.getItem("vmall_actor_type")
      if (updated === "vendor") {
        document.documentElement.classList.add("vendor-user")
      } else {
        document.documentElement.classList.remove("vendor-user")
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  return null
}

export const config = defineWidgetConfig({
  zone: "order.list.before",
})

export default VendorSidebarCleanup
