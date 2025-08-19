// ========================================
// ELEMENTOS DEL DOM
// ========================================
const messages = document.getElementById('messages');
const input = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');
const newChatBtn = document.getElementById('newChatBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const sessionInfo = document.getElementById('sessionInfo');
const loadingIndicator = document.getElementById('loadingIndicator');

// ========================================
// VARIABLES GLOBALES
// ========================================
let chatHistory;

// ========================================
// INICIALIZACIÓN
// ========================================
document.addEventListener('DOMContentLoaded', async () => {
  // Inicializar historial de chat
  chatHistory = new ChatHistory();
  
  // Configurar event listeners
  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
  newChatBtn.addEventListener('click', startNewChat);
  clearHistoryBtn.addEventListener('click', clearChatHistory);
  
  // Cargar historial existente
  await loadChatHistory();
  
  // Actualizar información de sesión
  updateSessionInfo();
});

// ========================================
// FUNCIONES DE INTERFAZ
// ========================================
function updateSessionInfo() {
  const info = chatHistory.getSessionInfo();
  sessionInfo.textContent = `Sesión: ${info.sessionId.slice(-8)} | Mensajes: ${info.messageCount}`;
}

async function loadChatHistory() {
  loadingIndicator.style.display = 'flex';
  
  try {
    const history = await chatHistory.getHistory();
    
    // Mostrar mensajes del historial
    history.forEach(msg => {
      if (msg.user) {
        appendMessage(msg.user, 'user', false);
      }
      if (msg.assistant) {
        appendMessage(msg.assistant, 'bot', false);
      }
    });
    
    // Scroll al final
    messages.scrollTop = messages.scrollHeight;
    
  } catch (error) {
    // Error cargando historial - fallback silencioso
  } finally {
    loadingIndicator.style.display = 'none';
  }
}

// ========================================
// FUNCIONES DE CHAT
// ========================================
async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;
  
  // Deshabilitar input mientras se procesa
  input.disabled = true;
  sendBtn.disabled = true;
  
  appendMessage(text, 'user');
  input.value = '';
  
  try {
    const reply = await askGroq(text);
    appendMessage(reply, 'bot');
    
    // Guardar en el historial
    await chatHistory.saveMessage(text, reply);
    
  } catch (error) {
    appendMessage('Error al procesar tu mensaje. Intenta nuevamente.', 'bot');
  } finally {
    // Rehabilitar input
    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
  }
}

function appendMessage(text, cls, saveToHistory = true) {
  const div = document.createElement('div');
  div.className = cls;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// ========================================
// API DE COMUNICACIÓN
// ========================================
async function askGroq(question) {
  try {
    const res = await fetch('/.netlify/functions/ask-groq', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        question,
        sessionId: chatHistory.sessionId 
      })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Error en la respuesta');
    }
    
    return data.response || 'Sin respuesta disponible';
  } catch (e) {
    return 'Error al conectar con el servidor. Intenta nuevamente.';
  }
}

// ========================================
// GESTIÓN DE SESIONES
// ========================================
async function startNewChat() {
  try {
    // Crear nueva sesión
    chatHistory.createNewSession();
    
    // Limpiar mensajes actuales
    messages.innerHTML = '';
    
    // Actualizar información de sesión
    updateSessionInfo();
    
    // Mostrar mensaje de confirmación
    appendMessage('Nueva conversación iniciada', 'bot', false);
    
    // Enfocar input
    input.focus();
    
  } catch (error) {
    appendMessage('Error al iniciar nueva conversación', 'bot', false);
  }
}

async function clearChatHistory() {
  if (!confirm('¿Estás seguro de que quieres limpiar todo el historial de chat?')) {
    return;
  }
  
  try {
    // Limpiar historial
    await chatHistory.clearHistory();
    
    // Limpiar mensajes actuales
    messages.innerHTML = '';
    
    // Mostrar mensaje de confirmación
    appendMessage('Historial limpiado correctamente', 'bot', false);
    
    // Enfocar input
    input.focus();
    
  } catch (error) {
    appendMessage('Error al limpiar el historial', 'bot', false);
  }
}