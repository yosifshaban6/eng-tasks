console.log("🚀 Eng Tasks Frontend Loaded");

let API_BASE = "/api/v1";

let currentPage = 1;
let currentFilters = {
  status: "",
  priority: "",
  assigneeId: "",
  search: "",
  sortBy: "createdAt",
  sortOrder: "desc",
  limit: 15,
};
let totalPages = 1;
let users = [];

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>]/g, function (m) {
    if (m === "&") return "&amp;";
    if (m === "<") return "&lt;";
    if (m === ">") return "&gt;";
    return m;
  });
}

function getInitials(name) {
  if (!name) return "U";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return date.toLocaleDateString();
}

function isOverdue(dateString) {
  return new Date(dateString) < new Date();
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

async function loadUsers() {
  console.log("📡 Loading users...");
  try {
    const response = await fetch(`${API_BASE}/users`);
    const result = await response.json();

    if (result.success) {
      users = result.data;
      const assigneeFilter = document.getElementById("assigneeFilter");
      if (assigneeFilter) {
        assigneeFilter.innerHTML = '<option value="">All Assignees</option>';
        users.forEach((user) => {
          const option = document.createElement("option");
          option.value = user.id;
          option.textContent = user.name;
          assigneeFilter.appendChild(option);
        });
        console.log(`✅ Loaded ${users.length} users`);
      }
    }
  } catch (error) {
    console.error("❌ Error loading users:", error);
  }
}

async function loadTasks() {
  console.log("📡 Loading tasks...");
  try {
    const params = new URLSearchParams();
    params.append("page", currentPage);
    params.append("limit", currentFilters.limit);

    if (currentFilters.status) params.append("status", currentFilters.status);
    if (currentFilters.priority)
      params.append("priority", currentFilters.priority);
    if (currentFilters.assigneeId)
      params.append("assigneeId", currentFilters.assigneeId);
    if (currentFilters.search) params.append("search", currentFilters.search);
    if (currentFilters.sortBy) params.append("sortBy", currentFilters.sortBy);
    if (currentFilters.sortOrder)
      params.append("sortOrder", currentFilters.sortOrder);

    const response = await fetch(`${API_BASE}/tasks?${params}`);
    const result = await response.json();

    if (result.success) {
      renderTasks(result.data);
      updatePagination(result.meta);
      console.log(`✅ Loaded ${result.data.length} tasks`);
    } else {
      console.error("❌ API error:", result.error);
      const grid = document.getElementById("tasksGrid");
      if (grid)
        grid.innerHTML = `<div class="loading">Error: ${result.error}</div>`;
    }
  } catch (error) {
    console.error("❌ Error loading tasks:", error);
    const grid = document.getElementById("tasksGrid");
    if (grid)
      grid.innerHTML = `<div class="loading">Error loading tasks: ${error.message}</div>`;
  }
}

function renderTasks(tasks) {
  const grid = document.getElementById("tasksGrid");

  if (!grid) {
    console.error("❌ tasksGrid element not found");
    return;
  }

  if (!tasks || tasks.length === 0) {
    grid.innerHTML = '<div class="loading">No tasks found</div>';
    return;
  }

  grid.innerHTML = tasks
    .map(
      (task) => `
        <div class="task-card" onclick="window.location.href='/task/${task.id}'">
            <div class="task-header">
                <div class="task-title">${escapeHtml(task.title)}</div>
            </div>
            <div class="task-description">${escapeHtml(task.description.substring(0, 100))}${task.description.length > 100 ? "..." : ""}</div>
            
            <div class="task-footer">
                <div class="assignee-info">
                    <div class="assignee-avatar">${getInitials(task.assignee?.name)}</div>
                    <div class="assignee-name">${escapeHtml(task.assignee?.name || "Unassigned")}</div>
                </div>
                <div class="due-date ${isOverdue(task.dueDate) ? "overdue" : ""}">
                    📅 ${formatDate(task.dueDate)}
                </div>
            </div>
            <div class="task-meta">
                <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                <span class="status-badge status-${task.status}">${task.status.replace("_", " ")}</span>
                <span class="category-badge">${escapeHtml(task.category)}</span>
            </div>
        </div>
    `,
    )
    .join("");
}

function updatePagination(meta) {
  totalPages = meta.totalPages;
  const pageInfo = document.getElementById("pageInfo");
  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");

  if (pageInfo)
    pageInfo.textContent = `Page ${meta.page} of ${meta.totalPages}`;
  if (prevBtn) prevBtn.disabled = meta.page === 1;
  if (nextBtn) nextBtn.disabled = meta.page === meta.totalPages;
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("🎯 DOM loaded, initializing app...");

  const statusFilter = document.getElementById("statusFilter");
  if (statusFilter) {
    statusFilter.addEventListener("change", (e) => {
      currentFilters.status = e.target.value;
      currentPage = 1;
      loadTasks();
    });
  }

  const priorityFilter = document.getElementById("priorityFilter");
  if (priorityFilter) {
    priorityFilter.addEventListener("change", (e) => {
      currentFilters.priority = e.target.value;
      currentPage = 1;
      loadTasks();
    });
  }

  const assigneeFilter = document.getElementById("assigneeFilter");
  if (assigneeFilter) {
    assigneeFilter.addEventListener("change", (e) => {
      currentFilters.assigneeId = e.target.value;
      currentPage = 1;
      loadTasks();
    });
  }

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener(
      "input",
      debounce((e) => {
        currentFilters.search = e.target.value;
        currentPage = 1;
        loadTasks();
      }, 500),
    );
  }

  const sortBy = document.getElementById("sortBy");
  if (sortBy) {
    sortBy.addEventListener("change", (e) => {
      currentFilters.sortBy = e.target.value;
      loadTasks();
    });
  }

  const sortOrder = document.getElementById("sortOrder");
  if (sortOrder) {
    sortOrder.addEventListener("change", (e) => {
      currentFilters.sortOrder = e.target.value;
      loadTasks();
    });
  }

  const prevPage = document.getElementById("prevPage");
  if (prevPage) {
    prevPage.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        loadTasks();
      }
    });
  }

  const nextPage = document.getElementById("nextPage");
  if (nextPage) {
    nextPage.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        loadTasks();
      }
    });
  }

  loadUsers();
  loadTasks();
});

window.loadTasks = loadTasks;
