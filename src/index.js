'use strict';
var Alexa = require('alexa-app');
var skillService = new Alexa.app('capitalOneP2PTransfer');
const AWS = require('aws-sdk');

var appId = 'amzn1.ask.skill.f6116fb0-3213-4020-9e12-7cec70174fcc';

const USERID = 'Jacob'; //who you are in the database
const FRIENDSLIST = ['Rohan', 'Matt', 'Timmy'];

var ajax = require('superagent');

var apikey = 'b7b749abc5269fb91882402aad541b37';
var myAccountID = '56c66be6a73e492741507f63';

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
  var prompt = 'Welcome to Capital One P2P Transfer';
  response.say(prompt).reprompt(reprompt).shouldEndSession(false);
});

var cancelIntentFunction = function(request, response) {
  response.say('Closing app. See you later!').shouldEndSession(true);
};

skillService.intent('AMAZON.CancelIntent',{}, cancelIntentFunction);
skillService.intent('AMAZON.StopIntent',{}, cancelIntentFunction);

skillService.intent('AMAZON.HelpIntent',{},
  function(request, response){
    var help = 'Welcome to Capital One P2P Transfer'
    + 'To transfer money, say transfer money'
    + 'To request money, say request money'
    + 'You can also say stop or cancel to exit.';
    if(dataHelper.started){
      help = 'default help message';
    }
    response.say(help).shouldEndSession(false);
  });

var getDataHelperFromRequest = function(request) {
    var dataHelperData = request.session(DATA_HELPER_SESSION_KEY);
    return getDataHelper(dataHelperData);
};


skillService.intent('PaymentIntent',{
  'slots':[{'NAME': 'AMAZON.US_FIRST_NAME'},{'AMOUNT': 'AMAZON.NUMBER'}],
  'utterances': ['{pay} {-|NAME}','{-|AMOUNT} {dollars}',
  '{transfer} {-|AMOUNT} {dollars to} {-|NAME}']
}, function(request, response){
      var helper = paymentIntentFunction(getDataHelperFromRequest(request),request, response);
      var name = databaseHelperMock.getFullName(helper.userid).split(" ");

      var newTransaction = new transaction(helper.userid, 'payment', helper.paymentAmount);

      makeTransfer(name[0], name[1], parseInt(helper.paymentAmount, 10));
      console.log('Sleeping...');

      saveTransactionFunction(request, response, helper, newTransaction);
  }
);

var paymentIntentFunction = function(dataHelper, request, response){
  var userId = request.slot('NAME');
  var paymentAmount = request.slot('AMOUNT');

  dataHelper.started = true;
  if (userId && paymentAmount) {
    dataHelper.currentStep++;
  }

  if (userId !== undefined) {
    dataHelper.getStep().value = userId;
    dataHelper.userid = userId;
  }

  if (paymentAmount !== undefined) {
    dataHelper.getStep().value = paymentAmount;
    dataHelper.paymentAmount = paymentAmount;
  }

  if (dataHelper.completed()) {
    return dataHelper;

  } else {
    if (userId !== undefined || paymentAmount !== undefined) {
      dataHelper.currentStep++;
    }

    if (dataHelper.currentStep < 2) {
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
    response.say('Your transaction has successfully been completed');
    response.say('You sent ' + dataHelper.paymentAmount + ' dollars to ' + dataHelper.userid);
  } else {
    response.say('Your transaction was unsuccessful');
  }

  response.shouldEndSession(true).send();
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

function makeTransfer(firstName, lastName, amount) {
  var cid;
  var aid;
  console.log('Starting Transfer');
  var getCustomersUrl = 'http://api.reimaginebanking.com/customers/?key='.concat(apikey); 
  ajax.get(getCustomersUrl).end(function(err, res) {
        if (err) {
          //console.log(err.body);
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


module.exports = skillService;
