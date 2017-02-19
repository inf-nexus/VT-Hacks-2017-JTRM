var ajax = require('superagent');

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


function makeTransfer(firstName, lastName, amount) {
  var cid;
  var aid;

  var getCustomersUrl = 'http://api.reimaginebanking.com/customers/?key='.concat(apikey); 
  ajax.get(getCustomersUrl).end(function(err, res) {
        if (err) {
          console.log(err.body);
          console.log('Could not find customer to transfer money to');
        }

        for(var i in res.body) {                    
          if(res.body[i].first_name === firstName && res.body[i].last_name === lastName) {
            console.log('Customer ID: ' + res.body[i]._id);
            cid = res.body[i]._id;
            break;
          }
        }

        if (cid === undefined) {
          console.log('Could not find a customer with name ' + firstName + ' ' + lastName);
          return;
        }

          var getAccountsUrl = 'http://api.reimaginebanking.com/customers/'.concat(cid).concat('/accounts?key=').concat(apikey); 
          ajax.get(getAccountsUrl).end(function(err, res) {
          if (err) {
            //console.log(err.body);
            console.log('Could not find a valid account');
          }

          for(var i in res.body) {                    
            if(res.body[i].type === 'Checking') {
              console.log('Account ID: ' + res.body[i]._id);
              aid = res.body[i]._id;
              break;
            }
          }

          if (aid === undefined) {
            console.log('Could not find a checking account associated with ' + firstName + ' ' + lastName);
            return;
          }
            var postTransfersUrl = 'http://api.reimaginebanking.com/accounts/'.concat(myAccountID).concat('/transfers?key=').concat(apikey)
            ajax
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
              if (err) {
                //console.log(err);
                console.log('Transfer failed');
              }
              console.log(res.status);
              console.log(res.body);
            });
          });
      });
}

var name = "Matthew Blumen".split(" ");

makeTransfer(name[0], name[1], 1);
//getLastTransfer();
