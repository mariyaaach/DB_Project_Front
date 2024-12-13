export interface User {
    userId: number
    username: string
    fullName: string
    email: string
    role: string
}

export interface Project {
    projectId: number
    name: string
    description: string
    startDate: string
    endDate: string
    status: string
    managerFullName: string
    managerId: number
}

export interface Manager {
    userId: number
    fullName: string
}
