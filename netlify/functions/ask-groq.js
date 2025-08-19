const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Configurar CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Manejar preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Solo permitir POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Obtener la pregunta y sessionId del body
    const { question, sessionId } = JSON.parse(event.body);
    
    if (!question) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Question is required' })
      };
    }

    // Obtener contexto del historial de chat si existe sessionId
    let chatContext = '';
    if (sessionId) {
      try {
        // Obtener historial desde la función save-chat-history
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
            // Tomar los últimos 8 mensajes para contexto (más contexto)
            const recentMessages = historyData.history.messages.slice(-8);
            chatContext = recentMessages.map(msg => 
              `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`
            ).join('\n');
          }
        }
      } catch (contextError) {
        console.log('No se pudo obtener contexto del historial:', contextError.message);
        // Continuar sin contexto si hay error
      }
    }

    // Conocimiento base para asesores (extraído de asesores.json)
    const knowledgeData = {
      "empresa": {
        "nombre": "Bayport Colombia",
        "descripcion": "Empresa financiera especializada en créditos de libranza para empleados públicos, fuerzas militares, policía y pensionados",
        "experiencia": "Más de 10 años en el mercado colombiano",
        "grupo": "Bayport Management Ltd",
        "experiencia_internacional": "Más de 19 años en préstamos por libranza",
        "presencia_internacional": ["Sudáfrica", "Zambia", "Uganda", "México", "Mozambique", "Tanzania", "Colombia", "Ghana", "Botswana"],
        "cifras": {
          "clientes_mundial": "Más de 600,000",
          "sucursales": "Más de 500",
          "colaboradores": "7,500",
          "sucursales_colombia": "17 en 15 ciudades",
          "clientes_colombia": "Más de 67,000",
          "cartera": "Cercano a COP 1.2 billones",
          "participacion_mercado": "32% del mercado no bancario"
        },
        "regulacion": {
          "regulado_por": "Superintendencia de Sociedades",
          "vigilado_por": "Superintendencia de Industria y Comercio",
          "aclaraciones": ["No somos un banco (no captamos dinero del público)", "No somos una cooperativa (no solicitamos aportes ni vinculación como asociado)"]
        }
      },
      "glosario": {
        "libranza": "Autorización que el cliente da a su entidad pagadora para que realice el descuento de su nómina o pensión y consigne directamente a Bayport la cuota acordada",
        "pagaduria": "Entidad con la que Bayport tiene un convenio para descuentos por libranza de empleados o pensionados",
        "desprendible_pago": "Soporte de pago que las entidades expiden a sus empleados o pensionados donde se reflejan sus ingresos y descuentos mensuales",
        "embargo_pensional": "Orden judicial emitida para el cumplimiento de una obligación no pagada, que opera sobre el salario o pensión",
        "paz_salvo": "Documento que certifica la cancelación total de una obligación financiera",
        "fianza": "Garantía del crédito sugerida y otorgada por un tercero. Tarifa única descontada al momento del desembolso",
        "score_crediticio": "Medición del hábito de pago del cliente, calculada sobre el número de cifras (bajo = menos favorable, alto = mejor)"
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
      "beneficios_asesores": {
        "ventajas": [
          "Manejo de tiempo flexible",
          "Plan de comisiones sin techo",
          "Procesos ágiles y sencillos",
          "Herramientas tecnológicas",
          "Atención desde casa",
          "Concursos y reconocimientos",
          "Plan de Lealtad (Bayport Plus)",
          "Acompañamiento humano",
          "Capacitación continua",
          "Independencia laboral"
        ],
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
        },
        "bono_millonario": {
          "descripcion": "Beneficio trimestral por desembolsos realizados",
          "fechas_pago_2024": ["12 de abril", "12 de julio", "11 de octubre", "23 de diciembre"],
          "requisitos": ["Código activo al momento del pago", "Al día con órdenes de facturación", "Solo aplica para cash adicional (no refinanciación)"]
        }
      },
      "estructura_producto": {
        "plazo": "Hasta 144 meses",
        "fianza": "7% (IVA incluido) - Garantía que respalda la obligación, tarifa única descontada al momento del desembolso",
        "tasas": {
          "descripcion": "De acuerdo al score crediticio del cliente",
          "tasa_ejemplo": "1.85% N.M.V. (Nominal Mensual Vencida)",
          "nota": "La tasa varía según el perfil crediticio del cliente"
        },
        "comision_corretaje": "5% - Valor porcentual que paga el cliente por el estudio y administración del crédito"
      },
      "simulacion_credito": {
        "ejemplo_calculo": {
          "monto_solicitado": "$5,000,000",
          "plazo_meses": 24,
          "tasa_interes_mensual": "1.85% N.M.V.",
          "cuota_mensual": "$259,885 COP",
          "nota": "*Sujeto a términos y condiciones de viabilidad para el otorgamiento del crédito"
        },
        "formula_calculo": "Cuota = [Monto × (Tasa × (1 + Tasa)^Plazo)] / [(1 + Tasa)^Plazo - 1]",
        "descuentos_aplicables": [
          "Fianza: 7% del monto (descontado al desembolso)",
          "Comisión de corretaje: 5% del monto",
          "Seguro de vida deudor (opcional)",
          "Seguro de accidentes personales (opcional)"
        ]
      },
      "politicas_credito": {
        "sujetos_credito": ["Empleados y pensionados de entidades públicas, fuerzas militares y policía", "Clientes con un embargo en el desprendible", "Clientes con reportes negativos en centrales de riesgo o sin experiencia crediticia", "Personas de 18 años hasta 79 años 330 días", "Pensionados: procesos jurídicos de Cooperativas, fondos de empleados y cajas de compensación", "Empleados activos: todos los procesos jurídicos", "Clientes con cédula de extranjería (solo pensionados de entidades colombianas)"],
        "no_sujetos_credito": ["Menores de edad (pensiones de sustitución con representante legal)", "Hijos mayores de 18 años y hasta 25 años con pensión de sustitución", "Interdictos y/o pensionados por incapacidad mental", "Personas con intento de fraude comprobado", "Personas en actividades ilícitas o lavado de activos", "Personas con suspensión de derechos políticos", "Personas con nombramiento de libre nombramiento y remoción y provisional"],
        "archivos_requeridos": {
          "pensionados": ["Cédula de ciudadanía", "2 últimos desprendibles de pago (resolución si solo se tiene un desprendible)", "Pensión por invalidez - dictamen médico", "Soporte de la cuenta bancaria cuando el pensionado solicite abono a cuenta"],
          "fuerzas_militares_policia": ["Cédula de ciudadanía", "Certificación laboral vigencia de 30 días", "2 últimos desprendibles de pago o haberes", "Extracto de hoja de vida", "Soporte de la cuenta bancaria"],
          "activos": ["Cédula de ciudadanía", "Certificación laboral vigencia de 30 días", "2 últimos desprendibles de pago", "Soporte de la cuenta bancaria"]
        }
      },
      "seguros": {
        "seguro_vida_deudor": {
          "coberturas": ["Fallecimiento por cualquier causa (empleados activos y pensionados)", "Incapacidad total y permanente (empleados activos)", "Enfermedades graves (empleados activos)", "Desempleo involuntario (empleados activos)"],
          "edad_ingreso": "18 años"
        },
        "seguro_accidentes_personales": {
          "cobertura": "Fallecimiento por accidente",
          "planes": {
            "tipos": "Planes individuales y familiares",
            "cobertura_rango": "$35,000,000 hasta $95,000,000"
          }
        }
      },
      "calculo_capacidad_pago": {
        "definicion": "Valor máximo mensual de la nómina que puede disponer un cliente para el pago de un crédito",
        "metodos_calculo": {
          "ley_1527": "Capacidad = (Ingresos - Descuentos de ley - Otros descuentos - Colchón + Compra de cartera)",
          "ley_50": "Capacidad = (Ingresos × 50%) - Total descuentos - Colchón + Compra de cartera",
          "minimo_vital": "Capacidad = Ingresos - Mínimo Vital - Total descuentos - Colchón + Compra de cartera"
        }
      },
      "argumentos_venta": {
        "ventajas_competitivas": ["Agilidad en procesos y atención personalizada/asistida", "Crédito 100% digital sin obligatoriedad de presencia física", "Mínimos documentos para formalización", "Herramientas tecnológicas disponibles (Portal de clientes)", "Validación de identidad y firma digital con proveedores expertos", "Transparencia en todos los procesos", "Comunicación constante durante el trámite"],
        "portal_clientes": {
          "acceso": ["https://www.bayportcolombia.com", "https://www.bayportcolombia.com/portalclientes/"],
          "tramites": ["Certificado de saldo", "Tabla de amortización", "Condiciones del crédito", "Aclaración de pago", "Devolución de dinero", "Paz y salvo", "Certificación al día", "Certificación declaración de renta", "Condiciones del seguro", "Consulta documentos de crédito", "Detalle de estado de cuenta", "Pago cuota"]
        },
        "canales_servicio": {
          "telefonos": {
            "bogota": "(601) 7442484",
            "gratuita_nacional": "018000113881",
            "horario": "Lunes a viernes de 8:00 am a 5:00 pm"
          }
        }
      },
      "codigo_etica": {
        "deberes_asesor": ["Siempre entregar información completa y clara según lineamientos de la compañía", "Aclarar condiciones del crédito (monto, plazo, cuota, descuentos) antes de la aceptación y desembolso", "Tomar medidas para evitar fraudes, revisando documentos del cliente", "Diligenciamiento completo de formularios", "Siempre presentar beneficios de la póliza de seguro de vida voluntario", "Tratar clientes y colegas con honestidad, integridad y profesionalismo", "Cuidar presentación personal y ser puntual en citas", "Asistir puntualmente a entrenamientos y reuniones programadas", "Contar con formato de solicitud firmado por el cliente para perfilamiento", "Hacer firmar documentos nuevamente si hay cambios en condiciones"],
        "prohibiciones_asesor": ["Solicitar dinero al cliente por cualquier concepto", "Ofrecer condiciones diferentes a las establecidas por la compañía", "Realizar promesas que no se puedan cumplir", "Falsificar o alterar documentos", "Compartir información confidencial de clientes", "Usar información de clientes para beneficio personal", "Realizar actividades que generen conflicto de interés", "Discriminar por raza, género, religión o condición social", "Usar lenguaje inapropiado o tener comportamientos inadecuados", "Realizar actividades comerciales durante horarios de trabajo"]
      }
     };
    
    // Convertir el JSON a texto estructurado para la IA
    const KNOWLEDGE = `
# Asistente de IA para Asesores Bayport Colombia

## INFORMACIÓN CORPORATIVA
- Empresa: ${knowledgeData.empresa.nombre}
- Descripción: ${knowledgeData.empresa.descripcion}
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

## GLOSARIO DE TÉRMINOS
- **Libranza**: ${knowledgeData.glosario.libranza}
- **Pagaduría**: ${knowledgeData.glosario.pagaduria}
- **Desprendible de pago**: ${knowledgeData.glosario.desprendible_pago}
- **Embargo pensional**: ${knowledgeData.glosario.embargo_pensional}
- **Paz y salvo**: ${knowledgeData.glosario.paz_salvo}
- **Fianza**: ${knowledgeData.glosario.fianza}

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
- **Tasas**: ${knowledgeData.estructura_producto.tasas.descripcion}
  - Tasa ejemplo: ${knowledgeData.estructura_producto.tasas.tasa_ejemplo}
  - Nota: ${knowledgeData.estructura_producto.tasas.nota}
- **Comisión corretaje**: ${knowledgeData.estructura_producto.comision_corretaje}

## SIMULACIÓN DE CRÉDITO
### Ejemplo de Cálculo
- **Monto solicitado**: ${knowledgeData.simulacion_credito.ejemplo_calculo.monto_solicitado}
- **Plazo**: ${knowledgeData.simulacion_credito.ejemplo_calculo.plazo_meses} meses
- **Tasa de interés**: ${knowledgeData.simulacion_credito.ejemplo_calculo.tasa_interes_mensual}
- **Cuota mensual**: ${knowledgeData.simulacion_credito.ejemplo_calculo.cuota_mensual}
- **Nota**: ${knowledgeData.simulacion_credito.ejemplo_calculo.nota}

### Fórmula de Cálculo
${knowledgeData.simulacion_credito.formula_calculo}

### Descuentos Aplicables
${knowledgeData.simulacion_credito.descuentos_aplicables.map(d => `- ${d}`).join('\n')}

## POLÍTICAS DE CRÉDITO
### Sujetos de crédito
${knowledgeData.politicas_credito.sujetos_credito.map(s => `- ${s}`).join('\n')}

### NO sujetos de crédito
${knowledgeData.politicas_credito.no_sujetos_credito.map(s => `- ${s}`).join('\n')}

### Documentos Requeridos
**Pensionados:** ${knowledgeData.politicas_credito.archivos_requeridos.pensionados.join(', ')}
**Activos:** ${knowledgeData.politicas_credito.archivos_requeridos.activos.join(', ')}
**Fuerzas Militares/Policía:** ${knowledgeData.politicas_credito.archivos_requeridos.fuerzas_militares_policia.join(', ')}

## SEGUROS
### Seguro de Vida Deudor
- Coberturas: ${knowledgeData.seguros.seguro_vida_deudor.coberturas.join(', ')}
- Edad mínima de ingreso: ${knowledgeData.seguros.seguro_vida_deudor.edad_ingreso}

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

    // Detectar si el usuario menciona su nombre en la pregunta actual
    const namePattern = /(?:me llamo|mi nombre es|soy|mi nombre|llamarme)\s+([A-Za-zÁÉÍÓÚáéíóúÑñ]+)/i;
    const nameMatch = question.match(namePattern);
    let detectedName = null;
    
    if (nameMatch) {
      detectedName = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1).toLowerCase();
    }
    
    // Buscar nombre en el historial de chat si no se detectó en la pregunta actual
    let userName = detectedName;
    if (!userName && chatContext) {
      const historyNameMatch = chatContext.match(/(?:me llamo|mi nombre es|soy|mi nombre|llamarme)\s+([A-Za-zÁÉÍÓÚáéíóúÑñ]+)/i);
      if (historyNameMatch) {
        userName = historyNameMatch[1].charAt(0).toUpperCase() + historyNameMatch[1].slice(1).toLowerCase();
      }
    }
    
    // Crear el prompt para la IA incluyendo contexto del historial si existe
    let prompt = `Eres un asesor experto de Bayport Colombia. Responde de manera conversacional y personalizada usando el siguiente contexto:\n${KNOWLEDGE}`;
    
    // Agregar contexto del historial de chat si existe
    if (chatContext) {
      prompt += `\n\n## CONTEXTO DE LA CONVERSACIÓN ANTERIOR:\n${chatContext}`;
      prompt += `\n\nIMPORTANTE: Mantén la coherencia con la conversación anterior. Si el usuario ya te dio su nombre, NO lo repitas en cada respuesta a menos que sea necesario para la conversación. Sé natural y conversacional.`;
    }
    
    // Agregar instrucciones de personalización de saludo solo para el primer mensaje
    const isFirstMessage = !chatContext || chatContext.trim() === '';
    
    if (isFirstMessage) {
      if (userName) {
        prompt += `\n\n## INSTRUCCIONES DE PERSONALIZACIÓN:\nEste es el primer mensaje de la conversación. El usuario se llama ${userName}. Inicia tu respuesta con "¡Hola ${userName}!" seguido de tu respuesta normal. En mensajes posteriores, NO repitas el saludo, sé natural y conversacional.`;
      } else {
        prompt += `\n\n## INSTRUCCIONES DE PERSONALIZACIÓN:\nEste es el primer mensaje de la conversación. El usuario no ha mencionado su nombre. Inicia tu respuesta con "¡Hola!" seguido de tu respuesta normal. En mensajes posteriores, NO repitas el saludo, sé natural y conversacional.`;
      }
    } else {
      // Para mensajes posteriores, ser natural sin saludos repetitivos
      if (userName) {
        prompt += `\n\n## INSTRUCCIONES DE PERSONALIZACIÓN:\nEl usuario se llama ${userName}. Responde de manera natural y conversacional. NO uses saludos repetitivos. Puedes usar su nombre ocasionalmente cuando sea apropiado para la conversación.`;
      } else {
        prompt += `\n\n## INSTRUCCIONES DE PERSONALIZACIÓN:\nResponde de manera natural y conversacional. NO uses saludos repetitivos.`;
      }
    }
    
    // Función para calcular cuota mensual usando la fórmula del sistema francés
    function calcularCuotaMensual(monto, plazo, tasa = 0.0185) {
      const cuota = monto * (tasa * Math.pow(1 + tasa, plazo)) / (Math.pow(1 + tasa, plazo) - 1);
      return Math.round(cuota);
    }

    // Detectar si la pregunta es sobre simulación de crédito
    const esSimulacion = /simula|cuota|mensual|pago|crédito|préstamo|\$|cop|monto|plazo|meses|interés|tasa/i.test(question);
    
    if (esSimulacion) {
      // Extraer números de la pregunta
      const montos = question.match(/\$?([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]+)?)/g);
      const plazos = question.match(/(\d+)\s*mes/i);
      const tasas = question.match(/(\d+[.,]?\d*)\s*%/i);
      
      if (montos && plazos) {
        const monto = parseFloat(montos[0].replace(/[^0-9]/g, ''));
        const plazo = parseInt(plazos[1]);
        const tasa = tasas ? parseFloat(tasas[1].replace(',', '.')) / 100 : 0.0185;
        
        if (monto > 0 && plazo > 0) {
          const cuota = calcularCuotaMensual(monto, plazo, tasa);
          const respuesta = `Para un crédito de $${monto.toLocaleString('es-CO')} a ${plazo} meses con tasa del ${(tasa * 100).toFixed(2)}% N.M.V., la cuota mensual es de $${cuota.toLocaleString('es-CO')} COP.`;
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ response: respuesta })
          };
        }
      }
    }

    prompt += `\n\nIMPORTANTE: Si el usuario pregunta sobre simulaciones de crédito, usa ÚNICAMENTE estos resultados exactos:\n\n- $12,000,000 a 36 meses = $459,528 COP\n- $10,000,000 a 24 meses = $519,770 COP\n- $13,000,000 a 72 meses = $328,185 COP\n- $17,000,000 a 72 meses = $429,165 COP\n- $18,000,000 a 60 meses = $499,189 COP\n\nPara otros montos y plazos, aplica la fórmula: Cuota = Monto × [0.0185 × (1.0185)^Plazo] / [(1.0185)^Plazo - 1] y redondea con Math.round().\n\nPregunta del usuario: ${question}`;
    
    // Si hay contexto, dar instrucciones adicionales para mantener coherencia
    if (chatContext) {
      prompt += `\n\nRespuesta (máximo 80 palabras, mantén el contexto y personaliza con la información que ya conoces del usuario):`;
    } else {
      prompt += `\n\nRespuesta (máximo 80 palabras):`;
    }

    // Verificar que la API key esté configurada
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY no está configurada en las variables de entorno');
    }

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
        max_tokens: 150,
        temperature: 0.3
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Groq API Error:', data);
      throw new Error(`Groq API error: ${data.error?.message || response.statusText || 'Unknown error'}`);
    }

    const aiResponse = data.choices?.[0]?.message?.content || 'Sin respuesta disponible';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ response: aiResponse })
    };

  } catch (error) {
    console.error('Error completo:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Error interno del servidor',
        message: error.message || 'No se pudo procesar la consulta. Intenta nuevamente.',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};