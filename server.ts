import express from 'express';
import path from 'path';
import Database from 'better-sqlite3';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialisation de la base de données SQLite (Offline-first)
  const dbPath = path.join(process.cwd(), 'sama_daara.db');
  const db = new Database(dbPath, { verbose: console.log });

  // Création des tables et seeding des données de démonstration
  db.exec(`
    CREATE TABLE IF NOT EXISTS eleves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      matricule TEXT UNIQUE,
      nom TEXT,
      prenom TEXT,
      niveau TEXT,
      statut TEXT
    );
    CREATE TABLE IF NOT EXISTS enseignants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      matricule TEXT UNIQUE,
      nom TEXT,
      prenom TEXT,
      specialite TEXT,
      statut TEXT
    );
    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT UNIQUE,
      cycle TEXT
    );
    CREATE TABLE IF NOT EXISTS stats (
      id INTEGER PRIMARY KEY,
      tresorerie INTEGER,
      stock_alerte INTEGER
    );
    CREATE TABLE IF NOT EXISTS paiements_eleves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      eleve_id INTEGER REFERENCES eleves(id),
      mois TEXT,
      montant INTEGER,
      date_paiement TEXT
    );
    CREATE TABLE IF NOT EXISTS salaires_enseignants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      enseignant_id INTEGER REFERENCES enseignants(id),
      mois TEXT,
      montant INTEGER,
      date_paiement TEXT
    );
    CREATE TABLE IF NOT EXISTS autres_entrees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      libelle TEXT,
      montant INTEGER,
      date_transaction TEXT
    );
    CREATE TABLE IF NOT EXISTS autres_sorties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      libelle TEXT,
      montant INTEGER,
      date_transaction TEXT
    );
    CREATE TABLE IF NOT EXISTS tarifs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cycle TEXT UNIQUE,
      inscription INTEGER,
      mensualite INTEGER
    );
    INSERT OR IGNORE INTO tarifs (cycle, inscription, mensualite) VALUES ('Préscolaire', 10000, 15000);
    INSERT OR IGNORE INTO tarifs (cycle, inscription, mensualite) VALUES ('Élémentaire', 10000, 15000);
    INSERT OR IGNORE INTO tarifs (cycle, inscription, mensualite) VALUES ('Moyen', 15000, 20000);
    INSERT OR IGNORE INTO tarifs (cycle, inscription, mensualite) VALUES ('Lycée', 20000, 25000);
    INSERT OR IGNORE INTO stats (id, tresorerie, stock_alerte) VALUES (1, 1250000, 3);
    
    INSERT OR IGNORE INTO classes (nom, cycle) VALUES ('Petite Section', 'Préscolaire'), ('Moyenne Section', 'Préscolaire'), ('Grande Section', 'Préscolaire');
    INSERT OR IGNORE INTO classes (nom, cycle) VALUES ('CI', 'Élémentaire'), ('CP', 'Élémentaire'), ('CE1', 'Élémentaire'), ('CE2', 'Élémentaire'), ('CM1', 'Élémentaire'), ('CM2', 'Élémentaire');
    INSERT OR IGNORE INTO classes (nom, cycle) VALUES ('6ème', 'Moyen'), ('5ème', 'Moyen'), ('4ème', 'Moyen'), ('3ème', 'Moyen');
    INSERT OR IGNORE INTO classes (nom, cycle) VALUES ('Seconde', 'Lycée'), ('Première', 'Lycée'), ('Terminale', 'Lycée');

    INSERT OR IGNORE INTO eleves (matricule, nom, prenom, niveau, statut) VALUES ('M001', 'Diop', 'Amadou', 'Hafiz', 'Actif');
    INSERT OR IGNORE INTO eleves (matricule, nom, prenom, niveau, statut) VALUES ('M002', 'Fall', 'Fatou', 'Intermédiaire', 'Actif');
    INSERT OR IGNORE INTO eleves (matricule, nom, prenom, niveau, statut) VALUES ('M003', 'Sow', 'Ousmane', 'Débutant', 'Actif');
    INSERT OR IGNORE INTO eleves (matricule, nom, prenom, niveau, statut) VALUES ('M004', 'Ndiaye', 'Awa', 'Hafiz', 'Actif');
    INSERT OR IGNORE INTO enseignants (matricule, nom, prenom, specialite, statut) VALUES ('E001', 'Ndiaye', 'Moussa', 'Mémorisation', 'Actif');
    INSERT OR IGNORE INTO enseignants (matricule, nom, prenom, specialite, statut) VALUES ('E002', 'Bâ', 'Ibrahim', 'Tajwid', 'Actif');
  `);

  try {
    db.exec('ALTER TABLE eleves ADD COLUMN classe_id INTEGER REFERENCES classes(id)');
    db.exec('UPDATE eleves SET classe_id = (id % 12) + 1'); // Assign random classes
  } catch (e) {
    // Column already exists
  }

  app.use(express.json());

  // --- API Routes ---
  app.get('/api/classes', (req, res) => {
    try {
      const classes = db.prepare('SELECT * FROM classes').all();
      // Get student count per class
      const counts = db.prepare('SELECT classe_id, COUNT(*) as count FROM eleves WHERE classe_id IS NOT NULL GROUP BY classe_id').all() as any[];
      const countMap = counts.reduce((acc, curr) => ({ ...acc, [curr.classe_id]: curr.count }), {});
      
      res.json(classes.map((c: any) => ({ ...c, elevesCount: countMap[c.id] || 0 })));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/classes/:id/eleves', (req, res) => {
    try {
      const eleves = db.prepare('SELECT * FROM eleves WHERE classe_id = ? ORDER BY nom ASC, prenom ASC').all(req.params.id);
      res.json(eleves);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/stats', (req, res) => {
    try {
      const stats = db.prepare('SELECT * FROM stats WHERE id = 1').get() || { tresorerie: 0, stock_alerte: 0 };
      const elevesCount = db.prepare('SELECT COUNT(*) as count FROM eleves').get() as { count: number };
      res.json({ ...(stats as any), eleves: elevesCount.count });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/eleves', (req, res) => {
    try {
      const eleves = db.prepare('SELECT e.*, c.nom as classe_nom FROM eleves e LEFT JOIN classes c ON e.classe_id = c.id ORDER BY e.id DESC').all();
      res.json(eleves);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/eleves', (req, res) => {
    try {
      const { matricule, nom, prenom, niveau, statut, classe_id } = req.body;
      const info = db.prepare(`
        INSERT INTO eleves (matricule, nom, prenom, niveau, statut, classe_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(matricule, nom, prenom, niveau || '', statut || 'Actif', classe_id || null);
      res.json({ id: info.lastInsertRowid, matricule, nom, prenom, niveau, statut, classe_id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/enseignants', (req, res) => {
    try {
      const enseignants = db.prepare('SELECT * FROM enseignants ORDER BY id DESC').all();
      res.json(enseignants);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/enseignants', (req, res) => {
    try {
      const { matricule, nom, prenom, specialite, statut } = req.body;
      const info = db.prepare(`
        INSERT INTO enseignants (matricule, nom, prenom, specialite, statut)
        VALUES (?, ?, ?, ?, ?)
      `).run(matricule, nom, prenom, specialite, statut || 'Actif');
      res.json({ id: info.lastInsertRowid, matricule, nom, prenom, specialite, statut });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/tarifs', (req, res) => {
    try {
      const tarifs = db.prepare('SELECT * FROM tarifs').all();
      res.json(tarifs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.put('/api/tarifs/:id', (req, res) => {
    try {
      const { inscription, mensualite } = req.body;
      db.prepare('UPDATE tarifs SET inscription = ?, mensualite = ? WHERE id = ?').run(inscription, mensualite, req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/tresorerie/eleves', (req, res) => {
    try {
      const eleves = db.prepare('SELECT e.*, c.nom as classe_nom, c.cycle FROM eleves e LEFT JOIN classes c ON e.classe_id = c.id ORDER BY e.nom ASC, e.prenom ASC').all() as any[];
      const paiements = db.prepare('SELECT * FROM paiements_eleves').all() as any[];
      
      const elevesWithPaiements = eleves.map(e => {
        const elevePaiements = paiements.filter(p => p.eleve_id === e.id);
        const paiementsMap = elevePaiements.reduce((acc, curr) => ({ ...acc, [curr.mois]: curr }), {});
        return { ...e, paiements: paiementsMap };
      });
      
      res.json(elevesWithPaiements);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/tresorerie/eleves/paiement', (req, res) => {
    try {
      const { eleve_id, mois, montant } = req.body;
      const date_paiement = new Date().toISOString();
      const info = db.prepare(`
        INSERT INTO paiements_eleves (eleve_id, mois, montant, date_paiement)
        VALUES (?, ?, ?, ?)
      `).run(eleve_id, mois, montant, date_paiement);
      
      db.prepare('UPDATE stats SET tresorerie = tresorerie + ? WHERE id = 1').run(montant);
      
      res.json({ id: info.lastInsertRowid, eleve_id, mois, montant, date_paiement });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/tresorerie/enseignants', (req, res) => {
    try {
      const enseignants = db.prepare('SELECT * FROM enseignants ORDER BY nom ASC, prenom ASC').all() as any[];
      const salaires = db.prepare('SELECT * FROM salaires_enseignants').all() as any[];
      
      const enseignantsWithSalaires = enseignants.map(e => {
        const enseignantSalaires = salaires.filter(s => s.enseignant_id === e.id);
        const salairesMap = enseignantSalaires.reduce((acc, curr) => ({ ...acc, [curr.mois]: curr }), {});
        return { ...e, salaires: salairesMap };
      });
      
      res.json(enseignantsWithSalaires);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/tresorerie/enseignants/salaire', (req, res) => {
    try {
      const { enseignant_id, mois, montant } = req.body;
      const date_paiement = new Date().toISOString();
      const info = db.prepare(`
        INSERT INTO salaires_enseignants (enseignant_id, mois, montant, date_paiement)
        VALUES (?, ?, ?, ?)
      `).run(enseignant_id, mois, montant, date_paiement);
      
      db.prepare('UPDATE stats SET tresorerie = tresorerie - ? WHERE id = 1').run(montant);
      
      res.json({ id: info.lastInsertRowid, enseignant_id, mois, montant, date_paiement });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/tresorerie/entrees', (req, res) => {
    try {
      const entrees = db.prepare('SELECT * FROM autres_entrees ORDER BY id DESC').all();
      res.json(entrees);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/tresorerie/entrees', (req, res) => {
    try {
      const { libelle, montant } = req.body;
      const date_transaction = new Date().toISOString();
      const info = db.prepare(`
        INSERT INTO autres_entrees (libelle, montant, date_transaction)
        VALUES (?, ?, ?)
      `).run(libelle, montant, date_transaction);
      
      db.prepare('UPDATE stats SET tresorerie = tresorerie + ? WHERE id = 1').run(montant);
      
      res.json({ id: info.lastInsertRowid, libelle, montant, date_transaction });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/tresorerie/sorties', (req, res) => {
    try {
      const sorties = db.prepare('SELECT * FROM autres_sorties ORDER BY id DESC').all();
      res.json(sorties);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/tresorerie/sorties', (req, res) => {
    try {
      const { libelle, montant } = req.body;
      const date_transaction = new Date().toISOString();
      const info = db.prepare(`
        INSERT INTO autres_sorties (libelle, montant, date_transaction)
        VALUES (?, ?, ?)
      `).run(libelle, montant, date_transaction);
      
      db.prepare('UPDATE stats SET tresorerie = tresorerie - ? WHERE id = 1').run(montant);
      
      res.json({ id: info.lastInsertRowid, libelle, montant, date_transaction });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/tresorerie/bilan', (req, res) => {
    try {
      const totalPaiementsEleves = db.prepare('SELECT SUM(montant) as total FROM paiements_eleves').get() as any;
      const totalSalaires = db.prepare('SELECT SUM(montant) as total FROM salaires_enseignants').get() as any;
      const totalAutresEntrees = db.prepare('SELECT SUM(montant) as total FROM autres_entrees').get() as any;
      const totalAutresSorties = db.prepare('SELECT SUM(montant) as total FROM autres_sorties').get() as any;
      
      const totalEntrees = (totalPaiementsEleves.total || 0) + (totalAutresEntrees.total || 0);
      const totalSorties = (totalSalaires.total || 0) + (totalAutresSorties.total || 0);
      const solde = totalEntrees - totalSorties;

      res.json({
        paiements_eleves: totalPaiementsEleves.total || 0,
        autres_entrees: totalAutresEntrees.total || 0,
        total_entrees: totalEntrees,
        salaires_enseignants: totalSalaires.total || 0,
        autres_sorties: totalAutresSorties.total || 0,
        total_sorties: totalSorties,
        solde
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // --- Vite Middleware (Développement & Production) ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
