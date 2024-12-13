'use client'

import {useEffect, useState} from 'react'
import axios from 'axios'
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
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
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select"
import {toast} from "@/components/hooks/use-toast"
import {Pencil, PlusCircle, Trash2} from 'lucide-react'
import {API_URL} from "@/lib/constants";


interface Publication {
    publicationId: number
    projectId: number
    title: string
    abstractText: string
    publicationDate: string
    link: string
    fileLinks: string[]
}

interface Project {
    projectId: number
    projectName: string
}

export default function PublicationsPage() {
    const [publications, setPublications] = useState<Publication[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [currentPublication, setCurrentPublication] = useState<Publication>({
        publicationId: 0,
        projectId: 0,
        title: '',
        abstractText: '',
        publicationDate: '',
        link: '',
        fileLinks: []
    })

    useEffect(() => {
        fetchPublications()
        fetchProjects()
    }, [])

    const fetchPublications = async () => {
        try {
            const response = await axios.get(`${API_URL}/publications`)
            setPublications(response.data)
        } catch (error) {
            console.error('Error fetching publications:', error)
            toast({
                title: "Ошибка",
                description: "Не удалось загрузить публикации. Пожалуйста, попробуйте позже.",
                variant: "destructive",
            })
        }
    }

    const fetchProjects = async () => {
        try {
            const response = await axios.get(`${API_URL}/projects`)
            setProjects(response.data)
        } catch (error) {
            console.error('Error fetching projects:', error)
            toast({
                title: "Ошибка",
                description: "Не удалось загрузить список проектов. Пожалуйста, попробуйте позже.",
                variant: "destructive",
            })
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target
        setCurrentPublication(prev => ({...prev, [name]: value}))
    }

    const handleSelectChange = (name: string, value: string) => {
        setCurrentPublication(prev => ({...prev, [name]: value}))
    }
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (isEditing) {
                await axios.put(`${API_URL}/publications/${currentPublication.publicationId}`, currentPublication)
                toast({
                    title: "Успех",
                    description: "Публикация успешно обновлена.",
                })
            } else {
                await axios.post(`${API_URL}/publications`, currentPublication)
                toast({
                    title: "Успех",
                    description: "Публикация успешно добавлена.",
                })
            }
            setIsDialogOpen(false)
            setIsEditing(false)
            setCurrentPublication({
                publicationId: 0,
                projectId: 0,
                title: '',
                abstractText: '',
                publicationDate: '',
                link: '',
                fileLinks: []
            })
            fetchPublications()
        } catch (error) {
            console.error('Error submitting publication:', error)
            toast({
                title: "Ошибка",
                description: "Не удалось сохранить публикацию. Пожалуйста, попробуйте снова.",
                variant: "destructive",
            })
        }
    }

    const handleEdit = (publication: Publication) => {
        setCurrentPublication(publication)
        setIsEditing(true)
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`${API_URL}/publications/${id}`)
            toast({
                title: "Успех",
                description: "Публикация успешно удалена.",
            })
            fetchPublications()
        } catch (error) {
            console.error('Error deleting publication:', error)
            toast({
                title: "Ошибка",
                description: "Не удалось удалить публикацию. Пожалуйста, попробуйте снова.",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Публикации</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => {
                            setIsEditing(false)
                            setCurrentPublication({
                                publicationId: 0,
                                projectId: 0,
                                title: '',
                                abstractText: '',
                                publicationDate: '',
                                link: '',
                                fileLinks: []
                            })
                        }}>
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            Добавить публикацию
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{isEditing ? 'Редактировать публикацию' : 'Добавить новую публикацию'}</DialogTitle>
                            <DialogDescription>
                                Заполните информацию о публикации здесь. Нажмите сохранить, когда закончите.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="projectId" className="text-right">
                                        Проект
                                    </Label>
                                    <Select
                                        value={currentPublication.projectId.toString()}
                                        onValueChange={(value) => handleSelectChange('projectId', value)}
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Выберите проект"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {projects.map((project) => (
                                                <SelectItem key={project.projectId}
                                                            value={project.projectId.toString()}>
                                                    {project.projectName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="title" className="text-right">
                                        Название
                                    </Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        value={currentPublication.title}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="abstractText" className="text-right">
                                        Аннотация
                                    </Label>
                                    <Textarea
                                        id="abstractText"
                                        name="abstractText"
                                        value={currentPublication.abstractText}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="publicationDate" className="text-right">
                                        Дата публикации
                                    </Label>
                                    <Input
                                        id="publicationDate"
                                        name="publicationDate"
                                        type="date"
                                        value={currentPublication.publicationDate}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="link" className="text-right">
                                        Ссылка
                                    </Label>
                                    <Input
                                        id="link"
                                        name="link"
                                        value={currentPublication.link}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">{isEditing ? 'Обновить' : 'Сохранить'}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Название</TableHead>
                            <TableHead>Проект</TableHead>
                            <TableHead>Аннотация</TableHead>
                            <TableHead>Дата публикации</TableHead>
                            <TableHead>Ссылка</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {publications.map((publication) => (
                            <TableRow key={publication.publicationId}>
                                <TableCell className="font-medium">{publication.title}</TableCell>
                                <TableCell>{projects.find(p => p.projectId === publication.projectId)?.projectName || 'Не указан'}</TableCell>
                                <TableCell>{publication.abstractText.substring(0, 50)}...</TableCell>
                                <TableCell>{publication.publicationDate}</TableCell>
                                <TableCell>
                                    <a href={publication.link} target="_blank" rel="noopener noreferrer"
                                       className="text-blue-500 hover:underline">
                                        Ссылка
                                    </a>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(publication)}>
                                        <Pencil className="h-4 w-4"/>
                                    </Button>
                                    <Button variant="ghost" size="icon"
                                            onClick={() => handleDelete(publication.publicationId)}>
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}