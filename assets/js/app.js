// Variables globales
const messages = document.getElementById('messages');
const input = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');

// Event listeners
sendBtn.onclick = sendMessage;
input.addEventListener('keydown', e => { 
  if (e.key === 'Enter') sendMessage(); 
});

// Función principal para enviar mensajes
async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;
  
  appendMessage(text, 'user');
  input.value = '';
  
  const reply = await askGroq(text);
  appendMessage(reply, 'bot');
}

// Función para agregar mensajes al chat
function appendMessage(text, cls) {
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
      body: JSON.stringify({ question })
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