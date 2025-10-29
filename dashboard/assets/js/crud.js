// ========================================
// DASHBOARD CRUD - JavaScript Frontend
// ========================================

// Elementos del DOM
const tableBody = document.getElementById('tableBody');
const loadingIndicator = document.getElementById('loadingIndicator');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const recordForm = document.getElementById('recordForm');
const addRecordBtn = document.getElementById('addRecordBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelBtn = document.getElementById('cancelBtn');

// Variables globales
let currentEditingId = null;
let isEditMode = false;

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  // Configurar event listeners
  addRecordBtn.addEventListener('click', () => openModal());
  closeModalBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  recordForm.addEventListener('submit', handleFormSubmit);

  // Cerrar modal al hacer click fuera
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Cargar datos iniciales
  loadRecords();
});

// ========================================
// FUNCIONES DE CARGA DE DATOS
// ========================================

/**
 * Carga todos los registros desde Google Sheets
 */
async function loadRecords() {
  showLoading();

  try {
    const response = await fetch('/.netlify/functions/dashboard-crud', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok && data.success) {
      renderTable(data.data);
    } else {
      showError('Error cargando datos: ' + (data.message || 'Error desconocido'));
    }
  } catch (error) {
    console.error('Error cargando registros:', error);
    showError('Error de conexión. Verifica tu conexión a internet.');
  } finally {
    hideLoading();
  }
}

// ========================================
// FUNCIONES DE RENDERIZADO
// ========================================

/**
 * Renderiza la tabla con los datos
 * @param {Array} records - Array de registros
 */
function renderTable(records) {
  tableBody.innerHTML = '';

  if (records.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
      <td colspan="5" style="text-align: center; padding: 3rem; color: var(--dashboard-text-secondary);">
        <div style="font-size: 3rem; margin-bottom: 1rem;">📋</div>
        No hay registros disponibles.<br>
        Haz click en "Agregar Registro" para crear el primero.
      </td>
    `;
    tableBody.appendChild(emptyRow);
    return;
  }

  records.forEach(record => {
    const row = createTableRow(record);
    tableBody.appendChild(row);
  });
}

/**
 * Crea una fila de tabla para un registro
 * @param {Object} record - Datos del registro
 * @returns {HTMLElement} Fila de tabla
 */
function createTableRow(record) {
  const row = document.createElement('tr');

  row.innerHTML = `
    <td>${record.id || 'N/A'}</td>
    <td>${record.nombre || record.name || 'Sin nombre'}</td>
    <td>${record.email || 'Sin email'}</td>
    <td>
      <span class="status-badge status-${record.estado || record.status || 'activo'}">
        ${record.estado || record.status || 'activo'}
      </span>
    </td>
    <td>
      <button class="btn-secondary btn-small" onclick="editRecord(${record.id})" title="Editar">
        ✏️
      </button>
      <button class="btn-danger btn-small" onclick="deleteRecord(${record.id})" title="Eliminar">
        🗑️
      </button>
    </td>
  `;

  return row;
}

// ========================================
// FUNCIONES DEL MODAL
// ========================================

/**
 * Abre el modal para crear nuevo registro
 */
function openModal(record = null) {
  isEditMode = !!record;
  currentEditingId = record ? record.id : null;

  modalTitle.textContent = isEditMode ? 'Editar Registro' : 'Agregar Registro';

  if (isEditMode && record) {
    // Llenar formulario con datos existentes
    document.getElementById('name').value = record.nombre || record.name || '';
    document.getElementById('email').value = record.email || '';
    document.getElementById('status').value = record.estado || record.status || 'activo';
  } else {
    // Limpiar formulario
    recordForm.reset();
  }

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Enfocar primer input
  setTimeout(() => {
    document.getElementById('name').focus();
  }, 100);
}

/**
 * Cierra el modal
 */
function closeModal() {
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
  isEditMode = false;
  currentEditingId = null;
  recordForm.reset();
}

// ========================================
// FUNCIONES CRUD
// ========================================

/**
 * Maneja el envío del formulario
 * @param {Event} e - Evento del formulario
 */
async function handleFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData(recordForm);
  const data = {
    nombre: formData.get('name'),
    email: formData.get('email'),
    estado: formData.get('status')
  };

  try {
    let response;

    if (isEditMode) {
      // Actualizar registro existente
      response = await fetch('/.netlify/functions/dashboard-crud', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: currentEditingId,
          data: data
        })
      });
    } else {
      // Crear nuevo registro
      response = await fetch('/.netlify/functions/dashboard-crud', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: data
        })
      });
    }

    const result = await response.json();

    if (response.ok && result.success) {
      showSuccess(isEditMode ? 'Registro actualizado correctamente' : 'Registro creado correctamente');
      closeModal();
      loadRecords(); // Recargar tabla
    } else {
      showError('Error: ' + (result.message || 'Error desconocido'));
    }
  } catch (error) {
    console.error('Error guardando registro:', error);
    showError('Error de conexión. Inténtalo nuevamente.');
  }
}

/**
 * Edita un registro existente
 * @param {number} id - ID del registro
 */
async function editRecord(id) {
  try {
    // Primero obtener el registro específico
    const response = await fetch('/.netlify/functions/dashboard-crud');
    const data = await response.json();

    if (response.ok && data.success) {
      const record = data.data.find(r => r.id === id);
      if (record) {
        openModal(record);
      } else {
        showError('Registro no encontrado');
      }
    } else {
      showError('Error obteniendo datos del registro');
    }
  } catch (error) {
    console.error('Error obteniendo registro:', error);
    showError('Error de conexión');
  }
}

/**
 * Elimina un registro
 * @param {number} id - ID del registro
 */
async function deleteRecord(id) {
  if (!confirm('¿Estás seguro de que quieres eliminar este registro?')) {
    return;
  }

  try {
    const response = await fetch('/.netlify/functions/dashboard-crud', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: id
      })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      showSuccess('Registro eliminado correctamente');
      loadRecords(); // Recargar tabla
    } else {
      showError('Error: ' + (result.message || 'Error desconocido'));
    }
  } catch (error) {
    console.error('Error eliminando registro:', error);
    showError('Error de conexión. Inténtalo nuevamente.');
  }
}

// ========================================
// FUNCIONES DE UTILIDAD
// ========================================

/**
 * Muestra indicador de carga
 */
function showLoading() {
  loadingIndicator.style.display = 'flex';
  tableBody.innerHTML = '';
}

/**
 * Oculta indicador de carga
 */
function hideLoading() {
  loadingIndicator.style.display = 'none';
}

/**
 * Muestra mensaje de éxito
 * @param {string} message - Mensaje a mostrar
 */
function showSuccess(message) {
  // Crear toast de éxito
  createToast(message, 'success');
}

/**
 * Muestra mensaje de error
 * @param {string} message - Mensaje a mostrar
 */
function showError(message) {
  createToast(message, 'error');
  console.error(message);
}

/**
 * Crea un toast notification
 * @param {string} message - Mensaje del toast
 * @param {string} type - Tipo de toast ('success' o 'error')
 */
function createToast(message, type) {
  // Remover toasts existentes
  const existingToasts = document.querySelectorAll('.toast');
  existingToasts.forEach(toast => toast.remove());

  // Crear nuevo toast
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${type === 'success' ? '✅' : '❌'}</span>
      <span class="toast-message">${message}</span>
    </div>
  `;

  // Agregar estilos inline para el toast
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? 'var(--dashboard-success)' : 'var(--dashboard-danger)'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    max-width: 400px;
    animation: slideIn 0.3s ease-out;
  `;

  document.body.appendChild(toast);

  // Auto-remover después de 5 segundos
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 5000);

  // Agregar estilos de animación si no existen
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

// ========================================
// FUNCIONES GLOBALES (para onclick en HTML)
// ========================================

// Hacer funciones disponibles globalmente para los botones en HTML
window.editRecord = editRecord;
window.deleteRecord = deleteRecord;