import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const useWebSocket = (userId, onMessageReceived) => {
    const clientRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!userId) return;

        // Crear cliente STOMP
        const client = new Client({
            webSocketFactory: () => new SockJS('/ws'),
            debug: (str) => {
                console.log('STOMP:', str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        // Callback cuando se conecta
        client.onConnect = () => {
            console.log('WebSocket conectado');
            setIsConnected(true);

            // Suscribirse al canal de mensajes del usuario
            client.subscribe(`/topic/mensajes/${userId}`, (message) => {
                try {
                    const receivedMessage = JSON.parse(message.body);
                    console.log('Mensaje recibido:', receivedMessage);
                    if (onMessageReceived) {
                        onMessageReceived(receivedMessage);
                    }
                } catch (error) {
                    console.error('Error al procesar mensaje:', error);
                }
            });
        };

        // Callback cuando se desconecta
        client.onDisconnect = () => {
            console.log('WebSocket desconectado');
            setIsConnected(false);
        };

        // Callback en caso de error
        client.onStompError = (frame) => {
            console.error('Error STOMP:', frame);
            setIsConnected(false);
        };

        // Activar el cliente
        client.activate();
        clientRef.current = client;

        // Limpiar al desmontar
        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
            }
        };
    }, [userId, onMessageReceived]);

    return { isConnected };
};
