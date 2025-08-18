exports.handler = async (event, context) => {
  // Configurar CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Manejar preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const method = event.httpMethod;
    const body = event.body ? JSON.parse(event.body) : {};
    const { sessionId, action, message, response } = body;

    // Validar parámetros requeridos
    if (!sessionId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'sessionId es requerido' })
      };
    }

    // Simular almacenamiento en memoria (en producción usar base de datos)
    // Para Netlify Functions, usaremos el contexto de la función
    if (!global.chatHistories) {
      global.chatHistories = {};
    }
    const chatHistories = global.chatHistories;
    
    if (method === 'POST') {
      if (action === 'save') {
        // Guardar mensaje en el historial
        if (!message) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'message es requerido para guardar' })
          };
        }

        if (!chatHistories[sessionId]) {
          chatHistories[sessionId] = {
            sessionId,
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }

        // Agregar mensaje del usuario
        chatHistories[sessionId].messages.push({
          role: 'user',
          content: message,
          timestamp: new Date().toISOString()
        });

        // Agregar respuesta del asistente si existe
        if (response) {
          chatHistories[sessionId].messages.push({
            role: 'assistant',
            content: response,
            timestamp: new Date().toISOString()
          });
        }

        chatHistories[sessionId].updatedAt = new Date().toISOString();
        global.chatHistories = chatHistories;

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: 'Historial guardado correctamente',
            messageCount: chatHistories[sessionId].messages.length
          })
        };
      }
      
      else if (action === 'get') {
        // Recuperar historial de chat
        const history = chatHistories[sessionId] || {
          sessionId,
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            history 
          })
        };
      }
      
      else if (action === 'clear') {
        // Limpiar historial de chat
        if (chatHistories[sessionId]) {
          delete chatHistories[sessionId];
          global.chatHistories = chatHistories;
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: 'Historial limpiado correctamente' 
          })
        };
      }
      
      else if (action === 'getContext') {
        // Obtener contexto resumido para la IA (últimos 10 mensajes)
        const history = chatHistories[sessionId];
        if (!history || history.messages.length === 0) {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
              success: true, 
              context: '' 
            })
          };
        }

        // Tomar los últimos 10 mensajes para contexto
        const recentMessages = history.messages.slice(-10);
        const contextString = recentMessages.map(msg => 
          `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`
        ).join('\n');

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            context: contextString,
            messageCount: history.messages.length
          })
        };
      }
      
      else {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Acción no válida. Use: save, get, clear, o getContext' })
        };
      }
    }
    
    else {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Método no permitido. Use POST' })
      };
    }

  } catch (error) {
    console.error('Error en save-chat-history:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error.message 
      })
    };
  }
};