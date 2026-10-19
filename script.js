// ==========================================
// TAREA 2: CREACIÓN DE LA CLASE TASKMANAGER
// ==========================================
class TaskManager {
    constructor() {
        this.tasks = []; // Array en memoria para almacenar las tareas
        this.currentId = 1; // Contador para generar un ID único
    }

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

    updateTask(taskId, status) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) task.estado = status;
    }

    assignTask(taskId, assignee) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) task.asignadoA = assignee;
    }
}

// Instanciamos nuestro gestor de tareas
const taskManager = new TaskManager();

// ==========================================
// TAREA 1: VALIDACIÓN DEL FORMULARIO
// ==========================================
function validateTaskForm(nombre, descripcion, asignadoA, fechaDeEntrega, estado) {
    if (nombre.trim().length <= 8) {
        alert("Error: El nombre de la tarea debe tener más de 8 caracteres.");
        return false;
    }
    if (descripcion.trim().length <= 10) {
        alert("Error: La descripción debe tener más de 10 caracteres.");
        return false;
    }
    if (asignadoA.trim().length <= 5) {
        alert("Error: El campo 'Asignado a' debe tener más de 5 caracteres.");
        return false;
    }
    if (fechaDeEntrega.trim() === "") {
        alert("Error: La fecha de entrega no puede estar en blanco.");
        return false;
    }
    if (estado.trim() === "") {
        alert("Error: Debe seleccionar un estado.");
        return false;
    }
    
    // Si todo está correcto, retorna true
    return true; 
}

// ==========================================
// TAREA 3 Y 4: CONEXIÓN AL DOM Y EVENTOS
// ==========================================
const formulario = document.getElementById('formulario-tarea');
const contenedorTareas = document.getElementById('contenedor-tareas');

formulario.addEventListener('submit', function(event) {
    // Evitamos que la página se recargue al enviar
    event.preventDefault();

    // Capturamos los valores
    const nombre = document.getElementById('nombre').value;
    const descripcion = document.getElementById('descripcion').value;
    const asignadoA = document.getElementById('asignado').value;
    const fechaDeEntrega = document.getElementById('fecha').value;
    const estado = document.getElementById('estado').value;

    // Validamos la entrada antes de agregar
    if (validateTaskForm(nombre, descripcion, asignadoA, fechaDeEntrega, estado)) {
        
        // Creamos la estructura del objeto (Aún no tiene id, se lo da TaskManager)
        const nuevaTarea = {
            nombre: nombre,
            descripcion: descripcion,
            asignadoA: asignadoA,
            fechaDeEntrega: fechaDeEntrega,
            estado: estado
        };

        // Agregamos al array interno
        const tareaAgregada = taskManager.addTask(nuevaTarea);
        
        // Renderizamos visualmente la tarjeta
        renderizarTarjeta(tareaAgregada);

        // Limpiamos los campos del formulario
        formulario.reset();
    }
});

function renderizarTarjeta(task) {
    // Creamos el elemento visual (Tarjeta)
    const tarjeta = document.createElement('article');
    tarjeta.id = `tarea-${task.id}`;
    
    // Agregamos algo de borde mediante atributos básicos para simular la tarjeta, aunque estemos sin CSS
    tarjeta.style.border = "1px solid black";
    tarjeta.style.padding = "10px";
    tarjeta.style.margin = "10px 0";

    tarjeta.innerHTML = `
        <h3>${task.nombre} (ID: ${task.id})</h3>
        <p><strong>Descripción:</strong> ${task.descripcion}</p>
        <p><strong>Responsable:</strong> ${task.asignadoA}</p>
        <p><strong>Fecha de entrega:</strong> ${task.fechaDeEntrega}</p>
        <p><strong>Estado:</strong> ${task.estado}</p>
        <button class="btn-eliminar" data-id="${task.id}">Eliminar</button>
    `;

    // Seleccionamos el botón de eliminar de ESTA tarjeta específica
    const btnEliminar = tarjeta.querySelector('.btn-eliminar');
    
    // Event listener para borrar la tarea (Tarea 4)
    btnEliminar.addEventListener('click', function() {
        // Borrar del Array (Lógica)
        taskManager.deleteTask(task.id);
        
        // Borrar del DOM (Visual)
        tarjeta.remove();
    });

    // Inyectamos la tarjeta en el contenedor principal
    contenedorTareas.appendChild(tarjeta);
}