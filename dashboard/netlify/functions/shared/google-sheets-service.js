/**
 * Servicio extendido para manejar la conexión y operaciones CRUD con Google Sheets
 * Extiende la funcionalidad del servicio base existente
 */

const { google } = require('googleapis');

class GoogleSheetsCRUDService {
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
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });

      // Inicializar cliente de Sheets
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      this.initialized = true;

      console.log('✅ Google Sheets CRUD API inicializada correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error inicializando Google Sheets CRUD API:', error.message);
      this.initialized = false;
      return false;
    }
  }

  /**
   * Lee datos de una hoja específica con formato de tabla
   * @param {string} sheetId - ID de la hoja de cálculo
   * @param {string} sheetName - Nombre de la hoja (ej: 'Usuarios')
   * @returns {Array} Array de objetos con los datos
   */
  async readSheet(sheetId, sheetName) {
    try {
      if (!this.initialized) {
        const initResult = await this.initialize();
        if (!initResult) {
          throw new Error('No se pudo inicializar Google Sheets API');
        }
      }

      const range = `${sheetName}!A:Z`; // Leer todas las columnas
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: range,
      });

      const rows = response.data.values || [];

      if (rows.length === 0) {
        console.log(`⚠️ No se encontraron datos en ${sheetName}`);
        return [];
      }

      // Convertir filas a objetos usando la primera fila como headers
      const headers = rows[0];
      const data = rows.slice(1).map((row, index) => {
        const obj = { id: index + 1 }; // Agregar ID basado en fila
        headers.forEach((header, colIndex) => {
          obj[header.toLowerCase().replace(/\s+/g, '_')] = row[colIndex] || '';
        });
        return obj;
      });

      console.log(`✅ Datos leídos desde ${sheetName}: ${data.length} registros`);
      return data;
    } catch (error) {
      console.error('❌ Error leyendo desde Google Sheets:', error.message);
      throw error;
    }
  }

  /**
   * Agrega una nueva fila a la hoja
   * @param {string} sheetId - ID de la hoja de cálculo
   * @param {string} sheetName - Nombre de la hoja
   * @param {Object} rowData - Objeto con los datos de la fila
   * @returns {Object} Resultado de la operación
   */
  async appendRow(sheetId, sheetName, rowData) {
    try {
      if (!this.initialized) {
        const initResult = await this.initialize();
        if (!initResult) {
          throw new Error('No se pudo inicializar Google Sheets API');
        }
      }

      // Primero obtener headers para asegurar orden correcto
      const headersResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!1:1`,
      });

      const headers = headersResponse.data.values[0] || [];

      // Crear array de valores en el orden de los headers
      const values = headers.map(header => {
        const key = header.toLowerCase().replace(/\s+/g, '_');
        return rowData[key] || '';
      });

      // Agregar la fila
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `${sheetName}!A:A`, // Append al final
        valueInputOption: 'RAW',
        resource: {
          values: [values],
        },
      });

      console.log(`✅ Fila agregada a ${sheetName}`);
      return {
        success: true,
        updatedRange: response.data.updates.updatedRange,
        updatedRows: response.data.updates.updatedRows
      };
    } catch (error) {
      console.error('❌ Error agregando fila:', error.message);
      throw error;
    }
  }

  /**
   * Actualiza una fila específica
   * @param {string} sheetId - ID de la hoja de cálculo
   * @param {string} sheetName - Nombre de la hoja
   * @param {number} rowIndex - Índice de la fila (1-based)
   * @param {Object} rowData - Nuevos datos de la fila
   * @returns {Object} Resultado de la operación
   */
  async updateRow(sheetId, sheetName, rowIndex, rowData) {
    try {
      if (!this.initialized) {
        const initResult = await this.initialize();
        if (!initResult) {
          throw new Error('No se pudo inicializar Google Sheets API');
        }
      }

      // Obtener headers
      const headersResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!1:1`,
      });

      const headers = headersResponse.data.values[0] || [];

      // Crear array de valores
      const values = headers.map(header => {
        const key = header.toLowerCase().replace(/\s+/g, '_');
        return rowData[key] || '';
      });

      // Calcular rango de la fila específica (rowIndex + 1 porque headers están en fila 1)
      const range = `${sheetName}!A${rowIndex + 1}:Z${rowIndex + 1}`;

      const response = await this.sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: range,
        valueInputOption: 'RAW',
        resource: {
          values: [values],
        },
      });

      console.log(`✅ Fila ${rowIndex} actualizada en ${sheetName}`);
      return {
        success: true,
        updatedRange: response.data.updatedRange,
        updatedRows: response.data.updatedRows
      };
    } catch (error) {
      console.error('❌ Error actualizando fila:', error.message);
      throw error;
    }
  }

  /**
   * Elimina una fila específica (marcándola como eliminada o moviendo filas)
   * @param {string} sheetId - ID de la hoja de cálculo
   * @param {string} sheetName - Nombre de la hoja
   * @param {number} rowIndex - Índice de la fila a eliminar
   * @returns {Object} Resultado de la operación
   */
  async deleteRow(sheetId, sheetName, rowIndex) {
    try {
      if (!this.initialized) {
        const initResult = await this.initialize();
        if (!initResult) {
          throw new Error('No se pudo inicializar Google Sheets API');
        }
      }

      // Leer todas las filas
      const allData = await this.readSheet(sheetId, sheetName);
      const totalRows = allData.length + 1; // +1 por headers

      // Crear nuevas filas sin la fila eliminada
      const headersResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!1:1`,
      });

      const headers = headersResponse.data.values[0] || [];
      const newData = [headers]; // Empezar con headers

      // Agregar todas las filas excepto la eliminada
      allData.forEach((row, index) => {
        if (index !== rowIndex - 1) { // -1 porque rowIndex es 1-based
          const values = headers.map(header => {
            const key = header.toLowerCase().replace(/\s+/g, '_');
            return row[key] || '';
          });
          newData.push(values);
        }
      });

      // Reemplazar toda la hoja
      const range = `${sheetName}!A1:Z${totalRows}`;
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId: sheetId,
        range: range,
      });

      // Escribir los nuevos datos
      const response = await this.sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        resource: {
          values: newData,
        },
      });

      console.log(`✅ Fila ${rowIndex} eliminada de ${sheetName}`);
      return {
        success: true,
        message: `Fila ${rowIndex} eliminada correctamente`
      };
    } catch (error) {
      console.error('❌ Error eliminando fila:', error.message);
      throw error;
    }
  }

  /**
   * Obtiene la estructura de la hoja (headers)
   * @param {string} sheetId - ID de la hoja de cálculo
   * @param {string} sheetName - Nombre de la hoja
   * @returns {Array} Array con los nombres de las columnas
   */
  async getSheetStructure(sheetId, sheetName) {
    try {
      if (!this.initialized) {
        const initResult = await this.initialize();
        if (!initResult) {
          throw new Error('No se pudo inicializar Google Sheets API');
        }
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!1:1`,
      });

      const headers = response.data.values[0] || [];
      return headers;
    } catch (error) {
      console.error('❌ Error obteniendo estructura de hoja:', error.message);
      throw error;
    }
  }
}

// Exportar instancia singleton
const googleSheetsCRUDService = new GoogleSheetsCRUDService();

module.exports = googleSheetsCRUDService;