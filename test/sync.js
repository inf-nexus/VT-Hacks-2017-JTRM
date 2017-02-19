var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var http = new XMLHttpRequest();

var apikey = 'b7b749abc5269fb91882402aad541b37';

var myAccountID = '56c66be6a73e492741507f63';

function getDate() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!

  var yyyy = today.getFullYear();
  if(dd<10){
    dd='0'+dd;
  } 
  if(mm<10){
    mm='0'+mm;
  } 
  return yyyy + '-' + mm + '-' + dd;
}

  var cid;
  var aid;

function syncTransfer(firstName, lastName, amount) {

  http.open('GET', 'http://api.reimaginebanking.com/customers/?key='.concat(apikey), false);  // `false` makes the http synchronous
  http.send(null);

  if (http.status === 200) {
    var customerJSON = JSON.parse(http.responseText);
    for(var i in customerJSON) {                    
      if(customerJSON[i].first_name === firstName && customerJSON[i].last_name === lastName) {
        console.log('Customer ID: ' + customerJSON[i]._id);
        cid = customerJSON[i]._id;
        break;
      }
    }
  }

  http.open('GET', 'http://api.reimaginebanking.com/customers/'.concat(cid).concat('/accounts?key=').concat(apikey), false);
  http.send(null);
  if (http.status === 200) {
    var accountJSON = JSON.parse(http.responseText);
    for(var i in accountJSON) {                    
      if(accountJSON[i].type === 'Checking') {
        console.log('Account ID: ' + accountJSON[i]._id);
        aid = accountJSON[i]._id;
        break;
      }
    }
  }

  http.open('POST', 'http://api.reimaginebanking.com/accounts/'.concat(myAccountID).concat('/transfers?key=').concat(apikey), false);
  http.setRequestHeader("Content-type", "application/json");
  var params = JSON.stringify({
              "medium": "balance",
              "payee_id": aid,
              "amount": amount,
              "transaction_date": getDate(),
              "description": "transfer_test"
            });

  http.send(params);
}

var name = "Matthew Blumen".split(" ");
syncTransfer(name[0], name[1], 2);


var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
xmlhttp.onreadystatechange = function() {  
   if (xmlhttp.readyState === 4) {  
        if (xmlhttp.status === 200) {  
          console.log(xmlhttp.responseText)  
        } else {  
           console.log("Error", xmlhttp.statusText);  
        }  
    }  
  };
xmlhttp.open("POST", 'http://api.reimaginebanking.com/accounts/'.concat(myAccountID).concat('/transfers?key=').concat(apikey), false);
xmlhttp.setRequestHeader("Content-Type", "application/json");
xmlhttp.send(JSON.stringify({
              "medium": "balance",
              "payee_id": aid,
              "amount": 3,
              "transaction_date": getDate(),
              "description": "transfer_test"
            }));
