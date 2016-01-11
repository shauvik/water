/*
This Program contains software licensed pursuant to the following: 
MOZILLA PUBLIC LICENSE
Version 1.1
The contents of this file are subject to the Mozilla Public License
Version 1.1 (the "License"); you may not use this file except in
compliance with the License. You may obtain a copy of the License at
http://www.mozilla.org/MPL/

Software distributed under the License is distributed on an "AS IS"
basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See the
License for the specific language governing rights and limitations
under the License.
The Original Code is IBM.
The Initial Developer of the Original Code is IBM Corporation.
Portions created by IBM Corporation are Copyright (C) 2007
IBM Corporation. All Rights Reserved.
Contributor(s): Greg Little, Allen Cypher (acypher@us.ibm.com), Tessa Lau, Clemens Drews, James Lin, Jeffrey Nichols, Eser Kandogan, Jeffrey Wong, Gaston Cangiano, Jeffrey Bigham.

This Program also contains a code package known as 'inheritance methods' that is licensed pursuant to the license listed below. 
inheritance methods
The program known as 'inheritance methods' is licensed under the terms below. Those terms are reproduced below for your reference.

Copyright (c) 2000-2004, Kevin Lindsey
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

    - Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.

    - Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

    - Neither the name of this software nor the names of its contributors
      may be used to endorse or promote products derived from this software
      without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

This Program also contains a code package known as developer.mozilla.org sample code that is licensed pursuant to the license listed below. 
developer.mozilla.org sample code 
The program known as developer.mozilla.org sample code is licensed under the terms below. Those terms are reproduced below for your reference.

The MIT License
Copyright (c) 2007 Mozilla
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions: 
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software. 
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

// coscripter-sidebar.js, coscripter-command-processor.js, coscripter-context.js, coscripter-local-save.js, 
// coscripter-editor-richtextbox.js, coscripter-scratch-space-sidebar.js
// and coscripter-dom-utils.js 
// are all loaded into the sidebar coscripterWindow by coscripter-siderbar.xul. 
///////////////////////////////////////////////////
//////////////  coscripter-sidebar.js  ///////////////
///////////////////////////////////////////////// 
//    This file contains interface code for interaction with the sidebar and load/save scripts to wiki,
///////////////////////////////////////////////// 
//		
//		Global Variables
//
//		Initializing the sidebar
// 	(onLoad, initializeSidebar, onUnload)	
//
//		Loading a Procedure into the sidebar
//			Procedure Object
//			loadProcedure	
//			loadProcedureData
//
//		Editor (aka Procedure Interactor) functions
//		(initializeProcedureInteractor, processCurrentLine)	
//
//		Sidebar UI
//		(onStep, onRun, onStop, startRunning, stopRunning
//			onRecord, startRecording, stoprecording, onNew, onOpen)
//			onNew
//		
//		Saving a Procedure
//		(saveProcedure, saveProcedureToWiki)
//		
//		Utilities
////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////////
//					Global Variables
/////////////////////////////////////////////////////////////////////////////////////////////////
// Editor (aka Procedure interactor widget)
var procedureInteractor = null
var currentProcedure = null //new Procedure() ;
var currentCoScript = null //PbD uses a CoScript object, which is richer than the Procedure object
var testSidebarP = false
var uuidTitlePairs = {}	//a pairing  of local coscript file UUIDs with their corresponding coscript Titles
var currentScriptExecutionNumber = -1	// Keep a count of every time the current script has been loaded into this user profile.  Used by abstracter to save all executed actions.
var currentActionNumber = 0	// After loading a script, each executed or recorded action (i.e. PerformedStep) is numbered
var lastExecutedLineNumber = -1	// Whenever a line is executed, CommandProcessor.executeStep notes the editor's LineNumber. Then receiveRecordedCommand knows which line was executed to produce the recordedCommand.
var edited = false
var lastExecutableLineWasExecutedP = false	// used so we can report when a script was fully executed
var loadingScript = -1	// used to suppress onChange events in the Editor
var wikiNotified = false;
var TEXT_NODE = 3;
var previousCommand = null	//a command object. Used by insertCommand in command-processor
// Recording
var recorder = null
var recording = false

var coscripter = window.top.coscripter	// mainChromeWindow's coscripter object (from coscripter-browser-overlay.js)
// Component services
const CC = Components.classes, CI = Components.interfaces, CIS = CI.nsISupports
var consoleService = CC['@mozilla.org/consoleservice;1'].getService(CI.nsIConsoleService)
var promptService = CC['@mozilla.org/embedcomp/prompt-service;1']
			.getService(CI.nsIPromptService)
function debug(msg) {
	//return ;	//comment out to turn on debugging
	consoleService.logStringMessage(msg)
}

var nativeJSON = CC["@mozilla.org/dom/json;1"].createInstance(CI.nsIJSON)

var components = Components.classes["@coscripter.ibm.com/registry;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
// Interpreter
var slopInterpreter = CC["@coscripter.ibm.com/coscripter-slop-interpreter/;1"].getService(CIS).wrappedJSObject


function getCommandGenerator(){
		return components.commandGenerator() ;
}

// PbD Command generator
var g_PbDCommandGenerator = null ;
function getPbDCommandGenerator() {	// Get the command generator
	// Ensure single instance
	if (g_PbDCommandGenerator == null) {
		g_PbDCommandGenerator = CC["@coscripter.ibm.com/coscripter-pbd-command-generator;1"].getService(CIS).wrappedJSObject;
	}
	return g_PbDCommandGenerator;
}

// TODO: Below should be part of Interpreter
var EXECUTION_FAILED = 0;
var EXECUTION_SUCCEEDED = 1;
var EXECUTION_COMPLETED = 2;
var EXECUTION_REQUIRES_USER_ACTION = 3;
var EXECUTION_REQUIRES_USER_DATA = 4;
var EXECUTION_SKIPPED_COMMENT = 5;
var EXECUTION_NULL_ACTION = 6;
var EXECUTION_TARGET_NOT_FOUND = 7;
var EXECUTION_PARSE_ERROR = 8 ;


//  Folders in User's FFox Profile 
// Create a "CoScripterData" folder which contains a "CoScripterScripts" subfolder 
var coscripterDataFolder = CC["@mozilla.org/file/directory_service;1"]
                     .getService(CI.nsIProperties)
                     .get("ProfD", CI.nsIFile);
coscripterDataFolder.append("CoScripterData");
if( !coscripterDataFolder.exists() || !coscripterDataFolder.isDirectory() )	
	{coscripterDataFolder.create(CI.nsIFile.DIRECTORY_TYPE, 0755);}
var coScriptFolder = coscripterDataFolder.clone();
coScriptFolder.append("CoScripts");
if( !coScriptFolder.exists() || !coScriptFolder.isDirectory() ){
	coScriptFolder.create(CI.nsIFile.DIRECTORY_TYPE, 0755);
}
var coscripterPageDataFolder = coScriptFolder.clone();
coscripterPageDataFolder.append("PageData");
if( !coscripterPageDataFolder.exists() || !coscripterPageDataFolder.isDirectory() ){
	coscripterPageDataFolder.create(CI.nsIFile.DIRECTORY_TYPE, 0755);
}
var idUuidPairsFile = coScriptFolder.clone();
idUuidPairsFile.append("idUuidPairs");
if( !idUuidPairsFile.exists() || idUuidPairsFile.isDirectory() ){
	idUuidPairsFile.create(CI.nsIFile.NORMAL_FILE_TYPE, 0664);
}
var coscripterLogFolder = coscripterDataFolder.clone();
coscripterLogFolder.append("Logs");
if( !coscripterLogFolder.exists() || !coscripterLogFolder.isDirectory() ){
	coscripterLogFolder.create(CI.nsIFile.DIRECTORY_TYPE, 0755);
}

var fScriptStream = CC["@mozilla.org/network/file-output-stream;1"].createInstance(CI.nsIFileOutputStream);
var filePicker = CC["@mozilla.org/filepicker;1"].createInstance(CI.nsIFilePicker);

var coscripterConceptLearner = null;

function getCommandProcessor() {
	return CommandProcessor;
}

//////////////////////////////////////////////////////////////////////////////////////////////////
//		Initializing the sidebar
// 	(onLoad, initializeSidebar, onUnload)	
/////////////////////////////////////////////////////////////////////////////////////////////////

// this is called every time the sidebar is opened
function onLoad() {
	window.id = "coscripterWindow"

	if ( !isProcedureLoaded() ) {
		// When there is no current procedure loaded, load welcome page
		showWelcomePageButtons();
		loadWelcomePage(true);	// changed to true for localWelcomePage (AC)
	}

	initializeSidebar();
	testSidebarP = false;

	// execute the sidebarListener method, if it exists
	if (coscripter.sidebarListener != null) {	
		coscripter.sidebarListener();
		coscripter.sidebarListener = null;
	}
	
	if (subroutineP()) {
		coscripterConceptLearner = getCoScripterConceptLearner();				
	} 
}

function loadWelcomePage(refreshP) {
	var sidebarBundle = document.getElementById("bundle-coscripter-sidebar")
	var coscripterName = (sidebarBundle && typeof sidebarBundle.getString == "function") ? sidebarBundle.getString("coscripterName") : "CoScripter"
	var welcomeTitle = sidebarBundle.getString("welcome")
	var welcomePage = getWelcomePage();
	
	// Load favorites/relevant scripts from koalesence if connected
	welcomePage.collapsed = false;
	coscripter.setSidebarTitle(welcomeTitle, coscripterName);
	if (refreshP) {
		if (welcomePage.contentDocument.getElementById("myscripts")) welcomePage.webNavigation.reload(0);
		else displayLocalScriptList(welcomePage)
	}	
}

function initializeSidebar() {
	// start logging whenever the sidebar is open (unless pref is set to No Logging)
	if(components.logger()) {
		components.logger().startLogging()
	}
	logCoScripterEvent("sidebar opened")
	
	initializeProcedureInteractor();
	initializeDatabase();
	initializeToolbarButtons();
	//initializeDojo();
	
	// Show Action History tab
	var prefs = components.utils().getCoScripterPrefs()
	if(components.logger() && prefs.getCharPref('recordActionHistory') > 0) showActionHistoryTab();

	// Display the Spreadsheets tab depending on the preference
	var spreadsheetP = prefs.prefHasUserValue('spreadsheetP') && prefs.getBoolPref('spreadsheetP');
	var mashupTablesTab = components.utils().getSidebarElement(window, "scratchtab");
	mashupTablesTab.hidden = !spreadsheetP;
	mashupTablesTab.collapsed = !spreadsheetP;
	var mashupTablesTabPanel = components.utils().getSidebarElement(window, "scratchtabpanel");
	mashupTablesTabPanel.hidden = !spreadsheetP;
	
	// in coscripter-scratch-space-sidebar.js
	if (spreadsheetP) ScratchSpaceSidebar.initialize();
}

function initializeDojo(){
	debug("calling initializeDojo")
	dojo.require("dojo.parser")
	debug("required parser")
	dojo.byId("dojoTest").innerHTML = "Dojo says Hello"	
	debug("inner html was changed")
}

function initializeDatabase() {
	var sidebarBundle = document.getElementById("bundle-coscripter-sidebar")
	if (sidebarBundle && typeof sidebarBundle.getString == "function") {
		var coscripterName = sidebarBundle.getString("coscripterName")
		var emailAddress = sidebarBundle.getString("emailAddress");
		var putSecretStuffAfterThisLine = sidebarBundle.getString("putSecretStuffAfterThisLine")
		var changeMe = sidebarBundle.getString("changeMe")
		var loadingBluepagesInfo = sidebarBundle.getString("loadingBluepagesInfo")
		var setYourEmailAddressInDB = sidebarBundle.getString("setYourEmailAddressInDB")
	}

	coscripter.db = coscripter.components.databaseXpcom();
	coscripter.db.init();
	coscripter.db.load();

	var database = document.getElementById("personaldb");
	database.value = coscripter.db.data;
	coscripter.db.addListener(database);
	database.addEventListener("change", function (e) {
		coscripter.db.update(database);
		databaseListener(e);
	}, false);
	
	// If there is nothing in the database, set it to a default value
	if (coscripter.db.data == "") {
		// TL: we cannot prompt the user here on startup because it blocks.
		// This causes the start page to decide that Koalescence is not
		// available, and display the wrong content on initial startup.

		database.value = emailAddress + " = " + changeMe + "\n" +
			"\n" +
			"---" + putSecretStuffAfterThisLine + "---\n" +
			"\n";
		coscripter.db.update(database);
	}

}

function initializeToolbarButtons() {
	showWelcomePageButtons();
}

function onResize(e){
	// return if this gets called after the sidebar is already closed
	if (!e.currentTarget.coscripter || !e.currentTarget.coscripter.isSidebarVisible()) return;
	CommandProcessor.previewCurrentStep(true);
}

function showActionHistoryTab() {
	var prefs = components.utils().getCoScripterPrefs()
	var actionHistoryBrowser = document.getElementById("activitydata")
	document.getElementById("activitytab").collapsed = false
	actionHistoryBrowser.collapsed = false
	components.logger().setActionHistoryBrowser(actionHistoryBrowser)
	components.logger().displayActionHistory()
	components.logger().startRecordingActionHistory()
}

// Return true iff we should try to abort the closedown process that
// resulted in this warning.  This is also called from
// coscripter-browser-overlay when the sidebar is toggled shut.
function warnUnsavedChanges() {
	// Prompt user to save script if it's dirty
	var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);

	var flags = promptService.BUTTON_TITLE_SAVE * promptService.BUTTON_POS_0 +
		promptService.BUTTON_TITLE_CANCEL * promptService.BUTTON_POS_1 +
		promptService.BUTTON_TITLE_DONT_SAVE * promptService.BUTTON_POS_2;

	if (edited) {
		var ret = promptService.confirmEx(window, "Save changes?",
			"Your script has unsaved changes.",
			flags, null, null, null, null, {});
		if (ret == 0) {
			return !saveProcedure();
		} else if (ret == 1) {
			// user pressed cancel, so don't kill the window
			return true;
		} else if (ret == 2) {
			// go ahead and close the window and set the edited
			// flag to false so that we don't see the warn
			// dialog again once we've chosen "don't save"
			edited = false;
			return false;
		}
	} else {
		return false;
	}
	return false;
}

function onUnload() {
	// Clean up after the last step if necessary
	CommandProcessor.cleanupAfterStepExecution();

	// Log sidebar close event
	logCoScripterEvent("sidebar closed");
	// stop logging
	if(components.logger()) components.logger().stopLogging()
	// stop recording ActionHistory
	var prefs = components.utils().getCoScripterPrefs()
	if (components.logger() && prefs.getCharPref('recordActionHistory') == 1)
		{components.logger().stopRecordingActionHistory()}

	// Stop listening to database
	var database = document.getElementById("personaldb");
	coscripter.db.removeListener(database);

	// Stop recording
	stopRecording();

	unloadProcedureHandlers();
}

//////////////////////////////////////////////////////////////////////////////////////////////////
//		Loading a Procedure into the sidebar
//		(loadProcedure)							
/////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////
//			Procedure Object
///////////////////////////////////
function Procedure(json){
    if(json){
        this.initializeProcedure(json);
    }else{
        this.scriptjson = {
            'id':null,
            'coscripter-wiki-url':null,
            'coscripter-executed-url':null,
            'body':null,
            'title':null,
            'private':false,
        };
    }

    this.selectedRows = [],
    this.currentRowIndex = -1;

    
    // array of {
    //   id: string,
    //   tableName: string (or undefined),
    //   tableNameOccurrence: string (or undefined),
    //   entryName: string,
    //   entryNameOccurrence: string (or undefined)
    // }
    this.activitySelectedEntries = [],
    this.activityCurrentSelectedEntryNum = -1;

    return this ;
}

Procedure.prototype = {
	scriptjson : null,
	initializeProcedure : function(json) {
		this.scriptjson = json;
	},
	setId : function(id) {
		this.scriptjson['id'] = id;},
	getId : function() {
		return this.scriptjson['id'];},
	isPrivate : function() {
		return this.scriptjson['private'];},
	setPrivate : function(privateval) {
		this.scriptjson['private'] = privateval;},
	setWikiUrl : function (url ){
		this.scriptjson['coscripter-wiki-url'] = url;},
	getWikiUrl : function(){
		return this.scriptjson['coscripter-wiki-url']; },
	setSaveUrl : function (url ){
		this.scriptjson['coscripter-save-url'] = url;},
	getSaveUrl : function(){
		return this.scriptjson['coscripter-save-url']; },
	setExecutedUrl : function(url) {
		this.scriptjson['coscripter-executed-url'] = url;},
	getExecutedUrl : function () {
		return this.scriptjson['coscripter-executed-url'];},
	getBody : function(){
		return this.scriptjson['body'];},
	setBody : function(body){
		this.scriptjson['body']=body;},
	getTitle : function(){
		return this.scriptjson['title'];},
	setTitle : function(title){
		this.scriptjson['title'] = title;},
	getJSONUrl : function(){
		return this.scriptjson['coscript-json-url'];},
	setJSONUrl : function(url){
		this.scriptjson['coscript-json-url'] = url;},
	getCreator : function() {
			if (this.scriptjson.hasOwnProperty('creator') &&
				this.scriptjson['creator'].hasOwnProperty('email')) {
				return this.scriptjson['creator']['email'];
			} else {
				return null;
			}
		},
	getCreatorName : function() {
			if (this.scriptjson.hasOwnProperty('creator') &&
				this.scriptjson['creator'].hasOwnProperty('name')) {
				return this.scriptjson['creator']['name'];
			} else {
				return null;
			}
		},
	getSessionUser : function(){
			if (this.scriptjson.hasOwnProperty('session_user') &&
				this.scriptjson['session_user'].hasOwnProperty('email')) {
				return this.scriptjson['session_user']['email'];
			} else {
				return null;
			}
		}
};

function isProcedureLoaded() {
	return currentProcedure != null;
}

function createProcedure() {
	return new Procedure();
}
///////////////////////////////////
//			loadProcedure						
///////////////////////////////////
function loadProcedure(procedureJSONUrl, run) {  
	// First check if script has unsaved changes
	if (warnUnsavedChanges()) {
		return;
	}

	// Tell the user the script is loading
	var sidebarBundle = document.getElementById("bundle-coscripter-sidebar")
	var loading = (sidebarBundle && typeof sidebarBundle.getString == "function") ? sidebarBundle.getString("loading") : "loading"
	setStatus(loading);

	// Pull out script variables if present
	var qindex = procedureJSONUrl.indexOf('?');
	var scriptvars = null;
	if (qindex != -1) {
		// If there are script variables
		scriptvars = procedureJSONUrl.substring(qindex+1,
			procedureJSONUrl.length);
		procedureJSONUrl = procedureJSONUrl.substring(0, qindex);
	}
	
	// Set up callbacks after the script gets loaded from the server
	var cb = function(data) {
		loadProcedureData(data, run, scriptvars);
	};
	var errorCb = function(responseText,status){
		if(status == 404){
			alert("CoScripter script could not be loaded. You either don't have permission or the script does not exist");
		}else{
			alert("CoScripter script could not be loaded");			
		}
	}

	var ret = components.utils().loadWebPage(procedureJSONUrl, cb,errorCb);
}

// Load a script associated with the specific table
function loadProcedureWithScratchSpaceEditor(procedureJSONUrl, shouldRun, spaceEditor) {
	window.top.coscripter.currentScratchSpaceEditor = spaceEditor;
	loadProcedure(procedureJSONUrl, shouldRun);
}

//			loadProcedureData
// This function is called when a script is loaded into the sidebar
// params is a string in URL query format (e.g. "foo=bar&baz=boo")
// representing parameters to use during script execution.
// uuid is passed in by loadLocalProcedure when loading a locally saved file
function loadProcedureData(data,run, params, uuid) {
	var sidebarBundle = document.getElementById("bundle-coscripter-sidebar") 	 
	var clickStepOrRun = sidebarBundle.getString("clickStepOrRun") 	 
    
    initScriptMode();			 
	
	var scriptdata;
	try {
		scriptdata = nativeJSON.decode(data)
	} catch (e) {
		alert('The CoScripter script you attempted to load is formatted '+
			  'incorrectly.\nThis may be due to a stale bookmark from an '+
			  'older version of CoScripter.\n' +
			  'Please update your bookmark and try again')
		return;
	}

	// Set the private checkbox.  We have to do this before setting the 	 
	// title because it checks the value of this flag.  It also indirectly 	 
	// sets the background of the page to the right color, because of the 	 
	// CheckboxStateChange event getting fired on the checkbox. 	 
	setProcedurePrivate(scriptdata['private']); 	 
	
	currentProcedure = new Procedure(scriptdata); 	 
	setProcedureTitle(currentProcedure.getTitle());// possibly initialize the view with currentProcedure in the future 	 

	// Populate "Params" tab with script variables
	if (params !== null) {
		setScriptVariables(params);
	} else {
		// Clear out script variables
		setScriptVariables(null);
	}

	var contentBrowser = components.utils().setInitialContentBrowser(window)
	var contentWindow = contentBrowser.contentWindow
	var contentDocument = contentWindow.document
	// Load procedure code into procedure interactor 	 
	loadProcedureIntoInteractor(currentProcedure.getBody()); 	 
	
	if (localP() || contextP()) {
		if (!uuid) {
			var id = currentProcedure.getId()
			if (id) uuid = getUuidFromId(id)
		}
		getCurrentCoScriptForCurrentProcedure(uuid);
	}
	if (contextP()) addContextInfoToCurrentCoScript();
	
	processCurrentLine(false);	// Immediately process first line
	
	// Enable the toWiki button 	 
	showToWikiButton(true); 	 
	// Selectively enable the private button 	 
	if (!localP() && currentProcedure.getCreator() == currentProcedure.getSessionUser()) { 	 
		showPrivateToggle(true); 	 
	} else { 	 
		// You can't make a script private if you don't own it 	 
		showPrivateToggle(false); 	 
	} 	 
	
	if (!run) setStatus(clickStepOrRun); 	 
	
	if (scriptdata['private']) logCoScripterEvent((run?"running":"loaded") + " a private procedure in sidebar") 	 
	else logCoScripterEvent((run?"running":"loaded") + " a public procedure in sidebar") 	 
	
	wikiNotified = false; 	 
	
	loadProcedureHandlers(); 	 
	
	if ( run ) { 	 
		onRun(true); 	 
	}
}	// end of loadProcedureData

// Load a script from content displayed on a web page
function loadProcedureFromText(scriptdata, run) {
	initScriptMode();

	// Set the private checkbox.  We have to do this before setting the
	// title because it checks the value of this flag.  It also indirectly
	// sets the background of the page to the right color, because of the
	// CheckboxStateChange event getting fired on the checkbox.
	setProcedurePrivate(false);
	// Was setProcedurePrivate(scriptdata['private']); before rev. 2240

	currentProcedure = new Procedure(scriptdata);
	setProcedureTitle(currentProcedure.getTitle());
	
	// Enter procedure code into procedure interactor
	loadProcedureIntoInteractor(currentProcedure.getBody());
	if (contextP()) setUpCurrentCoScriptForCurrentProcedure();
	else if (localP()) getCurrentCoScriptForCurrentProcedure();
	processCurrentLine(false);	// Immediately process first line
	
	wikiNotified = false;
	loadProcedureHandlers();
}

function addContextInfoToCurrentCoScript() {
	 currentScriptExecutionNumber = currentCoScript.getLargestScriptExecutionNumber() +1
	 currentCoScript.setLargestScriptExecutionNumber(currentScriptExecutionNumber) 	 
	 currentCoScript.createNewScriptExecution()
	 currentActionNumber = 0					 
	 addStepIdsToLines()	// Each line has a stepId which stays the same even if the user edits the script and its line number changes.  
	 						//Once uuid's are used on koalescence, the stepId metadata will be stored on the server as well.
}


function initScriptMode() {
	var browser = getWelcomePage();
	var body = browser.contentDocument.getElementById("welcomePageBody");
	if (body) {
		// TL: sometimes the browser.contentDocument is empty and has no
		// body -- I don't understand why.
		body.setAttribute("class", "loading");
	}

	// Set up the run mode buttons just in case we were in the middle of a
	// step before; this call re-enables the step/run buttons and disables
	// the stop button
	stopRunning();

	edited = false;
	CommandProcessor.stop();
	
	// Make sure it's in edit mode by default
	procedureInteractor.edit();
	// Enable procedure edit/run buttons
	showEditModeButtons();

	// Hide welcome page, if visible
	showWelcomePage(false);
	// Show procedure interactor browser  
	showProcedureInteractor(true);
}

function PeriodicPreviewer() {
	this.nextRefresh = 0;
	this.timeoutId = -1;
}
PeriodicPreviewer.prototype = {
	nextRefresh : 0,

	getRefresh : function() {
		return this.nextRefresh;
	},

	setRefresh : function(r) {
		this.nextRefresh = r;
	},

	refresh : function() {
		// dump('PP: REFRESH\n');
		// check for an existing timeout and clear it if necessary
		if (this.timeoutId != -1) {
			window.clearTimeout(this.timeoutId);
			this.timeoutId = -1;
		}
		
		try {
			if (true) { // To aid debugging of PbD code, use if(!contextP()) (AC)
				processCurrentLine(true);
				if (CommandProcessor.currentCommand.findTarget() != null) {
					// We found a target; no need to continue refreshing
					return;
				}
			}
		} catch (e) {
			
		}	
		this.nextRefresh = this.nextRefresh * 2;
		// value of 0 disables refresh
		if (this.nextRefresh > 0 && this.nextRefresh <= 64000) {
			this.timeoutId = window.setTimeout(function() {
				gcos_PeriodicPreviewer.refresh();
			}, this.nextRefresh);
		} else {
			// give up
		} 
	},

	restart : function() {
		// dump('PP: RESTART\n');
		this.setRefresh(500);
		this.refresh();
	},

	stop : function() {
		// dump('PP: STOP\n');
		this.nextRefresh = 0;
		// check for an existing timeout and clear it if necessary
		if (this.timeoutId != -1) {
			window.clearTimeout(this.timeoutId);
			this.timeoutId = -1;
		}
	}
};
var gcos_PeriodicPreviewer = new PeriodicPreviewer();

// When there is a procedure in the sidebar, we want to be notified
// whenever the content changes in the currentWindow, or a different Tab is
// selected, so that we can refresh the preview highlighting.
function loadProcedureHandlers() {
	// Attach to the recorder here so that we can either record
	// user actions, or follow along as user does actions manually
	registerToReceiveRecordedCommands();
	if (recordDialogsP()) {
		components.yule().subscribe(executeModalCommands, "DialogCreateEvent");	// defined in command-processor
	}

	// TL: register for events that change the current tab or finish
	// loading the page or mutate the DOM
	components.yule().subscribe(pageWasUpdated, "TabChangeEvent");
}

// This should be called when a script is unloaded from the sidebar (e.g.,
// on sidebar close, or when the Home button is clicked).
function unloadProcedureHandlers() {
	// Clear any previous interpretation preview
	CommandProcessor.clearPreview();

	// Save off any data collected when executing steps of the script
	if (contextP()) saveCurrentCoScriptLocally();
	
	// Remove recorder listener
	unRegisterToReceiveRecordedCommands();
	if (recordDialogsP()) {
		components.yule().unsubscribe(executeModalCommands, "DialogCreateEvent");
	} 

	components.yule().unsubscribe(pageWasUpdated, "TabChangeEvent");
}

// ----------------------------------------------------------------------
// Page update callback

function pageWasUpdated(event) {
	processCurrentLine(false);
}

// End page update callbacks
// ----------------------------------------------------------------------

function setPrivatePublicBackground(privateP) {
	try {
		var browser = getProcedureInteractorBrowser();
		var body = browser.contentDocument.getElementById("procedureInteractorMainBody");
		if (privateP) {
			body.setAttribute("class", "private_script");
		} else {
			body.setAttribute("class", "public_script");
		}
		if (privateP)
			logCoScripterEvent("procedure set to private")
		else
			logCoScripterEvent("procedure set to public")
	} catch (e) {
		debug("Error in setPrivatePublicBackground: " + e);
	}
}

function loadProcedureIntoInteractor(body) {
	// Clear interactor box
	try {
		procedureInteractor.setValidate(false);
		procedureInteractor.setInteract(false);
	
		procedureInteractor.setText("");
			
		var c = loadProcedureStepsIntoInteractor(body);
		var currentLine = procedureInteractor.getCurrentLine()
			
		procedureInteractor.setValidate(true);
		procedureInteractor.setInteract(true);
	
		// Move to first step
		CommandProcessor.moveToFirstStep();
		
		procedureInteractor.showCursor();
		procedureInteractor.blinkCursor();
		
	} catch (e) {
		debug('Error loading script: ' + e.message + '\n');
	}
}

function makeFirstLineVisible() {
    var firstline = procedureInteractor.getLineWithNumber(0);
    firstline.scrollIntoView(false);
}

function determineSubroutines(steps) {
	
	var model = coscripterConceptLearner.loadConceptModels();	
	
	var logArray = new Array();	
	var p = getParserComponent();
	
	var detectedConcept = null;
	var conceptFlag = false;
	var treeindex = 0;
	
	var conceptSlopArray = new Array();	
	
	var slopsteps = new Array();
	
	try {
		for (var i = 0; i < steps.length; i++) {
			if (steps[i] != null && steps[i].length > 5) {
				slopsteps.push(steps[i]);
			}
		}
	} catch (e) {
		debug("I got first exception");
	}
	
	try {
		for (var i = 0; i < slopsteps.length; i++) {
			var conceptlastindex = i;			
								
			try {
				for (var j = slopsteps.length - 1; j >= i; j--) {
					var logSlopArray = new Array();
					var labelstr = "";
					var actionPattern = "";
					
					try {
						var patternArray = new Array();
						
						for (var k = i; k <= j; k++) {
							
							
							var indent = extractIndent(slopsteps[k]);            
							
							
							if (slopsteps[k].length > 5 && indent > 0) {
								var curslop = slopsteps[k].substring(2);
								logSlopArray.push(slopsteps[k].substring(2));
								
								var parser = new p.Parser(curslop, null);
								
								var cmd = parser.parse();					
								var targetLabel = cmd.getTargetLabel();
								
								if (targetLabel != null && targetLabel.length > 0) {
									var words = targetLabel.split(/[^\w]/);
									var actionlabel = words[0];
									if (k > i) {
										actionPattern += " " + actionlabel;
									}
									else {
										actionPattern += actionlabel;
									}	
								}		
								patternArray.push(curslop);
							}
						}
						
					} 
					catch (e) {
						debug("not good " + slopsteps[i] + " to " + slopstep[j]);
					}
					var newActionPattern = new Array();
					newActionPattern.push(actionPattern);
					
					try {
						detectedConcept = coscripterConceptLearner.determineConceptWithActionPattern(newActionPattern);
						if (detectedConcept != null) {						    
							conceptFlag = true;
							conceptlastindex = j;
							break;
						}
					} 
					catch (e) {
						debug("not good " + i + " to " + j + "concept" + detectedConcept);
					}
				}
			} catch (e) {				
			}	
			
			try {
				if (detectedConcept != null && conceptFlag) {
				
					for (var noconceptindex = treeindex; noconceptindex < i; noconceptindex++) {
						var txt = slopsteps[noconceptindex];
						// Remove any remaingin \r, if needed
						txt = txt.replace(new RegExp("\r", "g"), '');
						var slop = txt;
						conceptSlopArray.push(slop);
					}
     				conceptSlopArray.push("Begin: " + detectedConcept);
					
					for (var conceptindex = i; conceptindex <= j; conceptindex++) {
						var txt = slopsteps[conceptindex];
						// Remove any remaingin \r, if needed
						txt = txt.replace(new RegExp("\r", "g"), '');
						var slop = txt;
						conceptSlopArray.push(slop);
					}
					conceptSlopArray.push("End: " + detectedConcept);
					
					i = conceptlastindex;
					treeindex = i + 1;
				}
			} catch (e) {
				
			}
		} // end i
	 } catch (e) {
		debug("Exception for i = " + i);
	}		
			
	if (treeindex < slopsteps.length) {
			for (var noconceptindex = treeindex; noconceptindex < slopsteps.length; noconceptindex++) {
				 var txt = slopsteps[noconceptindex];
   				 // Remove any remaingin \r, if needed
				 txt = txt.replace(new RegExp("\r", "g"), '');
   				 var slop = txt;
				 conceptSlopArray.push(slop);				
			}			
	} 
	return conceptSlopArray;	
}

function loadProcedureStepsIntoInteractor(body) {	 

	var steps = body.split("\n");
    var c = 0;
    var preceedingNewLine = false;
    var commentInProgress = false;	
	
	if (subroutineP()) {
		var slopArray = determineSubroutines(steps);		
		var conceptVisibleFlag = false;
		for (var i = 0; i < slopArray.length; i++ ) {
       		   var txt = slopArray[i];
		       // Remove any remaingin \r, if needed
		       txt = txt.replace(new RegExp("\r", "g"), '');
			   var slop = txt;
			   var indent1 = extractIndent(txt);
		
			   if (indent1 == 0 && txt.indexOf('Begin') != -1) {
				   	  // it is the starting of a subroutine
					  conceptVisibleFlag = true;		
			   } 
			   
			   if (indent1 == 0 && txt.indexOf('End') != -1) {
				   	  // it is the end of a subroutine
					  conceptVisibleFlag = false;
			   } 
			   
		       if ( !preceedingNewLine && txt == "" ) {
		           preceedingNewLine = true;
		           continue;
		       }
		       else if ( commentInProgress && txt == "" ) {
		           preceedingNewLine = false;
		           commentInProgress = false;
		           continue;
		       }        
		           
		       if ( isSlopComment(txt) ) {
				   if (txt.indexOf('End') == -1) {
			           commentInProgress = true;
			           if ( c > 0 )
			               procedureInteractor.insertLine("", true);
			           procedureInteractor.addCurrentLineType("comment");
			           if (txt.indexOf('Begin') != -1)
						   procedureInteractor.insertHTML("" + txt.substring(6));
					   else procedureInteractor.insertHTML("" + txt);
			           c++;
				   }
				   	   
		       }
		       else if ( isSlopStep(txt) ) {
				   if ( c > 0 || preceedingNewLine )
		              procedureInteractor.insertLine("", true);
		           preceedingNewLine = false;
		           commentInProgress = false;
		           
		           var indent = extractIndent(txt);
		           for ( var k = 0; k < indent; k++ ) 
		              procedureInteractor.increaseCurrentLineIndent();
		           
				   if (conceptVisibleFlag) {
				   	   procedureInteractor.increaseCurrentLineIndent();			
				   }
				   procedureInteractor.insertHTML(extractStep(txt));
				   c++;
		       }
		}
	 } else {
		for (var i = 0; i < steps.length; i++ ) {
       		   var txt = steps[i];
		       // Remove any remaingin \r, if needed
		       txt = txt.replace(new RegExp("\r", "g"), '');
			   var slop = txt;
			   
			   if ( !preceedingNewLine && txt == "" ) {
		           preceedingNewLine = true;
		           continue;
		       }
		       else if ( commentInProgress && txt == "" ) {
		           preceedingNewLine = false;
		           commentInProgress = false;
		           continue;
		       }        
		           
		       if ( isSlopComment(txt) ) {
				       commentInProgress = true;
			           if ( c > 0 )
			               procedureInteractor.insertLine("", true);
			           procedureInteractor.addCurrentLineType("comment");
			     	   procedureInteractor.insertHTML("" + txt);
			           c++;				   		   	   
		       }
		       else if ( isSlopStep(txt) ) {
				   if ( c > 0 || preceedingNewLine )
		              procedureInteractor.insertLine("", true);
		           preceedingNewLine = false;
		           commentInProgress = false;
		           
		           var indent = extractIndent(txt);
		           for ( var k = 0; k < indent; k++ ) 
		              procedureInteractor.increaseCurrentLineIndent();		           
    				   procedureInteractor.insertHTML(extractStep(txt));
				   c++;
		       }
		}		
		
	}	
		
	
}

function isSlopComment(step) {
    if ( isSlopEmpty(step) )
        return true;
    else 
       return step.match(/^[^\*]/);
}

function isSlopStep(step) {
    if ( isSlopEmpty(step) )
        return false;
    else 
       return step.match(/^(\*+)\s/);
}

function isSlopEmpty(step) {
    step = components.utils().trim(step);
    if ( step == "" || step == "\r" || step == "\n" )
       return true;
    else
       return false;
}

function extractStep(txt) {
    return txt.replace(/^(\*+)\s/, "");
}

function extractIndent(txt) {
    var indent = 0;
    for ( var i = 0; i < txt.length; i++ ) {
       if ( txt[i] == '*' )
          indent++;
       else
          break;
}
    return indent;
}

function isNewProcedure() {
    if ( currentProcedure )
       return currentProcedure.getId() == null;
    else
       return true;
}


//////////////////////////////////////////////////////////////////////////////////////////////////
//		Editor (aka Procedure Interactor) functions
//		(initializeProcedureInteractor, processCurrentLine)	
/////////////////////////////////////////////////////////////////////////////////////////////////
// The Procedure Interactor is the Script Editor  (i.e. the text area in the sidebar that contains the script text)
function initializeProcedureInteractor() {
    // Initialize interactor
    var procedureInteractorBody = getProcedureInteractorBody();
    procedureInteractorBody.innerHTML = "";

    procedureInteractor = new editor.RichTextBox(window, procedureInteractorBody, "", null, null, null, true, false, false);	// gets every text change on a line
    procedureInteractor.setMultiLine(true);
    procedureInteractor.setListener(delayedInteractorListener);	// gets high-level editor changes: cursor movements, edit mode changes
    procedureInteractor.setInteract(false);
}

function onEditorBlur(event) {
	// send an onChange event
}

// This is called when something happens in the editor, like the cursor
// moves up/down or within a line, the user has made an edit, or created a new line
function delayedInteractorListener(eventtype) {
	clearExecutedLines();
	
	if (eventtype == editor.TEXT_CHANGE_EVENT) {
		// Set the edited flag to true so that the * appears in the sidebar
		edited = true;
		updateSidebarTitle();
	}
	
	if (eventtype == editor.LINE_CHANGE_EVENT || eventtype == editor.TEXT_CHANGE_EVENT) {
		// If we are in run mode, we need to stop first
		onStop();

		processCurrentLine(false);
		/*
		// TL: These don't seem to be needed because processCurrentLine
		// calls previewCurrentStep, which calls
		// determineInterpretationStatus at the end of its execution path

		var status = determineInterpretationStatus(CommandProcessor.currentCommand);
		displayStatus(status,CommandProcessor.currentCommand);
		*/
	}
	else if (eventtype == editor.LINE_MOVEMENT_EVENT) {
		// TL: we have to call processCurrentLine because we need to
		// redraw the colored box around the current line in the editor.
		// This is a workaround for the problem that I can't figure out how
		// to tell the editor to draw the box in a certain color, I can
		// only draw our own box on top of whatever it has drawn.
		processCurrentLine(false);

		/*
		// TL: These don't seem to be needed because processCurrentLine
		// calls previewCurrentStep, which calls
		// determineInterpretationStatus at the end of its execution path

		var status = determineInterpretationStatus(CommandProcessor.currentCommand);
		displayStatus(status,CommandProcessor.currentCommand);
		*/
	}
	
}

function databaseListener(e) {
	if (currentProcedure != null) {
		CommandProcessor.previewCurrentStep(true);
	}
}

/**
 * Process the currently selected line in the rich editor.
 * @param fromrefresh Boolean indicating this processCurrentLine
 *                    occurred as a result of a refresh (true)
 *                    or is the original (false).
 */
function processCurrentLine(fromrefresh) {
	clearExecutedLines();
	CommandProcessor.previewCurrentStep(fromrefresh);
}

function clearExecutedLines() {
	var cln = procedureInteractor.getCurrentLineNumber();
	for ( var i = cln; i < procedureInteractor.getLineCount(); i++ ) {
		var line = procedureInteractor.getLineWithNumber(i);
		CoscripterDomUtils.removeClass(line, "executing");
		//CoscripterDomUtils.removeClass(line, "executed");
   }
}

function setLineExecuting(line) {
	if ( line ) {
		CoscripterDomUtils.addClass(line, "executing");
	}
}

function setLineExecuted(line) {
	if ( line ) {
		CoscripterDomUtils.removeClass(line, "executing");
		//CoscripterDomUtils.addClass(line, "executed");
	}
}

function resetLineExecuting(line) {
	if ( line ) {
		CoscripterDomUtils.removeClass(line, "executing");
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////
//		Sidebar UI
//		(onStep, onRun, onStop, startRunning, stopRunning
//			onRecord, startRecording, stoprecording, onNew, onOpen)
/////////////////////////////////////////////////////////////////////////////////////////////////
function substituteCurrentRowIfOnFirstLine() {
	if (procedureInteractor.getCurrentLineNumber() == 0) {
		// If there is a Vegemite table, act on the selected rows within that table
		var scratchSpaceEditor = window.top.coscripter.currentScratchSpaceEditor
		if (scratchSpaceEditor) {
			if (!iterativeVegemiteScriptP((currentProcedure))) return;
			var t = scratchSpaceEditor.getCurrentTableIndex();
			currentProcedure.selectedRows = scratchSpaceEditor.getSelectedRows(t);
			if (currentProcedure.selectedRows.length > 0) {
				currentProcedure.currentRowIndex = 0
				var currentRow = currentProcedure.selectedRows[currentProcedure.currentRowIndex];
				Vegemite.substituteRow(currentProcedure, currentRow);
				var currentTable = scratchSpaceEditor.getScratchSpace().getTables()[t]; 
				currentTable.logAction(new ScratchSpaceTable.RunScriptAction(currentProcedure.scriptjson.id, currentRow));
				loadProcedureIntoInteractor(currentProcedure.getBody())
			}
		}
	}
	
}

// don't iterate over a script that has no table-row references
function iterativeVegemiteScriptP(currentProcedure) {
	if (!currentProcedure.scriptjson) return false
	if (currentProcedure.scriptjson && currentProcedure.scriptjson.body) {
		if(currentProcedure.scriptjson.body.indexOf(" of row ") != -1) return true
		if(currentProcedure.scriptjson.body.indexOf(" the number ") != -1) return true	// should be more careful -- this can cause false positives (AC)
	}		
	return false
}


function onStep() {
	// Turn off recording
	var wasRecording = recording ;
	stopRecording();
	
	startRunning();
	
	substituteCurrentRowIfOnFirstLine();

	if (wasRecording) {
		CommandProcessor.previewCurrentStep(false);
	}
	// Execute one step of the procedure
	CommandProcessor.executeProcedure();
}

function onRun(doNotLog) {
	// Turn off recording
	var wasRecording = recording ;
	stopRecording();
	
	startRunning();
	
	substituteCurrentRowIfOnFirstLine();
	
	if (wasRecording) {
		CommandProcessor.previewCurrentStep(false);
	}
	// Execute procedure continuously
	CommandProcessor.setRunMode();
	CommandProcessor.executeProcedure();
}

function onRunAll(doNotLog) {
	var scratchSpaceUI = window.top.coscripter.scratchSpaceUI;
	var runMenu = scratchSpaceUI ? scratchSpaceUI.getScriptsMenu() : null
	var lastScript = runMenu ? runMenu.lastChild : null
	
	
	
}

function onStop() {
	// Turn the circle arrow into a regular arrow if it was a circle
	if ( !CommandProcessor.isStopped() ) {
		CommandProcessor.resetCurrentLineExecuting();
	}

	// Clean up after the last step if necessary
	CommandProcessor.cleanupAfterStepExecution();
	
	// Stop browser load
	var browser = components.utils().getBrowser(window);
	//browser.stop();	// This was driving me crazy (AC)
	// Cancel onload handler
	try {
		components.utils().removePageLoadHandler(browser);
	} catch (e) {
		dump('error removing pageLoadHandler: ' + e + '\n');
	}
	
	// If we are in an autowait state, clear the timeout
	CommandProcessor.clearAutowaitTimeout();

	stopRunning();
}

function startRunning() {
	CommandProcessor.start();
	
	var stepButton = document.getElementById("step");
	var runButton = document.getElementById("run");
	var runAllButton = document.getElementById("runAll");
	var stopButton = document.getElementById("stop");
	
	var openButton = document.getElementById("open");
	var saveButton = document.getElementById("save");
	var recordButton = document.getElementById("record");
	   
	stepButton.disabled = true;
	runButton.disabled = true;
	runAllButton.disabled = true;
	stopButton.disabled = false;
	
	openButton.disabled = true;
	saveButton.disabled = true;
	recordButton.disabled = true;
	
	notifyWiki();
}

// This resets the UI to display the right buttons after Stop was pressed
function stopRunning() {
	CommandProcessor.stop();
	
	var stepButton = document.getElementById("step");
	var runButton = document.getElementById("run");
	var runAllButton = document.getElementById("runAll");
	var stopButton = document.getElementById("stop");
	
	var openButton = document.getElementById("open");
	var saveButton = document.getElementById("save");
	var recordButton = document.getElementById("record");
	
	stepButton.disabled = false;
	runButton.disabled = false;
	runAllButton.disabled = false;
	stopButton.disabled = true;
	
	openButton.disabled = false;
	saveButton.disabled = false;
	recordButton.disabled = false;
}

function onRecord() {		
	var recordButton = document.getElementById("record");
	
	if ( recording ) {
		stopRecording();
		CommandProcessor.previewCurrentStep(false);
	}
	else {
		CommandProcessor.clearPreview();
		startRecording();
	}
}

function startRecording(){
	var sidebarBundle = document.getElementById("bundle-coscripter-sidebar")
	var recordingText = sidebarBundle.getString("recording")
	var recordingIsOn = sidebarBundle.getString("recordingIsOn")

	if (recording) return;

	var recordButton = document.getElementById("record");
	
	recordButton.image = "chrome://coscripter/skin/images/record-flashing.gif";
	recordButton.alt = recordingIsOn;
	recordButton.tooltiptext = recordingIsOn;
	
	recording = true;
	if (contextP()) getCommandGenerator().addListener(receiveGeneratedCommandForPbD)
	
	setStatus(recordingText);
}

function stopRecording(){
	var sidebarBundle = document.getElementById("bundle-coscripter-sidebar")
	if (sidebarBundle && typeof sidebarBundle.getString == "function"){
		var recordingIsOff = sidebarBundle ? sidebarBundle.getString("recordingIsOff") : "Recording is off"
		var recordingStopped= sidebarBundle ? sidebarBundle.getString("recordingStopped") : "Recording stopped"
	}

	if (!recording) return;

	var recordButton = document.getElementById("record");
	
	recordButton.image = "chrome://coscripter/skin/images/record-grey.gif";
	recordButton.alt = recordingIsOff;
	recordButton.tooltiptext = recordingIsOff;
	
	recording = false;
	if (contextP()) getCommandGenerator().removeListener(receiveGeneratedCommandForPbD)
	
	setStatus(recordingStopped);
}


function decorateTextBox(div, text, target, pc) {
	var doc = div.ownerDocument;
	var textarea1 = doc.createElement("input");
	var textarea2 = doc.createElement("input");
	
	textarea1.value = "";
	textarea2.value = text;

	if (!pc.canExecute) {
		textarea2.style.color = "red";
	}
	else {
		textarea2.style.color = "green";
	}
	
	div.style.opacity = 1;
	var pos = components.utils().getNodePosition(target, pc);
	div.style.left = "" + (pos.x - 3) + "px";
	div.style.top = "" + (pos.y - 3) + "px";
	div.style.width = "" + (pos.w + 6) + "px";	
	div.style.height = "" + (pos.h + 6) + "px";
	
	textarea1.style.position = "absolute";
	textarea1.style.top = "3px";
	textarea1.style.left = "3px";
	textarea1.style.width = "" + (pos.w) + "px";
	textarea1.style.height = "" + (pos.h) + "px";
	
	textarea2.style.position = "absolute";
	textarea2.style.top = "3px";
	textarea2.style.left = "3px";
	textarea2.style.width = "" + (pos.w) + "px";
	textarea2.style.height = "" + (pos.h) + "px";
	
	div.appendChild(textarea1);
	div.appendChild(textarea2);
	
	textarea2.style.opacity = 0.5;
}


function viewScriptInWiki() {
	var url = currentProcedure.getWikiUrl();
	coscripter.loadUrlIntoMainBrowser(url);
}

function onHideDB() {
	var DBBox = document.getElementById("dbbox");
	DBBox.setAttribute('hidden', 'true');
	
	dbDisabledP = true;
}

function onHideDBToolbar() {
	var DBToolbar = document.getElementById("DBToolbar");
	DBToolbar.setAttribute('hidden', 'true');
	dbDisabledP = true;
}

function loadBPData(bpdata) {
	var bpwidget = document.getElementById('bluepages');

	// Sort
	var keys = new Array();
	var i = 0;
	for (var keyname in bpdata) {
		keys[i++] = keyname;
	}
	keys.sort();

	var dbtext = '';
	for (var index in keys) {
	var val = keys[index];
	if (bpdata[val]) {
		dbtext += 'bluepages.' + val + ' = ' + bpdata[val] + '\n';
	}
	}
	bpwidget.value = dbtext;
	coscripter.db.addOtherDB('bluepages', dbtext);
}

/**
 * Set the script variables tab to the stuff parsed out of vars, which is
 * assumed to be a string of the form "foo=bar&one=two&three=four"
 * If vars is null, hide the tab and remove the variables.
 */
function setScriptVariables(vars) {
	var scriptvarstab = document.getElementById("scriptvarstab");
	if (vars === null) {
		// no variables; hide the tab
		var wasSelected = scriptvarstab.selected;
		scriptvarstab.collapsed = true;
		if (wasSelected) {
			// select a different tab
			document.getElementById("dbtabs").selectedIndex = 0;
		}
		dbtext = "";
		coscripter.db.removeOtherDB("scriptvars");
	} else {
		document.getElementById("scriptvarstab").collapsed = false;
		var hash = components.utils().parseQueryParameters(vars);
		var dbtext = '';

		for (var key in hash) {
			var val = hash[key];
			dbtext += key + ' = ' + val + '\n';
		}

		document.getElementById("scriptvars").value = dbtext;
		coscripter.db.addOtherDB("scriptvars", dbtext);
	}
}

//			onNew
function onNew() {
	// Hide welcome page
	showWelcomePage(false);
	  
	// Show procedure interactor browser  
	showProcedureInteractor(true);
	
	// Listen to procedure interactor events
	procedureInteractor.setValidate(true);
	procedureInteractor.setInteract(true);
	
	// Enable procedure edit/run buttons
	showEditModeButtons();
	// Disable toWiki button
	showToWikiButton(false);
	// Display the private button
	showPrivateToggle(true);
	// Make the script default to public
	setProcedurePrivate(false);
	
	// Initialize listeners when a script is in the sidebar
	loadProcedureHandlers();

	// Clear procedure data
	clearProcedureData();
	
	currentProcedure = new Procedure();
		
	// Clear procedure text
	clearProcedureText();
	// Set the edited flag to false because it gets set to true when you
	// instantiate the richtext editor, so we have to override that here
	edited = false;
	// Also we should update the title bar to get rid of the *
	updateSidebarTitle();
	var contentBrowser = components.utils().setInitialContentBrowser(window)
	
	if (contextP() || localP()) getCurrentCoScriptForCurrentProcedure()

	// Start recording
	startRecording();
}	//	end of onNew

function showWelcomePage(showP) {
	var welcomePage = getWelcomePage();
	if ( welcomePage ) {
		if (showP) {
			welcomePage.collapsed = false;
		} else {
			welcomePage.collapsed = true;
		}
	}
}

function showProcedureInteractor(showP) {
	var procedureInteractor = getProcedureInteractor();
	if ( procedureInteractor ) {
		if (showP) {
			procedureInteractor.collapsed = false;
		} else {
			procedureInteractor.collapsed = true;
		}
	}
}

// Toggle visibility of the public/private button
function showPrivateToggle(showP) {
	var button = document.getElementById("procedurePrivate");
	button.hidden = ! showP;
}

function showToWikiButton(showP) {
	var button = getToWikiButton();
	if (localP()){	// eventually allow 'show' if the script has a version on the server (AC)
		button.hidden = true
		return;
	}
	button.hidden = ! showP;
}

function clearProcedureData() {
	var sidebarBundle = document.getElementById("bundle-coscripter-sidebar")
	var defaultTitle = sidebarBundle.getString("defaultScriptTitle")
	setProcedureTitle(defaultTitle);
}

function clearProcedureText() {
	procedureInteractor.setText("");
	getCoScripterWindow().focus();
	
	procedureInteractor.edit();
	procedureInteractor.blinkCursor();
	
	procedureInteractor.increaseCurrentLineIndent();

}

function getProcedureText() {
	return procedureInteractor.getText();
}

function setProcedureTitle(title) {
	var procedureTitleTextBox = getProcedureTitleTextBox();
	procedureTitleTextBox.value = title;
	
	updateSidebarTitle();
}

function getProcedureTitle() {
	var procedureTitleTextBox = getProcedureTitleTextBox();
	return procedureTitleTextBox.value;
}

// Called when a script is loaded to initialize the private button UI
function setProcedurePrivate(privateP) {
	var lockButton = getProcedurePrivateButton();
	if (privateP) {
		lockButton.image = "chrome://coscripter/skin/images/lock.gif";
	} else {
		lockButton.image = "chrome://coscripter/skin/images/unlock.gif";
	}
	lockButton.checked = privateP;
	setPrivatePublicBackground(privateP);
}

// Callback when user clicks lock button
function togglePrivate() {
	var lockButton = getProcedurePrivateButton();
	var privateP = lockButton.checked;
	if (privateP) {
		lockButton.image = "chrome://coscripter/skin/images/lock.gif";
	} else {
		lockButton.image = "chrome://coscripter/skin/images/unlock.gif";
	}
	setPrivatePublicBackground(privateP);
	// Set the dirty bit so the script changes get saved
	edited = true;
	updateSidebarTitle();
}

// Consults the private checkbox in the UI and returns whether it is
// checked
function isProcedurePrivate() {
	var privButton = getProcedurePrivateButton();
	return privButton.checked;
}

// Update the title displayed on the top line of the sidebar window
function updateSidebarTitle() {
	var sidebarBundle = document.getElementById("bundle-coscripter-sidebar")
	var published = sidebarBundle.getString("published")
	var recordingIsOn = sidebarBundle.getString("recordingIsOn")
	var coscripterName = sidebarBundle.getString("coscripterName")

	var procedureTitleTextBox = getProcedureTitleTextBox();
	var title = procedureTitleTextBox.value;
	
	var privateP = isProcedurePrivate();

	if ( !privateP && !isNewProcedure() )
		title += " " + published + " ";
	
	if ( edited )
		title = "* " + title;
		
	//TODO: Update title from the sidebar	 
	coscripter.setSidebarTitle(title, coscripterName);
}

function onOpen() {
	var sidebarBundle = document.getElementById("bundle-coscripter-sidebar")
	var coscripterScripts = sidebarBundle.getString("coscripterScripts")
	var recordingIsOn = sidebarBundle.getString("recordingIsOn")

	// Show filePicker dialog on CoScripterScripts folder in CoScripterData folder in user's FFox profile folder
	filePicker.defaultExtension = htmlSuffix;
	filePicker.displayDirectory = coScriptFolder;
	filePicker.init(window, coscripterScripts,  0);
	if (!filePicker.show()) 
	   loadProcedureLocal(filePicker.file)
}

function onSave() {
	stopRecording();
	saveProcedure();
}

// When the user clicks the edit button, put the procedure interactor into
// edit mode
// Not currently used; no Edit button in sidebar
function onEdit() {
	procedureInteractor.edit();
	showEditModeButtons();
}

// Not currently used -- we have no cancel button in the sidebar
function onCancel() {
	var sidebarBundle = document.getElementById("bundle-coscripter-sidebar")
	var welcome = sidebarBundle.getString("status.welcome")
	
	if (procedureInteractor.editing && (!isNewProcedure())) {
		// currently in edit mode; leave edit mode but show the same script
		loadProcedure(currentProcedure.getJSONUrl());
	} else {
		showWelcomePage(true);
		showProcedureInteractor(false);
		loadWelcomePage(true);
		showWelcomePageButtons();
		setStatus(welcome);
	}
}

function onHome() {
	// First check if script has unsaved changes
	if (warnUnsavedChanges()) {
		return;
	}

	// Clean up after the last step if necessary
	CommandProcessor.cleanupAfterStepExecution();

	// Stop recording
	stopRecording();
	// Do everything in onStop too
	onStop();

	unloadProcedureHandlers();
	
	var sidebarBundle = document.getElementById("bundle-coscripter-sidebar")
	var welcome = sidebarBundle.getString("status.welcome")
	showWelcomePage(true);
	showProcedureInteractor(false);
	currentProcedure = null;
	procedureInteractor.setValidate(false);
	procedureInteractor.setInteract(false);
	
	// Hide Params tab
	setScriptVariables(null);

	loadWelcomePage(true);
	showWelcomePageButtons();
	setStatus(welcome);
}

function isLineComment(line) {
	return CoscripterDomUtils.isClass(line, "comment");
}

function isLineStep(line) {
	return line.getAttribute("indent") != null;
}

function getLineIndentStars(line) {
	var indent = line.getAttribute("indent");
	if ( indent ) {
		var stars = "";
		for ( var i = 0; i < indent; i++ ) 
			stars += "*";
		return stars;
}
	else
		return "";
}


function getComment(line) {
    var comment = procedureInteractor.getLineText(line);
    comment = "\n" + comment + "\n";
    return comment;
}

function getStep(line, saveData) {
    var step = procedureInteractor.getLineText(line);
    step = getLineIndentStars(line) + " " + step;
    return step;
}

function hasOriginalData(line, step) {
    var originalKey = line.getAttribute("key");
    if ( !originalKey )
       return false;
       
    var slopKey = getDatabaseKey(step);
    if ( originalKey == slopKey )
       return true;
       
    return false;
}

function getOriginalDataValue(line) {
    return line.getAttribute("value");
}

function getOriginalDataKey(line) {
    return line.getAttribute("key");
}

function setOriginalData(line, key, value) {
    line.setAttribute("key", key);
    line.setAttribute("value", value);
}

function hasLineAutoStop(line) {
    var autostop = line.getAttribute("autostop");
    return autostop != null;
}

function setLineAutoStop(line) {
    line.setAttribute("autostop", "true");
}

function resetLineAutoStop(line) {
    line.removeAttribute("autostop");
}

// ----------------------------------------------------------------------
// Changing which buttons are displayed

function showWelcomePageButtons() {
	var recordButton = document.getElementById("record");
	var stepButton = document.getElementById("step");
	var runButton = document.getElementById("run");
	var runAllButton = document.getElementById("runAll");
	var stopButton = document.getElementById("stop");
	var saveButton = document.getElementById("save");

	recordButton.hidden = true;
	stepButton.hidden = true;
	runButton.hidden = true;
	runAllButton.hidden = true;
	stopButton.hidden = true;
	saveButton.hidden = true;

	var newButton = document.getElementById("new");
	newButton.hidden = false;

	var recordSep = document.getElementById("recordSeparator");
	var stepSep = document.getElementById("stepSeparator");
	recordSep.hidden = true;
	stepSep.hidden = true;
}

function showEditModeButtons() {
	var recordButton = document.getElementById("record");
	var stepButton = document.getElementById("step");
	var runButton = document.getElementById("run");
	var runAllButton = document.getElementById("runAll");
	var stopButton = document.getElementById("stop");
	var saveButton = document.getElementById("save");
	var coscripterPrefs = components.utils().getCoScripterPrefs();
	//var spreadsheetP = coscripterPrefs.getBoolPref('spreadsheetP');

	recordButton.hidden = false;
	stepButton.hidden = false;
	runButton.hidden = false;
	runAllButton.hidden = true;
	//runAllButton.hidden = !spreadsheetP;
	stopButton.hidden = false;
	saveButton.hidden = false;

	var newButton = document.getElementById("new");
	newButton.hidden = true;

	var recordSep = document.getElementById("recordSeparator");
	var stepSep = document.getElementById("stepSeparator");
	recordSep.hidden = false;
	stepSep.hidden = false;
}


//////////////////////////////////////////////////////////////////////////////////////////////////
//		Saving a Procedure
//		(saveProcedure, saveProcedureToWiki)
/////////////////////////////////////////////////////////////////////////////////////////////////
// Returns true iff procedure was saved, false if dialog was cancelled
function saveProcedure() {
	var sidebarBundle = document.getElementById("bundle-coscripter-sidebar")
	var overwriteQuestion = sidebarBundle.getString("overwriteQuestion")
	var saveACopyQuestion = sidebarBundle.getString("saveACopyQuestion")

	// TL: this is no longer exposed in the UI; we always assume true
	// We should probably remove this because it does some unpredictable
	// rewriting of the script on save
	var saveData = true;
	// this needs to be synced more permanently with the
	// currentProcedure data but here's definitely a good 
	// point for a snapshot
	currentProcedure.setTitle(getProcedureTitle());
	currentProcedure.setBody(getProcedureTextForWiki(saveData));
	currentProcedure.setPrivate(isProcedurePrivate());

	// A change message to be logged along with this save
	var changemsg = "";

	// If it's a new procedure, then we save it to the wiki as usual.  (But
	// there should be a dialog box that pops up warning us that we are
	// saving to a public repository, if it's not a private script.  Maybe
	// that should be combined with this dialog?)
	//
	// However if it's not a new procedure, we need to ask the user whether
	// they want to overwrite the existing procedure, or save a new copy.
	//
	if ( !localP() && !isNewProcedure() ) {
		// If it's my script, then don't prompt me to overwrite or save a
		// copy; always overwrite
		if (currentProcedure.getSessionUser() !=
			currentProcedure.getCreator()) {
			
			// Use this params hash to pass arguments to/from the dialog
			var params = { inn: { 'title' : currentProcedure.getTitle(),
				'owner' : currentProcedure.getCreatorName() },
				out: null};
			window.openDialog("chrome://coscripter/content/coscripter-save-dialog.xul",
				"", "chrome, dialog, modal, resizable=yes",
				params).focus();
			if (params.out) {
				// Check which option was selected
				if (!params.out.overwrite) {
					// If you get here, it means "make copy" was selected
					// If they selected "make copy", set the id of the current
					// procedure to null, indicating that it is a new procedure
					currentProcedure.setId(null);
					// And use the title they specified
					currentProcedure.setTitle(params.out.newtitle);
				} else {
					// If you get here, "overwrite" was selected
					// Extract the changelog entry if there was one
					changemsg = params.out.changemsg;
				}
			} else {
				// User clicked Cancel
				return false;
			}
		}
	}
		
	//if ( isProcedurePrivate() ) {
	//	saveProcedureLocal(currentProcedure);
	//}
	//else {

	if (!localP()){
		if (!saveProcedureToWiki(currentProcedure, false, changemsg)) {
			return false;
		}
	}
	//}
	
	if (localP() || contextP()) {
		if (currentProcedure && currentCoScript){
			// we need to keep track of whether an externally loaded script has ever been explicitly saved:
			//debug("saveProcedure setting savedP to true")
			currentCoScript.savedP = true;
			saveCurrentCoScriptLocally()
		}
	}
	
	var sidebarBundle = document.getElementById("bundle-coscripter-sidebar")
	var scriptSaved = sidebarBundle.getString("scriptSaved")
	setStatus(scriptSaved);
	edited = false;
	setProcedureTitle(currentProcedure.getTitle());
	showToWikiButton(true);
	return true;
}	// end of saveProcedure

function warnOnSaveP() {
	var coscripterPrefs = components.utils().getCoScripterPrefs();
	if ( coscripterPrefs.prefHasUserValue("warnOnSaveP") ) {
		return coscripterPrefs.getBoolPref("warnOnSaveP")
	} else { 
		return true
	}
}

// Returns true iff save was successful
// * doNotReplaceCurrentProcedure should be mostly false unless this is being
//   called from Vegemite (Jimmy or Jeff, please describe this better).
// * changeMsg is a string that describes the change being made to this
//   script (intended to be logged on the wiki as part of the changelog)
function saveProcedureToWiki(procedure, doNotReplaceCurrentProcedure,
	changeMsg) {
	var sidebarBundle = document.getElementById("bundle-coscripter-sidebar")
	var warningTitleMessage = sidebarBundle.getString("warningTitleMessage")
	var saveWikiWarningMessage = sidebarBundle.getString("saveWikiWarningMessage")
	var dontShowWarningMessage = sidebarBundle.getString("dontShowWarningMessage")
	var warningSavingToPrimary = sidebarBundle.getString("warningSavingToPrimary")
	var errorSavingScriptExclamation = sidebarBundle.getString("errorSavingScriptExclamation")
	var serverReturnedErrorCode = sidebarBundle.getString("serverReturnedErrorCode")
	var notLoggedIn = sidebarBundle.getString("notLoggedIn")

	var params = {};
	params['title'] = procedure.getTitle();
	params['body'] = procedure.getBody();
	params['private'] = procedure.isPrivate();
	if ( procedure.getId() ) {
		params['id'] = procedure.getId();
	}
	if (typeof(changeMsg) != "undefined") {
		params['changelog'] = changeMsg;
	}
		
	if ( !procedure.isPrivate() && warnOnSaveP() )  {
		var discontinueWarning = {};
		var buttonFlags = promptService.BUTTON_POS_0 * promptService.BUTTON_TITLE_SAVE + promptService.BUTTON_POS_1 * promptService.BUTTON_TITLE_CANCEL	// Show 2 buttons, with the specified button titles
		var result = promptService.confirmEx(components.utils().getMainChromeWindow(window), 
												   warningTitleMessage, 
												   saveWikiWarningMessage, 
												   buttonFlags, null, null, null, 
												   dontShowWarningMessage, discontinueWarning)
		var coscripterPrefs = components.utils().getCoScripterPrefs();
		if (discontinueWarning.value) 
			coscripterPrefs.setBoolPref("warnOnSaveP", false)
		else
			coscripterPrefs.setBoolPref("warnOnSaveP", true)	
				
		if (result == 1)  {
			return false;
		} 
	}
	
	var saveURL = procedure.getSaveUrl();
	if (saveURL == null || procedure.getId() == null) {
		// if there's no save url or if it's a new script, save it back to the primary server
		saveURL =  components.utils().getKoalescenceAPIFunction('savescript')
		if (procedure.getId() != null) {
			// Ideally we will never get here but it's good to check
			alert(warningSavingToPrimary);
		}
		
	}

	var ret = components.utils().post(saveURL, params);
	
	try {
		if (ret == null) {
			alert(errorSavingScriptExclamation);
			return false;
		} else if (ret[0] >= 200 && ret[0] < 300) {
			var newProcedure = null;
			var procedureToAssociate = null;
			if ( isNewProcedure()) {
				var scriptdata = nativeJSON.decode( ret[1]);
				newProcedure = new Procedure(scriptdata);
				procedureToAssociate = newProcedure;
			}
			else {
				procedureToAssociate = currentProcedure;
			}
			
			// If there is a current Vegemite table, associate the script with that table
			if (spreadsheetP() && window.top.coscripter.scratchSpaceUI && window.top.coscripter.scratchSpaceUI.isVisible()) {
				var scratchSpaceUI = window.top.coscripter.scratchSpaceUI;
				var editor = scratchSpaceUI.getEditor();
				var table = scratchSpaceUI.getScratchSpace().getTables()[editor.getCurrentTableIndex()];
				var scriptInfo = {url: procedureToAssociate.scriptjson["json-url"], title: procedureToAssociate.getTitle()}; 
				if (table.getScriptIndex(scriptInfo) == -1) {
					table.addScript(scriptInfo);
					table.logAction(new ScratchSpaceTable.RunScriptAction(procedureToAssociate.getId()));
				}
			}

			procedure.setId(procedureToAssociate.getId());
			
			if (newProcedure != null && !doNotReplaceCurrentProcedure) {
				currentProcedure = newProcedure;
			}
			
			return true;
		} else {
			if (ret[0] == "401") {
				alert(errorSavingScriptExclamation + " " + notLoggedIn);
			} else {
				alert(errorSavingScriptExclamation + " " + serverReturnedErrorCode + " " + ret[0]);
			}
			return false;
		}
	} catch (e) {
		alert(errorSavingScriptExclamation + ": " + e);
		return false;
	}
	// Should not get here
	return false;
}

function associateProcedureWithTable(table, procedure) {
	var saveUrl = coscripter.components.utils().getKoalescenceAPIFunction('scratch_space_table');
	
	return coscripter.components.utils().post(saveUrl, {id: table.getId(), "procedure[]": procedure.getId()});
}

function getProcedureTextForWiki(saveData) {
    // Do a simple transformation to wiki format
    var lines = procedureInteractor.getLines();
    
    var text = "";
    
    for ( var i = 0; i < lines.length; i++ ) {
        var line = lines[i];
        
        if ( i > 0 ) 
           text += "\n";
           
        var l = "";
        if ( isLineStep(line) ) {
            l = getStep(line, saveData);
        } else {
            l = getComment(line);
        }
        
        text += l;
    }
    
    return text;
}


//////////////////////////////////////////////////////
//		Utilities
//////////////////////////////////////////////////////
function logCoScripterEvent(eventDescription) {
	if (!components.logger()) return;
	var scriptId = (currentProcedure && currentProcedure.getId()) ? currentProcedure.getId() : -1
	components.logger().log("*" + eventDescription, scriptId)
}

function localP(){
    var coscripterPrefs = CC["@mozilla.org/preferences-service;1"].getService(CI.nsIPrefService).getBranch("coscripter.")
	return coscripterPrefs.prefHasUserValue('saveLocal') ? (coscripterPrefs.getIntPref('saveLocal') == 1) : false
}

function contextP(){
    if (components.contextRecorder()) {
        var coscripterPrefs = CC["@mozilla.org/preferences-service;1"].getService(CI.nsIPrefService).getBranch("coscripter.")
        return coscripterPrefs.prefHasUserValue('contextP') ? coscripterPrefs.getBoolPref('contextP') : false
    }
    return false
}

function spreadsheetP(){
    if (components.tabler()) {
        var coscripterPrefs = CC["@mozilla.org/preferences-service;1"].getService(CI.nsIPrefService).getBranch("coscripter.")
        return coscripterPrefs.prefHasUserValue('spreadsheetP') ? coscripterPrefs.getBoolPref('spreadsheetP') : false
    }
    return false
}

function recordDialogsP(){
    if (components.contextRecorder()) {
        var coscripterPrefs = CC["@mozilla.org/preferences-service;1"].getService(CI.nsIPrefService).getBranch("coscripter.")
        return coscripterPrefs.prefHasUserValue('recordDialogsP') ? coscripterPrefs.getBoolPref('recordDialogsP') : false
    }
    return false
}

function subroutineP() {
	var coscripterPrefs = CC["@mozilla.org/preferences-service;1"].getService(CI.nsIPrefService).getBranch("coscripter.")
    return coscripterPrefs.prefHasUserValue('identifySubRoutine') ? coscripterPrefs.getBoolPref('identifySubRoutine') : false
	
}


// called when New button is clicked in sidebar, or when a script is loaded into the sidebar
function registerToReceiveRecordedCommands() {
	//debug("registerToReceiveRecordedCommands: subscribing")
	if (!contextP()) {
		components.filterPassword().addListener(receiveRecordedCommand);
		/*
		// YOU MAY MANUALLY ADD FILTERS AFTER THE PASSWORD 
		// FILTER HERE...  YOU CAN ALSO CREATE THEM GLOBALLY
		// USING THE APPROACH USED IN THE PASSWORD FILTER OR
		// COMMAND GENERATOR

		components.filterPassword().addListener(components.generateWindowSlop().handleCommand);
		components.generateWindowSlop().addListener(receiveRecordedCommand);
		*/
	}
}

function unRegisterToReceiveRecordedCommands() {
	//debug("unRegisterToReceiveRecordedCommands: unsubscribing")
	if (!contextP()) {
		components.filterPassword().removeListener(receiveRecordedCommand);
	}
}

function notifyWiki() {
	try {
		if ( !wikiNotified ) {
			wikiNotified = true;
		
			if ( currentProcedure.getId() ) { 
				// Post execution logs back to the server which gave us the
				// current script
				var executedURL = currentProcedure.getExecutedUrl();
				if (executedURL) {
					this.components.utils().post(executedURL, {
						id : currentProcedure.getId(),
						client : 'CoScripter'
						}, true);
					// ignore failure   
				}
			}
		}
	} catch (e) {
		dump("Error logging execution: " + e + "\n");
	}
}



//////////////////////////////////////////////////////
//                       Main CoScripter Windows
//////////////////////////////////////////////////////
function getSidebarBrowser() {
	//return getMainChromeWindow().document.getElementById("sidebar")
	return window.top.document.getElementById("sidebar")
}

function getCoScripterWindow() {
	return components.utils().getCoScripterWindow(window);
}

function getProcedureInteractor() {
    return components.utils().getProcedureInteractor(window);
}

function getProcedureInteractorBrowser() {
    return components.utils().getProcedureInteractorBrowser(window);
}

function getProcedureInteractorBody() {
	return components.utils().getProcedureInteractorBody(window);
}

function getSavePanel() {
    return components.utils().getSavePanel(window);
}

function getProcedureTitleTextBox() {
    return components.utils().getProcedureTitleTextBox(window);
}

function getProcedurePrivateButton() {
	return components.utils().getProcedurePrivateButton(window);
}

function getWelcomePage() {
	var prefs = components.utils().getCoScripterPrefs()
	var localWelcomePage = components.utils().getLocalWelcomePage(window);
	var serverWelcomePage = components.utils().getServerWelcomePage(window);
	if (localP()) {
		serverWelcomePage.collapsed="true"
		return localWelcomePage
	}
	localWelcomePage.collapsed="true"
	return serverWelcomePage
}

function getMainChromeWindow() {
	return components.utils().getMainChromeWindow(window);
}


function getCurrentContentBrowser() {
	return window.top.document.getElementById("content").selectedBrowser;
}

function getCurrentContentWindow() {
	return window.top.document.getElementById("content").selectedBrowser.contentWindow;
}

function getToWikiButton() {
	return components.utils().getToWikiButton(window);
}


function getParserComponent(){
    return coscripter.components.parser();
}

function getCoScripterConceptLearner() {
	try {
		return Components.classes["@coscripter.ibm.com/coscripter-conceptlearner/;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
	} catch (e) {
		
	}

}

/////////////////////////////////////////////////////////////////////////////////////////////


