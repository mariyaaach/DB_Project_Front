'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/hooks/use-toast"
import { PlusCircle, Pencil, Trash2 } from 'lucide-react'
import {API_URL} from "@/lib/constants";

interface Equipment {
    equipmentId: number
    name: string
    description: string
    location: string
    availabilityStatus: string
}

export default function EquipmentPage() {
    const [equipment, setEquipment] = useState<Equipment[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [currentEquipment, setCurrentEquipment] = useState<Equipment>({
        equipmentId: 0,
        name: '',
        description: '',
        location: '',
        availabilityStatus: ''
    })

    useEffect(() => {
        fetchEquipment()
    }, [])

    const fetchEquipment = async () => {
        try {
            const response = await axios.get(`${API_URL}/equipment`)
            setEquipment(response.data)
        } catch (error) {
            console.error('Error fetching equipment:', error)
            toast({
                title: "Ошибка",
                description: "Не удалось загрузить список оборудования. Пожалуйста, попробуйте позже.",
                variant: "destructive",
            })
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setCurrentEquipment(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (value: string) => {
        setCurrentEquipment(prev => ({ ...prev, availabilityStatus: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (isEditing) {
                await axios.put(`${API_URL}/equipment/${currentEquipment.equipmentId}`, currentEquipment)
                toast({
                    title: "Успех",
                    description: "Оборудование успешно обновлено.",
                })
            } else {
                await axios.post(`${API_URL}/equipment`, currentEquipment)
                toast({
                    title: "Успех",
                    description: "Оборудование успешно добавлено.",
                })
            }
            setIsDialogOpen(false)
            setIsEditing(false)
            setCurrentEquipment({
                equipmentId: 0,
                name: '',
                description: '',
                location: '',
                availabilityStatus: ''
            })
            fetchEquipment()
        } catch (error) {
            console.error('Error submitting equipment:', error)
            toast({
                title: "Ошибка",
                description: "Не удалось сохранить оборудование. Пожалуйста, попробуйте снова.",
                variant: "destructive",
            })
        }
    }

    const handleEdit = (equipment: Equipment) => {
        setCurrentEquipment(equipment)
        setIsEditing(true)
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`${API_URL}/equipment/${id}`)
            toast({
                title: "Успех",
                description: "Оборудование успешно удалено.",
            })
            fetchEquipment()
        } catch (error) {
            console.error('Error deleting equipment:', error)
            toast({
                title: "Ошибка",
                description: "Не удалось удалить оборудование. Пожалуйста, попробуйте снова.",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Оборудование</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => {
                            setIsEditing(false)
                            setCurrentEquipment({
                                equipmentId: 0,
                                name: '',
                                description: '',
                                location: '',
                                availabilityStatus: ''
                            })
                        }}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Добавить оборудование
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{isEditing ? 'Редактировать оборудование' : 'Добавить новое оборудование'}</DialogTitle>
                            <DialogDescription>
                                Заполните информацию об оборудовании здесь. Нажмите сохранить, когда закончите.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Название
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={currentEquipment.name}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="description" className="text-right">
                                        Описание
                                    </Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={currentEquipment.description}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="location" className="text-right">
                                        Местоположение
                                    </Label>
                                    <Input
                                        id="location"
                                        name="location"
                                        value={currentEquipment.location}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="availabilityStatus" className="text-right">
                                        Статус доступности
                                    </Label>
                                    <Select
                                        value={currentEquipment.availabilityStatus}
                                        onValueChange={handleSelectChange}
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Выберите статус" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="available">Доступно</SelectItem>
                                            <SelectItem value="in_use">В использовании</SelectItem>
                                            <SelectItem value="under_maintenance">На обслуживании</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                            <TableHead>Описание</TableHead>
                            <TableHead>Местоположение</TableHead>
                            <TableHead>Статус доступности</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {equipment.map((item) => (
                            <TableRow key={item.equipmentId}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{item.description}</TableCell>
                                <TableCell>{item.location}</TableCell>
                                <TableCell>{item.availabilityStatus}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.equipmentId)}>
                                        <Trash2 className="h-4 w-4" />
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