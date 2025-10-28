/**
 * Servicio para manejar la conexión y lectura de Google Sheets
 * Utiliza las credenciales almacenadas en variables de entorno
 */

const { google } = require('googleapis');

class GoogleSheetsService {
  constructor() {
    this.sheets = null;
    this.auth = null;
    this.initialized = false;
  }

  /**
   * Inicializa la conexión con Google Sheets API
   */
  async initialize() {
    try {
      // Obtener credenciales desde variables de entorno
      const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
      
      if (!credentialsJson) {
        throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON no encontrado en variables de entorno');
      }

      const credentials = JSON.parse(credentialsJson);
      
      // Configurar autenticación
      this.auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
      });

      // Inicializar cliente de Sheets
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      this.initialized = true;
      
      console.log('✅ Google Sheets API inicializada correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error inicializando Google Sheets API:', error.message);
      this.initialized = false;
      return false;
    }
  }

  /**
   * Lee el contenido de una celda específica
   * @param {string} sheetId - ID de la hoja de cálculo
   * @param {string} range - Rango de celdas (ej: 'SkalaIA!A2')
   * @returns {string} Contenido de la celda
   */
  async readCell(sheetId, range) {
    try {
      if (!this.initialized) {
        const initResult = await this.initialize();
        if (!initResult) {
          throw new Error('No se pudo inicializar Google Sheets API');
        }
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: range,
      });

      const values = response.data.values;
      
      if (!values || values.length === 0) {
        console.warn(`⚠️ No se encontraron datos en el rango: ${range}`);
        return '';
      }

      // Retornar el contenido de la primera celda encontrada
      const cellContent = values[0][0] || '';
      console.log(`✅ Datos leídos desde Google Sheets - Rango: ${range}, Longitud: ${cellContent.length} caracteres`);
      
      return cellContent;
    } catch (error) {
      console.error('❌ Error leyendo desde Google Sheets:', error.message);
      throw error;
    }
  }

  /**
   * Lee el prompt de entrenamiento desde la hoja SkalaIA
   * @param {string} sheetId - ID de la hoja de cálculo
   * @returns {string} Prompt de entrenamiento para la IA
   */
  async getTrainingPrompt(sheetId) {
    try {
      // Leer desde la celda A2 de la hoja SkalaIA
      const prompt = await this.readCell(sheetId, 'SkalaIA!A2');
      
      if (!prompt || prompt.trim().length === 0) {
        throw new Error('El prompt de entrenamiento está vacío en Google Sheets (SkalaIA!A2)');
      }

      console.log(`✅ Prompt de entrenamiento obtenido: ${prompt.length} caracteres`);
      return prompt;
    } catch (error) {
      console.error('❌ Error obteniendo prompt de entrenamiento:', error.message);
      throw error;
    }
  }

  /**
   * Valida la estructura del prompt obtenido
   * @param {string} prompt - Prompt a validar
   * @returns {boolean} True si el prompt es válido
   */
  validatePrompt(prompt) {
    if (!prompt || typeof prompt !== 'string') {
      console.warn('⚠️ Prompt inválido: no es una cadena de texto');
      return false;
    }

    if (prompt.trim().length < 100) {
      console.warn('⚠️ Prompt muy corto: menos de 100 caracteres');
      return false;
    }

    // Verificar elementos críticos
    const criticalElements = [
      'SKALA',
      'FINTECH',
      'CRÉDITO',
      'LIBRANZA'
    ];

    const missingElements = criticalElements.filter(element => 
      !prompt.toUpperCase().includes(element)
    );

    if (missingElements.length > 0) {
      console.warn('⚠️ Elementos críticos faltantes en el prompt:', missingElements);
      return false;
    }

    console.log('✅ Prompt validado correctamente');
    return true;
  }

  /**
   * Obtiene el prompt con validación y fallback
   * @param {string} sheetId - ID de la hoja de cálculo
   * @param {string} fallbackPrompt - Prompt de respaldo en caso de error
   * @returns {string} Prompt de entrenamiento
   */
  async getPromptWithFallback(sheetId, fallbackPrompt = '') {
    try {
      const prompt = await this.getTrainingPrompt(sheetId);
      
      if (this.validatePrompt(prompt)) {
        return prompt;
      } else {
        console.warn('⚠️ Prompt de Google Sheets no válido, usando fallback');
        return fallbackPrompt;
      }
    } catch (error) {
      console.error('❌ Error obteniendo prompt de Google Sheets, usando fallback:', error.message);
      return fallbackPrompt;
    }
  }
}

// Exportar una instancia singleton
const googleSheetsService = new GoogleSheetsService();

module.exports = googleSheetsService;