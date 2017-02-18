var request = require('superagent');

var apikey = '1e28a437bbeb9528ba382435b7e2abe1';

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


  function transfer(sender_accnt_id, reciever_accnt_id, amnt) {
  request
    .post('http://api.reimaginebanking.com/transfers?key=b7b749abc5269fb91882402aad541b37')
    .set('Content-Type', 'application/json')
    .set('id', sender_accnt_id)
    .send({
      "medium": "balance",
      "payee_id": reciever_accnt_id,
      "amount":amnt,
      "transaction_date": "2017-02-18",
      "description": "transfer_test"
    })
    .end(function(err, res) {
      if (err) console.log(err);
      console.log(res.status);
      console.log(res.status);
    });
}

transfer('56c66be6a73e492741507f63', '56c66be6a73e492741507f64', 0.01);

