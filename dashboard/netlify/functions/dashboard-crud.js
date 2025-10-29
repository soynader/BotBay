// Headers CORS reutilizables
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

const googleSheetsService = require('./shared/google-sheets-service');

exports.handler = async (event, context) => {
  // Manejar preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: ''
    };
  }

  try {
    const method = event.httpMethod;
    const body = event.body ? JSON.parse(event.body) : {};
    const { sheetName = 'Usuarios', action, id, data } = body;

    // Obtener SHEET_ID desde variables de entorno
    const sheetId = process.env.SHEET_ID;
    if (!sheetId) {
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Configuración incompleta',
          message: 'SHEET_ID no configurado en variables de entorno'
        })
      };
    }

    switch (method) {
      case 'GET':
        // Leer todos los registros
        try {
          const records = await googleSheetsService.readSheet(sheetId, sheetName);
          return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
              success: true,
              data: records,
              count: records.length
            })
          };
        } catch (error) {
          console.error('Error leyendo registros:', error);
          return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({
              error: 'Error interno',
              message: 'No se pudieron obtener los registros'
            })
          };
        }

      case 'POST':
        // Crear nuevo registro
        if (!data) {
          return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({
              error: 'Datos requeridos',
              message: 'Se requieren datos para crear el registro'
            })
          };
        }

        try {
          const result = await googleSheetsService.appendRow(sheetId, sheetName, data);
          return {
            statusCode: 201,
            headers: CORS_HEADERS,
            body: JSON.stringify({
              success: true,
              message: 'Registro creado correctamente',
              data: result
            })
          };
        } catch (error) {
          console.error('Error creando registro:', error);
          return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({
              error: 'Error interno',
              message: 'No se pudo crear el registro'
            })
          };
        }

      case 'PUT':
        // Actualizar registro existente
        if (!id || !data) {
          return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({
              error: 'Datos requeridos',
              message: 'Se requiere ID y datos para actualizar el registro'
            })
          };
        }

        try {
          const result = await googleSheetsService.updateRow(sheetId, sheetName, parseInt(id), data);
          return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
              success: true,
              message: 'Registro actualizado correctamente',
              data: result
            })
          };
        } catch (error) {
          console.error('Error actualizando registro:', error);
          return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({
              error: 'Error interno',
              message: 'No se pudo actualizar el registro'
            })
          };
        }

      case 'DELETE':
        // Eliminar registro
        if (!id) {
          return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({
              error: 'ID requerido',
              message: 'Se requiere ID para eliminar el registro'
            })
          };
        }

        try {
          const result = await googleSheetsService.deleteRow(sheetId, sheetName, parseInt(id));
          return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
              success: true,
              message: 'Registro eliminado correctamente',
              data: result
            })
          };
        } catch (error) {
          console.error('Error eliminando registro:', error);
          return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({
              error: 'Error interno',
              message: 'No se pudo eliminar el registro'
            })
          };
        }

      default:
        return {
          statusCode: 405,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            error: 'Método no permitido',
            message: `Método ${method} no soportado`
          })
        };
    }

  } catch (error) {
    console.error('Error general en dashboard-crud:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Error interno del servidor',
        message: error.message || 'Ocurrió un error inesperado'
      })
    };
  }
};