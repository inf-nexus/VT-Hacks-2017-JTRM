'use strict';

function DatabaseHelperMock() {
	this.users = [
		{"name":"Lynn Mom", "fullName":"Lynn Blumen", "transferMoney":0},
		{"name":"Russ Russell Dad", "fullName":"Russell Blumen", "transferMoney":0},
		{"name":"Jacob Jake", "fullName":"Jacob Contreras", "transferMoney":0},
		{"name":"Rohan", "fullName":"Rohan Rane", "transferMoney":0},
		{"name":"Matthew Matt", "fullName":"Matthew Blumen", "transferMoney":0},
		{"name":"Timothy Timmy Tim", "fullName":"Timothy Tran", "transferMoney":0},
		{"name":"Kyle", "fullName":"Kyle Long", "transferMoney":0},
		{"name":"Robin", "fullName":"Robin Marx", "transferMoney":0},
		{"name":"David", "fullName":"David Branson", "transferMoney":0},
		{"name":"Alissa", "fullName":"Alissa Dellork", "transferMoney":0},
		{"name":"Elliot", "fullName":"Elliot Silverman", "transferMoney":0},
		{"name":"Brittany Britt", "fullName":"Brittany Adams", "transferMoney":0},
		{"name":"Robert Bill Billy", "fullName":"Robert Pratt", "transferMoney":0},
		{"name":"Ethan", "fullName":"Ethan Vu", "transferMoney":0},
		{"name":"Megan Meg", "fullName":"Megan Ancarrow", "transferMoney":0},
		{"name":"Hannah", "fullName":"Hannah Kay", "transferMoney":0},
		{"name":"Sarah", "fullName":"Sarah Spinner", "transferMoney":0}
	];
}

DatabaseHelperMock.prototype.getFullName = function(userID) {
	for (var i = 0; i < users.length; i++) {
		if (this.users[i].name.includes(userID)) {
			return this.users[i].fullName;
		}
	}
}

DatabaseHelperMock.prototype.storeData = function(userID, obj) {
	this.users.push(obj);
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