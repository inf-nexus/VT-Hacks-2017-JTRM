var request = require('superagent');

var apikey = 'b7b749abc5269fb91882402aad541b37';

var myCustomerID = '56c66be6a73e492741507f63';

/*request
  .post('http://api.reimaginebanking.com/customers?key=1e28a437bbeb9528ba382435b7e2abe1')
  .send({
  "first_name": "Matt",
  "last_name": "Blumen",
  "address": {
    "street_number": "123",
    "street_name": "Hi Way",
    "city": "South Riding",
    "state": "VA",
    "zip": "20152"
  }
})
  .set('Content-Type', 'application/json')
  .end(function(err, res){
    // Calling the end function will send the request 
    if (err) console.log(err);
      console.log(res.status);
      console.log(res.body);
  });*/

//Grabbing accounts
/*var accountID;
var customerID = '58a7b1b01756fc834d904a02';
var getAccountsUrl = 'http://api.reimaginebanking.com/customers/'.concat(customerID).concat('/accounts?key=').concat(apikey);
request
  .get(getAccountsUrl)
  .end(function(err, res){
    // Calling the end function will send the request 
    if (err) console.log(err);
      //console.log(res.status);
      console.log(res.body);
    for(var i in res.body) {                    
      if(res.body[i].type === 'Checking') {
        accountID = res.body[i]._id;
        console.log('Account ID: ' + accountID);
      }
    }
});*/

getCustomer(customerHandler, 'John', 'Boyer');

function getCustomer(callback, firstName, lastName) {
  var getCustomersUrl = 'http://api.reimaginebanking.com/customers/?key='.concat(apikey); 
  request.get(getCustomersUrl).end(function(err, res) {
        if (err) console.log(err.body);
        callback(res.body, firstName, lastName);
      });
}

function customerHandler(result, firstName, lastName) {
  var cid;
  for(var i in result) {                    
    if(result[i].first_name === firstName && result[i].last_name === lastName) {
        console.log('Customer ID: ' + result[i]._id);
        cid = result[i]._id;
        break;
    }
  }
}

function getAccount(callback, customerID) {
  var getAccountsUrl = 'http://api.reimaginebanking.com/customers/'.concat(customerID).concat('/accounts?key=').concat(apikey); 
    request.get(getAccountsUrl).end(function(err, res) {
        if (err) console.log(err.body);
        callback(res.body);
      });
}

function accountHandler(result) {
  for(var i in result) {                    
    if(result[i].type === 'Checking') {
        console.log('Account ID: ' + result[i]._id);
        break;
    }
  }
}

//getAccount(accountHandler, '56c66be5a73e492741507429');

function transfers(senderAccountID, recieverAccountID, amount) {
  var postTransfersUrl = 'http://api.reimaginebanking.com/accounts/'.concat(senderAccountID).concat('/transfers?key=').concat(apikey)
  request
    .post(postTransfersUrl)
    .set('Content-Type', 'application/json')
    .send({
      "medium": "balance",
      "payee_id": recieverAccountID,
      "amount": amount,
      "transaction_date": getDate(),
      "description": "transfer_test"
    })
    .end(function(err, res) {
      if (err) console.log(err);
      console.log(res.status);
      console.log(res.body);
      return true;
    });
}

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


function makeTransfer(firstName, lastName, amount) {
  var cid;
  var aid;

  var getCustomersUrl = 'http://api.reimaginebanking.com/customers/?key='.concat(apikey); 
  request.get(getCustomersUrl).end(function(err, res) {
        if (err) console.log(err.body);
        for(var i in res.body) {                    
          if(res.body[i].first_name === firstName && res.body[i].last_name === lastName) {
            console.log('Customer ID: ' + res.body[i]._id);
            cid = res.body[i]._id;
            break;
          }
        }
          var getAccountsUrl = 'http://api.reimaginebanking.com/customers/'.concat(cid).concat('/accounts?key=').concat(apikey); 
          request.get(getAccountsUrl).end(function(err, res) {
          if (err) console.log(err.body);
          for(var i in res.body) {                    
            if(res.body[i].type === 'Checking') {
              console.log('Account ID: ' + res.body[i]._id);
              aid = res.body[i]._id;
              break;
            }
          }
            var postTransfersUrl = 'http://api.reimaginebanking.com/accounts/'.concat(myCustomerID).concat('/transfers?key=').concat(apikey)
            request
            .post(postTransfersUrl)
            .set('Content-Type', 'application/json')
            .send({
              "medium": "balance",
              "payee_id": aid,
              "amount": amount,
              "transaction_date": getDate(),
              "description": "transfer_test"
            })
            .end(function(err, res) {
              if (err) console.log(err);
              console.log(res.status);
              console.log(res.body);
            });
          });
      });
}

makeTransfer('David', 'Tennant', 0.01);