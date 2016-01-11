/*
This Program contains software licensed pursuant to the following : 
MOZILLA PUBLIC LICENSE
Version 1.1
The contents of this file are subject to the Mozilla Public License
Version 1.1 (the "License"); you may not use this file except in
compliance with the License. You may obtain a copy of the License at
http: //www.mozilla.org/MPL/

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
furnished to do so, subject to the following conditions : 
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

// coscripter-sidebar.js, coscripter-command-processor.js, coscripter-context.js, 
// coscripter-editor-richtextbox.js, and coscripter-dom-utils.js 
//are all loaded into the sidebar coscripterWindow by coscripter-siderbar.xul. 

///////////////////////////////////////////////////
//////////////  coscripter-command-processor.js  ///////////////
///////////////////////////////////////////////// 
// This file  contains routines for 
//    Recording, Interpreting, and Executing CoScripter script commands.
///////////////////////////////////////////////// 
//		
//		Recording
//		receiveRecordedCommand     Callback from command-generator component
//		insertCommand
//			createWindowDescriptorForDisplay
//			setCurrentCommandWindowDescriptorFromDisplay
//
//		Interpreting has moved to strict-parser.js
//
//		Executing
//		CommandProcessor
//			previewCurrentStep
//				PARSE
//			commandExecutedCallback
//			executeDialogCommand
//			executeStep
//				EXECUTE
//		executeModalCommands
//
//		vv  MOVED TO EXEC-ENV  vv
//
//		commandExecutionEnvironment
//			preview 
//				PREVIEW
//			findTarget
//
////////////////////////////////////////////////

// Debug flag to disable periodic previewing
// Please leave this as false unless you are debugging!
var DEBUG_DISABLE_PERIODIC_PREVIEW = false;

var EXECUTION_TARGET_VALUE_NOT_FOUND = 999 ;

//////////////////////////////////////////////////////////////////////////////////////////////////
//		Recording
/////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////
//		receiveRecordedCommand     Callback from command-generator component
////////////////////////////////
// *** This is the CallBack used by the command-generator component to pass on each CoScripter Command object that it generates 
//whenever it receives a UI event from YULE.
//  (It's called receiveRecordedCommand because YULE is recording events. 
//   The event may be a recording of a user action, an execution of a CoScripter action, 
//   or a user action that auto-advances the current script)
//formerly called recorderRecipient
function receiveRecordedCommand(cmd) {  
	var u = CommandProcessor.components.utils()
	currentActionNumber += 1
	if (recording) {

		if ( firstCommandP() && !gotoP(cmd)){	//if first command is not a goto, insert a goto
			// Create a new goto command
			// TL: grab the URL out of the current browser's location bar, not
			// out of the document containing the recordedCommand's target,
			// because it could be a frame in a frameset (bug #75013)
			// This was failing when the ScrapBook is used, so now contextRecorder gets the url before calling ScrapBook
			// TODO: work around for context recording:
			//	recordedCommand.gotoCommandUrl ? recordedCommand.gotoCommandUrl  : 
			var gotoCommand = getCommands().createGotoFromParams(null, u.getBrowserDocument(u.getChromeWindowForWindow(window)).location.href);			

			if (gotoCommand.getLocation() != "about:blank")
			{
				// Insert go to command
				insertCommand(gotoCommand)
			}
		}	//end of 'if first command is not a goto'
		// Insert recorded command
		if (cmd.getAction() == 'assert') {
			//if (asserting) insertCommand(cmd)
		} 
		else insertCommand(cmd)
		// Insert recorded command
		//insertCommand(cmd)
		
	} else {	//not recording
		// Track user actions and advance cursor if necessary
		if (sameCommandP(cmd, CommandProcessor.currentCommand)) 
		{
			// Highlight this step
			u.highlightThenDo(procedureInteractor.getCurrentLine(),
				function() {
					// Advance to the next step, entering nested blocks
					CommandProcessor.advanceStep(false);
				});
			// CommandProcessor.advanceStep(false);
		}
	}	// end of not recording
}	// end of receiveRecordedCommand

// Test whether two commands are similar enough for the cursor to advance
// if it is currently pointing at currentCmd and the user performs recordedCmd
function sameCommandP(recordedCmd, currentCmd) {
	if (!currentCmd) return false;
	// Any two goto steps match
	if ((recordedCmd.getAction() == getCommands().ACTIONS.GOTO) &&
		(currentCmd.getAction() == getCommands().ACTIONS.GOTO))
		return true;
	// Otherwise compare the action, target label, and target type
	if (recordedCmd.getAction() == currentCmd.getAction() &&
		recordedCmd.getTargetLabel() == currentCmd.getTargetLabel() &&
		recordedCmd.getTargetType() == currentCmd.getTargetType())
		return true;
	if ((currentCmd.getAction() == getParserComponent().ParserConstants.YOU) && (
			sameCommandP(recordedCmd, currentCmd.nestedCommand)))
		return true;
	return false;
}

function firstCommandP() {
	var cln = procedureInteractor.getCurrentLineNumber();
	for ( var i = 0; i <= cln; i++ ) {
	  var line = procedureInteractor.getLineWithNumber(i);
	  if ( !isLineComment(line) ) {
	      var linetext = procedureInteractor.getLineText(line);
	      linetext = CommandProcessor.components.utils().trim(linetext);
	      if ( linetext == "" ) continue; // Skip empty lines           
	      return false;
	  }
	}
	return true;
}

function gotoP(cmd) {
	// Slightly kludgy. We can treat an "Open Location" menu command as a GoTo command, because it will probably be followed by a loadURIEvent (AC)
	var targetLabel = cmd.targetSpec && cmd.targetSpec.targetLabel ? cmd.targetSpec && cmd.targetSpec.targetLabel && cmd.targetSpec.targetLabel.literal : null
	return (cmd.getAction() == getCommands().ACTIONS.GOTO) || (targetLabel && targetLabel.indexOf("File>Open Location") != -1)
}

function skipCommand(command) {
	// The Recorder currently sends "Enter" keypresses, in case a "submit" doesn't generate a button click
	// Don't record the keypress if the click was just recorded
	if (command.getAction() == getCommands().ACTIONS.ENTER &&
		command.getValue() == "\n" &&
		previousCommand && (
			previousCommand.getAction() == getCommands().ACTIONS.CLICK ||
			previousCommand.getAction() == getCommands().ACTIONS.GOTO))
		return true;
		
	// Pasting into a textbox also generates an Enter command.  
	// When this happens, discard the Enter command.
	if (command.getAction() == getCommands().ACTIONS.ENTER &&
		previousCommand && previousCommand.getAction() == getCommands().ACTIONS.PASTE) {
			var commandSlop = command.toSlop()
			var prevCommandSlop = previousCommand.toSlop()
			var intoIndex = commandSlop.indexOf("into")
			var prevIntoIndex = prevCommandSlop.indexOf("into")
			if (commandSlop.slice(intoIndex, commandSlop.length) == prevCommandSlop.slice(prevIntoIndex, prevCommandSlop.length)){
				return true;					
			}
		}

	/* Do not record chrome commands
	if ( command.targetArea == "chrome" && 
			command.targetType != "toolbar item" &&
			command.targetType != "tab"  && 
			command.targetType != "menu"  && 
			command.targetType != "menuitem" &&
			command.action != getCommands().ACTIONS.GOTO ) 
		return true;
	*/	

	//if ( command.targetLabel == "tab-close-button" || command.targetLabel == "CoScripter" ) return true
	
	// Do not record a "File>Open Location" command, since it will probably be followed by a loadURIEvent.
	// This is a poor man's version of converting a recording sequence of '1) cmd-L 2) enter url into the Address Bar 3) Type "enter" key' 
	//into the higher-level command 'go to url'.  Fixes bug # 117781
	var targetLabel = command.targetSpec && command.targetSpec.targetLabel ? command.targetSpec && command.targetSpec.targetLabel && command.targetSpec.targetLabel.literal : null
	if (targetLabel && targetLabel.indexOf("File>Open Location") != -1) return true

	// Do not record sidebar commands
	if ( command.targetArea == "coscripterSidebar" ) return true
	// Do not record error console commands
	if ( command.windowDescriptor == "Error Console") return true
	// Do not record debugger commands
	if ( command.windowDescriptor == "JavaScript Debugger") return true
	
	// Do not skip anything else
	return false
}

//		insertCommand
// Add the textual description of this command to the sidebar's Editor area
function insertCommand(command) {
	if (skipCommand(command)) return;
	
	// Generate command text
	try {
		command.variabilize(coscripter.db);
		var commandText = command.toSlop();
	} catch (e) {
		dump('Error making slop: ' + e.toSource() + '\n');
		debug('Error making slop: ' + e.toSource() + '\n');
	}
	commandText = cleanCommandTextForInteractor(commandText)
	
    // Dijit Enter commands sometimes fire both DOM and Dojo onChange events. Don't include a duplicate command.
    if (command.getAction() == getCommands().ACTIONS.ENTER && procedureInteractor.getCurrentLineText() == commandText) return;

    previousCommand = command;
	
	// Add a new empty line
	if ( procedureInteractor.getCurrentLineText() != "" ) {
		procedureInteractor.moveCursorLineEnd()	// Move to end of line
		procedureInteractor.insertLine("", true)	// Insert a new line 
	}
	// Add indent if none exists
	var currentline = procedureInteractor.getCurrentLine()
	if ( !procedureInteractor.hasLineIndent(currentline) ) {
		CoscripterDomUtils.removeClass(currentline, "comment")
		procedureInteractor.increaseLineIndent(currentline)
	}
	
	// Add the window descriptor
	var windowDescriptor = createWindowDescriptorForDisplay(command)
	commandText += windowDescriptor
	
	// Add the text to the interactor;    
	procedureInteractor.insertText(commandText)
	procedureInteractor.moveCursorLineEnd()
	
	edited = true
	updateSidebarTitle()
}

//			createWindowDescriptorForDisplay
// During Recording, determine what to include in the slop for the current line,
//   based on what window descriptors are shown for previous lines
function createWindowDescriptorForDisplay(command){
	// ToDo: parse any edited line and get its windowId (AC)
	if(!command.hasTargetSpec()) return ""
	var targetSpec = command.targetSpec
	var windowId = targetSpec.getWindowId()
	var windowDescriptor = targetSpec.getWindowDescriptor()
	
	var pI = procedureInteractor
	var currentLineNumber = pI.getCurrentLineNumber()
	var currentLine = pI.getCurrentLine()
	
	if (targetSpec.getWindowType() == "dialog") return windowDescriptor
	
	currentLine.setAttribute("windowId", windowId)
	for (var i=currentLineNumber-1; i>0; i--) {
		var prevLine = pI.getLineWithNumber(i)
		var prevWindowId = prevLine.getAttribute("windowId")
		if (prevWindowId) break;
	}
	
	if (prevWindowId) {
		if (windowId == prevWindowId) return ""
		else return windowDescriptor
	}
	else {
		if (windowId == 0) return ""	//the original window (I hope (AC))
		else return windowDescriptor
	}	
}

//			setCurrentCommandWindowDescriptorFromDisplay
// During execution, since window descriptors are elided from slop if they can be determined from
//  the slop of prior commands in the editor window, this function looks at the 
//  previous slop to determine the window descriptor for the current command
function setCurrentCommandWindowDescriptorFromDisplay(){
	var u = CommandProcessor.components.utils()
	var currentCommand = CommandProcessor.currentCommand
	var targetSpec = currentCommand.targetSpec
	var windowId = null
	var windowName = null
	var windowType = null
	var windowDescriptor = null
	
	var pI = procedureInteractor
	var currentLineNumber = pI.getCurrentLineNumber()

	for (var i=currentLineNumber; i>0; i--) {
		var line = pI.getLineWithNumber(i)
		var lineText = pI.getLineText(line)
		lineText = u.trim(lineText)
		
		if (lineText.indexOf("in the dialog box") == lineText.length-"in the dialog box".length) {
			targetSpec.isDialogP = true
			targetSpec.windowType = "dialog"
			return
		}
		if (lineText.indexOf("in the dialog") == lineText.length-"in the dialog".length) {
			targetSpec.isDialogP = true
			targetSpec.windowType = "dialog"
			return
		}
		// in the "Preferences" window
		var res = lineText.match(/in the (\"([^"\\]|\\.)*")|(\'([^\'\\]|\\.)*\') window/)
		if (res) {
			targetSpec.windowName = res[1].slice(1,res[1].length-1)
			return
		}
		if (lineText.indexOf("in the main window") == lineText.length-"in the main window".length) {
			targetSpec.windowId = 0
			return
		}
		// in window #2; in window 2
		res = lineText.match(/in window #?([0-9]+)/)
		if (res) {
			targetSpec.windowId = res[1]
			return
		}
	}
	
	targetSpec.windowId = 0
}


function cleanCommandTextForInteractor(commandText) {
	commandText = CommandProcessor.components.utils().trim(commandText)	// Remove extra white spaces
	commandText = commandText.replace(new RegExp("\n", "g"), '\\n')	// Escape newlines
	return commandText
}

//////////////////////////////////////////////////////////////////////////////////////////////////
//		Executing
/////////////////////////////////////////////////////////////////////////////////////////////////
// Interpret the current line of the script that is loaded in the sidebar, 
//  and display preview highlighting (i.e. the green highlighting) of its target in the currentContentWindow
//
/*
 previewCurrentStep is called : 
 *when a different window becomes the currentContentWindow
		(not yet implemented.  Could possibly listen to onFocus (or DOMFocusOut) on all open mainChromeWindows, and detect when the currentContentWindow changes)
 *when a different Tab becomes the currentContentWindow
		(addTabChangeListener gets called by loadProcedureData whenever a procedure is loaded into the sidebar.  It attaches onTabChange, which then gets called whenever a different Tab becomes the currentContentWindow, and onTabChange calls processCurrentLine)
 *when the content of the currentContentWindow changes
		(addOnLoadObserver gets called by loadProcedureData whenever a procedure is loaded into the sidebar.  It adds the onLoadObserver, which then gets called whenever an onLoad event occurs anywhere in FFox, and if the onLoad is in the currentContentWindow, it calls processCurrentLine)
		(we do not yet handle Content changes caused by DHTML or httpRequest)
 *when a procedure is loaded into the sidebar 
		(when a procedure is loaded, loadProcedureData calls loadProcedureIntoInteractor, which calls processCurrentLine)
 *when a different currentLine is selected
		(every time the sidebar is opened, onLoad calls initializeSidebar, which calls initializeProcedureInteractor which attaches (a) delayedInteractorListener and (b) delayedInteractorVerifier to the editor.  (a) delayedInteractorListener then gets called whenever there is a high-level editor change, such as cursor movements and edit-mode changes, and if it is a LINE_CLICK_EVENT, processCurrentLine is called.  For all other editor changes, interactionListener is called after .5 seconds, and it calls processCurrentLine
 *when the currentLine advances
		(onStep and onRun call executeProcedure, which calls either executeStep or advanceStep)
*when the currentLine is edited
		(delayedInteractorVerifier -- (b) above -- then gets called whenever the text on a line in the editor is changed, and it calls verifyInteractor, which calls processCurrentLine after 2.5 seconds.)
 *when the Personal Database changes 
		(set up by initializeDatabase; called by onChange events in the Personal Database)
*/
////////////////////////////
//		CommandProcessor
////////////////////////////
var CommandProcessor = {
	// TL: I don't like having multiple state variables here.  If we write
	// buggy code, it's possible to get into the state where run=true and
	// stopped=true ... meaning that code which consults one but not the
	// other variable will get the wrong state.
    components : Components.classes["@coscripter.ibm.com/registry;1"].getService(Components.interfaces.nsISupports).wrappedJSObject,
	run : false,
	stopped : true,
	currentCommand: null,
	waitforTimeout : null,		// timeout handler for the waitfor callback

	// TL: adding yet another bit of state (yuck) to handle one specific
	// case where control never returns to our code after we synthesize a
	// click event on a radiobutton.  See bug [#88674] Execution hangs on a
	// "turn on radio button" step (also in M3), and bug [#104308]
	// Recording stops working when a step is interrupted.
	stepBeingExecuted : false,

	isRunning : function(){
		return CommandProcessor.run ;
	},
	canRun : function(){
		return !(CommandProcessor.currentCommand.getAction() == 'unnexecutable') && CommandProcessor.currentCommand.canExecute(); 
	},
	start : function(){
		CommandProcessor.stopped = false;
	},
 	stop : function(){
		CommandProcessor.stopped = true;
		CommandProcessor.run = false ;
	},
	setRunMode : function(){
		CommandProcessor.run = true ;
	},
	isStopped : function(){
		return CommandProcessor.stopped;
	},
	// EVENT Listener stuff
	eventTypes: {
		'advancestep' : [],
		'previewcurrentstep': [],
		'doneexecuting': []
	},
	
	addEventListener: function(topic,callback){
		if(this.eventTypes[topic] !== null ){
			this._addEventListener(this.eventTypes[topic], callback);
		}
	},
	removeEventListener: function(topic,callback){
		if(this.eventTypes[topic] !== null ){
			this._removeEventListener(this.eventTypes[topic], callback);
		}
	},
	notifyEventListeners: function(topic){
		if(this.eventTypes[topic] !== null ){
			for(var j=0;j<this.eventTypes[topic].length;j++){
				try{
					var event = {topic:topic, currentCommand:this.currentCommand};
					this.eventTypes[topic][j](event);
				}catch(e){
					this._removeEventListener(this.eventTypes[topic], this.eventTypes[topic][j]);
				}			
			}
		}
	},
	containsEventListener:function(topic,callback){
		if(this.eventTypes[topic] !== null ){
			return ( this._indexOfEventListener(this.eventTypes[topic],callback) !=-1 );
		}
		return false ;
	},
	_indexOfEventListener:function(listeners,callback){
		var i = 0 ;
		for(i=0;i<listeners.length;i++){
			if(listeners[i]===callback){
				return i ;
			}
		}
		return -1;
	},
	_addEventListener:function(listeners,callback){
		if(this._indexOfEventListener(listeners,callback) == -1){
			listeners.push(callback);
		}
	},
	_removeEventListener:function(listeners,callback){
		var index = this._indexOfEventListener(listeners,callback);
		if(index != -1){
			var removed = listeners.splice(index,1);
		}
	},
	/////////////////////////////////
	//			previewCurrentStep
	////////////////////////////////
	previewCurrentStep : function(fromrefresh) {
		try{
			if(CommandProcessor.currentCommand!= null){
				CommandProcessor.currentCommand.clearPreview();
			}
			// if any callback calls this while there's no procedure being played back or recorded,
			// return right away (but remove possible stale previews above)
			if(currentProcedure == null) return;
			if(contextP() && !currentCoScript) return;
	    
			// Get current line
			var currentLine = procedureInteractor.getCurrentLine();
			var isComment = isLineComment(currentLine);
			
			var currentOriginalSlop = procedureInteractor.getCurrentLineText();
			if (!currentOriginalSlop) return;
			// Massage the slop for parsing
			var currentModifiedSlop = CommandProcessor.massageSlopForInterpreter(currentOriginalSlop);
				
			if (!isComment) {
				var p = getParserComponent();
				var parser = new p.Parser(currentModifiedSlop);
				///////////////////////////
				//				PARSE   This is where the current line gets PARSED
				///////////////////////////
				try {
					CommandProcessor.currentCommand = parser.parse()
					CommandProcessor.currentCommand.setLineNumber(procedureInteractor.getCurrentLineNumber() + 1);
					CommandProcessor.currentCommand.setTotalLines(procedureInteractor.getLineCount());
					if (CommandProcessor.currentCommand.targetSpec && !CommandProcessor.currentCommand.targetSpec.windowName && !CommandProcessor.currentCommand.targetSpec.windowId){
						// get window info from previous steps in the editor
						setCurrentCommandWindowDescriptorFromDisplay()
					}
				} catch (e) {
					debug("command-processor: previewCurrentStep's parse failed: " + currentModifiedSlop + ", with error: " + e.toSource());
					var commandComponent = getCommands();
					var execEnv = coscripter.components.executionEnvironment(); 		
					CommandProcessor.currentCommand = new commandComponent.UnexecutableCommand(currentModifiedSlop, execEnv);
				}
				if (contextP() && CommandProcessor.currentCommand.type != "go to")  {	// pbd Command
					CommandProcessor.currentCommand.editorLineNumber = procedureInteractor.getCurrentLineNumber()
					var stepId = currentLine.getAttribute("stepId")
					if (!stepId) debug("previewCurrentStep has no stepId")
					var stepSpecifier = coscripter.components.abstracter().createNewSpecifier()
					if (ScrapBookReadingP()) 
						var stepInterpretations = stepSpecifier.getStepInterpretations(currentCoScript, stepId, CommandProcessor.currentCommand, window)
					else {
						var interpretations = stepSpecifier.getStepInterpretations(currentCoScript, stepId, CommandProcessor.currentCommand, window)
						//debug("previewCurrentStep has " + (interpretations ? interpretations.length : 0) + " interpretations")
					}
				}
			} else {	// Comment Command
				var commandComponent = getCommands();
				var execEnv = coscripter.components.executionEnvironment(); 		
				CommandProcessor.currentCommand = new commandComponent.CommentCommand("comment", currentModifiedSlop, execEnv);
			}
			
			// TL: this does not work for commands nested inside a YOU step
			// because the YOU step does not pass these calls through.
			// This is done deliberately so that we don't display
			// overlaytext on top of the highlight, but this could change
			// in the future.
			try {
				CommandProcessor.currentCommand.fillInVars(coscripter.db);
			} catch (e) {
				dump('Error filling in vars: ' + e.toSource() + '\n');
				debug('Error filling in vars: ' + e.toSource() + '\n')
			}

			// TL: turn the current-line box a different color depending on
			// how we have parsed the step
			var targetValNotFound = null;
			try {
				if (CommandProcessor.currentCommand.getAction() == getParserComponent().ParserConstants.YOU) {
					procedureInteractor.colorCurrentLine("orange");
						// DB Connect
					var file = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties)
                     .get("ProfD", Components.interfaces.nsIFile);
					file.append("my_db_file_name.sqlite");

					var storageService = Components.classes["@mozilla.org/storage/service;1"]
                        .getService(Components.interfaces.mozIStorageService);
					var dbConn = storageService.openDatabase(file); // Will also create the file if it does not exist
	//Insert script into db
					
					dbConn.executeSimpleSQL("UPDATE coscripter SET status='Requires user input' where status='Running'");
					//alert("Requires user input");
				}
				else 
					if (!CommandProcessor.currentCommand.canExecute()) {
						procedureInteractor.colorCurrentLine("red");
							// DB Connect
						var file = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties)
                     .get("ProfD", Components.interfaces.nsIFile);
						file.append("my_db_file_name.sqlite");

						var storageService = Components.classes["@mozilla.org/storage/service;1"]
                        .getService(Components.interfaces.mozIStorageService);
						var dbConn = storageService.openDatabase(file); // Will also create the file if it does not exist
						//Insert script into db
					
					dbConn.executeSimpleSQL("UPDATE coscripter SET status='ERROR in Script' where status='Running'");
						//alert("ERROR in Script");
					}
					else {
						procedureInteractor.colorCurrentLine("green");
					}
			} catch (e) {
				debug('Exception from findtarget ' + e.toSource() + '\n')
				if (e == "target value not found") {
							procedureInteractor.colorCurrentLine("red");
								// DB Connect
						var file = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties)
                     .get("ProfD", Components.interfaces.nsIFile);
						file.append("my_db_file_name.sqlite");

						var storageService = Components.classes["@mozilla.org/storage/service;1"]
                        .getService(Components.interfaces.mozIStorageService);
						var dbConn = storageService.openDatabase(file); // Will also create the file if it does not exist
						//Insert script into db
					
					dbConn.executeSimpleSQL("UPDATE coscripter SET status='ERROR in Script' where status='Running'");
						//alert("ERROR in Script");
				}	
			}	

			// Now that we have parsed the current step and colored the box
			// appropriately, let's return before preview if we are in
			// recording mode.
			if (recording) return;
			
			// TL: We used to check currentCommand.canExecute() here, but
			// that meant that we would not do preview highlighting on
			// textboxes when they referenced nonexisting personal db
			// values.  So I changed it to call preview no matter what,
			// which I hope won't break anything because the preview
			// functions should be robust and do the best they can even if
			// the command is incomplete.
			CommandProcessor.currentCommand.preview({'fromrefresh':fromrefresh,recording:recording});
		}catch(e){
			if (e == "target value not found") {
			
			}
			else {
				stopRunning();
				dump('exception in CommandProcessor.previewCurrentStep : ' + e.toSource() + '/' + e.toString() + '\n');
				debug('exception in CommandProcessor.previewCurrentStep : ' + e.toSource() + '/' + e.toString() + '\n');
			}	
		}
		
		var status = determineInterpretationStatus(CommandProcessor.currentCommand);
		//if (targetValNotFound != null) 
			//status = targetValNotFound;
		displayStatus(status,CommandProcessor.currentCommand);
		CommandProcessor.notifyEventListeners('previewcurrentstep'); 
	},	// end of previewCurrentStep
	
	
	
	clearPreview : function() {
		if(null != CommandProcessor.currentCommand){
			CommandProcessor.currentCommand.clearPreview()
		}
	},

	cleanupAfterStepExecution : function() {
		// Don't do anything if we aren't in the middle of executing a step
		if (CommandProcessor.stepBeingExecuted == false) return;

		// Reset the flag
		CommandProcessor.stepBeingExecuted = false;

		// TL: re-enable recording after completing the step
		if (!contextP()) registerToReceiveRecordedCommands();
		// AC: turn off generation of PerformedSteps
		else getPbDCommandGenerator().removeListener(receiveGeneratedCommandForPbD)

		// Set current line executed
		var currentLine = procedureInteractor.getCurrentLine();
		setLineExecuted(currentLine);

		// Clear preview of last-executed command
		if (null != CommandProcessor.currentCommand) {
			CommandProcessor.currentCommand.clearPreview();
		}
	},
	
	////////////////////////////////////////
	//			commandExecutedCallback
	////////////////////////////////////////
	// This will be called after any command has been executed
	commandExecutedCallback : function() {  
		//debug("in commandExecutedCallback")
		// First, clean up after executing the last step
		CommandProcessor.cleanupAfterStepExecution();

		// ----------------------------------------------------------------------
		// Now, figure out how to proceed

		// Handle IF commands differently
		// If the condition evaluates to true, step into the IF
		// Otherwise, continue on to the next step with the same
		// indentation as the current step
		var stepAvailable;
		if (CommandProcessor.currentCommand.getAction() == getCommands().ACTIONS.IF) {
			var evalStatus = CommandProcessor.currentCommand.evaluate();
			if (evalStatus) { stepAvailable = CommandProcessor.advanceStep(false); } 
			else { stepAvailable = CommandProcessor.advanceStep(true); }
		} else { // Advance to the next step as normal
			//debug("commandExecutedCallback: Executed command " + CommandProcessor.currentCommand.getSlop())
			stepAvailable = CommandProcessor.advanceStep(false); 
			//debug("cEC advanced Step. currentCommand is now " + CommandProcessor.currentCommand.getSlop())
		}	
		if (stepAvailable==false){
				// DB Connect
					var file = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties)
                     .get("ProfD", Components.interfaces.nsIFile);
					file.append("my_db_file_name.sqlite");

					var storageService = Components.classes["@mozilla.org/storage/service;1"]
                        .getService(Components.interfaces.mozIStorageService);
					var dbConn = storageService.openDatabase(file); // Will also create the file if it does not exist
	//Insert script into db
					
					dbConn.executeSimpleSQL("UPDATE coscripter SET status='Done' where status='Running'");
		}
		
		if ( 	CommandProcessor.isRunning() && 
				 stepAvailable &&
				 !(CommandProcessor.currentCommand.getAction() == getCommands().ACTIONS.YOU) &&
				 (!CommandProcessor.currentCommand.needsVars() || CommandProcessor.currentCommand.hasNeededVars()) &&
				 !(CommandProcessor.currentCommand.getAction() == getCommands().ACTIONS.UNEXECUTABLE)	) {				
				 				//&& CommandProcessor.currentCommand.canExecute() &&	// TL: took these conditions out for autowait
			// Execute the remaining steps of the procedure
			var thisCommand = CommandProcessor.currentCommand.getSlop()
			//debug("cEC calling executeProcedure for " + thisCommand)
			CommandProcessor.executeProcedure();
			//debug("cEC did executeProcedure for " + thisCommand)
		} else {
			stopRunning();
			if ( !stepAvailable ) {
				//debug("we've finished the script in commandExecutedCallback")
				// If we get here, we've finished the script and are about to start over from the beginning
				// TL TODO: pop up a dialog box saying the script has finished

				// Clear out the preview from the last step before moving the execution cursor back to the first step
				if(CommandProcessor.currentCommand!= null){ CommandProcessor.currentCommand.clearPreview(); }
				
				// This causes the preview to be refreshed, which causes the notification area to display "click step or run"
				CommandProcessor.moveToFirstStep();
				clearExecutedLines();	// Reset execution counter so runs are logged again
				wikiNotified = false;

				// So we have to reset the notification area back to "Done" after moving the cursor up to the top
				status = EXECUTION_COMPLETED; 
				displayStatus(status,null);
			} else {
				// There is a step available, but we are not automatically executing it
				// If we can't find its target, then set up a timer to periodically check for the target
				if (CommandProcessor.currentCommand.hasTargetSpec()) {
					//debug("about to do findTarget")
					var target = null;
					try {
						target = CommandProcessor.currentCommand.findTarget();
					} catch (e) {
						dump('Exception raised in findTarget: ' +
							e.toSource() + '/' + e.toString() + '\n');
					}
					//debug("did findTarget")

					if (!target) {
						if (!DEBUG_DISABLE_PERIODIC_PREVIEW) gcos_PeriodicPreviewer.restart();
					} // TL: re-enable periodic previewer
				}
			}
		}	// end of stopRunning()
	},	// end of commandExecutedCallback
	
	//			executeDialogCommand
	// this is a copy of commandExecutedCallback, used only by executeModalCommands when yule handles an event in a dialog box
	executeDialogCommand : function() {  
		//debug("in executeDialogCommand")
		// First, clean up after executing the last step
		CommandProcessor.cleanupAfterStepExecution();

		// ----------------------------------------------------------------------
		// Now, figure out how to proceed

		// Handle IF commands differently
		// If the condition evaluates to true, step into the IF
		// Otherwise, continue on to the next step with the same
		// indentation as the current step
		var stepAvailable;
		if (CommandProcessor.currentCommand.getAction() == getCommands().ACTIONS.IF) {
			var evalStatus = CommandProcessor.currentCommand.evaluate();
			if (evalStatus) { stepAvailable = CommandProcessor.advanceStep(false); } 
			else { stepAvailable = CommandProcessor.advanceStep(true); }
		} else { // Advance to the next step as normal
			//debug("executeDialogCommand: Executed command " + CommandProcessor.currentCommand.getSlop())
			stepAvailable = CommandProcessor.advanceStep(false); 
			//debug("eDC advanced Step. currentCommand is now " + CommandProcessor.currentCommand.getSlop())
		}	
		
		if ( 	CommandProcessor.isRunning() && 
				 stepAvailable &&
				 !(CommandProcessor.currentCommand.getAction() == getCommands().ACTIONS.YOU) &&
				 (!CommandProcessor.currentCommand.needsVars() || CommandProcessor.currentCommand.hasNeededVars()) &&
				 !(CommandProcessor.currentCommand.getAction() == getCommands().ACTIONS.UNEXECUTABLE)	) {				
				 				//&& CommandProcessor.currentCommand.canExecute() &&	// TL: took these conditions out for autowait
			// Execute the remaining steps of the procedure
			//debug("eDC calling executeProcedure for " + CommandProcessor.currentCommand.getSlop())
			CommandProcessor.executeProcedure();
			//debug("eDC did executeProcedure for " + CommandProcessor.currentCommand.getSlop())
		} else {
			stopRunning();
			if ( !stepAvailable ) {
				//debug("eDC: we've finished the script in executeDialogCommand")
				// If we get here, we've finished the script and are about to start over from the beginning
				// TL TODO: pop up a dialog box saying the script has finished

				// Clear out the preview from the last step before moving the execution cursor back to the first step
				if(CommandProcessor.currentCommand!= null){ CommandProcessor.currentCommand.clearPreview(); }
				
				// This causes the preview to be refreshed, which causes the notification area to display "click step or run"
				CommandProcessor.moveToFirstStep();
				clearExecutedLines();	// Reset execution counter so runs are logged again
				wikiNotified = false;

				// So we have to reset the notification area back to "Done" after moving the cursor up to the top
				status = EXECUTION_COMPLETED; 
				displayStatus(status,null);
			} else {
				// There is a step available, but we are not automatically executing it
				// If we can't find its target, then set up a timer to periodically check for the target
				if (CommandProcessor.currentCommand.hasTargetSpec()) {
					//debug("about to do findTarget")
					try {
						var target = CommandProcessor.currentCommand.findTarget();
						//debug("did findTarget")
						if (!target) {
							if (!DEBUG_DISABLE_PERIODIC_PREVIEW) gcos_PeriodicPreviewer.restart();
						} // TL: re-enable periodic previewer
					} catch (e) {
						// Let developers know something failed here
						dump("Error in executeDialogCommand: " +
							e.toSource() + '/' + e.toString() + '\n');
					}	
				}
			}
		}	// end of stopRunning()
	},	// end of executeDialogCommand
	

	executeProcedure : function() {
		if ( CommandProcessor.isStopped() ) {
			return;
		} 
		// Execute a single step
		//debug("executeProcedure: about to call executeStep")
		CommandProcessor.executeStep(CommandProcessor.commandExecutedCallback);
	    //debug("executeProcedure: executeStep returned.  Done")
	},
	
	///////////////////////////
	//			executeStep
	///////////////////////////	
	executeStep : function(thenDoThis) {
		var sidebarBundle = document.getElementById("bundle-coscripter-sidebar")
		var executing = sidebarBundle.getString("status.executing")

		// EE this will be in the execution engine
		// Clear timeout handler
		if (this.autowaitTimeout != null) {
			this.autowaitTimeout = null;
		}

		if(null == CommandProcessor.currentCommand) {
			return ;
		}

		//debug("executeStep currentCommand is " + CommandProcessor.currentCommand.getSlop())
		// AUTOWAIT
		// If we're running, we need to wait for the step to be executable
		// ... but only if the step is executable
		// ... and only if this command requires autoWait
		try {
			var cmdAct = CommandProcessor.currentCommand.getAction();
			if (CommandProcessor.isRunning() &&
			(CommandProcessor.currentCommand.autoWait() == true)) {
				var target = CommandProcessor.currentCommand.findTarget();
				if (!target) {
					dump('AUTOWAIT: Target not found, waiting\n');
					//debug('AUTOWAIT: Target not found, waiting\n');
					CommandProcessor.setCurrentLineExecuting();
					this.autowaitTimeout = window.setTimeout(function(){
						CommandProcessor.executeStep(thenDoThis);
					}, 500);
					// Stop doing anything else; we couldn't find the target
					return;
				}
			}
		} catch (e) {
			// Let developers know something failed here
			dump("Error waiting for step to be executable: " +
				e.toSource() + '/' + e.toString() + '\n');
		}
	       
		// EE: fold into step_starting callback
		// TL: temporarily disable recording while our step is executing
		if (!contextP()) {
			//components.commandGenerator().stopNotification();
			unRegisterToReceiveRecordedCommands();
		}
		// AC: generate a PerformedStep 
		else {
			var pbdCommandGenerator = getPbDCommandGenerator()
			var currentLineNumber = procedureInteractor.getCurrentLineNumber()
			pbdCommandGenerator.setScriptLineNumber(currentLineNumber)
			pbdCommandGenerator.addListener(receiveGeneratedCommandForPbD)
		}
		// TL: also disable periodic previewer while we are executing
		if (!DEBUG_DISABLE_PERIODIC_PREVIEW) gcos_PeriodicPreviewer.stop();
		
		// Execute current interpretation
		try
		{
			// If we are not Running (ie we are Stepping), don't execute PAUSE and WAIT commands 
			var commandActions = getCommands().ACTIONS
			if (CommandProcessor.isRunning() || 
					!(CommandProcessor.currentCommand.getAction() == commandActions.PAUSE || CommandProcessor.currentCommand.getAction() == commandActions.WAIT)) {
						
				if(CommandProcessor.currentCommand.canExecute())
				{
					// Initialize
					CommandProcessor.setCurrentLineExecuting();
					// dump('--- Executing step : ' + CommandProcessor.currentCommand.getSlop() + '\n');
					if(testSidebarP && procedureInteractor.getCurrentLineNumber() == 1) {
						debug("command-processor: CSTest.checkForMatchingTargets called in executeStep")	// I think testSidebarP is obsolete (AC)
						CSTest.checkForMatchingTargets(CommandProcessor.currentCommand)
					}
					logCoScripterEvent("Executed Step " + (procedureInteractor.getCurrentLineNumber()+1) )
					// TL: set stepBeingExecuted to true so that if we go to a different state before commandExecutedCallback is
					// invoked (e.g., by user clicking Home or closing the sidebar) we can finish cleaning up after the step
					CommandProcessor.stepBeingExecuted = true;
					var options = {isRunning: CommandProcessor.isRunning(), win : window}
	
					//debug("in executeStep: about to execute. The CommandProcessor.currentCommand is " + CommandProcessor.currentCommand.getSlop())
																	///////////////////////////
					CommandProcessor.currentCommand.execute(thenDoThis, options);	//				EXECUTE
																	///////////////////////////
					//debug("executed")
					lastExecutableLineWasExecutedP = true
				}else{
					logCoScripterEvent("Skipped Pause command while Stepping " + (procedureInteractor.getCurrentLineNumber()+1) )
					thenDoThis();
				}
				
			}
			else {thenDoThis();}	// if we didn't execute, call thenDoThis to continue processing
		}catch(e){
			
			dump("in executeStep currentCommand.execute threw exception : "+ e.toSource() + '\n');
			debug("in executeStep currentCommand.execute threw exception : "+ e.toSource() + '\n');
			if (e == "target value not found")
						thenDoThis();
		}
	},
	
	
	advanceStep : function(skipNestedBlockP) {
		
		// find the first command that is not a comment (or the end of script occurs)
		var newCurrentLine = null ;
		var currentIndent = procedureInteractor.getCurrentLineIndent();
		// TL: this wasn't set before, but it's referenced below
		var currentLine = procedureInteractor.getCurrentLine();
		while (procedureInteractor.hasCurrentLineNext()!=null && newCurrentLine==null) {
			// Advance step in the procedure interactor, if available
			procedureInteractor.moveCurrentLineNext();
			// If we're skipping a nested block and this line is indented
			// more than the starting line, then keep going
			if (skipNestedBlockP && procedureInteractor.getCurrentLineIndent() > currentIndent) {
				continue;
			}
			if(!isLineComment(procedureInteractor.getCurrentLine())){
				newCurrentLine = procedureInteractor.getCurrentLine()
			}
			else logCoScripterEvent("Skipped over a Comment at step " + (procedureInteractor.getCurrentLineNumber()+1) )
		}
		// did I really advance a step?
		if(newCurrentLine == null || currentLine == newCurrentLine ){
			if (lastExecutableLineWasExecutedP) {
				logCoScripterEvent("final line was executed")
				lastExecutableLineWasExecutedP = false
				// fire "finish execute" event
				CommandProcessor.notifyEventListeners('doneexecuting');
			}
			// -- includes Vegemite code -- 
			if (Vegemite.doNextIterationP() && this.run) {
				// do another iteration
				CommandProcessor.previewCurrentStep(true);
				CommandProcessor.notifyEventListeners('advancestep');
				return true;
			}
			return false;
		}

		currentLine = newCurrentLine
		// Preview current step
		CommandProcessor.previewCurrentStep(false);
		CommandProcessor.notifyEventListeners('advancestep');
		return true;
	},

	moveToFirstStep : function() {
		// Move cursor to first line
		procedureInteractor.moveCursorTextHome();
		// Skip comment lines
		var cln = procedureInteractor.getCurrentLineNumber();
		for ( var i = cln; i < procedureInteractor.getLineCount(); i++ ) {
			var line = procedureInteractor.getLineWithNumber(i);
			if (isLineComment(line)) procedureInteractor.moveCurrentLineNext(); 
			else break;
		}  
		// Make first line visible
		makeFirstLineVisible();

		// Preview this step
		CommandProcessor.previewCurrentStep(false);
	},
	
	massageSlopForInterpreter : function(slop) {
		// Remove extra white spaces
		slop = CommandProcessor.components.utils().trim(slop);
		// Replace left and right quotation marks with double quotes
		slop = slop.replace(new RegExp(unescape("[%u201C%u201D]"), "g"), '"');
		// Replace \u2013 with -
		// JM: I commented the following line to solve the Bug "Fariz" mentioned. now it does not convert \x13 to -
		//slop = slop.replace(new RegExp("\u2013", "g"), "-");
		// Replace \n with RETURN
		slop = slop.replace(new RegExp("\\\\n", "g"), "\n");
		return slop;
	},
	
	setCurrentLineExecuting : function() {
		// Mark current line executing
		var currentLine = procedureInteractor.getCurrentLine();
		setLineExecuting(currentLine);
	},
	
	resetCurrentLineExecuting : function() {
		// Mark current line not executing
		var currentLine = procedureInteractor.getCurrentLine();
		resetLineExecuting(currentLine);
	},

	clearAutowaitTimeout : function() {
		if (this.autowaitTimeout != null) {
			clearTimeout(this.autowaitTimeout);
			this.autowaitTimeout = null;
		}
	}
}	// end of CommandProcessor

//
var debugCallbacks = false ;
function debugCallback(e){
	dump('advancestep callback called topic:' + e.topic + ' currentCommand: ' + e.currentCommand + '\n');
};
if(debugCallbacks){
	CommandProcessor.addEventListener('advancestep',debugCallback);
	CommandProcessor.addEventListener('previewcurrentstep',debugCallback);
}
//


///////////////////////////
//		executeModalCommands
///////////////////////////// 
// Called by yule when a dialog is created, so that we can continue executing commands in the dialog
function executeModalCommands(event){
	try {
		if (recording) return;
		//debug("begin executeModalCommands")
		//if (recordDialogsP()) CommandProcessor.executeDialogCommand()
		CommandProcessor.executeDialogCommand()
		//debug("end executeModalCommands")
		return;
	} catch(e) {
		dump("executeModalCommands failed")
	}
}

function ExecutionException(string){
	CommandProcessor.string = string ;
	return this ;
}

function determineInterpretationStatus(command) {
	var status = null;
	
	try {
		if (command === null) {
			status = EXECUTION_PARSE_ERROR;
		}
		else 
			if (command.getAction() == getParserComponent().ParserConstants.YOU) {
				status = EXECUTION_REQUIRES_USER_ACTION;
			}
			else 
				if (command.canExecute() == false) {
					if (command.hasNeededVars() == false) {
						status = EXECUTION_REQUIRES_USER_DATA;
					}
					else 
						if (command.getAction() == getCommands().ACTIONS.UNEXECUTABLE) {
							status = EXECUTION_PARSE_ERROR;
						}
						else 
							if (command.findTarget() == null) {
								if (command.getAction() == getParserComponent().ParserConstants.IF) {
									status = EXECUTION_SUCCEEDED;
								}
								else {
									//if (command.getErrorMsg() != null && command.getErrorMsg() == getCommands().ERRORMSG.TARGET_VAL_NOTFOUND) 
									status = EXECUTION_TARGET_NOT_FOUND;
								}
							}
							else {
								status = EXECUTION_FAILED;
							}
				}
				else {
					status = EXECUTION_SUCCEEDED;
				}
	} catch(e) {
		if (e == "target value not found") {
			status = EXECUTION_TARGET_VALUE_NOT_FOUND;			
		}	
	}	
	return status;
}

function displayStatus(status,command) {
	var sidebarBundle = document.getElementById("bundle-coscripter-sidebar")
	var ready = sidebarBundle.getString("status.ready")
	var doYourself = sidebarBundle.getString("status.doYourself")
	var noVariable = sidebarBundle.getString("status.noVariable")
	var addIt = sidebarBundle.getString("status.addIt")
	var done = sidebarBundle.getString("status.done")
	var noInterpretations = sidebarBundle.getString("status.noInterpretations")
	var cantDoCommand1 = sidebarBundle.getString("status.cantDoCommand1")
	var cantDoCommand2 = sidebarBundle.getString("status.cantDoCommand2")
	var dontUnderstand = sidebarBundle.getString("status.dontUnderstand")
	var clickStepOrRun = sidebarBundle.getString("clickStepOrRun");

	var msg = null;
	var c = "";
	if ( status == EXECUTION_REQUIRES_USER_ACTION ) {
		msg = doYourself; 
		c = "error";
	}
	else if ( status == EXECUTION_REQUIRES_USER_DATA ) {
		msg = noVariable + " '"  + command.getVarNames() + "' " + addIt;
		c = "error";
	}
	else if ( status == EXECUTION_COMPLETED ) {
		msg = done;
		c = "information";
	}
	else if ( status == EXECUTION_FAILED ) {
		msg = noInterpretations;
		c = "error";
	}
	else if ( status == EXECUTION_TARGET_NOT_FOUND ) {
		msg = cantDoCommand1 + " " + command.targetSpec.toSlop() + " " + cantDoCommand2;
		c = "error";
	}
	else if ( status == EXECUTION_TARGET_VALUE_NOT_FOUND ) {
		msg = cantDoCommand1 + " " + command.string + " " + cantDoCommand2 + " In " + command.targetSpec.toSlop();
		c = "error";
	}
	else if( status == EXECUTION_PARSE_ERROR){
		msg = dontUnderstand;
		c = "error"; 
	}
	else if (status == EXECUTION_SUCCEEDED){
		msg = clickStepOrRun;
		c = "";
	}

	if (msg != null) {
		setStatus(msg, c);
	}
}

function setStatus(msg, c) {
	var style = "";

	if ( c == "error" ) 
		style = "color : red; font-weight : bold;";
	else if ( c == "information" ) 
		style = "color : blue;";
	else
		style = "color : black;";

	CommandProcessor.components.utils().setStatus(window, msg, style);
}

function getParserComponent(){
    return coscripter.components.parser();
}

// get access to the coscripter-command component which
// contains type information for the various command objects
function getCommands(){
    return coscripter.components.commands();    
}
