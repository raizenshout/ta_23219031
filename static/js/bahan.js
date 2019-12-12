/**
 * JavaScript file for the Notes page
 */

/* jshint esversion: 8 */

/**
 * This is the model class which provides access to the server REST API
 * @type {{}}
 */
class Model {
    async read(resep_id) {
        let options = {
            method: "GET",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json"
            }
        };
        // Call the REST endpoint and wait for data
        let response = await fetch(`/api/resep/${resep_id}`, options);
        let data = await response.json();
        return data;
    }

    async readOne(resep_id, bahan_id) {
        let options = {
            method: "GET",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "accepts": "application/json"
            }
        };
        // Call the REST endpoint and wait for data
        let response = await fetch(`/api/resep/${resep_id}/bahan/${bahan_id}`, options);
        let data = await response.json();
        return data;
    }

    async create(resep_id, bahan) {
        let options = {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "accepts": "application/json"
            },
            body: JSON.stringify(bahan)
        };
        // Call the REST endpoint and wait for data
        let response = await fetch(`/api/resep/${resep_id}/bahan`, options);
        let data = await response.json();
        return data;
    }

    async update(resep_id, bahan) {
        let options = {
            method: "PUT",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "accepts": "application/json"
            },
            body: JSON.stringify(bahan)
        };
        // Call the REST endpoint and wait for data
        let response = await fetch(`/api/resep/${resep_id}/bahan/${bahan.bahan_id}`, options);
        let data = await response.json();
        return data;
    }

    async delete(resep_id, bahan_id) {
        let options = {
            method: "DELETE",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "accepts": "application/json"
            }
        };
        // Call the REST endpoint and wait for data
        let response = await fetch(`/api/resep/${resep_id}/bahan/${bahan_id}`, options);
        return response;
    }
}


/**
 * This is the view class which provides access to the DOM
 */
class View {
    constructor() {
        this.NEW_BAHAN = 0;
        this.EXISTING_BAHAN = 1;
        this.table = document.querySelector(".bahan table");
        this.error = document.querySelector(".error");
        this.resep_id = document.getElementById("resep_id");
        this.nama_resep = document.getElementById("nama_resep");
        this.penulis = document.getElementById("penulis");
        this.tags = document.getElementById("tags");
        this.timestamp = document.getElementById("timestamp");
        this.bahan_id = document.getElementById("bahan_id");
        this.nama_bahan = document.getElementById("nama_bahan");
        this.kuantitas = document.getElementById("kuantitas");
        this.satuan = document.getElementById("satuan");
        this.createButton = document.getElementById("create");
        this.updateButton = document.getElementById("update");
        this.deleteButton = document.getElementById("delete");
        this.resetButton = document.getElementById("reset");
    }

    reset() {
        this.bahan_id.textContent = "";
        this.nama_bahan.value = "";
        this.kuantitas.value = "";
        this.satuan.value = "";
        this.nama_bahan.focus();
    }

    updateEditor(bahan) {
        this.bahan_id.textContent = bahan.bahan_id;
        this.nama_bahan.value = bahan.nama_bahan;
        this.kuantitas.value = bahan.kuantitas;
        this.satuan.value = bahan.satuan;
        this.nama_bahan.focus();
    }

    setButtonState(state) {
        if (state === this.NEW_BAHAN) {
            this.createButton.disabled = false;
            this.updateButton.disabled = true;
            this.deleteButton.disabled = true;
        } else if (state === this.EXISTING_BAHAN) {
            this.createButton.disabled = true;
            this.updateButton.disabled = false;
            this.deleteButton.disabled = false;
        }
    }

    buildTable(resep) {
        let tbody,
            html = "";

        // Update the resep data
        this.resep_id.textContent = resep.resep_id;
        this.nama_resep.textContent = resep.nama_resep;
        this.penulis.textContent = resep.penulis;
        this.tags.textContent = resep.tags;
        this.timestamp.textContent = resep.timestamp;

        // Iterate over the bahan and build the table
        resep.bahan.forEach((bahan) => {
            html += `
            <tr data-bahan_id="${bahan.bahan_id}" data-nama_bahan="${bahan.nama_bahan}" data-kuantitas="${bahan.kuantitas}" data-satuan="${bahan.satuan}">
                <td class="timestamp">${bahan.timestamp}</td>
                <td class="nama_bahan">${bahan.nama_bahan}</td>
                <td class="kuantitas">${bahan.kuantitas}</td>
                <td class="satuan">${bahan.satuan}</td>
            </tr>`;
        });
        // Is there currently a tbody in the table?
        if (this.table.tBodies.length !== 0) {
            this.table.removeChild(this.table.getElementsByTagName("tbody")[0]);
        }
        // Update tbody with our new content
        tbody = this.table.createTBody();
        tbody.innerHTML = html;
    }

    errorMessage(error_msg) {
        let error = document.querySelector(".error");

        error.innerHTML = error_msg;
        error.classList.add("visible");
        error.classList.remove("hidden");
        setTimeout(() => {
            error.classList.add("hidden");
            error.classList.remove("visible");
        }, 2000);
    }
}


/**
 * This is the controller class for the user interaction
 */
class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.initialize();
    }

    async initialize() {
        await this.initializeTable();
        this.initializeTableEvents();
        this.initializeCreateEvent();
        this.initializeUpdateEvent();
        this.initializeDeleteEvent();
        this.initializeResetEvent();
    }

    async initializeTable() {
        try {
            let urlResepId = +document.getElementById("url_resep_id").value,
                urlBahanId = +document.getElementById("url_bahan_id").value,
                resep = await this.model.read(urlResepId);

            this.view.buildTable(resep);

            // Did we navigate here with a bahan selected?
            if (urlBahanId) {
                let bahan = await this.model.readOne(urlResepId, urlBahanId);
                this.view.updateEditor(bahan);
                this.view.setButtonState(this.view.EXISTING_BAHAN);

            // Otherwise, nope, so leave the editor blank
            } else {
                this.view.reset();
                this.view.setButtonState(this.view.NEW_BAHAN);
            }
            this.initializeTableEvents();
        } catch (err) {
            this.view.errorMessage(err);
        }
    }

    initializeTableEvents() {
        document.querySelector("table tbody").addEventListener("click", (evt) => {
            let target = evt.target.parentElement,
                bahan_id = target.getAttribute("data-bahan_id"),
                nama_bahan = target.getAttribute("data-nama_bahan"),
                kuantitas = target.getAttribute("data-kuantitas"),
                satuan = target.getAttribute("data-satuan");

            this.view.updateEditor({
                bahan_id: bahan_id,
                nama_bahan: nama_bahan,
                kuantitas: kuantitas,
                satuan: satuan
            });
            this.view.setButtonState(this.view.EXISTING_BAHAN);
        });
    }

    initializeCreateEvent() {
        document.getElementById("create").addEventListener("click", async (evt) => {
            let urlResepId = +document.getElementById("resep_id").textContent,
                nama_bahan = document.getElementById("nama_bahan").value,
                kuantitas = document.getElementById("kuantitas").value,
                satuan = document.getElementById("satuan").value;

            evt.preventDefault();
            try {
                await this.model.create(urlResepId, {
                    nama_bahan: nama_bahan,
                    kuantitas: kuantitas,
                    satuan: satuan
                });
                await this.initializeTable();
            } catch(err) {
                this.view.errorMessage(err);
            }
        });
    }

    initializeUpdateEvent() {
        document.getElementById("update").addEventListener("click", async (evt) => {
            let resep_id = +document.getElementById("resep_id").textContent,
                bahan_id = +document.getElementById("bahan_id").textContent,
                nama_bahan = document.getElementById("nama_bahan").value,
                kuantitas = parseInt(document.getElementById("kuantitas").value, 10),
                satuan = document.getElementById("satuan").value;

            evt.preventDefault();
            try {
                await this.model.update(resep_id, {
                    resep_id: resep_id,
                    bahan_id: bahan_id,
                    nama_bahan: nama_bahan,
                    kuantitas: kuantitas,
                    satuan: satuan
                });
                await this.initializeTable();
            } catch(err) {
                this.view.errorMessage(err);
            }
        });
    }

    initializeDeleteEvent() {
        document.getElementById("delete").addEventListener("click", async (evt) => {
            let resep_id = +document.getElementById("resep_id").textContent,
                bahan_id = +document.getElementById("bahan_id").textContent;

            evt.preventDefault();
            try {
                await this.model.delete(resep_id, bahan_id);
                await this.initializeTable();
            } catch(err) {
                this.view.errorMessage(err);
            }
        });
    }

    initializeResetEvent() {
        document.getElementById("reset").addEventListener("click", async (evt) => {
            evt.preventDefault();
            this.view.reset();
            this.view.setButtonState(this.view.NEW_BAHAN);
        });
    }
}

// Create the MVC components
const model = new Model();
const view = new View();
const controller = new Controller(model, view);

// export the MVC components as the default
export default {
    model,
    view,
    controller
};
