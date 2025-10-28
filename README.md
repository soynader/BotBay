# 🚀 Skala IA - Asistente Virtual Financiero

**Plataforma completa de asesoría financiera con IA para Skala Fintech**

## 📋 Descripción

Aplicación web completa que incluye:
- **Chat inteligente** con IA (Groq API) para asesoría financiera personalizada
- **Simulador de créditos** con cálculos precisos basados en tabla de referencia
- **Interfaz responsiva** optimizada para móviles y escritorio
- **Funciones serverless** para procesamiento backend

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Netlify Functions (Node.js)
- **IA**: Groq API (Llama 3.1 70B)
- **Hosting**: Netlify
- **Datos**: Archivo de conocimiento local (asesores.txt)

## 📁 Estructura del Proyecto

```
├── index.html                    # Página principal del chat
├── simulador.html               # Simulador de créditos
├── assets/
│   ├── css/
│   │   └── styles.css          # Estilos principales
│   └── js/
│       ├── app.js              # Lógica del chat
│       └── chat-history.js     # Gestión de historial
├── netlify/
│   └── functions/
│       ├── ask-groq.js         # Función IA con conocimiento
│       └── save-chat-history.js # Gestión de historial
├── knowledge/
│   └── asesores.txt            # Base de conocimiento
├── netlify.toml                # Configuración de Netlify
├── package.json                # Dependencias
└── README.md                   # Este archivo
```

## 🚀 Guía de Despliegue

### 📋 Pre-requisitos

1. **Cuenta de GitHub** (gratuita)
2. **Cuenta de Netlify** (gratuita)
3. **API Key de Groq** (gratuita)

### 🔧 Paso 1: Preparar el Proyecto

El proyecto ya está listo para producción con:
- ✅ Configuración optimizada de `netlify.toml`
- ✅ `.gitignore` actualizado
- ✅ Funciones serverless optimizadas
- ✅ Cache configurado para archivos estáticos

### 📤 Paso 2: Subir a GitHub

```bash
# 1. Inicializar repositorio Git
git init

# 2. Agregar todos los archivos
git add .

# 3. Hacer commit inicial
git commit -m "🚀 Skala IA - Asistente Virtual Financiero"

# 4. Crear rama principal
git branch -M main

# 5. Conectar con repositorio remoto (crear en GitHub primero)
git remote add origin https://github.com/TU-USUARIO/skala-ia.git

# 6. Subir código
git push -u origin main
```

### 🌐 Paso 3: Desplegar en Netlify

#### Opción A: Integración con GitHub (Recomendado)

1. **Conectar repositorio**:
   - Ve a [netlify.com](https://netlify.com)
   - Clic en **"New site from Git"**
   - Selecciona **GitHub** y autoriza
   - Elige tu repositorio `skala-ia`

2. **Configuración automática**:
   - Netlify detectará `netlify.toml` automáticamente
   - **Build command**: `echo 'No build required'`
   - **Publish directory**: `.` (raíz)
   - **Functions directory**: `netlify/functions`

3. **Deploy inicial**:
   - Clic en **"Deploy site"**
   - Netlify asignará una URL temporal

#### Opción B: Deploy Manual

1. **Comprimir proyecto**:
   - Crear ZIP con todos los archivos
   - Excluir `.git/`, `node_modules/`, `.netlify/`

2. **Subir manualmente**:
   - Arrastra el ZIP a netlify.com
   - Configuración detectada automáticamente

### 🔑 Paso 4: Configurar Variables de Entorno

1. **En el panel de Netlify**:
   - Ve a **Site settings > Environment variables**
   - Clic en **"Add variable"**

2. **Agregar API Key**:
   - **Key**: `GROQ_API_KEY`
   - **Value**: `tu_clave_de_groq_aqui`
   - **Scopes**: Todas las opciones marcadas

3. **Redesplegar**:
   - Ve a **Deploys > Trigger deploy**
   - Selecciona **"Deploy site"**

## 🔑 Obtener API Key de Groq

1. Ve a [console.groq.com](https://console.groq.com)
2. Crea una cuenta gratuita
3. Ve a **API Keys** y genera una nueva clave
4. Copia la clave (formato: `gsk_...`)

## ⚙️ Configuración Local (Desarrollo)

Para probar localmente con Netlify Dev:

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Instalar dependencias
npm install node-fetch

# Configurar variables locales
echo "GROQ_API_KEY=tu_clave_aqui" > .env

# Ejecutar localmente
netlify dev
```

### ✅ Paso 5: Verificar Despliegue

1. **Probar la aplicación**:
   - Abre la URL asignada por Netlify
   - Verifica que el chat funcione correctamente
   - Prueba el simulador de créditos

2. **Configurar dominio personalizado** (opcional):
   - En **Site settings > Domain management**
   - Agregar dominio personalizado
   - Configurar DNS según instrucciones

## 🎯 Características de la Aplicación

### 💬 Chat Inteligente
- **IA avanzada** con Groq (Llama 3.1 70B)
- **Conocimiento especializado** en productos Skala
- **Respuestas contextuales** basadas en base de datos local
- **Historial de conversaciones** persistente
- **Interfaz responsiva** optimizada para móviles

### 🧮 Simulador de Créditos
- **Cálculos precisos** basados en tabla de referencia oficial
- **Regla de tres** para montos personalizados
- **Validaciones automáticas** de términos y montos
- **Resultados formateados** con separadores de miles
- **Interfaz intuitiva** y fácil de usar

### 🔧 Funciones Técnicas
- **Serverless functions** optimizadas para Netlify
- **CORS configurado** para acceso desde cualquier dominio
- **Cache inteligente** para archivos estáticos
- **Manejo robusto de errores** y fallbacks
- **Logging detallado** para debugging

### 📱 Experiencia de Usuario
- **Diseño responsivo** que se adapta a cualquier dispositivo
- **Carga rápida** con optimizaciones de rendimiento
- **Navegación intuitiva** entre chat y simulador
- **Feedback visual** en tiempo real
- **Accesibilidad mejorada** para todos los usuarios
- Respuestas contextuales sobre productos Skala
- Diseño responsivo (móvil y desktop)
- Burbujas de chat anchas y optimizadas
- API key protegida con Netlify Functions
- Manejo de errores robusto

### 🎨 Diseño
- **Tema**: Oscuro profesional
- **Colores**: Azul corporativo (#00c2cb)
- **Tipografía**: System fonts (Apple/Segoe UI)
- **Responsive**: Optimizado para móviles

## 🔒 Seguridad

- ✅ API key oculta en variables de entorno
- ✅ Funciones serverless para backend
- ✅ CORS configurado correctamente
- ✅ Sin exposición de credenciales en frontend

## 📱 Uso

1. **Acceder**: Abre la URL de tu sitio Netlify
2. **Chatear**: Escribe preguntas sobre productos Skala
3. **Respuestas**: Recibe asesoría personalizada en segundos

### Ejemplos de preguntas:
- "¿Cuáles son las tasas de interés?"
- "¿Qué documentos necesito?"
- "¿Cuánto puedo solicitar?"
- "¿En cuánto tiempo aprueban?"

## 🐛 Solución de Problemas

### Error: "Error al conectar con el servidor"
- ✅ Verifica que la variable `GROQ_API_KEY` esté configurada
- ✅ Asegúrate de que la función esté desplegada correctamente
- ✅ Revisa los logs en Netlify Functions

### Error: "Function not found"
- ✅ Verifica que `netlify.toml` esté en la raíz
- ✅ Confirma que la carpeta `netlify/functions` existe
- ✅ Redesplega el sitio

### Problemas de CORS
- ✅ Verifica la configuración en `netlify.toml`
- ✅ Asegúrate de usar `/.netlify/functions/ask-groq`

## 📊 Monitoreo

- **Analytics**: Panel de Netlify
- **Logs**: Netlify Functions logs
- **Performance**: Lighthouse integrado
- **Uptime**: Monitoring automático

## 🔄 Actualizaciones

Para actualizar el contenido o funcionalidad:

1. **Git**: Push cambios al repositorio
2. **Auto-deploy**: Netlify despliega automáticamente
3. **Manual**: Drag & drop nueva versión

## 📞 Soporte

- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Groq API**: [console.groq.com/docs](https://console.groq.com/docs)
- **Issues**: Crear issue en el repositorio

---

**¡Tu asistente Skala IA está listo para ayudar a tus clientes! 🎉**