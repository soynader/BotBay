const fetch = require('node-fetch');
const googleSheetsService = require('./google-sheets-service');

// Headers CORS reutilizables
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

// Prompt de respaldo en caso de que Google Sheets no esté disponible
const FALLBACK_PROMPT = `
# SKALA FINTECH - ASESOR VIRTUAL

## INFORMACIÓN BÁSICA:
- Empresa: SKALA FINTECH
- Especialidad: Créditos de libranza
- Público objetivo: Empleados públicos, fuerzas militares, policía y pensionados

## RESTRICCIONES CRÍTICAS:
- ❌ NO se presta a SOLDADOS (solo oficiales y suboficiales)
- ❌ Verificar empresa en convenios autorizados
- ✅ Edad: 18-82 años
- ✅ Monto máximo: $140,000,000
- ✅ Plazo máximo: 180 meses

## INSTRUCCIONES:
Responder de forma profesional y precisa. Si no tienes información específica, solicitar contactar directamente con Skala.
`;

exports.handler = async (event, context) => {
  // Manejar preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: ''
    };
  }

  // Solo permitir POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Obtener la pregunta y sessionId del body
    const { question, sessionId } = JSON.parse(event.body);
    
    if (!question) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Question is required' })
      };
    }

    console.log(`📝 Nueva consulta recibida: ${question.substring(0, 100)}...`);

    // Obtener contexto del historial de chat si existe sessionId
    let chatContext = '';
    if (sessionId) {
      try {
        const historyResponse = await fetch(`${process.env.URL || 'http://localhost:8888'}/.netlify/functions/save-chat-history`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sessionId: sessionId,
            action: 'get'
          })
        });

        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          if (historyData.history && historyData.history.messages && historyData.history.messages.length > 0) {
            const recentMessages = historyData.history.messages.slice(-6);
            chatContext = recentMessages.map(msg => 
              `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`
            ).join('\n');
          }
        }
      } catch (contextError) {
        console.log('⚠️ No se pudo obtener contexto del historial:', contextError.message);
      }
    }

    // Obtener el prompt de entrenamiento desde Google Sheets
    let trainingPrompt = '';
    try {
      const sheetId = process.env.SHEET_ID;
      
      if (!sheetId) {
        throw new Error('SHEET_ID no está configurado en las variables de entorno');
      }

      console.log('📊 Obteniendo prompt de entrenamiento desde Google Sheets...');
      trainingPrompt = await googleSheetsService.getPromptWithFallback(sheetId, FALLBACK_PROMPT);
      
      if (trainingPrompt === FALLBACK_PROMPT) {
        console.warn('⚠️ Usando prompt de respaldo - verificar configuración de Google Sheets');
      } else {
        console.log('✅ Prompt de entrenamiento obtenido exitosamente desde Google Sheets');
      }
      
    } catch (error) {
      console.error('❌ Error obteniendo datos de Google Sheets:', error.message);
      trainingPrompt = FALLBACK_PROMPT;
      console.log('🔄 Usando prompt de respaldo');
    }

    // Validaciones críticas automáticas
    const criticalValidations = performCriticalValidations(question);
    
    // Detectar nombre del usuario
    const userName = detectUserName(question, chatContext);
    
    // Construir el prompt optimizado para la IA
    const aiPrompt = buildAIPrompt({
      trainingPrompt,
      question,
      chatContext,
      criticalValidations,
      userName
    });

    // Verificar configuración de API
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY no está configurada en las variables de entorno');
    }

    // Llamar a la API de Groq
    console.log('🤖 Enviando consulta a Groq AI...');
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: aiPrompt }],
        max_tokens: 200,
        temperature: 0.1
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Groq API Error:', data);
      throw new Error(`Groq API error: ${data.error?.message || response.statusText || 'Unknown error'}`);
    }

    const aiResponse = data.choices?.[0]?.message?.content || 'Sin respuesta disponible';
    console.log('✅ Respuesta generada exitosamente');

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ response: aiResponse })
    };

  } catch (error) {
    console.error('❌ Error completo:', error);
    
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ 
        error: 'Error interno del servidor',
        message: error.message || 'No se pudo procesar la consulta. Intenta nuevamente.',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};

/**
 * Realiza validaciones críticas automáticas sobre la consulta
 * @param {string} question - Pregunta del usuario
 * @returns {string} Validaciones críticas detectadas
 */
function performCriticalValidations(question) {
  const validations = [];
  const questionLower = question.toLowerCase();

  // Validación de soldados
  if (questionLower.includes('soldado') || questionLower.includes('soldados')) {
    validations.push('🚨 SOLDADOS: NO se presta a soldados. Solo oficiales y suboficiales activos.');
  }

  // Validación de empresas no autorizadas comunes
  const empresasNoAutorizadas = [
    'ecopetrol', 'avianca', 'bancolombia', 'coca cola', 'telefónica', 
    'claro', 'movistar', 'grupo éxito', 'cemex', 'argos'
  ];
  
  for (const empresa of empresasNoAutorizadas) {
    if (questionLower.includes(empresa)) {
      validations.push(`🚨 EMPRESA NO AUTORIZADA: ${empresa.toUpperCase()} no está en convenios autorizados.`);
      break;
    }
  }

  // Validación de montos
  const montos = question.match(/\$?([0-9]+(?:[.,][0-9]{3})*(?:[.,][0-9]+)?)/g);
  if (montos) {
    for (const montoStr of montos) {
      const monto = parseFloat(montoStr.replace(/[\$,\.]/g, ''));
      if (monto > 140000000) {
        validations.push('🚨 MONTO EXCEDIDO: El monto máximo es $140,000,000');
        break;
      }
    }
  }

  // Validación de plazos
  const plazos = question.match(/(\d+)\s*mes/gi);
  if (plazos) {
    for (const plazoStr of plazos) {
      const plazo = parseInt(plazoStr.match(/\d+/)[0]);
      if (plazo > 180) {
        validations.push('🚨 PLAZO EXCEDIDO: El plazo máximo es 180 meses');
        break;
      }
    }
  }

  // Validación de edades
  const edades = question.match(/(\d+)\s*año/gi);
  if (edades) {
    for (const edadStr of edades) {
      const edad = parseInt(edadStr.match(/\d+/)[0]);
      if (edad < 18) {
        validations.push('🚨 EDAD INSUFICIENTE: Debe ser mayor de 18 años');
        break;
      }
      if (edad > 82) {
        validations.push('🚨 EDAD EXCEDIDA: La edad máxima es 82 años');
        break;
      }
    }
  }

  return validations.length > 0 ? validations.join('\n') : '';
}

/**
 * Detecta el nombre del usuario en la pregunta o contexto
 * @param {string} question - Pregunta actual
 * @param {string} chatContext - Contexto del chat
 * @returns {string|null} Nombre del usuario o null
 */
function detectUserName(question, chatContext) {
  const namePattern = /(?:me llamo|mi nombre es|soy|mi nombre|llamarme)\s+([A-Za-zÁÉÍÓÚáéíóúÑñ]+)/i;
  
  // Buscar en la pregunta actual
  let nameMatch = question.match(namePattern);
  if (nameMatch) {
    return nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1).toLowerCase();
  }
  
  // Buscar en el contexto del chat
  if (chatContext) {
    nameMatch = chatContext.match(namePattern);
    if (nameMatch) {
      return nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1).toLowerCase();
    }
  }
  
  return null;
}

/**
 * Construye el prompt optimizado para la IA
 * @param {Object} params - Parámetros para construir el prompt
 * @returns {string} Prompt completo para la IA
 */
function buildAIPrompt({ trainingPrompt, question, chatContext, criticalValidations, userName }) {
  let prompt = `# ASESOR SKALA FINTECH - SISTEMA EXPERTO

## CONOCIMIENTO BASE:
${trainingPrompt}`;

  // Agregar validaciones críticas si existen
  if (criticalValidations) {
    prompt += `\n\n## 🚨 VALIDACIONES CRÍTICAS DETECTADAS:
${criticalValidations}

**IMPORTANTE**: Estas validaciones tienen PRIORIDAD MÁXIMA sobre cualquier otra información.`;
  }

  // Agregar contexto conversacional si existe
  if (chatContext) {
    prompt += `\n\n## CONTEXTO CONVERSACIONAL:
${chatContext}

**CONTINUIDAD**: Mantén coherencia con la conversación anterior. Evita repetir información ya establecida.`;
  }

  // Instrucciones de personalización
  const isFirstMessage = !chatContext || chatContext.trim() === '';
  
  if (isFirstMessage) {
    if (userName) {
      prompt += `\n\n## PERSONALIZACIÓN:
Este es el primer mensaje. El usuario se llama ${userName}. Inicia con "¡Hola ${userName}!" seguido de tu respuesta.`;
    } else {
      prompt += `\n\n## PERSONALIZACIÓN:
Este es el primer mensaje. Inicia con "¡Hola!" seguido de tu respuesta.`;
    }
  } else {
    if (userName) {
      prompt += `\n\n## PERSONALIZACIÓN:
El usuario se llama ${userName}. Responde naturalmente, puedes usar su nombre cuando sea apropiado.`;
    } else {
      prompt += `\n\n## PERSONALIZACIÓN:
Responde de manera natural y conversacional.`;
    }
  }

  // Instrucciones finales
  prompt += `\n\n## INSTRUCCIONES DE RESPUESTA:
1. **PRIORIDAD**: Aplicar validaciones críticas antes que cualquier otra información
2. **ESTRUCTURA**: Responder de forma conversacional pero precisa
3. **VERIFICACIÓN**: Contrastar SIEMPRE contra información autorizada
4. **CLARIDAD**: Explicar razones cuando se deniegue una solicitud
5. **LÍMITE**: Máximo 80 palabras

## PREGUNTA DEL USUARIO:
${question}

## RESPUESTA:`;

  return prompt;
}