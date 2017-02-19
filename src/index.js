
'use strict';

var twilio = require('twilio');
var ajax = require('superagent');
var Alexa = require('alexa-app');
var skillService = new Alexa.app('capitalOneP2PTransfer');
const AWS = require('aws-sdk');
//var _ = require('lodash');
var appId = 'amzn1.ask.skill.f6116fb0-3213-4020-9e12-7cec70174fcc';
const demoSiteUrl = "http://ec2-35-161-84-87.us-west-2.compute.amazonaws.com/matthewblumen/home.html";

const USERID = 'Jacob'; //who you are in the database
const FRIENDSLIST = ['Rohan', 'Matt', 'Timmy'];

var dynamodb = new AWS.DynamoDB({region: 'us-east-1'});
var docClient = new AWS.DynamoDB.DocumentClient({service: dynamodb}); //use to operate on db

var pinNotEneteredMessage = 'Please enter pin to proceed';
var correctPinEntered;


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
  correctPinEntered = false;
  var prompt = 'Welcome to Capital One P2P Transfer' +
               'please enter your pin to continue';
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
    var help = 'To transfer money, say transfer money'
    + 'To request money, say request money'
    + 'You can also say stop or cancel to exit.';
    // if(dataHelper.started){
    //   //help = dataHelper.getStep().help
    //   help = 'default help message';
    // }
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

skillService.intent('VerificationIntent',{
  'slots':[{'PIN': 'AMAZON.FOUR_DIGIT_NUMBER'}],
  'utterances': ['{-|PIN} {enter}']
},
function(request,response){
  console.log('here');
  var userPin = request.slot('PIN');
  console.log('here2');
  if(userPin && userPin == '1234'){
    response.say('Pin confirmed you may proceed').shouldEndSession(false);
    correctPinEntered = true;

  }else{
    response.say('Incorrect pin entered').shouldEndSession(false);
  }

  response.send();
});

skillService.intent('PaymentIntent',{
  'slots':[{'NAME': 'AMAZON.US_FIRST_NAME'},{'AMOUNT': 'AMAZON.NUMBER'}],
  'utterances': ['{pay} {-|NAME}','{-|AMOUNT} {dollars}',
  '{transfer} {-|AMOUNT} {dollars to} {-|NAME}']
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
  if(!correctPinEntered){
    response.say('please enter correct pin to proceed').shouldEndSession(false);
    response.send();
  }
  //var requestCompleted = false;
  var userId = request.slot('NAME');
  var paymentAmount = request.slot('AMOUNT');
  dataHelper.started = true;

  if(correctPinEntered && userId && paymentAmount){
    console.log('userid is '+ userId);
    console.log('paymentAmount is ' + paymentAmount);
    console.log('in one liner response');
    dataHelper.currentStep++;
    //dataHelper.currentStep += 2;
    //console.log('completed is ' + )

  }

  if(correctPinEntered && userId !== undefined){
    dataHelper.getStep().value = userId;
    dataHelper.userid = userId;
    //dataHelper.currentStep++;
  }

  if(correctPinEntered && paymentAmount !== undefined){
    dataHelper.getStep().value = paymentAmount;
    dataHelper.paymentAmount = paymentAmount;
    //dataHelper.currentStep++;
  }

  if(correctPinEntered && dataHelper.completed()){
    console.log('in completed step');
    var newTransaction = new transaction(dataHelper.userid, 'payment', dataHelper.paymentAmount);
    var success = saveTransactionFunction(request, response, dataHelper, newTransaction);

  }else{

    if(correctPinEntered && (userId !== undefined || paymentAmount !== undefined)){
      //console.log('incrementing step');
      dataHelper.currentStep++;
    }
    //console.log('here');
    if(correctPinEntered && dataHelper.currentStep < 2){
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

skillService.intent('SaveTransactionIntent', {},function(request, response) {

  // return ajax.post(demoSiteUrl).set('Content-Type', 'text/javascript').send({
  //             "userid": "jake",
  //             "message": "hey matt"
  //           }).then(res => {
  //             console.log('im here');
  //             console.log(res.status);
  //             console.log(res.body);
  //             //saveTransactionFunction(request, response, helper, newTransaction);
  //           });

            // Find your account sid and auth token in your Twilio account Console.
var client = twilio('AC15fb06ea622866e228ae46eb7b9d7a1e', '60bf6e80807bd635f109f59acdf7cee7');
var pin = Math.round(Math.random()*10000);
console.log(pin);
// Send the text message.
client.sendMessage({
  to: '+15712715593',
  //to: '+17032292405',
  from: '+12403033123',
  body: 'Here is your random PIN: '.concat(pin)
}).then(res =>{
  console.log('awaiting reply');
});


  });

 module.exports = skillService;
