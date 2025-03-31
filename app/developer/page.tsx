"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import { isDeveloper } from "@/lib/auth-utils"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
    AlertTriangle,
    Database,
    FileText,
    Trash2,
    Users,
    Settings,
    Terminal,
    RefreshCw,
    Edit,
    Eye,
} from "lucide-react"

export default function DeveloperDashboard() {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const [activeTab, setActiveTab] = useState("forms")

    // Form management states
    const [formId, setFormId] = useState("")
    const [formData, setFormData] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)

    // User management states
    const [userId, setUserId] = useState("")
    const [userData, setUserData] = useState("")

    // Database query state
    const [sqlQuery, setSqlQuery] = useState("SELECT * FROM forms LIMIT 10;")
    const [queryResult, setQueryResult] = useState("")

    useEffect(() => {
        // Redirect if not a developer
        if (!isLoading && (!user || !isDeveloper(user.id))) {
            toast({
                title: "Access Denied",
                description: "You don't have permission to access this area.",
                variant: "destructive",
            })
            router.push("/")
        }
    }, [user, isLoading, router, toast])

    // Function to execute a direct database query
    const executeQuery = async () => {
        setIsProcessing(true)
        try {
            const response = await fetch("/api/supabase/developer/query", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query: sqlQuery }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || "Failed to execute query")
            }

            setQueryResult(JSON.stringify(result.data, null, 2))
            toast({
                title: "Query Executed",
                description: "Database query executed successfully.",
            })
        } catch (error) {
            console.error("Error executing query:", error)
            toast({
                title: "Query Error",
                description: error instanceof Error ? error.message : "Failed to execute query",
                variant: "destructive",
            })
            setQueryResult(error instanceof Error ? error.message : "Unknown error")
        } finally {
            setIsProcessing(false)
        }
    }

    // Function to get form by ID
    const getFormById = async () => {
        if (!formId.trim()) {
            toast({
                title: "Form ID Required",
                description: "Please enter a form ID",
                variant: "destructive",
            })
            return
        }

        setIsProcessing(true)
        try {
            const response = await fetch("/api/supabase/rls-bypass", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    operation: "select",
                    table: "forms",
                    data: "*",
                    filters: {
                        eq: {
                            id: formId,
                        },
                    },
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || "Failed to get form")
            }

            if (!result.data || result.data.length === 0) {
                toast({
                    title: "Form Not Found",
                    description: `No form found with ID: ${formId}`,
                    variant: "destructive",
                })
                setFormData("")
                return
            }

            // Get form elements
            const elementsResponse = await fetch("/api/supabase/rls-bypass", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    operation: "select",
                    table: "form_elements",
                    data: "*",
                    filters: {
                        eq: {
                            form_id: formId,
                        },
                        order: {
                            order: "asc",
                        },
                    },
                }),
            })

            const elementsResult = await elementsResponse.json()

            const fullForm = {
                ...result.data[0],
                elements: elementsResult.data || [],
            }

            setFormData(JSON.stringify(fullForm, null, 2))
            toast({
                title: "Form Retrieved",
                description: "Form data retrieved successfully.",
            })
        } catch (error) {
            console.error("Error getting form:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to get form",
                variant: "destructive",
            })
        } finally {
            setIsProcessing(false)
        }
    }

    // Function to delete form by ID
    const deleteFormById = async () => {
        if (!formId.trim()) {
            toast({
                title: "Form ID Required",
                description: "Please enter a form ID",
                variant: "destructive",
            })
            return
        }

        if (!confirm(`Are you sure you want to delete form with ID: ${formId}? This action cannot be undone.`)) {
            return
        }

        setIsProcessing(true)
        try {
            // First delete form elements
            const elementsResponse = await fetch("/api/supabase/rls-bypass", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    operation: "delete",
                    table: "form_elements",
                    filters: {
                        eq: {
                            form_id: formId,
                        },
                    },
                }),
            })

            if (!elementsResponse.ok) {
                const elementsResult = await elementsResponse.json()
                throw new Error(elementsResult.error || "Failed to delete form elements")
            }

            // Then delete form responses
            const responsesResponse = await fetch("/api/supabase/rls-bypass", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    operation: "delete",
                    table: "form_responses",
                    filters: {
                        eq: {
                            form_id: formId,
                        },
                    },
                }),
            })

            if (!responsesResponse.ok) {
                const responsesResult = await responsesResponse.json()
                throw new Error(responsesResult.error || "Failed to delete form responses")
            }

            // Finally delete the form
            const formResponse = await fetch("/api/supabase/rls-bypass", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    operation: "delete",
                    table: "forms",
                    filters: {
                        eq: {
                            id: formId,
                        },
                    },
                }),
            })

            if (!formResponse.ok) {
                const formResult = await formResponse.json()
                throw new Error(formResult.error || "Failed to delete form")
            }

            toast({
                title: "Form Deleted",
                description: `Form with ID ${formId} has been deleted successfully.`,
            })

            setFormId("")
            setFormData("")
        } catch (error) {
            console.error("Error deleting form:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete form",
                variant: "destructive",
            })
        } finally {
            setIsProcessing(false)
        }
    }

    // Function to update form by ID
    const updateFormById = async () => {
        if (!formId.trim() || !formData.trim()) {
            toast({
                title: "Form Data Required",
                description: "Please enter both form ID and form data",
                variant: "destructive",
            })
            return
        }

        setIsProcessing(true)
        try {
            let parsedFormData
            try {
                parsedFormData = JSON.parse(formData)
            } catch (e) {
                throw new Error("Invalid JSON format for form data")
            }

            // Extract elements from the form data
            const elements = parsedFormData.elements || []
            delete parsedFormData.elements

            // Update form metadata
            const formResponse = await fetch("/api/supabase/rls-bypass", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    operation: "update",
                    table: "forms",
                    data: {
                        ...parsedFormData,
                        updated_at: new Date().toISOString(),
                    },
                    filters: {
                        eq: {
                            id: formId,
                        },
                    },
                }),
            })

            if (!formResponse.ok) {
                const formResult = await formResponse.json()
                throw new Error(formResult.error || "Failed to update form")
            }

            // Delete existing elements
            const deleteResponse = await fetch("/api/supabase/rls-bypass", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    operation: "delete",
                    table: "form_elements",
                    filters: {
                        eq: {
                            form_id: formId,
                        },
                    },
                }),
            })

            if (!deleteResponse.ok) {
                const deleteResult = await deleteResponse.json()
                throw new Error(deleteResult.error || "Failed to delete existing form elements")
            }

            // Insert new elements if they exist
            if (elements.length > 0) {
                const elementsResponse = await fetch("/api/supabase/rls-bypass", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        operation: "insert",
                        table: "form_elements",
                        data: elements.map((element: any, index: number) => ({
                            ...element,
                            form_id: formId,
                            order: index,
                        })),
                    }),
                })

                if (!elementsResponse.ok) {
                    const elementsResult = await elementsResponse.json()
                    throw new Error(elementsResult.error || "Failed to insert form elements")
                }
            }

            toast({
                title: "Form Updated",
                description: `Form with ID ${formId} has been updated successfully.`,
            })

            // Refresh form data
            getFormById()
        } catch (error) {
            console.error("Error updating form:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update form",
                variant: "destructive",
            })
        } finally {
            setIsProcessing(false)
        }
    }

    // Function to get user by ID
    const getUserById = async () => {
        if (!userId.trim()) {
            toast({
                title: "User ID Required",
                description: "Please enter a user ID",
                variant: "destructive",
            })
            return
        }

        setIsProcessing(true)
        try {
            // Get user's forms
            const formsResponse = await fetch("/api/supabase/rls-bypass", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    operation: "select",
                    table: "forms",
                    data: "*",
                    filters: {
                        eq: {
                            created_by: userId,
                        },
                    },
                }),
            })

            const formsResult = await formsResponse.json()

            if (!formsResponse.ok) {
                throw new Error(formsResult.error || "Failed to get user forms")
            }

            // Get user's responses
            const responsesResponse = await fetch("/api/supabase/rls-bypass", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    operation: "select",
                    table: "form_responses",
                    data: "*",
                    filters: {
                        eq: {
                            respondent_id: userId,
                        },
                    },
                }),
            })

            const responsesResult = await responsesResponse.json()

            if (!responsesResponse.ok) {
                throw new Error(responsesResult.error || "Failed to get user responses")
            }

            const userData = {
                id: userId,
                forms: formsResult.data || [],
                responses: responsesResult.data || [],
            }

            setUserData(JSON.stringify(userData, null, 2))
            toast({
                title: "User Data Retrieved",
                description: "User data retrieved successfully.",
            })
        } catch (error) {
            console.error("Error getting user data:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to get user data",
                variant: "destructive",
            })
        } finally {
            setIsProcessing(false)
        }
    }

    // Function to view form in the UI
    const viewForm = () => {
        if (!formId.trim()) {
            toast({
                title: "Form ID Required",
                description: "Please enter a form ID",
                variant: "destructive",
            })
            return
        }

        router.push(`/forms/${formId}`)
    }

    // Function to edit form in the UI
    const editForm = () => {
        if (!formId.trim()) {
            toast({
                title: "Form ID Required",
                description: "Please enter a form ID",
                variant: "destructive",
            })
            return
        }

        router.push(`/forms/${formId}/edit`)
    }

    if (isLoading || !user || !isDeveloper(user.id)) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 container py-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Terminal className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-bold">Developer Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-full">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="text-sm font-medium">Developer Mode</span>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="forms" className="text-base py-2">
                            <FileText className="h-4 w-4 mr-2" /> Forms
                        </TabsTrigger>
                        <TabsTrigger value="users" className="text-base py-2">
                            <Users className="h-4 w-4 mr-2" /> Users
                        </TabsTrigger>
                        <TabsTrigger value="database" className="text-base py-2">
                            <Database className="h-4 w-4 mr-2" /> Database
                        </TabsTrigger>
                        <TabsTrigger value="system" className="text-base py-2">
                            <Settings className="h-4 w-4 mr-2" /> System
                        </TabsTrigger>
                    </TabsList>

                    {/* Forms Tab */}
                    <TabsContent value="forms" className="mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Form Management</CardTitle>
                                        <CardDescription>Manage forms by ID</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="form-id">Form ID</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="form-id"
                                                    value={formId}
                                                    onChange={(e) => setFormId(e.target.value)}
                                                    placeholder="Enter form ID"
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={getFormById}
                                                    disabled={isProcessing}
                                                    className="shrink-0"
                                                >
                                                    {isProcessing ? (
                                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <RefreshCw className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={viewForm}
                                                disabled={!formId.trim() || isProcessing}
                                                className="w-full"
                                            >
                                                <Eye className="h-4 w-4 mr-2" /> View Form
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={editForm}
                                                disabled={!formId.trim() || isProcessing}
                                                className="w-full"
                                            >
                                                <Edit className="h-4 w-4 mr-2" /> Edit Form
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={deleteFormById}
                                                disabled={!formId.trim() || isProcessing}
                                                className="w-full"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" /> Delete Form
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="lg:col-span-2">
                                <Card className="h-full">
                                    <CardHeader>
                                        <CardTitle>Form Data</CardTitle>
                                        <CardDescription>View and edit form JSON data</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <Textarea
                                            value={formData}
                                            onChange={(e) => setFormData(e.target.value)}
                                            placeholder="Form data will appear here"
                                            className="font-mono text-sm h-[400px]"
                                        />
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            onClick={updateFormById}
                                            disabled={!formId.trim() || !formData.trim() || isProcessing}
                                            className="ml-auto"
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw className="h-4 w-4 mr-2" /> Update Form
                                                </>
                                            )}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Users Tab */}
                    <TabsContent value="users" className="mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>User Management</CardTitle>
                                        <CardDescription>Manage users by ID</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="user-id">User ID (Discord ID)</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="user-id"
                                                    value={userId}
                                                    onChange={(e) => setUserId(e.target.value)}
                                                    placeholder="Enter user ID"
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={getUserById}
                                                    disabled={isProcessing}
                                                    className="shrink-0"
                                                >
                                                    {isProcessing ? (
                                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <RefreshCw className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="lg:col-span-2">
                                <Card className="h-full">
                                    <CardHeader>
                                        <CardTitle>User Data</CardTitle>
                                        <CardDescription>View user information, forms, and responses</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Textarea
                                            value={userData}
                                            readOnly
                                            placeholder="User data will appear here"
                                            className="font-mono text-sm h-[400px]"
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Database Tab */}
                    <TabsContent value="database" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Database Query</CardTitle>
                                <CardDescription>Execute SQL queries directly against the database</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sql-query">SQL Query</Label>
                                    <Textarea
                                        id="sql-query"
                                        value={sqlQuery}
                                        onChange={(e) => setSqlQuery(e.target.value)}
                                        placeholder="Enter SQL query"
                                        className="font-mono text-sm h-[100px]"
                                    />
                                </div>
                                <Button onClick={executeQuery} disabled={!sqlQuery.trim() || isProcessing}>
                                    {isProcessing ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Executing...
                                        </>
                                    ) : (
                                        <>
                                            <Terminal className="h-4 w-4 mr-2" /> Execute Query
                                        </>
                                    )}
                                </Button>
                                <div className="space-y-2">
                                    <Label htmlFor="query-result">Result</Label>
                                    <Textarea
                                        id="query-result"
                                        value={queryResult}
                                        readOnly
                                        placeholder="Query results will appear here"
                                        className="font-mono text-sm h-[300px]"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* System Tab */}
                    <TabsContent value="system" className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Environment Variables</CardTitle>
                                    <CardDescription>View available environment variables</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 font-mono text-sm">
                                        <div className="flex justify-between p-2 bg-secondary/50 rounded">
                                            <span>NEXT_PUBLIC_SUPABASE_URL</span>
                                            <span className="opacity-50">✓ Set</span>
                                        </div>
                                        <div className="flex justify-between p-2 bg-secondary/50 rounded">
                                            <span>NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                                            <span className="opacity-50">✓ Set</span>
                                        </div>
                                        <div className="flex justify-between p-2 bg-secondary/50 rounded">
                                            <span>SUPABASE_SERVICE_ROLE_KEY</span>
                                            <span className="opacity-50">✓ Set</span>
                                        </div>
                                        <div className="flex justify-between p-2 bg-secondary/50 rounded">
                                            <span>DISCORD_CLIENT_ID</span>
                                            <span className="opacity-50">✓ Set</span>
                                        </div>
                                        <div className="flex justify-between p-2 bg-secondary/50 rounded">
                                            <span>DISCORD_CLIENT_SECRET</span>
                                            <span className="opacity-50">✓ Set</span>
                                        </div>
                                        <div className="flex justify-between p-2 bg-secondary/50 rounded">
                                            <span>DISCORD_REDIRECT_URI</span>
                                            <span className="opacity-50">✓ Set</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>System Information</CardTitle>
                                    <CardDescription>View system status and information</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-sm font-medium text-muted-foreground">Database Status</h3>
                                            <p className="flex items-center gap-2">
                                                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                                Connected
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-muted-foreground">API Status</h3>
                                            <p className="flex items-center gap-2">
                                                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                                Operational
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-muted-foreground">Total Forms</h3>
                                            <p>Loading...</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
                                            <p>Loading...</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-muted-foreground">Total Responses</h3>
                                            <p>Loading...</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}

