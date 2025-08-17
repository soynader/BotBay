const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

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

    // Cargar conocimiento desde archivo JSON
    const knowledgePath = path.join(process.cwd(), 'knowledge', 'asesores.json');
    const knowledgeData = JSON.parse(fs.readFileSync(knowledgePath, 'utf8'));
    
    // Convertir el JSON a texto estructurado para la IA
    const KNOWLEDGE = `
# Asistente de IA para Asesores Bayport Colombia

## INFORMACIÓN CORPORATIVA
${knowledgeData.empresa.nombre} - ${knowledgeData.empresa.descripcion}
- Experiencia: ${knowledgeData.empresa.experiencia}
- Grupo: ${knowledgeData.empresa.grupo}
- Experiencia internacional: ${knowledgeData.empresa.experiencia_internacional}
- Presencia internacional: ${knowledgeData.empresa.presencia_internacional.join(', ')}

### Cifras Relevantes
- Clientes mundial: ${knowledgeData.empresa.cifras.clientes_mundial}
- Sucursales: ${knowledgeData.empresa.cifras.sucursales}
- Colaboradores: ${knowledgeData.empresa.cifras.colaboradores}
- Sucursales Colombia: ${knowledgeData.empresa.cifras.sucursales_colombia}
- Clientes Colombia: ${knowledgeData.empresa.cifras.clientes_colombia}
- Cartera: ${knowledgeData.empresa.cifras.cartera}
- Participación mercado: ${knowledgeData.empresa.cifras.participacion_mercado}

### Regulación
- Regulado por: ${knowledgeData.empresa.regulacion.regulado_por}
- Vigilado por: ${knowledgeData.empresa.regulacion.vigilado_por}
- Aclaraciones: ${knowledgeData.empresa.regulacion.aclaraciones.join(', ')}

## TIPOS DE CRÉDITO
${knowledgeData.tipos_credito.map(tipo => `- **${tipo.tipo}**: ${tipo.descripcion}`).join('\n')}

## BENEFICIOS PARA ASESORES
### Ventajas
${knowledgeData.beneficios_asesores.ventajas.map(v => `- ${v}`).join('\n')}

### Comisiones
- Desembolso: ${knowledgeData.beneficios_asesores.comisiones.desembolso.valor}
- Ejemplo: ${knowledgeData.beneficios_asesores.comisiones.desembolso.ejemplo}
- Refinanciación: ${knowledgeData.beneficios_asesores.comisiones.refinanciacion.valor}

## ESTRUCTURA DEL PRODUCTO
- Plazo: ${knowledgeData.estructura_producto.plazo}
- Fianza: ${knowledgeData.estructura_producto.fianza}
- Tasas: ${knowledgeData.estructura_producto.tasas}
- Comisión corretaje: ${knowledgeData.estructura_producto.comision_corretaje}

## POLÍTICAS DE CRÉDITO
### Sujetos de crédito
${knowledgeData.politicas_credito.sujetos_credito.map(s => `- ${s}`).join('\n')}

### NO sujetos de crédito
${knowledgeData.politicas_credito.no_sujetos_credito.map(s => `- ${s}`).join('\n')}

### Archivos Requeridos
**Pensionados:** ${knowledgeData.politicas_credito.archivos_requeridos.pensionados.join(', ')}
**Fuerzas Militares/Policía:** ${knowledgeData.politicas_credito.archivos_requeridos.fuerzas_militares_policia.join(', ')}
**Activos:** ${knowledgeData.politicas_credito.archivos_requeridos.activos.join(', ')}

## SEGUROS
### Seguro Vida Deudor
- Coberturas: ${knowledgeData.seguros.seguro_vida_deudor.coberturas.join(', ')}
- Edad ingreso: ${knowledgeData.seguros.seguro_vida_deudor.edad_ingreso}

### Seguro Accidentes Personales
- Cobertura: ${knowledgeData.seguros.seguro_accidentes_personales.cobertura}
- Planes: ${knowledgeData.seguros.seguro_accidentes_personales.planes.tipos}
- Cobertura rango: ${knowledgeData.seguros.seguro_accidentes_personales.planes.cobertura_rango}

## CÁLCULO CAPACIDAD DE PAGO
${knowledgeData.calculo_capacidad_pago.definicion}

### Métodos de Cálculo
- **Ley 1527**: ${knowledgeData.calculo_capacidad_pago.metodos_calculo.ley_1527}
- **Ley 50**: ${knowledgeData.calculo_capacidad_pago.metodos_calculo.ley_50}
- **Mínimo Vital**: ${knowledgeData.calculo_capacidad_pago.metodos_calculo.minimo_vital}

## ARGUMENTOS DE VENTA
### Ventajas Competitivas
${knowledgeData.argumentos_venta.ventajas_competitivas.map(v => `- ${v}`).join('\n')}

### Portal de Clientes
- Acceso: ${knowledgeData.argumentos_venta.portal_clientes.acceso.join(', ')}
- Trámites disponibles: ${knowledgeData.argumentos_venta.portal_clientes.tramites.join(', ')}

### Canales de Servicio
- Teléfono Bogotá: ${knowledgeData.argumentos_venta.canales_servicio.telefonos.bogota}
- Línea gratuita: ${knowledgeData.argumentos_venta.canales_servicio.telefonos.gratuita_nacional}
- Horario: ${knowledgeData.argumentos_venta.canales_servicio.telefonos.horario}

## CÓDIGO DE ÉTICA
### Deberes del Asesor
${knowledgeData.codigo_etica.deberes_asesor.slice(0, 10).map(d => `- ${d}`).join('\n')}

### Prohibiciones
${knowledgeData.codigo_etica.prohibiciones_asesor.slice(0, 10).map(p => `- ${p}`).join('\n')}

## GLOSARIO DE TÉRMINOS
${Object.entries(knowledgeData.glosario).map(([termino, definicion]) => `- **${termino}**: ${definicion}`).join('\n')}
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