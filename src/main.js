'use strict';

const installMgr = require('./installMgr');
const dataMgr = require('./dataMgr');
const moduleMgr = require('./moduleMgr');
const verseKey = require('./verseKey');

function handleModuleSelect(evt) {
    installMgr.installModule(evt.target.files[0], function (inError, inId) {
        if(!inError)
        	console.log("Installed");
        else
            console.log("ERROR Installing Module", inError);
    });
}

function clearDatabase (evt) {
    dataMgr.clearDatabase();
}

function removeModule(evt) {
    installMgr.removeModule("SBLGNT", function (inError) {
        console.log(inError);
        if(!inError)
            console.log("Removed Module");
    });
}

function getText() {
    //console.log(document.getElementById("passageInput").value);
    moduleMgr.getModules(function (inError, inModules) {
        if(inModules.length !== 0) {
            // console.log(inModules);
            inModules[0].renderText(document.getElementById("passageInput").value, {
                footnotes: true,
                crossReferences: true,
                oneVersePerLine: false,
                headings: true,
                wordsOfChristInRed: true,
                intro: false,
                array: false
            }, function (inError, inResult) {
                console.log(inError, inResult);
                document.getElementById("out").innerHTML = inResult.text;
                if(inResult.footnotes)
                    for (var key in inResult.footnotes) {
                        document.getElementById("notes").innerHTML += inResult.footnotes[key][0].note + "<br><br>";
                    }
            });
        } else {
            document.getElementById("out").innerHTML = "No modules installed";
        }
    });
}

function next() {
    console.log(verseKey.next(document.getElementById("passageInput").value));
    document.getElementById("out").innerHTML = verseKey.next(document.getElementById("passageInput").value);
}

function prev() {
    console.log(verseKey.previous(document.getElementById("passageInput").value));
    document.getElementById("out").innerHTML = verseKey.previous(document.getElementById("passageInput").value);
}

function worker () {
    installMgr.getRepositories("http://biblez.de/swordjs/getMasterlist.php", function (inError, inResult) {
        console.log(inError, inResult);
        installMgr.getRemoteModules(inResult[2], "http://biblez.de/swordjs/getRemoteModules.php", function (inError, inModules) {
            console.log(inError, inModules);
        })
    });
}

document.getElementById("files").addEventListener('change', handleModuleSelect, false);
document.getElementById("btnClear").addEventListener('click', clearDatabase, false);
document.getElementById("btnRemove").addEventListener('click', removeModule, false);
document.getElementById("btnPassage").addEventListener('click', getText, false);
document.getElementById("btnNext").addEventListener('click', next, false);
document.getElementById("btnPrev").addEventListener('click', prev, false);
document.getElementById("btnWorker").addEventListener('click', worker, false);