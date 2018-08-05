'use strict';

var installMgr = require("./src/installMgr");
var moduleMgr = require("./src/moduleMgr");
var versificationMgr = require("./src/versificationMgr");
var verseKey = require("./src/verseKey");

var sword = {
	installMgr: installMgr,
	moduleMgr: moduleMgr,
	verseKey: verseKey,
	versificationMgr: versificationMgr
};

module.exports = sword;