"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import type { UserRole } from "@/lib/types"

export default function RegisterPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "student" as UserRole,
        department: "",
        enrollmentNo: "",
        phone: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleRoleChange = (value: UserRole) => {
        setFormData({ ...formData, role: value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to register")
            }

            toast.success("Account created successfully. Please login.")
            router.push("/")
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-dvh flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Create an Account</h1>
                    <p className="mt-2 text-sm text-muted-foreground">Sign up to access the Smart Attendance system</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 className">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="name" required placeholder="John Doe" value={formData.name} onChange={handleChange} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input id="email" name="email" type="email" required placeholder="john@example.com" value={formData.email} onChange={handleChange} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" required placeholder="••••••••" value={formData.password} onChange={handleChange} />
                    </div>

                    <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={formData.role} onValueChange={handleRoleChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="teacher">Teacher</SelectItem>
                                <SelectItem value="admin">Administrator</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Input id="department" name="department" placeholder="CS, IT..." value={formData.department} onChange={handleChange} />
                        </div>
                        {formData.role === "student" && (
                            <div className="space-y-2">
                                <Label htmlFor="enrollmentNo">Enrollment No.</Label>
                                <Input id="enrollmentNo" name="enrollmentNo" required placeholder="EN12345" value={formData.enrollmentNo} onChange={handleChange} />
                            </div>
                        )}
                    </div>

                    <Button type="submit" className="w-full mt-4" disabled={loading}>
                        {loading ? "Creating Account..." : "Register"}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground mt-4">
                        Already have an account?{" "}
                        <Button variant="link" className="p-0 h-auto font-semibold" onClick={() => router.push("/")}>
                            Log in
                        </Button>
                    </p>
                </form>
            </div>
        </div>
    )
}
