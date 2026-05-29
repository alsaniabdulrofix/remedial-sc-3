/**
 * SmartTask Engine - Client-Side State Manager
 * Dirancang dengan pola IIFE untuk enkapsulasi modul penuh, manipulasi DOM aman,
 * dan manajemen memori berbasis pendelegasian peristiwa.
 */
(function () {
  "use strict";

  // 1. Elemen Pointer Terlokalisasi (Seleksi Tunggal demi Performa) [10, 12]
  const taskForm = document.getElementById("smartTaskForm");
  const taskInput = document.getElementById("taskInputField");
  const taskContainer = document.getElementById("taskContainer");
  const filterContainer = document.getElementById("filterContainer");
  
  const metricTotal = document.getElementById("metricTotal");
  const metricActive = document.getElementById("metricActive");
  const metricCompleted = document.getElementById("metricCompleted");

  // 2. Variabel Keadaan (State) Terekapsulasi [6, 7]
  let state = {
    tasks: JSON.parse(localStorage.getItem("smart_tasks")) || [] ,
    currentFilter: "all" // Pilihan filter: 'all' | 'active' | 'completed' 
  };

  /**
   * Menserialisasikan state teraktual ke penyimpanan browser.
   */
  function syncLocalStorage() {
    localStorage.setItem("smart_tasks", JSON.stringify(state.tasks));
  }

  /**
   * Menghitung nilai analitis berdasarkan state internal.
   */
  function updateMetrics() {
    const total = state.tasks.length;
    const completed = state.tasks.filter(t => t.done).length;
    const active = total - completed; // Rumus: M_active = M_total - M_completed 

    metricTotal.textContent = total;
    metricActive.textContent = active;
    metricCompleted.textContent = completed;
  }

  /**
   * Memproses penyaringan visual state sebelum merender.
   * @returns {Array} Array objek tugas yang telah disaring.
   */
  function getFilteredTasks() {
    switch (state.currentFilter) {
      case "active":
        return state.tasks.filter(t =>!t.done);
      case "completed":
        return state.tasks.filter(t => t.done);
      default:
        return state.tasks;
    }
  }

  /**
   * Merender representasi visual state ke dalam pohon DOM secara aman.[1, 13, 14]
   * Pendekatan pembuatan node murni digunakan untuk meniadakan potensi XSS.
   */
  function render() {
    // Pengosongan container secara bersih [6, 13]
    taskContainer.innerHTML = "";
    
    // Sinkronisasi metrik numerik 
    updateMetrics();

    const tasksToRender = getFilteredTasks();

    if (tasksToRender.length === 0) {
      const emptyNode = document.createElement("li");
      emptyNode.style.textAlign = "center";
      emptyNode.style.padding = "2rem";
      emptyNode.style.color = "#64748b";
      emptyNode.textContent = "Tidak ada rencana kerja dalam daftar ini.";
      taskContainer.appendChild(emptyNode);
      return;
    }

    // Rekayasa DOM Secara Deklaratif & Aman 
    tasksToRender.forEach(task => {
      const li = document.createElement("li");
      li.className = `task-node ${task.done? "completed" : ""}`;

      const innerDiv = document.createElement("div");
      innerDiv.className = "task-inner";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.done;
      checkbox.className = "toggle-checkbox";
      checkbox.dataset.id = task.id; // Menyimpan ID unik untuk event delegation [6, 16]
      checkbox.id = `chk-${task.id}`;

      const label = document.createElement("label");
      label.setAttribute("for", `chk-${task.id}`);
      label.textContent = task.title; // Manipulasi aman melalui textContent (Mitigasi XSS) 

      innerDiv.appendChild(checkbox);
      innerDiv.appendChild(label);

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "destroy-btn";
      deleteBtn.textContent = "Hapus";
      deleteBtn.dataset.id = task.id; // Menyimpan ID unik untuk event delegation [6, 16]

      li.appendChild(innerDiv);
      li.appendChild(deleteBtn);

      taskContainer.appendChild(li); // Penyisipan elemen tunggal yang aman [13]
    });
  }

  /**
   * Menangani penambahan entitas tugas baru.
   * @param {Event} event - Peristiwa submit form.
   */
  function handleAddTask(event) {
    event.preventDefault(); // Menghentikan penyegaran halaman [6, 13]

    const textValue = taskInput.value.trim();
    if (!textValue) return;

    const newTask = {
      id: Date.now(), // ID Unik berbasis waktu milidetik [6, 7]
      title: textValue,
      done: false,
      createdAt: new Date().toISOString()
    };

    state.tasks.push(newTask);
    syncLocalStorage();
    render();
    
    taskForm.reset(); // Mengosongkan form input 
    taskInput.focus(); // Mengembalikan fokus ke bidang input [13]
  }

  /**
   * Mengatur interaksi klik di dalam container daftar tugas via Event Delegation.
   * Meminimalkan konsumsi memori dengan hanya mengikat satu event listener tunggal.
   * @param {Event} event - Peristiwa klik yang menggelembung ke kontainer induk.
   */
  function handleContainerClick(event) {
    const target = event.target;

    // Skenario 1: Klik Checkbox Status Selesai 
    if (target.classList.contains("toggle-checkbox")) {
      const id = parseInt(target.dataset.id, 10);
      state.tasks = state.tasks.map(t => {
        if (t.id === id) {
          return {...t, done:!t.done };
        }
        return t;
      });
      syncLocalStorage();
      render();
    }

    // Skenario 2: Klik Tombol Hapus [10, 13]
    if (target.classList.contains("destroy-btn")) {
      const id = parseInt(target.dataset.id, 10);
      state.tasks = state.tasks.filter(t => t.id!== id);
      syncLocalStorage();
      render();
    }
  }

  /**
   * Menangani perpindahan filter status visual.
   * @param {Event} event - Peristiwa klik pada filter.
   */
  function handleFilterClick(event) {
    const target = event.target;
    if (!target.classList.contains("filter-btn")) return;

    // Sinkronisasi kelas visual tombol aktif
    const activeBtn = filterContainer.querySelector(".filter-btn.active");
    if (activeBtn) activeBtn.classList.remove("active");
    target.classList.add("active");

    // Perbarui state filter dan render ulang UI 
    state.currentFilter = target.dataset.filter;
    render();
  }

  // 3. Registrasi Pengikat Peristiwa Terpusat [6, 17]
  taskForm.addEventListener("submit", handleAddTask);
  taskContainer.addEventListener("click", handleContainerClick); // Satu listener menangani seluruh baris [16, 17]
  filterContainer.addEventListener("click", handleFilterClick);

  // 4. Rendering Awal saat Inisialisasi Aplikasi Selesai 
  render();
})();