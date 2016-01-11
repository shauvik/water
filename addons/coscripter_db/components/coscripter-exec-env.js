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
Contributor(s): Clemens Drews <cdrews@almaden.ibm.com> 

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
///////////////////////////////////////
//
//	Select
//	Click
//	Copy
//	Paste
//
//	preview
//		PREVIEW
//	findTarget
//
///////////////////////////////////////

//======================================================
// XPCOM registration constants Section
const nsISupports = Components.interfaces.nsISupports;

// You can change these if you like -
const CLASS_ID = Components.ID("0c303fcf-a44d-4289-b462-23a550f28429");
const CLASS_NAME = "CoScripter Execution Environment";
const CONTRACT_ID = "@coscripter.ibm.com/execution-exec-env;1";

// ======================================================
// Debug Section
var consoleService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);

// var doConsoleDebugging = false ;
var Preferences = {
	DO_CONSOLE_DEBUGGING		: false,
	DO_DUMP_DEBUGGING 			: false,
}

function debug(msg){
	if(Preferences.DO_CONSOLE_DEBUGGING){
		consoleService.logStringMessage("coscripter-exec-env.js: " + msg );
	}else if(Preferences.DO_DUMP_DEBUGGING){
		dump("coscripter-exec-env.js: " + msg + "\n");
	}
}

debug('parsing coscripter-exec-env.js');
// ======================================================


function getExecutionEnvironment(){
	return Components.classes["@coscripter.ibm.com/execution-exec-env;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
}

function ExecutionEnvironment(){
	this.wrappedJSObject=this;
    this.components = Components.classes["@coscripter.ibm.com/registry;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
    return this;
}

ExecutionEnvironment.prototype ={
	QueryInterface: function(aIID){
		// add any other interfaces you support here
		if (!aIID.equals(nsISupports))
			throw Components.results.NS_ERROR_NO_INTERFACE;
		return this;
	},
	
	getCurrentContext: function(){
	 	// this should be the complete context of the browser ... but for now the url is enough
		return {url: this.getWindow().contentWindow.location.href};
	},
	
	goDoCommand: function(commandName){	// commandName is a string, such as "cmd_paste"
		try {
			var currentChromeWindow = this.components.utils().getCurrentChromeWindow();
			var controller = currentChromeWindow.top.document.commandDispatcher.getControllerForCommand(commandName);
			if ( controller && controller.isCommandEnabled(commandName)) controller.doCommand(commandName);
		} catch (e) {
			debug("goDoCommand: An error occurred executing the " + commandName + " command\n" + e + "\n")
		}
	},
	
	Goto : function (url,thenDoThis){
		var currentChromeWindow = this.components.utils().getCurrentChromeWindow();
		var currentContentBrowser = this.components.utils().getCurrentContentBrowser(currentChromeWindow);
		this.components.utils().goToUrl(currentContentBrowser, url, thenDoThis, false) ;
	},
	
	Enter : function (target,text,thenDoThis,options){
		this.components.utils().enter(text, target, thenDoThis, options) ;
	},
	
	Append : function (target,text,thenDoThis){
		var targetWindow = this.components.utils().getChromeWindowForNode(target)
		this.components.utils().highlightThenDo(target, function() {
			target.innerHTML = target.innerHTML + text
			this.components.utils().betterThenDoThis(targetWindow, thenDoThis)
		})
	},
	
	//	Select
	Select : function (option, thenDoThis, turnonP, options){
		if (option.getAttribute("oncommand")) {
			option.doCommand()	// menu command
			thenDoThis()
		}
		else this.components.utils().select(option, thenDoThis, (turnonP==null)?true : turnonP, options) ;
	},
	
	ExpandOrCollapse : function (option, turnonP, thenDoThis){
		this.components.utils().expandOrCollapse(option, turnonP, thenDoThis)
	},
	
	//	Click
	Click : function (target,thenDoThis,ctrlP,options){
		this.components.utils().click(target, thenDoThis, ctrlP, options) ;
	},
	
	OpenNewTab : function (thenDoThis) {
		this.components.utils().openNewTab(window, thenDoThis);
	},
	
	Close : function (target, thenDoThis) {
		if (target.className == 'tabbrowser-tab') {
			this.components.utils().closeTab(window, target, thenDoThis);
		}
	},
	
	SwitchTo: function (target, thenDoThis) {
		if (target.className == 'tabbrowser-tab') {
			this.components.utils().selectTab(window, target, thenDoThis);
		}
	},
	
	//	Copy
	Copy : function (target, thenDoThis, options) {	//trunk version has no 'value' parameter
		if (target.tableElement) { // scratch space
			var scratchSpaceUI = target.tableElement.scratchSpaceUI
			var scratchSpaceEditor = scratchSpaceUI.getEditor()
			//var rowCount = scratchSpaceEditor.getDataRowCount(0)	//to verify that I have the correct Editor pointer
			var data = scratchSpaceEditor.getData(0, parseInt(target.rowIndex) - 1, parseInt(target.columnIndex))
			this.sendToClipboard(data)
		}
		else if (target.tagName == "INPUT") this.sendToClipboard(target.value)
		else if (target.textContent) this.sendToClipboard(target.textContent)	
		// trunk version Assumes target is a textbox
		thenDoThis();
	},
	
	//	Paste
	Paste : function (target, thenDoThis, options) {
		var contents = this.getClipboardContents();
		if (contents == null) return;
		var u = this.components.utils()
		if (target.rowNumber){	// vegemite spreadsheet
			var scratchSpaceUI = target.scratchSpaceUI
			var scratchSpaceEditor = scratchSpaceUI.getEditor()
			//var rowCount = scratchSpaceEditor.getDataRowCount(0)	//to verify that I have the correct Editor pointer
			scratchSpaceEditor.setData(0, parseInt(target.rowNumber)-1, parseInt(target.columnNumber)-1, contents)
			u.betterThenDoThis(window, thenDoThis)
		}
		else u.enter(contents, target, thenDoThis, options);
	},
	
	ChangeTableText: function(tableUI, row, column, text, thenDoThis) {
		// table is a VegemiteTableUI
		tableUI.setData(row, column, text);
		thenDoThis();
	},
	
	ChangeActivityTableText: function(cell, text, thenDoThis) {
		if(cell.firstChild && cell.firstChild.nodeName == "INPUT") {
			this.components.utils().highlightThenDo(cell, function() {
				cell.firstChild.value = text;
				thenDoThis();
			})			
		}
		this.components.utils().highlightThenDo(cell, function() {
			cell.childNodes[0].nodeValue = text;
			thenDoThis();
		})
	},
	
	BeginExtraction: function(thenDoThis) {
		var w = window;
		var c = w.top.coscripter;
		var d = c.DataExtraction;
		// start extracting
		d.startExtractionMode(w.top.gBrowser.selectedBrowser, c.scratchSpaceUI);
		d.onPerformContentSelection(function() {d.onElementSelected.apply(d, arguments);});
		thenDoThis();
	},
	
	EndExtraction: function(thenDoThis) {
		var w = window;
		var c = w.top.coscripter;
		var d = c.DataExtraction;
		// stop extracting
		d.extract();
		thenDoThis();
	},
	
	Find : function(searchTerm, thenDoThis, options){
		var win = this.components.utils().getChromeWindowForWindow(window);

		win.gFindBar.startFind.apply(win.gFindBar, [win.gFindBar.FIND_NORMAL]);
		win.gFindBar._findField.value = searchTerm;
		win.gFindBar._find.apply(win.gFindBar, [searchTerm]);
		thenDoThis();
	},
	
	FindAgain : function(previousP, thenDoThis, options)
	{
		var win = this.components.utils().getChromeWindowForWindow(window);

		win.gFindBar._findAgain.apply(win.gFindBar, [previousP]);
		thenDoThis();
	},

	Goforward : function(thenDoThis){
	},
	
	Goback : function(thenDoThis){
	},
	
	Reload : function(thenDoThis){
	},
		
	sendToClipboard : function(text) {
		this.components.utils().sendToClipboard(text);
	},

	getClipboardContents : function() {
		return this.components.utils().getClipboardContentsAsText();
	},
	
	// Returns the (index)th tab, where 0 is the first tab.
	getTab : function(window, index) {
		return this.components.utils().getTab(window, index);
	},
	
	///////////////////////////
	//	preview
	// /////////////////////////
	preview : function(command, options){
		var utils = this.components.utils()
		var node = null;
		try {
			if (command.hasTargetSpec()) {
				node = command.findTarget(this);
			}
		} catch (e) {
			
		}	

		// No target node, so we'll create one for bubblehelp
		var doc;
		if (node != null) {
			doc = node.ownerDocument;
		} else {
			var currentChromeWindow = this.components.utils().getCurrentChromeWindow();
			var currentContentWindow = this.components.utils().getCurrentContentWindow(currentChromeWindow)
			doc = currentContentWindow.document;
		}

		var previewConf = null;
		
		var stepNum = command.getLineNumber();
		var totalSteps = command.getTotalLines();
		var slopID = 'slop' + stepNum;

		var coscripterPrefs = utils.getCoScripterPrefs();
		var drawBubbles = coscripterPrefs.prefHasUserValue('showBubbleHelp') && coscripterPrefs.getBoolPref('showBubbleHelp');

		if (node != null && !(utils.xulNodeP(node))) {
			var highlightOptions = {};

			// Vegemite: if node is a XUL tree, then detect the right cell
			if (command.target && command.target.tableElement) {
				// +1 to account for column headers
				highlightOptions.rowIndex = command.target.rowIndex + 1;
				// +2 to account for the checkbox column and the row headers
				highlightOptions.columnIndex = command.target.columnIndex + 2;
				return null;	// preview highlighting not yet implemented for scratch spaces
			}
			
			// Highlight the SELECT node if the target is an OPTION
			if (node.nodeName == "OPTION") {
				node = node.parentNode;
			}

			// make sure we can see the node we are previewing
			utils.ensureVisible(node);
			
			// Highlight the node, and if the command has some special desires about how to highlight itself, 
			// give it a go (see the enter' and 'append' command comments above about 'decorateDiv')
			var color;
			if (null != options && null != options['color']) {
				color = options['color'];
			} else {
				color = command.canExecute() ? "green" : "red";
			}

			// Draw the big preview if the preference is enabled
			if (drawBubbles) {
				// Draw a spotlight with the big arrow box.
				previewConf = this.components.coscripterPreview().
					createAnchoredBubble(node, command.getSlop(), stepNum,
						totalSteps, slopID);
			} else {
				// Otherwise, draw only the traditional preview
				previewConf = {
					target : node 
				}
			}
			
			var div = utils.highlightNode(node, color, highlightOptions)	//		PREVIEW
			previewConf.div = div;
			previewConf.overHandler = function(e) {
				utils.setVisible(div, false)
				// if this is a decorated textBox div, remove the text
				// preview the first time the user mouses over
				if (div.childNodes[1]) div.childNodes[1].value = ""
			};
			previewConf.outHandler = function(e) {
				utils.setVisible(div, true)
			};

			/* we want the user to be able to click the thing that is highlighted if they want to,
			// but this is impossible when there is a div blocking the mouse commands 
			// (and I don't know a good way to forward them to the node beneath them),
			// so instead, we handle mouse events to hide the div whenever the user hovers their mouse over it*/         
			div.addEventListener("mouseover", previewConf.overHandler, false)
			node.addEventListener("mouseout", previewConf.outHandler, false)
			node.addEventListener("focus", previewConf.overHandler, false)
			node.addEventListener("blur", previewConf.outHandler, false)

			if(null!= options && null != options['overlaytext']){
				var decorateOptions = {};
				for (var prop in highlightOptions) {
					decorateOptions[prop] = highlightOptions[prop];
				}
				decorateOptions.canExecute = true;
				this.decorateTextBox(div,options['overlaytext'],node,{canExecute : true});
			}
		} else {
			var slop = command.getSlop();

			if (drawBubbles) {
				try {
					previewConf = this.components.coscripterPreview().createUnanchoredBubble(doc, slop, stepNum, totalSteps, slopID);
				} catch (e) {
					// TL: sometimes createUnanchoredBubble can be called
					// before the document has finished loading, which
					// causes bubble creation to fail; I haven't figured
					// out why, but I'm trapping the exception here anyway
					previewConf = {};
				}
			} else {
				previewConf = {};
			}
		}

		if(!options.fromrefresh && !options.recording) {
			var focusNode = doc.getElementById(slopID);
			if(focusNode) {
				focusNode.focus();
				focusNode.scrollIntoView(false);
			}
		}

		return previewConf;
	},


	///////////////////////////
	//	findTarget
	// /////////////////////////
	findTarget : function(command){
		var u = this.components.utils()
		var labeler = this.components.labeler()
		var currentChromeWindow = this.components.utils().getCurrentChromeWindow();
		var targetWindow = u.getCurrentContentWindow(currentChromeWindow)

		// Check if the command is in a dialog box
		// For now, assume the intended dialog box is the frontmost window (AC)
		if (command.targetSpec && command.targetSpec.isDialogP) {
			var dialogBox = u.getTopWindow()
			// debug("command-processor:CommandProcessor findTarget:command is in a dialog with title " + dialogBox.document.title)
			// make sure we got a dialog box if (dialogBox.document.documentElement.baseURI.indexOf("commonDialog") == -1)
			targetWindow = dialogBox
		}
		
		// Check if the command is a menu command
		// For now, assume the intended window is the currentChromeWindow (AC)
		if (command.targetSpec && command.targetSpec.targetType == "menu") {
			targetWindow = currentChromeWindow
		}
		
		var target = null;
		try {
			target = labeler.findTargetElement(targetWindow, command);
		} catch (e) {
			if (e=="target value not found")
				throw e
		}
		
		return target;
	},
	
	clearPreview : function(previewConfig){
        try{
            if(null != previewConfig){
				if(previewConfig.target != null &&
					("targetmargin" in previewConfig)) {
					previewConfig.target.style.margin = previewConfig.targetmargin;
				}
				if (previewConfig.divs) {
					for(divname in previewConfig.divs) {
						var div = previewConfig.divs[divname];
						if(divname == "node") {
							div.parentNode.replaceChild(div.firstChild, div);
						} else {
							div.parentNode.removeChild(div);
						}
					}
                }

				if (previewConfig.target != null) {
					previewConfig.target.removeEventListener("mouseout", previewConfig.outHandler, false);      
				}
				if (previewConfig.div) {
					previewConfig.div.parentNode.removeChild(previewConfig.div);
				}
            }
        }catch(e){
            debug('this.clearPreview : ' + e);
            dump('this.clearPreview : ' + e + '\n');
        }
	},
	
	getCurrentBrowser :  function (){
		var utils = this.components.utils();    
		var currentBrowser = utils.getCurrentContentBrowser(utils.getCurrentChromeWindow())
		return currentBrowser ;
	},

	getWindow : function() {
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
		                            .getService(Components.interfaces.nsIWindowMediator);
		var browserWindow = wm.getMostRecentWindow("navigator:browser");
		return browserWindow;
	},

	decorateTextBox : function(div, text, target, pc) {
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
		var pos = this.components.utils().getNodePosition(target, pc);
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
}
//************************************************************************
// ********************* XPCOM MODULE REGISTRATION*************************
// ************************************************************************

// =================================================
// Note: You probably don't want to edit anything
// below this unless you know what you're doing.
//
// Factory
var ExecutionEnvironmentFactory = {
	singleton : null,
	createInstance: function (outer, iid)
	{
		if (outer != null)
			throw Components.results.NS_ERROR_NO_AGGREGATION;
		if (this.singleton == null)
			this.singleton = new ExecutionEnvironment();
		return this.singleton.QueryInterface(iid);
	}
};


// Module
var ExecutionEnvironmentModule = {
	registerSelf: function(aCompMgr, aFileSpec, aLocation, aType){
		aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		aCompMgr.registerFactoryLocation(CLASS_ID, CLASS_NAME, CONTRACT_ID, aFileSpec, aLocation, aType);
	},

	unregisterSelf: function(aCompMgr, aLocation, aType){
		aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		aCompMgr.unregisterFactoryLocation(CLASS_ID, aLocation);        
	},

	getClassObject: function(aCompMgr, aCID, aIID){
		if (!aIID.equals(Components.interfaces.nsIFactory))
			throw Components.results.NS_ERROR_NOT_IMPLEMENTED;

		if (aCID.equals(CLASS_ID))
			return ExecutionEnvironmentFactory;
		throw Components.results.NS_ERROR_NO_INTERFACE;
	},

	canUnload: function(aCompMgr) { return true; }

};

// module initialization
function NSGetModule(aCompMgr, aFileSpec) { return ExecutionEnvironmentModule; }
debug('done parsing coscripter-exec-env.js');

