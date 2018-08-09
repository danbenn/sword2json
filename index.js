'use strict';

var installMgr = require("./src/installMgr");
var versificationMgr = require("./src/versificationMgr");
var verseKey = require("./src/verseKey");

var sword = {
	installMgr: installMgr,
	verseKey: verseKey,
	versificationMgr: versificationMgr
};

module.exports = sword;