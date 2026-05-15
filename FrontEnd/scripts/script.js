document.addEventListener("DOMContentLoaded", () => {
    // tout ton script ici
});

console.log("script.js chargé !");

/******************************
 * 1. CHARGEMENT DES TRAVAUX
 ******************************/
async function loadWorks() {
    const response = await fetch("http://localhost:5678/api/works");
    return await response.json();
}

async function displayWorks(worksToDisplay) {
    const gallery = document.querySelector(".gallery");
    gallery.innerHTML = "";

    const works = worksToDisplay || await loadWorks();

    works.forEach(work => {
        const figure = document.createElement("figure");

        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;

        const figcaption = document.createElement("figcaption");
        figcaption.textContent = work.title;

        figure.appendChild(img);
        figure.appendChild(figcaption);
        gallery.appendChild(figure);
    });
}

displayWorks();


/******************************
 * 2. CHARGEMENT DES CATÉGORIES
 ******************************/
async function loadCategories() {
    const response = await fetch("http://localhost:5678/api/categories");
    return await response.json();
}


/******************************
 * 3. AFFICHAGE DES FILTRES
 ******************************/
async function displayFilters() {
    const categories = await loadCategories();
    const filtersContainer = document.querySelector(".filters");
    const works = await loadWorks();
    const gallery = document.querySelector(".gallery");

    // Bouton "Tous"
    const buttonAll = document.createElement("button");
    buttonAll.textContent = "Tous";
    buttonAll.classList.add("filter-btn");
    buttonAll.setAttribute("data-category-id", "0");
    filtersContainer.appendChild(buttonAll);

    // Boutons catégories
    categories.forEach(category => {
        const button = document.createElement("button");
        button.textContent = category.name;
        button.classList.add("filter-btn");
        button.setAttribute("data-category-id", category.id);
        filtersContainer.appendChild(button);

        button.addEventListener("click", () => {
            const filteredWorks = works.filter(work => work.categoryId == category.id);
            gallery.innerHTML = "";
            setActiveButton(button);

            if (filteredWorks.length === 0) {
                gallery.innerHTML = "<p>Aucun projet trouvé pour cette catégorie.</p>";
            } else {
                displayWorks(filteredWorks);
            }
        });
    });

    const allButtons = document.querySelectorAll(".filter-btn");

    function setActiveButton(clickedButton) {
        allButtons.forEach(btn => btn.classList.remove("filter-btn-active"));
        clickedButton.classList.add("filter-btn-active");
    }

    // Bouton Tous
    buttonAll.addEventListener("click", () => {
        gallery.innerHTML = "";
        displayWorks(works);
        setActiveButton(buttonAll);
    });
}

displayFilters();


/******************************
 * 4. MODE ÉDITION
 ******************************/
const token = localStorage.getItem("token");

if (token) {
    document.getElementById("edition-banner").classList.remove("hidden");
    document.getElementById("edit-projects").classList.remove("hidden");

    // Login → Logout
    const loginLink = document.getElementById("login");
    loginLink.textContent = "logout";
    loginLink.href = "#";
    loginLink.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.reload();
    });

    // Cacher les filtres
    const filters = document.querySelector(".filters");
    if (filters) filters.style.display = "none";
}


/******************************
 * 5. MODALE
 ******************************/
const modal = document.getElementById("modal");
const editBtn = document.getElementById("edit-projects");
const closeBtn = document.querySelector(".close-modal");
const galleryView = document.getElementById("modal-gallery-view");
const addView = document.getElementById("modal-add-view");
const openAddBtn = document.getElementById("open-add-photo");
const backArrow = document.querySelector(".back-arrow");

// Ouvrir
editBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
    galleryView.classList.remove("hidden");
    addView.classList.add("hidden");
    loadModalGallery(); // fonction qui charge les images
});

// Fermer
closeBtn.addEventListener("click", () => modal.classList.add("hidden"));

modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
});

// Aller au formulaire
openAddBtn.addEventListener("click", () => {
    galleryView.classList.add("hidden");
    addView.classList.remove("hidden");
});

// Retour galerie
backArrow.addEventListener("click", () => {
    addView.classList.add("hidden");
    galleryView.classList.remove("hidden");
});

/******************************
 * 7. FONCTION CHARGEMENT GALERIE DANS LA MODALE
 ******************************/
async function loadModalGallery() {
    const response = await fetch("http://localhost:5678/api/works");
    const works = await response.json();

    const modalGallery = document.querySelector("#modal-gallery");
    modalGallery.innerHTML = "";

    works.forEach(work => {
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;

        const deleteIcon = document.createElement("i");
        deleteIcon.classList.add("fa-solid", "fa-trash-can");

        deleteIcon.addEventListener("click", () => {
        deleteWork(work.id, figure);
    });

        figure.appendChild(img);
        figure.appendChild(deleteIcon);
        modalGallery.appendChild(figure);
    });
}

/******************************
 * 7. REMPLIR LE SELECT CATÉGORIES (VERSION FINALE)
 ******************************/
async function fillCategorySelect() {
    try {
        const categories = await loadCategories();
        const select = document.getElementById("photo-category");

        select.innerHTML = ""; // éviter doublons

        categories.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat.id;
            option.textContent = cat.name;
            select.appendChild(option);
        });

    } catch (error) {
        console.error("Erreur chargement catégories :", error);
    }
}

fillCategorySelect();


/******************************
 * 8. PREVIEW IMAGE
 ******************************/
const photoInput = document.getElementById("photo-input");
const uploadZone = document.querySelector(".upload-zone");

photoInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.classList.add("preview-image");

    uploadZone.innerHTML = "";
    uploadZone.appendChild(img);
});

async function deleteWork(id, figureElement) {
    const token = localStorage.getItem("token");

    const response = await fetch(`http://localhost:5678/api/works/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (response.ok) {
        figureElement.remove();
        removeWorkFromMainGallery(id);
    }
}

function removeWorkFromMainGallery(id) {
    const gallery = document.querySelector(".gallery");
    const figures = gallery.querySelectorAll("figure");

    figures.forEach(fig => {
        const img = fig.querySelector("img");
        if (img && img.src.includes(`/works/${id}`)) {
            fig.remove();
        }
    });
}

const form = document.getElementById("add-photo-form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const image = photoInput.files[0];
    const title = document.getElementById("photo-title").value.trim();
    const category = document.getElementById("photo-category").value;

    // Vérification
    if (!image || !title || !category) {
        alert("Merci de remplir tous les champs et d’ajouter une image.");
        return;
    }

    // Si OK → on envoie
    await sendNewWork(image, title, category);
});
async function sendNewWork(image, title, category) {
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("image", image);
    formData.append("title", title);
    formData.append("category", category);

    const response = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: formData
    });

    if (response.ok) {
        const newWork = await response.json();

        addWorkToMainGallery(newWork);
        loadModalGallery();

        form.reset();
        uploadZone.innerHTML = `
            <i class="fa-regular fa-image"></i>
            <label for="photo-input" class="upload-btn">+ Ajouter photo</label>
            <input type="file" id="photo-input" accept="image/*">
            <p>jpg, png – 4mo max</p>
        `;

        addView.classList.add("hidden");
        galleryView.classList.remove("hidden");

    } else {
        alert("Erreur lors de l’envoi du projet.");
    }
}
function addWorkToMainGallery(work) {
    const gallery = document.querySelector(".gallery");

    const figure = document.createElement("figure");

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = work.title;

    figure.appendChild(img);
    figure.appendChild(figcaption);
    gallery.appendChild(figure);
}
function addWorkToMainGallery(work) {
    const gallery = document.querySelector(".gallery");

    const figure = document.createElement("figure");

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = work.title;

    figure.appendChild(img);
    figure.appendChild(figcaption);
    gallery.appendChild(figure);
}
