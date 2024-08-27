// Define global variables
const taskList = document.getElementById('task-list');
const addTaskButton = document.getElementById('add-task-button');
const newTaskNameInput = document.getElementById('new-task-name');
const overallProgressBar = document.querySelector('#overall-progress-bar .progress-bar-fill');

let tasks = [];

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
            <ul class="subtask-list" id="subtask-list-${task.id}">
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

// Function to get subtask progress percentage as an integer
function getSubtaskProgress(subtasks) {
    const totalSubtasks = subtasks.length;
    const completedSubtasks = subtasks.filter(st => st.completed).length;
    const progress = totalSubtasks > 0 ? Math.floor((completedSubtasks / totalSubtasks) * 100) : 0;
    return progress;
}

// Function to get progress bar color based on percentage
function getProgressBarColor(percentage) {
    if (percentage === 0) return '#a9a9a9';
    if (percentage <= 25) return '#ffeb3b';
    if (percentage <= 50) return '#ff9800';
    if (percentage <= 75) return '#ff5722';
    return '#4caf50';
}

// Function to toggle task completion
function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    task.completed = !task.completed;
    renderTasks();
    saveTasks();
}

// Function to toggle subtask completion
function toggleSubtask(taskId, subtaskId) {
    const task = tasks.find(t => t.id === taskId);
    const subtask = task.subtasks.find(st => st.id === subtaskId);
    subtask.completed = !subtask.completed;
    renderTasks();
    saveTasks();
}

// Function to delete task
function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    renderTasks();
    saveTasks();
}

// Function to delete subtask
function deleteSubtask(taskId, subtaskId) {
    const task = tasks.find(t => t.id === taskId);
    task.subtasks = task.subtasks.filter(st => st.id !== subtaskId);
    renderTasks();
    saveTasks();
}

// Function to add a new task
function addNewTask() {
    const newTaskName = newTaskNameInput.value.trim();
    if (newTaskName) {
        const newTask = { id: Date.now(), title: newTaskName, completed: false, subtasks: [] };
        tasks.push(newTask);
        renderTasks();
        saveTasks();
        newTaskNameInput.value = '';
    } else {
        alert('Please enter a task name');
    }
}

// Function to add a new subtask
function addSubtask(taskId) {
    const subtaskName = prompt('Enter subtask name:');
    if (subtaskName) {
        const task = tasks.find(t => t.id === taskId);
        const newSubtask = { id: Date.now(), title: subtaskName, completed: false };
        task.subtasks.push(newSubtask);
        renderTasks();
        saveTasks();
    }
}

// Function to update overall progress bar
function updateOverallProgress() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed || getSubtaskProgress(t.subtasks) === 100).length;
    const progress = totalTasks > 0 ? Math.floor((completedTasks / totalTasks) * 100) : 0;
    const progressBarColor = getProgressBarColor(progress);
    overallProgressBar.style.width = `${progress}%`;
    overallProgressBar.style.backgroundColor = progressBarColor;
    overallProgressBar.querySelector('.progress-bar-percentage').innerText = progress === 0 ? '' : `${progress}%`;
}

// Function to save tasks to local storage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to capitalize the first letter of the task name
function capitalizeFirstLetter(string) {
    // Check if the first character is already uppercase
    if (string.length === 0) return string; // Return empty string if input is empty

    // Capitalize the first letter if it's not already uppercase
    return string.charAt(0) === string.charAt(0).toUpperCase()
        ? string // Return the string as is if the first letter is already uppercase
        : string.charAt(0).toUpperCase() + string.slice(1); // Capitalize the first letter and leave the rest unchanged
}


// Load tasks from local storage on page load
window.addEventListener('load', () => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
    renderTasks();
});

// Add event listeners
addTaskButton.addEventListener('click', addNewTask);
newTaskNameInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addNewTask();
    }
});



