console.log("login.js chargé !");

const form = document.querySelector("form");
const errorMessage = document.createElement("p");
errorMessage.style.color = "red";
errorMessage.style.textAlign = "center";
errorMessage.style.marginTop = "20px";
form.after(errorMessage);

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    const loginData = {
        email: email,
        password: password
    };

    try {
        const response = await fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginData)
        });

        const data = await response.json();

        if (response.ok) {
            // Stocker le token
            localStorage.setItem("token", data.token);

            // Redirection vers la page d'accueil
            window.location.href = "index.html";
        } else {
            // Afficher message d'erreur
            errorMessage.textContent = "E-mail ou mot de passe incorrect.";
        }

    } catch (error) {
        console.error("Erreur :", error);
        errorMessage.textContent = "Une erreur est survenue. Réessayez plus tard.";
    }
});
