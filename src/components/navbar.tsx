'use client'

import {useEffect, useState} from 'react'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {Button} from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Input} from "@/components/ui/input"
import {Sheet, SheetContent} from "@/components/ui/sheet"
import {Menu, Search, X} from 'lucide-react'
import axios from "axios";
import {getRawToken, getSubFromToken} from "@/lib/jwtUtil";
import {API_URL} from "@/lib/constants";
import {toast} from "@/components/hooks/use-toast";
import {User} from "@/app/types/types";

const mainNav = [
    {title: "Панель управления", href: "/dashboard"},
    {title: "Проекты", href: "/projects"},
    {title: "Публикации", href: "/publications"},
    {title: "Оборудование", href: "/equipment"},
    {title: "Бэкапы", href: "/admin/backup"},
]


export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const pathname = usePathname()
    const [user, setUser] = useState<User | null>()

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
    axios.defaults.headers.common['Authorization'] = `Bearer ${getRawToken()}`

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0)
        }
        window.addEventListener('scroll', handleScroll)
        fetchUserData()
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const NavItems = () => (
        <>
            {mainNav.map((item) => (
                <Link
                    key={item.title}
                    href={item.href}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                        pathname === item.href
                            ? "text-black dark:text-white"
                            : "text-muted-foreground"
                    }`}
                >
                    {item.title}
                </Link>
            ))}
        </>
    )

    return (
        <header
            className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${
                isScrolled ? "border-border" : "border-transparent"
            }`}
        >
            <nav className="container flex h-14 items-center">
                <div className="mr-4 hidden md:flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              Система управления исследованиями
            </span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <NavItems/>
                    </nav>
                </div>
                <button
                    className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4 md:hidden"
                    onClick={() => setIsMobileMenuOpen(true)}
                >
                    <Menu className="h-6 w-6"/>
                    <span className="sr-only">Открыть главное меню</span>
                </button>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        <form>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                                <Input
                                    type="search"
                                    placeholder="Поиск..."
                                    className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                                />
                            </div>
                        </form>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="relative h-8 w-8 rounded-full"
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="/placeholder-avatar.jpg" alt="@username"/>
                                    <AvatarFallback>М.О.</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user?.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem>
                                <Link href="/profile">Профиль</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Link href="/settings">Настройки</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem>
                                <Link href="/logout">Выйти</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </nav>
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                    <nav className="flex flex-col gap-4">
                        <Link href="/" className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                            <span className="font-bold">Система управления исследованиями</span>
                        </Link>
                        <NavItems/>
                    </nav>
                    <div className="absolute right-4 top-4">
                        <button
                            className="inline-flex items-center justify-center rounded-md font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <X className="h-6 w-6"/>
                            <span className="sr-only">Закрыть главное меню</span>
                        </button>
                    </div>
                </SheetContent>
            </Sheet>
        </header>
    )
}