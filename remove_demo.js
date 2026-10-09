const Database = require('better-sqlite3');
const db = new Database('sama_daara.db');
db.exec("DELETE FROM eleves WHERE matricule IN ('M001', 'M002', 'M003', 'M004');");
db.exec("DELETE FROM enseignants WHERE matricule IN ('E001', 'E002');");
console.log('Demo data removed');
