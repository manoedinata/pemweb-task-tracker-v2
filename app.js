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

  // status === "ready": render daftar tugas ditambahkan di tahap berikutnya.
}

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

muatData();
