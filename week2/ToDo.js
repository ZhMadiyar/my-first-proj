



// Тут я все объявляю 

const main = document.getElementById('main');
const addBtn = document.getElementById('button');
const delAll = document.getElementById('delAll')
const checkAll = document.getElementById('checkAll')
const fltrBtn = document.querySelectorAll('.filter-btn')

let tasks = []

function renderTasks(filter = 'all'){
    main.innerHTML = '' // очищаю страницу
    // запускаю цикл для каждой таски 
    tasks.forEach(task => {
        //фильтры для заданий 
        if (filter === 'done' && !task.completed) return; // если юзер нажимает на кнопку done и задание не сделано то прячет эту задачу   
        if (filter === 'inProgress' && task.completed) return;  // если юзер нажимает на кнопку in progress и задание сделано то прячет эту задачу  

        const taskNode = document.createElement('div')
        taskNode.classList.add('todo_place')
        if (task.completed) taskNode.classList.add('completed')
            
        taskNode.innerHTML = `
        <div class="todo_info">
            <input type="text" class="task" value="${task.text}" placeholder="Task" readonly>
            <input type="text" class="disc" value="${task.desc}" placeholder="Description" readonly>
        </div>
        <div class="todo_events">
            <input type="checkbox" class="checkbox" ${task.completed ? 'checked' : ''}>
            <button class="delete-btn" data-id="${task.id}">
                <i class="fa-solid fa-trash"></i> 
            </button>           
        </div>
        `
        // добавляет созданную карту в мейн 
        main.appendChild(taskNode)
    })
    updateCount()
}


function addTask(text = "", desc = ""){
    saveToHistory()
    const newTask = {
        id: Date.now(),
        text: text,
        desc: desc,
        completed: false,
        createdAt: new Date()

    }
    tasks.unshift(newTask)
    saveToStorage()
    renderTasks()
}

function deleteTask(id){
    saveToHistory()
    tasks = tasks.filter(task => task.id !== id)
    saveToStorage()
    renderTasks()
}

function editTask(id, text, desc) {
    saveToHistory();
    tasks = tasks.map(task => {
        if (task.id === id) {
            return {
                ...task,
                text: text,
                desc: desc
            };
        }
        return task;
    });
    saveToStorage();
    renderTasks();
}

function markTask(id){
    saveToHistory()
    tasks = tasks.filter(task => task.id !== id)
    saveToStorage()
    renderTasks()
}

function toggleTask(id){
    saveToHistory()
    tasks = tasks.map(t => t.id === id ? {...t, completed: !t.completed}: t)
    saveToStorage()
    renderTasks();
}


// здесб у меня ивент на клик мышки 

//добавление карточки с заданиями 
addBtn.addEventListener('click', function(event){
    addTask("", "")
})

// манипуляция с заданиями 
main.addEventListener('click', (event) => {
    // 1. Ищем, кликнули ли по кнопке удаления
    const delBtn = event.target.closest('.delete-btn');
    if (delBtn) {
        const id = Number(delBtn.dataset.id); // Достаем ID из data-id="${task.id}"
        deleteTask(id);
        return; // Выходим, чтобы не сработал код ниже
    }

    // 2. Ищем, кликнули ли по чекбоксу
    if (event.target.type === 'checkbox') {
        // Нам нужно найти родителя, чтобы понять, какой ID у этой задачи
        const id = Number(event.target.closest('.todo_place').querySelector('.delete-btn').dataset.id);
        toggleTask(id);
    }
});

// Для редактирования задачи 
main.addEventListener('dblclick', (event) => {
    if (event.target.classList.contains('task') || event.target.classList.contains('disc')){
        const input = event.target
        // включаю функцию редаактирования 
        input.readOnly = false
        // присваиваю класс 
        input.classList.add('editing')
        // если нажал в другое место то 
        input.addEventListener('blur', () => {
            //выключаю редактор 
            input.readOnly = true 
            input.classList.remove('editing')// удаляю приписку к классу  
            

            const id = Number(input.closest('.todo_place').querySelector('.delete-btn').dataset.id);
            const taskTitle = input.closest('.todo_place').querySelector('.task').value;
            const taskDesc = input.closest('.todo_place').querySelector('.disc').value;
           
            editTask(id, taskTitle, taskDesc)
        }, {once:true} )
    }
})



// логика для фильтрации 
fltrBtn.forEach(btn => {
    btn.addEventListener('click', () =>{
        const fltValue = btn.getAttribute('data-filter') // проверяет какую кнопку я нажал 
        renderTasks(fltValue)        
    })
})



// удаление всех выполненных задач
delAll.addEventListener('click', (event) => {
    saveToHistory()
    tasks = tasks.filter(task => !task.completed)
    saveToStorage()
    renderTasks()

})


checkAll.addEventListener('click', (event) => {
// 1. Проверяем, есть ли хотя бы одна невыполненная задача
    const hasActiveTasks = tasks.some(task => !task.completed);

    // 2. Сохраняем историю перед массовым изменением
    saveToHistory();

    // 3. Если есть активные — завершаем все. Если нет — сбрасываем все в false.
    tasks = tasks.map(task => ({...task,completed: hasActiveTasks}));

    // 4. Сохраняем и перерисовываем
    saveToStorage();
    renderTasks();

})


// логика для счетчика неввыполненных заданий 
function updateCount() {
    const activeTasks = tasks.filter(t => !t.completed);
    const countElem = document.getElementById('task_count');
    if (countElem) {
        countElem.innerText = activeTasks.length;
    }
}


// сохранение
function saveToStorage() {
    localStorage.setItem('myTasks', JSON.stringify(tasks));
}

// загрузка
function loadFromStorage() {
    const rawData = localStorage.getItem('myTasks');
    if (rawData) {
        tasks = JSON.parse(rawData);
    } else {
        tasks = []; // Если пусто вывожу пустой массив
    }
    renderTasks();
}


let history = []; // лист для состояний

function saveToHistory() {
    // делаю копию текущего массива задач
    const stateCopy = JSON.stringify(tasks);
    
    // добавляю в историю
    history.push(stateCopy);
    
    // если в истории больше 5 шагов, удаляем самый старый 
    if (history.length > 5) {
        history.shift();
    }
}

function undo() {
    if (history.length > 0) {
        // достаю последнее состояние из стека
        const previousState = history.pop();
        tasks = JSON.parse(previousState);
        
        renderTasks();
        saveToStorage(); // сохраняю "откатанное" состояние
    } else {
        // alert("История пуста");
    }
}

document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && (event.key === 'z' || event.key === 'я')) {
        event.preventDefault(); // чтобы браузер не делал свои действия
    
        undo();
    }
});




loadFromStorage();