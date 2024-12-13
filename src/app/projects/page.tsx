'use client'

import {useEffect, useState} from 'react'
import {useRouter} from 'next/navigation'
import axios from 'axios'
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {toast} from "@/components/hooks/use-toast"
import {Pencil, PlusCircle, Trash2} from 'lucide-react'
import {API_URL} from "@/lib/constants";
import {getSubFromToken} from "@/lib/jwtUtil";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";


interface Project {
    projectId: number
    projectName: string
    description: string
    startDate: string
    endDate: string
    status: string
    managerFullName: string
    managerId: number
}

interface User {
    userId: number
    username: string
    fullName: string
    email: string
    role: string
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newProject, setNewProject] = useState<Partial<Project>>({})
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetchCurrentUser()
    }, [])

    useEffect(() => {
        if (currentUser) {
            fetchProjects()
        }
    }, [currentUser])
    const handleSelectChange = (name: string, value: string) => {
        setNewProject(prev => ({...prev, [name]: value}))
    }


    const handleStatusChange = async (projectId: number, newStatus: string) => {
        try {
            await axios.put(`${API_URL}/projects/${projectId}`, {status: newStatus})
            setProjects(prev => prev.map(project =>
                project.projectId === projectId ? {...project, status: newStatus} : project
            ))
            toast({
                title: "Успех",
                description: "Статус проекта успешно обновлен.",
            })
        } catch (error) {
            console.error('Error updating project status:', error)
            toast({
                title: "Ошибка",
                description: "Не удалось обновить статус проекта. Пожалуйста, попробуйте снова.",
                variant: "destructive",
            })
        }
    }

    const fetchCurrentUser = async () => {
        try {
            const username = getSubFromToken()
            if (!username) {
                router.push('/auth')
                return
            }
            const response = await axios.get(`${API_URL}/user/username/${username}`)
            setCurrentUser(response.data)
            setIsLoading(false)
        } catch (error) {
            console.error('Error fetching current user:', error)
            toast({
                title: "Ошибка",
                description: "Не удалось загрузить данные пользователя. Пожалуйста, попробуйте позже.",
                variant: "destructive",
            })
            setIsLoading(false)
        }
    }

    const fetchProjects = async () => {
        try {
            let response
            if (currentUser?.role === 'Руководитель проекта') {
                // Fetch only projects managed by the current user
                response = await axios.get(`${API_URL}/projects?managerId=${currentUser.userId}`)
            } else {
                // Fetch all projects for other roles
                response = await axios.get(`${API_URL}/projects`)
            }
            setProjects(response.data)
        } catch (error) {
            console.error('Error fetching projects:', error)
            toast({
                title: "Ошибка",
                description: "Не удалось загрузить проекты. Пожалуйста, попробуйте позже.",
                variant: "destructive",
            })
        }
    }

    const statutes = {
        'В процессе': 'В процессе',
        'Завершен': 'Завершен',
        'Запланирован': 'Запланирован',
        'На рассмотрении': 'На рассмотрении'
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        setNewProject(prev => ({...prev, [name]: value}))
    }

    const handleCreateProject = async () => {
        try {
            await axios.post(`${API_URL}/projects`, {
                ...newProject,
                managerId: currentUser?.userId
            })
            setIsDialogOpen(false)
            setNewProject({})
            fetchProjects()
            toast({
                title: "Успех",
                description: "Проект успешно создан.",
            })
        } catch (error) {
            console.error('Error creating project:', error)
            toast({
                title: "Ошибка",
                description: "Не удалось создать проект. Пожалуйста, попробуйте снова.",
                variant: "destructive",
            })
        }
    }

    const handleDeleteProject = async (projectId: number) => {
        try {
            await axios.delete(`${API_URL}/projects/${projectId}`)
            fetchProjects()
            toast({
                title: "Успех",
                description: "Проект успешно удален.",
            })
        } catch (error) {
            console.error('Error deleting project:', error)
            toast({
                title: "Ошибка",
                description: "Не удалось удалить проект. Пожалуйста, попробуйте снова.",
                variant: "destructive",
            })
        }
    }

    if (isLoading) {
        return <div>Загрузка...</div>
    }

    if (!currentUser) {
        return <div>Пожалуйста, войдите в систему.</div>
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Проекты</h1>
            <div className="flex justify-between items-center mb-6">
                {(currentUser.role === 'Администратор' || currentUser.role === 'Руководитель проекта') && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4"/>
                                Создать проект
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Создать новый проект</DialogTitle>
                                <DialogDescription>
                                    Заполните информацию о новом проекте здесь. Нажмите сохранить, когда закончите.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="projectName" className="text-right">
                                        Название
                                    </Label>
                                    <Input
                                        id="projectName"
                                        name="projectName"
                                        value={newProject.projectName || ''}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="description" className="text-right">
                                        Описание
                                    </Label>
                                    <Input
                                        id="description"
                                        name="description"
                                        value={newProject.description || ''}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="startDate" className="text-right">
                                        Дата начала
                                    </Label>
                                    <Input
                                        id="startDate"
                                        name="startDate"
                                        type="date"
                                        value={newProject.startDate || ''}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="endDate" className="text-right">
                                        Дата окончания
                                    </Label>
                                    <Input
                                        id="endDate"
                                        name="endDate"
                                        type="date"
                                        value={newProject.endDate || ''}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="status" className="text-right">
                                        Статус
                                    </Label>
                                    <Select
                                        onValueChange={(value) => handleSelectChange('status', value)}
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Выберите статус"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="planned">Запланирован</SelectItem>
                                            <SelectItem value="ongoing">В процессе</SelectItem>
                                            <SelectItem value="completed">Завершен</SelectItem>
                                            <SelectItem value="on_hold">На рассмотрении</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                            </div>
                            <DialogFooter>
                                <Button type="submit" onClick={handleCreateProject}>Сохранить</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Название проекта</TableHead>
                            <TableHead>Описание</TableHead>
                            <TableHead>Дата начала</TableHead>
                            <TableHead>Дата окончания</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead>Руководитель</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projects.map((project) => (
                            <TableRow key={project.projectId}>
                                <TableCell className="font-medium">{project.projectName}</TableCell>
                                <TableCell>{project.description}</TableCell>
                                <TableCell>{project.startDate}</TableCell>
                                <TableCell>{project.endDate}</TableCell>
                                <TableCell>
                                    <Select
                                        defaultValue={project.status}
                                        onValueChange={(value) => handleStatusChange(project.projectId, value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue>{statutes[project.status]}</SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="planned">Запланирован</SelectItem>
                                            <SelectItem value="ongoing">В процессе</SelectItem>
                                            <SelectItem value="completed">Завершен</SelectItem>
                                            <SelectItem value="on_hold">На рассмотрении</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>

                                <TableCell>{project.managerFullName}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon"
                                            onClick={() => router.push(`/projects/${project.projectId}`)}>
                                        <Pencil className="h-4 w-4"/>
                                    </Button>
                                    {(currentUser.role === 'Администратор' || (currentUser.role === 'Руководитель проекта' && currentUser.userId === project.managerId)) && (
                                        <Button variant="ghost" size="icon"
                                                onClick={() => handleDeleteProject(project.projectId)}>
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}