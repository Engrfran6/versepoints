"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Settings, Shield, Database, Bell, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function AdminSettingsContent() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Settings state
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    miningEnabled: true,
    referralEnabled: true,
    minWithdrawal: 1000,
    maxDailyMining: 100,
    platformFee: 0,
    emailNotifications: true,
  })

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Settings saved",
        description: "Platform settings have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          Platform Settings
        </h1>
        <p className="text-muted-foreground mt-1">Configure platform-wide settings</p>
      </div>

      <div className="space-y-6">
        {/* System Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle className="text-foreground">System Settings</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">Control core platform functionality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Temporarily disable the platform for maintenance</p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">User Registration</Label>
                <p className="text-sm text-muted-foreground">Allow new users to register</p>
              </div>
              <Switch
                checked={settings.registrationEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, registrationEnabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Mining System</Label>
                <p className="text-sm text-muted-foreground">Enable daily mining for all users</p>
              </div>
              <Switch
                checked={settings.miningEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, miningEnabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Referral System</Label>
                <p className="text-sm text-muted-foreground">Enable referral rewards</p>
              </div>
              <Switch
                checked={settings.referralEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, referralEnabled: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Points & Mining Configuration */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              <CardTitle className="text-foreground">Points & Mining Configuration</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">Configure points and mining parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="minWithdrawal" className="text-foreground">
                Minimum Withdrawal Amount (VP)
              </Label>
              <Input
                id="minWithdrawal"
                type="number"
                value={settings.minWithdrawal}
                onChange={(e) => setSettings({ ...settings, minWithdrawal: Number(e.target.value) })}
                className="bg-input border-border text-foreground"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="maxDailyMining" className="text-foreground">
                Points Per Mining Session
              </Label>
              <Input
                id="maxDailyMining"
                type="number"
                value={settings.maxDailyMining}
                onChange={(e) => setSettings({ ...settings, maxDailyMining: Number(e.target.value) })}
                className="bg-input border-border text-foreground"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="platformFee" className="text-foreground">
                Platform Fee (%)
              </Label>
              <Input
                id="platformFee"
                type="number"
                value={settings.platformFee}
                onChange={(e) => setSettings({ ...settings, platformFee: Number(e.target.value) })}
                className="bg-input border-border text-foreground"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <CardTitle className="text-foreground">Notifications</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">Configure notification preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Send email notifications to users</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Save className="w-4 h-4" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}
