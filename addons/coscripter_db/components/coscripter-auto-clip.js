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
Contributor(s): Tessa Lau <tessalau@us.ibm.com> 

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
const CLASS_ID = Components.ID("4eb057fe-af43-4163-93da-bb18949f0749");
const CLASS_NAME = "CoScripter Automatic clipper";
const CONTRACT_ID = "@coscripter.ibm.com/auto-clip;1";

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
		consoleService.logStringMessage("coscripter-auto-clip.js: " + msg );
	}else if(Preferences.DO_DUMP_DEBUGGING){
		dump("coscripter-auto-clip.js: " + msg + "\n");
	}
}

//////////////////////////////////////////////////////////////////////
// Auto-clip code

function getAutoClip(){
	return Components.classes["@coscripter.ibm.com/auto-clip;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
}

function AutoClip() {
    // Component registry
    this.components = Components.classes["@coscripter.ibm.com/registry;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;

	// Boilerplate
	this.wrappedJSObject=this;
	return this;
}

AutoClip.prototype ={
	QueryInterface: function(aIID){
		// add any other interfaces you support here
		if (!aIID.equals(nsISupports))
			throw Components.results.NS_ERROR_NO_INTERFACE;
		return this;
	},

	/**
	 * Pretty-print a message with the specified indentation depth
	 */
	pp : function(depth, msg) {
		// commented out for production
		return;
		for (var j=0; j<depth; j++) {
			debug(' ');
		}
		debug(msg + '\n');
	},

	/**
	 * Return the alignment of a domnode.  Alignment is defined to be "x"
	 * if all children of the node share the same X coordinate, "y" if the
	 * children have the same Y coordinate, or "null" if neither condition
	 * holds
	 * Returns: "x", "y", or null
	 */
	getAlignment : function(domnode, depth) {
		this.pp(depth, 'getting alignment of ' + domnode.nodeName);
		var doc = domnode.ownerDocument;
		var alignment = null;
		var xAligned = true;
		var yAligned = true;

		// This node is a leaf
		if (domnode.childNodes.length === 0) {
			this.pp(depth, 'returning null');
			return null;
		}

		// Otherwise, it is not a leaf

		var xFirst = -1;
		var yFirst = -1;
		var onlyOneChild = true;
		var child_align = null;

		for (var i=0; i<domnode.childNodes.length; i++) {
			var child = domnode.childNodes[i];

			// Ignore children that have no geometry
			if (typeof(child.offsetLeft) == "undefined") continue;

			this.pp(depth, 'child: ' + child);
			var box = doc.getBoxObjectFor(child);
			var childX = box.x;
			var childY = box.y;
			this.pp(depth, "BOX X: " + childX + ',' + childY + '/' +
				box.width + 'x' + box.height);

			// don't use position of 0x0-sized elements
			if (box.width === 0 && box.height === 0) continue;

			child_align = this.getAlignment(child, depth+1);

			if (xFirst == -1) {
				// Found first child with coordinates
				xFirst = childX;
				yFirst = childY;
				this.pp(depth, 'first offsets: ' + xFirst + ',' + yFirst);
				continue;
			}

			onlyOneChild = false;

			xAligned = xAligned && (childX == xFirst) && (
				child_align == null || child_align == "x");
			yAligned = yAligned && (childY == yFirst) && (
				child_align == null || child_align == "y");
			this.pp(depth, "xAlign: " + xAligned + ' yAlign: ' + yAligned);
		}

		if (onlyOneChild) {
			this.pp(depth, "Only one child, returning child alignment: " +
				child_align);
			return child_align;
		} else if (xAligned) {
			this.pp(depth, 'Returning x aligned');
			return "x";
		} else if (yAligned) {
			this.pp(depth, 'Returning y aligned');
			return "y";
		} else {
			this.pp(depth, 'Returning not aligned');
			return null;
		}
	},

	/**
	 * Find and return a list of all "blocks" residing within the given DOM
	 * node.  A block is defined as a maximal grouping of DOM nodes such
	 * that all nodes within the block have a consistent alignment.
	 */
	findBlocks : function(node) {
		var result = new Array();
		this.findBlocksHelper(node, result);
		return result;
	},

	/**
	 * Helper function for the findBlocks call above
	 */
	findBlocksHelper : function(node, results) {
		var isConsistent = true;
		for (var i=0; i<node.childNodes.length; i++) {
			var child = node.childNodes[i];
			if (child.childNodes.length > 0) {
				// it's not a leaf
				this.findBlocksHelper(child, results);
				if (this.getAlignment(child) == null) {
					isConsistent = false;
				}
			}
		}

		if (!isConsistent) {
			for (var j=0; j<node.childNodes.length; j++) {
				var child = node.childNodes[j];
				if (this.getAlignment(child) != null) {
					results.push(child);
				}
			}
		} else {
			var alignment = this.getAlignment(node);
			if (alignment === null) {
				for (var k=0; k<node.childNodes.length; k++) {
					var ch = node.childNodes[k];
					if (this.getAlignment(ch) != null) {
						results.push(ch);
					}
				}
			}
		}
	},

	/**
	 * Find the "best" block out of a list of blocks given the
	 * previously-executed CoScripter command.  Best is determined using
	 * text matching over the words in the command, under the assumption
	 * that the most relevant block is the one that contains the most words
	 * in the command that got you to this page.  This will return the one
	 * block that best matches the command.
	 */
	findBestBlock : function(blocks, cmd) {
		var maxscore = -1;
		var bestBlock = null;
		var score;
		for (var i=0; i<blocks.length; i++) {
			score = this.scoreBlock(blocks[i], cmd);
			if (score > maxscore) {
				bestBlock = blocks[i];
				maxscore = score;
			}
		}

		return bestBlock;
	},

	/**
	 * Given a block (== DOM node) and a CoScripter command, determine the
	 * similarity of the block to the specified text by using a simple
	 * word-overlap metric.  Returns a value in the range [0, 1].
	 */
	scoreBlock : function(block, sourcetext) {
		var labeler = this.components.labeler();
		var text = labeler.getText(block, true);
		if (text == null) return 0.0;
		var words = text.split(/\W+/);
		var dict = {};
		var scoreCount = 0;

		// Pull out the words in the command
		var cmdWords = sourcetext.split(/\W+/);
		var cmdWordHash = {};
		for (var i=0; i<cmdWords.length; i++) {
			cmdWordHash[cmdWords[i]] = true;
		}

		for (var i=0; i<words.length; i++) {
			var word = words[i];
			if (cmdWordHash[word] == true) {
				scoreCount += 1;
			}
		}

		var score = 1.0 * scoreCount / cmdWords.length;
		return score;
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
var AutoClipFactory = {
	singleton : null,
	createInstance: function (outer, iid)
	{
		if (outer !== null)
			throw Components.results.NS_ERROR_NO_AGGREGATION;
		if (this.singleton === null)
			this.singleton = new AutoClip();
		return this.singleton.QueryInterface(iid);
	}
};


// Module
var AutoClipModule = {
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
			return AutoClipFactory;
		throw Components.results.NS_ERROR_NO_INTERFACE;
	},

	canUnload: function(aCompMgr) { return true; }
};

//module initialization
function NSGetModule(aCompMgr, aFileSpec) { return AutoClipModule; }

