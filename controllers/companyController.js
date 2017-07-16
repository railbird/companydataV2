const db = require('./../models');

const companyController = {};

companyController.save = (req, res) => {
  const company = new db.Company({
    name: req.params.name,
    data: req.params.companyData,
    history: req.params.companyHistory
  });
  company.save().then((newCompany => {
    res.status(200).json(newCompany);
  })).catch( err => {
    // wenn die Firma schon in der Datenbank gespeichert ist, dublicate key error abfangen und dem Benutzer original post daten zurueckgeben.
    let output = err.getOperation();
    res.status(200).json(output);
  });
};

companyController.getAllbyName = (req, res, next) => {
  db.Company.find({}, {name: true, _id: false}).then(companies => {
    res.status(200).json(companies);
  }).catch(err => {
    console.log(err.toString());
    res.status(500).json({
      error: err
    });
  });
}

companyController.getAll = (req, res) => {
  db.Company.find({}).then(data => {
    res.status(200).json(data);
  }).catch(err => {
    res.status(500).json({
      error: err
    });
  });
};

// sucht in DB nach Unternehmenszahlen zu einem Unternehmen und gibt diese aus. Wird nichts gefunden, werden die Zahlen aus externer Quelle gescraped.
// query paramer: mode=force ueberspringt den lokalen DB lookup und erzwingt das scrapen aus externer Quelle.
//                hrb=[number] sucht an Hand der HRB Nummer. Gedacht fuer den Fall, dass die urspruengliche Suche des Benutzers zu ungenau war und ihm mehrere Auswahlmoeglichkeiten mit HRB Nummern
//                             vorgeschlagen worden sind.
companyController.get = (req, res, next) => {
  if(req.query.mode === "force" || req.query.hrb) {
    if(!req.query.hrb) {
      if(!req.query.name) {
        return res.status(400).json({error: "Bitte Firmennamen als Parameter 'name' angeben."});
      }
    }
    return next();
  }
  if(!req.query.name || req.query.name.length < 2) {
    return res.status(400).json({error: "Bitte Firmennamen als Parameter 'name' angeben."});
  }
  // suche in lokaler db. Wurde die Firma gefunden, werden die Daten als response gesendet, ansonsten wird nach neuen Daten gescraped.
  let companyNameShort = req.query.name.slice(0, 40);
  db.Company.find({ name: {
                    $regex: "^" + companyNameShort,
                    $options: 'i'
                } })
                .then(companies => {
    if(companies.length === 0) {
      // --> nichts gefunden, scrape for new data.
      next();
    } else if(companies.length === 1) {
      return res.status(200).json(companies[0]);
    } else {
      let firmennamen = [];
      companies.forEach(e => {
        firmennamen.push(e.name);
      })
      let output = {
        error: "Mehr als ein Unternehmen in lokaler Datenbank gefunden. Bitte Suchanfrage praezisieren.",
        unternehmen: firmennamen
      };
      return res.status(200).json(output);
    }
  })
  .catch(err => {
    return res.status(500).json({ error: err.toString() });
  });
};

module.exports = companyController;
