const appShell = document.querySelector(".app-shell");
const sidebarToggle = document.querySelector("#sidebarToggle");
const emptyState = document.querySelector("#emptyState");
const emptyAddButton = document.querySelector("#emptyAddButton");
const taskList = document.querySelector("#taskList");
const sidebarTaskCount = document.querySelector("#sidebarTaskCount");
const sidebarCompletedCount = document.querySelector("#sidebarCompletedCount");
const navItems = document.querySelectorAll(".nav-item[data-view]");
const taskHeading = document.querySelector("#taskHeading");
const showAddFormButton = document.querySelector("#showAddForm");
const addPrompt = document.querySelector("#addPrompt");
const addForm = document.querySelector("#addForm");
const cancelAddTask = document.querySelector("#cancelAddTask");
const taskTitleInput = document.querySelector("#taskTitleInput");
const taskDescriptionInput = document.querySelector("#taskDescriptionInput");
const taskDueDateInput = document.querySelector("#taskDueDateInput");
const dueDateText = document.querySelector("#dueDateText");
const dateField = document.querySelector("#dateField");

const storageKey = "day2day-tasks";

let tasks = loadTasks();
let currentView = "tasks";

if (window.matchMedia("(max-width: 720px)").matches) {
  appShell.classList.add("sidebar-collapsed");
  sidebarToggle.setAttribute("aria-expanded", "false");
}

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(storageKey, JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";
  const activeTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);
  const visibleTasks = currentView === "completed" ? completedTasks : activeTasks;
  const isCompletedView = currentView === "completed";

  visibleTasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.className = "task-check";
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", task.completed ? `Move ${task.title} back to tasks` : `Mark ${task.title} complete`);
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const content = document.createElement("div");
    content.className = "task-content";

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;

    content.append(title);

    if (task.description) {
      const description = document.createElement("p");
      description.className = "task-description";
      description.textContent = task.description;
      content.append(description);
    }

    if (task.dueDate) {
      const dueDate = document.createElement("span");
      dueDate.className = "task-due";
      dueDate.innerHTML = `<span aria-hidden="true"></span>${formatDate(task.dueDate)}`;
      content.append(dueDate);
    }

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", `Delete ${task.title}`);
    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter((candidate) => candidate.id !== task.id);
      saveTasks();
      renderTasks();
    });

    item.append(checkbox, content, deleteButton);
    taskList.append(item);
  });

  taskHeading.textContent = isCompletedView ? "Completed" : "My List";
  emptyState.classList.toggle("hidden", isCompletedView || visibleTasks.length > 0);
  taskList.classList.toggle("hidden", visibleTasks.length === 0);
  addPrompt.classList.toggle("hidden", isCompletedView || activeTasks.length === 0);
  addForm.classList.add("hidden");
  sidebarTaskCount.textContent = activeTasks.length;
  sidebarTaskCount.setAttribute("aria-label", `${activeTasks.length} active ${activeTasks.length === 1 ? "task" : "tasks"}`);
  sidebarCompletedCount.textContent = completedTasks.length;
  sidebarCompletedCount.setAttribute("aria-label", `${completedTasks.length} completed ${completedTasks.length === 1 ? "task" : "tasks"}`);

  navItems.forEach((item) => {
    const isActive = item.dataset.view === currentView;
    item.classList.toggle("active", isActive);
    if (isActive) {
      item.setAttribute("aria-current", "page");
    } else {
      item.removeAttribute("aria-current");
    }
  });
}

function formatDate(value) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function showAddForm() {
  emptyState.classList.add("hidden");
  addPrompt.classList.add("hidden");
  addForm.classList.remove("hidden");
  taskTitleInput.focus();
}

function hideAddForm() {
  addForm.classList.add("hidden");
  addPrompt.classList.toggle("hidden", currentView === "completed" || tasks.filter((task) => !task.completed).length === 0);
  taskTitleInput.value = "";
  taskDescriptionInput.value = "";
  taskDueDateInput.value = "";
  updateDueDateText();
}

sidebarToggle.addEventListener("click", () => {
  const isCollapsed = appShell.classList.toggle("sidebar-collapsed");
  sidebarToggle.setAttribute("aria-expanded", String(!isCollapsed));
});

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    currentView = item.dataset.view;
    hideAddForm();
    renderTasks();
  });
});

emptyAddButton.addEventListener("click", showAddForm);
showAddFormButton.addEventListener("click", showAddForm);
taskDueDateInput.addEventListener("change", updateDueDateText);
dateField.addEventListener("click", () => {
  if (typeof taskDueDateInput.showPicker === "function") {
    taskDueDateInput.showPicker();
  } else {
    taskDueDateInput.focus();
  }
});
cancelAddTask.addEventListener("click", () => {
  hideAddForm();
  renderTasks();
});

addForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = taskTitleInput.value.trim();
  const description = taskDescriptionInput.value.trim();
  const dueDate = taskDueDateInput.value;

  if (!title) {
    taskTitleInput.focus();
    return;
  }

  tasks.push({
    id: crypto.randomUUID(),
    title,
    description,
    dueDate,
    completed: false,
  });

  saveTasks();
  hideAddForm();
  renderTasks();
});

renderTasks();
updateDueDateText();

function updateDueDateText() {
  dueDateText.textContent = taskDueDateInput.value ? formatDate(taskDueDateInput.value) : "Due Date";
}
