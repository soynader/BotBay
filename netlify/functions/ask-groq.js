const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Headers CORS reutilizables
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

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

    // Leer el archivo de conocimiento asesores.txt
    let knowledgeText = '';
    try {
      // Intentar múltiples rutas posibles para el archivo
      const possiblePaths = [
        path.join(__dirname, '../../knowledge/asesores.txt'),
        path.join(process.cwd(), 'knowledge/asesores.txt'),
        path.join(__dirname, '../../../knowledge/asesores.txt'),
        './knowledge/asesores.txt'
      ];
      
      let knowledgePath = null;
      for (const testPath of possiblePaths) {
        if (fs.existsSync(testPath)) {
          knowledgePath = testPath;
          break;
        }
      }
      
      if (knowledgePath) {
        knowledgeText = fs.readFileSync(knowledgePath, 'utf8');
        console.log('Archivo asesores.txt leído correctamente desde:', knowledgePath);
      } else {
        throw new Error('Archivo asesores.txt no encontrado en ninguna ruta');
      }
    } catch (error) {
      console.log('Error leyendo asesores.txt, usando datos embebidos como respaldo:', error.message);
      knowledgeText = `
INFORMACIÓN PARA ENTRENAMIENTO DE IA SOBRE SKALA FINTECH
==========================================================

EMPRESA SKALA
-------------
Nombre: SKALA
Tipo: Financiera especializada en créditos de libranza

IMPORTANTE: NO se presta a soldados.
Solo se presta a oficiales y suboficiales activos, EXCEPTO SOLDADOS.
      `;
    }

    // Placeholder para compatibilidad - ya no se usa knowledgeData
    /*
      "empresa": {
        "nombre": "Skala Fintech",
        "descripcion": "Empresa financiera especializada en créditos de libranza para empleados públicos, fuerzas militares, policía y pensionados",
        "experiencia": "Más de 10 años en el mercado colombiano",
        "grupo": "Skala Management Ltd",
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
        "libranza": "Autorización que el cliente da a su entidad pagadora para que realice el descuento de su nómina o pensión y consigne directamente a Skala la cuota acordada",
        "pagaduria": "Entidad con la que Skala tiene un convenio para descuentos por libranza de empleados o pensionados",
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
          "descripcion": "Para clientes con crédito vigente en Skala, unificando la deuda en una sola operación"
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
          "Plan de Lealtad (Skala Plus)",
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
          "acceso": ["https://www.Skalacolombia.com", "https://www.Skalacolombia.com/portalclientes/"],
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
    */
    
    // Usar el texto del archivo asesores.txt como conocimiento principal
    const KNOWLEDGE = knowledgeText;

    // Lista de empresas autorizadas extraída del archivo de conocimiento
    const EMPRESAS_AUTORIZADAS = [
      'andina vida seguros', 'bbva seguros', 'seguros bolívar', 'mindefensa pensionado',
      'cremil', 'asulado', 'fiduprevisora', 'sura', 'coolfondos', 'protección',
      'positiva', 'seguros alfa', 'colpensiones', 'mapfre', 'ffopep', 'casur',
      'porvenir', 'cagen', 'ejercito nacional'
    ];

    // Función para validar si una empresa está autorizada
    function validarEmpresaAutorizada(pregunta) {
      const preguntaLower = pregunta.toLowerCase();
      
      // Buscar menciones de empresas en la pregunta
      const empresasMencionadas = [];
      
      // Verificar empresas específicas mencionadas en la pregunta
      if (preguntaLower.includes('ecopetrol')) {
        empresasMencionadas.push('ecopetrol');
      }
      
      // Verificar otras empresas comunes no autorizadas
      const empresasNoAutorizadas = [
        'ecopetrol', 'petrobras', 'chevron', 'shell', 'bp', 'total', 'repsol',
        'avianca', 'latam', 'copa airlines', 'viva air', 'wingo',
        'bancolombia', 'banco de bogotá', 'banco popular', 'davivienda',
        'banco av villas', 'banco caja social', 'banco falabella',
        'coca cola', 'pepsi', 'bavaria', 'postobon', 'alpina',
        'grupo éxito', 'carulla', 'olimpica', 'metro', 'makro',
        'telefónica', 'claro', 'movistar', 'tigo', 'une',
        'cemex', 'argos', 'corona', 'eternit', 'ladrillera santafé'
      ];
      
      for (const empresa of empresasNoAutorizadas) {
        if (preguntaLower.includes(empresa)) {
          empresasMencionadas.push(empresa);
        }
      }
      
      return empresasMencionadas;
    }

    // Función para validar soldados y rangos militares
    function validarRangoMilitar(pregunta) {
      const preguntaLower = pregunta.toLowerCase();
      let alertas = [];
      
      // Detectar menciones de soldados
      if (preguntaLower.includes('soldado') || preguntaLower.includes('soldados')) {
        alertas.push('🚨 SOLDADOS: NO se presta a soldados. Solo oficiales y suboficiales activos.');
      }
      
      // Detectar menciones de rangos específicos
      const rangosSoldados = ['soldado', 'soldados', 'raso', 'rasos'];
      for (const rango of rangosSoldados) {
        if (preguntaLower.includes(rango)) {
          alertas.push('🚨 RANGO NO AUTORIZADO: Este rango NO es elegible para créditos.');
        }
      }
      
      return alertas;
    }

    // Función para validar montos y plazos
    function validarMontosPlazos(pregunta) {
      const preguntaLower = pregunta.toLowerCase();
      let alertas = [];
      
      // Extraer números que podrían ser montos
      const montos = pregunta.match(/\$?([0-9]+(?:[.,][0-9]{3})*(?:[.,][0-9]+)?)/g);
      if (montos) {
        for (const montoStr of montos) {
          const monto = parseFloat(montoStr.replace(/[\$,\.]/g, ''));
          if (monto > 140000000) {
            alertas.push('🚨 MONTO EXCEDIDO: El monto máximo es $140,000,000');
          }
        }
      }
      
      // Extraer plazos
      const plazos = pregunta.match(/(\d+)\s*mes/gi);
      if (plazos) {
        for (const plazoStr of plazos) {
          const plazo = parseInt(plazoStr.match(/\d+/)[0]);
          if (plazo > 180) {
            alertas.push('🚨 PLAZO EXCEDIDO: El plazo máximo es 180 meses');
          }
          if (plazo < 24) {
            alertas.push('🚨 PLAZO INSUFICIENTE: El plazo mínimo es 24 meses');
          }
        }
      }
      
      return alertas;
    }

    // Función para validar edades
    function validarEdad(pregunta) {
      const preguntaLower = pregunta.toLowerCase();
      let alertas = [];
      
      // Buscar menciones de edad
      const edades = pregunta.match(/(\d+)\s*año/gi);
      if (edades) {
        for (const edadStr of edades) {
          const edad = parseInt(edadStr.match(/\d+/)[0]);
          if (edad < 18) {
            alertas.push('🚨 EDAD INSUFICIENTE: Debe ser mayor de 18 años');
          }
          if (edad > 82) {
            alertas.push('🚨 EDAD EXCEDIDA: La edad máxima es 82 años');
          }
        }
      }
      
      return alertas;
    }

    // Validar empresas mencionadas en la pregunta
    const empresasMencionadas = validarEmpresaAutorizada(question);
    let validacionEmpresa = '';
    
    if (empresasMencionadas.length > 0) {
      // Verificar si alguna empresa mencionada NO está en la lista autorizada
      const empresasNoAutorizadas = empresasMencionadas.filter(empresa => 
        !EMPRESAS_AUTORIZADAS.includes(empresa.toLowerCase())
      );
      
      if (empresasNoAutorizadas.length > 0) {
        validacionEmpresa = `\n\n🚨 VALIDACIÓN CRÍTICA: La empresa "${empresasNoAutorizadas[0].toUpperCase()}" NO está en la lista de convenios autorizados. DEBES responder que NO se presta a empleados de esta empresa. Consulta la sección "CONVENIOS - PAGADURÍAS - EMPRESAS" para ver las únicas empresas autorizadas.`;
      }
    }

    // Ejecutar todas las validaciones
    const alertasRango = validarRangoMilitar(question);
    const alertasMontos = validarMontosPlazos(question);
    const alertasEdad = validarEdad(question);
    
    // Combinar todas las alertas
    const todasLasAlertas = [...alertasRango, ...alertasMontos, ...alertasEdad];
    let validacionesAdicionales = '';
    
    if (todasLasAlertas.length > 0) {
      validacionesAdicionales = `\n\n${todasLasAlertas.join('\n')}`;
    }

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
    let prompt = `Eres un asesor experto de Skala Fintech. Responde de manera conversacional y personalizada usando el siguiente contexto:\n${KNOWLEDGE}${validacionEmpresa}${validacionesAdicionales}

🔴 REGLAS CRÍTICAS DE VALIDACIÓN - APLICAR ESTRICTAMENTE:

📋 EMPRESAS Y CONVENIOS:
1. SOLO se presta a las empresas listadas en "CONVENIOS - PAGADURÍAS - EMPRESAS"
2. Si preguntan por una empresa NO listada, responde: "No tenemos convenio con [EMPRESA]. Solo prestamos a empleados de las empresas con las que tenemos convenios activos."
3. ECOPETROL NO está en nuestra lista de convenios - NO se presta a empleados de Ecopetrol

👥 RANGOS MILITARES Y POLICÍA:
4. NO se presta a SOLDADOS - Solo oficiales y suboficiales activos
5. Ejército: Oficiales y suboficiales activos (NO soldados, NO rasos)
6. Policía: Oficiales y patrulleros (NO soldados)
7. Si mencionan "soldado" o "raso", responder claramente que NO son elegibles

💰 MONTOS Y PLAZOS:
8. Monto máximo: $140,000,000 - Si piden más, informar el límite
9. Plazo mínimo: 24 meses, máximo: 180 meses
10. Ejército/Policía activos: Máximo 60 meses y montos específicos

👤 EDADES Y ELEGIBILIDAD:
11. Edad mínima: 18 años, máxima: 82 años
12. Verificar SIEMPRE contra "SUJETOS DE CRÉDITO" y "NO SUJETOS DE CRÉDITO"
13. Si no está explícitamente permitido, responder que NO se puede prestar

⚠️ RESPUESTA ESTÁNDAR PARA CASOS NO AUTORIZADOS:
"Esta solicitud no cumple con nuestros criterios de elegibilidad según nuestras políticas actuales."`;
    
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
      // Extraer números de la pregunta con regex mejorada
      const montoMatch = question.match(/([0-9]+(?:[.,][0-9]{3})*(?:[.,][0-9]+)?)/g);
      const plazoMatch = question.match(/(\d+)\s*mes/i);
      const tasaMatch = question.match(/(\d+[.,]?\d*)\s*%/i);
      
      if (montoMatch && plazoMatch) {
        // Encontrar el número más grande (probablemente el monto)
        let monto = 0;
        for (const match of montoMatch) {
          const num = parseFloat(match.replace(/[.,]/g, ''));
          if (num > monto) monto = num;
        }
        
        const plazo = parseInt(plazoMatch[1]);
        const tasa = tasaMatch ? parseFloat(tasaMatch[1].replace(',', '.')) / 100 : 0.0185;
        
        if (monto > 0 && plazo > 0) {
          const cuota = calcularCuotaMensual(monto, plazo, tasa);
          const respuesta = `Para un crédito de $${monto.toLocaleString('es-CO')} a ${plazo} meses con tasa del ${(tasa * 100).toFixed(2)}% N.M.V., la cuota mensual es de $${cuota.toLocaleString('es-CO')} COP.`;
          
          return {
            statusCode: 200,
            headers: CORS_HEADERS,
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
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.1
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
      headers: CORS_HEADERS,
      body: JSON.stringify({ response: aiResponse })
    };

  } catch (error) {
    console.error('Error completo:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
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