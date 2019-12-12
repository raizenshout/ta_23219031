/**
 * JavaScript file for the People page
 */

/* jshint esversion: 8 */

/**
 * This is the model class which provides access to the server REST API
 * @type {{}}
 */
class Model {
    async read() {
        let options = {
            method: "GET",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "accepts": "application/json"
            }
        };
        // Call the REST endpoint and wait for data
        let response = await fetch("/api/resep", options);
        let data = await response.json();
        return data;
    }

    async readOne(resep_id) {
        let options = {
            method: "GET",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "accepts": "application/json"
            }
        };
        // Call the REST endpoint and wait for data
        let response = await fetch(`/api/resep/${resep_id}`, options);
        let data = await response.json();
        return data;
    }

    async create(resep) {
        let options = {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "accepts": "application/json"
            },
            body: JSON.stringify(resep)
        };
        // Call the REST endpoint and wait for data
        let response = await fetch(`/api/resep`, options);
        let data = await response.json();
        return data;
    }

    async update(resep) {
        let options = {
            method: "PUT",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "accepts": "application/json"
            },
            body: JSON.stringify(resep)
        };
        // Call the REST endpoint and wait for data
        let response = await fetch(`/api/resep/${resep.resep_id}`, options);
        let data = await response.json();
        return data;
    }

    async delete(resep_id) {
        let options = {
            method: "DELETE",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "accepts": "application/json"
            }
        };
        // Call the REST endpoint and wait for data
        let response = await fetch(`/api/resep/${resep_id}`, options);
        return response;
    }
}


/**
 * This is the view class which provides access to the DOM
 */
class View {
    constructor() {
        this.NEW_RESEP = 0;
        this.EXISTING_BAHAN = 1;
        this.table = document.querySelector(".resep table");
        this.error = document.querySelector(".error");
        this.resep_id = document.getElementById("resep_id");
        this.nama_resep = document.getElementById("nama_resep");
        this.penulis = document.getElementById("penulis");
        this.tags = document.getElementById("tags");
        this.createButton = document.getElementById("create");
        this.updateButton = document.getElementById("update");
        this.deleteButton = document.getElementById("delete");
        this.resetButton = document.getElementById("reset");
    }

    reset() {
        this.resep_id.textContent = "";
        this.nama_resep.value = "";
        this.penulis.value = "";
        this.tags.value = "";
        this.nama_resep.focus();
    }

    updateEditor(resep) {
        this.resep_id.textContent = resep.resep_id;
        this.nama_resep.value = resep.nama_resep;
        this.penulis.value = resep.penulis;
        this.tags.value = resep.tags;
        this.nama_resep.focus();
    }

    setButtonState(state) {
        if (state === this.NEW_RESEP) {
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

        // Iterate over the resep and build the table
        resep.forEach((resep) => {
            html += `
            <tr data-resep_id="${resep.resep_id}" data-nama_resep="${resep.nama_resep}" data-penulis="${resep.penulis}" data-tags="${resep.tags}">
                <td class="timestamp">${resep.timestamp}</td>
                <td class="nama_resep">${resep.nama_resep}</td>
                <td class="penulis">${resep.penulis}</td>
                <td class="tags">${resep.tags}</td>
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

    errorMessage(message) {
        this.error.innerHTML = message;
        this.error.classList.add("visible");
        this.error.classList.remove("hidden");
        setTimeout(() => {
            this.error.classList.add("hidden");
            this.error.classList.remove("visible");
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
                resep = await this.model.read();

            this.view.buildTable(resep);

            // Did we navigate here with a resep selected?
            if (urlResepId) {
                let resep = await this.model.readOne(urlResepId);
                this.view.updateEditor(resep);
                this.view.setButtonState(this.view.EXISTING_BAHAN);

            // Otherwise, nope, so leave the editor blank
            } else {
                this.view.reset();
                this.view.setButtonState(this.view.NEW_RESEP);
            }
            this.initializeTableEvents();
        } catch (err) {
            this.view.errorMessage(err);
        }
    }

    initializeTableEvents() {
        document.querySelector("table tbody").addEventListener("dblclick", (evt) => {
            let target = evt.target,
                parent = target.parentElement;

            evt.preventDefault();

            // Is this the nama_resep td?
            if (target) {
                let resep_id = parent.getAttribute("data-resep_id");

                window.location = `/resep/${resep_id}/bahan`;
            }
        });
        document.querySelector("table tbody").addEventListener("click", (evt) => {
            let target = evt.target.parentElement,
                resep_id = target.getAttribute("data-resep_id"),
                nama_resep = target.getAttribute("data-nama_resep"),
                penulis = target.getAttribute("data-penulis"),
                tags = target.getAttribute("data-tags");

            this.view.updateEditor({
                resep_id: resep_id,
                nama_resep: nama_resep,
                penulis: penulis,
                tags: tags
            });
            this.view.setButtonState(this.view.EXISTING_BAHAN);
        });
    }

    initializeCreateEvent() {
        document.getElementById("create").addEventListener("click", async (evt) => {
            let nama_resep = document.getElementById("nama_resep").value,
                penulis = document.getElementById("penulis").value,
                tags = document.getElementById("tags").value;

            evt.preventDefault();
            try {
                await this.model.create({
                    nama_resep: nama_resep,
                    penulis: penulis,
                    tags: tags
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
                nama_resep = document.getElementById("nama_resep").value,
                tags = document.getElementById("tags").value,
                penulis = document.getElementById("penulis").value;

            evt.preventDefault();
            try {
                await this.model.update({
                    resep_id: resep_id,
                    nama_resep: nama_resep,
                    tags: tags,
                    penulis: penulis
                });
                await this.initializeTable();
            } catch(err) {
                this.view.errorMessage(err);
            }
        });
    }

    initializeDeleteEvent() {
        document.getElementById("delete").addEventListener("click", async (evt) => {
            let resep_id = +document.getElementById("resep_id").textContent;

            evt.preventDefault();
            try {
                await this.model.delete(resep_id);
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
            this.view.setButtonState(this.view.NEW_RESEP);
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