# 🚀 Bayport IA - Chat Assistant

**Asistente virtual inteligente para asesoría financiera de Skala Fintech**

## 📋 Descripción

Aplicación web de chat que utiliza IA (Groq API) para brindar asesoría personalizada sobre productos financieros de Skala Fintech. Optimizada para dispositivos móviles con diseño responsivo y burbujas de chat anchas.

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Netlify Functions (Node.js)
- **IA**: Groq API (Llama 3 70B)
- **Hosting**: Netlify

## 📁 Estructura del Proyecto

```
├── index_burbujas_anchas.html    # Aplicación principal
├── netlify/
│   └── functions/
│       └── ask-groq.js           # Función serverless para IA
├── netlify.toml                  # Configuración de Netlify
└── README.md                     # Este archivo
```

## 🚀 Despliegue en Netlify

### Opción 1: Drag & Drop (Más Fácil)

1. **Preparar archivos**:
   - Asegúrate de tener todos los archivos del proyecto
   - Renombra `index_burbujas_anchas.html` a `index.html`

2. **Subir a Netlify**:
   - Ve a [netlify.com](https://netlify.com)
   - Arrastra toda la carpeta del proyecto al área de despliegue
   - Netlify detectará automáticamente la configuración

3. **Configurar variable de entorno**:
   - En el panel de Netlify, ve a **Site settings > Environment variables**
   - Crea una nueva variable:
     - **Key**: `GROQ_API_KEY`
     - **Value**: `tu_clave_de_groq_aqui`
   - Guarda los cambios

4. **Redesplegar**:
   - Ve a **Deploys** y haz clic en **Trigger deploy**
   - Selecciona **Deploy site**

### Opción 2: Git Integration (Recomendado)

1. **Subir a GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/bayport-ia.git
   git push -u origin main
   ```

2. **Conectar con Netlify**:
   - En Netlify, clic en **New site from Git**
   - Conecta tu repositorio de GitHub
   - Configuración automática detectada por `netlify.toml`

3. **Configurar variables de entorno**:
   - **Site settings > Environment variables**
   - Agregar: `GROQ_API_KEY = tu_clave_aqui`

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

## 🎯 Características

### ✅ Funcionalidades
- Chat en tiempo real con IA
- Respuestas contextuales sobre productos Bayport
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
2. **Chatear**: Escribe preguntas sobre productos Bayport
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

**¡Tu asistente Bayport IA está listo para ayudar a tus clientes! 🎉**