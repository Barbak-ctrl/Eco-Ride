Eco‑Ride – Plateforme de covoiturage écologique

Eco‑Ride est une application web permettant de proposer et réserver des trajets de covoiturage.
Le projet a été réalisé dans le cadre d’un examen scolaire et met l’accent sur la simplicité, l’écologie et l’expérience utilisateur.


Fonctionnalités

    Inscription et connexion sécurisées (bcrypt)
    Gestion du profil utilisateur
    Ajout d’un véhicule
    Création d’un covoiturage
    Consultation de la liste des trajets
    Détails d’un covoiturage (conducteur, véhicule, préférences, avis)
    Système d’avis entre utilisateurs

Technologies utilisées

    Frontend : HTML, CSS, JavaScript
    Backend : Node.js, Express
    Base de données : PostgreSQL
    Sécurité : bcrypt pour le hash des mots de passe
    Outils : Thunder Client, Docker (optionnel)

Installation

    Cloner le projet :
    bash
    git clone https://github.com/Barbak-ctrl/Eco-Ride.git
    
    Installer les dépendances :
    bash
    npm install
    
    Lancer le serveur :
    bash
    npm start

Base de données

Le projet utilise PostgreSQL.
Le schéma comprend notamment les tables :

    utilisateur
    voiture
    covoiturage
    preferences
    avis
    marque

Un fichier SQL ou un MCD peut être ajouté dans le dossier /docs.
Sécurité

    Les mots de passe sont hashés avec bcrypt.
    Aucun mot de passe ou donnée sensible n’est stocké en clair.
    Le fichier .env n’est pas inclus dans le dépôt.
    Aucune clé privée ou identifiant de connexion n’est exposé.

Structure du projet
Code

/html
/css
/scripts
/backend (server.js, routes, config)
/assets
/docs

Auteur

Projet réalisé mr Adrien – 2026
Dans le cadre d’un examen scolaire.