'use client'

import { useEffect, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { toast } from '@/components/hooks/use-toast'
import { CheckCircle2, PartyPopper } from 'lucide-react'

interface NotificationEvent {
    type: string
    message: string
}

export function Notifications() {
    const [stompClient, setStompClient] = useState<Client | null>(null)

    const getNotificationStyle = (type: string) => {
        if (type.includes('Маша молодец')) {
            return {
                icon: <PartyPopper className="h-8 w-8 text-pink-500" />,
                className: "bg-white border-l-4 border-pink-500 shadow-lg fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 min-w-[400px] max-w-[600px] p-6 rounded-lg"
            }
        }
        return {
            icon: <CheckCircle2 className="h-8 w-8 text-green-500" />,
            className: "bg-white border-l-4 border-green-500 shadow-lg fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 min-w-[400px] max-w-[600px] p-6 rounded-lg"
        }
    }

    useEffect(() => {
        console.log('Initializing WebSocket connection...')
        const socket = new SockJS('http://localhost:8080/ws')
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log('Successfully connected to WebSocket')
                client.subscribe('/topic/notifications', (message) => {
                    console.log('Received WebSocket message:', message)
                    try {
                        const notification: NotificationEvent = JSON.parse(message.body)
                        console.log('Parsed notification:', notification)
                        const style = getNotificationStyle(notification.type)
                        toast({
                            title: notification.type,
                            description: (
                                <div className="flex items-center gap-4 text-lg">
                                    {style.icon}
                                    <span>{notification.message}</span>
                                </div>
                            ),
                            duration: 5000,
                            className: style.className,
                        })
                    } catch (error) {
                        console.error('Error parsing WebSocket message:', error)
                        console.log('Raw message body:', message.body)
                    }
                })
            },
            onDisconnect: () => {
                console.log('Disconnected from WebSocket')
            },
            onStompError: (frame) => {
                console.error('STOMP error:', frame)
            },
            debug: (str) => {
                console.log('STOMP Debug:', str)
            }
        })

        client.activate()
        setStompClient(client)

        return () => {
            console.log('Cleaning up WebSocket connection...')
            if (client.connected) {
                client.deactivate()
            }
        }
    }, [])

    return null
} 