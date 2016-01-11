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

var consoleService = Components.classes['@mozilla.org/consoleservice;1']
			.getService(Components.interfaces.nsIConsoleService);

function debug(msg) {
	//return;		//comment out to turn on debugging
	consoleService.logStringMessage(msg);
}

///////////////////////////////////////
//
// ACTIONS
// TARGETAREATYPE
// Command Object
//	canExecute
//	findTarget
//
// =========== GOTO ==================
//					goforward, reload, toggle
// ======= ExpandCollapse ============
//					create tab, assert, negation
// =========== ENTER =================
// =========== CLICK =================
//					switch, close tab
// =========== SELECT ================
// =========== Turn ==================
// =========== Pause =================
//					wait
// =========== Comment ===============
// =========== You Command============
// =========== COPY ==================
// =========== PASTE =================
//					begin extraction, end extraction
// =========== IF ====================
// =========== FIND ==================
// =========== Unexecutable  Command==
//
// =========== TargetSpec ============
// =========== TableTargetSpec =======
//					CellReference
// =========== DojoWidgetTargetSpec =======
//
// =========== VariableValue =========
//
///////////////////////////////////////

// ********************************************************************
// **************** Inheritance Convenience Methods *******************
// ********************************************************************

/** Inheritance convenience class adopted under BSD license from:
 * 		http://www.kevlindev.com/tutorials/javascript/inheritance/index.htm
 *		http://www.kevlindev.com/license.txt 
 * Example of Use:
 * 		JSInheritance.extend(MouseEvent, Event);
 * 		MouseEvent.superClass.funcName.call(this[, params]);
 * 		MouseEvent.baseConstructor.call(this[, params]);
 * @param subClass
 * @param baseClass
 */
JSInheritance = {};
JSInheritance.extend = function(subClass, baseClass) {
   function inheritance() {}
   inheritance.prototype = baseClass.prototype;

   subClass.prototype = new inheritance();
   subClass.prototype.constructor = subClass;
   subClass.baseConstructor = baseClass;
   subClass.superClass = baseClass.prototype;
}

// ====================================================================
// End Inheritance convenience methods
// ====================================================================


// ACTIONS
CoScripterCommand.prototype.ACTIONS = {
	ASSERT:'verify',
	NEGATION:'negate',
	CLICK:'click',
	CLIP:'clip',
	COPY:'copy',
	ENTER:'enter',
	APPEND:'append',
	GOTO:'go to',
	GOFORWARD:'go forward',
	SWITCH:'switch',
	CREATE:'create',
	RELOAD:'reload',
	EXPANDCOLLAPSE:'expandcollapse',
	TOGGLE:'toggle',
	CLOSE:'close',
	PASTE:'paste',
	PAUSE:'pause',
	SELECT:'select',
	TURN:'turn',
	WAIT:'wait',
	YOU:'you',
	BEGIN_EXTRACTION: 'begin extraction',
	END_EXTRACTION: 'end extraction',
	UNEXECUTABLE:'unexecutable',
	FIND:'find',
	IF:'if'
};

// TARGETAREATYPE
CoScripterCommand.prototype.TARGETAREATYPE = {
	WEBPAGE : "webpage",
	TABLE : "table",
	SCRATCHTABLE : "scratchtable",
	TEXTBOX : "textbox",
	TEXT : "text"
}

// Command Specific Error Msg
CoScripterCommand.prototype.ERRORMSG = {
	TARGET_VAL_NOTFOUND:'target value not found',
	TARGET_NOT_FOUND:'target not found'	
};



// ====================================================================
// Command Object
// ====================================================================

CoScripterCommand.prototype.Command = function(slop,execEnv){
	this.slop = slop ;
	this.targetSpec = null ;
	this.execEnv = execEnv;
	this.originalEvent = null;
	this.matchType = null;
    this.components = Components.classes["@coscripter.ibm.com/registry;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
    this.totalLines = -1 ;
    this.lineNumber = -1 ;
	// JM: HACK to get correct error msg
	this.errorMsg = null;
	// TL: HACK to generate correct slop for "enter your password" commands
	this.hidePasswordValue = false;
	return this ;
}

CoScripterCommand.prototype.Command.prototype = {
	// the original slop
	getSlop : function(){
		return this.slop ;
	},
	// the action to be performed, also used as the command type
	// ENTER, GOTO, SELECT, CLICK
	getAction : function(){
		return this.type;
	},

	// return the original event generated by our listener framework (if available)
	getOriginalEvent : function(){
		return this.originalEvent;
	},

	// will only work if the original event is available
	getTarget : function(){
		if (this.originalEvent){
			return this.originalEvent.target;
		}
		return null;
	},
	
	// if present
	// 1st, 2nd, 3rd ...
	getOrdinal : function(){
		if(this.targetSpec){
			return this.targetSpec.getOrdinal()
		}	
		return null;
	},

	getDisambiguator : function(){
		if(this.targetSpec){
			return this.targetSpec.getDisambiguator()
		}	
		return null;
	},

	// the type of the target element
	// link, button, textbox, ...
	getTargetType : function(){
		if(this.targetSpec){
			return this.targetSpec.getTargetType();
		}
		return null;
	},
	
	getErrorMsg : function() {
		return this.errorMsg;
	},

	hasTargetSpec : function()
	{
		return (this.targetSpec != null);
	},

	hasTargetDisambiguator : function()
	{
		return (this.targetSpec != null && this.targetSpec.getDisambiguator() != null);
	},

	hasTargetLabel : function()
	{
		return (this.targetSpec != null && this.targetSpec.getTargetLabel() != null);
	},
	
	// the label of the target (e.g. the "Do somthing" button)
	// All commands other than Copy and Paste of TableTargets, have a VariableValue object as their targetSpec 
	getTargetLabel : function(useRegExp){
		if(this.targetSpec && this.targetSpec.targetLabel){
			return this.targetSpec.targetLabel.getValue(useRegExp);
		}
		return null;
	},
	
	// the textvalue to enter in a search box or to select from a listbox
	getTextvalue : function(){
		// TODO: raise error if needed variables are unset
		// TODO: see if VariableValue.getValue() can be used instead of this
		return this.string.getValue();
	},

	// The options hashmap may contain parameters that affect execution
	// Available known parameters:
	// color : the color of the execution animation
	execute : function(thenDoThis, options){
		//dump('Command.execute called on non specific Command\n')
		throw "called execute on non specific Command";
	},

	variabilize : function(database) {
		// don't do anything
	},

	fillInVars : function(database) {
		// don't do anything
	},
	
	// Possible options to be set in the hash:
	// options = { 'color' : 'red',
	//				'overlaytext' : 'displayme' }
	// options can also be null if you don't need to override anything
	preview : function(options){
		this.clearPreview();
		this.previewConfig = this.execEnv.preview(this, options);
    },
	
	clearPreview : function(){
		if(null != this.previewConfig){
			this.execEnv.clearPreview(this.previewConfig);
		}
		this.previewConfig = null ;
	},

	location2URL : function (locStr){
		var urlStart = /^([a-zA-Z]+)\:/ ;
		if(!urlStart.test(locStr)){
			if (/ /.test(locStr)) {
				// TL: I don't know if anyone else needs this, but I do.
				// When I type a string into my location bar it defaults to a
				// google search on that string, however CoScripter records
				// only my search terms and not the google search url
				locStr = 'http://www.google.com/search?q=' +
					encodeURIComponent(locStr);
			} else {
				locStr = "http://" + locStr;
			}
		}
		return locStr;
	},

	/////////////////
	//	canExecute
	/////////////////
	canExecute : function(){
		// dump('Command.canExecute: ' + this.getSlop() + '\n')
		var hasTargets  = this.findTarget()!=null;
		var hasVars = this.hasNeededVars();
		
		return (hasTargets && hasVars);
	},

	// Whether this command has the requisite variables present in the
	// personal database
	hasNeededVars : function(){
		return true;
	},

	// Whether this command needs variable values to be filled in
	needsVars : function(){
		return false;
	},

	getVarNames : function(){
		// TL: this should probably be implemented on each subclass of Command
		var varNames = [] ;
		if(this.string && this.string.getNeedVar()) {
			varNames.push(this.string.dbkey);
		}  
		if(this.targetSpec !=null && this.targetSpec.getNeedVar() && this.targetSpec.targetLabel){
			varNames.push(this.targetSpec.targetLabel.dbkey);
		}
		return varNames ;
	},
	
	/////////////////
	//	findTarget
	/////////////////
	findTarget : function(){
		if(this.target == null || 
		  			(this.target.ownerDocument && this.execEnv.getCurrentBrowser() && this.target.ownerDocument != this.execEnv.getCurrentBrowser().contentDocument) ){
					  // For Cut and Paste, the != above kept breaking, so I added tests for ownerDocument and currentBrowser (AC)
					  // NOTE: When stepping through Venkman, this may fail because getCurrentBrowser() will look at the Venkman window and return null.
			this.target = this.execEnv.findTarget(this);
		}
		return this.target;
	},
	
	toSlop :function(database){
		return "toSlop called on abstract command";
	},

	// Whether to do autowait before this command or not
	autoWait : function() {
		return false;
	},

	// Accessors for the indentation level of this command
	setIndent : function(indent) {
		this.indent = indent;
	},
	getIndent : function() {
		return this.indent;
	},
	
	setLineNumber : function(nr){
		this.lineNumber = nr ;
		// TL: Setting it for the nested command as well because it's
		// required to make bubble help work for YOU commands
		if (this.nestedCommand) {
			this.nestedCommand.lineNumber = nr;
		}
	},
	getLineNumber : function(){
		return this.lineNumber  ;
	},
	setTotalLines : function(lines){
		this.totalLines = lines ;
		// TL: Setting it for the nested command as well because it's
		// required to make bubble help work for YOU commands
		if (this.nestedCommand) {
			this.nestedCommand.totalLines = lines;
		}
	},
	getTotalLines : function(){
		return this.totalLines ;
	}

}	// end of Command


// ===================================
// =========== GOTO ==================
// ===================================

CoScripterCommand.prototype.createGotoFromSlop = function(slop, execEnv){
	return new CoScripterCommand.prototype.GotoCommand(slop,execEnv);
}

CoScripterCommand.prototype.createGotoFromParams = function(originalEvent, location){
	var gotoCmd = new CoScripterCommand.prototype.GotoCommand();
	
	gotoCmd.originalEvent = originalEvent;
	gotoCmd.loc = new CoScripterCommand.prototype.VariableValue(location);
	
	return gotoCmd;
}

CoScripterCommand.prototype.GotoCommand = function(slop,execEnv){
	CoScripterCommand.prototype.GotoCommand.baseConstructor.call(this, slop,execEnv);
	this.type = CoScripterCommand.prototype.ACTIONS.GOTO ;
	return this ;
}

JSInheritance.extend(CoScripterCommand.prototype.GotoCommand, CoScripterCommand.prototype.Command);

CoScripterCommand.prototype.GotoCommand.prototype.hasTargetSpec = function(){
	return false;
}

CoScripterCommand.prototype.GotoCommand.prototype.canExecute = function(){
	// dump('GotoCommand.canExecute\n')
	return this.hasNeededVars() ;
} 

CoScripterCommand.prototype.GotoCommand.prototype.toString = function(){
	return this.getAction() + " " + this.loc.toString();
}

// TEMPORARY: in this case, it works
CoScripterCommand.prototype.GotoCommand.prototype.toSlop = function(){
	return this.toString();
}

CoScripterCommand.prototype.GotoCommand.prototype.variabilize = function(database) {
	this.loc.variabilize(database);
}

CoScripterCommand.prototype.GotoCommand.prototype.fillInVars = function(database) {
	this.loc.fillInVars(database);
}

CoScripterCommand.prototype.GotoCommand.prototype.hasNeededVars = function() {
	return this.loc.hasNeededVars();
}

CoScripterCommand.prototype.GotoCommand.prototype.needsVars = function() {
	return this.loc.getNeedVar();
}

CoScripterCommand.prototype.GotoCommand.prototype.execute = function(thenDoThis, options){
	// dump('GotoCommand.execute\n')
	var loc = this.getLocation();
	// dump('EXECUTE: go to ' + loc + '\n');
	this.execEnv.Goto(this.location2URL(loc),thenDoThis,options);
}

CoScripterCommand.prototype.GotoCommand.prototype.getLocation = function(){
	return this.loc.getValue();
}

// TL: warning, this might not actually set the location; if a variable
// is being used, that could override this setting
CoScripterCommand.prototype.GotoCommand.prototype.setLocation = function(loc) {
	this.loc = new CoScripterCommand.prototype.VariableValue(loc);
}

CoScripterCommand.prototype.GotoCommand.prototype.preview = function(options){
	this.clearPreview();
	this.previewConfig = this.execEnv.preview(this, options);
}

CoScripterCommand.prototype.GotoCommand.prototype.autoWait = function(){
	return false;
}

// ==============================================
// =========== GO FORWARD/BACKWARD ==============
// ==============================================

CoScripterCommand.prototype.createGoforwardFromSlop = function(slop, execEnv){
	return new CoScripterCommand.prototype.GoforwardCommand(slop,execEnv);
}

CoScripterCommand.prototype.createGoforwardFromParams = function(originalEvent, direction){
	var gofwdCmd = new CoScripterCommand.prototype.GoforwardCommand();
	
	gofwdCmd.direction=direction;
	gofwdCmd.originalEvent = originalEvent;
	
	return gofwdCmd;
}

CoScripterCommand.prototype.GoforwardCommand = function(slop,execEnv){
	CoScripterCommand.prototype.GoforwardCommand.baseConstructor.call(this, slop,execEnv);
	this.type = CoScripterCommand.prototype.ACTIONS.GOFORWARD;
	this.direction = this.FORWARD;
	return this ;
}

JSInheritance.extend(CoScripterCommand.prototype.GoforwardCommand, CoScripterCommand.prototype.Command);

CoScripterCommand.prototype.GoforwardCommand.prototype.FORWARD = 'forward'
CoScripterCommand.prototype.GoforwardCommand.prototype.BACK = 'back'

CoScripterCommand.prototype.GoforwardCommand.prototype.hasTargetSpec = function(){
	return false;
}

CoScripterCommand.prototype.GoforwardCommand.prototype.canExecute = function(){
	var browser = this.execEnv.getCurrentBrowser();
	var chromeWindow = this.components.utils().getChromeWindowForNode(browser);
	if(this.direction==this.FORWARD){
		return chromeWindow.getWebNavigation().canGoForward
	}else{
		return chromeWindow.getWebNavigation().canGoBack
	}	 
} 

CoScripterCommand.prototype.GoforwardCommand.prototype.toString = function(){
	return this.direction == this.FORWARD ? this.getAction() : "go back";
}

// TEMPORARY: in this case, it works
CoScripterCommand.prototype.GoforwardCommand.prototype.toSlop = function(){
	return this.toString();
}

CoScripterCommand.prototype.GoforwardCommand.prototype.variabilize = function(database) {
	return;
}

CoScripterCommand.prototype.GoforwardCommand.prototype.fillInVars = function(database) {
	return;
}

CoScripterCommand.prototype.GoforwardCommand.prototype.hasNeededVars = function() {
	return true;
}

CoScripterCommand.prototype.GoforwardCommand.prototype.needsVars = function() {
	return false;
}

CoScripterCommand.prototype.GoforwardCommand.prototype.execute = function(thenDoThis, options){
	var browser = this.execEnv.getCurrentBrowser();
	var utils = this.components.utils();
	var chromeWindow = utils.getChromeWindowForNode(browser);
	if(this.direction==this.FORWARD){
		chromeWindow.getWebNavigation().goForward()
	}else{
		//go back
		chromeWindow.getWebNavigation().goBack()
	}
	utils.betterThenDoThis(chromeWindow, thenDoThis);
}

CoScripterCommand.prototype.GoforwardCommand.prototype.setDirection = function(direction) {
	this.direction=direction;
}

CoScripterCommand.prototype.GoforwardCommand.prototype.preview = function(options){
}

CoScripterCommand.prototype.GoforwardCommand.prototype.autoWait = function(){
	return false;
}

// ==================================
// =========== RELOAD  ==============
// ==================================

CoScripterCommand.prototype.createReloadFromSlop = function(slop, execEnv){
	return new CoScripterCommand.prototype.ReloadCommand(slop,execEnv);
}

CoScripterCommand.prototype.createReloadFromParams = function(originalEvent){
	var reloadCmd = new CoScripterCommand.prototype.ReloadCommand();
	
	reloadCmd.originalEvent = originalEvent;
	
	return reloadCmd;
}

CoScripterCommand.prototype.ReloadCommand = function(slop,execEnv){
	CoScripterCommand.prototype.ReloadCommand.baseConstructor.call(this, slop,execEnv);
	this.type = CoScripterCommand.prototype.ACTIONS.RELOAD;
	return this ;
}

JSInheritance.extend(CoScripterCommand.prototype.ReloadCommand, CoScripterCommand.prototype.Command);

CoScripterCommand.prototype.ReloadCommand.prototype.hasTargetSpec = function(){
	return false;
}

CoScripterCommand.prototype.ReloadCommand.prototype.canExecute = function(){
	// dump('ReloadCommand.canExecute\n')
	return true;
} 

CoScripterCommand.prototype.ReloadCommand.prototype.toString = function(){
	return this.getAction() ;
}

// TEMPORARY: in this case, it works
CoScripterCommand.prototype.ReloadCommand.prototype.toSlop = function(){
	return this.toString();
}

CoScripterCommand.prototype.ReloadCommand.prototype.variabilize = function(database) {
	return;
}

CoScripterCommand.prototype.ReloadCommand.prototype.fillInVars = function(database) {
	return;
}

CoScripterCommand.prototype.ReloadCommand.prototype.hasNeededVars = function() {
	return true;
}

CoScripterCommand.prototype.ReloadCommand.prototype.needsVars = function() {
	return false;
}

CoScripterCommand.prototype.ReloadCommand.prototype.execute = function(thenDoThis, options){
	var browser = this.execEnv.getCurrentBrowser();
	var utils = this.components.utils();
	var chromeWindow = utils.getChromeWindowForNode(browser);
	browser.reload();
	utils.betterThenDoThis(chromeWindow, thenDoThis);
}

CoScripterCommand.prototype.ReloadCommand.prototype.preview = function(options){
}

CoScripterCommand.prototype.ReloadCommand.prototype.autoWait = function(){
	return false;
}

//===================================
//=========== Toggle ================
//===================================

CoScripterCommand.prototype.createToggleFromSlop = function(slop, execEnv){
	return new CoScripterCommand.prototype.ToggleCommand(slop,execEnv);
}

CoScripterCommand.prototype.createToggleFromParams = function(originalEvent, label, type){
	var toggleCmd = new CoScripterCommand.prototype.ToggleCommand();
	
	toggleCmd.originalEvent = originalEvent;
	toggleCmd.targetSpec = new CoScripterCommand.prototype.TargetSpec();
	toggleCmd.targetSpec.targetLabel = new CoScripterCommand.prototype.VariableValue(label);
	toggleCmd.targetSpec.targetType = type;

	return toggleCmd;
}

CoScripterCommand.prototype.ToggleCommand = function(slop,execEnv){
	CoScripterCommand.prototype.ToggleCommand.baseConstructor.call(this, slop,execEnv);
	this.type = CoScripterCommand.prototype.ACTIONS.TOGGLE;
	return this ;
}

JSInheritance.extend(CoScripterCommand.prototype.ToggleCommand, CoScripterCommand.prototype.Command);

CoScripterCommand.prototype.ToggleCommand.prototype.toString = function(){	
	return "find target '" + this.targetSpec.toString() + "' and toggle it ";
}

CoScripterCommand.prototype.ToggleCommand.prototype.execute = function(thenDoThis, options){
	//dump('EXECUTE: toggle the ' + this.targetSpec.getTargetLabel() + '\n');
	this.targetElement = this.findTarget(this);
	// this.execEnv.Toggle(this.targetElement,thenDoThis, this.turnon, options); Need to figure out how to toggle
}

CoScripterCommand.prototype.ToggleCommand.prototype.variabilize = function(database) {
	this.targetSpec.variabilize(database);
}

CoScripterCommand.prototype.ToggleCommand.prototype.fillInVars = function(database) {
	this.targetSpec.fillInVars(database);
}

CoScripterCommand.prototype.ToggleCommand.prototype.hasNeededVars = function() {
	return this.targetSpec.hasNeededVars();
}

CoScripterCommand.prototype.ToggleCommand.prototype.needsVars = function() {
	return this.targetSpec.getNeedVar();
}

CoScripterCommand.prototype.ToggleCommand.prototype.toSlop = function(){
	return "toggle the " + this.targetSpec.toSlop();
}

CoScripterCommand.prototype.ToggleCommand.prototype.autoWait = function(){
	return true;
}


//===================================
// ======= ExpandCollapse ============
//===================================
CoScripterCommand.prototype.createExpandCollapseFromSlop = function(slop, execEnv){
	return new CoScripterCommand.prototype.ExpandCollapseCommand(slop,execEnv);
}

CoScripterCommand.prototype.createExpandCollapseFromParams = function(originalEvent, label, type, expand){
	
	var turnCmd = new CoScripterCommand.prototype.ExpandCollapseCommand();
	
	expandCollapseCmd.originalEvent = originalEvent;
	expandCollapseCmd.targetSpec = new CoScripterCommand.prototype.TargetSpec();
	expandCollapseCmd.targetSpec.targetLabel = new CoScripterCommand.prototype.VariableValue(label);
	expandCollapseCmd.targetSpec.targetType = type;
	expandCollapseCmd.expand = expand ;
	return expandCollapseCmd;
}

CoScripterCommand.prototype.ExpandCollapseCommand = function(slop,execEnv){
	CoScripterCommand.prototype.ExpandCollapseCommand.baseConstructor.call(this, slop,execEnv);
	this.type = CoScripterCommand.prototype.ACTIONS.EXPANDCOLLAPSE;
	return this ;
}

JSInheritance.extend(CoScripterCommand.prototype.ExpandCollapseCommand, CoScripterCommand.prototype.Command);

CoScripterCommand.prototype.ExpandCollapseCommand.prototype.toString = function(){	
	return "find target '" + this.targetSpec.toString() + "' and expand/collapse it";
}

CoScripterCommand.prototype.ExpandCollapseCommand.prototype.execute = function(thenDoThis, options){
	//dump('EXECUTE: expand/collapse ' + this.turnon + ' the ' + this.targetSpec.getTargetLabel() + '\n');
	this.targetElement = this.findTarget(this);
	this.execEnv.ExpandOrCollapse(this.targetElement, this.turnon, thenDoThis);
}

CoScripterCommand.prototype.ExpandCollapseCommand.prototype.variabilize = function(database) {
	this.targetSpec.variabilize(database);
}

CoScripterCommand.prototype.ExpandCollapseCommand.prototype.fillInVars = function(database) {
	this.targetSpec.fillInVars(database);
}

CoScripterCommand.prototype.ExpandCollapseCommand.prototype.hasNeededVars = function() {
	return this.targetSpec.hasNeededVars();
}

CoScripterCommand.prototype.ExpandCollapseCommand.prototype.needsVars = function() {
	return this.targetSpec.getNeedVar();
}

CoScripterCommand.prototype.ExpandCollapseCommand.prototype.toSlop = function(){
	return (this.turnon?"expand":"collapse") + " the " + this.targetSpec.toSlop();
}

CoScripterCommand.prototype.ExpandCollapseCommand.prototype.autoWait = function(){
	return true;
}




// =========================================
// ============== CREATE TAB ===============
// =========================================

CoScripterCommand.prototype.createCreateFromSlop = function(slop, execEnv){
	return new CoScripterCommand.prototype.CreateCommand(slop,execEnv);
}

CoScripterCommand.prototype.createCreateFromParams = function(originalEvent, isTab){
	var createCmd = new CoScripterCommand.prototype.CreateCommand();
	createCmd.isTab = true;
	return createCmd;
}

CoScripterCommand.prototype.CreateCommand = function(slop,execEnv){
	CoScripterCommand.prototype.CreateCommand.baseConstructor.call(this, slop,execEnv);
	this.type = CoScripterCommand.prototype.ACTIONS.CREATE;
	return this ;
}

JSInheritance.extend(CoScripterCommand.prototype.CreateCommand, CoScripterCommand.prototype.Command);

CoScripterCommand.prototype.CreateCommand.prototype.hasTargetSpec = function(){
	return false;
}

CoScripterCommand.prototype.CreateCommand.prototype.canExecute = function(){
	return true;
} 

CoScripterCommand.prototype.CreateCommand.prototype.toString = function(){
	return this.getAction() + " new " + (this.isTab ? "tab" : "window");
}

CoScripterCommand.prototype.CreateCommand.prototype.toSlop = function(){
	return this.toString();
}

CoScripterCommand.prototype.CreateCommand.prototype.variabilize = function(database) {
	return;
}

CoScripterCommand.prototype.CreateCommand.prototype.fillInVars = function(database) {
	return;
}

CoScripterCommand.prototype.CreateCommand.prototype.hasNeededVars = function() {
	return true;
}

CoScripterCommand.prototype.CreateCommand.prototype.needsVars = function() {
	return false;
}

CoScripterCommand.prototype.CreateCommand.prototype.execute = function(thenDoThis, options){
	//this.execEnv.Create(thenDoThis);
}

CoScripterCommand.prototype.CreateCommand.prototype.preview = function(options){
}

CoScripterCommand.prototype.CreateCommand.prototype.autoWait = function(){
	return false;
}


// ===================================
// =========== Wait ==================
// ===================================

CoScripterCommand.prototype.createWaitFromSlop = function(slop, execEnv){
	return new CoScripterCommand.prototype.WaitCommand(slop,execEnv);
}

CoScripterCommand.prototype.createWaitFromParams = function(originalEvent, label, type) {
	var waitCmd = new CoScripterCommand.prototype.WaitCommand();

	waitCmd.originalEvent = originalEvent;
	waitCmd.targetSpec = new CoScripterCommand.prototype.TargetSpec();
	waitCmd.targetSpec.targetLabel = new CoScripterCommand.prototype.VariableValue(label);
	waitCmd.targetSpec.targetType = type;

	return waitCmd;
}


CoScripterCommand.prototype.WaitCommand = function(slop,execEnv){
	CoScripterCommand.prototype.WaitCommand.baseConstructor.call(this, slop,execEnv);
	this.type = CoScripterCommand.prototype.ACTIONS.WAIT;
	return this ;
}

JSInheritance.extend(CoScripterCommand.prototype.WaitCommand, CoScripterCommand.prototype.Command);

CoScripterCommand.prototype.WaitCommand.prototype.execute = function(thenDoThis, options){
	//dump('EXECUTE: wait for ' + this.getTargetLabel() + '\n');
	// implement "wait for" right here
	var target = this.execEnv.findTarget(this);
	if (target) {
		thenDoThis();
	} else {
		// Save off a pointer to the current "this" context, because inside the setTimeout callback, "this" will point to the
		// window and not to the WaitCommand.  Then we use "apply" to run the WaitCommand's execute function with the proper "this" context.
		var __this = this;
		var browser = this.execEnv.getCurrentBrowser();
		var utils = this.components.utils();
		var chromeWindow = utils.getChromeWindowForNode(browser);
		chromeWindow.setTimeout(function() {
			CoScripterCommand.prototype.WaitCommand.prototype.execute.apply(__this, [thenDoThis, options]);
		}, 100);
	}
}

CoScripterCommand.prototype.WaitCommand.prototype.canExecute = function(){
	this.targetElement = this.findTarget(this);
	if (this.positive == true)
		return  (this.targetElement !=null); // for now
	else 	return  (this.targetElement ==null); // for now
	//return true;
} 

CoScripterCommand.prototype.WaitCommand.prototype.toSlop = function(){	
	return "wait for " + this.targetSpec.toSlop();
}

CoScripterCommand.prototype.WaitCommand.prototype.toString = function(){	
	return "wait for target '" + this.targetSpec.toString() + "' to appear";
}

CoScripterCommand.prototype.WaitCommand.prototype.variabilize = function(database) {
	this.targetSpec.variabilize(database);
}

CoScripterCommand.prototype.WaitCommand.prototype.fillInVars = function(database) {
	this.targetSpec.fillInVars(database);
}

CoScripterCommand.prototype.WaitCommand.prototype.hasNeededVars = function() {
	return this.targetSpec.hasNeededVars();
}

CoScripterCommand.prototype.WaitCommand.prototype.needsVars = function() {
	return this.targetSpec.getNeedVar();
}

CoScripterCommand.prototype.WaitCommand.prototype.getValue = function() {
	return this.string.getValue();
}

CoScripterCommand.prototype.WaitCommand.prototype.setValue = function(value) {
	this.string = new CoScripterCommand.prototype.VariableValue(value);
}


CoScripterCommand.prototype.WaitCommand.prototype.autoWait = function(){
	return false;
}


// ===================================
// =========== ASSERT =================
// ===================================

CoScripterCommand.prototype.createAssertFromSlop = function(slop, execEnv){
	return new CoScripterCommand.prototype.AssertCommand(slop,execEnv);
}


CoScripterCommand.prototype.createAssertFromParams = function(originalEvent, label, type){
	var assertCmd = new CoScripterCommand.prototype.AssertCommand();
	var utils = assertCmd.components.utils();
	var labeler = assertCmd.components.labeler();
	
	assertCmd.originalEvent = originalEvent;
	
	assertCmd.targetSpec = new CoScripterCommand.prototype.TargetSpec();
	assertCmd.targetSpec.targetLabel = new CoScripterCommand.prototype.VariableValue(label);
	assertCmd.targetSpec.targetType = type;
	assertCmd.positive = true;
	
	return assertCmd;
}


CoScripterCommand.prototype.AssertCommand = function(slop,execEnv){
	CoScripterCommand.prototype.AssertCommand.baseConstructor.call(this, slop,execEnv);
	this.type = CoScripterCommand.prototype.ACTIONS.ASSERT ;
	return this ;
}

JSInheritance.extend(CoScripterCommand.prototype.AssertCommand, CoScripterCommand.prototype.Command);

CoScripterCommand.prototype.AssertCommand.prototype.toString = function(){	
	return "check whether target '" + this.targetSpec.toString() + "' exists";	
}

CoScripterCommand.prototype.AssertCommand.prototype.execute = function(thenDoThis, errorcb, options){	

	if (this.canExecute()) {
		thenDoThis();
	} else throw "assertion failure for " + this.toSlop();	
}

CoScripterCommand.prototype.AssertCommand.prototype.toSlop = function(){	
    if (this.positive) {
		return this.getAction() + " there is a " + this.targetSpec.toSlop();
	} else {
		return this.getAction() + " there is no " + this.targetSpec.toSlop();
	}	
}

CoScripterCommand.prototype.AssertCommand.prototype.canExecute = function(){
	this.targetElement = this.findTarget(this);
	var hasTargets = (this.targetElement != null);
	if (this.positive == true) {
		
	} else {
		hasTargets = (this.targetElement == null);
	}
	
	return hasTargets;
}


CoScripterCommand.prototype.AssertCommand.prototype.autoWait = function(){
	return true;
}

CoScripterCommand.prototype.AssertCommand.prototype.getValue = function() {
	return this.string.getValue();
}

CoScripterCommand.prototype.AssertCommand.prototype.setValue = function(value) {
	this.string = new CoScripterCommand.prototype.VariableValue(value);
}

CoScripterCommand.prototype.AssertCommand.prototype.hasNeededVars = function() {
	return this.targetSpec.hasNeededVars();
}

CoScripterCommand.prototype.AssertCommand.prototype.needsVars = function() {
	return this.targetSpec.getNeedVar();
}

CoScripterCommand.prototype.AssertCommand.prototype.variabilize = function(database) {
	this.targetSpec.variabilize(database);
}

CoScripterCommand.prototype.AssertCommand.prototype.fillInVars = function(database) {
	this.targetSpec.fillInVars(database);
}



// ===================================
// =========== ENTER =================
// ===================================

CoScripterCommand.prototype.createEnterFromSlop = function(slop, execEnv){
	return new CoScripterCommand.prototype.EnterCommand(slop,execEnv);
}

CoScripterCommand.prototype.createEnterFromParams = function(originalEvent, label, type, textToEnter, isPassword){
	var enterCmd = new CoScripterCommand.prototype.EnterCommand();
		
	enterCmd.initializeCommandFromParams(originalEvent, label, type, textToEnter, isPassword);
	
	return enterCmd;
}

CoScripterCommand.prototype.EnterCommand = function(slop,execEnv){
	CoScripterCommand.prototype.EnterCommand.baseConstructor.call(this, slop,execEnv);
	this.type = CoScripterCommand.prototype.ACTIONS.ENTER ;
	// This variable indicates whether the target is a password field or
	// not.  It is not used in this file, but it is consulted by the
	// FilterPassword filter to determine whether to hide the password
	// during slop generation.
	this.isPassword = false;
	this.string = new CoScripterCommand.prototype.VariableValue("");
	return this ;
}

JSInheritance.extend(CoScripterCommand.prototype.EnterCommand, CoScripterCommand.prototype.Command);

CoScripterCommand.prototype.EnterCommand.prototype.initializeCommandFromParams = function(originalEvent, label, type, textToEnter, isPassword){
    this.originalEvent = originalEvent;
	this.string = new CoScripterCommand.prototype.VariableValue(textToEnter);
	this.isPassword = isPassword;
	if (type == this.components.labeler().WEBTYPES.DOJOWIDGET){
	    var targetSpec = label	// kludge: the targetSpec was passed in using the 'label' parameter
	    var targetLabel = new CoScripterCommand.prototype.VariableValue(targetSpec.targetLabel)
	    this.targetSpec = targetSpec 
	    this.targetSpec.targetLabel = targetLabel
	} else {
		this.targetSpec = new CoScripterCommand.prototype.TargetSpec();
		this.targetSpec.targetLabel = new CoScripterCommand.prototype.VariableValue(label);
		this.targetSpec.targetType = type;
	}
}

CoScripterCommand.prototype.EnterCommand.prototype.getValue = function() {
	return this.string.getValue();
}
CoScripterCommand.prototype.EnterCommand.prototype.setValue = function(value) {
	this.string = new CoScripterCommand.prototype.VariableValue(value);
}

CoScripterCommand.prototype.EnterCommand.prototype.toString = function(){	
	return "find target '" + this.targetSpec.toString() + "' and enter '"  + escape(this.string) + "'";
}

CoScripterCommand.prototype.EnterCommand.prototype.execute = function(thenDoThis, options){
	this.targetElement = this.findTarget(this);
	var value = this.string.getValue();
	//dump('EXECUTE: enter ' + value + ' into ' + this.targetSpec.getTargetLabel() + '\n');
	this.execEnv.Enter(this.targetElement,value,thenDoThis,options);
}

CoScripterCommand.prototype.EnterCommand.prototype.variabilize = function(database) {
	this.targetSpec.variabilize(database);
	this.string.variabilize(database);
}

CoScripterCommand.prototype.EnterCommand.prototype.fillInVars = function(database) {
	this.targetSpec.fillInVars(database);
	this.string.fillInVars(database);
}

CoScripterCommand.prototype.EnterCommand.prototype.hasNeededVars = function() {
	return this.string.hasNeededVars() && this.targetSpec.hasNeededVars();
}

CoScripterCommand.prototype.EnterCommand.prototype.needsVars = function() {
	return this.string.getNeedVar() || this.targetSpec.getNeedVar();
}

CoScripterCommand.prototype.EnterCommand.prototype.preview = function(options){
	if (null == options) options = {};
	this.clearPreview();

	options['overlaytext'] = this.getPreviewString();
	
	this.previewConfig = this.execEnv.preview(this, options);
}

CoScripterCommand.prototype.EnterCommand.prototype.getPreviewString = function(){
	// needsVar?	hasVar?	isPass?	isSecret?	display
	// N			-		Y		-			****
	// N			-		N		-			text
	// Y			N		-		-			""
	// Y			Y		N		N			var
	// Y			Y		N		Y			****
	// Y			Y		Y		N			****
	// Y			Y		Y		Y			****
	//
	// TL: this table is not 100% implemented yet.  When needsVar=N and
	// isPass=Y, it still displays text instead of stars.  This is because
	// at this point in the code, we do not know anything about the target
	// yet, whether it is a password box or not.  That check does not
	// happen until commandExecutionEnvironment.preview gets called.
	//
	// So, effectively, isPassword is only set and consulted when slop is
	// being generated, not during playback.  This is a bug.

	var previewString = "" ;
	var stars = "********";
	if (this.string.getNeedVar()) {
		if (this.string.hasNeededVars()) {
			if (this.isPassword==true || this.string.isSecret()) {
				previewString = stars;
			} else {
				previewString = this.string.getValue();
			}
		} else {
			previewString = '';
		}
	} else {
		if (this.isPassword == true) {
			previewString = stars;
		} else {
			previewString = this.string.getValue();
		}
	}
	return previewString ;
}

CoScripterCommand.prototype.EnterCommand.prototype.toSlop = function(){
	var t;

	// TL: the optional FilterPassword filter will set the
	// hidePasswordValue flag to true if we are supposed to hide the
	// password (HACK)
	if (this.hidePasswordValue) {
		t = "your password";
	} else {
		t = this.string.toSlop();
	}
	return this.getAction() + " " + t + " into the " + this.targetSpec.toSlop();
}

CoScripterCommand.prototype.EnterCommand.prototype.autoWait = function(){
	return true;
}

//====================================
//=========== Append =================
//====================================

CoScripterCommand.prototype.AppendCommand = function(slop,execEnv){
	CoScripterCommand.prototype.AppendCommand.baseConstructor.call(this, slop,execEnv);
	this.type = CoScripterCommand.prototype.ACTIONS.APPEND;
	// This variable indicates whether the target is a password field or
	// not.  It is not used in this file, but it is consulted by the
	// FilterPassword filter to determine whether to hide the password
	// during slop generation.
	this.isPassword = false;
	this.string = new CoScripterCommand.prototype.VariableValue("");
	return this ;
}

JSInheritance.extend(CoScripterCommand.prototype.AppendCommand, CoScripterCommand.prototype.EnterCommand);

CoScripterCommand.prototype.createAppendFromSlop = function(slop, execEnv){
	return new CoScripterCommand.prototype.AppendCommand(slop,execEnv);
}

CoScripterCommand.prototype.createAppendFromParams = function(originalEvent, label, type, textToEnter, isPassword, textBefore){
	var appendCmd = new CoScripterCommand.prototype.AppendCommand();
		
	appendCmd.initializeCommandFromParams(originalEvent, label, type, textToEnter, isPassword);
		
	return appendCmd;
}

CoScripterCommand.prototype.AppendCommand = function(slop,execEnv){
	CoScripterCommand.prototype.AppendCommand.baseConstructor.call(this, slop,execEnv);
	this.type = CoScripterCommand.prototype.ACTIONS.APPEND ;
	// This variable indicates whether the target is a password field or
	// not.  It is not used in this file, but it is consulted by the
	// FilterPassword filter to determine whether to hide the password
	// during slop generation.
	this.isPassword = false;
	this.string = new CoScripterCommand.prototype.VariableValue("");
	return this ;
}

JSInheritance.extend(CoScripterCommand.prototype.AppendCommand, CoScripterCommand.prototype.EnterCommand);

CoScripterCommand.prototype.AppendCommand.prototype.toString = function(){	
	return "find target '" + this.targetSpec.toString() + "' and append '"  + escape(this.string) + "'";
}

CoScripterCommand.prototype.AppendCommand.prototype.execute = function(thenDoThis, options){
	this.targetElement = this.findTarget(this);
	var oldValue = this.targetElement.value;
	var newValue = oldValue + this.string.getValue(); // Space in between? Prob not?
	//dump('EXECUTE: append ' + value + ' into ' + this.targetSpec.getTargetLabel() + '\n');
	this.execEnv.Enter(this.targetElement,newValue,thenDoThis,options);
}

CoScripterCommand.prototype.AppendCommand.prototype.toSlop = function(){
	var t;

	// TL: the optional FilterPassword filter will set the
	// hidePasswordValue flag to true if we are supposed to hide the
	// password (HACK)
	if (this.hidePasswordValue) {
		t = "your password";
	} else {
		t = this.string.toSlop();
	}
	return this.getAction() + " " + t + " to the " + this.targetSpec.toSlop();
}

CoScripterCommand.prototype.AppendCommand.prototype.getPreviewString = function(){
	// CD 10/1/2009 Should AppendCommand actually support passwords? 
	//    like append your password to the foo textbox??? not really eh?
	
	// needsVar?	hasVar?	isPass?	isSecret?	display
	// N			-		Y		-			****
	// N			-		N		-			text
	// Y			N		-		-			""
	// Y			Y		N		N			var
	// Y			Y		N		Y			****
	// Y			Y		Y		N			****
	// Y			Y		Y		Y			****
	//
	// TL: this table is not 100% implemented yet.  When needsVar=N and
	// isPass=Y, it still displays text instead of stars.  This is because
	// at this point in the code, we do not know anything about the target
	// yet, whether it is a password box or not.  That check does not
	// happen until commandExecutionEnvironment.preview gets called.
	//
	// So, effectively, isPassword is only set and consulted when slop is
	// being generated, not during playback.  This is a bug.
	var oldVal = this.findTarget().value ;
	var previewString = "" ;
	var stars = "********";
	if (this.string.getNeedVar()) {
		if (this.string.hasNeededVars()) {
			if (this.isPassword==true || this.string.isSecret()) {
				previewString = stars;
			} else {
				previewString = oldVal + this.string.getValue() ;
			}
		} else {
			previewString = '';
		}
	} else {
		if (this.isPassword == true) {
			previewString = stars;
		} else {
			previewString = oldVal + this.string.getValue();
		}
	}
	return previewString ;
}

// ===================================
// =========== CLICK =================
// ===================================

CoScripterCommand.prototype.createClickFromSlop = function(slop, execEnv){
	return new CoScripterCommand.prototype.ClickCommand(slop,execEnv);
}

CoScripterCommand.prototype.createClickFromParams = function(originalEvent, label, type, ctrlP){
	var clickCmd = new CoScripterCommand.prototype.ClickCommand();
	var utils = clickCmd.components.utils();
	var labeler = clickCmd.components.labeler();
	
	clickCmd.originalEvent = originalEvent;
	clickCmd.controlP = ctrlP;
	
	if (type == labeler.WEBTYPES.TABLECELL){ // use a special TableTargetSpec
		clickCmd.targetSpec = new CoScripterCommand.prototype.TableTargetSpec()
		clickCmd.targetSpec.targetColumnLabel = new CoScripterCommand.prototype.VariableValue(label[0])
		clickCmd.targetSpec.targetRowLabel = new CoScripterCommand.prototype.VariableValue(label[1])
		clickCmd.targetSpec.targetTableLabel = new CoScripterCommand.prototype.VariableValue(String(label[2]))
		clickCmd.targetSpec.targetLabel = clickCmd.targetSpec.getTargetLabel()
		clickCmd.targetSpec.targetType = type;
	}
	else if (type == labeler.WEBTYPES.DOJOWIDGET){
		clickCmd.targetSpec = label	// the targetSpec was passed in using the 'label' parameter
		clickCmd.targetSpec.targetLabel = new CoScripterCommand.prototype.VariableValue(clickCmd.targetSpec.targetLabel)
		clickCmd.targetSpec.subcomponentLabel = new CoScripterCommand.prototype.VariableValue(clickCmd.targetSpec.subcomponentLabel)
		//clickCmd.targetSpec.targetType = type;	// the CA barWidget breaks in handleEvent's postprocessing call to listTargetMatches if the
												// targetType is null.  But I think the DojoWidgetTargetSpec's toSlop method
												// relies on it being null for some kinds of dojowidgets.  (AC)
		if (clickCmd.targetSpec.action) clickCmd.type = clickCmd.targetSpec.action
	}
	else {
		clickCmd.targetSpec = new CoScripterCommand.prototype.TargetSpec();
		clickCmd.targetSpec.targetLabel = new CoScripterCommand.prototype.VariableValue(label);
		clickCmd.targetSpec.targetType = type;
		var clickLoc = this.getClickLoc(originalEvent, utils)
		clickCmd.targetSpec.clickLoc = clickLoc
	}

	return clickCmd;
}

CoScripterCommand.prototype.getClickLoc = function(theEvent, utils){
	var boundingRect = theEvent.target.getBoundingClientRect()
	var clientX = boundingRect.left
	var clientY = boundingRect.top
	var x = theEvent.x
	var y = theEvent.y
	var loc = {}
	loc.x = (clientX - x).toFixed(0)
	loc.y = (clientY - y).toFixed(0)
	//debug("getClickLoc: previously got " + loc.x + "," + loc.y)
	//////////  work here
	var position = utils.getNodePosition(theEvent.target)
	loc.x = position.x.toFixed(0)
	loc.y = position.y.toFixed(0)
	//debug("getClickLoc: now we get " + loc.x + "," + loc.y)
	return loc
},

CoScripterCommand.prototype.ClickCommand = function(slop,execEnv){
	CoScripterCommand.prototype.ClickCommand.baseConstructor.call(this, slop,execEnv);
	this.type = CoScripterCommand.prototype.ACTIONS.CLICK ;
	return this ;
}

JSInheritance.extend(CoScripterCommand.prototype.ClickCommand, CoScripterCommand.prototype.Command);

CoScripterCommand.prototype.ClickCommand.prototype.toString = function(){	
	return "find target '" + this.targetSpec.toString() + "' and " + this.controlP?"control-":""  + "click it";
}

CoScripterCommand.prototype.ClickCommand.prototype.execute = function(thenDoThis, options){
	//dump('EXECUTE: click ' + this.targetSpec.getTargetLabel() + '\n');
 	if (this.sourceType == CoScripterCommand.prototype.TARGETAREATYPE.SCRATCHTABLE) {
		this.target.rowNumber = this.rowNumber
		this.target.columnNumber = this.components.utils().convertLetterToColumnNumber(this.columnLetter);
		this.execEnv.Click(this.target, thenDoThis, this.controlP, options);
	}
	else {
		this.targetElement = this.findTarget(this)
		if (this.targetSpec.xpath) { // Need a way to specify *where* to click on the target
			// I'm using the "options" parameter, since I don't want to add a this.clickLoc parameter to this.execEnv.Click (AC)
			options.clickLoc = this.targetSpec.clickLoc
		}
		this.execEnv.Click(this.targetElement, thenDoThis, this.controlP, options);
	}
}

CoScripterCommand.prototype.ClickCommand.prototype.getAction = function(){
	if (this.type == "click" && this.controlP == true) return "control-click"
    else return this.type;
}

CoScripterCommand.prototype.ClickCommand.prototype.variabilize = function(database) {
	//kludge: don't variabilize table cells for now (AC)
	if (this.targetSpec.targetType != "cell") this.targetSpec.variabilize(database);
}

CoScripterCommand.prototype.ClickCommand.prototype.fillInVars = function(database) {
	this.targetSpec.fillInVars(database);
}

CoScripterCommand.prototype.ClickCommand.prototype.hasNeededVars = function() {
	return true;	//having a target is good enough until we add VariableValues for row and column references
	//return this.targetSpec.hasNeededVars();
}

CoScripterCommand.prototype.ClickCommand.prototype.needsVars = function() {
	return this.targetSpec.getNeedVar();
}

CoScripterCommand.prototype.ClickCommand.prototype.toSlop = function(){
	var targetSlop = ""
	if (this.targetSpec.widgetClass) {	// dojoTargetSpec.toSlop figures out the entire command's slop
		this.targetSpec.action = this.getAction()
		targetSlop = this.targetSpec.toSlop()
		return targetSlop
	}
	
	targetSlop = this.targetSpec.toSlop()
	var theText = " the "
	if (targetSlop.indexOf("column") == 1) {
		targetSlop = targetSlop.replace(/"/g, '')
		targetSlop = targetSlop.replace(/  scratch/g, ' scratch')
		theText = " "
		return this.getAction() + theText + targetSlop;
	}
	if (targetSlop.slice(0,2) == '\"/') {	//XPath
		theText = this.getAction() + " x" + targetSlop.substring(0,targetSlop.length-6) 	// remove ' xpath' from the end
		theText += " at (" + this.targetSpec.getClickLocX() + "," + this.targetSpec.getClickLocY()  + ")"
		return theText
	}
	return this.getAction() + " the " + this.targetSpec.toSlop();
}

CoScripterCommand.prototype.ClickCommand.prototype.autoWait = function(){
	return true;
}

// ===================================
// =========== SWITCH ================
// ===================================

CoScripterCommand.prototype.createSwitchFromSlop = function(slop, execEnv){
	return new CoScripterCommand.prototype.SwitchCommand(slop,execEnv);
}

CoScripterCommand.prototype.createSwitchFromParams = function(originalEvent, label, type, ctrlP){
	var switchCmd = new CoScripterCommand.prototype.SwitchCommand();
	
	switchCmd.originalEvent = originalEvent;
	switchCmd.targetSpec = new CoScripterCommand.prototype.TargetSpec();
	switchCmd.targetSpec.targetLabel = new CoScripterCommand.prototype.VariableValue(label);
	switchCmd.targetSpec.targetType = type;
	switchCmd.controlP = ctrlP;
	
	return switchCmd;
}

CoScripterCommand.prototype.SwitchCommand = function(slop,execEnv){
	CoScripterCommand.prototype.SwitchCommand.baseConstructor.call(this, slop,execEnv);
	this.type = CoScripterCommand.prototype.ACTIONS.SWITCH ;
	return this ;
}

JSInheritance.extend(CoScripterCommand.prototype.SwitchCommand, CoScripterCommand.prototype.Command);

CoScripterCommand.prototype.SwitchCommand.prototype.toString = function(){	
	return "switch to tab '" + this.targetSpec.toString() + "'";
}

CoScripterCommand.prototype.SwitchCommand.prototype.execute = function(thenDoThis, options){
	//dump('EXECUTE: switch ' + this.targetSpec.getTargetLabel() + '\n');
	this.targetTab = this.findTarget(this)// hmm findTab?
	this.execEnv.Switch(this.targetTab,thenDoThis, this.controlP, options);
}

CoScripterCommand.prototype.SwitchCommand.prototype.variabilize = function(database) {
	this.targetSpec.variabilize(database);
}

CoScripterCommand.prototype.SwitchCommand.prototype.fillInVars = function(database) {
	this.targetSpec.fillInVars(database);
}

CoScripterCommand.prototype.SwitchCommand.prototype.hasNeededVars = function() {
	return this.targetSpec.hasNeededVars();
}

CoScripterCommand.prototype.SwitchCommand.prototype.needsVars = function() {
	return this.targetSpec.getNeedVar();
}

CoScripterCommand.prototype.SwitchCommand.prototype.toSlop = function(){
	return this.getAction() + " to the " + this.targetSpec.toSlop();
}

CoScripterCommand.prototype.SwitchCommand.prototype.canExecute = function(){
	// dump('SwitchCommand.canExecute\n')
	// TODO: (findTab !=null){return true ;}else{ return false;}
	return true; // for now
}

CoScripterCommand.prototype.SwitchCommand.prototype.autoWait = function(){
	// TL: Someday this could be true if we write code that knows how to detect
	// that the specified tab exists; for now, return false
	return false;
}

// ====================================
// =========== CLOSE (TAB) ============
// ====================================

CoScripterCommand.prototype.createCloseFromSlop = function(slop, execEnv){
	return new CoScripterCommand.prototype.CloseCommand(slop,execEnv);
}

CoScripterCommand.prototype.createCloseFromParams = function(originalEvent, label, type){
	var switchCmd = new CoScripterCommand.prototype.CloseCommand();
	
	switchCmd.originalEvent = originalEvent;
	switchCmd.targetSpec = new CoScripterCommand.prototype.TargetSpec();
	switchCmd.targetSpec.targetLabel = new CoScripterCommand.prototype.VariableValue(label);
	switchCmd.targetSpec.targetType = type;
	
	return switchCmd;
}

CoScripterCommand.prototype.CloseCommand = function(slop,execEnv){
	CoScripterCommand.prototype.CloseCommand.baseConstructor.call(this, slop,execEnv);
	this.type = CoScripterCommand.prototype.ACTIONS.CLOSE ;
	return this ;
}

JSInheritance.extend(CoScripterCommand.prototype.CloseCommand, CoScripterCommand.prototype.Command);

CoScripterCommand.prototype.CloseCommand.prototype.toString = function(){	
	return "close tab '" + this.targetSpec.toString() + "'";
}

CoScripterCommand.prototype.CloseCommand.prototype.execute = function(thenDoThis, options){
	//dump('EXECUTE: close ' + this.targetSpec.getTargetLabel() + '\n');
	this.targetTab = this.findTarget(this)// hmm findTab?
	this.execEnv.Close(this.targetTab,thenDoThis, this.controlP, options);
}

CoScripterCommand.prototype.CloseCommand.prototype.variabilize = function(database) {
	this.targetSpec.variabilize(database);
}

CoScripterCommand.prototype.CloseCommand.prototype.fillInVars = function(database) {
	this.targetSpec.fillInVars(database);
}

CoScripterCommand.prototype.CloseCommand.prototype.hasNeededVars = function() {
	return this.targetSpec.hasNeededVars();
}

CoScripterCommand.prototype.CloseCommand.prototype.needsVars = function() {
	return this.targetSpec.getNeedVar();
}

CoScripterCommand.prototype.CloseCommand.prototype.toSlop = function(){
	return this.getAction() + " the " + this.targetSpec.toSlop() + ' tab';
}

CoScripterCommand.prototype.CloseCommand.prototype.canExecute = function(){
	// dump('CloseCommand.canExecute\n')
	// TODO: (findTab !=null){return true ;}else{ return false;}
	return true; // for now
}

CoScripterCommand.prototype.CloseCommand.prototype.autoWait = function(){
	// TL: for now
	return false;
}

// ===================================
// =========== SELECT ================
// ===================================

CoScripterCommand.prototype.createSelectFromSlop = function(slop, execEnv){
	return new CoScripterCommand.prototype.SelectCommand(slop,execEnv);
}

CoScripterCommand.prototype.createSelectFromParams = function(originalEvent, label, type, itemTextToSelect){
	var selectCmd = new CoScripterCommand.prototype.SelectCommand();
	var utils = selectCmd.components.utils();
	var text = utils.trimAndStrip(itemTextToSelect)
	
	selectCmd.originalEvent = originalEvent;
	selectCmd.targetSpec = new CoScripterCommand.prototype.TargetSpec();
	selectCmd.targetSpec.targetLabel = new CoScripterCommand.prototype.VariableValue(label);
	selectCmd.targetSpec.targetType = type;
	// This is a secondary target spec to describe the item to be selected
	// from the listbox
	selectCmd.string = new CoScripterCommand.prototype.VariableValue(text);

	return selectCmd;
}

CoScripterCommand.prototype.SelectCommand = function(slop,execEnv){
	CoScripterCommand.prototype.SelectCommand.baseConstructor.call(this, slop,execEnv);
	this.type = CoScripterCommand.prototype.ACTIONS.SELECT ;
	return this ;
}

JSInheritance.extend(CoScripterCommand.prototype.SelectCommand, CoScripterCommand.prototype.Command);

CoScripterCommand.prototype.SelectCommand.prototype.toString = function(){	
	return "find target '" + this.targetSpec.toString() + "' and select  '"  + escape(this.string)+ "'";
}

CoScripterCommand.prototype.SelectCommand.prototype.execute = function(thenDoThis, options){
	this.targetElement = this.findTarget(this);
	//dump('EXECUTE: select ' + this.string.getValue() + ' from ' + this.targetSpec.getTargetLabel() + '\n');
	this.execEnv.Select(this.targetElement, thenDoThis, true, options);
}

CoScripterCommand.prototype.SelectCommand.prototype.variabilize = function(database) {
	this.targetSpec.variabilize(database);
	this.string.variabilize(database);
}

CoScripterCommand.prototype.SelectCommand.prototype.fillInVars = function(database) {
	this.targetSpec.fillInVars(database);
	this.string.fillInVars(database);
}

CoScripterCommand.prototype.SelectCommand.prototype.hasNeededVars = function() {
	return this.string.hasNeededVars() && this.targetSpec.hasNeededVars();
}

CoScripterCommand.prototype.SelectCommand.prototype.needsVars = function() {
	return this.string.getNeedVar() && this.targetSpec.getNeedVar();
}

CoScripterCommand.prototype.SelectCommand.prototype.toSlop = function(){
	var textValue;
	
	if (this.targetSpec.targetType == "menu") {
		return "select the " + this.targetSpec.toSlop();
	}

	if(this.string.getMatchType()== this.components.parser().ParserConstants.CONTAINS ){
		textValue = 'the item that contains ' + this.string;
	}else if(this.string.getMatchType()== this.components.parser().ParserConstants.STARTSWITH){
		textValue = "the item that starts with " + this.string;
	}else if(this.string.getMatchType()== this.components.parser().ParserConstants.ENDSWITH){
		textValue = "the item that ends with " + this.string;
	} else {
		if (this.string.getValue() && typeof(this.string.getValue().test) == "function") {
			// It's a regular expression
			textValue = 'r"' + this.string.getValue().source + '"';
		} else {
			// Otherwise, it's a plain VariableValue; use the normal
			// toString() method on VariableValues to determine the value
			// (including database variables if necessary)
			textValue = this.string;
		}
	}
	return "select " + textValue + " from the " + this.targetSpec.toSlop();
}

CoScripterCommand.prototype.SelectCommand.prototype.findTarget = function(){
		this.target = this.execEnv.findTarget(this);
		return this.target;
}
	

CoScripterCommand.prototype.SelectCommand.prototype.autoWait = function(){
	return true;
}

// ===================================
// =========== Turn ==================
// ===================================

CoScripterCommand.prototype.createTurnFromSlop = function(slop, execEnv){
	return new CoScripterCommand.prototype.TurnCommand(slop,execEnv);
}

CoScripterCommand.prototype.createTurnFromParams = function(originalEvent, label, type, turnOnP){
	var turnCmd = new CoScripterCommand.prototype.TurnCommand();
	
	turnCmd.originalEvent = originalEvent;
	turnCmd.turnon = turnOnP;
	turnCmd.targetSpec = new CoScripterCommand.prototype.TargetSpec();
	turnCmd.targetSpec.targetLabel = new CoScripterCommand.prototype.VariableValue(label);
	turnCmd.targetSpec.targetType = type;

	return turnCmd;
}

CoScripterCommand.prototype.TurnCommand = function(slop,execEnv){
	CoScripterCommand.prototype.TurnCommand.baseConstructor.call(this, slop,execEnv);
	this.type = CoScripterCommand.prototype.ACTIONS.TURN;
	return this ;
}

JSInheritance.extend(CoScripterCommand.prototype.TurnCommand, CoScripterCommand.prototype.Command);

CoScripterCommand.prototype.TurnCommand.prototype.toString = function(){	
	return "find target '" + this.targetSpec.toString() + "' and turn it  '"  + this.turnon?"on":"off" + "'";
}

CoScripterCommand.prototype.TurnCommand.prototype.execute = function(thenDoThis, options){
	//dump('EXECUTE: turn ' + this.turnon + ' the ' + this.targetSpec.getTargetLabel() + '\n');
	this.targetElement = this.findTarget(this);
	this.execEnv.Select(this.targetElement,thenDoThis, this.turnon, options);
}

CoScripterCommand.prototype.TurnCommand.prototype.variabilize = function(database) {
	this.targetSpec.variabilize(database);
}

CoScripterCommand.prototype.TurnCommand.prototype.fillInVars = function(database) {
	this.targetSpec.fillInVars(database);
}

CoScripterCommand.prototype.TurnCommand.prototype.hasNeededVars = function() {
	return this.targetSpec.hasNeededVars();
}

CoScripterCommand.prototype.TurnCommand.prototype.needsVars = function() {
	return this.targetSpec.getNeedVar();
}

CoScripterCommand.prototype.TurnCommand.prototype.toSlop = function(){
	return "turn " + (this.turnon?"on":"off") + " the " + this.targetSpec.toSlop();
}

CoScripterCommand.prototype.TurnCommand.prototype.autoWait = function(){
	return true;
}

// ===================================
// =========== Pause ==================
// ===================================

CoScripterCommand.prototype.createPauseFromSlop = function(slop, execEnv){
	return new CoScripterCommand.prototype.PauseCommand(slop,execEnv);
}

CoScripterCommand.prototype.createPauseFromParams = function(originalEvent, pauseLengthInSeconds){
	var pauseCmd = new CoScripterCommand.prototype.PauseCommand();
	
	pauseCmd.originalEvent = originalEvent;
	pauseCmd.pauseLength = pauseLengthInSeconds;

	return pauseCmd;
}

CoScripterCommand.prototype.PauseCommand = function(slop,execEnv){
	CoScripterCommand.prototype.PauseCommand.baseConstructor.call(this, slop,execEnv);
	this.pauseLength = 5;
	this.type = CoScripterCommand.prototype.ACTIONS.PAUSE;
	return this ;
}

JSInheritance.extend(CoScripterCommand.prototype.PauseCommand, CoScripterCommand.prototype.Command);

CoScripterCommand.prototype.PauseCommand.prototype.toString = function(){	
	return "pause for " + this.pauseLength.toString() + "seconds";
}

CoScripterCommand.prototype.PauseCommand.prototype.execute = function(thenDoThis, options){
	//dump('EXECUTE: pause ' + this.pauseLength + ' seconds\n');
	var browser = this.execEnv.getCurrentBrowser();
	var utils = this.components.utils();
	var chromeWindow = utils.getChromeWindowForNode(browser);
	chromeWindow.setTimeout(thenDoThis, this.pauseLength * 1000);
}

CoScripterCommand.prototype.PauseCommand.prototype.canExecute = function(){
	return true;
} 

CoScripterCommand.prototype.PauseCommand.prototype.toSlop = function(){
	return "pause " + this.pauseLength + " seconds";
}

CoScripterCommand.prototype.PauseCommand.prototype.autoWait = function(){
	return false;
}


// ===================================

// ========================================
// =========== Comment ====================
// ========================================

CoScripterCommand.prototype.CommentCommand = function(slop, execEnv) {
	CoScripterCommand.prototype.CommentCommand.baseConstructor.call(this, slop,execEnv);
	this.type = CoScripterCommand.prototype.ACTIONS.COMMENT;
	return this;
}

JSInheritance.extend(CoScripterCommand.prototype.CommentCommand, CoScripterCommand.prototype.Command);

CoScripterCommand.prototype.CommentCommand.prototype.toString = function(){	
	return "comment: " + this.getSlop();
}

CoScripterCommand.prototype.CommentCommand.prototype.execute = function(thenDoThis, options){
	thenDoThis();
}

CoScripterCommand.prototype.CommentCommand.prototype.canExecute = function(){
	return true;
} 

CoScripterCommand.prototype.CommentCommand.prototype.preview = function(){}

CoScripterCommand.prototype.CommentCommand.prototype.autoWait = function(){
	return false;
}

// ===================================
// =========== You Command============
// ===================================

CoScripterCommand.prototype.YouCommand = function(slop,execEnv,nestedCommand){
	CoScripterCommand.prototype.YouCommand.baseConstructor.call(this, slop,execEnv);
	this.type = CoScripterCommand.prototype.ACTIONS.YOU;
	this.nestedCommand = nestedCommand;
	return this ;
}

JSInheritance.extend(CoScripterCommand.prototype.YouCommand, CoScripterCommand.prototype.Command);

CoScripterCommand.prototype.YouCommand.prototype.toString = function(){	
	return this.slop;
}

CoScripterCommand.prototype.YouCommand.prototype.toSlop = function(){
	return this.toString();
}

CoScripterCommand.prototype.YouCommand.prototype.execute = function(thenDoThis, options){
	thenDoThis();
}

// This is false because the execEnv.preview() uses canExecute to determine
// whether to make the box green or red, and I want it to be red
CoScripterCommand.prototype.YouCommand.prototype.canExecute = function(){
	return false;
} 

CoScripterCommand.prototype.YouCommand.prototype.preview = function(color){	
	if (this.nestedCommand != null) {
		var options = { 'color' : 'orange' };
		this.nestedCommand.preview(options);
	}
}

CoScripterCommand.prototype.YouCommand.prototype.clearPreview = function(){
	if (this.nestedCommand != null) {
		this.nestedCommand.clearPreview();
	}
}

CoScripterCommand.prototype.YouCommand.prototype.hasNeededVars = function() {
	if (this.nestedCommand != null) {
		return this.nestedCommand.hasNeededVars();
	} else {
		return false;
	}
}

CoScripterCommand.prototype.YouCommand.prototype.needsVars = function() {
	if (this.nestedCommand != null) {
		return this.nestedCommand.needsVars();
	} else {
		return false;
	}
}

CoScripterCommand.prototype.YouCommand.prototype.fillInVars = function(database) {
	if (this.nestedCommand != null) {
		return this.nestedCommand.fillInVars(database);
	} else {
		return false;
	}
}

CoScripterCommand.prototype.YouCommand.prototype.autoWait = function(){
	return false;
}

// ===================================
// =========== COPY ==================
// ===================================

CoScripterCommand.prototype.createCopyFromSlop = function(slop, execEnv){
	return new CoScripterCommand.prototype.CopyCommand(slop,execEnv);
}

CoScripterCommand.prototype.createCopyFromParams = function(originalEvent, label, type){
	var copyCmd = new CoScripterCommand.prototype.CopyCommand()
	
	copyCmd.originalEvent = originalEvent
	if (type != copyCmd.components.labeler().WEBTYPES.TABLECELL) {
		copyCmd.targetSpec = new CoScripterCommand.prototype.TargetSpec()
		copyCmd.targetSpec.targetLabel = new CoScripterCommand.prototype.VariableValue(label)
	}
	else { // use a special TableTargetSpec
		// NOTE recorder.js has additional code for a table cell with a simple label
		copyCmd.targetSpec = new CoScripterCommand.prototype.TableTargetSpec()
		copyCmd.targetSpec.targetColumnLabel = new CoScripterCommand.prototype.VariableValue(label[0])
		copyCmd.targetSpec.targetRowLabel = new CoScripterCommand.prototype.VariableValue(label[1])
		copyCmd.targetSpec.targetTableLabel = new CoScripterCommand.prototype.VariableValue(String(label[2]))
		copyCmd.targetSpec.targetLabel = copyCmd.targetSpec.getTargetLabel()
	}
	
	copyCmd.targetSpec.targetType = type
	return copyCmd
}

CoScripterCommand.prototype.CopyCommand = function(slop,execEnv){
	CoScripterCommand.prototype.CopyCommand.baseConstructor.call(this, slop,execEnv);
	this.type = CoScripterCommand.prototype.ACTIONS.COPY ;
	return this ;
}

JSInheritance.extend(CoScripterCommand.prototype.CopyCommand, CoScripterCommand.prototype.Command);

CoScripterCommand.prototype.CopyCommand.prototype.WEBPAGE = "webpage";
CoScripterCommand.prototype.CopyCommand.prototype.TABLE = "table";
CoScripterCommand.prototype.CopyCommand.prototype.TEXTBOX = "textbox";

CoScripterCommand.prototype.CopyCommand.prototype.toString = function(){
	//TODO other cases
	return "copy '" + this.targetSpec.toString() + "'";
}

CoScripterCommand.prototype.CopyCommand.prototype.execute = function(thenDoThis, options){
	//dump('EXECUTE: copy ' + (this.targetSpec ? this.targetSpec.getTargetLabel() : '') + '\n');
	if (this.sourceType == CoScripterCommand.prototype.TARGETAREATYPE.TEXT){
		this.targetElement = this.findTarget(this)
		this.execEnv.Copy(this.targetElement,thenDoThis,options);		
	}else if(this.sourceType == CoScripterCommand.prototype.TARGETAREATYPE.WEBPAGE){
		// TODO
	}else if (this.sourceType == CoScripterCommand.prototype.TARGETAREATYPE.SCRATCHTABLE) {
		this.execEnv.Copy(this.target, thenDoThis, options);
	}else if (this.sourceType == CoScripterCommand.prototype.TARGETAREATYPE.TABLE){
		// doCommand into the scratchSpace table cell
		throw new Exception('not implemented'); 
	}else if (this.sourceType == CoScripterCommand.prototype.TARGETAREATYPE.TEXTBOX){
		this.targetElement = this.findTarget(this)
		this.execEnv.Copy(this.targetElement, thenDoThis, options);
	}else{
		throw new Exception ('unexpected CopyCommand argument type: expected WEBPAGE, TABLE, TEXTBOX or TEXT');
	}
}

CoScripterCommand.prototype.CopyCommand.prototype.variabilize = function(database) {
	//kludge: don't variabilize table cells for now (AC)
	if (this.targetSpec.targetType != "cell") this.targetSpec.variabilize(database);
}

CoScripterCommand.prototype.CopyCommand.prototype.fillInVars = function(database) {
	if (this.targetSpec) this.targetSpec.fillInVars(database);
}

CoScripterCommand.prototype.CopyCommand.prototype.hasNeededVars = function() {
	return true;	//having a target is good enough until we add VariableValues for row and column references
	//return this.targetSpec.hasNeededVars();
}

CoScripterCommand.prototype.CopyCommand.prototype.needsVars = function() {
	if (this.targetSpec) {
		return this.targetSpec.getNeedVar();
	}
	else {
		return false;
	}
}

CoScripterCommand.prototype.CopyCommand.prototype.preview = function(options){
	this.clearPreview();
	this.previewConfig = this.execEnv.preview(this, options);
}

CoScripterCommand.prototype.CopyCommand.prototype.toSlop = function(){
	var targetSlop = this.targetSpec.toSlop()
	var theText = " the "
	if (targetSlop.indexOf("column") == 1) {
		targetSlop = targetSlop.replace(/"/g, '')
		targetSlop = targetSlop.replace(/  scratch/g, ' scratch')
		theText = " "
	}
	return this.getAction() + theText + targetSlop;
}

CoScripterCommand.prototype.CopyCommand.prototype.autoWait = function(){
	// TL: it looks like findTarget only works on some copy commands; this is partially broken
	return true;
}

// ===================================
// =========== PASTE =================
// ===================================

CoScripterCommand.prototype.createPasteFromSlop = function(slop, execEnv){
	return new CoScripterCommand.prototype.PasteCommand(slop,execEnv);
}

CoScripterCommand.prototype.createPasteFromParams = function(originalEvent, label, type){
	var pasteCmd = new CoScripterCommand.prototype.PasteCommand();
	
	pasteCmd.originalEvent = originalEvent;
	pasteCmd.targetSpec = new CoScripterCommand.prototype.TargetSpec();
	pasteCmd.targetSpec.targetLabel = new CoScripterCommand.prototype.VariableValue(label);
	pasteCmd.targetSpec.targetType = type;
	
	return pasteCmd;
}


CoScripterCommand.prototype.PasteCommand = function(slop,execEnv){
	CoScripterCommand.prototype.PasteCommand.baseConstructor.call(this, slop,execEnv);
	this.type = CoScripterCommand.prototype.ACTIONS.PASTE ;
	return this ;
}

JSInheritance.extend(CoScripterCommand.prototype.PasteCommand, CoScripterCommand.prototype.Command);

CoScripterCommand.prototype.PasteCommand.prototype.WEBPAGE = "webpage";
CoScripterCommand.prototype.PasteCommand.prototype.TABLE = "table";

CoScripterCommand.prototype.PasteCommand.prototype.toString = function(){	
	return "'Paste '"  + escape(this.execEnv.getClipboardContents()) + "' into '" + this.targetSpec.toString();
}

CoScripterCommand.prototype.PasteCommand.prototype.execute = function(thenDoThis, options){
  	//dump('EXECUTE: paste into ' + (this.targetSpec ? this.targetSpec.getTargetLabel() : '') + '\n');
	if(this.destType == CoScripterCommand.prototype.TARGETAREATYPE.WEBPAGE ){
		this.targetElement = this.findTarget(this)
		this.execEnv.Paste(this.targetElement, thenDoThis, options);
	}else if (this.destType == CoScripterCommand.prototype.TARGETAREATYPE.SCRATCHTABLE) {
		this.target.rowNumber = this.rowNumber
		this.target.columnNumber = this.components.utils().convertLetterToColumnNumber(this.columnLetter);
		this.execEnv.Paste(this.target, thenDoThis, options);
	}else if (this.destType == CoScripterCommand.prototype.TARGETAREATYPE.TABLE){
		// paste into the scratchSpace table cell
		throw new Exception('not implemented'); 
	}else{
		throw new Exception ('unexpected PasteCommand argument type: expected WEBPAGE, TABLE, TEXTBOX or TEXT');
	}
}

CoScripterCommand.prototype.PasteCommand.prototype.variabilize = function(database) {
	this.targetSpec.variabilize(database);
}

CoScripterCommand.prototype.PasteCommand.prototype.fillInVars = function(database) {
	if (this.targetSpec) this.targetSpec.fillInVars(database);
}

CoScripterCommand.prototype.PasteCommand.prototype.hasNeededVars = function() {
	return true;	//having a target is good enough until we add VariableValues for row and column references
	//return this.targetSpec.hasNeededVars();
}

CoScripterCommand.prototype.PasteCommand.prototype.needsVars = function() {
	if (this.targetSpec) {
		return this.targetSpec.getNeedVar();
	}
	else {
		return false;
	}
}

CoScripterCommand.prototype.PasteCommand.prototype.preview = function(options){
	this.clearPreview();
	var contents = this.execEnv.getClipboardContents();
	if (options == null) {
		options = {};
	}
	options.overlaytext = contents;
	this.previewConfig = this.execEnv.preview(this, options);
}

CoScripterCommand.prototype.PasteCommand.prototype.toSlop = function(){
	var targetSlop = this.targetSpec.toSlop()
	var intoText = " into the "
	if (targetSlop.indexOf("column") == 1) {
		targetSlop = targetSlop.replace(/"/g, '')
		targetSlop = targetSlop.replace(/  scratch/g, ' scratch')
		intoText = " into "
	}
	return this.getAction() + intoText + targetSlop;
}

CoScripterCommand.prototype.PasteCommand.prototype.autoWait = function(){
	// TL: see comments for CopyCommand.prototype.autoWait
	return true;
}

// ===================================
// =========== Begin Extraction ======
// ===================================

CoScripterCommand.prototype.createBeginExtractionFromSlop = function(slop, execEnv){
	return new CoScripterCommand.prototype.BeginExtractionCommand(slop,execEnv);
}

CoScripterCommand.prototype.createBeginExtractionFromParams = function(originalEvent) {
	var beginExtractionCmd = new CoScripterCommand.prototype.BeginExtractionCommand();
	beginExtractionCmd.originalEvent = originalEvent;
	return beginExtractionCmd;
}

CoScripterCommand.prototype.BeginExtractionCommand = function(slop,execEnv){
	CoScripterCommand.prototype.BeginExtractionCommand.baseConstructor.call(this, slop,execEnv);
	this.type = CoScripterCommand.prototype.ACTIONS.BEGIN_EXTRACTION;
	return this ;
}

JSInheritance.extend(CoScripterCommand.prototype.BeginExtractionCommand, CoScripterCommand.prototype.Command);

CoScripterCommand.prototype.BeginExtractionCommand.prototype.toString = function(){	
	return "begin extraction";
}

CoScripterCommand.prototype.BeginExtractionCommand.prototype.execute = function(thenDoThis, options){
	//dump('EXECUTE: begin extraction\n');
	this.execEnv.BeginExtraction(thenDoThis, options);
}

CoScripterCommand.prototype.BeginExtractionCommand.prototype.canExecute = function(){
	return true;
} 

CoScripterCommand.prototype.BeginExtractionCommand.prototype.toSlop = function(){
	return "begin extraction";
}

CoScripterCommand.prototype.BeginExtractionCommand.prototype.autoWait = function(){
	return false;
}


// ===================================
// =========== End Extraction ========
// ===================================

CoScripterCommand.prototype.createEndExtractionFromSlop = function(slop, execEnv){
	return new CoScripterCommand.prototype.EndExtractionCommand(slop,execEnv);
}

CoScripterCommand.prototype.createEndExtractionCommandFromParams = function(originalEvent) {
	var endExtractionCmd = new CoScripterCommand.prototype.EndExtractionCommand();
	endExtractionCmd.originalEvent = originalEvent;
	return endExtractionCmd;
}

CoScripterCommand.prototype.EndExtractionCommand = function(slop,execEnv){
	CoScripterCommand.prototype.EndExtractionCommand.baseConstructor.call(this, slop,execEnv);
	this.type = CoScripterCommand.prototype.ACTIONS.END_EXTRACTION;
	return this ;
}

JSInheritance.extend(CoScripterCommand.prototype.EndExtractionCommand, CoScripterCommand.prototype.Command);

CoScripterCommand.prototype.EndExtractionCommand.prototype.toString = function(){	
	return "end extraction";
}

CoScripterCommand.prototype.EndExtractionCommand.prototype.execute = function(thenDoThis, options){
	//dump('EXECUTE: end extraction\n');
	this.execEnv.EndExtraction(thenDoThis, options);
}

CoScripterCommand.prototype.EndExtractionCommand.prototype.canExecute = function(){
	return true;
} 

CoScripterCommand.prototype.EndExtractionCommand.prototype.toSlop = function(){
	return "end extraction";
}

CoScripterCommand.prototype.EndExtractionCommand.prototype.autoWait = function(){
	return false;
}

// ===================================
// =========== IF ====================
// ===================================


CoScripterCommand.prototype.IfCommand = function(slop,execEnv){
	CoScripterCommand.prototype.IfCommand.baseConstructor.call(this, slop,execEnv);
	this.type = CoScripterCommand.prototype.ACTIONS.IF;
	return this;
}

JSInheritance.extend(CoScripterCommand.prototype.IfCommand, CoScripterCommand.prototype.Command);

CoScripterCommand.prototype.IfCommand.prototype.toString = function(){	
	return "check whether target '" + this.targetSpec.toString() + "' exists";
}

//CoScripterCommand.prototype.IfCommand.prototype.execute = function(thenDoThis, options){
	//this.targetElement = this.findTarget(this);
	//thenDoThis();
//}

// IF commands can always be executed
//CoScripterCommand.prototype.IfCommand.prototype.canExecute = function() {
	//return true;
//}

CoScripterCommand.prototype.IfCommand.prototype.execute = function(thenDoThis, errorcb, options){	

	if (this.canExecute()) {
		thenDoThis();
	} else throw "If command failure for " + this.toSlop();	
}



CoScripterCommand.prototype.IfCommand.prototype.toSlop = function(){	
    if (this.positive) {
		return this.getAction() + " there is a " + this.targetSpec.toSlop();
	} else {
		return this.getAction() + " there is no " + this.targetSpec.toSlop();
	}	
}

CoScripterCommand.prototype.IfCommand.prototype.canExecute = function(){
	this.targetElement = this.findTarget(this);
	var hasTargets = (this.targetElement != null);
	if (this.positive == true) {
		
	} else {
		hasTargets = (this.targetElement == null);
	}
	
	return hasTargets;
}




// Return true of false depending on whether the condition holds
CoScripterCommand.prototype.IfCommand.prototype.evaluate = function() {
	return (this.findTarget(this) != null);
}

CoScripterCommand.prototype.IfCommand.prototype.autoWait = function(){
	return false;
}



CoScripterCommand.prototype.IfCommand.prototype.getValue = function() {
	return this.string.getValue();
}

CoScripterCommand.prototype.IfCommand.prototype.setValue = function(value) {
	this.string = new CoScripterCommand.prototype.VariableValue(value);
}

CoScripterCommand.prototype.IfCommand.prototype.hasNeededVars = function() {
	return this.targetSpec.hasNeededVars();
}

CoScripterCommand.prototype.IfCommand.prototype.needsVars = function() {
	return this.targetSpec.getNeedVar();
}



// ===================================
// =========== Find ==================
// ===================================

CoScripterCommand.prototype.createFindFromSlop = function(slop, execEnv){
	return new CoScripterCommand.prototype.FindCommand(slop,execEnv);
}

CoScripterCommand.prototype.createFindFromParams = function(originalEvent, continueP, searchTerm, previousP){
	var findCmd = new CoScripterCommand.prototype.FindCommand();
	
	findCmd.originalEvent = originalEvent;
	findCmd.continueFlag = continueP; // indicates whether this is a new search or a continuation of a previous search
	findCmd.searchTerm = searchTerm; // if not a continuation, then this contains the term to search for
	findCmd.previousFlag = previousP; // if a continuation, then whether we are searching forward or backward

	return findCmd;
}

CoScripterCommand.prototype.FindCommand = function(slop,execEnv){
	CoScripterCommand.prototype.FindCommand.baseConstructor.call(this, slop,execEnv);
	this.type = CoScripterCommand.prototype.ACTIONS.FIND;
	return this ;
}

JSInheritance.extend(CoScripterCommand.prototype.FindCommand, CoScripterCommand.prototype.Command);

CoScripterCommand.prototype.FindCommand.prototype.isContinuation = function(){
	return this.continueFlag;
}

CoScripterCommand.prototype.FindCommand.prototype.isPrevious = function(){
	return this.previousFlag;
}

CoScripterCommand.prototype.FindCommand.prototype.toString = function(){
	if (!this.continueFlag)
	{	
		return "perform a find in the browser for '" + this.searchTerm + "'";
	}
	else if (!this.previousFlag)
	{
		return "find the next result in the current browser.";
	}
	else
	{
		return "find the previous result in the current browser.";
	}
}

CoScripterCommand.prototype.FindCommand.prototype.hasTargetSpec = function(){
	return false;
}

CoScripterCommand.prototype.FindCommand.prototype.canExecute = function(){
	return true;
}

CoScripterCommand.prototype.FindCommand.prototype.execute = function(thenDoThis, options){
//	dump('EXECUTE: ' + this.toString() + '\n');
	if (!this.continueFlag)
	{	
		this.execEnv.Find(this.searchTerm, thenDoThis, options);
	}
	else
	{
		this.execEnv.FindAgain(this.previousFlag, thenDoThis, options);
	}
}

CoScripterCommand.prototype.FindCommand.prototype.variabilize = function(database) {
	// TODO
}

CoScripterCommand.prototype.FindCommand.prototype.fillInVars = function(database) {
	// TODO
}

CoScripterCommand.prototype.FindCommand.prototype.hasNeededVars = function() {
	// TODO
	return true;
}

CoScripterCommand.prototype.FindCommand.prototype.needsVars = function() {
	// TODO
	return false;
}

CoScripterCommand.prototype.FindCommand.prototype.preview = function(options){
	this.clearPreview();
	// TODO
}

CoScripterCommand.prototype.FindCommand.prototype.findTarget = function(){
	return null;
}

CoScripterCommand.prototype.FindCommand.prototype.toSlop = function(){
	if (!this.continueFlag)
	{	
		return "search for \"" + this.searchTerm + "\" on the current page";
	}
	else if (!this.previousFlag)
	{
		return "search for next";
	}
	else
	{
		return "search for previous";
	}
}

CoScripterCommand.prototype.FindCommand.prototype.autoWait = function(){
	return false;
}

// ===================================
// =========== CLIP ==================
// ===================================

CoScripterCommand.prototype.createClipFromSlop = function(slop, execEnv){
	return new CoScripterCommand.prototype.ClipCommand(slop,execEnv);
}

// TL: TODO figure out what params are needed to specify a clip
CoScripterCommand.prototype.createClipFromParams = function(originalEvent,
target){
	var clipCmd = new CoScripterCommand.prototype.ClipCommand();
	
	return clipCmd;
}

CoScripterCommand.prototype.ClipCommand = function(slop,execEnv){
	CoScripterCommand.prototype.ClipCommand.baseConstructor.call(this, slop,execEnv);
	this.type = CoScripterCommand.prototype.ACTIONS.CLIP ;
	return this ;
}

JSInheritance.extend(CoScripterCommand.prototype.ClipCommand, CoScripterCommand.prototype.Command);

CoScripterCommand.prototype.ClipCommand.prototype.hasTargetSpec = function(){
	return true;
}

CoScripterCommand.prototype.ClipCommand.prototype.canExecute = function(){
	this.targetElement = this.findTarget(this);
	var hasTargets = (this.targetElement != null);
	return hasTargets;
} 

CoScripterCommand.prototype.ClipCommand.prototype.toString = function(){
	return this.getAction() + " the " + this.targetSpec.toString();
}

// TEMPORARY: may not work
CoScripterCommand.prototype.ClipCommand.prototype.toSlop = function(){
	return this.toString();
}

CoScripterCommand.prototype.ClipCommand.prototype.hasNeededVars = function() {
	return this.targetSpec.hasNeededVars();
}

CoScripterCommand.prototype.ClipCommand.prototype.needsVars = function() {
	return this.targetSpec.getNeedVar();
}

CoScripterCommand.prototype.ClipCommand.prototype.execute = function(thenDoThis, options){
	thenDoThis();
}

// Evaluate the clip region and return its innerHTML
CoScripterCommand.prototype.ClipCommand.prototype.evaluate = function(){
	dump('trying to find region:' + this.targetSpec.toString() + '\n');
	var target = this.findTarget(this);
	return target;
}

CoScripterCommand.prototype.ClipCommand.prototype.getLocation = function(){
	return this.loc.getValue();
}

CoScripterCommand.prototype.ClipCommand.prototype.preview = function(options){
	this.clearPreview();
	this.previewConfig = this.execEnv.preview(this, options);
}

CoScripterCommand.prototype.ClipCommand.prototype.autoWait = function(){
	return true;
}

// ===================================
// =========== Unexecutable  Command==
// ===================================
CoScripterCommand.prototype.UnexecutableCommand = function(slop,execEnv){
	CoScripterCommand.prototype.UnexecutableCommand.baseConstructor.call(this, slop,execEnv);
	this.type = CoScripterCommand.prototype.ACTIONS.UNEXECUTABLE;
	return this ;
}

JSInheritance.extend(CoScripterCommand.prototype.UnexecutableCommand, CoScripterCommand.prototype.Command);

CoScripterCommand.prototype.UnexecutableCommand.prototype.toString = function(){	
	return this.slop;
}

CoScripterCommand.prototype.UnexecutableCommand.prototype.execute = function(thenDoThis, options){
	thenDoThis();
}

CoScripterCommand.prototype.UnexecutableCommand.prototype.canExecute = function(){
	return false;
} 

CoScripterCommand.prototype.UnexecutableCommand.prototype.preview = function(options){	
	this.clearPreview();
	this.previewConfig = this.execEnv.preview(this, options);
}

CoScripterCommand.prototype.UnexecutableCommand.prototype.autoWait = function(){
	return false;
}

// ----------------------------------------------------------------------
// End of command definitions
// ----------------------------------------------------------------------

// ===================================
// =========== TargetSpec ============
// ===================================
CoScripterCommand.prototype.TargetSpec = function(){
	this.disambiguator = null ;
	this.ordinal = null ; 
	this.targetLabel = null; // a VariableValue
	this.targetType = null;	// e.g. "radiobutton"
	this.clickLoc = null;	// e.g. {x:10, y:50} for XPaths, so we know the location of the click
	this.windowId = null
	this.windowType = ""	// e.g. content, dialog
	this.windowName = ""	// document.title
	this.tabNumber = null	// e.g. for a tabbed browser
	this.isDialogP = false	// true if the target is in a dialog box. Eventually this can be improved to specify *which* dialog box
	this.components = Components.classes["@coscripter.ibm.com/registry;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
	return this ;
}

CoScripterCommand.prototype.TargetSpec.prototype = {
	toString : function(){
		return this.toSlop();
 	},

	getDisambiguator : function(){
		return this.disambiguator;
	},

	getTargetLabel : function(){
		return this.targetLabel.getValue();
	},

	getOrdinal : function(){
		return this.ordinal;
	},

	getTargetType : function(){
		return this.targetType;
	},
	
	getClickLoc : function(){
		return this.clickLoc;
	},
	
	getClickLocX : function(){
		return this.getClickLoc().x;
	},
	
	getClickLocY : function(){
		return this.getClickLoc().y;
	},
	
	getWindowName : function(){
		return this.windowName
	},

	getWindowId : function(){
		return this.windowId;
	},

	getWindowType : function(){
		return this.windowType;
	},

	getWindowDescriptor : function(){
		if (this.getWindowName()) var windowDescriptor = " in the \"" + this.getWindowName() + "\" window"
		else if (this.getWindowId() == 0) windowDescriptor = " in the main window"
			else windowDescriptor = " in window #" + this.getWindowId()
		if (this.getWindowType() == "dialog") windowDescriptor = " in the dialog"
		if (this.getWindowId() == "BrowserPreferences") windowDescriptor = " in the \"BrowserPreferences\" window"		
		return windowDescriptor;
	},

	toSlop : function(){
		var str = "";
		
		// disambiguator from command-generator's handleEvent's postprocessing call to labeler.findDisambiguator
		if (this.disambiguator != null)
			str += this.disambiguator + " ";		
		
		// ordinal
		if (this.ordinal != null)
			str += this.components.utils().getOrdinal(this.getOrdinal()) + " ";
			
		// Construct the target label and target type phrase
		var targetType = this.getTargetType();
		if (targetType === null) {
			targetType = "target";
		}
		if (targetType === "scratch space") {
			targetType = "table";
		}
		var matchType = this.targetLabel.getMatchType();
		if (matchType === null) {
			// Not a regular expression
			if (this.targetLabel.toSlop() != "" && this.targetLabel.toSlop() != "\"\"") {
				str += this.targetLabel.toSlop() + " ";
			}
			
			str += targetType;
			
		} else if (matchType == this.components.parser().ParserConstants.CONTAINS) {
			str += targetType + " that contains " + this.targetLabel.toSlop();
		} else if (matchType == this.components.parser().ParserConstants.STARTSWITH) {
			str += targetType + " that starts with " + this.targetLabel.toSlop();
		} else if (matchType == this.components.parser().ParserConstants.ENDSWITH) {
			str += targetType + " that ends with " + this.targetLabel.toSlop();
		}
		
		/* toSlop does not add the window descriptor, since it is often not displayed in the editor window
		// (When it is implied by previous commands, or when there is only one window)
		// Call getWindowDescriptor whenever it is needed */

		return str;
	},
	
	variabilize : function(database) {
		this.targetLabel.variabilize(database);
	},

	fillInVars : function(database) {
		this.targetLabel.fillInVars(database);
	},

	hasNeededVars : function() {
		return this.targetLabel.hasNeededVars();
	},

	getNeedVar : function() {
		return this.targetLabel.getNeedVar();
	},
	
	getMatchType : function() {
		return this.targetLabel.getMatchType();
	},

	setMatchType : function(match) {
		return this.targetLabel.setMatchType(match);
	}
}

// ===================================
// =========== TableTargetSpec =======
// ===================================
CoScripterCommand.prototype.TableTargetSpec = function(){
	this.components = Components.classes["@coscripter.ibm.com/registry;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
	this.disambiguator = null ;
	this.ordinal = null ; 
	
	this.targetLabel = null; // not used
	this.targetType = null;	//Components.labeler.WEBTYPES.TABLECELL;
	this.tableType = null;	//Components.labeler.WEBTYPES.SCRATCHTABLE;	//a labeler.WEBTYPE of TABLE or SCRATCHTABLE

	this.clickLoc = null;	// e.g. {x:10, y:50} for XPaths, so we know the location of the click
	this.windowId = null
	this.windowType = ""	// e.g. content, dialog
	this.windowName = ""	// document.title
	this.tabNumber = null	// e.g. for a tabbed browser
	this.isDialogP = false	// true if the target is in a dialog box. Eventually this can be improved to specify *which* dialog box

	this.targetColumnLabel = null;	// a variableValue.  EITHER the targetColumnLabel OR the targetColumnNumber should be non-null.
	this.targetColumnNumber = null;	// a number literal
	this.targetRowLabel = null;		// a variableValue. EITHER the targetRowLabel OR the targetRowNumber should be non-null.
	this.targetRowNumber = null;	// a number literal
	// targetTableLabel: For the time being, there is just a single scratchtable. But eventually there will be multiple scratchtables and content tables (AC)

	/*	// use this once column and row numbers can be variableValues (AC)
	this.targetColumnLabel = null;	// a variableValue.  EITHER the targetColumnLabel OR the targetColumnNumber should be non-null.
	this.targetColumnNumber = null;	// a variableValue that ultimately can be coerced into a number
	this.targetRowLabel = null;		// a variableValue. EITHER the targetRowLabel OR the targetRowNumber should be non-null.
	this.targetRowNumber = null;	// a variableValue that ultimately can be coerced into a number
	*/
	this.targetTableLabel = null;	
	
	return this ;
}

CoScripterCommand.prototype.TableTargetSpec.prototype = {
	toString : function(){
		return this.toSlop();
 	},

	getDisambiguator : function(){
		return this.disambiguator;
	},

	getOrdinal : function(){
		return this.ordinal;
	},

	getTargetLabel : function(){
		return ""	// not used
	},

	getTargetType : function(){
		return this.targetType;
	},
	
	getTableType : function(){
		return this.tableType;
	},
	
	getClickLoc : function(){
		return this.clickLoc;
	},
	
	getClickLocX : function(){
		return this.getClickLoc().x;
	},
	
	getClickLocY : function(){
		return this.getClickLoc().y;
	},
	
	getWindowName : function(){
		return this.windowName
	},

	getWindowId : function(){
		return this.windowId;
	},

	getWindowType : function(){
		return this.windowType;
	},

	getWindowDescriptor : function(){
		if (this.getWindowName()) var windowDescriptor = " in the \"" + this.getWindowName() + "\" window"
		else if (this.getWindowId() == 0) windowDescriptor = " in the main window"
			else windowDescriptor = " in window #" + this.getWindowId()
		if (this.getWindowType() == "dialog") windowDescriptor = " in the dialog"
		return windowDescriptor;
	},
	
	columnSlop : function(){
		var str = "";
		str += "cell in "
		if (this.targetColumnLabel) {	// either the label should be filled in with a variableValue, or there should be a targetColumnNumber literal.
			str += "the " + this.targetColumnLabel.getValue() + " column";
		} else if (this.targetColumnNumber) {
			str += "column " + this.targetColumnNumber;
			} else str += " the column";
		return str;
	},

	rowSlop : function(){
		var str = "";
		if (this.targetRowLabel) {	// either the label should be filled in with a variableValue, or there should be a targetRowNumber literal.
			str += "the " + this.targetRowLabel.getValue() + " row";
		} else if (this.targetRowNumber) {
			str += "row " + this.targetRowNumber
			} else str += " the row";
		return str;
	},

	toSlop : function(){
		var str = "";
		if (this.ordinal != null) str += this.components.utils().getOrdinal(this.getOrdinal()) + " ";	// ordinal			
		str += "cell in " + this.columnSlop() + " of " + this.rowSlop()
		str += " of the " + this.getTableType()
		return str;
	},
	
	variabilize : function(database) {
		if (this.targetColumnLabel) this.targetColumnLabel.variabilize(database);
		//if (this.targetColumnNumber) this.targetColumnNumber.variabilize(database);
		if (this.targetRowLabel) this.targetRowLabel.variabilize(database);
		//if (this.targetRowNumber) this.targetRowNumber.variabilize(database);
	},

	fillInVars : function(database) {
		if (this.targetColumnLabel) this.targetColumnLabel.fillInVars(database);
		//if (this.targetColumnNumber) this.targetColumnNumber.fillInVars(database);
		if (this.targetRowLabel) this.targetRowLabel.fillInVars(database);
		//if (this.targetRowNumber) this.targetRowNumber.fillInVars(database);
	},

	hasNeededVars : function() {
		return (
				(this.targetColumnLabel) ?  this.targetColumnLabel.hasNeededVars() : true &&
				//(this.targetColumnNumber) ?  this.targetColumnNumber.hasNeededVars() : true &&
				(this.targetRowLabel) ?  this.targetRowLabel.hasNeededVars() : true
				//&& (this.targetRowNumber) ?  this.targetRowNumber.hasNeededVars() : true
			)
	},

	getNeedVar : function() {
		return (
				(this.targetColumnLabel) ?  this.targetColumnLabel.getNeedVar() : false ||
				//(this.targetColumnNumber) ?  this.targetColumnNumber.getNeedVar() : false ||
				(this.targetRowLabel) ?  this.targetRowLabel.getNeedVar() : false
				//|| (this.targetRowNumber) ?  this.targetRowNumber.getNeedVar() : false
			)
	}

	
	/*
	columnSlop : function(){
		var str = "";
		str += "cell in "
		if (this.targetColumnLabel) {	// either the label or number should be filled in with a variableValue
			str += "the " + this.targetColumnLabel.getValue() + " column";
		} else if (this.targetColumnNumber) {
			str += "column " + this.targetColumnNumber.getValue();
			} else str += " the column";
		return str;
	},

	rowSlop : function(){
		var str = "";
		if (this.targetRowLabel) {	// either the label or number should be filled in with a variableValue
			str += "the " + this.targetRowLabel.getValue() + " row";
		} else if (this.targetRowNumber) {
			str += "row " + this.targetRowNumber.getValue();
			} else str += " the row";
		return str;
	},

	toSlop : function(){
		var str = "";
		if (this.ordinal != null) str += this.components.utils().getOrdinal(this.getOrdinal()) + " ";	// ordinal			
		str += "cell in " + this.columnSlop() + " of " + this.rowSlop()
		str += " of the " + this.getTableType()
		return str;
	},
	
	variabilize : function(database) {
		if (this.targetColumnLabel) this.targetColumnLabel.variabilize(database);
		if (this.targetColumnNumber) this.targetColumnNumber.variabilize(database);
		if (this.targetRowLabel) this.targetRowLabel.variabilize(database);
		if (this.targetRowNumber) this.targetRowNumber.variabilize(database);
	},

	fillInVars : function(database) {
		if (this.targetColumnLabel) this.targetColumnLabel.fillInVars(database);
		if (this.targetColumnNumber) this.targetColumnNumber.fillInVars(database);
		if (this.targetRowLabel) this.targetRowLabel.fillInVars(database);
		if (this.targetRowNumber) this.targetRowNumber.fillInVars(database);
	},

	hasNeededVars : function() {
		return (
				(this.targetColumnLabel) ?  this.targetColumnLabel.hasNeededVars() : true &&
				(this.targetColumnNumber) ?  this.targetColumnNumber.hasNeededVars() : true &&
				(this.targetRowLabel) ?  this.targetRowLabel.hasNeededVars() : true &&
				(this.targetRowNumber) ?  this.targetRowNumber.hasNeededVars() : true
			)
	},

	getNeedVar : function() {
		return (
				(this.targetColumnLabel) ?  this.targetColumnLabel.getNeedVar() : false ||
				(this.targetColumnNumber) ?  this.targetColumnNumber.getNeedVar() : false ||
				(this.targetRowLabel) ?  this.targetRowLabel.getNeedVar() : false ||
				(this.targetRowNumber) ?  this.targetRowNumber.getNeedVar() : false
			)
	}
	*/
}

// ===================================
//					CellReference
// ===================================
// labeler.findTarget generally returns a pointer to a DOM element
// But XUL table cells are referenced by the DOM table element plus a columnIndex and a rowIndex
// So this special CellReference object is a way to refer to xul table cells
CoScripterCommand.prototype.CellReference = function(){
	this.tableElement = null;	// e.g. u.getCurrentCoScripterWindow().coscripter.scratchSpaceUI.getEditor()
	this.tableIndex = 0;	// since for now we are only using a single scratchtable (AC)
	this.rowIndex = null;
	this.columnIndex = null;
}


// ===================================
// =========== DojoWidgetTargetSpec =======
// ===================================
// Use the DojoWidgetTargetSpec for a target that is a (subcomponent of a) Dojo Widget
// Examples of generated command text:
// * click the body of the "Who Brings What" documentWorklet
// * uncheck the checkbox of the "New Todo" todoWorklet
// * enter "Allen's Home Page" into the "title" textbox of the "New Link" linkWorklet
// * select the "small" entry in the "fontSize" listbox of the "Who Brings What" documentWorklet
// * expand the "coyote point" entry in the "Allen Cypher's CoScripts" feedWorklet
// * expand "Princeton"'s "Graduate Students" entry in the "People" treeWidget of the "Universities" documentWorklet 
//		("Princeton"'s is a subcomponentDisambiguator)
CoScripterCommand.prototype.DojoWidgetTargetSpec = function(){
	// properties of all targetSpecs
	this.disambiguator = null ;
	this.ordinal = null ; 
	this.action = "";  //e.g. "click" or ["collapse", "expand"]
	this.turnOnP = false;   // if the widget has two states, is the current action turning it on (opening, etc)?
	this.targetValue = "";	// e.g. "x-small", "sandy brown"
	this.targetLabel = null; // e.g. "coyote point", "fontSize" the text string used in a generated command to label this widgetNode
	this.targetType = null;	// e.g. "button", "slider" the text string used in a generated command to name this type of UI element
	this.target = null;	// self or a parent which is a subcomponent of the widget
	this.clickLoc = null;	// e.g. {x:10, y:50} for XPaths, so we know the location of the click
	this.windowId = null
	this.windowType = ""	// e.g. content, dialog
	this.windowName = ""	// document.title
	this.tabNumber = null	// e.g. for a tabbed browser
	this.isDialogP = false	// true if the target is in a dialog box. Eventually this can be improved to specify *which* dialog box
	this.components = Components.classes["@coscripter.ibm.com/registry;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;

	// For dijits -- not sure if I'll use these.
	//this.wairole = null;	// "button" for TitlePane dojoWidget
	
	//  dojo-widget properties
	this.widgetClass = "";		// e.g. "lconn.dogear.SearchBar"
	                       // the value of the node's dojotype parameter or the widget's declaredClass 
							// 	Not sure I will always be able to get this. If not, it's a unique name given by the person 
							//     who writes the code to generate coscripter commands for this custom widget
    this.widgetType = "";   // e.g. "CurrencyTextBox" For a dijit, typically the last part of the widgetClass
    // hopefully a widget will never need a widgetName which is different from both targetType and widgetType (AC)
    //this.widgetName = "";   // the text string used in a generated command to name this type of widget e.g. "documentWorklet"
	this.subcomponentName = "";	// the text string used in a generated command to label this type of subcomponent of this widget e.g. "button"
	this.subcomponentLabel = "";	// the text label used in a generated command to label this type of subcomponent e.g. "addComment"
									// When the subcomponentName is not a common, overloaded name, like "button" 
									//	the subcomponentLabel will be null e.g. when subcomponentName = "body" in a documentWorklet
	this.multipleP = false;		// can there be more than one of this type of subcomponent in this widget?
	this.makeVisible = null;	// If a user action is required to make this subcomponent visible, the value of makeVisible is an array with
							//	index 0 is a string naming the event, such as "onmouseenters", and
							//	index 1 is the target of that event
									
	// this instance of the widget
	this.subcomponentNode = null;	// the html node that is the target 
	this.widgetNode = null;		// the html node for the dojo widget that contains this subcomponent target node
	this.widgetDisambiguator = "";	// If this widget instance is not uniquely identified by its widgetLabel and targetType,
											//    this is the text string the handleEvent postprocessor in command-generator created to disambiguate this node.
	this.subcomponentDisambiguator = "";	// If multipleP is true, this subcomponent node may not be uniquely identified by its subcomponentName and subcomponentLabel,
											//    This is the text string used to disambiguate this subcomponent instance.
											//	(If subcomponentLabel is null, this will be used as the label in the generated command text
											//		So far, this hasn't occurred: any subcomponent with a special subcomponentName like "body" has so far never appeared more than once in its widget.) 
	this.initialState = null;	// e.g. current color, checkbox turned on, current text. 
	this.newState = null;		// after this event is executed
	// this.subcomponentWidgetTargetSpec = null;	// if the value of this instance of the subcomponent is itself a widget, this is a pointer to its widgetTargetSpec
	// this.parentWidgetTargetSpec = null;	// if this instance of the widget is being used as a subcomponent of some other widget, this is a pointer to its widgetTargetSpec
	return this ;
}

CoScripterCommand.prototype.DojoWidgetTargetSpec.prototype = {
	toString : function(){
		return this.toSlop();
 	},

    getAction : function(){
		if (typeof this.action == "object") {
			return this.turnOnP ? this.action[1] : this.action[0]
		}
        else return this.action;
    },

    getDisambiguator : function(){
        return this.disambiguator;
    },

	getTargetLabel : function(){
		return this.targetLabel
	},

	getOrdinal : function(){
		return this.ordinal;
	},

	getTargetType : function(){
		return this.targetType;
	},
	
	getClickLoc : function(){
		return this.clickLoc;
	},
	
	getClickLocX : function(){
		return this.getClickLoc().x;
	},
	
	getClickLocY : function(){
		return this.getClickLoc().y;
	},
	
	getWindowName : function(){
		return this.windowName
	},

	getWindowId : function(){
		return this.windowId;
	},

	getWindowType : function(){
		return this.windowType;
	},

	getWindowDescriptor : function(){
		if (this.getWindowName()) var windowDescriptor = " in the \"" + this.getWindowName() + "\" window"
		else if (this.getWindowId() == 0) windowDescriptor = " in the main window"
			else windowDescriptor = " in window #" + this.getWindowId()
		if (this.getWindowType() == "dialog") windowDescriptor = " in the dialog"
		if (this.getWindowId() == "BrowserPreferences") windowDescriptor = " in the \"BrowserPreferences\" window"
		return windowDescriptor;
	},

	toSlop : function(){
		var u = this.components.utils()
		var str = "";
		var type = this.subcomponentName || this.targetType
		
		// (AC) This method needs to be cleaned up:  it has evolved slowly as new widgets were added and is now convoluted.
		// Click commands assume that widget targetSpecs figure out the entire slop, which is a good idea.
		// ArtifactNode is particularly tricky: it is based on the inline editor dijit and requires a click in the widget to
		//create the INPUT node. So toSlop has to handle both a click and an enter command for this widget.
		// When cleaning up, it might be good to make Enter commands (and all commands) assume that widget targetSpecs figure out the entire slop.
		if (this.widgetClass == "artifactNode" && this.action == "click") return "click the " + this.targetLabel + " textbox"
		if (this.targetType == "textbox") {
            var targetLabelSlop = (this.targetLabel && (typeof this.targetLabel == "object")) ? this.targetLabel.toSlop() : this.targetLabel; 
			str += targetLabelSlop + " " + type
			return str;
		}

        var targetValueSlop = (this.targetValue && (typeof this.targetValue == "object")) ? this.targetValue.toSlop() : this.targetValue; 
		
		switch (type) {
				case "listbox" : str += "select " + targetValueSlop + "in"
					break;
                case "textbox" : str += "enter" + targetValueSlop + "into"
                    break;
                case "item" : 
                case "section" : 
                case "checkbox" : 
                case "color" : 
                case "menuitem" : 
                case "tab" : 
				    str += this.getAction()
                    break;
				default : str += "click"
				}
		//labelSlop = this.subcomponentLabel ? "\"" + this.subcomponentLabel.toSlop() + "\"" : this.subcomponentLabel
		var subcomponentSlop = ""
        var subcomponentLabelSlop = (this.subcomponentLabel && (typeof this.subcomponentLabel == "object")) ? this.subcomponentLabel.toSlop() : this.subcomponentLabel; 
		if (subcomponentLabelSlop && subcomponentLabelSlop != '""') subcomponentSlop = " the " + subcomponentLabelSlop + " " + type
        else if (this.subcomponentName) subcomponentSlop = " the " + type
		// targetType of tabContainer is null, since it is used for layout and we don't want it included in the generated command
		// targetType is, eg "section"
		var mainTargetSlop = ""
		if (this.targetType != "") {
			if (this.widgetDisambiguator) mainTargetSlop =  " the \"" + this.widgetDisambiguator + "\"'s " + this.targetLabel.toSlop() + " " + this.targetType
			else if (this.ordinal) mainTargetSlop =  " the " + u.getOrdinal(this.getOrdinal()) + " " + this.targetLabel.toSlop() + " " + this.targetType
			else mainTargetSlop =  " the " + this.targetLabel.toSlop() + " " + this.targetType
		}
		var targetSlop = ""
		if (!mainTargetSlop) targetSlop = subcomponentSlop
		else if (!subcomponentSlop) targetSlop = mainTargetSlop
		else targetSlop = subcomponentSlop + " of " + mainTargetSlop
		
		return str + targetSlop;
	},
	
	variabilize : function(database) {
		if (this.subcomponentLabel && (typeof this.subcomponentLabel == "object")) this.subcomponentLabel.variabilize(database);
		if (this.targetLabel && (typeof this.targetLabel == "object")) this.targetLabel.variabilize(database);
		if (this.targetValue && (typeof this.targetValue == "object")) this.targetValue.variabilize(database);
	},

	fillInVars : function(database) {
		this.subcomponentLabel.fillInVars(database);
		this.targetLabel.fillInVars(database);
		this.targetValue.fillInVars(database);
	},

	hasNeededVars : function() {
		return (this.subcomponentLabel.hasNeededVars() && this.targetLabel.hasNeededVars() && this.targetValue.hasNeededVars())
	},

	getNeedVar : function() {
		return (this.subcomponentLabel.getNeedVar() && this.targetLabel.getNeedVar() && this.targetValue.getNeedVar())
	}
}


// ===================================
// =========== VariableValue =========
// ===================================
CoScripterCommand.prototype.VariableValue = function(literal) {
	if (typeof(literal) != "undefined")
		this.literal = literal;	// e.g. "submit"
	else
		this.literal = null;
	this.dbkey = null;
	this.dbval = null;
	this.secret = false;	// default to "not secret"
	this._needsvar = false;
	this._matchtype = null;
    this.components = Components.classes["@coscripter.ibm.com/registry;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
	return this;
}

CoScripterCommand.prototype.VariableValue.prototype = {
	// Set the needsvar variable, which determines whether this reference
	// is a literal (false) or needs a database variable to be complete (true)
	setNeedVar : function(val) {
		this._needsvar = val;
	},
	getNeedVar : function() {
		return this._needsvar;
	},

	// Returns whether or not this variable has the values needed
	hasNeededVars : function() {
		// If we don't need a variable, always return true
		if (!this._needsvar) return true;
		// Otherwise return true iff the value was found
		return (this.dbval != null);
	},

	isSecret : function() {
		return this.secret;
	},

	// Takes this.literal and tries to find a database key that has it as a
	// value; if so, sets this up as a variable.
	// (AC) For a tab dijit this.literal' is an object, which seems right.
	// So in that case I use its textContent.  
	variabilize : function(database) {
		if (this.literal != null) {
			var literalValue = (typeof this.literal == 'object') ? this.literal.textContent : this.literal
			var dbEntry = database.inverseLookupEntry(this.literal);
			if ( dbEntry ) {
				this.dbkey = dbEntry.ident.string;	//e.g. "work email"
				this.secret = dbEntry.secret;
				this._needsvar = true;
			}
		}
	},

	fillInVars : function(database) {
		// Look up this.dbkey in the database and retrieve the value
		if (this._needsvar && this.dbkey != null) {
			var entry = { key : this.dbkey, value : "" };
			database.lookupAlgorithm3Entry(entry);
			if (entry.value) {
				this.dbval = entry.value;
				this.secret = entry.secret;
			}
			// FYI, entry.secret is whether it was secret or not
		}
	},

	// Returns the sloppy version of this variable reference
	//
	// isPassword?  needVar?		secret key?     result
	// Y              N				-				"your password"
	// N              N				-				literal string
	// Y              Y				Y				your "dbkey"
	// Y              Y				N				your "dbkey"
	// N              Y				N				your "dbkey" (e.g.  "value")
	// N              Y				Y				your "dbkey"
	toString : function() {
		if (this.dbkey != null) {
			var ret = 'your "' + this.dbkey + '"'; 
			/* don't include "e.g." any more -- it's too likely to be info the script creator doesn't want to share (AC)
			if (!this.secret && !isPassword) {
				ret += ' (e.g., ' + this.literal + ')';
			}
			*/
			return ret;
		} else {
			// use the literal value
			if (null == this.literal) {
				return "";
			} else {
				// this.literal can either be a string or a RegExp object
				// This is really stupid, but we can't check that using "instanceof".
				if (typeof(this.literal.test) == "function") {
					// If it's a regex
					return 'r"' + this.escapeQuotes(this.literal.source) + '"';
				} else {
					// Otherwise it's a string
					return "\"" + this.escapeQuotes(this.literal) + "\"";
				}
			}
		}
	},

	toSlop : function() {
		return this.toString();
	},

	/**
	 * Return the value of this variable when needed for execution.
	 * The "useRegExp" flag, if false, will not encase the value in a
	 * RegExp object (which is necessary for the findRegionElement method
	 * in the labeler).  The default behavior is to return a RegExp object
	 * in some conditions.
	 */
	// variableValue is used for labels. In that case, the value can come from a literal, the personal db, a regexp or javascript.
	// That value can either be used directly or after a partial match phrase such as "contains" or "ends with" (AC)
	getValue : function(useRegExp) {
		if (typeof(useRegExp) == "undefined") {
			// default if not specified
			useRegExp = true;
		}

		var varValue = null
		if (this._needsvar) {	// db value
			varValue = this.dbval;
		} else if (this.literal !== null && typeof(this.literal.test) == "function") { // regexp
			varValue = this.literal;
		} else if (this.type == this.components.commands().TARGETAREATYPE.SCRATCHTABLE) {
			var scratchSpaceUI = this.components.utils().getCurrentCoScripterWindow().coscripter.scratchSpaceUI
			var scratchSpaceEditor = scratchSpaceUI.getEditor()
			if (!scratchSpaceEditor) return this.literal;	// this is a failure, but not sure that we should throw an error (AC)
			var scratchTableCellValue = scratchSpaceEditor.getData(0, parseInt(this.rowIndex)-1, parseInt(this.columnIndex)-1)
			varValue = scratchTableCellValue;
		} else {	// stringLiteral
			varValue =  this.literal;
		}
		
		// check for a partial match phrase
		if (this.getMatchType() != null && useRegExp) {
			if (this.getMatchType() == this.components.parser().ParserConstants.CONTAINS) {
				return new RegExp(".*" + varValue + ".*");
			} else if (this.getMatchType() == this.components.parser().ParserConstants.STARTSWITH) {
				return new RegExp("^" + varValue + ".*");
			} else if (this.getMatchType() == this.components.parser().ParserConstants.ENDSWITH) {
				return new RegExp(".*" + varValue + "$" );
			} else throw "variableValue getValue Exception: unknown matchtype "
		}
		else return varValue
	},

	escapeQuotes : function(s) {
		if (s != null)
			return s.replace("\"", "\\\"", "g");
		else
			return s;
	},

	setVarOrVal : function(val) {
		if (this._needsvar) {
			this.dbkey = val;
		} else {
			this.literal = val;
		}
	},

	setMatchType : function(type) {
		this._matchtype = type;
	},

	getMatchType : function(type) {
		return this._matchtype;
	}

}

// ======================================================================
// object constructor

const nsISupports = Components.interfaces.nsISupports;

function CoScripterCommand()
{
	// nothing to do for this object

	this.wrappedJSObject = this;
	return this;
}

CoScripterCommand.prototype.QueryInterface = function(aIID)
{
    // add any other interfaces you support here
    if (!aIID.equals(nsISupports))
        throw Components.results.NS_ERROR_NO_INTERFACE;
    return this;
}


// You can change these if you like
const CLASS_ID = Components.ID("8c40934e-1731-48fe-9488-e28fef046cc2");
const CLASS_NAME = "Coscripter Commands";
const CONTRACT_ID = "@coscripter.ibm.com/coscripter-command;1";


//=================================================
// Note: You probably don't want to edit anything
// below this unless you know what you're doing.
//
// Factory
var CoScripterCommandFactory = {
  singleton : null,
  createInstance: function (aOuter, aIID)
  {
    if (aOuter != null)
      throw Components.results.NS_ERROR_NO_AGGREGATION;
    if (this.singleton == null)
      this.singleton = new CoScripterCommand();
    return this.singleton.QueryInterface(aIID);
  }
};

// Module
var CoScripterCommandModule = {
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
      return CoScripterCommandFactory;

    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  canUnload: function(aCompMgr) { return true; }
};

//module initialization
function NSGetModule(aCompMgr, aFileSpec) { return CoScripterCommandModule; }

//dump('Done Parsing coscripter-command.js component\n');
