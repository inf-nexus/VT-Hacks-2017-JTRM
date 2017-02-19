'use strict';
var _=require('lodash');
//var requestPromise = require('request-promise');
//var ENDPOINT = 'http://services.faa.gov/airport/status/';

function DataHelper(obj){
  this.started = false;
  this.currentStep = 0;
  this.userid = null;
  this.paymentAmount = null;
  this.interactionIndex = 0;
  //this.database = [];
  this.interactions = [
    {
      title: "Money Transfer Dialogue",
      steps: [
        {
          value: null,
          prompt: "Ok, who do you want to transfer money to?"
        },
        {
          value: null,
          prompt: 'Ok, how much money would you like to transfer, in US dollars?'
        }]
    }

  ];
  for(var property in obj) this[property] = obj[property];
}

// DataHelper.prototype.currentDataHelper = function(){
//   return this.
// };
DataHelper.prototype.getStep = function(){
    return this.currentInteraction().steps[this.currentStep];
}

DataHelper.prototype.getPrompt = function(){
  return this.getStep().prompt;
};

DataHelper.prototype.completed = function(){
  console.log('current step is ' + this.currentStep);
  //return this.currentStep === 2;
  return this.currentStep === (this.currentInteraction().steps.length - 1);
}

DataHelper.prototype.currentInteraction = function(){
  return this.interactions[this.interactionIndex];
};

// DataHelper.prototype.getData = function(key){
//   var options = {
//     method: 'GET',
//     uri: ENDPOINT + key,
//     json: true
//   };
//   return requestPromise(options);
// };
//DataHelper.prototype.

// DataHelper.prototype.formatDataResponse = function(responseObj){
//   if(responseObj.delay === 'true'){
//     var template = _.template('There is currently a delay for ${airport}.' +
//    'The average delay time is ${delay_time}.');
//    return template({
//      airport: responseObj.name,
//      delay_time: responseObj.status.avgDelay
//    });
//  }else{
//   //no delay
//   var template = _.template('There is currently no delay at ${airport}.');
//   return template({ airport: responseObj.name});
//  }
// };

module.exports = DataHelper;
