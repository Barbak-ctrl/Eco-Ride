import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";
import bcrypt from "bcrypt";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("EcoRide API is running");
});

// START ROUTE TEST-DB

app.get("/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({ success: true, time: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// START ROUTE INSCRIPTION 
app.post("/inscription", async (req, res) => {
    const {
        role_id,
        nom,
        prenom,
        email,
        password,
        telephone,
        adresse,
        date_naissance,
        pseudo
    } = req.body;

    try {
        // Vérifier si l'email existe déjà
        const emailCheck = await pool.query(
            "SELECT * FROM utilisateur WHERE email = $1",
            [email]
        );

        if (emailCheck.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email déjà utilisé"
            });
        }

        // Hash du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertion dans la base
        const result = await pool.query(
            `INSERT INTO utilisateur 
            (role_id, nom, prenom, email, password, telephone, adresse, date_naissance, pseudo)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING utilisateur_id`,
            [
                role_id,
                nom,
                prenom,
                email,
                hashedPassword,
                telephone,
                adresse,
                date_naissance,
                pseudo
            ]
        );

        res.json({
            success: true,
            message: "Inscription réussie",
            utilisateur_id: result.rows[0].utilisateur_id
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

//START ROUTE CONNEXION

app.post("/connexion", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Vérifier si l'utilisateur existe
        const result = await pool.query(
            "SELECT * FROM utilisateur WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Email ou mot de passe incorrect"
            });
        }

        const user = result.rows[0];

        // Vérifier le mot de passe hashé
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Email ou mot de passe incorrect"
            });
        }

        // Connexion réussie
        res.json({
            success: true,
            message: "Connexion réussie",
            utilisateur_id: user.utilisateur_id,
            pseudo: user.pseudo,
            role_id: user.role_id
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

//START ROUTE PROFIL

app.get("/profil/:id", async (req, res) => {
    const utilisateur_id = req.params.id;

    try {
        const result = await pool.query(
            `SELECT utilisateur_id, role_id, nom, prenom, email, telephone, adresse, date_naissance, pseudo 
            FROM utilisateur 
            WHERE utilisateur_id = $1`,
            [utilisateur_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Utilisateur introuvable"
            });
        }

        res.json({
            success: true,
            profil: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

//START Route GET COVOITURAGE

app.get("/covoiturages", async (req, res) => {
    const { eco, prix_max, duree_max, note_min, ville_depart, ville_arrivee, date } = req.query;

    try {
        let query = `
        SELECT 
        covoit.covoiturage_id,
        TO_CHAR(covoit.date_depart, 'YYYY-MM-DD') AS date_depart,
        covoit.heure_depart,
        covoit.lieu_depart,
        covoit.date_arrivee,
        TO_CHAR(covoit.heure_arrivee, 'HH24:MI') AS heure_arrivee,
        covoit.lieu_arrivee,
        covoit.statut,
        covoit.nb_place,
        covoit.prix_personne,
        u.nom,
        u.prenom,
        (EXTRACT(EPOCH FROM (covoit.heure_arrivee - covoit.heure_depart)) / 60) AS duree,
        ROUND(COALESCE(AVG(a.note), 0), 1) AS note_moyenne
            FROM covoiturage covoit
            JOIN utilisateur u ON covoit.utilisateur_id = u.utilisateur_id
            LEFT JOIN avis a ON a.covoiturage_id = covoit.covoiturage_id
            WHERE covoit.nb_place > 0
        `;

        const params = [];
        let index = 1;

        // Recherche principale
        if (ville_depart) {
            query += ` AND covoit.lieu_depart ILIKE $${index}`;
            params.push(`%${ville_depart}%`);
            index++;
        }

        if (ville_arrivee) {
            query += ` AND covoit.lieu_arrivee ILIKE $${index}`;
            params.push(`%${ville_arrivee}%`);
            index++;
        }

        if (date) {
            query += ` AND covoit.date_depart = $${index}`;
            params.push(date);
            index++;
        }

        // Filtres avancés
        if (eco === "true") {
            query += ` AND covoit.statut = true`;
        }

        if (prix_max) {
            query += ` AND covoit.prix_personne <= $${index}`;
            params.push(prix_max);
            index++;
        }

        if (duree_max) {
            query += ` AND (EXTRACT(EPOCH FROM (covoit.heure_arrivee - covoit.heure_depart)) / 60) <= $${index}`;
            params.push(duree_max);
            index++;
        }

        query += `
            GROUP BY covoit.covoiturage_id, u.utilisateur_id
        `;

        // Filtre note minimale
        if (note_min) {
            query += ` HAVING ROUND(COALESCE(AVG(a.note), 0), 1) >= $${index}`;
            params.push(note_min);
            index++;
        }

        query += `
            ORDER BY covoit.date_depart ASC, covoit.heure_depart ASC
        `;

        const result = await pool.query(query, params);

        res.json({
            success: true,
            covoiturages: result.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});


//START ROUTE détails covoiturages

app.get("/covoiturages/:id/details", async (req, res) => {
    const covoiturageId = req.params.id;

    try {
        const covoiturageQuery = await pool.query(
            `SELECT 
                c.*, 
                u.utilisateur_id AS conducteur_id,
                u.nom AS conducteur_nom, 
                u.prenom AS conducteur_prenom, 
                u.photo AS conducteur_photo
            FROM covoiturage c
            JOIN utilisateur u ON c.utilisateur_id = u.utilisateur_id
            WHERE c.covoiturage_id = $1`,
            [covoiturageId]
        );

        if (covoiturageQuery.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Covoiturage introuvable" });
        }

        const covoiturage = covoiturageQuery.rows[0];

        const preferencesQuery = await pool.query(
            `SELECT animaux_acceptes, fumeur
            FROM preferences
            WHERE utilisateur_id = $1`,
            [covoiturage.conducteur_id]
        );

        const preferences = preferencesQuery.rows[0] || {
            animaux_acceptes: false,
            fumeur: false
        };

        const voitureQuery = await pool.query(
            `SELECT 
                v.modele,
                v.energie,
                v.couleur,
                v.immatriculation,
                m.libelle AS marque
            FROM voiture v
            LEFT JOIN marque m ON v.marque_id = m.marque_id
            WHERE v.utilisateur_id = $1`,
            [covoiturage.conducteur_id]
        );

        const voiture = voitureQuery.rows.length > 0 ? voitureQuery.rows[0] : null;

        const avisQuery = await pool.query(
            `SELECT note, commentaire
            FROM avis
            WHERE utilisateur_id = $1`,
            [covoiturage.conducteur_id]
        );

        const avis = avisQuery.rows;

        covoiturage.conducteur = {
            nom: covoiturage.conducteur_nom,
            prenom: covoiturage.conducteur_prenom,
            photo: covoiturage.conducteur_photo
        };

        covoiturage.preferences = preferences;
        covoiturage.voiture = voiture;
        covoiturage.avis = avis;

        res.json({
            success: true,
            covoiturage
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});


//END : routes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});