document.addEventListener("DOMContentLoaded", () => { 

console.log("script.js chargé !");

/******************************
 * 1. CHARGEMENT DES TRAVAUX
 ******************************/
async function loadWorks() { // Fonction pour charger les travaux depuis l'API
    const response = await fetch("http://localhost:5678/api/works"); 
    return await response.json();
}

async function displayWorks(worksToDisplay) { // Fonction pour afficher les travaux dans la galerie
    const gallery = document.querySelector(".gallery");
    gallery.innerHTML = ""; 

    const works = worksToDisplay || await loadWorks(); // Si aucun tableau de travaux n'est fourni, charge tous les travaux depuis l'API

    works.forEach(work => { // Parcourt les travaux et crée un élément figure pour chaque travail dans la galerie
        const figure = document.createElement("figure"); 
        figure.dataset.id = work.id; 

        const img = document.createElement("img"); 
        img.src = work.imageUrl; 
        img.alt = work.title; 

        const figcaption = document.createElement("figcaption"); // Crée un élément figcaption pour le titre du travail
        figcaption.textContent = work.title; 

        figure.appendChild(img); 
        figure.appendChild(figcaption); 
        gallery.appendChild(figure);
    });
}

displayWorks(); // Appelle la fonction displayWorks pour afficher les travaux dès le chargement de la page


/******************************
 * 2. CHARGEMENT DES CATÉGORIES
 ******************************/
async function loadCategories() { // Fonction pour charger les catégories depuis l'API
    const response = await fetch("http://localhost:5678/api/categories");
    return await response.json(); 
}


/******************************
 * 3. AFFICHAGE DES FILTRES
 ******************************/
async function displayFilters() { // Fonction pour afficher les filtres de catégories
    const categories = await loadCategories(); 
    const filtersContainer = document.querySelector(".filters"); 
    const works = await loadWorks(); 
    const gallery = document.querySelector(".gallery"); 

    // Bouton "Tous"
    const buttonAll = document.createElement("button"); 
    buttonAll.textContent = "Tous"; 
    buttonAll.classList.add("filter-btn", "filter-btn-active"); 
    filtersContainer.appendChild(buttonAll);

    // Boutons catégories
    categories.forEach(category => { 
        const button = document.createElement("button");
        button.textContent = category.name;
        button.classList.add("filter-btn");
        button.dataset.categoryId = category.id;
        filtersContainer.appendChild(button);

        button.addEventListener("click", () => { // Filtre les travaux en fonction de la catégorie sélectionnée
            const filteredWorks = works.filter(work => work.categoryId == category.id);
            gallery.innerHTML = ""; 
            setActiveButton(button);

            if (filteredWorks.length === 0) { // Si aucun travail ne correspond à la catégorie sélectionnée, affiche un message
                gallery.innerHTML = "<p>Aucun projet trouvé pour cette catégorie.</p>"; 
            } else { 
                displayWorks(filteredWorks); // Affiche les travaux filtrés
            }
        });
    }); 

    const allButtons = document.querySelectorAll(".filter-btn"); // Sélectionne tous les boutons de filtre pour pouvoir gérer le style du bouton actif

    function setActiveButton(clickedButton) { // Fonction pour gérer le style du bouton actif
        allButtons.forEach(btn => btn.classList.remove("filter-btn-active")); 
        clickedButton.classList.add("filter-btn-active"); 
    }

    // Bouton Tous
    buttonAll.addEventListener("click", () => { // Affiche tous les travaux lorsque le bouton "Tous" est cliqué
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

if (token) { // Si un token est présent, cela signifie que l'utilisateur est connecté et peut accéder au mode édition
    document.getElementById("edition-banner").classList.remove("hidden"); 
    document.getElementById("edit-projects").classList.remove("hidden"); // Affiche le bouton "Modifier" pour accéder à la modale d'édition

    // Login → Logout
    const loginLink = document.getElementById("login"); // Sélectionne le lien de connexion pour le transformer en lien de déconnexion
    loginLink.textContent = "logout"; 
    loginLink.href = "#"; 
    loginLink.addEventListener("click", () => { 
        localStorage.removeItem("token"); 
        window.location.reload(); 
    });

    // Cacher les filtres
    const filters = document.querySelector(".filters"); // Sélectionne le conteneur des filtres pour le cacher en mode édition
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
editBtn.addEventListener("click", () => { // Affiche la modale et la vue de la galerie lorsque le bouton "Modifier" est cliqué
    modal.classList.remove("hidden"); 
    galleryView.classList.remove("hidden"); 
    addView.classList.add("hidden"); 
    loadModalGallery(); 
});

// Fermer
closeBtn.addEventListener("click", () => modal.classList.add("hidden")); // Ferme la modale lorsque le bouton de fermeture est cliqué

modal.addEventListener("click", (e) => { // Ferme la modale lorsque l'utilisateur clique en dehors de la modale
    if (e.target === modal) modal.classList.add("hidden"); 
});

// Aller au formulaire
openAddBtn.addEventListener("click", () => { // Bascule vers la vue du formulaire d'ajout dans la modale lorsque le bouton "Ajouter photo" est cliqué
    galleryView.classList.add("hidden"); 
    addView.classList.remove("hidden"); 
});

// Bouton retour galerie
backArrow.addEventListener("click", () => { 
    addView.classList.add("hidden"); 
    galleryView.classList.remove("hidden"); 
    form.reset();

    // 🔄 Réinitialiser la zone d’upload
    uploadZone.innerHTML = ` 
        <i class="fa-regular fa-image"></i>
        <label for="photo-input" class="upload-btn">+ Ajouter photo</label>
        <input type="file" id="photo-input" accept="image/*">
        <p>jpg, png – 4mo max</p>
    `;

    const newPhotoInput = document.getElementById("photo-input"); // Sélectionne le nouvel élément input de type file pour gérer l'événement de changement de fichier
newPhotoInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.classList.add("preview-image");

    uploadZone.innerHTML = "";
    uploadZone.appendChild(img);
});
});


/******************************
 * 6. GALERIE MODALE
 ******************************/
async function loadModalGallery() { // Fonction pour charger les travaux dans la galerie de la modale
    const response = await fetch("http://localhost:5678/api/works");
    const works = await response.json();

    const modalGallery = document.querySelector("#modal-gallery");
    modalGallery.innerHTML = ""; 

    works.forEach(work => { // Parcourt les travaux et crée un élément figure pour chaque travail dans la galerie de la modale
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
 * 7. SELECT CATÉGORIES
 ******************************/
async function fillCategorySelect() { // Fonction pour remplir le select des catégories dans le formulaire d'ajout
    const categories = await loadCategories(); 
    const select = document.getElementById("photo-category"); 

    select.innerHTML = ""; 

    categories.forEach(cat => { // Parcourt les catégories et crée une option pour chaque catégorie
        const option = document.createElement("option"); 
        option.value = cat.id; 
        option.textContent = cat.name; 
        select.appendChild(option); 
    });
}

fillCategorySelect();


/******************************
 * 8. PREVIEW IMAGE
 ******************************/
const photoInput = document.getElementById("photo-input"); // Sélectionne l'élément input de type file pour gérer l'événement de changement de fichier
const uploadZone = document.querySelector(".upload-zone");


photoInput.addEventListener("change", function () { // Écoute l'événement de changement de fichier sur l'élément input
    const file = this.files[0]; 
    if (!file) return;

    const img = document.createElement("img"); 
    img.src = URL.createObjectURL(file); // Crée une URL temporaire pour l'image sélectionnée afin de l'afficher dans l'aperçu
    img.classList.add("preview-image");

    uploadZone.innerHTML = "";
    uploadZone.appendChild(img);
});


/******************************
 * 9. SUPPRESSION
 ******************************/
async function deleteWork(id, figureElement) { // Fonction pour supprimer un projet de l'API et de la galerie
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

function removeWorkFromMainGallery(id) { // Supprime un projet de la galerie principale après sa suppression réussie
    const element = document.querySelector(`figure[data-id="${id}"]`);
    if (element) element.remove();
}


/******************************
 * 10. AJOUT DE PROJET
 ******************************/
const form = document.getElementById("add-photo-form"); // Sélectionne le formulaire d'ajout de projet pour gérer l'événement de soumission

form.addEventListener("submit", async (e) => {
    e.preventDefault(); // empêche le rechargement

    const image = photoInput.files[0]; 
    const title = document.getElementById("photo-title").value.trim(); 
    const category = document.getElementById("photo-category").value; 

    if (!image || !title || !category) { // Vérifie si tous les champs du formulaire sont remplis et si une image est sélectionnée
        alert("Merci de remplir tous les champs et d’ajouter une image.");
        return;
    }

    await sendNewWork(image, title, category); 
});

async function sendNewWork(image, title, category) { 
    const token = localStorage.getItem("token"); 

    const formData = new FormData(); // Crée un objet FormData pour envoyer les données du formulaire
    formData.append("image", image); 
    formData.append("title", title);
    formData.append("category", category);

    const response = await fetch("http://localhost:5678/api/works", { 
        method: "POST", 
        headers: { 
            "Authorization": `Bearer ${token}` 
        },
        body: formData // Le corps de la requête contient les données du formulaire
    
    });
    console.log("Réponse du serveur:", response); 
    
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

    // Message de succès
        const successMessage = document.createElement("p");
    successMessage.textContent = "Projet ajouté avec succès !";
    successMessage.style.color = "green";
    successMessage.style.textAlign = "center";
    successMessage.style.marginTop = "10px";
    successMessage.style.fontWeight = "bold";

    // On l'affiche sous le formulaire
    form.after(successMessage);

    // On le retire après 3 secondes
    setTimeout(() => successMessage.remove(), 3000);

        const newPhotoInput = document.getElementById("photo-input");
    newPhotoInput.addEventListener("change", previewImage);


        addView.classList.add("hidden"); // Cache la vue du formulaire d'ajout dans la modale
        galleryView.classList.remove("hidden"); //  Affiche la vue de la galerie dans la modale

    } else {
        alert("Erreur lors de l’envoi du projet.");
    }
}

function addWorkToMainGallery(work) { // Ajoute le nouveau projet à la galerie principale après l'ajout réussi
    const gallery = document.querySelector(".gallery");

    const figure = document.createElement("figure");
    figure.dataset.id = work.id;

    const img = document.createElement("img"); 
    img.src = work.imageUrl; 
    img.alt = work.title;

    const figcaption = document.createElement("figcaption"); 
    figcaption.textContent = work.title; 

    figure.appendChild(img); 
    figure.appendChild(figcaption);
    gallery.appendChild(figure);
}

function addWorkToDOM(work) { 
    const gallery = document.querySelector(".gallery");
    const figure = document.createElement("figure");

    const img = document.createElement("img");
    img.src = work.imageUrl;

    const figcaption = document.createElement("figcaption");

    figure.appendChild(img);
    figure.appendChild(figcaption);
    gallery.appendChild(figure); 
}

function removeWorkFromDOM(id) { 
    document.querySelector(`figure[data-id="${id}"]`)?.remove();
    document.querySelector(`.modal-figure[data-id="${id}"]`)?.remove();
}
}); 