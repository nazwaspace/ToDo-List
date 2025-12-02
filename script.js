const todoInput = document.getElementById('todo-input');
const todoDate = document.getElementById('todo-date');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const sortSelect = document.getElementById('sort-select');
const emptyMsg = document.getElementById('empty-msg');
const searchInput = document.getElementById('search-input');

let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';
let editId = null;

document.addEventListener('DOMContentLoaded', () => {
    todoDate.valueAsDate = new Date(); 
    renderTodos();
});
addBtn.addEventListener('click', addTodo);
sortSelect.addEventListener('change', renderTodos);
searchInput.addEventListener('input', renderTodos);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.filter-btn.active').classList.remove('active');
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        renderTodos();
    });
});

function addTodo() {
    const taskText = todoInput.value.trim();
    const taskDate = todoDate.value;

    if (taskText === '') return alert("Tulis tugas dulu dong!");
    if (taskDate === '') return alert("Pilih tanggal deadline ya!");

    if (editId) {
        todos = todos.map(todo => {
            if (todo.id === editId) {
                return { ...todo, text: taskText, date: taskDate }; 
            }
            return todo;
        });
        editId = null;
        addBtn.innerHTML = '<span class="icon">+</span>';
        addBtn.style.backgroundColor = '';
    } else {
        const newTodo = {
            id: Date.now(),
            text: taskText,
            date: taskDate,
            completed: false
        };
        todos.push(newTodo);
    }

    saveToLocalStorage();
    renderTodos();
    todoInput.value = '';
    todoDate.valueAsDate = new Date();
}

function renderTodos() {
    todoList.innerHTML = '';
    const searchText = searchInput.value.toLowerCase();
    
    let resultTodos = todos.filter(todo => {
        if (currentFilter === 'completed') return todo.completed;
        if (currentFilter === 'active') return !todo.completed;
        return true;
    });

    resultTodos = resultTodos.filter(todo => {
        return todo.text.toLowerCase().includes(searchText);
    });

    const sortType = sortSelect.value;
    resultTodos.sort((a, b) => {
        if (sortType === 'newest') return b.id - a.id;
        if (sortType === 'oldest') return a.id - b.id;
        if (sortType === 'closest') return new Date(a.date) - new Date(b.date);
    });

    if (resultTodos.length === 0) {
        if (searchText) {
            emptyMsg.textContent = `Tidak ada tugas yang cocok dengan "${searchText}"`;
        } else {
            emptyMsg.textContent = "Tidak ada tugas dalam daftar ini.";
        }
        emptyMsg.classList.remove('hidden');
    } else {
        emptyMsg.classList.add('hidden');
    }

    const today = new Date().toISOString().split('T')[0];

    resultTodos.forEach(todo => {
        const li = document.createElement('li');
        li.classList.add('todo-item');
        if (todo.completed) li.classList.add('completed');

        let dateBadge = '';
        if (todo.date) {
             const dateObj = new Date(todo.date);
             if (!isNaN(dateObj)) {
                let formattedDate = formatDate(todo.date);
                dateBadge = `<span class="date-badge">📅 ${formattedDate}</span>`;
                if (todo.date === today && !todo.completed) {
                    dateBadge = `<span class="date-badge urgent">🔥 HARI INI!</span>`;
                } else if (todo.date < today && !todo.completed) {
                    dateBadge = `<span class="date-badge overdue">⚠️ Terlewat</span>`;
                }
             }
        }

        li.innerHTML = `
            <div class="check-btn" onclick="toggleTask(${todo.id})">
                ${todo.completed ? '✔' : ''}
            </div>
            <div class="todo-content" onclick="toggleTask(${todo.id})">
                <span class="todo-text">${todo.text}</span>
                ${dateBadge}
            </div>
            <div class="action-btn">
                <button class="edit-btn" onclick="editTask(${todo.id})">✏️</button>
                <button class="delete-btn" onclick="deleteTask(${todo.id})">🗑️</button>
            </div>
        `;
        todoList.appendChild(li);
    });
}

function formatDate(dateString) {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

window.editTask = function(id) {
    const todoToEdit = todos.find(todo => todo.id === id);
    if (todoToEdit) {
        todoInput.value = todoToEdit.text;
        todoDate.value = todoToEdit.date;
        editId = id;
        addBtn.innerHTML = '<span class="icon">💾</span>';
        addBtn.style.backgroundColor = '#00b894';
        todoInput.focus();
    }
}

window.toggleTask = function(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    saveToLocalStorage();
    renderTodos();
}

window.deleteTask = function(id) {
    if(confirm("Yakin mau hapus tugas ini?")) {
        todos = todos.filter(todo => todo.id !== id);
        saveToLocalStorage();
        renderTodos();
    }
}

function saveToLocalStorage() {
    localStorage.setItem('todos', JSON.stringify(todos));
}
