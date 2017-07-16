'use strict';
const cheerio = require('cheerio');
const request = require('request');
const controllers = require('./../controllers');

let scrape =  (req, res, next) => {
  let companyName = req.query.name || "";
  let suchString = "https://www.northdata.de/"+ companyName;

  if(req.params.link) {
    suchString = "https://www.northdata.de" + req.params.link;
  }

  request(suchString, (err, response, body) => {
    const $ = cheerio.load(body);

    // suche führt entweder direkt zur Zielseite oder zu einer Uebersichtsseite mit mehreren Auswahlmoeglichkeiten
    // ladet die Suche auf der Uebersichtsseite, muss die Suchanfrage praezisiert werden.
    // dazu wird die HRB - Nummer von der Uebersichtsseite extrahiert und dem wird eine Liste aus Firmen + eindeutiger
    // HRB Nummer angeboten, so dass er ausawehlen kann.

    // wenn .search-results.text()  existiert, dann ist die Suche definitiv auf der Uebersichtsseite gelandet und es muss
    // entsprechend weiter vorgegangen werden.
    if($('.search-results').text()) {
        // gebe alle Unternehemsnahmen + HRB Nummern zurueck. Benutzer kann dann mit HRB Nummer suchen.
         return getDirectLinks($, req, res);
    }

    // query paramer durch den auf der Zielseite gebraeuchlichen Firmennamen ersetzen

    req.params.name = companyName = $('.prompt').attr('value');

    // companyData = Jahr, Bilanzsumme, Gewinn
    let companyData = $('.tab-content').attr('data-data');
    // companyHistory = Datum und Event
    let companyHistory = $('.bizq').first().attr('data-data');

    try {
      req.params.companyData = JSON.parse(companyData);
      req.params.companyHistory = JSON.parse(companyHistory);
    } catch (err) {
      return res.status(200).json( {error: companyName + " hat bisher keine Unternehmenszahlen veröffentlicht."} );
    }

    return next();

  });

};

function getDirectLinks($, req, res) {
  let companyNamesFound = {
                 message: "Bitte Firmenname praezisieren oder mit hrb=[HRB Nummer] suchen",
                 companies: []
             };
  let linksForDB = [];

             let numberSearchResults = $('.summary').children().length;
             for (let i = 0; i < numberSearchResults; i++) {
                 let searchResults = {};

                 searchResults.name = $('.summary').children().eq(i).text();
                 searchResults.link = $('.summary').children().eq(i).attr("href");
                 try {
                     let splitted = $('.summary').children().eq(i).attr("href").split("+");
                     if(splitted[splitted.length - 1] === 'B') {
                       splitted = splitted[splitted.length - 2];
                     } else {
                       splitted = splitted[splitted.length - 1];
                     }

                     searchResults.HRB = parseInt(splitted);
                     if(!searchResults.HRB) searchResults.HRB = "";

                 } catch (err) {
                     searchResults.HRB = "";
                 }
                 companyNamesFound.companies.push( {name: searchResults.name, hrb: searchResults.HRB} );

                 linksForDB.push(searchResults);
               };

        controllers.link.save(linksForDB);
        return res.status(200).json(companyNamesFound);
};

module.exports = scrape;
