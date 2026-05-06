//Ce code : contacte mon back-end, récupère les projets, les transforme en JSON // 

async function loadWorks() { 
    const response = await fetch("http://localhost:5678/api/works");
    const works = await response.json(); 
    return works; //Retourne les projets sous forme de tableau d'objets//
}

async function displayWorks(worksToDisplay) { //Affiche les projets dans la section portfolio//
    const gallery = document.querySelector(".gallery");
    gallery.innerHTML = "";

    // Si aucun tableau n'est fourni, on charge tous les travaux
    const works = worksToDisplay || await loadWorks();

    works.forEach(work => { //Pour chaque projet, crée une figure avec une image et une légende//
        const figure = document.createElement("figure"); 

        const img = document.createElement("img"); //Crée une image et lui attribue l'URL et le titre du projet//
        img.src = work.imageUrl;
        img.alt = work.title;

        const figcaption = document.createElement("figcaption"); //Crée une légende et lui attribue le titre du projet//
        figcaption.textContent = work.title;

        figure.appendChild(img); //Ajoute l'image et la légende à la figure//
        figure.appendChild(figcaption); //Ajoute la figure à la galerie//
        gallery.appendChild(figure);
    });
}

displayWorks(); //Appelle la fonction pour afficher les projets dès que la page est chargée//

async function loadCategories() { //Récupère les catégories depuis le back-end//
    const response = await fetch("http://localhost:5678/api/categories");
    const categories = await response.json(); 
    return categories; //Retourne les catégories sous forme de tableau d'objets//
    
}
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

    // Boutons des catégories
    categories.forEach(category => {
        const button = document.createElement("button");
        button.textContent = category.name;
        button.classList.add("filter-btn");
        button.setAttribute("data-category-id", category.id);
        filtersContainer.appendChild(button);
        

        // EventListener pour chaque bouton de catégorie
        button.addEventListener("click", () => {
            const categoryId = category.id;
            const filteredWorks = works.filter(work => work.categoryId == categoryId);
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
// EventListener bouton "Tous"
    buttonAll.addEventListener("click", () => {
        gallery.innerHTML = "";
        displayWorks(works);
        setActiveButton(buttonAll);
    });
}

displayFilters();

const token = localStorage.getItem("token");
if (token) {
    document.getElementById("edition-banner").classList.remove("hidden");
}
if (token) {
    document.getElementById("edit-projects").classList.remove("hidden");
}
if (token) {
    const loginLink = document.getElementById("login");

    loginLink.textContent = "logout";
    loginLink.href = "#";

    loginLink.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.reload();
    });
}

if (token) {
    const filters = document.querySelector(".filters");
    if (filters) {
        filters.style.display = "none";
    }
}

const modal = document.getElementById("modal");
const editBtn = document.getElementById("edit-projects");
const closeBtn = document.querySelector(".close-modal");
const galleryView = document.getElementById("modal-gallery-view");
const addView = document.getElementById("modal-add-view");
const openAddBtn = document.getElementById("open-add-photo");
const backArrow = document.querySelector(".back-arrow");

// Ouvrir la modale
editBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
    galleryView.classList.remove("hidden");
    addView.classList.add("hidden");
});

// Fermer la modale
closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
});

// Fermer en cliquant en dehors
modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.classList.add("hidden");
    }
});

// Aller vers le formulaire
openAddBtn.addEventListener("click", () => {
    galleryView.classList.add("hidden");
    addView.classList.remove("hidden");
});

// Retour à la galerie
backArrow.addEventListener("click", () => {
    addView.classList.add("hidden");
    galleryView.classList.remove("hidden");
});
