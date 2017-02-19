'use strict';
var Alexa = require('alexa-app');
var skillService = new Alexa.app('capitalOneP2PTransfer');
const AWS = require('aws-sdk');

var appId = 'amzn1.ask.skill.f6116fb0-3213-4020-9e12-7cec70174fcc';

var ajax = require('superagent');

var apikey = 'b7b749abc5269fb91882402aad541b37';
var myAccountID = '58a91e7e1756fc834d9055ed';

const USERID = 'Jacob'; //who you are in the database
const FRIENDSLIST = ['Rohan', 'Matt', 'Timmy'];
var recentTransfer = [];
var correctPinEntered;
var maxLimit = 25;

var _ = require('lodash');

var DataHelper = require('./data_helper');
var DATA_HELPER_SESSION_KEY = 'data_session';
var DatabaseHelperMock = require('./database_helper_mock');
var databaseHelperMock = new DatabaseHelperMock();

function transaction(recipientid, paymentType, paymentAmount){
  this.recipientid = recipientid;
  this.paymentType = paymentType;
  this.paymentAmount = paymentAmount;
}

var getDataHelper = function(dataHelperData){
  if(dataHelperData === undefined){
    dataHelperData = {};
  }

  return new DataHelper(dataHelperData);
};

var reprompt = "I didn't hear what you said could you repeat that.";
skillService.launch(function(request, response) {
  var prompt = 'Welcome to Capital One P2P Transfer ' + 
  'Please enter your pin to continue';
  correctPinEntered = false;
  response.say(prompt).reprompt(reprompt).shouldEndSession(false);
});

var cancelIntentFunction = function(request, response) {
  response.say('Closing app. See you later!').shouldEndSession(true);
};

skillService.intent('AMAZON.CancelIntent',{}, cancelIntentFunction);
skillService.intent('AMAZON.StopIntent',{}, cancelIntentFunction);

skillService.intent('AMAZON.HelpIntent',{},
  function(request, response){
    var help = 'To transfer money, say transfer money'
    + 'To increase limit, say set max transfer limit to'
    + 'You can also say stop or cancel to exit.';
    response.say(help).shouldEndSession(false);
  });

var getDataHelperFromRequest = function(request) {
    var dataHelperData = request.session(DATA_HELPER_SESSION_KEY);
    return getDataHelper(dataHelperData);
};

skillService.intent('VerificationIntent',{
  'slots':[{'PIN': 'AMAZON.FOUR_DIGIT_NUMBER'}],
  'utterances': ['{-|PIN} {enter}']
},
function(request,response){
  var userPin = request.slot('PIN');
  if(userPin && userPin == '1234'){
    response.say('Pin confirmed you may proceed').shouldEndSession(false);
    correctPinEntered = true;

  } else{
    response.say('Incorrect pin entered').shouldEndSession(false);
  }

  response.send();
});

skillService.intent('PaymentIntent',{
  'slots':[{'NAME': 'AMAZON.US_FIRST_NAME'},{'AMOUNT': 'AMAZON.NUMBER'}],
  'utterances': ['{pay} {-|NAME}','{-|AMOUNT} {dollars}',
  '{transfer |send |give |pay} {-|AMOUNT} {dollars to} {-|NAME}']
}, function(request, response){
      var helper = paymentIntentFunction(getDataHelperFromRequest(request),request, response);
      var name = databaseHelperMock.getFullName(helper.userid).split(" ");

      var firstName = name[0];
      var lastName = name[1];
      var amount = parseInt(helper.paymentAmount, 10);

      var newTransaction = new transaction(helper.userid, 'payment', helper.paymentAmount);

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

        if (cid === undefined) {
          response.say('Could not find a customer with name ' + firstName + ' ' + lastName);
          response.shouldEndSession(true).send();
          return;
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
              
          if (aid === undefined) {
            response.say('Could not find a checking account associated with ' + firstName + ' ' + lastName)
            response.shouldEndSession(true).send();
            return;
          }

          var postTransfersUrl = 'http://api.reimaginebanking.com/accounts/'.concat(myAccountID).concat('/transfers?key=').concat(apikey)
            return ajax
            .post(postTransfersUrl)
            .set('Content-Type', 'application/json')
            .send({
              "medium": "balance",
              "payee_id": aid,
              "amount": amount,
              "transaction_date": getDate(),
              "description": "transfer_test"
            })
            .then(res => {
              console.log(res.status);
              console.log(res.body);
              if (res.status === 201) {
                saveTransactionFunction(request, response, helper, newTransaction);
              }
            });
        });
    });
  }
);

skillService.intent('MaxPayIntent', { 
  "slots": { "LIMIT": "AMAZON.NUMBER"},
  "utterances": ["{Set max pay limit to |Set max transfer limit to} {LIMIT} {dollars}"]
}, function(request, response) {
  if (!correctPinEntered) {
    response.say('Please enter correct pin to proceed').shouldEndSession(false);
    response.send();
  }
  else {
    maxLimit = request.slot('LIMIT');
    response.say('Maximum limit set to ' + maxLimit + ' dollars').shouldEndSession(false);
  }
});

skillService.intent('RecentTransferIntent', { 
  "slots": {},
  "utterances": ["{What was my } {last payment | most recent payment | last transfer | most recent transfer}"]
}, function(request, response) {
  if (!correctPinEntered) {
    response.say('Please enter correct pin to proceed').shouldEndSession(false);
    response.send();
  }
  else {
    if (recentTransfer.length === 0) {
      response.say('You no have no recent transfers');
    }
    else {
      response.say('Last transfer was ' + recentTransfer[1] + ' dollars to ' + recentTransfer[0] + ' on ' + recentTransfer[2]).shouldEndSession(false);
    }
  }
});

var paymentIntentFunction = function(dataHelper, request, response){
  if (!correctPinEntered) {
    response.say('Please enter correct pin to proceed').shouldEndSession(false);
    response.send();
  }

  var userId = request.slot('NAME');
  var paymentAmount = request.slot('AMOUNT');

  dataHelper.started = true;
  if (correctPinEntered && userId && paymentAmount) {
    dataHelper.currentStep++;
  }

  if (correctPinEntered && userId !== undefined) {
    dataHelper.getStep().value = userId;
    dataHelper.userid = userId;
  }

  if (correctPinEntered && paymentAmount !== undefined) {
    dataHelper.getStep().value = paymentAmount;
    dataHelper.paymentAmount = paymentAmount;

    if (correctPinEntered && dataHelper.paymentAmount > maxLimit) {
      response.say('Amount entered exceeds max limit of ' + maxLimit + ' dollars. ' 
      + 'Please try agian');
      response.shouldEndSession(false).send();
    }
  }

  if (correctPinEntered && dataHelper.completed()) {
    return dataHelper;

  } else {
    if (correctPinEntered && (userId !== undefined || paymentAmount !== undefined)) {
      dataHelper.currentStep++;
    }

    if (correctPinEntered && dataHelper.currentStep < 2) {
      response.say(dataHelper.getPrompt());
    }

    response.reprompt("I didn't hear anything");
    response.shouldEndSession(false);
  }

  response.session(DATA_HELPER_SESSION_KEY, dataHelper);
  response.send();
};

var saveTransactionFunction = function(request, response, dataHelper, newTransaction){  
  var success = databaseHelperMock.updateTransactionHistory(USERID, newTransaction);
  if (success) {
    recentTransfer = [dataHelper.userid, dataHelper.paymentAmount, getDate()];
    response.say('Your transaction has saved successfully.');
    response.say('You sent ' + dataHelper.paymentAmount + ' dollars to ' + dataHelper.userid);
  } else {
    response.say('Your transaction was not saved unsuccessful');
  }

  response.shouldEndSession(false).send();
  return success;
}

function getDate() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1;

  var yyyy = today.getFullYear();
  if(dd<10){
    dd='0'+dd;
  } 
  if(mm<10){
    mm='0'+mm;
  } 
  return yyyy + '-' + mm + '-' + dd;
}

module.exports = skillService;
