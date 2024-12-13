'use client'

import {useEffect, useState} from 'react'
import {useRouter} from 'next/navigation'
import axios from 'axios'
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {toast} from "@/components/hooks/use-toast"
import {API_URL} from "@/lib/constants";
import {getSubFromToken} from "@/lib/jwtUtil";
import {User} from "@/app/types/types";



export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null)
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem('accessToken')
        if (!token) {
            router.push('/')
            return
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        fetchUserData()
    }, [router])

    const fetchUserData = async () => {
        try {
            const token = getSubFromToken()
            console.log(token)
            const response = await axios.get(`${API_URL}/user/username/${token}`)
            setUser(response.data)
        } catch (error) {
            console.error('Error fetching user data:', error)
            toast({
                title: "Ошибка",
                description: `Ошибка при полкчении данных пользователя ${error?.message}`,
                variant: "destructive",
            })
            // router.push('/')
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('accessToken')
        delete axios.defaults.headers.common['Authorization']
        router.push('/')
    }

    if (!user) {
        return <div>Загрузка...</div>
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Добро пожаловать, {user.fullName}</CardTitle>
                    <CardDescription>Дашборд системы</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <p><strong>Логин:</strong> {user.username}</p>
                        <p><strong>Почта:</strong> {user.email}</p>
                        <p><strong>Роль:</strong> {user.role}</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleLogout} className="w-full">Выход</Button>
                </CardFooter>
            </Card>
        </div>
    )
}