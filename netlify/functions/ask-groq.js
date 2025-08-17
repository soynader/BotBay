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

    // Conocimiento base para asesores (extraído de asesores.json)
    const knowledgeData = {
      "informacion_corporativa": {
        "nombre_empresa": "Bayport Colombia",
        "tipo_empresa": "Fintech de crédito digital",
        "historia": "Fundada en 2001 en Sudáfrica, llegó a Colombia en 2018",
        "presencia_internacional": "9 países (Sudáfrica, Botswana, Ghana, México, Colombia, etc.)",
        "inversionistas_clave": "LeapFrog Investments, Arise B.V.",
        "regulacion": "Supervisada por la Superintendencia Financiera de Colombia"
      },
      "glosario": {
        "conceptos_basicos": {
          "libranza": "Modalidad de crédito donde el descuento se realiza directamente de la nómina o pensión del deudor",
          "capacidad_de_pago": "Análisis de los ingresos y gastos del cliente para determinar su capacidad de endeudamiento",
          "score_crediticio": "Puntaje que evalúa el historial crediticio y comportamiento de pago",
          "tasa_efectiva_anual": "Costo total del crédito expresado en términos anuales",
          "seguro_deudor": "Protección que cubre el saldo de la deuda en caso de fallecimiento o incapacidad"
        },
        "tipos_credito": {
          "libre_inversion": "Crédito sin destinación específica, el cliente decide en qué utilizarlo",
          "consolidacion_deudas": "Unificación de múltiples obligaciones en un solo crédito con mejores condiciones",
          "credito_libranza": "Crédito con descuento directo de nómina, ofreciendo tasas preferenciales"
        }
      },
      "beneficios_asesores": {
        "ventajas": [
          "Comisiones competitivas por cada crédito aprobado",
          "Proceso 100% digital y ágil",
          "Soporte técnico y comercial permanente",
          "Herramientas de gestión y seguimiento",
          "Capacitación continua en productos financieros"
        ],
        "comisiones": {
          "estructura": "Comisión variable según monto y tipo de producto",
          "pago": "Mensual, posterior al desembolso del crédito",
          "bonos_adicionales": "Incentivos por cumplimiento de metas mensuales"
        },
        "bono_millonario": {
           "descripcion": "Beneficio trimestral por desembolsos realizados",
           "fechas_pago_2024": ["12 de abril", "12 de julio", "11 de octubre", "23 de diciembre"],
           "requisitos": ["Código activo al momento del pago", "Al día con órdenes de facturación", "Solo aplica para cash adicional (no refinanciación)"]
         },
         "comisiones": {
           "desembolso": {
             "valor": "$50,000 por millón desembolsado",
             "ejemplo": "Desembolso de $130,000,000 = $6,500,000 (menos descuentos de ley)",
             "frecuencia_pago": "Pagos semanales"
           },
           "refinanciacion": {
             "valor": "$10,000 por millón refinanciado",
             "adicional": "$50,000 por millón de dinero adicional"
           }
         }
       },
       "tipos_credito": [
         {
           "tipo": "Crédito nuevo",
           "descripcion": "Para clientes sin vínculo actual con la compañía"
         },
         {
           "tipo": "Compra de cartera",
           "descripcion": "Crédito desembolsado directamente a entidades donde el cliente tiene deudas"
         },
         {
           "tipo": "Refinanciación",
           "descripcion": "Para clientes con crédito vigente en Bayport, unificando la deuda en una sola operación"
         },
         {
           "tipo": "Crédito paralelo",
           "descripcion": "Adicional para clientes con crédito vigente, con autorización de la pagaduría para múltiples descuentos"
         }
       ],
       "estructura_producto": {
         "plazo": "Hasta 144 meses",
         "fianza": "7% (IVA incluido) - Garantía que respalda la obligación, tarifa única descontada al momento del desembolso",
         "tasas": "De acuerdo al score crediticio del cliente",
         "comision_corretaje": "5% - Valor porcentual que paga el cliente por el estudio y administración del crédito"
       },
       "politicas_credito": {
         "sujetos_credito": ["Empleados y pensionados de entidades públicas, fuerzas militares y policía", "Clientes con un embargo en el desprendible", "Clientes con reportes negativos en centrales de riesgo o sin experiencia crediticia", "Personas de 18 años hasta 79 años 330 días"],
         "no_sujetos_credito": ["Menores de edad", "Interdictos y/o pensionados por incapacidad mental", "Personas con intento de fraude comprobado", "Personas en actividades ilícitas"]
       }
     };
    
    // Convertir el JSON a texto estructurado para la IA
    const KNOWLEDGE = `
# Asistente de IA para Asesores Bayport Colombia

## INFORMACIÓN CORPORATIVA
- Empresa: ${knowledgeData.informacion_corporativa.nombre_empresa}
- Tipo: ${knowledgeData.informacion_corporativa.tipo_empresa}
- Historia: ${knowledgeData.informacion_corporativa.historia}
- Presencia internacional: ${knowledgeData.informacion_corporativa.presencia_internacional}
- Inversionistas clave: ${knowledgeData.informacion_corporativa.inversionistas_clave}
- Regulación: ${knowledgeData.informacion_corporativa.regulacion}

## GLOSARIO DE TÉRMINOS
### Conceptos Básicos
- **Libranza**: ${knowledgeData.glosario.conceptos_basicos.libranza}
- **Capacidad de pago**: ${knowledgeData.glosario.conceptos_basicos.capacidad_de_pago}
- **Score crediticio**: ${knowledgeData.glosario.conceptos_basicos.score_crediticio}
- **Tasa efectiva anual**: ${knowledgeData.glosario.conceptos_basicos.tasa_efectiva_anual}
- **Seguro deudor**: ${knowledgeData.glosario.conceptos_basicos.seguro_deudor}

### Tipos de Crédito
- **Libre inversión**: ${knowledgeData.glosario.tipos_credito.libre_inversion}
- **Consolidación de deudas**: ${knowledgeData.glosario.tipos_credito.consolidacion_deudas}
- **Crédito libranza**: ${knowledgeData.glosario.tipos_credito.credito_libranza}

## TIPOS DE CRÉDITO DISPONIBLES
${knowledgeData.tipos_credito.map(tipo => `- **${tipo.tipo}**: ${tipo.descripcion}`).join('\n')}

## BENEFICIOS PARA ASESORES
### Ventajas
${knowledgeData.beneficios_asesores.ventajas.map(v => `- ${v}`).join('\n')}

### Comisiones
- **Desembolso**: ${knowledgeData.beneficios_asesores.comisiones.desembolso.valor}
- **Ejemplo**: ${knowledgeData.beneficios_asesores.comisiones.desembolso.ejemplo}
- **Frecuencia de pago**: ${knowledgeData.beneficios_asesores.comisiones.desembolso.frecuencia_pago}
- **Refinanciación**: ${knowledgeData.beneficios_asesores.comisiones.refinanciacion.valor}
- **Adicional refinanciación**: ${knowledgeData.beneficios_asesores.comisiones.refinanciacion.adicional}

### Bono Millonario
- **Descripción**: ${knowledgeData.beneficios_asesores.bono_millonario.descripcion}
- **Fechas de pago 2024**: ${knowledgeData.beneficios_asesores.bono_millonario.fechas_pago_2024.join(', ')}
- **Requisitos**: ${knowledgeData.beneficios_asesores.bono_millonario.requisitos.join(', ')}

## ESTRUCTURA DEL PRODUCTO
- **Plazo**: ${knowledgeData.estructura_producto.plazo}
- **Fianza**: ${knowledgeData.estructura_producto.fianza}
- **Tasas**: ${knowledgeData.estructura_producto.tasas}
- **Comisión corretaje**: ${knowledgeData.estructura_producto.comision_corretaje}

## POLÍTICAS DE CRÉDITO
### Sujetos de crédito
${knowledgeData.politicas_credito.sujetos_credito.map(s => `- ${s}`).join('\n')}

### NO sujetos de crédito
${knowledgeData.politicas_credito.no_sujetos_credito.map(s => `- ${s}`).join('\n')}

### Documentos Requeridos
**Pensionados:** ${knowledgeData.documentos_requeridos.pensionados.join(', ')}
**Activos:** ${knowledgeData.documentos_requeridos.activos.join(', ')}
**Fuerzas Militares/Policía:** ${knowledgeData.documentos_requeridos.fuerzas_militares_policia.join(', ')}

## SEGUROS
### Seguro de Vida Deudor
- Coberturas: ${knowledgeData.seguros.seguro_vida_deudor.coberturas.join(', ')}
- Edad máxima de ingreso: ${knowledgeData.seguros.seguro_vida_deudor.edad_maxima_ingreso}

### Seguro de Accidentes Personales
- Cobertura: ${knowledgeData.seguros.seguro_accidentes_personales.cobertura}
- Planes disponibles: ${knowledgeData.seguros.seguro_accidentes_personales.planes.tipos}
- Rango de cobertura: ${knowledgeData.seguros.seguro_accidentes_personales.planes.cobertura_rango}

## CÁLCULO DE CAPACIDAD DE PAGO
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