// Get references to DOM elements
const taskList = document.getElementById('task-list');
const addTaskButton = document.getElementById('add-task-button');
const newTaskNameInput = document.getElementById('new-task-name');
const overallProgressBar = document.querySelector('#overall-progress-bar .progress-bar-fill');

let tasks = [];

// Function to initialize the app and render the tasks
function init() {
    loadTasks();
    renderTasks();
}

// Function to render tasks
function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const taskProgress = task.subtasks.length ? getSubtaskProgress(task.subtasks) : task.completed ? 100 : 0;
        const progressBarColor = getProgressBarColor(taskProgress);
        const taskItem = document.createElement('li');
        taskItem.className = 'task';
        taskItem.innerHTML = `
            <div class="task-header">
                <span class="arrow" onclick="toggleSubtaskVisibility(${task.id})">${task.expanded ? '&#x293B;' : '&#x293C;'}</span>
                <input type="checkbox" class="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
                <span class="task-name ${task.completed ? 'task-completed' : ''}">${capitalizeFirstLetter(task.title)}</span>
                <div class="progress-bar-container">
                    <div class="progress-bar">
                        <div class="progress-bar-fill" style="width: ${taskProgress}%; background-color: ${progressBarColor};" data-percentage="${taskProgress}">
                            ${taskProgress === 0 ? '' : `<span class="progress-bar-percentage">${taskProgress}%</span>`}
                        </div>
                    </div>
                </div>
                <button class="add-subtask" onclick="addSubtask(${task.id})">Add Subtask</button>
                <button class="delete-button" onclick="deleteTask(${task.id})">Delete</button>
            </div>
            <ul class="subtask-list" id="subtask-list-${task.id}" style="display: ${task.expanded ? 'block' : 'none'};">
                ${task.subtasks.map(subtask => `
                    <li class="subtask">
                        <input type="checkbox" class="subtask-checkbox" ${subtask.completed ? 'checked' : ''} onchange="toggleSubtask(${task.id}, ${subtask.id})">
                        <span class="${subtask.completed ? 'task-completed' : ''}">${capitalizeFirstLetter(subtask.title)}</span>
                        <button class="delete-button" onclick="deleteSubtask(${task.id}, ${subtask.id})">Delete</button>
                    </li>`).join('')}
            </ul>
        `;
        taskList.appendChild(taskItem);
    });
    updateOverallProgress();
}

// Function to toggle task completion
function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    task.completed = !task.completed;
    renderTasks();
    saveTasks();
}

// Function to toggle subtask completion and update progress immediately
function toggleSubtask(taskId, subtaskId) {
    const task = tasks.find(t => t.id === taskId);
    const subtask = task.subtasks.find(st => st.id === subtaskId);
    subtask.completed = !subtask.completed;
    updateProgress(task);
    renderTasks(); // Re-render tasks to reflect changes
    saveTasks();
}

// Function to update parent task's progress bar based on subtasks completion
function updateProgress(task) {
    const taskProgress = task.subtasks.length ? getSubtaskProgress(task.subtasks) : task.completed ? 100 : 0;
    task.completed = (taskProgress === 100);
    const progressBarColor = getProgressBarColor(taskProgress);
    const progressBar = document.querySelector(`#subtask-list-${task.id} .progress-bar-fill`);
    if (progressBar) {
        progressBar.style.width = `${taskProgress}%`;
        progressBar.style.backgroundColor = progressBarColor;
        progressBar.innerText = taskProgress === 0 ? '' : `${taskProgress}%`;
    }
}

// Function to get the progress of subtasks
function getSubtaskProgress(subtasks) {
    const completedCount = subtasks.filter(subtask => subtask.completed).length;
    return Math.round((completedCount / subtasks.length) * 100);
}

// Function to control the visibility of subtasks using the arrow button
function toggleSubtaskVisibility(taskId) {
    const task = tasks.find(t => t.id === taskId);
    task.expanded = !task.expanded;
    renderTasks();
}

// Function to add a new task
function addTask() {
    const taskTitle = newTaskNameInput.value.trim();
    if (taskTitle === '') return;
    const newTask = {
        id: Date.now(),
        title: taskTitle,
        completed: false,
        subtasks: [],
        expanded: true
    };
    tasks.push(newTask);
    newTaskNameInput.value = '';
    renderTasks();
    saveTasks();
}

// Function to add a subtask to a task
function addSubtask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    const subtaskTitle = prompt('Enter subtask title:').trim();
    if (subtaskTitle === '') return;
    const newSubtask = {
        id: Date.now(),
        title: subtaskTitle,
        completed: false
    };
    task.subtasks.push(newSubtask);
    renderTasks();
    saveTasks();
}

// Function to delete a task
function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    renderTasks();
    saveTasks();
}

// Function to delete a subtask
function deleteSubtask(taskId, subtaskId) {
    const task = tasks.find(t => t.id === taskId);
    task.subtasks = task.subtasks.filter(st => st.id !== subtaskId);
    renderTasks();
    saveTasks();
}

// Function to capitalize the first letter of the task or subtask name
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to update the overall progress bar
function updateOverallProgress() {
    if (tasks.length === 0) {
        overallProgressBar.style.width = '0%';
        overallProgressBar.style.backgroundColor = getProgressBarColor(0);
        overallProgressBar.innerText = '';
        return;
    }
    const totalSubtasks = tasks.reduce((acc, task) => acc + task.subtasks.length, 0);
    const totalCompletedSubtasks = tasks.reduce((acc, task) => acc + task.subtasks.filter(st => st.completed).length, 0);
    const overallProgress = totalSubtasks ? Math.round((totalCompletedSubtasks / totalSubtasks) * 100) : 0;
    overallProgressBar.style.width = `${overallProgress}%`;
    overallProgressBar.style.backgroundColor = getProgressBarColor(overallProgress);
    overallProgressBar.innerText = overallProgress === 0 ? '' : `${overallProgress}%`;
}

// Function to get the color of the progress bar based on the percentage
function getProgressBarColor(percentage) {
    if (percentage === 0) return '#a9a9a9';
    if (percentage <= 25) return '#2528cb';
    if (percentage <= 50) return '#4c0949';
    if (percentage <= 75) return '#891a22';
    return '#4caf50';
}

// Function to save tasks to local storage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to load tasks from local storage
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
}

// Event listeners
addTaskButton.addEventListener('click', addTask);
document.addEventListener('DOMContentLoaded', init);
