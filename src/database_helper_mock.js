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
      console.log('starting database helper mock');

  var user1 = new user('Jacob', 'Jacob Contreras');
  var user2 = new user('Rohan', 'Rohan Rane');
  var user3 = new user('Timmy', 'Timmy Tran');
  var user4 = new user('Matt', 'Matt Blumen');
  this.users.push(user1);
  this.users.push(user2);
  this.users.push(user3);
  this.users.push(user4);
    console.log('finished database helper mock');

}

DatabaseHelperMock.prototype.getFullName = function(userID) {
	for (var i = 0; i < users.length; i++) {
		if (this.users[i].name.includes(userID)) {
			return this.users[i].fullName;
		}
	}
}

DatabaseHelperMock.prototype.updateTransactionHistory = function(userID, obj){
    for (var i = 0; i < this.users.length; i++) {
  		if (this.users[i].name.includes(userID)) {
  			//return this.users[i].fullName;
        this.users[i].transactionHistory.push(obj);
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
			return users[i];
		}
	}
}

module.exports = DatabaseHelperMock;
