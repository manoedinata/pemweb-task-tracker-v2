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
