// Task Tracker Kuliah v2 — state & DOM refs
const form = document.getElementById("task-form");
const judulInput = document.getElementById("judul");
const matkulSelect = document.getElementById("matkul");
const deadlineInput = document.getElementById("deadline");
const submitBtn = document.getElementById("submit-btn");
const formError = document.getElementById("form-error");
const actionError = document.getElementById("action-error");
const searchInput = document.getElementById("search");
const statusBox = document.getElementById("status-box");
const taskList = document.getElementById("task-list");
const emptyMessage = document.getElementById("empty-message");
const counter = document.getElementById("counter");
const filterButtons = document.querySelectorAll(".filter-btn");

const state = {
  status: "loading", // "loading" | "error" | "ready"
  errorMsg: "",
  tasks: [],
  filter: "semua",
  search: "",
};

const pendingIds = new Set(); // id tugas yang sedang diproses (cegah double request)

// Helper fetch: selalu kirim/terima JSON, lempar Error berisi pesan server.
async function api(url, opsi = {}) {
  const init = { method: opsi.method || "GET" };
  if (opsi.body !== undefined) {
    init.headers = { "Content-Type": "application/json" };
    init.body = JSON.stringify(opsi.body);
  }

  let res;
  try {
    res = await fetch(url, init);
  } catch {
    throw new Error("Tidak dapat terhubung ke server. Periksa koneksi internet.");
  }

  if (!res.ok) {
    let pesan = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (data && data.error) pesan = data.error;
    } catch {
      // body bukan JSON, pakai pesan default
    }
    throw new Error(pesan);
  }

  return res.status === 204 ? null : res.json();
}

function populateMatkulSelect(daftarMatkul) {
  matkulSelect.innerHTML = "";
  daftarMatkul.forEach((m) => matkulSelect.append(new Option(m.nama, m.nama)));
  matkulSelect.disabled = false;
}

function render() {
  statusBox.innerHTML = "";

  if (state.status === "loading") {
    const p = document.createElement("p");
    p.className = "loading-text";
    p.textContent = "⏳ Memuat tugas dari server…";
    statusBox.appendChild(p);

    taskList.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      const li = document.createElement("li");
      li.className = "skeleton-item";
      taskList.appendChild(li);
    }
    emptyMessage.hidden = true;
    counter.textContent = "";
    return;
  }

  if (state.status === "error") {
    const box = document.createElement("div");
    box.className = "error-box";

    const span = document.createElement("span");
    span.textContent = "Gagal memuat: " + state.errorMsg;

    const retryBtn = document.createElement("button");
    retryBtn.type = "button";
    retryBtn.className = "retry-btn";
    retryBtn.id = "retry-btn";
    retryBtn.textContent = "↻ Coba lagi";

    box.appendChild(span);
    box.appendChild(retryBtn);
    statusBox.appendChild(box);

    taskList.innerHTML = "";
    emptyMessage.hidden = true;
    counter.textContent = "";
    return;
  }

  // status === "ready"
  const visible = getVisibleTasks();

  taskList.innerHTML = "";
  visible.forEach((task) => taskList.appendChild(buildTaskItem(task)));
  emptyMessage.hidden = visible.length !== 0;

  const aktifCount = state.tasks.filter((t) => !t.selesai).length;
  counter.textContent = `${aktifCount} tugas aktif`;
}

function getVisibleTasks() {
  let visible = state.tasks;

  if (state.filter === "aktif") visible = visible.filter((t) => !t.selesai);
  if (state.filter === "selesai") visible = visible.filter((t) => t.selesai);

  if (state.search) {
    visible = visible.filter((t) => t.judul.toLowerCase().includes(state.search));
  }

  return [...visible].sort((a, b) => a.deadline.localeCompare(b.deadline));
}

function buildTaskItem(task) {
  const busy = pendingIds.has(task.id);
  const li = document.createElement("li");
  li.className = "task-item" + (task.selesai ? " selesai" : "") + (busy ? " busy" : "");
  li.dataset.id = task.id;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "toggle-checkbox";
  checkbox.checked = task.selesai;
  checkbox.disabled = busy;

  const info = document.createElement("div");
  info.className = "task-info";

  const title = document.createElement("span");
  title.className = "task-title";
  title.textContent = task.judul;

  const meta = document.createElement("span");
  meta.className = "task-meta";
  meta.textContent = `${task.matkul} · deadline ${task.deadline}`;

  info.appendChild(title);
  info.appendChild(meta);

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "×";
  deleteBtn.disabled = busy;
  deleteBtn.setAttribute("aria-label", "Hapus tugas");

  li.appendChild(checkbox);
  li.appendChild(info);
  li.appendChild(deleteBtn);

  return li;
}

function showFormError(message) {
  if (!message) {
    formError.hidden = true;
    formError.textContent = "";
    return;
  }
  formError.hidden = false;
  formError.textContent = message;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const judul = judulInput.value.trim();
  const matkul = matkulSelect.value;
  const deadline = deadlineInput.value;

  if (judul.length < 3) {
    showFormError("Judul tugas minimal 3 karakter.");
    return;
  }

  if (!deadline) {
    showFormError("Deadline wajib diisi.");
    return;
  }

  showFormError(null);
  submitBtn.disabled = true;
  const originalLabel = submitBtn.textContent;
  submitBtn.textContent = "Menyimpan…";

  try {
    const baru = await api("/api/tugas", { method: "POST", body: { judul, matkul, deadline } });
    state.tasks.push(baru);
    form.reset();
    judulInput.focus();
    render();
  } catch (err) {
    showFormError(err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalLabel;
  }
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    state.filter = btn.dataset.filter;
    filterButtons.forEach((b) => b.classList.toggle("on", b === btn));
    render();
  });
});

function showActionError(message) {
  if (!message) {
    actionError.hidden = true;
    actionError.textContent = "";
    return;
  }
  actionError.hidden = false;
  actionError.textContent = message;
}

taskList.addEventListener("click", async (e) => {
  const li = e.target.closest(".task-item");
  if (!li) return;
  const id = Number(li.dataset.id);
  const task = state.tasks.find((t) => t.id === id);
  if (!task || pendingIds.has(id)) return;

  if (e.target.classList.contains("delete-btn")) {
    showActionError(null);
    const snapshot = state.tasks;
    pendingIds.add(id);
    state.tasks = state.tasks.filter((t) => t.id !== id); // optimistic
    render();
    try {
      await api(`/api/tugas/${id}`, { method: "DELETE" });
    } catch (err) {
      state.tasks = snapshot; // batalkan jika server gagal
      showActionError("Gagal menghapus: " + err.message);
    } finally {
      pendingIds.delete(id);
      render();
    }
    return;
  }

  if (e.target.classList.contains("toggle-checkbox")) {
    showActionError(null);
    const prevSelesai = task.selesai;
    pendingIds.add(id);
    task.selesai = e.target.checked; // optimistic
    render();
    try {
      const updated = await api(`/api/tugas/${id}`, { method: "PATCH", body: { selesai: task.selesai } });
      Object.assign(task, updated);
    } catch (err) {
      task.selesai = prevSelesai; // batalkan jika server gagal
      showActionError("Gagal memperbarui: " + err.message);
    } finally {
      pendingIds.delete(id);
      render();
    }
  }
});

statusBox.addEventListener("click", (e) => {
  if (e.target.id === "retry-btn") muatData();
});

async function muatData() {
  state.status = "loading";
  state.errorMsg = "";
  render();

  try {
    const [tugas, matkul] = await Promise.all([api("/api/tugas"), api("/api/matkul")]);
    state.tasks = tugas;
    populateMatkulSelect(matkul);
    state.status = "ready";
  } catch (err) {
    state.status = "error";
    state.errorMsg = err.message;
  }

  render();
}

let searchTimer = null;
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.search = searchInput.value.trim().toLowerCase();
    if (state.status === "ready") render();
  }, 300);
});

muatData();
