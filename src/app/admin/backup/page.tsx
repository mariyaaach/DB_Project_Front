'use client'

import {useEffect, useState} from 'react'
import axios from 'axios'
import {Button} from "@/components/ui/button"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {toast} from "@/components/hooks/use-toast"
import {Download, PlusCircle, RotateCcw} from 'lucide-react'
import {API_URL} from "@/lib/constants";
import {getSubFromToken} from "@/lib/jwtUtil";


interface Backup {
  fileName: string
  createdAt: string
}

export default function BackupPage() {
  const [backups, setBackups] = useState<Backup[]>([])
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAdminStatus()
    fetchBackups()
  }, [])

  const checkAdminStatus = async () => {
    try {
      const tokenContent = getSubFromToken()
      const response = await axios.get(`${API_URL}/user/username/${tokenContent}`)
      setIsAdmin(response.data.role === 'Администратор')
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
    }
  }

  const fetchBackups = async () => {
    try {
      // This endpoint is not provided in the API spec, so you might need to implement it
      const response = await axios.get(`${API_URL}/backup/list`)
      setBackups(response.data)
    } catch (error) {
      console.error('Error fetching backups:', error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список резервных копий. Пожалуйста, попробуйте позже.",
        variant: "destructive",
      })
    }
  }

  const handleCreateBackup = async () => {
    try {
      const response = await axios.post(`${API_URL}/backup`)
      toast({
        title: "Успех",
        description: response.data,
      })
      fetchBackups()
    } catch (error) {
      console.error('Error creating backup:', error)
      toast({
        title: "Ошибка",
        description: "Не удалось создать резервную копию. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      })
    }
  }

  const handleDownloadBackup = async (fileName: string) => {
    try {
      const response = await axios.get(`${API_URL}/backup/download`, {
        params: { fileName },
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error downloading backup:', error)
      toast({
        title: "Ошибка",
        description: "Не удалось скачать резервную копию. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      })
    }
  }

  const handleRestoreBackup = async () => {
    if (!selectedBackup) return

    try {
      const response = await axios.post(`${API_URL}/backup/restore`, null, {
        params: { fileName: selectedBackup }
      })
      toast({
        title: "Успех",
        description: response.data,
      })
      setIsRestoreDialogOpen(false)
    } catch (error) {
      console.error('Error restoring backup:', error)
      toast({
        title: "Ошибка",
        description: "Не удалось восстановить из резервной копии. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      })
    }
  }

  if (!isAdmin) {
    return <div>У вас нет доступа к этой странице.</div>
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Управление резервными копиями</h1>
      <div className="flex justify-between items-center mb-6">
        <Button onClick={handleCreateBackup}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Создать резервную копию
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Имя файла</TableHead>
              <TableHead>Дата создания</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {backups.map((backup) => (
              <TableRow key={backup.fileName}>
                <TableCell>{backup.fileName}</TableCell>
                <TableCell>{backup.createdAt}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleDownloadBackup(backup.fileName)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => {
                    setSelectedBackup(backup.fileName)
                    setIsRestoreDialogOpen(true)
                  }}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Восстановление из резервной копии</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите восстановить данные из выбранной резервной копии? Это действие перезапишет текущие данные.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRestoreDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleRestoreBackup}>Восстановить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}