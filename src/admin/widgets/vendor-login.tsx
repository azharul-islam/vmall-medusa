import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, Input, toast } from "@medusajs/ui"
import { BuildingStorefront } from "@medusajs/icons"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { sdk } from "../lib/sdk"

const VendorLogin = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleVendorLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password")
      return
    }

    try {
      const token = await sdk.auth.login("vendor", "emailpass", {
        email,
        password,
      })

      if (typeof token !== "string") {
        toast.error("Invalid credentials")
        return
      }

      localStorage.setItem("vmall_actor_type", "vendor")

      await sdk.client.fetch("/auth/session", {
        method: "POST",
      })

      navigate("/vendor")
    } catch (error: any) {
      toast.error(error.message || "Invalid vendor credentials")
    }
  }

  return (
    <>
      <div className="my-4 flex items-center gap-x-3">
        <div className="h-px flex-1 bg-ui-border-base" />
        <span className="text-ui-fg-muted text-xs">or</span>
        <div className="h-px flex-1 bg-ui-border-base" />
      </div>
      <div className="flex flex-col gap-y-3">
        <div className="flex items-center gap-x-2">
          <BuildingStorefront className="text-ui-fg-subtle size-4" />
          <span className="text-ui-fg-subtle text-sm font-medium">Vendor Login</span>
        </div>
        <Input
          type="email"
          placeholder="Vendor email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleVendorLogin()
          }}
        />
        <Button
          variant="secondary"
          className="w-full"
          onClick={handleVendorLogin}
        >
          Login as Vendor
        </Button>
      </div>
    </>
  )
}

export const config = defineWidgetConfig({
  zone: "login.after",
})

export default VendorLogin
