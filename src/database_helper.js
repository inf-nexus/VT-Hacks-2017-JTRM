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

// DatabaseHelper.prototype.createDatabaseTable = function() {
//   return dynasty.describe(DATABASE_TABLE_NAME).catch(function(err){
//     console.log('createDatabaseTable, err: ', err);
//     return dynasty.create(DATABASE_TABLE_NAME, {
//       key_schema: {
//         hash: ['userId', 'string']
//       }
//     });
//   });
// };

DatabaseHelper.prototype.storeData = function(userId, data){
  console.log('writing to database user: ', userId);
  return databaseTable().insert({
    userId: userId,
    data: JSON.stringify(data)
  }).catch(function(err){
    console.log(err);
  });
};

DatabaseHelper.prototype.readData = function(userId){
  console.log('reading data for user: ' + userId);
  return databaseTable().find(userId).then(function(result){
    var data;
    if(result === undefined){
      data = {};
    }else{
      data = JSON.parse(result['data']);
    }
    return new DatabaseHelper(data);
  }).catch(function(err){
    console.log(err);
  });
};



module.exports = DatabaseHelper;
