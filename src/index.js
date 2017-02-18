'use strict';
//var Alexa = require('alexa-sdk');
//module.change_code = 1;
var Promise = require('promise');
var Alexa = require('alexa-app');
var skillService = new Alexa.app('capitalOneP2PTransfer');
const AWS = require('aws-sdk');
//var _ = require('lodash');
var appId = 'amzn1.ask.skill.f6116fb0-3213-4020-9e12-7cec70174fcc';

var dynamodb = new AWS.DynamoDB({region: 'us-east-1'});
var docClient = new AWS.DynamoDB.DocumentClient({service: dynamodb}); //use to operate on db

var _ = require('lodash');
//var localDBStorage = []; //will be populated by dynamodb
var DataHelper = require('./data_helper');
var DATA_HELPER_SESSION_KEY = 'data_session';
var DatabaseHelper = require('./database_helper');
var databaseHelper = new DatabaseHelper();

var getDataHelper = function(dataHelperData){

  if(dataHelperData === undefined){
    dataHelperData = {};
  }
  return new DataHelper(dataHelperData);
};

  let Transaction = function(userId, paymentAmount){
      this.userId = userId;
      this.paymentAmount = paymentAmount;
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

var saveDataFunction = function(userId, obj, request, response){
  //console.log('in save data');
  databaseHelper.storeData(userId, obj).then(
    function(result){
      return result;
    }).catch(function(err){
      console.log(err);
    });
    response.say('you have successfully sent money to ', userId);
    response.shouldEndSession(true);
}

skillService.intent('PaymentIntent',{
  'slots':[{'NAME': 'AMAZON.US_FIRST_NAME'},{'AMOUNT': 'AMAZON.NUMBER'}],
  'utterances': ['{pay} {-|NAME}','{-|AMOUNT} {dollars}']
  //'utterances': ['{|give} {|me} {|data} {|on} {-|QUERY_LIST}']
  //'utterances': ['{new|start|create|begin|build} {|a|the} madlib', {'-QUERY_LIST'}]
},
function(request, response){

      paymentIntentFunction(getDataHelperFromRequest(request),request, response);
      //var requestCompleted = false;
      //paymentIntentFunction(requestCompleted, request, response);
  }
);

var paymentIntentFunction = function(dataHelper, request, response){
  //var requestCompleted = false;
  var userId = request.slot('NAME');
  var paymentAmount = request.slot('AMOUNT');

  dataHelper.started = true;
  if(userId !== undefined){
    dataHelper.getStep().value = userId;
    dataHelper.userId = userId;
    //dataHelper.currentStep++;
  }

  if(paymentAmount !== undefined){
    dataHelper.getStep().value = paymentAmount;
    dataHelper.paymentAmount = paymentAmount;
    //dataHelper.currentStep++;
  }

  if(dataHelper.completed()){
    console.log('in completed step');
    var newTransaction = new Transaction(dataHelper.userId, dataHelper.paymentAmount);

    response.say('your transaction has successfully been completed');
    response.say('you sent ' + dataHelper.paymentAmount + 'dollars to ' + dataHelper.userId);
    //saveTransactionFunction(request, response, userId, newTransaction);

    //saveDataFunction(userId, newTransaction, request, response);
    response.shouldEndSession(true);
  }else{

    if(userId !== undefined || paymentAmount !== undefined){
      console.log('incrementing step');
      dataHelper.currentStep++;
    }
    console.log('here');
    if(dataHelper.currentStep < 2){
    response.say(dataHelper.getPrompt());
  }
    response.reprompt("I didn't hear anything");
    response.shouldEndSession(false);
  }
  response.session(DATA_HELPER_SESSION_KEY, dataHelper);
  response.send();
};

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
  var newTransaction = new Transaction(userId, paymentAmount);

  //databaseHelper.storeData(userId, newTransaction).then(
    //return false;

  }
);

 module.exports = skillService;
