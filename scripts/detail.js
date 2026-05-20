// Récupération de l'ID dans l'URL
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// Récupération des données du covoiturage
fetch(`http://localhost:3000/covoiturages/${id}/details`)
    .then(res => res.json())
    .then(data => {
        const c = data.covoiturage;
        afficherDetail(c);
        afficherAvis(c.avis);
    })
    .catch(err => console.error(err));


// Affichage des informations du covoiturage
function afficherDetail(c) {

    const dateSQL = c.date_depart.split("T")[0];

    document.getElementById("detailCovoiturage").innerHTML = `
        <h3>${c.lieu_depart} → ${c.lieu_arrivee}</h3>

        <p><strong>Date :</strong> ${dateSQL}</p>
        <p><strong>Heure départ :</strong> ${c.heure_depart}</p>
        <p><strong>Heure arrivée :</strong> ${c.heure_arrivee}</p>
        <p><strong>Prix :</strong> ${c.prix_personne} €</p>
        <p><strong>Places restantes :</strong> ${c.nb_place}</p>
        <p><strong>Éco :</strong> ${c.statut ? "Oui" : "Non"}</p>

        <h4>Conducteur</h4>

        ${c.conducteur.photo
            ? `<img src="data:image/jpeg;base64,${c.conducteur.photo}" 
                    alt="Photo du conducteur" 
                    style="width:120px; height:120px; border-radius:50%; object-fit:cover;">`
            : `<img src="../assets/default-user.png" 
                    alt="Photo par défaut" 
                    style="width:120px; height:120px; border-radius:50%; object-fit:cover;">`
        }
        <p>${c.conducteur.prenom} ${c.conducteur.nom}</p>

        <h4>Préférences du conducteur</h4>
        <p>Fumeur : ${c.preferences.fumeur ? "Oui" : "Non"}</p>
        <p>Animaux acceptés : ${c.preferences.animaux_acceptes ? "Oui" : "Non"}</p>

        <h4>Véhicule</h4>
        ${c.voiture
            ? `
                <p>${c.voiture.marque} ${c.voiture.modele}</p>
                <p>Énergie : ${c.voiture.energie ?? "Non renseignée"}</p>
                <p><strong>Couleur :</strong> ${c.voiture.couleur ?? "Non renseignée"}</p>
        <p><strong>Immatriculation :</strong> ${c.voiture.immatriculation ?? "Non renseignée"}</p>
              `
            : `<p>Aucun véhicule renseigné</p>`
        }
    `;
}


// Affichage des avis
function afficherAvis(liste) {

    const container = document.getElementById("listeAvis");
    container.innerHTML = "";

    if (!liste || liste.length === 0) {
        container.innerHTML = "<p>Aucun avis pour ce conducteur.</p>";
        return;
    }

    liste.forEach(a => {
        const div = document.createElement("div");
        div.classList.add("avis-card");

        div.innerHTML = `
            <p><strong>${a.note}/5</strong></p>
            <p>${a.commentaire}</p>
        `;

        container.appendChild(div);
    });
}

console.log(">>> DETAIL.JS ACTIF<<<");