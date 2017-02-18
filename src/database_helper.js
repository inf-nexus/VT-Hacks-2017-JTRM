'use strict'
//module.change_code = 1;

var data_helper = require('./data_helper');
const DATABASE_TABLE_NAME = 'hokieCalandarTable';
var localUrl = 'http://localhost:4000';

var localCredentials = {
  region: 'us-east-1',
  accessKeyId: 'fake',
  secretAccessKey: 'fake'
};

var localDynasty = require('dynasty')('localCredentials', localUrl);

function DatabaseHelper(){}

var databaseTable = function(){
  return dynasty.table(DATABASE_TABLE_NAME);
};



module.exports = DatabaseHelper;
