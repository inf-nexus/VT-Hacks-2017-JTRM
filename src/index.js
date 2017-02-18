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

// skillService.pre = function(request, response, type){
//   databaseHelper.createDatabaseTable();
// };

var getDataHelper = function(dataHelperData){
  //console.log('here in getDataHelper');
  //var getDataHelper = request.session(DATA_HELPER_SESSION_KEY);
    //console.log('here in past getDataHelper');
  if(dataHelperData === undefined){
    dataHelperData = {};
  }
  return new DataHelper(dataHelperData);
};

  let Transaction = function(userId, paymentAmount){
      this.userId = userId;
      this.paymentAmount = paymentAmount;
  };

// let item = {
//   init: function (className) {
//     this.className = className;
//     this.assignments = [];
//   },
//   addAssignment: function(assignment){
//     this.assignments.push(assignment);
//   }
//
// };
//
// let assignment = {
//   init: function(dateDue){
//     this.dateDue = dateDue;
//     this.avgCompletionTime = [];
//     this.completed = false;
//   },
//   setAssignmentCompleted: function(){
//     this.completed = true;
//   }
//
// }
//
// let completionTimeObj = {
//   init: function(){
//     this.completionTime = false;
//     this.associatedKeyWords = [];
//   },
//   addKeyWord: function(keyword){
//     this.associatedKeyWords.push(keyword);
//   }
// }

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

// skillService.intent('SaveDataIntent', {
//   'utterances': ['{save} {|this|my} data']
// },
// function(request, response){
//   var userId = request.userId;
//   var dataHelper = getDataHelperFromRequest(request);
//   databaseHelper.storeData(userId, dataHelper).then(
//     function(result){
//       return result;
//     }).catch(function(err){
//       console.log(err);
//     });
//     response.say('your data has successfully been stored.');
//     response.shouldEndSession(true).send();
//     return false;
// });

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

  return new Promise(function (fullfill, reject){
    databaseHelper.storeData(userId, newTransaction).then(
      function(result) {
        return result;
      }).catch(function(error) {});
    response.say(
      'Your transaction has been saved.'
    );
    response.shouldEndSession(true).send();
  });


    //return false;

}
);
//
  //var prompt_one = 'Ok, who do you want to transfer money to?';

  //var prompt_two = 'Ok, how much money do you want to transfer, in US dollars?';
  //response.say(prompt_one);



  // if(userId !== undefined){
  //   response.say('Ok, how much money do you want to transfer, in US dollars?');
  //   requestCompleted = true;
  // }else{
  //   response.reprompt("I didn't understand that could you repeat that");
  // }

  // response.say('Ok, how much money do you want to transfer, in US dollars?');
  // var paymentAmount = request.slot('AMOUNT');
  //
  // if(paymentAmount === undefined){
  //   response.reprompt("I didn't understand could you repeat that");
  // }
  // var newTransaction = new Transaction(userId, paymentAmount);
  //
  // if(userId !== undefined && paymentAmount !== undefined){
  //   saveDataFunction(userId, newTransaction, request, response);
  // }

  //var stepValue = request.slot('Query');
  //var dataHelper = new DataHelper();
  // var dataHelper = getDataHelper(request);
  // dataHelper.started = true;
  // if(stepValue !== undefined){
  // dataHelper.getStep().value = stepValue;
  // }
  // if(dataHelper.completed()){
  //   var completedMadLib = dataHelper.buildMadlib();
  //   response.card('data to be stored', stepValue);
  //   response.say('Data is successfully stored!'
  // + 'Data that is store is ' + stepValue);
  // response.shouldEndSession(true);
  // }else{
  //   if(stepValue !== undefined){
  //     dataHelper.currentStep++;
  //   }
  //   response.say('Give me ' + dataHelper.getPrompt());
  //   response.reprompt("I didn't hear anything give me " +
  //   dataHelper.getPrompt() + 'to continue');
  //   response.shouldEndSession(false);
  // }
//   console.log('here in paymentIntentFunction');
//   if(requestCompleted){
//       response.shouldEndSession(true);
//   }else{
//     response.shouldEndSession(false);
//   }
//
//     console.log('here out of paymentIntentFunction');
//   //response.session(DATA_HELPER_SESSION_KEY, dataHelper);
//   //response.send();
// };



 module.exports = skillService;
//   var userRequest = request.slot('Query');
//   if(_.isEmpty(userRequest)){
//     var prompt = "I didn't hear a request. Give me a request.";
//     response.say(prompt).reprompt(reprompt).shouldEndSession(false);
//     return true;
//   }else{
//   var dataHelper = new DataHelper();
//   dataHelper.getData(userRequest).then(function(responseObj){
//     console.log(responseObj);
//     response.say(dataHelper.formatDataResponse(responseObj)).send();
//   }).catch(function(err){
//     console.log(err.statusCode);
//     var prompt = "I dont have data for " + userRequest;
//     response.say(prompt).reprompt(reprompt).shouldEndSession(false).send();
//   });
//
//   return false;
// }

//

// //-------------prototype examples-----------------
// // var coolItem = Object.create(item);
// // coolItem.init('systems');
// // coolItem.addAssignment('compLang hw1');
// // console.log(coolItem);
// // var assignment2 = Object.create(assignment);
// // assignment2.init(new Date().toISOString());
// // console.log(assignment2);
//
// // exports.handler = function(event, context, callback){
// //
// //     var params = {
// //         TableName: 'hokieCalandarTable'
// //     };
// //
// //     localDBStorage = docClient.scan(params, function(err, data){
// //       if(err) console.log(err);
// //       else console.log(data);
// //     });
// //
// //     var alexa = Alexa.handler(event, context);
// //     alexa.appId = appId;
// //     alexa.registerHandlers(handlers);
// //     alexa.execute();
// //   };
//
//
//


  //---------------------put example--------------------------------//
  // var params = {
  //   TableName: 'hokieCalandarTable',
  //
  //   Item: {
  //       userid: 'jacob',
  //       message: 'sample message'
  //   }
  //
  // };
  //
  // docClient.put(params,function(err, data){
  //   console.log('attempting to put object in docClient');
  //     if(err){
  //
  //       callback(err, null);
  //
  //     }else{
  //
  //       callback(null,data);
  //     }
  //
  // });
  //---------------------put example--------------------------------//
