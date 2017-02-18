'use strict';
var alexa = require('alexa-app');
var skillService = new alexa.app('capital_one_transfers');
var request = require('superagent');

var apikey = 'b7b749abc5269fb91882402aad541b37';

// Allow this module to be reloaded by hotswap when changed
module.change_code = 1;

// Define an alexa-app and launch procedure
var reprompt = "I didn't hear what you said could you repeat that.";
var app = new alexa.app('cap_one_transfers');
app.launch(function(req, res) {
  res.say('Welcome to Capital One P2P Transfer');
  response.say(prompt).reprompt(reprompt).shouldEndSession(false);
});

// Cancel app or close app
var cancelIntentFunction = function(request, response){
  response.say('Closing app. See you later!').shouldEndSession(true);
};

skillService.intent('AMAZON.CancelIntent',{}, cancelIntentFunction);
skillService.intent('AMAZON.StopIntent',{}, cancelIntentFunction);

// Ask for help
skillService.intent('AMAZON.HelpIntent',{},
  function(request, response){
    var help = 'Welcome to Capital One P2P Transfer'
    + 'To transfer money, say transfer money'
    + 'To check number of transfers made, say how many transfers'
    + 'To check transfer amounts, say how much did I transfer to'
    + 'You can also say stop or cancel to exit.';
    if(dataHelper.started){
      //help = dataHelper.getStep().help
      help = 'default help message';
    }
    response.say(help).shouldEndSession(false);
  });


app.intent('PaymentIntent', {
  	"slots": { "NAME": "LITERAL", "AMOUNT": "NUMBER" },
  	"utterances": ["{Pay |Transfer |Send } {NAME} {AMOUNT}{ dollars| bucks}"]
}, function(req, res) {
  	//res.say('Transfering ' + req.slot('NAME') + ' ' + req.slot('AMOUNT') + ' dollars');
  	transfers('56c66be6a73e492741507f63', '56c66be6a73e492741507f64', 0.01, res, req);
});

app.intent('TransferAmounts', { 
	"slots": { "NAME": "LITERAL"},
	"utterances": ["{How much have I transfered |paid |sent } {NAME}"]
}, function(req, res) {
});

function transfers(senderAccountID, recieverAccountID, amount, res, req) {
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
    });
    res.say('transfered!');
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



module.exports = app;