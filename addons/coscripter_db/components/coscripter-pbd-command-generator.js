
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
//dump('Parsing coscripter-pbd-command-generator.js component\n');
const CC = Components.classes, CI = Components.interfaces, CIS = CI.nsISupports
var consoleService = null
function debug(msg) {
	//return ;	//comment out to turn on debugging
	if(consoleService == null){
		consoleService = CC['@mozilla.org/consoleservice;1'].getService(CI.nsIConsoleService)
	}
	consoleService.logStringMessage(msg)
}

///////////////////////////////////////
// We are using a pipeline architecture for the event
// listening framework.  An approximate diagram is shown
// below:
//
//  --------    ---------------    ---------------
//  |      |    | coscripter- |    | coscripter- |
//  | YULE |--->| pbd-command-|--->|  context    |
//  |      |--->|   generator |    |             |
//  --------    ---------------    ---------------
//
// This module, coscripter-pbd-command-generator, takes events
// generated from the YULE framework and converts them into
// CoScripter command objects.
//
// These command objects are defined in coscripter-command.js.
//
// For PbD, there is only going to be one Listener to receive CoScripter command objects from the CoScripterPbDCommandGenerator,
// That Listener is only going to listen while recording, or executing a step, (I'll later do something special about auto-advance),
// so unlike the non-pbd approach, I don't need to attach a listener when New is clicked or a script is loaded into the sidebar.
// (which is when registerToReceiveRecordedCommands is called)
///////////////////////////////////////
//
//	Listener Management Methods
//		_notifyListeners
//		handleYuleUIEvent
//			_onClick
//			_onChange
//			_onFocus
//
///////////////////////////////////////

// XPCOM Parameters for this object
const CLASS_ID = Components.ID("698f03b1-215c-4fb8-855c-3ac54edf025e");
const CLASS_NAME = "CoScripter PbD Command Generator";
const CONTRACT_ID = "@coscripter.ibm.com/coscripter-pbd-command-generator;1";

// Command Generator
function CoScripterPbDCommandGenerator() {

	//////////////////////////////////////////
	// Define Member Variables Here
	//////////////////////////////////////////

    // Component registry
    this.components = Components.classes["@coscripter.ibm.com/registry;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;

	// a list of the listeners to this component
	this._listeners = []; 
	
	// the callback registered with YULE
	this._yuleUICallbackMethod = null;
	
	// a flag that controls whether we are notifying our
	// listeners when we receive events
	this._notifying = true;

	// kludge to let receiveGeneratedCommandForPbD know which line in the CoScripter sidebar was executed to create this event
	this._scriptLineNumber = -1;
	
	// variables for tracking the previous value of a text box
	// before it is changed
	this._currentTextbox = null;
	this._textboxTextBefore = "";

	// a flag to make sure we don't initialize more than once
	//this._initialized = false;

	// initialize the object	
	//this._initialize();

    this.wrappedJSObject = this;
    
    return this;
}


CoScripterPbDCommandGenerator.prototype = {

    // Required XPCOM method
    QueryInterface: function(aIID)
    {
    	if (!aIID.equals(Components.interfaces.nsISupports))
        	throw Components.results.NS_ERROR_NO_INTERFACE;
    	return this;
    },
  
	///////////////////////////////////////////////////////////////////
	// Constants
	///////////////////////////////////////////////////////////////////
  

	///////////////////////////////////////////////////////////////////
	// Member Methods
	///////////////////////////////////////////////////////////////////
  	_initialize : function()
  	{
  	},
  	
  	subscribeToYuleUIEvents : function()
  	{
  		// do nothing if we are already subscribed
  		if (this._yuleUICallbackMethod == null)
  		{  	
	  		var commandGenerator = this;
	  		this._yuleUICallbackMethod = function(event)
	  		{
	  			commandGenerator.handleYuleUIEvent.apply(commandGenerator, [event]);
	  		}
	  		
	  		// TODO: Add any additional events that are needed
	  		// TODO: Make sure this line matches the line in unsubscribe
			this.getYULE().subscribe(this._yuleUICallbackMethod, "click", "change", "LocationBarChangeEvent");
	  	}
  	},
  	
  	unSubscribeFromYuleUIEvents : function()
  	{
  		// do nothing if we are not subscribed
  		if (this._yuleUICallbackMethod != null)
  		{  			
  			// TODO: Make sure this line matches the one above in subscribe
	  		this.getYULE().unsubscribe(this._yuleUICallbackMethod, "click", "change", "LocationBarChangeEvent");
  		}
  	},


	////////////////////////////////////////////////////////////////////////////////
	//	Listener Management Methods
	
	startNotification : function()
	{
		this._notifying = true;
	},

	stopNotification : function()
	{
		this._notifying = false;
	},
	
	setScriptLineNumber : function(lineNumber)
	{
		this._scriptLineNumber = lineNumber;
	},

	getScriptLineNumber : function()
	{
		var lineNumber = this._scriptLineNumber
		return lineNumber
	},
	
	addListener : function(listener)
	{
		this._listeners.push(listener);
		// we have a listener, so make sure we are subscribed to Yule
		this.subscribeToYuleUIEvents()
	},
	
	removeListener : function(listener)
	{
		var idx = this._listeners.indexOf(listener);
		if (idx >= 0)
		{
			return this._listeners.splice(idx, 1);
		}
		
		// unsubscribe from yule if there are no more listeners
		if (this._listeners.length == 0) this.unSubscribeFromYuleUIEvents()
		return null;
	},
	
	_clearAllListeners : function()
	{
		this._listeners = [];
	},

	//		_notifyListeners
	_notifyListeners : function(commandObj)
	{
		for(var i = 0; i < this._listeners.length; i++)
		{
			(this._listeners[i])(commandObj);
		}
	},


	////////////////////////////////////////////////////////////////////////////////
	// Handles events as they arrive from YULE, creates corresponding command
	// objects, and notifies any listeners with these objects as they are 
	// created
  	
	//		handleYuleUIEvent
  	handleYuleUIEvent : function(theEvent)
  	{
  		if (!this._notifying) return;	// don't bother processing if we aren't notifying anyone

		var commandObj = null;
		var commands = this.getCommands();

		// get labels
		// get ordinals
		//debug("pbd-command-generator: handleYuleUIEvent: event type is:" + theEvent.type)
		switch(theEvent.type)
		{
			case "click":
				commandObj = this._onClick(theEvent);
				break;
				
			case "change":
				commandObj = this._onChange(theEvent);
				break;
				
			case "focus":
				// this doesn't currently return a command object
				// (just saves data for a later change event)
				this._onFocus(theEvent);				
				break;
				
			case "LocationBarChangeEvent":
				commandObj = this._onGoto(theEvent);
				break;	
			
			default:
				// do nothing for now
				break;  		
		}
		
		// non-pbd command-generator version does post-processing here to deal with non-unique descriptors
		// notify our listeners if we have a command object to give them
		// for pbd, the listener will be receiveGeneratedCommandForPbD in context.js
		if (commandObj != null)
		{
			commandObj.editorLineNumber = this.getScriptLineNumber()
			this._notifyListeners(commandObj);
		}
  	},

	_onGoto : function(event)
	{
		var commands = this.getCommands();

		return commands.createGotoFromParams(event, event.getURL());		
	},

	//			_onClick
	_onClick : function(event)
	{
		var u = this.components.utils();
		var labeler = this.components.labeler();
		var commands = this.components.commands();

		var commandObj = null;
		var targetLabel = ""
		var customTargetSpec = null

		// Core code. Get target, type and label
		// For dojo, getTargetAndType returns [target, WEBTYPES.DOJOWIDGET, dojoWidgetTargetSpec]
		// The targetSpec includes the label and other information
		// xul also returns a targetSpec as the third argument, since it immediately determines the label and action
		//debug("onClick topWindow has title: " + u.getTopWindow().document.title)
		var targetAndType = labeler.getTargetAndType(event.target, event)	
		if (!targetAndType) return null;
		// NOTE: getTargetAndType may return a new target that is one of
		// target's ancestors,
		// for instance when target is a child of a BUTTON, INPUT, or OPTION
		// node
		var target = targetAndType[0]
		event.target = target	// !!WARNING!! (AC) Make sure no downstream code
			// relies on having the originalTarget stored in event.
			// I needed to do this because the post-processing code in handleEvent uses
			// event.target to check for duplicates.
		var targetType = targetAndType[1]
		if (targetAndType[2]) {
            customTargetSpec = targetAndType[2]
			var customTargetType = customTargetSpec.targetType
			/*
            if (targetType == "dojowidget" && customTargetSpec.action == "enter") {
				// Inline editor dijits require you to click in the widget to create the INPUT node
				targetType = customTargetType
			}
			*/
            if (targetType == "dojowidget" && customTargetType && !(u.inListP(customTargetType, ["item", "section", "tab", "checkbox", "menuitem", "color", "textbox"]) || customTargetSpec.widgetType == "ComboButton")) {
            //if (dojoTargetType && !u.inListP(dojoTargetType, ["item", "section", "tab", "checkbox"])) {
                targetType = customTargetType
            }
            if (targetType == "xul" && customTargetType && !(u.inListP(customTargetType, ["aspecialtype"]))) {
            //if (dojoTargetType && !u.inListP(dojoTargetType, ["item", "section", "tab", "checkbox"])) {
                targetType = customTargetType
            }
			targetLabel = customTargetSpec.targetLabel


			/*
			 * if (!dojoWidgetTargetSpec.targetType ||
			 * dojoWidgetTargetSpec.targetType == "textbox"){ //Lots of clicks
			 * in widgets are low-level and should be ignored
			 * dojoWidgetTargetSpec.targetType = "ignore" }
			 */
			
		}
		else targetLabel = labeler.getLabel(target, targetType)	// getLabel should be 
			// changed to take advantage of targetType. We seem to be redoing that work. 
			// (e.g. for a node with an HTML parent)

		switch(targetType)
		{
			case labeler.WEBTYPES.NONUIELEMENT:
				//commandObj = commands.createClickFromParams(event, targetLabel, targetType, event.controlKeyDown);
				break;
				
			case labeler.WEBTYPES.TEXTBOX:
			case labeler.WEBTYPES.OTHER:
				// do nothing...a null command object will be returned
				break;

			case labeler.WEBTYPES.CHECKBOX:
			case labeler.WEBTYPES.RADIOBUTTON:
				// create a turn command object
				commandObj = commands.createTurnFromParams(event, targetLabel, targetType, target.checked);
				break;

			case labeler.WEBTYPES.LISTBOX:
				// create a select command object
				// NOTE:JWN: These changes are picked up by the change event,
				// which works both for keyboard and mouse changes of a listbox.
				// For now, I'm commenting out this code because it seems rather
				// unnecessary.
				/*
				 * if (event.target.nodeName == "OPTION") { var textToSelect =
				 * u.trim(event.target.textContent); commandObj =
				 * commands.createSelectFromParams(event, targetLabel,
				 * targetType, textToSelect); }
				 */
				break;
				
			case labeler.WEBTYPES.DOJOWIDGET:
				// we've already determined the targetSpec, so pass it instead of targetLabel
				commandObj = commands.createClickFromParams(event, customTargetSpec, targetType, target.checked);
				break;

			default:
				// this is a normal click event 
				commandObj = commands.createClickFromParams(event, targetLabel, targetType, event.controlKeyDown);
				break;
		}
		
		return commandObj;
	},

	//			_onChange
	_onChange : function(event)
	{
		var u = this.components.utils();
		var labeler = this.components.labeler();
		var commands = this.components.commands();

		var commandObj = null;

		var target = event.target;
		var targetArea = "content";
		var isPassword = false;
		var textToEnter = "";

        var targetAndType = labeler.getTargetAndType(target);
		if (targetAndType){
			var targetSpec = targetAndType[2];
			if (targetSpec && targetSpec.widgetClass && targetSpec.widgetClass == "artifactNode") {
				commandObj = commands.createEnterFromParams(event, targetSpec, labeler.WEBTYPES.DOJOWIDGET, targetSpec.textToEnter, isPassword);
				return commandObj
			}
    	    // check if this is a dojo widget that will be handled by dojo's onChange method (_onCoScripterDojoOnChange)
			if (targetSpec && targetSpec.widgetClass && targetSpec.widgetClass != "artifactNode") return null; 
			// if (targetSpec.widgetClass == "dijit.form.ToggleButton")
		}
        
		// these parameters are not currently saved in the command object
		var textBefore = ""
		var textAfter = ""

		// now make sure this is a textbox type thing,
		// and create some appropriate slop
		var ancestor = u.getAncestorNamed(target, "INPUT")
		if (ancestor) {
			textToEnter = ancestor.value
			var type = ancestor.type || ancestor.getAttribute("type")
			if (type) type = type.toLowerCase()
			
			switch(type)
			{
				case "password":
					isPassword = true;
					// NOTE:JWN: intentionally falling through
					
				case "text":
				case "file":
				case "image":
					var targetLabel = labeler.getLabel(target)
					var targetType = labeler.WEBTYPES.TEXTBOX
					textToEnter = target.value
					textBefore = this._textboxTextBefore
					textAfter = target.value
					this._currentTextbox = ""

					// create an enter command object
					commandObj = commands.createEnterFromParams(event, targetLabel, targetType, textToEnter, isPassword);
					break;
				
				default:
					// don't do anything in any other cases
					return null;
			}
			
		}
		else if (u.stringContains(target.nodeName, "text")) {
			targetLabel = labeler.getLabel(target)
			targetType = labeler.WEBTYPES.TEXTBOX
			textToEnter = target.value
			textBefore = this._textboxTextBefore
			textAfter = target.value
			this._currentTextbox = ""

			// create an enter command object
			commandObj = commands.createEnterFromParams(event, targetLabel, targetType, textToEnter, isPassword);
		}
		else if (u.stringContains(target.nodeName, "SELECT")) {
			targetLabel = labeler.getLabel(target)
			targetType = labeler.WEBTYPES.LISTBOX
			var itemTextToSelect = target[target.selectedIndex].textContent
			
			// create a select command object
			commandObj = commands.createSelectFromParams(event, targetLabel, targetType, itemTextToSelect);
		}
				
		return commandObj;
	},
	
	//			_onFocus
	_onFocus : function(event)
	{
		var u = this.getUtils();
		var labeler = this.getLabeler();
		var target = event.target;
		var targetType = "";
		
		var targetAndType = labeler.getTargetAndType(target);
		if (targetAndType) {
			// called on elements with tags of INPUT and html:textarea; type is text and textarea
			targetType = targetAndType[1];
			if (targetType == labeler.WEBTYPES.TEXTBOX){
				this._currentTextbox = targetAndType[0];
				this._textboxTextBefore = target.value;
			}
		}
	},
  	
  	
	////////////////////////////////////////////////////////////////////////////////
	// Methods to grab references to other XPCOM components
	
	g_yule : null,
	// Get the YULE Component
	getYULE : function() 
	{
	    // Ensure a single instance
		if (this.g_yule == null) {
			this.g_yule = Components.classes["@coscripter.ibm.com/yule;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
		}
		return this.g_yule;
	},
	
	g_command : null,
	// Get the CoScripter Command Component
	getCommands: function() 
	{
	    // Ensure a single instance
		if (this.g_command == null) {
			this.g_command = Components.classes["@coscripter.ibm.com/coscripter-command;1"].getService().wrappedJSObject;
		}
		return this.g_command;
	},  	
	
	// get access to the coscripter-labeler component for findTargetElement and getLabel
	g_labeler : null,
	getLabeler : function()
	{
	    // Ensure a single instance
		if (this.g_labeler == null) {
			this.g_labeler = Components.classes["@coscripter.ibm.com/coscripter-labeler/;1"].getService().wrappedJSObject;
		}
		return this.g_labeler;
	},	

	// get access to the coscripter-labeler component for findTargetElement and getLabel
	g_utils : null,
	getUtils : function()
	{
	    // Ensure a single instance
		if (this.g_utils == null) {
			this.g_utils = Components.classes["@coscripter.ibm.com/coscripter-utils/;1"].getService().wrappedJSObject;
		}
		return this.g_utils;
	},	
}


//=================================================
// Note: You probably don't want to edit anything
// below this unless you know what you're doing.
//
// Factory
var CoScripterPbDCommandGeneratorFactory = {
  singleton : null,
  createInstance: function (aOuter, aIID)
  {
    if (aOuter != null)
      throw Components.results.NS_ERROR_NO_AGGREGATION;
    if (this.singleton == null)
      this.singleton = new CoScripterPbDCommandGenerator();
    return this.singleton.QueryInterface(aIID);
  }
};

// Module
var CoScripterPbDCommandGeneratorModule = {
  registerSelf: function(aCompMgr, aFileSpec, aLocation, aType)
  {
    aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    aCompMgr.registerFactoryLocation(CLASS_ID, CLASS_NAME, CONTRACT_ID, aFileSpec, aLocation, aType);
  },

  unregisterSelf: function(aCompMgr, aLocation, aType)
  {
    aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    aCompMgr.unregisterFactoryLocation(CLASS_ID, aLocation);        
  },
  
  getClassObject: function(aCompMgr, aCID, aIID)
  {
    if (!aIID.equals(Components.interfaces.nsIFactory))
      throw Components.results.NS_ERROR_NOT_IMPLEMENTED;

    if (aCID.equals(CLASS_ID))
      return CoScripterPbDCommandGeneratorFactory;

    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  canUnload: function(aCompMgr) { return true; }
};

//module initialization
function NSGetModule(aCompMgr, aFileSpec) { return CoScripterPbDCommandGeneratorModule; }

//dump('Done Parsing coscripter-pbd-command-generator.js component\n');
