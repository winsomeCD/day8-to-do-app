/**
 * ============================================================================
 * Task Matrix — Full Application Logic
 * Modern ES6+, Web Audio API Synthesizer, Canvas Confetti & LocalStorage
 * ============================================================================
 */

// Storage Keys
const STORAGE_KEY = 'vibe_tasks_matrix_v2';
const ARCHIVE_STORAGE_KEY = 'vibe_tasks_matrix_archive_v2';
const THEME_STORAGE_KEY = 'task_matrix_theme_mode_v2';
const NOTIF_TOGGLE_KEY = 'vibe_tasks_matrix_notifications_enabled';

// Application State
let tasks = [];
let archivedTasks = [];
let currentFilter = 'all'; // 'all' | 'active' | 'completed' | 'archived'
let searchQuery = '';
let selectedCalendarDate = null; // 'YYYY-MM-DD' or null
let currentCalendarDate = new Date();
let notificationsEnabled = true;
let isDarkMode = true;

// People / Assignees
const PEOPLE = ['Dad', 'Mom', 'Alex', 'Chicky', 'Kimi'];

// DOM Element References
let taskForm, taskTitleInput, taskDateInput, taskStartTimeSelect, taskDurationSelect, taskReminderInput, taskPersonSelect;
let taskReminderHour, taskReminderMin;
let taskList, tasksEmptyState, taskCountText, filterBtns, activeDateChip, activeDateLabel, btnClearDateFilter, btnArchiveCompleted;
let taskSearchInput, btnClearSearch;
let calMonthTitle, calMonthSelect, calYearSelect, calendarDaysGrid, calPrevBtn, calNextBtn, calTodayBtn;
let summaryDateHeading, statTotalTasks, statPendingTasks, statOverdueTasks, statDoneTasks, btnShowAllDates;
let introProgressFill, introProgressPct;
let themeToggleBtn, themeBtnIcon, themeBtnText, enableNotifBtn, notifBtnIcon, notifBtnText;
let reminderModalOverlay, modalTaskTitle, modalTaskMeta, btnModalDismiss;
let confettiCanvas, confettiCtx;
const GCAL_CLIENT_ID_KEY = 'vibe_gcal_oauth_client_id';
let gcalAccessToken = null;
let gcalTokenClient = null;
let gcalIsSyncing = false;
let headerGcalSyncBtn, headerGcalSyncText;
let footerDirectSyncBtn, footerDirectSyncText;
let btnModalDirectPush, btnModalPushText;
let gcalClientIdInput, btnSaveGcalClientId, gcalAuthStatusBadge, gcalFileProtocolWarning;
let gcalLiveSyncDot, gcalLiveSyncStatus;
let openGcalModalBtn, closeGcalModalBtn, gcalModalOverlay, btnDownloadIcs, footerGcalBtn;
let gcalCountActive, gcalCountMonth, gcalCountAll;
let toastNotification, toastMessage, taskOpenGcalCheckbox;

/**
 * Initialize on DOM Ready
 */
document.addEventListener('DOMContentLoaded', () => {
    cacheDOMElements();
    initTheme();
    initDateDefaults();
    initConfetti();
    loadTasks();
    setupEventListeners();
    loadNotificationToggleState();
    checkNotificationPermissionStatus();
    updateGCalAuthBadge();
    initGoogleIdentityTokenClient();

    // Default select today in calendar
    const todayStr = getLocalDateString(new Date());
    selectedCalendarDate = todayStr;

    renderCalendar();
    renderTasks();

    // Periodic reminder check
    setInterval(checkReminders, 5000);
});

/**
 * Cache all DOM references safely
 */
function cacheDOMElements() {
    taskForm = document.getElementById('task-form');
    taskTitleInput = document.getElementById('task-title-input');
    taskDateInput = document.getElementById('task-date-input');
    taskStartTimeSelect = document.getElementById('task-starttime-select');
    taskDurationSelect = document.getElementById('task-duration-select');
    taskReminderInput = document.getElementById('task-reminder-input');
    taskReminderHour = document.getElementById('task-reminder-hour');
    taskReminderMin = document.getElementById('task-reminder-min');
    taskPersonSelect = document.getElementById('task-person-select');

    taskList = document.getElementById('task-list');
    tasksEmptyState = document.getElementById('tasks-empty-state');
    taskCountText = document.getElementById('task-count-text');
    filterBtns = document.querySelectorAll('.filter-btn');
    activeDateChip = document.getElementById('active-date-chip');
    activeDateLabel = document.getElementById('active-date-label');
    btnClearDateFilter = document.getElementById('btn-clear-date-filter');
    btnArchiveCompleted = document.getElementById('btn-archive-completed');
    taskSearchInput = document.getElementById('task-search-input');
    btnClearSearch = document.getElementById('btn-clear-search');

    calMonthTitle = document.getElementById('cal-month-title');
    calMonthSelect = document.getElementById('cal-month-select');
    calYearSelect = document.getElementById('cal-year-select');
    calendarDaysGrid = document.getElementById('calendar-days-grid');
    calPrevBtn = document.getElementById('cal-prev-btn');
    calNextBtn = document.getElementById('cal-next-btn');
    calTodayBtn = document.getElementById('cal-today-btn');

    summaryDateHeading = document.getElementById('summary-date-heading');
    statTotalTasks = document.getElementById('stat-total-tasks');
    statPendingTasks = document.getElementById('stat-pending-tasks');
    statOverdueTasks = document.getElementById('stat-overdue-tasks');
    statDoneTasks = document.getElementById('stat-done-tasks');
    btnShowAllDates = document.getElementById('btn-show-all-dates');

    introProgressFill = document.getElementById('intro-progress-fill');
    introProgressPct = document.getElementById('intro-progress-pct');

    themeToggleBtn = document.getElementById('theme-toggle-btn');
    themeBtnIcon = document.getElementById('theme-btn-icon');
    themeBtnText = document.getElementById('theme-btn-text');
    enableNotifBtn = document.getElementById('enable-notifications-btn');
    notifBtnIcon = document.getElementById('notif-btn-icon');
    notifBtnText = document.getElementById('notif-btn-text');

    reminderModalOverlay = document.getElementById('reminder-modal-overlay');
    modalTaskTitle = document.getElementById('modal-task-title');
    modalTaskMeta = document.getElementById('modal-task-meta');
    btnModalDismiss = document.getElementById('btn-modal-dismiss');

    confettiCanvas = document.getElementById('confetti-canvas');

    openGcalModalBtn = document.getElementById('btn-open-gcal-modal');
    closeGcalModalBtn = document.getElementById('btn-close-gcal-modal');
    gcalModalOverlay = document.getElementById('gcal-modal-overlay');
    btnDownloadIcs = document.getElementById('btn-download-ics');
    footerGcalBtn = document.getElementById('btn-footer-gcal');
    gcalCountActive = document.getElementById('gcal-count-active');
    gcalCountMonth = document.getElementById('gcal-count-month');
    gcalCountAll = document.getElementById('gcal-count-all');
    toastNotification = document.getElementById('toast-notification');
    toastMessage = document.getElementById('toast-message');
    taskOpenGcalCheckbox = document.getElementById('task-open-gcal-checkbox');

    headerGcalSyncBtn = document.getElementById('header-gcal-sync-btn');
    headerGcalSyncText = document.getElementById('header-gcal-sync-text');
    footerDirectSyncBtn = document.getElementById('btn-footer-direct-sync');
    footerDirectSyncText = document.getElementById('footer-direct-sync-text');
    btnModalDirectPush = document.getElementById('btn-modal-direct-push');
    btnModalPushText = document.getElementById('btn-modal-push-text');
    gcalClientIdInput = document.getElementById('gcal-client-id-input');
    btnSaveGcalClientId = document.getElementById('btn-save-gcal-client-id');
    gcalAuthStatusBadge = document.getElementById('gcal-auth-status-badge');
    gcalFileProtocolWarning = document.getElementById('gcal-file-protocol-warning');
    gcalLiveSyncDot = document.getElementById('gcal-live-sync-dot');
    gcalLiveSyncStatus = document.getElementById('gcal-live-sync-status');
}

/**
 * Initialize Dates & Form Controls (allows years up to 2100)
 */
function initDateDefaults() {
    const todayStr = getLocalDateString(new Date());
    if (taskDateInput) {
        taskDateInput.value = todayStr;
        taskDateInput.min = '1970-01-01';
        taskDateInput.max = '2100-12-31';
    }

    const headerDateBadge = document.getElementById('header-date-badge');
    if (headerDateBadge) {
        const now = new Date();
        headerDateBadge.textContent = now.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }

    if (taskStartTimeSelect) {
        taskStartTimeSelect.innerHTML = buildTimeOptionsHTML('');
    }

    if (taskReminderHour) {
        taskReminderHour.innerHTML = buildHourOptionsHTML('');
    }

    if (taskReminderMin) {
        taskReminderMin.innerHTML = buildMinuteOptionsHTML('00');
    }

    initCalendarYearDropdown();
}

/**
 * Year Dropdown Options up to 2100
 */
function initCalendarYearDropdown() {
    if (!calYearSelect) return;
    let html = '';
    const currentYear = currentCalendarDate.getFullYear();
    for (let y = 2020; y <= 2100; y++) {
        html += `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`;
    }
    calYearSelect.innerHTML = html;
}

/**
 * 24-Hour Time Dropdown Options
 */
function buildTimeOptionsHTML(selectedValue) {
    let html = `<option value="" ${!selectedValue ? 'selected' : ''}>-- None --</option>`;
    for (let h = 0; h < 24; h++) {
        for (const m of [0, 30]) {
            const hh = String(h).padStart(2, '0');
            const mm = String(m).padStart(2, '0');
            const val = `${hh}:${mm}`;
            html += `<option value="${val}" ${val === selectedValue ? 'selected' : ''}>${val}</option>`;
        }
    }
    return html;
}

/**
 * Reminder Hour Dropdown Options (starts with 00 then goes down to 23)
 */
function buildHourOptionsHTML(selectedHour) {
    let html = `<option value="" ${!selectedHour ? 'selected' : ''}>--</option>`;
    for (let h = 0; h < 24; h++) {
        const hh = String(h).padStart(2, '0');
        html += `<option value="${hh}" ${hh === selectedHour ? 'selected' : ''}>${hh}</option>`;
    }
    return html;
}

/**
 * Reminder Minute Dropdown Options (starts with 00 then goes down to 59, never rolls back)
 */
function buildMinuteOptionsHTML(selectedMin) {
    let html = '';
    for (let m = 0; m < 60; m++) {
        const mm = String(m).padStart(2, '0');
        html += `<option value="${mm}" ${mm === selectedMin ? 'selected' : ''}>${mm}</option>`;
    }
    return html;
}

/**
 * Syncs Reminder hour & min selects to hidden input
 */
function syncReminderInputValue() {
    if (!taskReminderInput) return;
    const h = taskReminderHour ? taskReminderHour.value : '';
    const m = taskReminderMin ? taskReminderMin.value : '00';
    if (!h) {
        taskReminderInput.value = '';
    } else {
        taskReminderInput.value = `${h}:${m}`;
    }
}

/**
 * Converts Date object to local YYYY-MM-DD string
 */
function getLocalDateString(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Theme Management (Light / Dark)
 */
function initTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) {
        isDarkMode = savedTheme === 'dark';
    } else {
        isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    applyTheme();
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? 'dark' : 'light');
    applyTheme();
    renderCalendar();
}

function applyTheme() {
    const htmlEl = document.documentElement;
    if (isDarkMode) {
        htmlEl.classList.remove('light');
        if (themeBtnIcon) themeBtnIcon.textContent = '🌙';
        if (themeBtnText) themeBtnText.textContent = 'Dark';
    } else {
        htmlEl.classList.add('light');
        if (themeBtnIcon) themeBtnIcon.textContent = '☀️';
        if (themeBtnText) themeBtnText.textContent = 'Light';
    }
}

/**
 * Load Tasks from Storage
 */
function loadTasks() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            tasks = JSON.parse(saved) || [];
            tasks = tasks.map(t => PEOPLE.includes(t.person) ? t : { ...t, person: 'Dad' });
        }
    } catch (err) {
        console.error('Error loading tasks:', err);
        tasks = [];
    }
    try {
        const savedArchive = localStorage.getItem(ARCHIVE_STORAGE_KEY);
        if (savedArchive) {
            archivedTasks = JSON.parse(savedArchive) || [];
            archivedTasks = archivedTasks.map(t => PEOPLE.includes(t.person) ? t : { ...t, person: 'Dad' });
        }
    } catch (err) {
        console.error('Error loading archived tasks:', err);
        archivedTasks = [];
    }
}

/**
 * Save Tasks to Storage
 */
function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
        console.error('Error saving tasks:', err);
    }
}

/**
 * Save Archived Tasks to Storage
 */
function saveArchivedTasks() {
    try {
        localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(archivedTasks));
    } catch (err) {
        console.error('Error saving archived tasks:', err);
    }
}

/**
 * Event Listeners
 */
function setupEventListeners() {
    if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);

    // Form Submission
    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = taskTitleInput.value.trim();
            const date = taskDateInput.value;
            const startTime = taskStartTimeSelect.value || null;
            const duration = taskDurationSelect.value;
            const reminder = taskReminderInput.value || null;
            const person = taskPersonSelect.value;

            if (!title || !date) return;

            const newTask = {
                id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                title,
                date,
                startTime,
                duration,
                reminder,
                person,
                completed: false,
                notified: false,
                createdAt: Date.now()
            };

            tasks.unshift(newTask);
            saveTasks();

            taskTitleInput.value = '';
            taskStartTimeSelect.value = '';
            taskReminderInput.value = '';
            if (taskReminderHour) taskReminderHour.value = '';
            if (taskReminderMin) taskReminderMin.value = '00';
            taskTitleInput.focus();

            selectedCalendarDate = date;
            currentCalendarDate = new Date(date + 'T00:00:00');

            renderCalendar();
            renderTasks();

            if (taskOpenGcalCheckbox && taskOpenGcalCheckbox.checked) {
                const gcalUrl = getGoogleCalendarUrl(newTask);
                window.open(gcalUrl, '_blank', 'noopener,noreferrer');
                showToast(`Opened "${newTask.title.slice(0, 20)}" in Google Calendar!`);
            } else {
                showToast(`Task added!`, 'Add to GCal ↗', () => {
                    const gcalUrl = getGoogleCalendarUrl(newTask);
                    window.open(gcalUrl, '_blank', 'noopener,noreferrer');
                });
            }
        });
    }

    // Reminder Selects (Hour & Minute)
    if (taskReminderHour) {
        taskReminderHour.addEventListener('change', syncReminderInputValue);
    }
    if (taskReminderMin) {
        taskReminderMin.addEventListener('change', syncReminderInputValue);
    }

    // Task Item Clicks (Toggle, Edit, Delete)
    if (taskList) {
        taskList.addEventListener('click', (e) => {
            const target = e.target;
            const itemEl = target.closest('.task-item');
            if (!itemEl) return;

            const id = itemEl.dataset.id;

            // Delete
            if (target.closest('.btn-delete-task')) {
                tasks = tasks.filter(t => t.id !== id);
                saveTasks();
                renderCalendar();
                renderTasks();
                return;
            }

            // Google Calendar Action (Direct Push if configured, else 1-click template)
            if (target.closest('.btn-gcal-task')) {
                const targetTask = tasks.find(t => t.id === id);
                if (targetTask) {
                    const savedClientId = localStorage.getItem(GCAL_CLIENT_ID_KEY);
                    if (savedClientId && window.location.protocol !== 'file:') {
                        triggerRealTimeSync(targetTask.id);
                    } else {
                        const gcalUrl = getGoogleCalendarUrl(targetTask);
                        window.open(gcalUrl, '_blank', 'noopener,noreferrer');
                        showToast(`Opening Google Calendar for "${targetTask.title.slice(0, 20)}"...`);
                    }
                }
                return;
            }

            // Edit
            if (target.closest('.btn-edit-task')) {
                activateInlineEdit(itemEl, id);
                return;
            }

            // Toggle Complete
            if (target.closest('.task-check-area') || target.closest('.task-text')) {
                const targetTask = tasks.find(t => t.id === id);
                if (targetTask) {
                    const willComplete = !targetTask.completed;
                    targetTask.completed = willComplete;
                    saveTasks();

                    if (willComplete) {
                        fireConfetti();
                        playChimeSound(660, 880);
                    }

                    renderCalendar();
                    renderTasks();
                }
            }
        });
    }

    // Filter Buttons
    if (filterBtns) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                renderTasks();
            });
        });
    }

    // Archive Completed
    if (btnArchiveCompleted) {
        btnArchiveCompleted.addEventListener('click', () => {
            const completed = tasks.filter(t => t.completed);
            if (completed.length === 0) return;
            completed.forEach(t => {
                t.archivedAt = Date.now();
                archivedTasks.unshift(t);
            });
            tasks = tasks.filter(t => !t.completed);
            saveTasks();
            saveArchivedTasks();
            renderCalendar();
            renderTasks();
        });
    }

    // Search Input
    if (taskSearchInput) {
        taskSearchInput.addEventListener('input', () => {
            searchQuery = taskSearchInput.value.trim().toLowerCase();
            if (btnClearSearch) {
                btnClearSearch.style.display = searchQuery ? 'flex' : 'none';
            }
            renderTasks();
        });
    }

    // Clear Search
    if (btnClearSearch) {
        btnClearSearch.addEventListener('click', () => {
            searchQuery = '';
            if (taskSearchInput) taskSearchInput.value = '';
            btnClearSearch.style.display = 'none';
            taskSearchInput.focus();
            renderTasks();
        });
    }

    // Date Filters
    if (btnClearDateFilter) {
        btnClearDateFilter.addEventListener('click', () => {
            selectedCalendarDate = null;
            renderCalendar();
            renderTasks();
        });
    }

    if (btnShowAllDates) {
        btnShowAllDates.addEventListener('click', () => {
            selectedCalendarDate = null;
            renderCalendar();
            renderTasks();
        });
    }

    // Calendar Navigation
    if (calPrevBtn) {
        calPrevBtn.addEventListener('click', () => {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (calNextBtn) {
        calNextBtn.addEventListener('click', () => {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
            renderCalendar();
        });
    }

    if (calTodayBtn) {
        calTodayBtn.addEventListener('click', () => {
            currentCalendarDate = new Date();
            selectedCalendarDate = getLocalDateString(new Date());
            renderCalendar();
            renderTasks();
        });
    }

    if (calMonthSelect) {
        calMonthSelect.addEventListener('change', () => {
            currentCalendarDate.setMonth(parseInt(calMonthSelect.value, 10));
            renderCalendar();
        });
    }

    if (calYearSelect) {
        calYearSelect.addEventListener('change', () => {
            currentCalendarDate.setFullYear(parseInt(calYearSelect.value, 10));
            renderCalendar();
        });
    }

    // Notification Toggle
    if (enableNotifBtn) {
        enableNotifBtn.addEventListener('click', () => {
            notificationsEnabled = !notificationsEnabled;
            saveNotificationToggleState();
            updateNotificationButtonUI();

            if (notificationsEnabled && "Notification" in window && Notification.permission !== "granted") {
                requestNotificationPermission();
            }
        });
    }

    // Real-Time Google Calendar Direct Sync Triggers
    if (headerGcalSyncBtn) {
        headerGcalSyncBtn.addEventListener('click', () => triggerRealTimeSync());
    }
    if (footerDirectSyncBtn) {
        footerDirectSyncBtn.addEventListener('click', () => triggerRealTimeSync());
    }
    if (btnModalDirectPush) {
        btnModalDirectPush.addEventListener('click', () => triggerRealTimeSync());
    }
    if (btnSaveGcalClientId) {
        btnSaveGcalClientId.addEventListener('click', handleSaveGCalClientId);
    }

    // Google Calendar Sync & Export Modal Triggers
    if (openGcalModalBtn) {
        openGcalModalBtn.addEventListener('click', openGCalModal);
    }
    if (footerGcalBtn) {
        footerGcalBtn.addEventListener('click', openGCalModal);
    }
    if (closeGcalModalBtn) {
        closeGcalModalBtn.addEventListener('click', closeGCalModal);
    }
    if (gcalModalOverlay) {
        gcalModalOverlay.addEventListener('click', (e) => {
            if (e.target === gcalModalOverlay) {
                closeGCalModal();
            }
        });
    }
    if (btnDownloadIcs) {
        btnDownloadIcs.addEventListener('click', handleDownloadICS);
    }

    // Dismiss Reminder Modal
    if (btnModalDismiss) {
        btnModalDismiss.addEventListener('click', () => {
            reminderModalOverlay.classList.remove('active');
        });
    }

    // Dismiss Reminder Modal on Outside Click
    if (reminderModalOverlay) {
        reminderModalOverlay.addEventListener('click', (e) => {
            if (e.target === reminderModalOverlay) {
                reminderModalOverlay.classList.remove('active');
            }
        });
    }

    // Global Keyboard Shortcuts (Escape to dismiss modal or cancel inline edit)
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (reminderModalOverlay && reminderModalOverlay.classList.contains('active')) {
                reminderModalOverlay.classList.remove('active');
            }
            if (gcalModalOverlay && gcalModalOverlay.classList.contains('active')) {
                closeGCalModal();
            }
            const activeCancelBtn = document.querySelector('.btn-edit-cancel');
            if (activeCancelBtn) {
                renderTasks();
            }
        }
    });
}

/**
 * Render Task List — supports 'all', 'active', 'completed', 'archived' filters + search
 */
function renderTasks() {
    const todayStr = getLocalDateString(new Date());
    const isArchiveView = currentFilter === 'archived';

    // Choose base pool
    let pool = isArchiveView ? [...archivedTasks] : [...tasks];

    // Apply calendar date filter (skip in archive view)
    if (!isArchiveView && selectedCalendarDate) {
        pool = pool.filter(t => t.date === selectedCalendarDate);
        if (activeDateChip) {
            activeDateChip.style.display = 'inline-flex';
            const dateParts = selectedCalendarDate.split('-');
            const dObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
            if (activeDateLabel) activeDateLabel.textContent = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    } else {
        if (activeDateChip) activeDateChip.style.display = 'none';
    }

    // Apply status sub-filter
    if (!isArchiveView) {
        if (currentFilter === 'active') pool = pool.filter(t => !t.completed);
        else if (currentFilter === 'completed') pool = pool.filter(t => t.completed);
    }

    // Apply search
    if (searchQuery) {
        pool = pool.filter(t =>
            t.title.toLowerCase().includes(searchQuery) ||
            (t.person || '').toLowerCase().includes(searchQuery) ||
            (t.date || '').includes(searchQuery)
        );
    }

    if (taskList) taskList.innerHTML = '';

    pool.forEach(task => {
        const li = document.createElement('li');

        const isOverdue = !task.completed && task.date < todayStr;
        const isDueToday = !task.completed && task.date === todayStr;

        let statusClasses = '';
        if (isArchiveView) statusClasses = 'is-archived';
        else if (task.completed) statusClasses = 'completed';
        else if (isOverdue) statusClasses = 'is-overdue';
        else if (isDueToday) statusClasses = 'is-due-today';

        li.className = `task-item ${statusClasses}`;
        li.dataset.id = task.id;

        const dateParts = task.date.split('-');
        const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const personName = task.person || 'Dad';

        let statusBadgeHTML = '';
        if (isArchiveView) statusBadgeHTML = `<span class="badge-status archived">Archived</span>`;
        else if (isOverdue) statusBadgeHTML = `<span class="badge-status overdue">Overdue</span>`;
        else if (isDueToday) statusBadgeHTML = `<span class="badge-status today">Due Today</span>`;

        const actionsHTML = isArchiveView
            ? `<div class="task-actions">
                <button class="btn-icon-action btn-unarchive-task" title="Restore task" type="button" data-id="${task.id}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 .49-4.5"></path></svg>
                </button>
                <button class="btn-icon-action delete btn-delete-archived-task" title="Delete permanently" type="button" data-id="${task.id}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>`
            : `<div class="task-actions">
                <button class="btn-icon-action btn-gcal-task" title="Add to Google Calendar" type="button" aria-label="Add to Google Calendar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                        <path d="M12 14v4M10 16h4"></path>
                    </svg>
                </button>
                <button class="btn-icon-action btn-edit-task" title="Edit task" type="button">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button class="btn-icon-action delete btn-delete-task" title="Delete task" type="button">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>`;

        li.innerHTML = `
            <button type="button" class="task-check-area" aria-label="${task.completed || isArchiveView ? 'Mark incomplete' : 'Mark complete'}" ${isArchiveView ? 'disabled' : ''}>
                <div class="custom-checkbox">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
            </button>
            <div class="task-content">
                <div class="task-title-row">
                    <span class="task-text">${escapeHTML(task.title)}</span>
                    ${statusBadgeHTML}
                </div>
                <div class="task-meta-row">
                    <span class="meta-chip person-chip" data-person="${personName}">${personName}</span>
                    <span class="meta-chip">${formattedDate}</span>
                    ${task.startTime ? `<span class="meta-chip">${task.startTime}</span>` : ''}
                    <span class="meta-chip">${task.duration}</span>
                    ${task.reminder ? `<span class="meta-chip reminder-chip">🔔 ${task.reminder}</span>` : ''}
                    ${task.gcalEventId ? `<span class="meta-chip gcal-synced-chip" title="Synced directly to Google Calendar">✓ GCal</span>` : ''}
                </div>
            </div>
            ${actionsHTML}
        `;

        taskList.appendChild(li);
    });

    // Bind archived-view action buttons
    if (isArchiveView && taskList) {
        taskList.querySelectorAll('.btn-unarchive-task').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const task = archivedTasks.find(t => t.id === id);
                if (!task) return;
                delete task.archivedAt;
                task.completed = false;
                task.notified = false;
                tasks.unshift(task);
                archivedTasks = archivedTasks.filter(t => t.id !== id);
                saveTasks();
                saveArchivedTasks();
                renderCalendar();
                renderTasks();
            });
        });
        taskList.querySelectorAll('.btn-delete-archived-task').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                archivedTasks = archivedTasks.filter(t => t.id !== id);
                saveArchivedTasks();
                renderTasks();
            });
        });
    }

    // Empty state
    if (tasksEmptyState) tasksEmptyState.classList.toggle('hidden', pool.length > 0);

    // Active count (always shows non-archived, non-completed tasks)
    const activeCount = tasks.filter(t => !t.completed).length;
    if (taskCountText) taskCountText.textContent = `${activeCount} ${activeCount === 1 ? 'task' : 'tasks'} remaining`;

    updateAnalytics();
}


/**
 * Inline Edit Activation
 */
function activateInlineEdit(itemEl, id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const [rHour, rMin] = task.reminder ? task.reminder.split(':') : ['', '00'];
    const personOptions = PEOPLE.map(p => 
        `<option value="${p}" ${task.person === p ? 'selected' : ''}>${p}</option>`
    ).join('');

    itemEl.innerHTML = `
        <form class="task-inline-edit-form" id="edit-form-${id}">
            <input
                type="text"
                class="text-input"
                id="edit-title-${id}"
                value="${escapeHTML(task.title)}"
                placeholder="Task title"
                required
                autocomplete="off"
            />
            <div class="form-meta-grid">
                <div class="meta-field">
                    <label class="meta-label">Date</label>
                    <input type="date" class="meta-input" id="edit-date-${id}" value="${task.date}" min="1970-01-01" max="2100-12-31" required />
                </div>
                <div class="meta-field">
                    <label class="meta-label">Time</label>
                    <select class="meta-select" id="edit-starttime-${id}">
                        ${buildTimeOptionsHTML(task.startTime || '')}
                    </select>
                </div>
                <div class="meta-field">
                    <label class="meta-label">Duration</label>
                    <select class="meta-select" id="edit-duration-${id}">
                        <option value="15 min" ${task.duration === '15 min' ? 'selected' : ''}>15m</option>
                        <option value="30 min" ${task.duration === '30 min' ? 'selected' : ''}>30m</option>
                        <option value="45 min" ${task.duration === '45 min' ? 'selected' : ''}>45m</option>
                        <option value="1 hr" ${task.duration === '1 hr' ? 'selected' : ''}>1h</option>
                        <option value="2 hrs" ${task.duration === '2 hrs' ? 'selected' : ''}>2h</option>
                        <option value="4 hrs" ${task.duration === '4 hrs' ? 'selected' : ''}>4h</option>
                        <option value="Full day" ${task.duration === 'Full day' ? 'selected' : ''}>Full day</option>
                    </select>
                </div>
                <div class="meta-field">
                    <label class="meta-label">Reminder</label>
                    <div class="time-select-group">
                        <select class="meta-select time-sub-select" id="edit-reminder-hour-${id}">
                            ${buildHourOptionsHTML(rHour || '')}
                        </select>
                        <span class="time-separator" aria-hidden="true">:</span>
                        <select class="meta-select time-sub-select" id="edit-reminder-min-${id}">
                            ${buildMinuteOptionsHTML(rMin || '00')}
                        </select>
                    </div>
                </div>
                <div class="meta-field">
                    <label class="meta-label">Assignee</label>
                    <select class="meta-select" id="edit-person-${id}">
                        ${personOptions}
                    </select>
                </div>
            </div>
            <div class="inline-edit-actions">
                <button type="button" class="btn-edit-gcal" id="edit-gcal-${id}" title="Open this event in Google Calendar">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                        <path d="M12 14v4M10 16h4"></path>
                    </svg>
                    <span>Google Cal</span>
                </button>
                <button type="button" class="btn-edit-cancel" data-cancel-id="${id}">Cancel</button>
                <button type="submit" class="btn-edit-save">Save Changes</button>
            </div>
        </form>
    `;

    const btnEditGcal = document.getElementById(`edit-gcal-${id}`);
    if (btnEditGcal) {
        btnEditGcal.addEventListener('click', () => {
            const currentTitle = document.getElementById(`edit-title-${id}`).value.trim() || task.title;
            const currentDate = document.getElementById(`edit-date-${id}`).value || task.date;
            const currentStartTime = document.getElementById(`edit-starttime-${id}`).value || null;
            const currentDuration = document.getElementById(`edit-duration-${id}`).value;
            const editRHour = document.getElementById(`edit-reminder-hour-${id}`).value;
            const editRMin = document.getElementById(`edit-reminder-min-${id}`).value || '00';
            const currentReminder = editRHour ? `${editRHour}:${editRMin}` : null;
            const currentPerson = document.getElementById(`edit-person-${id}`).value;

            const previewTask = {
                ...task,
                title: currentTitle,
                date: currentDate,
                startTime: currentStartTime,
                duration: currentDuration,
                reminder: currentReminder,
                person: currentPerson
            };
            const gcalUrl = getGoogleCalendarUrl(previewTask);
            window.open(gcalUrl, '_blank', 'noopener,noreferrer');
            showToast('Opening Google Calendar event...');
        });
    }

    const titleInput = document.getElementById(`edit-title-${id}`);
    titleInput.focus();

    document.getElementById(`edit-form-${id}`).addEventListener('submit', (e) => {
        e.preventDefault();
        const newTitle = document.getElementById(`edit-title-${id}`).value.trim();
        const newDate = document.getElementById(`edit-date-${id}`).value;
        const newStartTime = document.getElementById(`edit-starttime-${id}`).value || null;
        const newDuration = document.getElementById(`edit-duration-${id}`).value;
        const editRHour = document.getElementById(`edit-reminder-hour-${id}`).value;
        const editRMin = document.getElementById(`edit-reminder-min-${id}`).value || '00';
        const newReminder = editRHour ? `${editRHour}:${editRMin}` : null;
        const newPerson = document.getElementById(`edit-person-${id}`).value;

        if (!newTitle || !newDate) return;

        tasks = tasks.map(t => t.id === id
            ? { ...t, title: newTitle, date: newDate, startTime: newStartTime, duration: newDuration, reminder: newReminder, person: newPerson, notified: false }
            : t
        );
        saveTasks();

        currentCalendarDate = new Date(newDate + 'T00:00:00');
        selectedCalendarDate = newDate;

        renderCalendar();
        renderTasks();
    });

    itemEl.querySelector(`[data-cancel-id="${id}"]`).addEventListener('click', () => {
        renderTasks();
    });
}

/**
 * Render Interactive Monthly Calendar
 */
function renderCalendar() {
    if (!calendarDaysGrid) return;

    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    if (calMonthTitle) calMonthTitle.textContent = `${monthNames[month]} ${year}`;
    if (calMonthSelect) calMonthSelect.value = month;
    if (calYearSelect) calYearSelect.value = year;

    calendarDaysGrid.innerHTML = '';

    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const todayFormatted = getLocalDateString(new Date());

    // Empty cell prefixes
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'cal-cell empty';
        calendarDaysGrid.appendChild(emptyCell);
    }

    // Days of month
    for (let day = 1; day <= lastDate; day++) {
        const dayCell = document.createElement('button');
        dayCell.type = 'button';

        const monthStr = String(month + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const cellDateStr = `${year}-${monthStr}-${dayStr}`;
        dayCell.dataset.date = cellDateStr;

        const isToday = (cellDateStr === todayFormatted);
        const isSelected = (cellDateStr === selectedCalendarDate);

        dayCell.className = 'cal-cell';
        if (isSelected) dayCell.classList.add('selected');
        if (isToday) dayCell.classList.add('today');

        dayCell.innerHTML = `<span>${day}</span>`;

        // Dots row for tasks
        const tasksOnDay = tasks.filter(t => t.date === cellDateStr);
        if (tasksOnDay.length > 0) {
            const hasOverdue = tasksOnDay.some(t => !t.completed && t.date < todayFormatted);
            const peopleOnDay = [...new Set(tasksOnDay.map(t => t.person || 'Dad'))];
            const dotsRow = document.createElement('div');
            dotsRow.className = 'cal-dots-row';

            if (hasOverdue && !isSelected) {
                const ovdDot = document.createElement('span');
                ovdDot.className = 'cal-dot overdue-dot';
                ovdDot.title = 'Overdue tasks on this date';
                dotsRow.appendChild(ovdDot);
            }

            peopleOnDay.forEach(p => {
                const d = document.createElement('span');
                d.className = 'cal-dot';
                d.dataset.person = p;
                dotsRow.appendChild(d);
            });

            dayCell.appendChild(dotsRow);
        }

        // Click handler to toggle filter
        dayCell.addEventListener('click', () => {
            if (selectedCalendarDate === cellDateStr) {
                selectedCalendarDate = null;
            } else {
                selectedCalendarDate = cellDateStr;
            }
            renderCalendar();
            renderTasks();
        });

        calendarDaysGrid.appendChild(dayCell);
    }
}

/**
 * Analytics & Scope Summary
 */
function updateAnalytics() {
    const todayStr = getLocalDateString(new Date());

    let relevantTasks = tasks;
    if (selectedCalendarDate) {
        relevantTasks = tasks.filter(t => t.date === selectedCalendarDate);
        const dateParts = selectedCalendarDate.split('-');
        const dObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        if (summaryDateHeading) {
            summaryDateHeading.textContent = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    } else {
        if (summaryDateHeading) summaryDateHeading.textContent = 'All Scheduled Dates';
    }

    const total = relevantTasks.length;
    const done = relevantTasks.filter(t => t.completed).length;
    const overdue = relevantTasks.filter(t => !t.completed && t.date < todayStr).length;
    const active = total - done;

    if (statTotalTasks) statTotalTasks.textContent = total;
    if (statPendingTasks) statPendingTasks.textContent = active;
    if (statOverdueTasks) statOverdueTasks.textContent = overdue;
    if (statDoneTasks) statDoneTasks.textContent = done;

    // Calculate overall completion percentage for hero progress bar
    const allTotal = tasks.length;
    const allDone = tasks.filter(t => t.completed).length;
    const pct = allTotal > 0 ? Math.round((allDone / allTotal) * 100) : 0;

    if (introProgressFill) introProgressFill.style.width = `${pct}%`;
    if (introProgressPct) introProgressPct.textContent = `${pct}% completed`;

    // Dynamic contextual status quote
    const statusQuoteEl = document.querySelector('.status-animated-quote');
    if (statusQuoteEl) {
        if (allTotal === 0) {
            statusQuoteEl.textContent = 'All clear! Schedule your next priority.';
        } else if (allTotal > 0 && allDone === allTotal) {
            statusQuoteEl.textContent = '🎉 All items completed! Fantastic momentum.';
        } else if (overdue > 0) {
            statusQuoteEl.textContent = `⚠️ ${overdue} overdue ${overdue === 1 ? 'task' : 'tasks'} requiring attention.`;
        } else if (active > 0) {
            statusQuoteEl.textContent = `${active} active ${active === 1 ? 'task' : 'tasks'} in progress.`;
        } else {
            statusQuoteEl.textContent = 'Every task done clears your space.';
        }
    }
}

/**
 * Reminder Checking Interval
 */
function checkReminders() {
    if (!notificationsEnabled) return;

    const now = new Date();
    const todayStr = getLocalDateString(now);
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;

    tasks.forEach(task => {
        if (!task.completed && !task.notified && task.reminder) {
            if (task.date === todayStr && task.reminder <= currentTimeStr) {
                task.notified = true;
                saveTasks();

                triggerReminderModal(task);
                playChimeSound(587.33, 880);

                if ("Notification" in window && Notification.permission === "granted") {
                    new Notification(`Task Reminder: ${task.title}`, {
                        body: `Scheduled: ${task.date} • Duration: ${task.duration} • Assigned to ${task.person}`,
                        icon: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236366f1"><circle cx="12" cy="12" r="10"/></svg>'
                    });
                }
            }
        }
    });
}

/**
 * Shows in-app glassmorphic reminder popup
 */
function triggerReminderModal(task) {
    if (!reminderModalOverlay) return;
    if (modalTaskTitle) modalTaskTitle.textContent = task.title;
    if (modalTaskMeta) {
        modalTaskMeta.textContent = `Scheduled: ${task.date} at ${task.reminder} • Duration: ${task.duration} • ${task.person}`;
    }
    reminderModalOverlay.classList.add('active');
}

/**
 * Dual-Tone Synthesizer Chime (Web Audio API Singleton)
 */
let sharedAudioCtx = null;

function getSharedAudioContext() {
    if (!sharedAudioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) sharedAudioCtx = new AudioContextClass();
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
        sharedAudioCtx.resume();
    }
    return sharedAudioCtx;
}

function playChimeSound(freq1 = 587.33, freq2 = 880) {
    try {
        const ctx = getSharedAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq1, now);
        osc.frequency.exponentialRampToValueAtTime(freq2, now + 0.15);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.7);
    } catch (e) {
        // Audio playback prevented by browser auto-play policy until user gesture
    }
}

/**
 * Notification Toggle States
 */
function loadNotificationToggleState() {
    try {
        const saved = localStorage.getItem(NOTIF_TOGGLE_KEY);
        notificationsEnabled = saved === null ? true : saved === 'true';
    } catch (err) {
        notificationsEnabled = true;
    }
    updateNotificationButtonUI();
}

function saveNotificationToggleState() {
    try {
        localStorage.setItem(NOTIF_TOGGLE_KEY, String(notificationsEnabled));
    } catch (err) {
        console.error('Error saving notification toggle state:', err);
    }
}

function updateNotificationButtonUI() {
    if (!enableNotifBtn) return;
    if (notificationsEnabled) {
        enableNotifBtn.style.opacity = '1';
        if (notifBtnIcon) notifBtnIcon.textContent = '🔔';
        if (notifBtnText) notifBtnText.textContent = 'Alerts On';
    } else {
        enableNotifBtn.style.opacity = '0.6';
        if (notifBtnIcon) notifBtnIcon.textContent = '🔕';
        if (notifBtnText) notifBtnText.textContent = 'Alerts Off';
    }
}

function checkNotificationPermissionStatus() {
    if (!("Notification" in window)) return;
}

function requestNotificationPermission() {
    if (!("Notification" in window)) return;
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            new Notification("Notifications Enabled", {
                body: "You will receive reminders when your scheduled tasks are due."
            });
        }
    });
}

/**
 * Escape HTML Helper
 */
function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * ============================================================================
 * Confetti Canvas Particle Engine
 * ============================================================================
 */
let confettiParticles = [];
let confettiAnimationId = null;

function initConfetti() {
    if (!confettiCanvas) return;
    confettiCtx = confettiCanvas.getContext('2d');
    resizeConfettiCanvas();
    window.addEventListener('resize', resizeConfettiCanvas);
}

function resizeConfettiCanvas() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}

function fireConfetti() {
    if (!confettiCanvas || !confettiCtx) return;

    const colors = ['#6366f1', '#818cf8', '#a5b4fc', '#4f46e5', '#c7d2fe', '#ffffff'];
    const originX = window.innerWidth / 2;
    const originY = window.innerHeight * 0.45;

    for (let i = 0; i < 65; i++) {
        confettiParticles.push({
            x: originX,
            y: originY,
            vx: (Math.random() - 0.5) * 16,
            vy: (Math.random() - 0.7) * 16,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 12,
            opacity: 1,
            shape: Math.random() > 0.5 ? 'circle' : 'rect'
        });
    }

    if (!confettiAnimationId) {
        animateConfetti();
    }
}

function animateConfetti() {
    if (!confettiCtx || !confettiCanvas) return;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    for (let i = confettiParticles.length - 1; i >= 0; i--) {
        const p = confettiParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.vx *= 0.98; // air resistance
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.016;

        if (p.opacity <= 0 || p.y > confettiCanvas.height) {
            confettiParticles.splice(i, 1);
            continue;
        }

        confettiCtx.save();
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate((p.rotation * Math.PI) / 180);
        confettiCtx.globalAlpha = Math.max(0, p.opacity);
        confettiCtx.fillStyle = p.color;

        if (p.shape === 'circle') {
            confettiCtx.beginPath();
            confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            confettiCtx.fill();
        } else {
            confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        }

        confettiCtx.restore();
    }

    if (confettiParticles.length > 0) {
        confettiAnimationId = requestAnimationFrame(animateConfetti);
    } else {
        confettiAnimationId = null;
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
}

/**
 * ============================================================================
 * Google Calendar & iCalendar (.ics) Integration
 * ============================================================================
 */

function getDurationMinutes(durationStr) {
    if (!durationStr) return 30;
    if (durationStr === 'Full day') return 0;
    if (durationStr.includes('min')) {
        const val = parseInt(durationStr, 10);
        return isNaN(val) ? 30 : val;
    }
    if (durationStr.includes('hr')) {
        const val = parseFloat(durationStr);
        return isNaN(val) ? 60 : Math.round(val * 60);
    }
    return 30;
}

function formatGCalDateTimeLocal(date) {
    const Y = date.getFullYear();
    const M = String(date.getMonth() + 1).padStart(2, '0');
    const D = String(date.getDate()).padStart(2, '0');
    const H = String(date.getHours()).padStart(2, '0');
    const Min = String(date.getMinutes()).padStart(2, '0');
    const S = String(date.getSeconds()).padStart(2, '0');
    return `${Y}${M}${D}T${H}${Min}${S}`;
}

function formatGCalDateOnly(date) {
    const Y = date.getFullYear();
    const M = String(date.getMonth() + 1).padStart(2, '0');
    const D = String(date.getDate()).padStart(2, '0');
    return `${Y}${M}${D}`;
}

function getGoogleCalendarUrl(task) {
    if (!task || !task.date) return 'https://calendar.google.com/calendar/';
    const [y, m, d] = task.date.split('-').map(Number);
    let datesParam = '';

    if (task.startTime && task.duration !== 'Full day') {
        const [h, min] = task.startTime.split(':').map(Number);
        const startDate = new Date(y, m - 1, d, h, min, 0);
        const durMins = getDurationMinutes(task.duration);
        const endDate = new Date(startDate.getTime() + durMins * 60 * 1000);
        datesParam = `${formatGCalDateTimeLocal(startDate)}/${formatGCalDateTimeLocal(endDate)}`;
    } else {
        const startDate = new Date(y, m - 1, d);
        const nextDay = new Date(y, m - 1, d + 1);
        datesParam = `${formatGCalDateOnly(startDate)}/${formatGCalDateOnly(nextDay)}`;
    }

    const details = [
        `👤 Assigned to: ${task.person || 'Unassigned'}`,
        task.startTime ? `⏰ Scheduled Time: ${task.startTime}` : null,
        task.duration ? `⏳ Duration: ${task.duration}` : null,
        task.reminder ? `🔔 Reminder: ${task.reminder}` : null,
        '\nExported from Task Matrix Family Planner'
    ].filter(Boolean).join('\n');

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: task.title,
        dates: datesParam,
        details: details
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function escapeICSString(str) {
    if (!str) return '';
    return str
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '');
}

function formatICSDateTimeUTC(date) {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function generateICSContent(tasksToExport) {
    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Task Matrix//Family and Focus Planner//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:Task Matrix Planner'
    ];

    const nowStr = formatICSDateTimeUTC(new Date());

    tasksToExport.forEach(task => {
        if (!task.date) return;
        const [y, m, d] = task.date.split('-').map(Number);
        const uid = `${task.id || ('task_' + Date.now() + Math.random().toString(36).substring(2, 6))}@taskmatrix.local`;
        const title = escapeICSString(task.title || 'Untitled Task');
        const desc = escapeICSString([
            `Assigned to: ${task.person || 'Unassigned'}`,
            task.startTime ? `Scheduled: ${task.startTime}` : null,
            task.duration ? `Duration: ${task.duration}` : null,
            task.reminder ? `Reminder: ${task.reminder}` : null,
            task.completed ? 'Status: Completed' : 'Status: Pending',
            'Exported from Task Matrix Family Planner'
        ].filter(Boolean).join('\n'));

        lines.push('BEGIN:VEVENT');
        lines.push(`UID:${uid}`);
        lines.push(`DTSTAMP:${nowStr}`);
        lines.push(`SUMMARY:${title}`);
        lines.push(`DESCRIPTION:${desc}`);
        lines.push(`STATUS:${task.completed ? 'COMPLETED' : 'CONFIRMED'}`);
        lines.push(`CATEGORIES:${escapeICSString(task.person || 'Task')}`);

        if (task.startTime && task.duration !== 'Full day') {
            const [h, min] = task.startTime.split(':').map(Number);
            const startDate = new Date(y, m - 1, d, h, min, 0);
            const durMins = getDurationMinutes(task.duration);
            const endDate = new Date(startDate.getTime() + durMins * 60 * 1000);
            lines.push(`DTSTART:${formatGCalDateTimeLocal(startDate)}`);
            lines.push(`DTEND:${formatGCalDateTimeLocal(endDate)}`);
        } else {
            const startDate = new Date(y, m - 1, d);
            const nextDay = new Date(y, m - 1, d + 1);
            lines.push(`DTSTART;VALUE=DATE:${formatGCalDateOnly(startDate)}`);
            lines.push(`DTEND;VALUE=DATE:${formatGCalDateOnly(nextDay)}`);
        }

        lines.push('END:VEVENT');
    });

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
}

function downloadICSFile(filename, icsContent) {
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function openGCalModal() {
    if (!gcalModalOverlay) return;

    // Update counts
    const activeTasks = tasks.filter(t => !t.completed);
    const currYear = currentCalendarDate.getFullYear();
    const currMonth = currentCalendarDate.getMonth();
    const monthTasks = tasks.filter(t => {
        if (!t.date) return false;
        const [y, m] = t.date.split('-').map(Number);
        return y === currYear && (m - 1) === currMonth;
    });

    if (gcalCountActive) gcalCountActive.textContent = `${activeTasks.length} task${activeTasks.length === 1 ? '' : 's'}`;
    if (gcalCountMonth) gcalCountMonth.textContent = `${monthTasks.length} task${monthTasks.length === 1 ? '' : 's'}`;
    if (gcalCountAll) gcalCountAll.textContent = `${tasks.length} task${tasks.length === 1 ? '' : 's'}`;

    gcalModalOverlay.classList.add('active');
}

function closeGCalModal() {
    if (gcalModalOverlay) {
        gcalModalOverlay.classList.remove('active');
    }
}

function handleDownloadICS() {
    const selectedScope = document.querySelector('input[name="gcal-scope"]:checked')?.value || 'active';
    let targetTasks = [];

    if (selectedScope === 'active') {
        targetTasks = tasks.filter(t => !t.completed);
    } else if (selectedScope === 'month') {
        const currYear = currentCalendarDate.getFullYear();
        const currMonth = currentCalendarDate.getMonth();
        targetTasks = tasks.filter(t => {
            if (!t.date) return false;
            const [y, m] = t.date.split('-').map(Number);
            return y === currYear && (m - 1) === currMonth;
        });
    } else {
        targetTasks = [...tasks];
    }

    if (targetTasks.length === 0) {
        showToast('No tasks to export in this scope.');
        return;
    }

    const todayStr = getLocalDateString(new Date());
    const icsData = generateICSContent(targetTasks);
    downloadICSFile(`task-matrix-${selectedScope}-${todayStr}.ics`, icsData);
    showToast(`Exported ${targetTasks.length} task${targetTasks.length === 1 ? '' : 's'} to .ics!`);
    closeGCalModal();
}

let toastTimeout = null;
function showToast(message, actionText, actionCallback) {
    if (!toastNotification || !toastMessage) return;
    toastMessage.textContent = message;

    const oldBtn = toastNotification.querySelector('.toast-action-btn');
    if (oldBtn) oldBtn.remove();

    if (actionText && typeof actionCallback === 'function') {
        const actionBtn = document.createElement('button');
        actionBtn.className = 'toast-action-btn';
        actionBtn.type = 'button';
        actionBtn.textContent = actionText;
        actionBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            actionCallback();
            toastNotification.classList.remove('show');
        });
        toastNotification.appendChild(actionBtn);
    }

    toastNotification.classList.add('show');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toastNotification.classList.remove('show');
    }, 4200);
}

/**
 * ============================================================================
 * Real-Time Google Calendar Direct Sync Engine (OAuth 2.0 & REST API v3)
 * ============================================================================
 */

function updateGCalAuthBadge() {
    const savedClientId = localStorage.getItem(GCAL_CLIENT_ID_KEY);
    if (gcalClientIdInput && savedClientId) {
        gcalClientIdInput.value = savedClientId;
    }

    if (!gcalAuthStatusBadge) return;

    if (!savedClientId) {
        gcalAuthStatusBadge.className = 'auth-status-badge not-configured';
        gcalAuthStatusBadge.textContent = 'Not Configured';
    } else if (gcalAccessToken) {
        gcalAuthStatusBadge.className = 'auth-status-badge connected';
        gcalAuthStatusBadge.textContent = '🟢 Connected & Ready';
    } else {
        gcalAuthStatusBadge.className = 'auth-status-badge ready';
        gcalAuthStatusBadge.textContent = 'Client ID Saved';
    }

    if (gcalFileProtocolWarning) {
        gcalFileProtocolWarning.style.display = window.location.protocol === 'file:' ? 'block' : 'none';
    }
}

function handleSaveGCalClientId() {
    if (!gcalClientIdInput) return;
    const val = gcalClientIdInput.value.trim();
    if (!val) {
        localStorage.removeItem(GCAL_CLIENT_ID_KEY);
        showToast('Google Client ID cleared.');
        updateGCalAuthBadge();
        return;
    }

    localStorage.setItem(GCAL_CLIENT_ID_KEY, val);
    showToast('Client ID saved! Initializing Google Auth...');
    updateGCalAuthBadge();
    initGoogleIdentityTokenClient();
}

function initGoogleIdentityTokenClient(onSuccessCallback) {
    const clientId = localStorage.getItem(GCAL_CLIENT_ID_KEY);
    if (!clientId) return false;

    if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
        return false;
    }

    try {
        gcalTokenClient = google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'https://www.googleapis.com/auth/calendar.events',
            callback: (tokenResponse) => {
                if (tokenResponse && tokenResponse.access_token) {
                    gcalAccessToken = tokenResponse.access_token;
                    updateGCalAuthBadge();
                    showToast('Connected to Google Calendar! Syncing...');
                    if (typeof onSuccessCallback === 'function') {
                        onSuccessCallback();
                    } else {
                        executeRealTimeSync();
                    }
                } else if (tokenResponse && tokenResponse.error) {
                    console.error('Google OAuth error:', tokenResponse);
                    showToast(`Google Auth Error: ${tokenResponse.error}`);
                    setLiveSyncButtonState(false);
                }
            }
        });
        return true;
    } catch (err) {
        console.error('Failed to init Google Token Client:', err);
        return false;
    }
}

function triggerRealTimeSync(singleTaskId = null) {
    if (window.location.protocol === 'file:') {
        openGCalModal();
        showToast('Google OAuth requires running via localhost (e.g. python -m http.server 8000).');
        return;
    }

    const savedClientId = localStorage.getItem(GCAL_CLIENT_ID_KEY);
    if (!savedClientId) {
        openGCalModal();
        if (gcalClientIdInput) gcalClientIdInput.focus();
        showToast('Please enter your Google OAuth Client ID to enable Direct Sync.');
        return;
    }

    if (!gcalAccessToken) {
        if (!gcalTokenClient) {
            const initialized = initGoogleIdentityTokenClient(() => executeRealTimeSync(singleTaskId));
            if (!initialized) {
                showToast('Google Identity library loading. Please try again in a few seconds.');
                return;
            }
        }

        setLiveSyncButtonState(true, 'Authorizing Google...');
        gcalTokenClient.requestAccessToken({ prompt: '' });
        return;
    }

    executeRealTimeSync(singleTaskId);
}

async function executeRealTimeSync(singleTaskId = null) {
    if (!gcalAccessToken) {
        triggerRealTimeSync(singleTaskId);
        return;
    }

    const tasksToSync = singleTaskId
        ? tasks.filter(t => t.id === singleTaskId)
        : tasks.filter(t => !t.completed);

    if (tasksToSync.length === 0) {
        showToast('No active tasks to sync to Google Calendar.');
        setLiveSyncButtonState(false);
        return;
    }

    gcalIsSyncing = true;
    setLiveSyncButtonState(true, `Pushing 0/${tasksToSync.length}...`);
    showToast(`Pushing ${tasksToSync.length} task(s) directly to Google Calendar...`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < tasksToSync.length; i++) {
        const task = tasksToSync[i];
        setLiveSyncButtonState(true, `Pushing ${i + 1}/${tasksToSync.length}...`);

        try {
            const res = await pushSingleTaskToGoogleCalendarAPI(task, gcalAccessToken);
            if (res && res.id) {
                task.gcalEventId = res.id;
                task.gcalSyncedAt = Date.now();
                successCount++;
            } else {
                failCount++;
            }
        } catch (err) {
            console.error('Direct sync failed for task:', task.title, err);
            if (err.status === 401) {
                gcalAccessToken = null;
                updateGCalAuthBadge();
                setLiveSyncButtonState(false);
                showToast('Google session expired. Re-authorizing...');
                triggerRealTimeSync(singleTaskId);
                return;
            }
            failCount++;
        }
    }

    saveTasks();
    renderTasks();
    gcalIsSyncing = false;
    setLiveSyncButtonState(false, 'Synced!');
    playChimeSound(660, 880);

    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (gcalLiveSyncStatus) {
        gcalLiveSyncStatus.textContent = `GCal Synced at ${nowTimeStr}`;
    }
    if (gcalLiveSyncDot) {
        gcalLiveSyncDot.style.background = '#10b981';
    }

    if (failCount === 0) {
        showToast(`✅ Successfully pushed ${successCount} task(s) to Google Calendar!`);
    } else {
        showToast(`Pushed ${successCount} task(s) (${failCount} failed).`);
    }

    updateGCalAuthBadge();
}

async function pushSingleTaskToGoogleCalendarAPI(task, token) {
    const [y, m, d] = task.date.split('-').map(Number);
    let start, end;

    if (task.startTime && task.duration !== 'Full day') {
        const [h, min] = task.startTime.split(':').map(Number);
        const startDate = new Date(y, m - 1, d, h, min, 0);
        const durMins = getDurationMinutes(task.duration);
        const endDate = new Date(startDate.getTime() + durMins * 60 * 1000);
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        start = { dateTime: startDate.toISOString(), timeZone };
        end = { dateTime: endDate.toISOString(), timeZone };
    } else {
        const startDateStr = task.date;
        const nextDay = new Date(y, m - 1, d + 1);
        const nextDayStr = getLocalDateString(nextDay);
        start = { date: startDateStr };
        end = { date: nextDayStr };
    }

    const description = [
        `👤 Assigned to: ${task.person || 'Unassigned'}`,
        task.startTime ? `⏰ Scheduled Time: ${task.startTime}` : null,
        task.duration ? `⏳ Duration: ${task.duration}` : null,
        task.reminder ? `🔔 Reminder: ${task.reminder}` : null,
        '\nSynced from Task Matrix Family Planner'
    ].filter(Boolean).join('\n');

    const eventPayload = {
        summary: task.title,
        description: description,
        start: start,
        end: end,
        reminders: task.reminder ? {
            useDefault: false,
            overrides: [{ method: 'popup', minutes: 15 }]
        } : { useDefault: true }
    };

    let url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
    let method = 'POST';

    if (task.gcalEventId) {
        url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${task.gcalEventId}`;
        method = 'PUT';
    }

    const res = await fetch(url, {
        method: method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventPayload)
    });

    if (!res.ok) {
        const err = new Error(`Google Calendar API Error: ${res.statusText}`);
        err.status = res.status;
        throw err;
    }

    return await res.json();
}

function setLiveSyncButtonState(isSyncing, customText) {
    const btns = [headerGcalSyncBtn, footerDirectSyncBtn, btnModalDirectPush].filter(Boolean);
    btns.forEach(btn => {
        if (isSyncing) {
            btn.classList.add('syncing');
            btn.disabled = true;
        } else {
            btn.classList.remove('syncing');
            btn.disabled = false;
        }
    });

    if (headerGcalSyncText) {
        headerGcalSyncText.textContent = isSyncing ? (customText || 'Syncing...') : 'Sync GCal';
    }
    if (footerDirectSyncText) {
        footerDirectSyncText.textContent = isSyncing ? (customText || 'Pushing to GCal...') : 'Push to Google Calendar';
    }
    if (btnModalPushText) {
        btnModalPushText.textContent = isSyncing ? (customText || 'Pushing to Google Calendar...') : 'Push All Active Tasks to Google Calendar';
    }
}
