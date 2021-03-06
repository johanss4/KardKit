var CardHolder = require('./cardHolder.js');
var util = require("util");

function Hand(cardholder) {
	this.cards = cardholder.cards;
}
util.inherits(Hand, CardHolder);

//takes a card of choice and places it in the destination holder
Hand.super_.prototype.play = function(index, destination) {
	var temp = this.cards.splice(index, 1)[0];
	destination.insert(temp);
}

if (typeof module !== 'undefined') {
    module.exports = Hand;
}
