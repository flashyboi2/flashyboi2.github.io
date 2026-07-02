// Data Management part if you're tryinf to understand the code.
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let events = JSON.parse(localStorage.getItem('events')) || [];
let currentDate = new Date();
let selectedDate = null;


document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
    renderTodos();
    renderEvents();
    attachEventListeners();
});


function attachEventListeners() {
    
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

   
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            switchTab(tabName);
        });
    });

    
    document.getElementById('todoInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });
    document.getElementById('addTodoBtn').addEventListener('click', addTodo);

    
    document.getElementById('eventTitle').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addEvent();
    });
    document.getElementById('addEventBtn').addEventListener('click', addEvent);
}


function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}


function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();

    if (text === '') {
        alert('Please enter a task');
        return;
    }

    const todo = {
        id: Date.now(),
        text: text,
        completed: false,
        date: new Date().toISOString().split('T')[0]
    };

    todos.push(todo);
    saveTodos();
    renderTodos();
    input.value = '';
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodos() {
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = '';

    if (todos.length === 0) {
        todoList.innerHTML = '<li style="padding: 20px; text-align: center; color: #999;">No tasks yet. Add one to get started!</li>';
        return;
    }

    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <div style="display: flex; gap: 8px;">
                <button class="btn-toggle" onclick="toggleTodo(${todo.id})">
                    ${todo.completed ? '↩️ Undo' : '✓ Done'}
                </button>
                <button class="btn-delete" onclick="deleteTodo(${todo.id})">Delete</button>
            </div>
        `;
        todoList.appendChild(li);
    });
}


function addEvent() {
    const title = document.getElementById('eventTitle').value.trim();
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;

    if (!title || !date) {
        alert('Please fill in title and date');
        return;
    }

    const event = {
        id: Date.now(),
        title: title,
        date: date,
        time: time || '00:00'
    };

    events.push(event);
    saveEvents();
    renderEvents();
    renderCalendar();

    document.getElementById('eventTitle').value = '';
    document.getElementById('eventDate').value = '';
    document.getElementById('eventTime').value = '';
}

function deleteEvent(id) {
    events = events.filter(event => event.id !== id);
    saveEvents();
    renderEvents();
    renderCalendar();
    if (selectedDate) {
        renderDateInfo();
    }
}

function saveEvents() {
    localStorage.setItem('events', JSON.stringify(events));
}

function renderEvents() {
    const eventList = document.getElementById('eventList');
    eventList.innerHTML = '';

    const sortedEvents = [...events].sort((a, b) => {
        return new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time);
    });

    if (sortedEvents.length === 0) {
        eventList.innerHTML = '<li style="padding: 20px; text-align: center; color: #999;">No events scheduled yet.</li>';
        return;
    }

    sortedEvents.forEach(event => {
        const li = document.createElement('li');
        li.className = 'event-item';
        const eventDate = new Date(event.date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        li.innerHTML = `
            <div class="event-info">
                <div class="event-title">${escapeHtml(event.title)}</div>
                <div class="event-datetime">📅 ${eventDate} ⏰ ${event.time}</div>
            </div>
            <button class="btn-delete" onclick="deleteEvent(${event.id})">Delete</button>
        `;
        eventList.appendChild(li);
    });
}


function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;

  
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const calendarDates = document.getElementById('calendarDates');
    calendarDates.innerHTML = '';

    
    for (let i = firstDay - 1; i >= 0; i--) {
        const date = document.createElement('div');
        date.className = 'date other-month';
        date.textContent = daysInPrevMonth - i;
        calendarDates.appendChild(date);
    }

    
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const date = document.createElement('div');
        date.className = 'date';
        date.textContent = day;

        const currentDateObj = new Date(year, month, day);
        const dateStr = currentDateObj.toISOString().split('T')[0];

        
        if (currentDateObj.toDateString() === today.toDateString()) {
            date.classList.add('today');
        }

        
        if (events.some(event => event.date === dateStr)) {
            date.classList.add('has-event');
        }

       
        if (selectedDate === dateStr) {
            date.classList.add('selected');
        }

        
        date.addEventListener('click', () => {
            document.querySelectorAll('.date').forEach(d => d.classList.remove('selected'));
            date.classList.add('selected');
            selectedDate = dateStr;
            renderDateInfo();
        });

        calendarDates.appendChild(date);
    }

    
    const remainingDays = 42 - (firstDay + daysInMonth);
    for (let day = 1; day <= remainingDays; day++) {
        const date = document.createElement('div');
        date.className = 'date other-month';
        date.textContent = day;
        calendarDates.appendChild(date);
    }
}

function renderDateInfo() {
    if (!selectedDate) {
        document.getElementById('selectedDate').textContent = 'None';
        document.getElementById('dateEventsList').innerHTML = '';
        return;
    }

    const dateObj = new Date(selectedDate + 'T00:00:00');
    const dateDisplay = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    document.getElementById('selectedDate').textContent = dateDisplay;

    const dateEvents = events.filter(event => event.date === selectedDate);
    const dateEventsList = document.getElementById('dateEventsList');
    dateEventsList.innerHTML = '';

    if (dateEvents.length === 0) {
        dateEventsList.innerHTML = '<li style="padding: 10px; color: #999;">No events scheduled for this date.</li>';
        return;
    }

    dateEvents.forEach(event => {
        const li = document.createElement('li');
        li.className = 'date-event-item';
        li.innerHTML = `
            <div class="date-event-title">${escapeHtml(event.title)}</div>
            <div class="date-event-time">⏰ ${event.time}</div>
        `;
        dateEventsList.appendChild(li);
    });
}


function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
