"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-store"
import type { User, Holiday } from "@/lib/types"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Calendar, Type } from "lucide-react"

export default function AdminHolidaysPage() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [holidays, setHolidays] = useState<Holiday[]>([])
    const [loading, setLoading] = useState(true)

    const [formData, setFormData] = useState({ date: "", name: "", type: "festival", region: "" })

    useEffect(() => {
        const currentUser = getCurrentUser()
        if (!currentUser || currentUser.role !== "admin") {
            router.push("/")
            return
        }
        setUser(currentUser)
        fetchHolidays()
    }, [router])

    const fetchHolidays = async () => {
        try {
            const res = await fetch("/api/holidays")
            if (res.ok) {
                setHolidays(await res.json())
            }
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch("/api/holidays", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                setFormData({ date: "", name: "", type: "festival", region: "" })
                fetchHolidays()
            }
        } catch { }
    }

    if (!user) return null

    return (
        <AppShell user={user} currentPath="/admin/holidays">
            <div className="space-y-6 p-4 lg:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Holiday Calendar
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage institutional and regional holidays. Weekends are grouped automatically.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Declare a Holiday</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            <Input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                            <Input
                                placeholder="Holiday Name (e.g. Diwali)"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="festival">Festival</SelectItem>
                                    <SelectItem value="institutional">Institutional</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input
                                placeholder="Region (Optional)"
                                value={formData.region}
                                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                            />
                            <Button type="submit" className="sm:col-span-2 lg:col-span-1">
                                <Plus className="mr-2 h-4 w-4" /> Add
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {loading ? (
                    <div className="text-center text-sm text-muted-foreground">Loading Holidays...</div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {holidays.map((hol) => (
                            <Card key={hol.id}>
                                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                    <CardTitle className="text-lg">{hol.name}</CardTitle>
                                    <Calendar className="h-5 w-5 text-primary" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-muted-foreground">
                                        <p>{new Date(hol.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        <p className="capitalize text-xs mt-1">Type: {hol.type} {hol.region ? `| Reg: ${hol.region}` : ''}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {holidays.length === 0 && (
                            <div className="col-span-full py-8 text-center text-sm text-muted-foreground">
                                No holidays recorded yet.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppShell>
    )
}
