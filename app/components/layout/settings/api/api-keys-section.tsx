"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Copy, Plus, Trash2, Activity, Clock, MoreHorizontal, Edit, RefreshCw, Eye, EyeOff } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useUser } from "@/lib/user-store/provider"
import { ApiKey, CreateApiKeyRequest } from "@/lib/api-keys/types"
import { UpgradeButton } from "@/app/components/stripe/upgrade-button"

export function ApiKeysSection() {
  const { user } = useUser()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [usageStats, setUsageStats] = useState<any>(null)

  // Form state
  const [keyName, setKeyName] = useState("")
  const [allowedOrigins, setAllowedOrigins] = useState("")


  // Additional states for actions
  const [renamingKey, setRenamingKey] = useState<string | null>(null)
  const [newKeyName, setNewKeyName] = useState("")

  useEffect(() => {
    if (user?.tier && user.tier !== 'basic') {
      fetchApiKeys()
    } else {
      setLoading(false)
    }
  }, [user])

  // Debug: Log when apiKeys state changes
  useEffect(() => {
    console.log('API keys state changed:', apiKeys)
    console.log('API keys length:', apiKeys.length)
  }, [apiKeys])

  const fetchApiKeys = async () => {
    try {
      setLoading(true)
      console.log('Fetching API keys...') // Debug log
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch('/api/user-api-keys', {
        signal: controller.signal,
        cache: 'no-store' // Ensure fresh data
      })
      clearTimeout(timeoutId)
      
      console.log('API keys response status:', response.status) // Debug log
      
      if (response.ok) {
        const data = await response.json()
        console.log('API keys data received:', data) // Debug log
        console.log('API keys array:', data.apiKeys) // Debug log
        console.log('API keys count:', data.apiKeys?.length || 0) // Debug log
        console.log('Current apiKeys state before update:', apiKeys) // Debug log
        
        setApiKeys(data.apiKeys || [])
        setUsageStats(data.usageStats || null)
        
        console.log('API keys state should be updated now') // Debug log
      } else {
        const error = await response.json()
        console.error('API keys error:', error) // Debug log
        toast.error('Failed to load API keys', {
          description: error.error || 'Please try again'
        })
      }
    } catch (error) {
      console.error('API keys fetch error:', error) // Debug log
      if (error instanceof Error && error.name === 'AbortError') {
        toast.error('Request timed out', {
          description: 'Please check your connection and try again.'
        })
      } else {
        toast.error('Failed to load API keys', {
          description: 'Network error. Please try again.'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const createApiKey = async () => {
    if (!keyName.trim()) {
      toast.error('Key name is required')
      return
    }

    setCreating(true)

    try {
      const request: CreateApiKeyRequest = {
        key_name: keyName.trim(),
        permissions: ['search', 'people'], // Default permissions for all API keys
        expires_at: null, // No expiry
        allowed_origins: allowedOrigins ? allowedOrigins.split('\n').map(o => o.trim()).filter(Boolean) : undefined
      }

      const response = await fetch('/api/user-api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('API key created successfully')
        
        // Refresh list immediately to show the new key
        await fetchApiKeys()
        
        // Close form and reset
        setKeyName("")
        setAllowedOrigins("")
        setShowCreateForm(false)
      } else {
        toast.error('Failed to create API key', {
          description: data.error || 'Please try again'
        })
      }
    } catch (error) {
      toast.error('Failed to create API key', {
        description: 'Network error. Please try again.'
      })
    } finally {
      setCreating(false)
    }
  }

  const deleteApiKey = async (keyId: string, keyName: string) => {
    try {
      const response = await fetch('/api/user-api-keys', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ keyId })
      })

      if (response.ok) {
        toast.success(`API key "${keyName}" revoked successfully`)
        fetchApiKeys()
      } else {
        const error = await response.json()
        toast.error('Failed to revoke API key', {
          description: error.error || 'Please try again'
        })
      }
    } catch (error) {
      toast.error('Failed to revoke API key', {
        description: 'Network error. Please try again.'
      })
    }
  }



  const renameApiKey = async (keyId: string) => {
    if (!newKeyName.trim()) {
      toast.error('Key name is required')
      return
    }

    try {
      const response = await fetch('/api/user-api-keys', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ keyId, key_name: newKeyName.trim() })
      })

      if (response.ok) {
        toast.success('API key renamed successfully')
        setRenamingKey(null)
        setNewKeyName("")
        fetchApiKeys()
      } else {
        const error = await response.json()
        toast.error('Failed to rename API key', {
          description: error.error || 'Please try again'
        })
      }
    } catch (error) {
      toast.error('Failed to rename API key', {
        description: 'Network error. Please try again.'
      })
    }
  }

  const regenerateApiKey = async (keyId: string, keyName: string) => {
    try {
      console.log('Regenerating API key:', keyId, keyName) // Debug log
      
      const response = await fetch('/api/user-api-keys', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ keyId })
      })

      console.log('Regenerate response status:', response.status) // Debug log
      
      const data = await response.json()
      console.log('Regenerate response data:', data) // Debug log

      if (response.ok) {
        toast.success(`API key "${keyName}" regenerated successfully`)
        fetchApiKeys()
      } else {
        console.error('Regenerate API error:', data) // Debug log
        console.error('Regenerate API full response:', response) // Debug log
        toast.error('Failed to regenerate API key', {
          description: data.error || `Server error (${response.status}). Please try again.`
        })
      }
    } catch (error) {
      console.error('Regenerate network error:', error) // Debug log
      toast.error('Failed to regenerate API key', {
        description: 'Network error. Please try again.'
      })
    }
  }

  const toggleApiKey = async (keyId: string, keyName: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/user-api-keys', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ keyId, is_active: !currentStatus })
      })

      if (response.ok) {
        const action = currentStatus ? 'disabled' : 'enabled'
        toast.success(`API key "${keyName}" ${action} successfully`)
        fetchApiKeys()
      } else {
        const error = await response.json()
        toast.error(`Failed to ${currentStatus ? 'disable' : 'enable'} API key`, {
          description: error.error || 'Please try again'
        })
      }
    } catch (error) {
      toast.error(`Failed to ${currentStatus ? 'disable' : 'enable'} API key`, {
        description: 'Network error. Please try again.'
      })
    }
  }

  const getStatusBadge = (key: ApiKey) => {
    if (!key.is_active) {
      return <Badge variant="secondary" className="border-red-400 bg-red-50 text-red-800 dark:bg-red-900/70">inactive</Badge>
    }
    if (key.expires_at && new Date(key.expires_at) < new Date()) {
      return <Badge variant="secondary" className="border-orange-400 bg-orange-50 text-orange-800 dark:bg-orange-900/70">expired</Badge>
    }
    return <Badge variant="secondary" className="border-green-400 bg-green-50 text-green-800 dark:bg-green-900/70">active</Badge>
  }

  if (!user) return null

  if (user.tier === 'basic') {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium">API Access</h3>
          <p className="text-xs text-muted-foreground">
            Programmatic access to inVerus services
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">API access requires Pro or Enterprise tier</p>
            <p className="text-xs text-muted-foreground">
              Create API keys to access inVerus programmatically
            </p>
          </div>
          <UpgradeButton tier="pro">
            Upgrade to Pro
          </UpgradeButton>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium">API Keys</h3>
          <p className="text-xs text-muted-foreground">
            Manage your API keys for programmatic access
          </p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full" />
          <p className="text-muted-foreground ml-3 text-sm">Loading API keys...</p>
        </div>
      </div>
    )
  }

  const maxKeys = user.tier === 'enterprise' ? 10 : 3

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-sm font-medium">API Keys ({apiKeys.length}/{maxKeys})</h3>
        <p className="text-xs text-muted-foreground">
          Manage your API keys for programmatic access
        </p>
      </div>

      {/* Usage Stats */}
      {usageStats && (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">API Usage</p>
            <p className="text-xs text-muted-foreground">
              {usageStats.requestsToday} requests today • {usageStats.requestsThisMonth} this month
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{usageStats.totalRequests}</p>
            <p className="text-xs text-muted-foreground">Total requests</p>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <div>
            <h4 className="text-sm font-medium">Create New API Key</h4>
            <p className="text-xs text-muted-foreground">
              Enter a name for your new API key
            </p>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="keyName" className="text-xs">API key name</Label>
              <Input
                id="keyName"
                placeholder="e.g., Production App"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                className="h-8 text-sm"
                required
              />
            </div>

            <div>
              <Label htmlFor="origins" className="text-xs">Allowed Origins (optional)</Label>
              <Textarea
                id="origins"
                placeholder="https://example.com (one per line)"
                value={allowedOrigins}
                onChange={(e) => setAllowedOrigins(e.target.value)}
                className="min-h-[60px] resize-none text-sm"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
              <Button 
                size="sm"
                disabled={creating}
                onClick={createApiKey}
              >
                {creating ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* API Keys List */}
      {apiKeys.length === 0 ? (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">No API Keys</p>
            <p className="text-xs text-muted-foreground">
              Create your first API key to start using the inVerus API
            </p>
          </div>
          <Button 
            size="sm"
            disabled={apiKeys.length >= maxKeys}
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="size-4 mr-1" />
            Create Key
          </Button>
        </div>
      ) : (
        <>
          {/* Create Button */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Your API Keys</p>
              <p className="text-xs text-muted-foreground">
                Keys for programmatic access to inVerus services
              </p>
            </div>
            <Button 
              size="sm"
              variant="outline"
              disabled={apiKeys.length >= maxKeys}
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              <Plus className="size-4 mr-1" />
              {showCreateForm ? 'Cancel' : 'Create Key'}
            </Button>
          </div>

          {/* API Keys */}
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div key={key.id} className="space-y-2">
                {/* Key Header with truncated key and copy button */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono">
                      {(key.key_prefix.startsWith('sk_live') && key.key_prefix.length > 40)
                        ? `${key.key_prefix.substring(0, 6)}...${key.key_prefix.slice(-4)}`
                        : key.key_prefix
                      }
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        // Always copy the stored key_prefix (which contains the full key)
                        navigator.clipboard.writeText(key.key_prefix)
                        toast.success('Full API key copied to clipboard')
                      }}
                      title="Copy full API key"
                    >
                      <Copy className="size-3" />
                    </Button>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="More actions">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem 
                        onClick={() => {
                          setRenamingKey(key.id)
                          setNewKeyName(key.key_name)
                        }}
                      >
                        <Edit className="size-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => regenerateApiKey(key.id, key.key_name)}
                      >
                        <RefreshCw className="size-4 mr-2" />
                        Regenerate Key
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => toggleApiKey(key.id, key.key_name, key.is_active)}
                      >
                        {key.is_active ? (
                          <>
                            <EyeOff className="size-4 mr-2" />
                            Disable
                          </>
                        ) : (
                          <>
                            <Eye className="size-4 mr-2" />
                            Enable
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => deleteApiKey(key.id, key.key_name)}
                      >
                        <Trash2 className="size-4 mr-2" />
                        Revoke
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Key Details */}
                <div className="px-3 pb-2">
                  {renamingKey === key.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        className="h-7 text-xs"
                        placeholder="Enter new name"
                      />
                      <Button
                        size="sm"
                        className="h-7"
                        onClick={() => renameApiKey(key.id)}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7"
                        onClick={() => {
                          setRenamingKey(null)
                          setNewKeyName("")
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium">{key.key_name}</p>
                          {getStatusBadge(key)}
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="size-3" />
                            Created {new Date(key.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Activity className="size-3" />
                            {key.total_requests || 0} requests
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}