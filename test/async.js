      var ajax = require('superagent');

var apikey = 'b7b749abc5269fb91882402aad541b37';

var myAccountID = '56c66be6a73e492741507f63';

      var name = "Matthew Blumen".split(" ");
      var firstName = name[0];
      var lastName = name[1];


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

      var getCustomersUrl = 'http://api.reimaginebanking.com/customers/?key='.concat(apikey);
      return ajax.get(getCustomersUrl).then(res => {
        for(var i in res.body) {                    
          if(res.body[i].first_name === firstName && res.body[i].last_name === lastName) {
            console.log('Customer ID: ' + res.body[i]._id);
            cid = res.body[i]._id;
            break;
          }
        }
          console.log(res.status);
        if (cid === undefined) {
          response.say('Could not find a customer with name ' + firstName + ' ' + lastName).shouldEndSession(true); 
        }

        var getAccountsUrl = 'http://api.reimaginebanking.com/customers/'.concat(cid).concat('/accounts?key=').concat(apikey); 
        return ajax.get(getAccountsUrl).then(res => {
          for(var i in res.body) {                    
            if(res.body[i].type === 'Checking') {
              console.log('Account ID: ' + res.body[i]._id);
              aid = res.body[i]._id;
              break;
            }
          }
              console.log(res.status);
          if (aid === undefined) {
            response.say('Could not find a checking account associated with ' + firstName + ' ' + lastName).shouldEndSession(true);
          }

          var postTransfersUrl = 'http://api.reimaginebanking.com/accounts/'.concat(myAccountID).concat('/transfers?key=').concat(apikey)
            return ajax
            .post(postTransfersUrl)
            .set('Content-Type', 'application/json')
            .send({
              "medium": "balance",
              "payee_id": aid,
              "amount": 1,
              "transaction_date": getDate(),
              "description": "transfer_test"
            })
            .then(res => {
              console.log(typeof(res.status));
              console.log(res.body);
              saveTransactionFunction(request, response, helper, newTransaction);
            });
        });
    });
