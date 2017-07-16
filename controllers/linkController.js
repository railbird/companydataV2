const db = require('./../models');

const linkController = {};

linkController.save = companyArray => {
  companyArray.forEach(company => {
    let link = new db.Link({
      name: company.name,
      hrb: company.HRB,
      link: company.link
    });
    db.Link.findOne({
      hrb: company.HRB
    }).then(document => {
      if(!document) {
        link.save();
      }
    }).catch(err => {
      console.log(err.toString());
    });
  });
};

linkController.get = (req, res, next) => {
  if(!req.query.hrb) {
    return next();
  } else {
    req.query.hrb = parseInt(req.query.hrb);
    db.Link.findOne({hrb: req.query.hrb}).then(document => {
      req.params.link = document.link;
      next();
    }).catch(err => {
      return res.status(404).json({error: "HRB Nummer wurde nicht gefunden."});
    })
  }
};

module.exports = linkController;
