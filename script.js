// Cada estado válido tiene una columna en el tablero.
const columnasPorEstado = new Map([
    ['POR HACER', 'col-planificacion'],
    ['EN PROCESO', 'col-proceso'],
    ['REVISIÓN', 'col-revision'],
    ['HECHO', 'col-terminado']
]);

const clavesStorage = {
    tareas: 'petTaskPlanner.tasks',
    currentId: 'petTaskPlanner.currentId'
};

// La creación y la reasignación aplican la misma regla al responsable.
function validarResponsable(asignadoA) {
    return typeof asignadoA === 'string' && asignadoA.trim().length > 8;
}

class TaskManager {
    constructor() {
        this.tasks = [];
        this.currentId = 1;
    }

    getAllTasks() {
        // La copia evita que la interfaz agregue o quite elementos del arreglo interno.
        return [...this.tasks];
    }

    getTasksWithStatus(status) {
        return this.tasks.filter(task => task.estado === status);
    }

    // Paso 4: Busca la tarea guardada por su ID numérico.
    getTaskById(taskId) {
        return this.tasks.find(task => task.id === taskId);
    }

    // T8 - P1 - se guardan las tareas y el siguiente ID en localStorage.
    save() {
        localStorage.setItem(clavesStorage.tareas, JSON.stringify(this.tasks));
        localStorage.setItem(clavesStorage.currentId, String(this.currentId));
    }

    // T8 - P3 - se recuperan las tareas y el siguiente ID desde localStorage.
    load() {
        const tareasGuardadas = localStorage.getItem(clavesStorage.tareas);
        const idGuardado = localStorage.getItem(clavesStorage.currentId);

        if (tareasGuardadas) {
            try {
                const tareasRecuperadas = JSON.parse(tareasGuardadas);
                if (Array.isArray(tareasRecuperadas)) this.tasks = tareasRecuperadas;
            } catch {
                this.tasks = [];
            }
        }

        const mayorId = this.tasks.reduce((mayor, task) => Math.max(mayor, Number(task.id) || 0), 0);
        const siguienteIdGuardado = Number(idGuardado);
        this.currentId = Number.isInteger(siguienteIdGuardado) && siguienteIdGuardado > mayorId
            ? siguienteIdGuardado
            : mayorId + 1;
    }

    addTask(task) {
        // Un estado desconocido no puede quedar guardado sin una columna.
        if (!columnasPorEstado.has(task.estado)) {
            throw new RangeError('El estado de la tarea no es válido.');
        }
        task.id = this.currentId++;
        this.tasks.push(task);
        // T8 - P2 - se guarda cada cambio realizado en las tareas.
        this.save();
        return task;
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.save();
    }

    updateTask(taskId, status) {
        // El cambio de estado admite los mismos valores que el alta.
        const task = this.getTaskById(taskId);
        if (!task || !columnasPorEstado.has(status)) return false;

        task.estado = status;
        this.save();
        return true;
    }

    assignTask(taskId, assignee) {
        // Solo se guarda un responsable que cumpla la validación del formulario.
        const task = this.getTaskById(taskId);
        if (!task || !validarResponsable(assignee)) return false;

        task.asignadoA = assignee.trim();
        this.save();
        return true;
    }
}

// El formulario y las tarjetas usan el mismo mensaje para el responsable.
const errorResponsable = 'El nombre del responsable debe ser mayor a 8 caracteres.';

function validateTaskForm(nombre, descripcion, asignadoA, fechaDeEntrega, estado) {
    if (nombre.trim().length <= 8) {
        alert('El nombre de la tarea debe ser mayor a 8 caracteres.');
        return false;
    }
    if (descripcion.trim().length <= 15) {
        alert('La descripción debe superar los 15 caracteres.');
        return false;
    }
    if (!validarResponsable(asignadoA)) {
        alert(errorResponsable);
        return false;
    }
    if (!fechaDeEntrega) {
        alert('Es obligatorio seleccionar una fecha de entrega.');
        return false;
    }
    // Un estado seleccionado también debe existir en el tablero.
    if (!columnasPorEstado.has(estado)) {
        alert('Selecciona un estado válido.');
        return false;
    }
    return true;
}

const taskManager = new TaskManager();
// T8 - P4 - se cargan las tareas antes de dibujar el tablero.
taskManager.load();
const formulario = document.getElementById('formulario-tarea');
const resumenTareas = document.getElementById('resumen-tareas');
const tablero = document.querySelector('.tablero-trello');

// Las tarjetas muestran las mismas etiquetas que los selectores del formulario.
const etiquetasEstado = new Map(
    Array.from(formulario.elements.estado.options, opcion => [opcion.value, opcion.text])
);
const etiquetasCategoria = new Map(
    Array.from(formulario.elements.categoria.options, opcion => [opcion.value, opcion.text])
);
const coloresPrioridad = new Map([
    ['alta', '#e74c3c'],
    ['media', '#f39c12'],
    ['baja', '#2ecc71']
]);

formulario.addEventListener('submit', event => {
    event.preventDefault();

    const datos = new FormData(formulario);
    // La fecha se conserva como YYYY-MM-DD para mantener el día elegido.
    const tarea = {
        nombre: datos.get('nombre').trim(),
        descripcion: datos.get('descripcion').trim(),
        asignadoA: datos.get('asignado').trim(),
        fechaDeEntrega: datos.get('fecha'),
        estado: datos.get('estado'),
        prioridad: datos.get('prioridad'),
        categoria: datos.get('categoria')
    };

    if (!validateTaskForm(tarea.nombre, tarea.descripcion, tarea.asignadoA, tarea.fechaDeEntrega, tarea.estado)) {
        return;
    }

    taskManager.addTask(tarea);
    renderizarTablero();
    formulario.reset();
});

function crearDetalle(etiqueta, valor) {
    const parrafo = document.createElement('p');
    const titulo = document.createElement('strong');
    // Los valores se muestran como texto, incluso si contienen etiquetas HTML.
    titulo.textContent = etiqueta;
    parrafo.append(titulo, ' ' + valor);
    return parrafo;
}

function crearTarjeta(task) {
    const tarjeta = document.createElement('article');
    // Paso 3: Guarda el ID de la tarea en su tarjeta.
    tarjeta.dataset.taskId = String(task.id);
    const nombre = document.createElement('h3');
    nombre.textContent = task.nombre;

    const prioridad = document.createElement('span');
    prioridad.className = 'prioridad-tarea';
    prioridad.style.backgroundColor = coloresPrioridad.get(task.prioridad) ?? '#bdc3c7';
    prioridad.textContent = task.prioridad;

    const campoEstado = document.createElement('label');
    const selectorEstado = document.createElement('select');
    for (const estado of columnasPorEstado.keys()) {
        selectorEstado.add(new Option(etiquetasEstado.get(estado), estado));
    }
    selectorEstado.value = task.estado;
    campoEstado.append('Estado: ', selectorEstado);
    // Cambiar el estado vuelve a mostrar la tarea en la columna que corresponda.
    selectorEstado.addEventListener('change', () => {
        if (taskManager.updateTask(task.id, selectorEstado.value)) {
            renderizarTablero(task.id)?.querySelector('select')?.focus();
        }
    });

    const campoResponsable = document.createElement('label');
    const responsable = document.createElement('input');
    responsable.type = 'text';
    responsable.value = task.asignadoA;
    campoResponsable.append('Cuidador: ', responsable);

    const guardarResponsable = document.createElement('button');
    guardarResponsable.type = 'button';
    guardarResponsable.className = 'btn-guardar-responsable';
    guardarResponsable.textContent = 'Guardar responsable';

    const eliminar = document.createElement('button');
    eliminar.type = 'button';
    eliminar.className = 'btn-eliminar';
    eliminar.textContent = 'Eliminar';

    tarjeta.append(
        nombre,
        prioridad,
        crearDetalle('Categoría:', etiquetasCategoria.get(task.categoria)),
        crearDetalle('Detalle:', task.descripcion),
        crearDetalle('Fecha límite:', task.fechaDeEntrega),
        campoEstado,
        campoResponsable,
        guardarResponsable
    );
    // Paso 1: Agrega el botón para completar las tareas pendientes.
    if (task.estado !== 'HECHO') {
        const completar = document.createElement('button');
        completar.type = 'button';
        completar.className = 'btn-completar';
        completar.textContent = 'Marcar como hecha';
        tarjeta.append(completar);
    }
    tarjeta.append(eliminar);
    // La función entrega la tarjeta y el tablero decide dónde insertarla.
    return tarjeta;
}

function renderizarTablero(idSeleccionado) {
    // El total y las columnas se calculan a partir de las tareas guardadas.
    const total = taskManager.getAllTasks().length;
    resumenTareas.textContent = total === 0 ? 'No hay tareas registradas.' : 'Total de tareas: ' + total;

    let tarjetaSeleccionada;
    for (const [estado, idColumna] of columnasPorEstado) {
        const columna = document.getElementById(idColumna);
        const tarjetas = taskManager.getTasksWithStatus(estado).map(task => {
            const tarjeta = crearTarjeta(task);
            if (task.id === idSeleccionado) tarjetaSeleccionada = tarjeta;
            return tarjeta;
        });
        columna.replaceChildren(columna.firstElementChild, ...tarjetas);
    }
    return tarjetaSeleccionada;
}

// Paso 2: Un solo manejador escucha los clics en las tarjetas.
tablero.addEventListener('click', event => {
    const boton = event.target.closest('button');
    const tarjeta = boton?.closest('[data-task-id]');
    if (!tarjeta) return;

    const taskId = Number(tarjeta.dataset.taskId);
    if (boton.classList.contains('btn-completar')) {
        // Paso 5: Marca la tarea como HECHO y vuelve a dibujar el tablero.
        if (taskManager.updateTask(taskId, 'HECHO')) {
            renderizarTablero(taskId)?.querySelector('select')?.focus();
        }
    } else if (boton.classList.contains('btn-guardar-responsable')) {
        const responsable = tarjeta.querySelector('input');
        if (taskManager.assignTask(taskId, responsable.value)) {
            responsable.value = taskManager.getTaskById(taskId).asignadoA;
        } else {
            alert(errorResponsable);
        }
        responsable.focus();
    } else if (boton.classList.contains('btn-eliminar')) {
        taskManager.deleteTask(taskId);
        renderizarTablero();
    }
});

renderizarTablero();
