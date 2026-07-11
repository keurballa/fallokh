import express from 'express';
import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';
import { createServer as createViteServer } from 'vite';

// Calcule l'année scolaire en cours (octobre = début d'année)
function getAnneeScolaire(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed, 9 = octobre
  if (month >= 9) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialisation de la base de données SQLite (Offline-first)
  const dbPath = path.join(process.cwd(), 'sama_daara.db');
  const db = new Database(dbPath, { verbose: console.log });
  const ANNEE = getAnneeScolaire();

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

  try {
    db.exec('ALTER TABLE classes ADD COLUMN inscription INTEGER DEFAULT 10000');
  } catch (e) {}

  try {
    db.exec('ALTER TABLE classes ADD COLUMN mensualite INTEGER DEFAULT 15000');
  } catch (e) {}

  try {
    db.exec('ALTER TABLE enseignants ADD COLUMN salaire_base INTEGER DEFAULT 150000');
  } catch (e) {}

  try {
    db.exec("ALTER TABLE enseignants ADD COLUMN mode_paiement TEXT DEFAULT 'mensuel'");
  } catch (e) {}

  try {
    db.exec('ALTER TABLE enseignants ADD COLUMN taux_horaire INTEGER DEFAULT 5000');
  } catch (e) {}

  try {
    db.exec('ALTER TABLE salaires_enseignants ADD COLUMN heures INTEGER DEFAULT 0');
  } catch (e) {}

  // Colonnes annee_scolaire
  try { db.exec("ALTER TABLE paiements_eleves ADD COLUMN annee_scolaire TEXT DEFAULT ''"); } catch (e) {}
  try { db.exec("ALTER TABLE salaires_enseignants ADD COLUMN annee_scolaire TEXT DEFAULT ''"); } catch (e) {}
  try { db.exec("ALTER TABLE autres_entrees ADD COLUMN annee_scolaire TEXT DEFAULT ''"); } catch (e) {}
  try { db.exec("ALTER TABLE autres_sorties ADD COLUMN annee_scolaire TEXT DEFAULT ''"); } catch (e) {}

  // Mettre à jour les enregistrements existants sans année
  try {
    db.exec(`UPDATE paiements_eleves SET annee_scolaire = '${ANNEE}' WHERE annee_scolaire = '' OR annee_scolaire IS NULL`);
    db.exec(`UPDATE salaires_enseignants SET annee_scolaire = '${ANNEE}' WHERE annee_scolaire = '' OR annee_scolaire IS NULL`);
    db.exec(`UPDATE autres_entrees SET annee_scolaire = '${ANNEE}' WHERE annee_scolaire = '' OR annee_scolaire IS NULL`);
    db.exec(`UPDATE autres_sorties SET annee_scolaire = '${ANNEE}' WHERE annee_scolaire = '' OR annee_scolaire IS NULL`);
  } catch (e) {}

  // Table des archives
  db.exec(`
    CREATE TABLE IF NOT EXISTS archives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      annee_scolaire TEXT UNIQUE,
      date_archivage TEXT,
      nb_eleves INTEGER,
      nb_enseignants INTEGER,
      nb_classes INTEGER,
      total_entrees INTEGER,
      total_sorties INTEGER,
      solde INTEGER,
      notes TEXT
    );
  `);

  app.use(express.json());

  // --- API Routes ---

  // Année scolaire en cours
  app.get('/api/annee-scolaire', (req, res) => {
    res.json({ annee: ANNEE });
  });
  app.get('/api/classes', (req, res) => {
    try {
      let classes = [];
      try {
        classes = db.prepare('SELECT * FROM classes').all();
      } catch (err) {
        classes = db.prepare('SELECT id, nom, cycle FROM classes').all().map((c: any) => ({
          ...c, inscription: 10000, mensualite: 15000
        }));
      }
      
      // Get student count per class
      const counts = db.prepare('SELECT classe_id, COUNT(*) as count FROM eleves WHERE classe_id IS NOT NULL GROUP BY classe_id').all() as any[];
      const countMap = counts.reduce((acc, curr) => ({ ...acc, [curr.classe_id]: curr.count }), {});
      
      res.json(classes.map((c: any) => ({ ...c, elevesCount: countMap[c.id] || 0 })));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/classes', (req, res) => {
    try {
      const { nom, cycle, inscription, mensualite } = req.body;
      const info = db.prepare(`
        INSERT INTO classes (nom, cycle, inscription, mensualite)
        VALUES (?, ?, ?, ?)
      `).run(nom, cycle, inscription || 10000, mensualite || 15000);
      res.json({ id: info.lastInsertRowid, nom, cycle, inscription, mensualite });
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
      const { matricule, nom, prenom, specialite, statut, mode_paiement, taux_horaire } = req.body;
      const info = db.prepare(`
        INSERT INTO enseignants (matricule, nom, prenom, specialite, statut, mode_paiement, taux_horaire)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(matricule, nom, prenom, specialite, statut || 'Actif', mode_paiement || 'mensuel', taux_horaire || 5000);
      res.json({ id: info.lastInsertRowid, matricule, nom, prenom, specialite, statut, mode_paiement, taux_horaire });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/tarifs', (req, res) => {
    try {
      let classes = [];
      try {
        classes = db.prepare('SELECT id, nom, cycle, inscription, mensualite FROM classes').all();
      } catch (err) {
        classes = db.prepare('SELECT id, nom, cycle FROM classes').all().map((c: any) => ({
          ...c, inscription: 10000, mensualite: 15000
        }));
      }
      res.json(classes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.put('/api/tarifs/:id', (req, res) => {
    try {
      const { inscription, mensualite } = req.body;
      db.prepare('UPDATE classes SET inscription = ?, mensualite = ? WHERE id = ?').run(inscription, mensualite, req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/tresorerie/eleves', (req, res) => {
    try {
      const eleves = db.prepare('SELECT e.*, c.nom as classe_nom, c.cycle FROM eleves e LEFT JOIN classes c ON e.classe_id = c.id ORDER BY e.nom ASC, e.prenom ASC').all() as any[];
      const paiements = db.prepare('SELECT * FROM paiements_eleves WHERE annee_scolaire = ?').all(ANNEE) as any[];
      
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
        INSERT INTO paiements_eleves (eleve_id, mois, montant, date_paiement, annee_scolaire)
        VALUES (?, ?, ?, ?, ?)
      `).run(eleve_id, mois, montant, date_paiement, ANNEE);
      
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
      const salaires = db.prepare('SELECT * FROM salaires_enseignants WHERE annee_scolaire = ?').all(ANNEE) as any[];
      
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

  app.put('/api/enseignants/:id/salaire', (req, res) => {
    try {
      const { salaire_base, mode_paiement, taux_horaire } = req.body;
      if (mode_paiement !== undefined) {
        db.prepare('UPDATE enseignants SET salaire_base = ?, mode_paiement = ?, taux_horaire = ? WHERE id = ?').run(
          salaire_base, mode_paiement, taux_horaire || 5000, req.params.id
        );
      } else {
        db.prepare('UPDATE enseignants SET salaire_base = ? WHERE id = ?').run(salaire_base, req.params.id);
      }
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/tresorerie/enseignants/salaire', (req, res) => {
    try {
      const { enseignant_id, mois, montant, heures } = req.body;
      const date_paiement = new Date().toISOString();
      const info = db.prepare(`
        INSERT INTO salaires_enseignants (enseignant_id, mois, montant, date_paiement, heures, annee_scolaire)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(enseignant_id, mois, montant, date_paiement, heures || 0, ANNEE);
      
      db.prepare('UPDATE stats SET tresorerie = tresorerie - ? WHERE id = 1').run(montant);
      
      res.json({ id: info.lastInsertRowid, enseignant_id, mois, montant, date_paiement, heures });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/tresorerie/entrees', (req, res) => {
    try {
      const entrees = db.prepare('SELECT * FROM autres_entrees WHERE annee_scolaire = ? ORDER BY id DESC').all(ANNEE);
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
        INSERT INTO autres_entrees (libelle, montant, date_transaction, annee_scolaire)
        VALUES (?, ?, ?, ?)
      `).run(libelle, montant, date_transaction, ANNEE);
      
      db.prepare('UPDATE stats SET tresorerie = tresorerie + ? WHERE id = 1').run(montant);
      
      res.json({ id: info.lastInsertRowid, libelle, montant, date_transaction });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/tresorerie/sorties', (req, res) => {
    try {
      const sorties = db.prepare('SELECT * FROM autres_sorties WHERE annee_scolaire = ? ORDER BY id DESC').all(ANNEE);
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
        INSERT INTO autres_sorties (libelle, montant, date_transaction, annee_scolaire)
        VALUES (?, ?, ?, ?)
      `).run(libelle, montant, date_transaction, ANNEE);
      
      db.prepare('UPDATE stats SET tresorerie = tresorerie - ? WHERE id = 1').run(montant);
      
      res.json({ id: info.lastInsertRowid, libelle, montant, date_transaction });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/tresorerie/bilan', (req, res) => {
    try {
      const annee = (req.query.annee as string) || ANNEE;
      const totalPaiementsEleves = db.prepare('SELECT SUM(montant) as total FROM paiements_eleves WHERE annee_scolaire = ?').get(annee) as any;
      const totalSalaires = db.prepare('SELECT SUM(montant) as total FROM salaires_enseignants WHERE annee_scolaire = ?').get(annee) as any;
      const totalAutresEntrees = db.prepare('SELECT SUM(montant) as total FROM autres_entrees WHERE annee_scolaire = ?').get(annee) as any;
      const totalAutresSorties = db.prepare('SELECT SUM(montant) as total FROM autres_sorties WHERE annee_scolaire = ?').get(annee) as any;
      
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
        solde,
        annee_scolaire: annee
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // --- Archives Routes ---

  // Liste des années archivées
  app.get('/api/archives', (req, res) => {
    try {
      const archives = db.prepare('SELECT * FROM archives ORDER BY annee_scolaire DESC').all();
      res.json(archives);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Années scolaires disponibles (qui ont des données)
  app.get('/api/archives/annees', (req, res) => {
    try {
      const annees = new Set<string>();
      const tables = ['paiements_eleves', 'salaires_enseignants', 'autres_entrees', 'autres_sorties'];
      tables.forEach(table => {
        const rows = db.prepare(`SELECT DISTINCT annee_scolaire FROM ${table} WHERE annee_scolaire != '' AND annee_scolaire IS NOT NULL`).all() as any[];
        rows.forEach(r => annees.add(r.annee_scolaire));
      });
      // Also add archived years
      const archived = db.prepare('SELECT annee_scolaire FROM archives').all() as any[];
      archived.forEach(a => annees.add(a.annee_scolaire));
      
      const result = Array.from(annees).sort().reverse().map(a => ({
        annee: a,
        isCurrent: a === ANNEE,
        isArchived: archived.some(ar => ar.annee_scolaire === a)
      }));
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Archiver une année scolaire
  app.post('/api/archives/archiver', (req, res) => {
    try {
      const { annee_scolaire, notes } = req.body;
      const annee = annee_scolaire || ANNEE;

      // Calculer les totaux de l'année
      const pe = db.prepare('SELECT SUM(montant) as total FROM paiements_eleves WHERE annee_scolaire = ?').get(annee) as any;
      const se = db.prepare('SELECT SUM(montant) as total FROM salaires_enseignants WHERE annee_scolaire = ?').get(annee) as any;
      const ae = db.prepare('SELECT SUM(montant) as total FROM autres_entrees WHERE annee_scolaire = ?').get(annee) as any;
      const as_ = db.prepare('SELECT SUM(montant) as total FROM autres_sorties WHERE annee_scolaire = ?').get(annee) as any;

      const totalEntrees = (pe?.total || 0) + (ae?.total || 0);
      const totalSorties = (se?.total || 0) + (as_?.total || 0);

      const nbEleves = (db.prepare('SELECT COUNT(*) as c FROM eleves').get() as any).c;
      const nbEnseignants = (db.prepare('SELECT COUNT(*) as c FROM enseignants').get() as any).c;
      const nbClasses = (db.prepare('SELECT COUNT(*) as c FROM classes').get() as any).c;

      db.prepare(`
        INSERT OR REPLACE INTO archives (annee_scolaire, date_archivage, nb_eleves, nb_enseignants, nb_classes, total_entrees, total_sorties, solde, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(annee, new Date().toISOString(), nbEleves, nbEnseignants, nbClasses, totalEntrees, totalSorties, totalEntrees - totalSorties, notes || '');

      res.json({ success: true, annee_scolaire: annee });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Détails d'une archive (paiements, salaires, transactions)
  app.get('/api/archives/:annee/details', (req, res) => {
    try {
      const annee = req.params.annee;
      const paiements = db.prepare(`
        SELECT p.*, e.nom, e.prenom, e.matricule, c.nom as classe_nom
        FROM paiements_eleves p
        LEFT JOIN eleves e ON p.eleve_id = e.id
        LEFT JOIN classes c ON e.classe_id = c.id
        WHERE p.annee_scolaire = ?
        ORDER BY p.date_paiement DESC
      `).all(annee);

      const salaires = db.prepare(`
        SELECT s.*, e.nom, e.prenom, e.matricule, e.specialite
        FROM salaires_enseignants s
        LEFT JOIN enseignants e ON s.enseignant_id = e.id
        WHERE s.annee_scolaire = ?
        ORDER BY s.date_paiement DESC
      `).all(annee);

      const entrees = db.prepare('SELECT * FROM autres_entrees WHERE annee_scolaire = ? ORDER BY date_transaction DESC').all(annee);
      const sorties = db.prepare('SELECT * FROM autres_sorties WHERE annee_scolaire = ? ORDER BY date_transaction DESC').all(annee);

      const archive = db.prepare('SELECT * FROM archives WHERE annee_scolaire = ?').get(annee);

      res.json({ archive, paiements, salaires, entrees, sorties });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // --- Backup & Export Routes ---

  // Download database backup
  app.get('/api/backup/download', (req, res) => {
    try {
      // Checkpoint WAL to ensure all data is in the main file
      db.pragma('wal_checkpoint(TRUNCATE)');
      const filename = `sunu_daara_backup_${new Date().toISOString().slice(0, 10)}.db`;
      res.download(dbPath, filename);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Backup error' });
    }
  });

  // Restore database from uploaded file
  app.post('/api/backup/restore', express.raw({ type: 'application/octet-stream', limit: '50mb' }), (req, res) => {
    try {
      const backupDir = path.join(process.cwd(), 'backups');
      if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
      
      // Save current DB as backup before restoring
      const backupName = `sama_daara_before_restore_${Date.now()}.db`;
      fs.copyFileSync(dbPath, path.join(backupDir, backupName));
      
      // Close current DB, write new file, then it will be used on restart
      db.close();
      fs.writeFileSync(dbPath, req.body);
      
      res.json({ success: true, message: 'Base restaurée. Redémarrez le serveur.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Restore error' });
    }
  });

  // Get database info
  app.get('/api/backup/info', (req, res) => {
    try {
      const stats = fs.statSync(dbPath);
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as any[];
      const counts: Record<string, number> = {};
      tables.forEach(t => {
        try {
          const row = db.prepare(`SELECT COUNT(*) as count FROM ${t.name}`).get() as any;
          counts[t.name] = row.count;
        } catch (e) {}
      });
      
      res.json({
        size: stats.size,
        lastModified: stats.mtime,
        path: dbPath,
        tables: counts
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Info error' });
    }
  });

  // Export table as JSON (for client-side CSV generation)
  app.get('/api/export/:table', (req, res) => {
    const allowed = ['eleves', 'enseignants', 'classes', 'paiements_eleves', 'salaires_enseignants', 'autres_entrees', 'autres_sorties'];
    const table = req.params.table;
    if (!allowed.includes(table)) {
      return res.status(400).json({ error: 'Table non autorisée' });
    }
    try {
      let query = `SELECT * FROM ${table}`;
      if (table === 'eleves') {
        query = 'SELECT e.*, c.nom as classe_nom FROM eleves e LEFT JOIN classes c ON e.classe_id = c.id ORDER BY e.nom';
      }
      const data = db.prepare(query).all();
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Export error' });
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
