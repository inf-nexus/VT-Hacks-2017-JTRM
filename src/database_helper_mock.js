'use strict';
function user(userid, fullname){
  this.name = userid;
  this.fullname = fullname;
  this.transactionHistory = [];
}

function DatabaseHelperMock() {
  console.log('creating database helper mock');
	this.users = [];
  this.dbTestEnvironmentSetup();
}

DatabaseHelperMock.prototype.dbTestEnvironmentSetup = function() {
  var user1 = new user('Jacob Jake', 'Jacob Contreras');
  var user2 = new user('Andrew', 'Andrew Rane');
  var user3 = new user('Timmy Tim Timothy', 'Timothy Tran');
  var user4 = new user('Matt Matthew', 'Matthew Blumen');
  this.users.push(user1);
  this.users.push(user2);
  this.users.push(user3);
  this.users.push(user4);
}

DatabaseHelperMock.prototype.getFullName = function(userID) {
	for (var i = 0; i < this.users.length; i++) {
		if (this.users[i].name.includes(userID)) {
			return this.users[i].fullname;
		}
	}
}

DatabaseHelperMock.prototype.updateTransactionHistory = function(userID, transaction){

    var recipientid = transaction.recipientid;
    var recipientFullName = this.getFullName(recipientid);
    if(!recipientFullName){
      return false;
    }

    for (var i = 0; i < this.users.length; i++) {
  		if (this.users[i].name.includes(userID)) {
        this.users[i].transactionHistory.push(transaction);
        return true;
  		}
  	}

    return false;
}

DatabaseHelperMock.prototype.storeData = function(userID, obj) {
  if(!userID || !obj){
    return false;
  }
  else{
	this.users.push(obj);
  }
}

DatabaseHelperMock.prototype.updateData = function(userID, obj) {
	var fullName = this.getFullName(userID);
	for (var i = 0; i < this.users.length; i++) {
		if (this.users[i].fullName == fullName) {
			this.users[i] = obj;
		}
	}
}

DatabaseHelperMock.prototype.readData = function(userID) {
	var fullName = this.getFullName(userID);
	for (var i = 0; i < this.users.length; i++) {
		if (this.users[i].fullName == fullName) {
			return this.users[i];
		}
	}
}

module.exports = DatabaseHelperMock;
