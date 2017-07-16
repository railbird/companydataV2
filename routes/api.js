'use strict';

const express = require('express');
const router = express.Router();
const controllers = require('../controllers');
const scraper = require('./../scraper');

// get request benoetigt parameter 'name' (Firmenname) und gibt Unternehmenszahlen zu dieser Firma aus.
// Entweder aus lokaler DB oder aus externer Quelle via scraping
/*
    controllers.company.get  ->  suche nach Unternehmenszahlen in lokaler Datenbank. Falls nicht erfolgreich, fahre fort.
    controllers.link.get  ->  nur fuer den Fall, dass mit HRB Nummer gesucht wird. Suche Direktlink aus der Link Collection und uebergebe diesen an scraper
    scraper.scrape  ->  extrahiert Unternehmenszahlen von Zielseite. Falls direkt erfolgreich --> Ausgabe an User. Falls nicht --> Liste mit Auswahlmoeglichkeiten (Firmenname + HRB Nummer) an User.
    scraper.format  ->  die Zielseite reagiert je nach Unternehmen oft unterschiedlich. Hier werden diese Faelle beruecksichtigt und die Daten werden formatiert
    controllers.company.save  ->  speichern der Daten in der Datenbank und Ausgabe an den Benutzer 
 */
router.get("/", controllers.company.get, controllers.link.get, scraper.scrape, scraper.format, controllers.company.save);


// Liste aller Firmennamen in DB ausgeben
router.get("/allbyname", controllers.company.getAllbyName);

// Gesamten Inhalt der DB ausgeben
router.get("/all", controllers.company.getAll);

module.exports = router;
