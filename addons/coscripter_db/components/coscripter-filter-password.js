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

This Program also contains a code package known as developer.mozilla.org
sample code that is licensed pursuant to the license listed below. 
developer.mozilla.org sample code 
The program known as developer.mozilla.org sample code is licensed under
the terms below. Those terms are reproduced below for your reference.

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

//======================================================
// XPCOM registration constants Section
const nsISupports = Components.interfaces.nsISupports;

// You can change these if you like - 
const CLASS_ID = Components.ID("d2cb269b-54b5-4854-b946-9f46c9a67c3d");
const CLASS_NAME = "CoScripter Password Filter";
const CONTRACT_ID = "@coscripter.ibm.com/filter-password;1";

//======================================================
// Debug Section

var consoleService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);

//var doConsoleDebugging = false ;
var Preferences = {
	DO_CONSOLE_DEBUGGING		: false,
	DO_DUMP_DEBUGGING 			: false
}

function debug(msg){
	if(Preferences.DO_CONSOLE_DEBUGGING){
		consoleService.logStringMessage("coscripter-filter-password.js: " + msg );
	}else if(Preferences.DO_DUMP_DEBUGGING){
		dump("coscripter-filter-password.js: " + msg + "\n");
	}
}

debug('parsing coscripter-filter-password.js');

function getFilterPassword(){
	return Components.classes["@coscripter.ibm.com/filter-password;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
}


function FilterPassword(){
    // Component registry
    this.components = Components.classes["@coscripter.ibm.com/registry;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;

	// a list of the listeners to this component
	this._listeners = []; 

	var __this = this;
	this.handleCommand = function(cmd) {
		__this._handleCommand.apply(__this, [cmd]);
	};
	
	this.wrappedJSObject=this;
    return this;
}

FilterPassword.prototype ={
	QueryInterface : function(aIID) {
		// add any other interfaces you support here
		if (!aIID.equals(nsISupports))
			throw Components.results.NS_ERROR_NO_INTERFACE;
		return this;
	},

	// subscribe to receive certain types of events from YULE
  	_subscribe : function()
  	{
		this.components.commandGenerator().addListener(this.handleCommand);
  	},
  	
  	_unsubscribe : function()
  	{
		this.components.commandGenerator().removeListener(this.handleCommand);
  	},


	/**
	 * Add a listener to the events coming from this stream
	 */
	addListener : function(listener) {
		if (!this.components.utils().inArrayP(listener, this._listeners)) 
		{
			var oldLength = this._listeners.length;
			this._listeners.push(listener);

			// subscribe if we didn't previously have any listeners
			if (oldLength == 0)
			{
				this._subscribe();
			}
		}
	},
	
	/**
	 * Remove a listener
	 */
	removeListener : function(listener) {
		var foundListener = null;
		var idx = this._listeners.indexOf(listener);
		if (idx >= 0)
		{
			foundListener = this._listeners.splice(idx, 1);

			// unsubscribe if we have no listeners
			if (this._listeners.length == 0)
			{
				this._unsubscribe();
			}
		}
		
		return foundListener;
	},

	/**
	 * Handle incoming command
	 */
	_handleCommand : function(cmd) {
		// Check if it's an Enter command
		if (cmd.getAction() == this.components.commands().ACTIONS.ENTER) {
			// Check if it's a password field
			if (cmd.isPassword) {
				// Check if it's a literal
				if (!cmd.string.getNeedVar()) {
					// Munge the password literal
					cmd.string.literal = "****";
					// Convert it to a database reference
					cmd.string.setNeedVar(true);

					// TL: set a flag on the command object telling it to
					// use the special password syntax instead (HACK)
					cmd.hidePasswordValue = true;
				}
			}
		}

		// Now pass it on to the listeners
		this._notifyListeners(cmd);
	},

	_notifyListeners : function(commandObj) {
		for(var i = 0; i < this._listeners.length; i++)
		{
			(this._listeners[i])(commandObj);
		}
	}

}
//************************************************************************
//********************* XPCOM MODULE REGISTRATION*************************
//************************************************************************

//=================================================
// Note: You probably don't want to edit anything
// below this unless you know what you're doing.
//
// Factory
var FilterPasswordFactory = {
	singleton : null,
	createInstance: function (outer, iid)
	{
		if (outer !== null)
			throw Components.results.NS_ERROR_NO_AGGREGATION;
		if (this.singleton === null)
			this.singleton = new FilterPassword();
		return this.singleton.QueryInterface(iid);
	}
};


// Module
var FilterPasswordModule = {
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
			return FilterPasswordFactory;
		throw Components.results.NS_ERROR_NO_INTERFACE;
	},

	canUnload: function(aCompMgr) { return true; }
};

//module initialization
function NSGetModule(aCompMgr, aFileSpec) { return FilterPasswordModule; }
debug('done parsing coscripter-filter-password.js');

