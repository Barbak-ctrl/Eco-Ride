document.addEventListener("DOMContentLoaded", () => {

    const btnRecherche = document.getElementById("btnRecherche");

    btnRecherche.addEventListener("click", () => {
        lancerRecherche();
    });

});

async function lancerRecherche() {

    // 1) Récupérer les valeurs
    const depart = document.getElementById("lieuDepart").value;
    const arrivee = document.getElementById("lieuArrivee").value;
    const date = document.getElementById("dateDepart").value;

    const eco = document.getElementById("filtreEco").checked;
    const prix = document.getElementById("filtrePrix").value;
    const duree = document.getElementById("filtreDuree").value;
    const note = document.getElementById("filtreNote").value;

    // 2) Construire l’URL
    let url = "http://localhost:3000/covoiturages?";
    const params = [];

    // Recherche principale
    if (depart) params.push(`ville_depart=${encodeURIComponent(depart)}`);
    if (arrivee) params.push(`ville_arrivee=${encodeURIComponent(arrivee)}`);
    if (date) params.push(`date=${date}`);

    // Filtres avancés
    if (eco) params.push("eco=true");
    if (prix) params.push(`prix_max=${prix}`);
    if (duree) params.push(`duree_max=${duree}`);
    if (note) params.push(`note_min=${note}`);

    url += params.join("&");

    console.log("URL générée :", url);

    // 3) Appel API
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.success) {
            console.error("Erreur API :", data.error);
            return;
        }

        // 4) Affichage des résultats
        afficherCovoiturages(data.covoiturages);

    } catch (error) {
        console.error("Erreur réseau :", error);
    }
}

function afficherCovoiturages(liste) {
    const container = document.getElementById("listeCovoiturages");
    container.innerHTML = "";

    liste.forEach(covoit => {
        const div = document.createElement("div");
        div.classList.add("covoit-card");

        const dateSQL = covoit.date_depart.split("T")[0];

        div.innerHTML = `
            <h3>${covoit.lieu_depart} → ${covoit.lieu_arrivee}</h3>
            <p>Date : ${dateSQL}</p>
            <p>Prix : ${covoit.prix_personne} €</p>
            <p>Places : ${covoit.nb_place}</p>
            <p>Note : ${covoit.note_moyenne}/5</p>
            <p>Éco : ${covoit.statut ? "Oui" : "Non"}</p>

            <button onclick="window.location.href = 'detail.html?id=${covoit.covoiturage_id}'">
    Détail
</button>
        `;

        container.appendChild(div);
    });
}

