function formatData(req, res, next) {
let data = [];

if(!req.params.companyData.item[1]) {
  let firmenname = req.params.companyName || "Dieses Unternehmen"
  return res.json({error: firmenname + " hat noch keine Gewinnzahlen veröffentlicht."});
}
let description = req.params.companyData.item[1].data.title.toLowerCase();
let gewinnArray = req.params.companyData.item[0].data.data;
let bilanzArray = req.params.companyData.item[1].data.data
let date1 = gewinnArray[0].year;
let date2 = bilanzArray[0].year;
let dateEnd1 = gewinnArray[gewinnArray.length - 1].year;
let dateEnd2 = bilanzArray[bilanzArray.length -1].year;
let startDate;
let endDate;
if(date1 < date2) {
  startDate = date1;
} else {
  startDate = date2;
}
if(dateEnd1 < dateEnd2) {
  endDate = dateEnd2;
} else {
  endDate = dateEnd1;
}
let arrayLength = (endDate - startDate) +  1;


let year = parseInt(startDate);
for(let i = 0; i < arrayLength; i++) {
  let tempObject = {};
  tempObject.jahr = year;
  gewinnArray.forEach(element => {
    if(element.year == year) {
      tempObject.gewinn = element.value0;
    }
  });
  bilanzArray.forEach(element => {
    if(element.year == year) {
      tempObject[description] = element.value0;
    }
  });
  data.push(tempObject);
  year++;
}

let history = {};
history.mindDate = req.params.companyHistory.minDate;
history.maxDate = req.params.companyHistory.maxDate;
history.events = [];
req.params.companyHistory.event.forEach(element => {
    let event = {};
    event.text = element.text;
    event.time = element.time;
    history.events.push(event);
});
// Events nach Datum sortieren
history.events.sort((a,b) => {
    return new Date(a.time).getTime() - new Date(b.time).getTime()
});

req.params.companyData = data;
req.params.companyHistory = history;
return next();

}


module.exports = formatData;
