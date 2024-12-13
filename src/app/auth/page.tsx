'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import axios from 'axios'
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Label} from "@/components/ui/label"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {toast} from "@/components/hooks/use-toast"
import {API_URL} from "@/lib/constants";

export default function AuthPage() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const saveToken = (token: string) => {
        localStorage.setItem('accessToken', token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsLoading(true)
        const formData = new FormData(event.currentTarget)
        const username = formData.get('username') as string
        const password = formData.get('password') as string

        try {
            const response = await axios.post(`${API_URL}/auth`, {username, password})
            saveToken(response.data.token)
            toast({
                title: "Успешно",
                description: "You have been successfully logged in.",
            })
            router.push('/dashboard')
        } catch (error) {
            console.error('Error during login:', error)
            toast({
                title: "Ошибка при авторизации",
                // @ts-ignore
                description: error?.message,
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsLoading(true)
        const formData = new FormData(event.currentTarget)
        const username = formData.get('username') as string
        const password = formData.get('password') as string
        const fullName = formData.get('fullName') as string
        const email = formData.get('email') as string
        const role = formData.get('role') as string

        try {
            const response = await axios.post(`${API_URL}/auth/sign-up`, {
                username,
                password,
                fullName,
                email,
                role
            })
            saveToken(response.data.token)
            toast({
                title: "Успешно!",
                description: "Вы успешно создали аккаунт и теперь авторизованы.",
            })
            router.push('/dashboard')
        } catch (error) {
            console.error('Error during registration:', error)
            toast({
                title: "При регистрации произошла ошибка",
                // @ts-ignore
                description: error?.message,
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Система управления проектами</CardTitle>
                    <CardDescription>Авторизуйтесь или создайте аккаунт.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Вход</TabsTrigger>
                            <TabsTrigger value="register">Регистрация</TabsTrigger>
                        </TabsList>
                        <TabsContent value="login">
                            <form onSubmit={handleLogin}>
                                <div className="grid w-full items-center gap-4">
                                    <div className="flex flex-col space-y-1.5">
                                        <Label htmlFor="username">Логин</Label>
                                        <Input id="username" name="username" placeholder="Введите свой логин"
                                               required/>
                                    </div>
                                    <div className="flex flex-col space-y-1.5">
                                        <Label htmlFor="password">Пароль</Label>
                                        <Input id="password" name="password" type="password"
                                               placeholder="Введите свой пароль" required/>
                                    </div>
                                </div>
                                <CardFooter className="flex justify-between mt-4 px-0">
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? 'Авторизуемся...' : 'Логин'}
                                    </Button>
                                </CardFooter>
                            </form>
                        </TabsContent>
                        <TabsContent value="register">
                            <form onSubmit={handleSignUp}>
                                <div className="grid w-full items-center gap-4">
                                    <div className="flex flex-col space-y-1.5">
                                        <Label htmlFor="reg-username">Логин</Label>
                                        <Input id="reg-username" name="username" placeholder="Введите свой логин"
                                               required/>
                                    </div>
                                    <div className="flex flex-col space-y-1.5">
                                        <Label htmlFor="reg-password">Пароль</Label>
                                        <Input id="reg-password" name="password" type="password"
                                               placeholder="Введите свой пароль" required/>
                                    </div>
                                    <div className="flex flex-col space-y-1.5">
                                        <Label htmlFor="fullName">ФИО</Label>
                                        <Input id="fullName" name="fullName" placeholder="Введите свое ФИО"
                                               required/>
                                    </div>
                                    <div className="flex flex-col space-y-1.5">
                                        <Label htmlFor="email">Почта</Label>
                                        <Input id="email" name="email" type="email" placeholder="Введите свою почту"
                                               required/>
                                    </div>
                                    <div className="flex flex-col space-y-1.5">
                                        <Label htmlFor="role">Роль</Label>
                                        <Select name="role" required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Выберите свою роль"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="RESEARCHER">Научный сотрудник</SelectItem>
                                                <SelectItem value="PROJECT_MANAGER">Руководитель проекта</SelectItem>
                                                <SelectItem value="ADMIN">Администратор</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <CardFooter className="flex justify-between mt-4 px-0">
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? 'Регистрируемся...' : 'Регистрация'}
                                    </Button>
                                </CardFooter>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}