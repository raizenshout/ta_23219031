/**
 * JavaScript file for the Home page
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
                "Content-Type": "application/json"
            }
        };
        // call the REST endpoint and wait for data
        let response = await fetch("/api/bahan", options);
        let data = await response.json();
        return data;
    }
}


/**
 * This is the view class which provides access to the DOM
 */
class View {
    constructor() {
        this.table = document.querySelector(".blog table");
        this.error = document.querySelector(".error");
    }

    buildTable(bahan) {
        let tbody = this.table.createTBody();
        let html = "";

        // Iterate over the bahan and build the table
        bahan.forEach((bahan1) => {
            html += `
            <tr data-resep_id="${bahan1.resep.resep_id}" data-bahan_id="${bahan1.bahan_id}">
                <td class="timestamp">${bahan1.timestamp}</td>
                <td class="nama_resep">${bahan1.resep.nama_resep}</td>
                <td class="tags">${bahan1.resep.tags}</td>
                <td class="nama_bahan">${bahan1.nama_bahan}</td>
            </tr>`;
        });
        // Replace the tbody with our new content
        tbody.innerHTML = html;
    }

    errorMessage(message) {
        this.error.innerHTML = message;
        this.error.classList.remove("hidden");
        this.error.classList.add("visible");
        setTimeout(() => {
            this.error.classList.remove("visible");
            this.error.classList.add("hidden");
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
        try {
            let bahan = await this.model.read();
            this.view.buildTable(bahan);
        } catch(err) {
            this.view.errorMessage(err);
        }

        // handle application events
        document.querySelector("table tbody").addEventListener("dblclick", (evt) => {
            let target = evt.target,
                parent = target.parentElement;

            // is this the nama_resep td?
            if (target.classList.contains("nama_resep")) {
                let resep_id = parent.getAttribute("data-resep_id");

                window.location = `/resep/${resep_id}`;

            // is this the content td
            } else if (target.classList.contains("nama_bahan")) {
                let resep_id = parent.getAttribute("data-resep_id"),
                    bahan_id = parent.getAttribute("data-bahan_id");

                window.location = `resep/${resep_id}/bahan/${bahan_id}`;
            }
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
