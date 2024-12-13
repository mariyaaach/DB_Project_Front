'use client'

import {useEffect, useState} from 'react'
import {useParams} from 'next/navigation'
import axios from 'axios'
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,} from "@/components/ui/dialog"
import {Card, CardContent, CardHeader, CardTitle,} from "@/components/ui/card"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select"
import {toast} from "@/components/hooks/use-toast"
import {Briefcase, DollarSign, PlusCircle, Users} from 'lucide-react'
import {API_URL} from "@/lib/constants";


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

interface Task {
    taskId: number
    projectId: number
    assignedTo: number
    title: string
    description: string
    dueDate: string
    status: string
}

interface TeamMember {
    projectId: number
    userId: number
    fullName: string
    roleInProject: string
}

interface ProjectBudget {
    allocatedAmount: number
    spentAmount: number
}

interface FundingSource {
    fundingSourceId: number
    name: string
    description: string
}

export default function ProjectPage() {
    const params = useParams()
    const projectId = Number(params.id)

    const [project, setProject] = useState<Project | null>(null)
    const [tasks, setTasks] = useState<Task[]>([])
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
    const [budget, setBudget] = useState<ProjectBudget | null>(null)
    const [fundingSources, setFundingSources] = useState<FundingSource[]>([])
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
    const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false)
    const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false)
    const [isFundingDialogOpen, setIsFundingDialogOpen] = useState(false)
    const [newTask, setNewTask] = useState<Partial<Task>>({})
    const [newTeamMember, setNewTeamMember] = useState<Partial<TeamMember>>({})
    const [newBudget, setNewBudget] = useState<Partial<ProjectBudget>>({})
    const [newFundingSource, setNewFundingSource] = useState<Partial<FundingSource>>({})
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchProjectData()
        fetchProjectTasks()
        fetchProjectTeam()
        fetchProjectBudget()
        fetchFundingSources()
    }, [projectId])

    const fetchProjectData = async () => {
        try {
            const response = await axios.get(`${API_URL}/projects/${projectId}`)
            setProject(response.data)
            setIsLoading(false)
        } catch (error) {
            console.error('Error fetching project:', error)
            toast({
                title: "Ошибка",
                description: "Не удалось загрузить данные проекта. Пожалуйста, попробуйте позже.",
                variant: "destructive",
            })
            setIsLoading(false)
        }
    }

    const fetchProjectTasks = async () => {
        try {
            const response = await axios.get(`${API_URL}/tasks?projectId=${projectId}`)
            setTasks(response.data)
        } catch (error) {
            console.error('Error fetching tasks:', error)
            toast({
                title: "Ошибка",
                description: "Не удалось загрузить задачи проекта. Пожалуйста, попробуйте позже.",
                variant: "destructive",
            })
        }
    }

    const fetchProjectTeam = async () => {
        try {
            const response = await axios.get(`${API_URL}/projects/${projectId}/team`)
            setTeamMembers(response.data)
        } catch (error) {
            console.error('Error fetching team members:', error)
            toast({
                title: "Ошибка",
                description: "Не удалось загрузить команду проекта. Пожалуйста, попробуйте позже.",
                variant: "destructive",
            })
        }
    }

    const fetchProjectBudget = async () => {
        try {
            const response = await axios.get(`${API_URL}/projects/${projectId}/budget`)
            setBudget(response.data)
        } catch (error) {
            console.error('Error fetching project budget:', error)
            toast({
                title: "Ошибка",
                description: "Не удалось загрузить бюджет проекта. Пожалуйста, попробуйте позже.",
                variant: "destructive",
            })
        }
    }

    const fetchFundingSources = async () => {
        try {
            const response = await axios.get(`${API_URL}/funding-sources`)
            setFundingSources(response.data)
        } catch (error) {
            console.error('Error fetching funding sources:', error)
            toast({
                title: "Ошибка",
                description: "Не удалось загрузить источники финансирования. Пожалуйста, попробуйте позже.",
                variant: "destructive",
            })
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<any>>) => {
        const { name, value } = e.target
        setter(prev => ({ ...prev, [name]: value }))
    }

    const handleAddTask = async () => {
        try {
            const response = await axios.post(`${API_URL}/tasks`, {
                ...newTask,
                projectId: projectId,
            })
            setTasks(prev => [...prev, response.data])
            setNewTask({})
            setIsTaskDialogOpen(false)
            toast({
                title: "Успех",
                description: "Задача успешно добавлена.",
            })
        } catch (error) {
            console.error('Error adding task:', error)
            toast({
                title: "Ошибка",
                description: "Не удалось добавить задачу. Пожалуйста, попробуйте снова.",
                variant: "destructive",
            })
        }
    }

    const handleAddTeamMember = async () => {
        try {
            const response = await axios.post(`${API_URL}/projects/${projectId}/team`, newTeamMember)
            setTeamMembers(prev => [...prev, response.data])
            setNewTeamMember({})
            setIsTeamDialogOpen(false)
            toast({
                title: "Успех",
                description: "Участник команды успешно добавлен.",
            })
        } catch (error) {
            console.error('Error adding team member:', error)
            toast({
                title: "Ошибка",
                description: "Не удалось добавить участника команды. Пожалуйста, попробуйте снова.",
                variant: "destructive",
            })
        }
    }

    const handleUpdateBudget = async () => {
        try {
            const response = await axios.put(`${API_URL}/projects/${projectId}/budget`, newBudget)
            setBudget(response.data)
            setNewBudget({})
            setIsBudgetDialogOpen(false)
            toast({
                title: "Успех",
                description: "Бюджет проекта успешно обновлен.",
            })
            fetchProjectBudget();
        } catch (error) {
            console.error('Error updating budget:', error)
            toast({
                title: "Ошибка",
                description: "Не удалось обновить бюджет проекта. Пожалуйста, попробуйте снова.",
                variant: "destructive",
            })
        }
    }

    const handleAddFundingSource = async () => {
        try {
            const response = await axios.post(`${API_URL}/funding-sources`, newFundingSource)
            setFundingSources(prev => [...prev, response.data])
            setNewFundingSource({})
            setIsFundingDialogOpen(false)
            toast({
                title: "Успех",
                description: "Источник финансирования успешно добавлен.",
            })
            fetchFundingSources()
        } catch (error) {
            console.error('Error adding funding source:', error)
            toast({
                title: "Ошибка",
                description: "Не удалось добавить источник финансирования. Пожалуйста, попробуйте снова.",
                variant: "destructive",
            })
        }
    }

    if (isLoading) {
        return <div>Загрузка данных проекта...</div>
    }

    if (!project) {
        return <div>Проект не найден</div>
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">{project.projectName}</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Информация о проекте</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p><strong>Статус:</strong> {project.status}</p>
                        <p><strong>Руководитель:</strong> {project.managerFullName}</p>
                        <p><strong>Дата начала:</strong> {project.startDate}</p>
                        <p><strong>Дата окончания:</strong> {project.endDate}</p>
                        <p><strong>Описание:</strong> {project.description}</p>
                        <div className="flex gap-2 mt-4">
                            <Button onClick={() => setIsBudgetDialogOpen(true)}>
                                <DollarSign className="mr-2 h-4 w-4" />
                                Бюджет
                            </Button>
                            <Button onClick={() => setIsTeamDialogOpen(true)}>
                                <Users className="mr-2 h-4 w-4" />
                                Команда
                            </Button>
                            <Button onClick={() => setIsFundingDialogOpen(true)}>
                                <Briefcase className="mr-2 h-4 w-4" />
                                Финансирование
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Бюджет проекта</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {budget ? (
                            <>
                                <p><strong>Выделено:</strong> {budget.allocatedAmount} руб.</p>
                                <p><strong>Потрачено:</strong> {budget.spentAmount} руб.</p>
                                <p><strong>Остаток:</strong> {budget.allocatedAmount - budget.spentAmount} руб.</p>
                            </>
                        ) : (
                            <p>Бюджет не установлен</p>
                        )}
                    </CardContent>
                </Card>
            </div>
            <Tabs defaultValue="tasks" className="mt-6">
                <TabsList>
                    <TabsTrigger value="tasks">Задачи</TabsTrigger>
                    <TabsTrigger value="team">Команда</TabsTrigger>
                    <TabsTrigger value="funding">Финансирование</TabsTrigger>
                </TabsList>
                <TabsContent value="tasks">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Задачи проекта</h2>
                        <Button onClick={() => setIsTaskDialogOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Добавить задачу
                        </Button>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Название</TableHead>
                                <TableHead>Статус</TableHead>
                                <TableHead>Срок</TableHead>
                                <TableHead>Исполнитель</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tasks.map((task) => (
                                <TableRow key={task.taskId}>
                                    <TableCell>{task.title}</TableCell>
                                    <TableCell>{task.status}</TableCell>
                                    <TableCell>{task.dueDate}</TableCell>
                                    <TableCell>{teamMembers.find(m => m.userId === task.assignedTo)?.fullName || 'Не назначен'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TabsContent>
                <TabsContent value="team">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Команда проекта</h2>
                        <Button onClick={() => setIsTeamDialogOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Добавить участника
                        </Button>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Имя</TableHead>
                                <TableHead>Роль в проекте</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teamMembers.map((member) => (
                                <TableRow key={member.userId}>
                                    <TableCell>{member.fullName}</TableCell>
                                    <TableCell>{member.roleInProject}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TabsContent>
                <TabsContent value="funding">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Источники финансирования</h2>
                        <Button onClick={() => setIsFundingDialogOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Добавить источник
                        </Button>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Название</TableHead>
                                <TableHead>Описание</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fundingSources.map((source) => (
                                <TableRow key={source.fundingSourceId}>
                                    <TableCell>{source.name}</TableCell>
                                    <TableCell>{source.description}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TabsContent>
            </Tabs>

            <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Добавить новую задачу</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">Название</Label>
                            <Input id="title" name="title" className="col-span-3" onChange={(e) => handleInputChange(e, setNewTask)} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">Описание</Label>
                            <Input id="description" name="description" className="col-span-3" onChange={(e) => handleInputChange(e, setNewTask)} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dueDate" className="text-right">Срок</Label>
                            <Input id="dueDate" name="dueDate" type="date" className="col-span-3" onChange={(e) => handleInputChange(e, setNewTask)} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="assignedTo" className="text-right">Исполнитель</Label>
                            <Select onValueChange={(value) => setNewTask(prev => ({ ...prev, assignedTo: Number(value) }))}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Выберите исполнителя" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teamMembers.map((member) => (
                                        <SelectItem key={member.userId} value={member.userId.toString()}>{member.fullName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddTask}>Добавить задачу</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Добавить участника команды</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="userId" className="text-right">Пользователь</Label>
                            Select
                            <Input id="userId" name="userId" type="number" className="col-span-3" onChange={(e) => handleInputChange(e, setNewTeamMember)} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="roleInProject" className="text-right">Роль в проекте</Label>
                            <Input id="roleInProject" name="roleInProject" className="col-span-3" onChange={(e) => handleInputChange(e, setNewTeamMember)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddTeamMember}>Добавить участника</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{budget ? 'Обновить бюджет проекта' : 'Установить бюджет проекта'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="allocatedAmount" className="text-right">Выделено</Label>
                            <Input id="allocatedAmount" name="allocatedAmount" type="number" className="col-span-3" onChange={(e) => handleInputChange(e, setNewBudget)} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="spentAmount" className="text-right">Потрачено</Label>
                            <Input id="spentAmount" name="spentAmount" type="number" className="col-span-3" onChange={(e) => handleInputChange(e, setNewBudget)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleUpdateBudget}>{budget ? 'Обновить бюджет' : 'Установить бюджет'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isFundingDialogOpen} onOpenChange={setIsFundingDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Добавить источник финансирования</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Название</Label>
                            <Input id="name" name="name" className="col-span-3" onChange={(e) => handleInputChange(e, setNewFundingSource)} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">Описание</Label>
                            <Input id="description" name="description" className="col-span-3" onChange={(e) => handleInputChange(e, setNewFundingSource)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddFundingSource}>Добавить источник</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}