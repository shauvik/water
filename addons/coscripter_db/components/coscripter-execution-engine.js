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

//======================================================
// XPCOM registration constants Section
const nsISupports = Components.interfaces.nsISupports;

// You can change these if you like - 
const CLASS_ID = Components.ID("eaef43bc-e7a7-44fd-8a86-f9b55d3e282a");
const CLASS_NAME = "CoScripter Execution Engine";
const CONTRACT_ID = "@coscripter.ibm.com/execution-engine;1";

// Configuration
// How long to wait for a widget to appear before we conclude that it will
// never appear
const AUTOWAIT_PERIOD = 30;

//======================================================
// Debug Section

var consoleService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);

//var doConsoleDebugging = false ;
var Preferences = {
	DO_CONSOLE_DEBUGGING		: true,
	DO_DUMP_DEBUGGING 			: false
};

function debug(msg){
	if(Preferences.DO_CONSOLE_DEBUGGING){
		consoleService.logStringMessage("coscripter-execution-engine.js: " + msg );
	}else if(Preferences.DO_DUMP_DEBUGGING){
		dump("coscripter-execution-engine.js: " + msg + "\n");
	}
}

//debug('parsing coscripter-execution-engine.js');

//////////////////////////////////////////////////////////////////////
// Execution engine code

function getExecutionEngine(){
	return Components.classes["@coscripter.ibm.com/execution-engine;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
}

function ExecutionEngine() {
    // Component registry
    this.components = Components.classes["@coscripter.ibm.com/registry;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;

	// State variables
	this.pc = 0;

	// Possible events you can listen for
	this.EVENTS = {
		STEP_STARTING : 'step_starting',
		STEP_FINISHED : 'step_finished',
		ERROR : 'error',
		CMDS_FINISHED : 'cmds_finished',
		YOU_COMMAND : 'you_command',
		CLIP_COMMAND : 'clip_command'
	};
	
	// Callback map
	this._cb = new Array();

	this.wrappedJSObject=this;
	return this;
}

// Execution Environment API, take II
// initialize(cmd_list, cbmap)
// - cmdExecEnv is the CommandExecutionEnvironment in which to run cmds
// - cmd_list is an Array of Command instances
// - cbmap is a hash of callbacks that can be called at different points
//   during execution:
//	   - step_starting(stepnumber, cmd)
//	       this command has been parsed and is about to start executing
//     - step_finished(stepnumber, cmd)
//         this step in this script completed execution
//     - error(stepnumber, cmd, error_details)
//         there was an error on the specified step; error_details is an
//         object that provides more info
//     - cmds_finished()
//		   all commands in the list have finished executing
ExecutionEngine.prototype ={
	QueryInterface: function(aIID){
		// add any other interfaces you support here
		if (!aIID.equals(nsISupports))
			throw Components.results.NS_ERROR_NO_INTERFACE;
		return this;
	},

	/**
	 * Initialize the Execution Engine with a list of scripts to run, and a
	 * personal database to be used for filling in variables
	 */
	initialize : function(cmd_list, db) {
		this.cmds = cmd_list;
		if (db) {
			this.db = db;
		} else {
			this.db = null;
		}

		// Initialize state variables
		this.current_step = 0;
		this.autoWait = null;
		this.step = false ;
	},

	/**
	 * Register a listener on the specified event.  The list of events is
	 * specified by ExecutionEngine.EVENTS
	 */
	setListener : function(eventName, cb) {
		this._cb[eventName] = cb;
	},

	/**
	 * Remove the listener on the specified event.  If there was no
	 * listener for that event, nothing is done.
	 */
	removeListener : function(eventName) {
		this._cb[eventname] = null;
	},

	/**
	 * Run only the next step in this execution engine
	 */
	step : function(){
		this.step = true ;
		this._run();
	},
	
	/**
	 * Start running all cmds in this execution engine
	 */
	run : function(){
		this.step = false ;
		this._run();
	},
	
	_run : function() {
		// Get the next step to be executed
		var cmd = this.cmds[this.current_step];
		this.cmd = cmd;
		this.next_step = this.current_step + 1;

		if (this.db) {
			this.cmd.fillInVars(this.db);
		}

		// Callback before a step starts executing
		this._callback(this.EVENTS.STEP_STARTING, [this.current_step, cmd]);

		try {
			// Autowait implemented here
			if (cmd.autoWait() === true) {
				if (this._autowait(cmd)) {
					return;
				}
			}
			// If we reach this point, we have found the target!
			this.autowait = null;
			var _this2 = this;

			var cmdType = cmd.getAction();
			switch (cmdType) {
				case this.components.commands().ACTIONS.YOU:
					if (this._cb[this.EVENTS.YOU_COMMAND]) {
						// If there is a you_command callback, wait for it to
						// complete before continuing
						this._callback(this.EVENTS.YOU_COMMAND, [cmd, function() {
								_this2._commandExecutedCallback.apply(_this2, []);
							}]);
						return;
					}
					break;
				case this.components.commands().ACTIONS.IF:
					// Evaluate the IF conditional
					var result = cmd.evaluate();
					if (!result) {
						// override next_step to skip over the nested block
						var current_indent = cmd.getIndent();
						for (this.next_step=this.current_step+1;
							this.next_step<this.cmds.length; this.next_step++) {
							if (this.cmds[this.next_step].getIndent() <=
								current_indent) {
								break;
							}
						}
					}
					// continue on to next step
					this._commandExecutedCallback();
					break;
				case this.components.commands().ACTIONS.CLIP:
					if (this._cb[this.EVENTS.CLIP_COMMAND]) {
						// Evaluate the clip command and call the callback
						var result = cmd.evaluate();
						this._callback(this.EVENTS.CLIP_COMMAND,
							[cmd, result]);
					}
					// Deliberately fall through to the default
				default:
					// Normal command; execute it normally					
					cmd.execute(function () {
							_this2._commandExecutedCallback.apply(_this2, []);
						},
						this._error, // error callback
						{ isRunning: true, win: cmd.execEnv.getWindow()});
					break;
			} // end command interpretation switch
		} catch (e) {
			dump("Execution error: " + e.toSource() + "/" + e.toString() + '\n');
			this._callback(this.EVENTS.ERROR, [this.current_step, cmd, e]);
			return;
		}
	},

	/**
	 * Wait for the target specified in the command to appear on the page.
	 * Return true if we are waiting (i.e. the target is not there), or
	 * false if the target has been found.
	 */
	_autowait : function(cmd) {
		dump('Looking for target on page... ');
		try {
			if (cmd.findTarget() === null) {
				dump('not found :(\n');
				var currentContentWindow = this.components.utils().getCurrentContentWindow(cmd.execEnv.getWindow());
				dump('Looked in: ' + currentContentWindow.document.location.href + '\n');
				//dump(currentContentWindow.document.documentElement.innerHTML + '\n');
				
				if (this.autowait === null) {
					// first time autowaiting
					this.autowait = AUTOWAIT_PERIOD; // wait autowait+1 seconds
				}
				else 
					if (this.autowait === 0) {
						// We waited, but it never showed up
						this.autowait = null;
						// Invoke the error callback to notify interested parties
						// that this step failed to execute				
						
						var cmdType = cmd.getAction();
						if (cmdType == this.components.commands().ACTIONS.ASSERT) {
							if (!cmd.canExecute()) 
								this._callback(this.EVENTS.ERROR, [this.current_step, cmd, "Assertion Failed: " + cmd.toSlop()]);
							else 
								return false;
						}
						else {
							this._callback(this.EVENTS.ERROR, [this.current_step, cmd, "target not found: " + cmd.targetSpec.toSlop()]);
						}
						return true;
					}
					else {
						// We're in the middle of an autowait
						// and we still haven't found it
						this.autowait = this.autowait - 1;
					}
				
				// Try again in a second
				var _this = this;
				cmd.execEnv.getWindow().setTimeout(function(){
					_this.run.apply(_this, []);
				}, 1000);
				return true;
			}
			else {
				dump('found!\n');
				return false;
			}
		} catch (e) {
			
		}	
	},

	/**
	 * Callback on error during command execution.  Pass it on to the error
	 * callback we were initialized with.
	 */
	_error : function(e) {
		dump('uncaught error in execution: ' + e + '\n');
		this._callback(this.EVENTS.ERROR, [this.current_step, this.cmd, e]);
	},

	/**
	 * Call the named callback if it has been specified during
	 * initialization.  If not, do nothing.
	 */
	_callback : function(name, args) {
		if (this._cb[name]) {
			this._cb[name].apply(null, args);
		}
	},

	/**
	 * Callback that is called when a command finishes executing and it's
	 * time to move on to the next one.
	 */
	_commandExecutedCallback : function() {
		this._callback(this.EVENTS.STEP_FINISHED, [this.current_step, this.cmd]);

		// Increase the program counter
		this.current_step = this.next_step;
		this.next_step = null;

		// Check for script completion
		if (this.current_step === null || this.current_step >= this.cmds.length) {
			// Done
			this._callback(this.EVENTS.CMDS_FINISHED);
			return;
		}
		if( this.step !== true ){
			this.run();
		}
	}
};

//************************************************************************
//********************* XPCOM MODULE REGISTRATION*************************
//************************************************************************

//=================================================
// Note: You probably don't want to edit anything
// below this unless you know what you're doing.
//
// Factory
var ExecutionEngineFactory = {
	singleton : null,
	createInstance: function (outer, iid)
	{
		if (outer !== null)
			throw Components.results.NS_ERROR_NO_AGGREGATION;
		if (this.singleton === null)
			this.singleton = new ExecutionEngine();
		return this.singleton.QueryInterface(iid);
	}
};


// Module
var ExecutionEngineModule = {
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
			return ExecutionEngineFactory;
		throw Components.results.NS_ERROR_NO_INTERFACE;
	},

	canUnload: function(aCompMgr) { return true; }
};

//module initialization
function NSGetModule(aCompMgr, aFileSpec) { return ExecutionEngineModule; }
//debug('done parsing coscripter-execution-engine.js');

