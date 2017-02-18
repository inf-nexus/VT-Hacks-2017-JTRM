var request = require('superagent');

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


/*
request
  .get('http://api.reimaginebanking.com/accounts?key=41a726575310218bbbd06278ae170bba')
  .end(function(err, res){
    // Calling the end function will send the request 
    if (err) console.log(err);
      console.log(res.status);
      console.log(res.body);
  });*/

function transfer(sender_accnt_id, reciever_accnt_id, amnt) {
  request
    .post('http://api.reimaginebanking.com/transfer?key=41a726575310218bbbd06278ae170bba')
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

transfer('58a7b2a01756fc834d904a06', '56c66be6a73e492741507f64', 0.01);


