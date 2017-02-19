'use strict';
//var Alexa = require('alexa-sdk');
//module.change_code = 1;
var Alexa = require('alexa-app');
var skillService = new Alexa.app('capitalOneP2PTransfer');
const AWS = require('aws-sdk');
//var _ = require('lodash');
var appId = 'amzn1.ask.skill.f6116fb0-3213-4020-9e12-7cec70174fcc';

const USERID = 'Jacob'; //who you are in the database
const FRIENDSLIST = ['Rohan', 'Matt', 'Timmy'];

var ajax = require('superagent');

var apikey = 'b7b749abc5269fb91882402aad541b37';
var myAccountID = '56c66be6a73e492741507f63';

//var dynamodb = new AWS.DynamoDB({region: 'us-east-1'});
//var docClient = new AWS.DynamoDB.DocumentClient({service: dynamodb}); //use to operate on db



var _ = require('lodash');
//var localDBStorage = []; //will be populated by dynamodb
var DataHelper = require('./data_helper');
var DATA_HELPER_SESSION_KEY = 'data_session';
var DatabaseHelper = require('./database_helper');
var databaseHelper = new DatabaseHelper();

var DatabaseHelperMock = require('./database_helper_mock');
var databaseHelperMock = new DatabaseHelperMock();
//databaseHelperMock.dbTestEnvironmentSetup();

//console.log('fullname is ' + databaseHelperMock.getFullName('matt'));

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
skillService.launch(function(request, response){
  var prompt = 'Welcome to Capital One P2P Transfer' +
  'You can either transfer money or request money.';
    //console.log('here in skillService launch');
  response.say(prompt).reprompt(reprompt).shouldEndSession(false);
    //console.log('here out of skillService launch');
});

var cancelIntentFunction = function(request, response){

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
      //help = dataHelper.getStep().help
      help = 'default help message';
    }
    response.say(help).shouldEndSession(false);
  });

var getDataHelperFromRequest = function(request){
    //console.log('here in getDataHelperFromRequest');
    var dataHelperData = request.session(DATA_HELPER_SESSION_KEY);
    //console.log('here out of getDataHelperFromRequest');
    return getDataHelper(dataHelperData);
};

// var saveDataFunction = function(userId, obj, request, response){
//   //console.log('in save data');
//   databaseHelper.storeData(userId, obj).then(
//     function(result){
//       return result;
//     }).catch(function(err){
//       console.log(err);
//     });
//     response.say('you have successfully sent money to ', userId);
//     response.shouldEndSession(true);
// }

skillService.intent('PaymentIntent',{
  'slots':[{'NAME': 'AMAZON.US_FIRST_NAME'},{'AMOUNT': 'AMAZON.NUMBER'}],
  'utterances': ['{pay} {-|NAME}','{-|AMOUNT} {dollars}']
  //'utterances': ['{|give} {|me} {|data} {|on} {-|QUERY_LIST}']
  //'utterances': ['{new|start|create|begin|build} {|a|the} madlib', {'-QUERY_LIST'}]
},
function(request, response){
      var helper = paymentIntentFunction(getDataHelperFromRequest(request),request, response);
      var name = databaseHelperMock.getFullName(helper.userid).split(" ");
      var newTransaction = new transaction(helper.userid, 'payment', helper.paymentAmount);
      makeTransfer(name[0], name[1], parseInt(helper.paymentAmount, 10));
      saveTransactionFunction(request, response, helper, newTransaction);
  }
);

var paymentIntentFunction = function(dataHelper, request, response){
  //var requestCompleted = false;
  var userId = request.slot('NAME');
  var paymentAmount = request.slot('AMOUNT');

  dataHelper.started = true;
  if(userId !== undefined){
    dataHelper.getStep().value = userId;
    dataHelper.userid = userId;
    //dataHelper.currentStep++;
  }

  if(paymentAmount !== undefined){
    dataHelper.getStep().value = paymentAmount;
    dataHelper.paymentAmount = paymentAmount;
    //dataHelper.currentStep++;
  }

  if(dataHelper.completed()){
    console.log('in completed step');
    return dataHelper;
  } else {

    if(userId !== undefined || paymentAmount !== undefined){
      //console.log('incrementing step');
      dataHelper.currentStep++;
    }
    //console.log('here');
    if(dataHelper.currentStep < 2){
    response.say(dataHelper.getPrompt());
  }
    response.reprompt("I didn't hear anything");
    response.shouldEndSession(false);
  }
  response.session(DATA_HELPER_SESSION_KEY, dataHelper);
  response.send();
};

var saveTransactionFunction = function(request, response, dataHelper, newTransaction){
  //var success = databaseHelperMock.storeData(userId, newTransaction);
  //var newTransaction = new transaction()
  console.log('userid is: ' + newTransaction.recipientid);
  console.log('fullname of recipient is: ' + databaseHelperMock.getFullName(dataHelper.userid));

  var success = databaseHelperMock.updateTransactionHistory(USERID, newTransaction);
  if(success){
    response.say('your transaction has successfully been completed');
    response.say('you sent ' + dataHelper.paymentAmount + 'dollars to ' + dataHelper.userid);
  }else{
    response.say('your transaction was unsuccessful');
  }
  response.shouldEndSession(true).send();
  return success;
}

// var saveTransactionFunction = function(request, response, userId, newTransaction){
//   databaseHelper.storeData(userId, newTransaction).then(
//     function(result) {
//       return result;
//     }).catch(function(error) {});
//   response.say(
//     'Your transaction has been saved.'
//   );
//   response.shouldEndSession(true).send();
//   return false;
// }

skillService.intent('SaveTransactionIntent', {},
  function(request, response) {
  var userId = 'jacob';
  var paymentAmount = 50;
  //var newTransaction = new Transaction(userId, paymentAmount);

  //databaseHelper.storeData(userId, newTransaction).then(
    //return false;

  }
);

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


 module.exports = skillService;
