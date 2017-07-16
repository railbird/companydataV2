var url = "http://localhost:3000/api";

// Chart by plotly.by
var trace1 = {
  x: [],
  y: [],
  name: 'Gewinn',
  type: 'bar'
};
var trace2 = {
  x: [],
  y: [],
  name: 'Bilanzsumme',
  type: 'bar'
};

var chartData = [trace1, trace2];
var layout = {barmode: 'group'};


$('#searchButton').click(function(){
  var firmenname = $('#firmenname').val();
  $('.list-group').text("");
  $('#chart').text("");
  if(firmenname) {
    sendRequest(firmenname);
  }

});

$('#firmenname').keypress(function(e) {
   if (e.which == 13) // the enter key code
   {
     $('#searchButton').click();
     return false;
   }
 });

function sendRequest(firmenname, hrbNumber) {
  var query = "";
  if(hrbNumber) {
    query = url + "?hrb=" + hrbNumber;
  } else {
    query = url + "?name=" + firmenname;
  }

  $.ajax({
    url: query,
    method: 'GET',
    dataType: 'json',
    success: handleResponse,
    error: function(request, status, error) {
      $('#chartTitle').text("Es ist etwas schief gelaufen");
      console.log(error);
    }
  });
};

function handleResponse(companyData) {
  if(companyData.error) {
    $('#chartTitle').text(companyData.error);
    if(companyData.unternehmen) {
      companyData.unternehmen.forEach(function(e) {
        $('#chartTitle').append("<br>" + e);
      })
    }
    return;
  }
  if(companyData.message) {
    displayList(companyData);
    return;
  }
  $('#chartTitle').text(companyData.name);

  // alte Daten loeschen
  deleteOldData();

  // API reported entweder Bilanzsumme oder Umsatz, je nachdem was veroeffentlicht wurde
  // --> muss entsprechend dynamisch angepasst werden
  var keys = getKeys(companyData.data);
  var description = "bilanzsumme";
  keys.forEach(function(e) {
    if(e === "umsatz") {
      description = "umsatz";
    }
  })
  // Gewinn in Chart Array speichern
  companyData.data.forEach(function(e, i) {
    trace1.y[i] = parseInt(e.gewinn);
    trace1.x[i] = e.jahr;
    trace2.y[i] = parseInt(e[description]);
    trace2.x[i] = e.jahr;
  })
  // Label (Bilanzsumme / Umsatz) formatieren
  trace2.name = description.charAt(0).toUpperCase() + description.slice(1);

  Plotly.newPlot('chart', chartData, layout, {displayModeBar: false});
};


function deleteOldData() {
  trace1.x.splice(0);
  trace1.y.splice(0);
  trace2.x.splice(0);
  trace2.y.splice(0);
};

// checken ob Umsatz oder Bilanzsumme veroeffentlicht wurde
function getKeys(companyDataArray) {
  for(var i = 0; i < companyDataArray.length; i++) {
    if(Object.keys(companyDataArray[i]).length === 3) {
      return  Object.keys(companyDataArray[i]);
      break;
    }
  }
  return [];
};


// Falls die Suchanfrage zu ungenau war, Liste von Auswahlmoeglichkeiten anzeigen

function displayList(companyData) {
  var companyNames = $('#companyNames');
  var listGroup = $('.list-group');
  listGroup.text("");
  $('#chartTitle').text("");
  companyData.companies.forEach( function(element){
    if(element.hrb) {
      listGroup.append('<span class="list-group-item list-group-item-action" data-hrb=' + element.hrb + '>' + element.name + '</span>');
    }
  });
  $(".list-group-item").click(function() {
    console.log(this.dataset.hrb);
    $('#chart').text("");
    sendRequest(null, this.dataset.hrb);
  });

};
