// Variables globales
const messages = document.getElementById('messages');
const input = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');
const newChatBtn = document.getElementById('newChatBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const sessionInfo = document.getElementById('sessionInfo');
const loadingIndicator = document.getElementById('loadingIndicator');

// Instancia del sistema de historial de chat
let chatHistory;

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', async () => {
  // Inicializar ChatHistory
  chatHistory = new ChatHistory();
  
  // Mostrar información de la sesión
  updateSessionInfo();
  
  // Cargar historial existente
  await loadChatHistory();
  
  // Event listeners
  sendBtn.onclick = sendMessage;
  input.addEventListener('keydown', e => { 
    if (e.key === 'Enter') sendMessage(); 
  });
  
  newChatBtn.onclick = startNewChat;
  clearHistoryBtn.onclick = clearChatHistory;
});

// Actualizar información de la sesión
function updateSessionInfo() {
  const info = chatHistory.getSessionInfo();
  const sessionShort = info.sessionId.split('_')[1] || 'unknown';
  sessionInfo.textContent = `Sesión: ${sessionShort}`;
}

// Cargar historial de chat existente
async function loadChatHistory() {
  try {
    loadingIndicator.style.display = 'flex';
    
    const history = await chatHistory.getHistory();
    
    // Limpiar mensajes actuales
    messages.innerHTML = '';
    
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
    console.error('Error cargando historial:', error);
  } finally {
    loadingIndicator.style.display = 'none';
  }
}

// Función principal para enviar mensajes
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
    console.error('Error enviando mensaje:', error);
    appendMessage('Error al procesar tu mensaje. Intenta nuevamente.', 'bot');
  } finally {
    // Rehabilitar input
    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
  }
}

// Función para agregar mensajes al chat
function appendMessage(text, cls, saveToHistory = true) {
  const div = document.createElement('div');
  div.className = cls;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// Función para comunicarse con la API
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
    console.error('Error:', e);
    return 'Error al conectar con el servidor. Intenta nuevamente.';
  }
}

// Iniciar nueva conversación
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
    console.error('Error iniciando nueva conversación:', error);
    appendMessage('Error al iniciar nueva conversación', 'bot', false);
  }
}

// Limpiar historial de chat
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
    console.error('Error limpiando historial:', error);
    appendMessage('Error al limpiar el historial', 'bot', false);
  }
}