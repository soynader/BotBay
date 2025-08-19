class ChatHistory {
    constructor() {
        this.sessionId = this.getOrCreateSessionId();
        this.localStorageKey = `botbay_chat_${this.sessionId}`;
        this.maxLocalMessages = 50; // Límite de mensajes en localStorage
        this.isNetlifyAvailable = this.checkNetlifyAvailability();
    }

    // Generar o recuperar ID de sesión único
    getOrCreateSessionId() {
        let sessionId = localStorage.getItem('botbay_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('botbay_session_id', sessionId);
        }
        return sessionId;
    }

    // Verificar si las funciones de Netlify están disponibles
    checkNetlifyAvailability() {
        return window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    }

    // Guardar mensaje en el historial
    async saveMessage(userMessage, assistantResponse = null) {
        try {
            const messageData = {
                user: userMessage,
                assistant: assistantResponse,
                timestamp: new Date().toISOString()
            };

            // Guardar en localStorage
            this.saveToLocalStorage(messageData);

            // Guardar en Netlify si está disponible
            if (this.isNetlifyAvailable && assistantResponse) {
                await this.saveToNetlify(userMessage, assistantResponse);
            }

            return true;
        } catch (error) {
            // Error guardando mensaje - fallback silencioso
        }
    }

    // Guardar en localStorage
    saveToLocalStorage(messageData) {
        try {
            let history = JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');
            
            // Agregar nuevo mensaje
            history.push(messageData);
            
            // Mantener solo los últimos N mensajes
            if (history.length > this.maxLocalMessages) {
                history = history.slice(-this.maxLocalMessages);
            }
            
            localStorage.setItem(this.localStorageKey, JSON.stringify(history));
        } catch (error) {
            // Error guardando en localStorage - fallback silencioso
        }
    }

    // Guardar en Netlify Functions
    async saveToNetlify(userMessage, assistantResponse) {
        try {
            const response = await fetch('/.netlify/functions/save-chat-history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    action: 'save',
                    message: userMessage,
                    response: assistantResponse
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('Error guardando en Netlify:', error);
            return false;
        }
    }

    // Obtener historial completo
    async getHistory() {
        try {
            // Intentar obtener de Netlify primero
            if (this.isNetlifyAvailable) {
                const netlifyHistory = await this.getFromNetlify();
                if (netlifyHistory && netlifyHistory.length > 0) {
                    return netlifyHistory;
                }
            }

            // Fallback a localStorage
            return this.getFromLocalStorage();
        } catch (error) {
            console.error('Error obteniendo historial:', error);
            return this.getFromLocalStorage();
        }
    }

    // Obtener historial de localStorage
    getFromLocalStorage() {
        try {
            const history = JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');
            return history;
        } catch (error) {
            console.error('Error leyendo localStorage:', error);
            return [];
        }
    }

    // Obtener historial de Netlify
    async getFromNetlify() {
        try {
            const response = await fetch('/.netlify/functions/save-chat-history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    action: 'get'
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.success && result.history && result.history.messages) {
                // Convertir formato de Netlify a formato local
                return result.history.messages.map(msg => ({
                    user: msg.role === 'user' ? msg.content : null,
                    assistant: msg.role === 'assistant' ? msg.content : null,
                    timestamp: msg.timestamp
                })).filter(msg => msg.user || msg.assistant);
            }
            return [];
        } catch (error) {
            console.error('Error obteniendo de Netlify:', error);
            return [];
        }
    }

    // Obtener contexto para la IA (últimos mensajes)
    async getContextForAI(maxMessages = 5) {
        try {
            // Intentar obtener contexto de Netlify
            if (this.isNetlifyAvailable) {
                const netlifyContext = await this.getContextFromNetlify();
                if (netlifyContext) {
                    return netlifyContext;
                }
            }

            // Fallback a localStorage
            const history = this.getFromLocalStorage();
            const recentMessages = history.slice(-maxMessages);
            
            return recentMessages.map(msg => {
                let context = '';
                if (msg.user) context += `Usuario: ${msg.user}\n`;
                if (msg.assistant) context += `Asistente: ${msg.assistant}\n`;
                return context;
            }).join('').trim();
        } catch (error) {
            console.error('Error obteniendo contexto:', error);
            return '';
        }
    }

    // Obtener contexto de Netlify
    async getContextFromNetlify() {
        try {
            const response = await fetch('/.netlify/functions/save-chat-history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    action: 'getContext'
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.success ? result.context : '';
        } catch (error) {
            console.error('Error obteniendo contexto de Netlify:', error);
            return null;
        }
    }

    // Limpiar historial
    async clearHistory() {
        try {
            // Limpiar localStorage
            localStorage.removeItem(this.localStorageKey);

            // Limpiar en Netlify si está disponible
            if (this.isNetlifyAvailable) {
                await this.clearNetlifyHistory();
            }

            return true;
        } catch (error) {
            // Error limpiando historial - fallback silencioso
        }
    }

    // Limpiar historial en Netlify
    async clearNetlifyHistory() {
        try {
            const response = await fetch('/.netlify/functions/save-chat-history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    action: 'clear'
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('Error limpiando historial en Netlify:', error);
            return false;
        }
    }

    // Crear nueva sesión
    createNewSession() {
        // Generar nuevo ID de sesión
        const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('botbay_session_id', newSessionId);
        this.sessionId = newSessionId;
        this.localStorageKey = `botbay_chat_${this.sessionId}`;
        
        return newSessionId;
    }

    // Obtener información de la sesión
    getSessionInfo() {
        return {
            sessionId: this.sessionId,
            isNetlifyAvailable: this.isNetlifyAvailable,
            localStorageKey: this.localStorageKey
        };
    }
}

// Exportar para uso global
window.ChatHistory = ChatHistory;