const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Solo permitir POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Manejar preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    // Obtener la pregunta del body
    const { question } = JSON.parse(event.body);
    
    if (!question) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Question is required' })
      };
    }

    // Conocimiento base de Bayport
    const KNOWLEDGE = `
# 🚀 Kit de Asesoría Freelance – Bayport Colombia

## 📌 Perfil del Cliente Ideal
- **Edad**: 25-55 años
- **Ingresos**: $2.500.000 - $8.000.000 COP
- **Perfil**: Empleados formales, pensionados, independientes con 2 años de experiencia
- **Nivel de endeudamiento**: < 40% de sus ingresos
- **Propósito**: Consolidar deudas, mejorar cash-flow, inversión personal

## 🎯 Productos Clave

### 📊 Línea Libre Inversión
- **Monto**: 1-50 millones COP
- **Plazo**: 12-84 meses
- **Tasa**: Desde 1.4% mensual
- **Desembolso**: 24-48 horas
- **Documentación**: Mínima (solo cédula y desprendibles)

### 🔁 Reestructuración de Deudas
- **Beneficio**: Reduce pagos mensuales hasta 50%
- **Incluye**: Tarjetas de crédito, créditos de libranza, vehículo, vivienda
- **Ventaja**: Un solo pago mensual

### 💼 Crédito por Libranza
- **Deducción**: Directo de nómina/pensión
- **Seguro**: Cubre riesgos de vida y desempleo
- **Tasa**: Reducida por deducción automática

## 🛡️ Beneficios Exclusivos
- **Seguro de vida**: Incluido sin costo
- **Aprobación**: 95% de clientes califican
- **Flexibilidad**: Pago anticipado sin penalidades
- **Atención**: Personalizada 24/7

## 📋 Requisitos Mínimos
1. **Cédula ciudadanía**
2. **Desprendible de nómina** (últimos 2 meses)
3. **Certificado laboral** (mínimo 6 meses)
4. **Extractos bancarios** (opcional para mejor tasa)

## 💳 Comparativa Competitiva
| Característica     | Bayport | Bancos | Cooperativas |
|--------------------|---------|--------|--------------|  
| Aprobación         | 95%     | 40%    | 70%          |
| Desembolso         | 24h     | 7-15 días | 3-5 días |
| Tasa promedio      | 1.4%    | 2.5%   | 1.8%         |
| Documentación      | Mínima  | Extensa| Media        |

## 🎯 Objecciones Comunes y Respuestas

### "La tasa es muy alta"
→ Comparada con tarjetas de crédito (3.5% mensual), nuestra tasa es 60% más baja. Además, incluye seguro de vida.

### "Prefiero esperar"
→ Cada día que espera, paga más intereses. Con nuestro promedio de ahorro de $300.000 mensual, esperar 3 meses le cuesta $900.000.

### "No estoy seguro"
→ Ofrecemos evaluación gratuita sin compromiso. Solo necesita su cédula para una pre-aprobación en 5 minutos.

### "Tengo miedo de endeudarme más"
→ Esta es precisamente la solución para reducir su endeudamiento total. Consolidamos todas sus deudas en una sola cuota menor.

## 📞 Cierre Efectivo
"Señor/a [Nombre], con su permiso, ¿podemos hacer la solicitud ahora? Solo necesito 5 minutos y su cédula. En 24 horas tendrá el dinero en su cuenta y empezará a ahorrar desde el primer mes."

## ⚡ Llamado a la Acción
"¿Tiene 5 minutos ahora? Puedo hacer la pre-aprobación inmediatamente y en 24 horas tendrá su dinero."

## 📱 Contacto
- **WhatsApp**: 300-123-4567
- **Horario**: Lunes a viernes 8 AM - 8 PM
- **Sábados**: 9 AM - 2 PM

---
**Recuerda**: Cada cliente tiene necesidades únicas. Adapta esta información según su perfil específico.
    `;

    // Crear el prompt para la IA
    const prompt = `Eres un asesor experto de Bayport Colombia. Responde en máximo 60 palabras usando el siguiente contexto:\n${KNOWLEDGE}\n\nPregunta: ${question}`;

    // Llamar a la API de Groq usando la variable de entorno
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 120,
        temperature: 0.2
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Groq API error: ${data.error?.message || 'Unknown error'}`);
    }

    const aiResponse = data.choices?.[0]?.message?.content || 'Sin respuesta disponible';

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ response: aiResponse })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Error interno del servidor',
        message: 'No se pudo procesar la consulta. Intenta nuevamente.' 
      })
    };
  }
};