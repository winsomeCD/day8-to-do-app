/**
 * Day 8 To-Do Application Logic
 * Built with Modern JavaScript (ES6+), robust error handling, and localStorage persistence.
 */

/**
 * @typedef {Object} TodoItem
 * @property {string} id - Unique identifier (timestamp-based)
 * @property {string} text - The task description text
 * @property {boolean} completed - Task completion status
 * @property {number} createdAt - Unix timestamp when created
 */

// Application State
const STATE_STORAGE_KEY = 'vibe_coding_day8_todos';

/** @type {TodoItem[]} */
let todos = [];
/** @type {'all' | 'active' | 'completed'} */
let currentFilter = 'all';

// DOM Elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const taskCountElement = document.getElementById('task-count');
const filterButtons = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clear-completed');
const emptyState = document.getElementById('empty-state');
const currentDateElement = document.getElementById('current-date');

/**
 * Initialize the application on DOM ready
 */
document.addEventListener('DOMContentLoaded', () => {
    initDate();
    loadTodos();
    setupEventListeners();
    render();
});

/**
 * Displays formatted current date in the header
 */
function initDate() {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const today = new Date().toLocaleDateString('en-US', options);
    if (currentDateElement) {
        currentDateElement.textContent = today;
    }
}

/**
 * Load todos from localStorage safely with error boundary
 */
function loadTodos() {
    try {
        const rawData = localStorage.getItem(STATE_STORAGE_KEY);
        if (rawData) {
            const parsed = JSON.parse(rawData);
            if (Array.isArray(parsed)) {
                todos = parsed;
            }
        }
    } catch (error) {
        console.error('Error reading todos from localStorage:', error);
        todos = [];
    }
}

/**
 * Persist current todos to localStorage with error handling
 */
function saveTodos() {
    try {
        localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
        console.error('Error saving todos to localStorage:', error);
    }
}

/**
 * Set up all application event listeners
 */
function setupEventListeners() {
    // Form submission for adding new tasks
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = todoInput.value.trim();
        if (text) {
            addTodo(text);
            todoInput.value = '';
            todoInput.focus();
        }
    });

    // Event delegation on todo list for toggles and deletes
    todoList.addEventListener('click', (e) => {
        const target = /** @type {HTMLElement} */ (e.target);
        const itemElement = target.closest('.todo-item');
        if (!itemElement) return;

        const id = itemElement.dataset.id;

        // Check if delete button was clicked
        if (target.closest('.btn-delete')) {
            deleteTodo(id);
            return;
        }

        // Toggle task completion status
        if (target.closest('.item-left')) {
            toggleTodo(id);
        }
    });

    // Filter tabs switching
    filterButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            filterButtons.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter || 'all';
            render();
        });
    });

    // Clear completed tasks
    clearCompletedBtn.addEventListener('click', () => {
        clearCompleted();
    });
}

/**
 * Adds a new to-do item to state
 * @param {string} text - Task description
 */
function addTodo(text) {
    /** @type {TodoItem} */
    const newTodo = {
        id: `todo_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        text,
        completed: false,
        createdAt: Date.now()
    };

    // Prepend new item using immutable array spreading
    todos = [newTodo, ...todos];
    saveTodos();
    render();
}

/**
 * Toggles a to-do item completion status
 * @param {string} id - Unique identifier of the task
 */
function toggleTodo(id) {
    todos = todos.map((item) => 
        item.id === id ? { ...item, completed: !item.completed } : item
    );
    saveTodos();
    render();
}

/**
 * Deletes a to-do item from state
 * @param {string} id - Unique identifier of the task
 */
function deleteTodo(id) {
    todos = todos.filter((item) => item.id !== id);
    saveTodos();
    render();
}

/**
 * Clears all completed items from state
 */
function clearCompleted() {
    todos = todos.filter((item) => !item.completed);
    saveTodos();
    render();
}

/**
 * Filters the to-do list based on current active filter
 * @returns {TodoItem[]}
 */
function getFilteredTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter((t) => !t.completed);
        case 'completed':
            return todos.filter((t) => t.completed);
        default:
            return todos;
    }
}

/**
 * Main render function - updates DOM based on state
 */
function render() {
    const filteredTodos = getFilteredTodos();

    // Clear existing items
    todoList.innerHTML = '';

    // Render list items using template elements for safe DOM injection
    filteredTodos.forEach((todo) => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;

        // Item structure
        li.innerHTML = `
            <div class="item-left" title="Click to toggle status">
                <div class="custom-checkbox">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <span class="task-text"></span>
            </div>
            <button class="btn-delete" aria-label="Delete Task" title="Delete Task">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;

        // Prevent XSS vulnerabilities by assigning user text via textContent
        const taskTextSpan = li.querySelector('.task-text');
        if (taskTextSpan) {
            taskTextSpan.textContent = todo.text;
        }

        todoList.appendChild(li);
    });

    // Update empty state visibility
    if (filteredTodos.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
    }

    // Update remaining active task count
    const activeCount = todos.filter((t) => !t.completed).length;
    taskCountElement.textContent = `${activeCount} ${activeCount === 1 ? 'task' : 'tasks'} remaining`;
}
