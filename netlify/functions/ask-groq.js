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
        "tasas": "De acuerdo al score crediticio del cliente",
        "comision_corretaje": "5% - Valor porcentual que paga el cliente por el estudio y administración del crédito"
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
- **Tasas**: ${knowledgeData.estructura_producto.tasas}
- **Comisión corretaje**: ${knowledgeData.estructura_producto.comision_corretaje}

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