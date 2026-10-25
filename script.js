// ==========================================
// CREACIÓN DE LA CLASE TASKMANAGER
// ==========================================
class TaskManager {
    constructor() {
        
        this.tasks = [];  // Array en memoria para almacenar las tareas
        
        this.currentId = 1; // Contador para generar un ID único
    }

    // Métodos  de la rúbrica
    getAllTasks() {
        return this.tasks;
    }

    getTasksWithStatus(status) {
        return this.tasks.filter(task => task.estado === status);
    }

    addTask(task) {
        // Asignamos el id único y lo incrementamos para la siguiente tarea
        task.id = this.currentId++;
        this.tasks.push(task);
        return task;
    }

    deleteTask(taskId) {
        // Filtramos el array para conservar todas las tareas excepto la eliminada
        this.tasks = this.tasks.filter(task => task.id !== taskId);
    }

    updateTask(taskId, newStatus) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) task.estado = newStatus;
    }

    assignTask(taskId, newAssignee) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) task.asignadoA = newAssignee;
    }
}


const taskManager = new TaskManager();

// ==========================================
// VALIDACIÓN DE FORMULARIO
// ==========================================
function validateTaskForm(nombre, descripcion, asignadoA, fechaDeEntrega, estado) {
    // Matriz de reglas dinámicas y flexibles
    if (nombre.trim().length <= 8) {
        alert("Error: El nombre de la tarea debe ser mayor a 8 caracteres.");
        return false;
    }
    if (descripcion.trim().length <= 15) {
        alert("Error: La descripción debe superar los 15 caracteres para ser clara.");
        return false;
    }
    if (asignadoA.trim().length <= 8) {
        alert("Error: El nombre del responsable debe ser mayor a 8 caracteres.");
        return false;
    }
    
    if (!fechaDeEntrega) {
        alert("Error: Es obligatorio seleccionar una fecha de entrega.");
        return false;
    }
    if (!estado) {
        alert("Error: Debes seleccionar un estado válido.");
        return false;
    }

    return true; 
}

// ==========================================
// CONEXIÓN AL DOM Y EVENTOS
// ==========================================
const formulario = document.getElementById('formulario-tarea');

formulario.addEventListener('submit', function(event) {
    // Prevenimos la recarga por defecto
    event.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const descripcion = document.getElementById('descripcion').value;
    const asignadoA = document.getElementById('asignado').value;
    const fechaDeEntrega = document.getElementById('fecha').value;
    const estado = document.getElementById('estado').value;
    const prioridad = document.getElementById('prioridad').value; 
    const categoria = document.getElementById('categoria').value; 

    if (validateTaskForm(nombre, descripcion, asignadoA, fechaDeEntrega, estado)) {
        
        const nuevaTarea = {
            nombre: nombre,
            descripcion: descripcion,
            asignadoA: asignadoA,
            fechaDeEntrega: fechaDeEntrega,
            estado: estado,
            prioridad: prioridad,
            categoria: categoria 
        };

        // Guardamos en memoria e inyectamos al DOM
        const tareaAgregada = taskManager.addTask(nuevaTarea);
        
        renderizarTarjeta(tareaAgregada);
        formulario.reset(); // Limpia los campos
    }
});

function renderizarTarjeta(task) {
    const tarjeta = document.createElement('article');
    tarjeta.id = `tarea-${task.id}`;
    
    // Clasificador de prioridad con colores
    let badgeColor = "#bdc3c7"; 
    if (task.prioridad === "alta") badgeColor = "#e74c3c"; 
    else if (task.prioridad === "media") badgeColor = "#f39c12"; 
    else if (task.prioridad === "baja") badgeColor = "#2ecc71"; 

    tarjeta.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <h3>${task.nombre}</h3>
            <span style="background-color: ${badgeColor}; color: white; font-size: 10px; padding: 3px 8px; border-radius: 12px; font-weight: bold; text-transform: uppercase;">
                ${task.prioridad}
            </span>
        </div>
        <p style="color: #3498db; font-weight: bold; font-size: 12px; margin-top: 4px;">📂 ${task.categoria}</p>
        <p><strong>Detalle:</strong> ${task.descripcion}</p>
        <p><strong>Cuidador:</strong> ${task.asignadoA}</p>
        <p><strong>Fecha límite:</strong> ${task.fechaDeEntrega}</p>
        <button class="btn-eliminar" data-id="${task.id}">Eliminar</button>
    `;

    const btnEliminar = tarjeta.querySelector('.btn-eliminar');
    
    // Para eliminar tarea
    btnEliminar.addEventListener('click', function() {
        taskManager.deleteTask(task.id);
        tarjeta.remove();
    });

    let columnaDestino;
    if (task.estado === "POR HACER") {
        columnaDestino = document.getElementById('col-planificacion'); // o el ID que asignaste a tu sección
    } else if (task.estado === "EN PROCESO") {
        columnaDestino = document.getElementById('col-proceso');
    } else if (task.estado === "REVISIÓN" || task.estado === "HECHO") {
        columnaDestino = document.getElementById('col-terminado');
    }

    if (columnaDestino) {
        columnaDestino.appendChild(tarjeta);
    }
}