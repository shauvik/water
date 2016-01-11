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

const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
const nsISupports = Components.interfaces.nsISupports;
const CC = Components.classes, CI = Components.interfaces, CIS = CI.nsISupports;

var gUtils = null ; // global utils object to cache the components call 
function getUtils() {
	if(gUtils == null) {
		gUtils = CC["@coscripter.ibm.com/coscripter-utils/;1"].getService(CIS).wrappedJSObject ;
	}
	return gUtils ;
}
var consoleService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);


////////////////////////////////////////////////////////////////////////////////
// VegemiteTable object
//
// row and column indices are 0-based
//
// (RE)LOADING DATA
//
// void     loadDataFromPage : function(tableElement)
//
// SAVING DATA TO SOURCE
// 
// bool     isSaveAvailable : function()
// void     saveToSource : function(callback) - this will be async
// 
// EVENTS
//
// void     addDataChangeListener : function(callback) - callback takes 4 parameters: rowIndex, columnIndex, oldValue, newValue
// void     addDataLoadListener : function(callback)
// void     addDataSaveListener : function(callback)

// inspects and loads the data from the table element into this object's
// internal data model
// TODO replace scriptElem parameter with an array
VegemiteTable = function(tableElem, tableId, scriptElemOrScratchSpaceUrl) {
	// Instance variables
	this.tableElem = null; // HTMLTableElement
	this.tableId = tableId;
	this.scriptListElem = null; // DOMElement
	this.scratchSpace = null; // string (URL)
	
	this.columnNames = [];  // of strings
	this.columnNameToNum = {};  // of string->[int]
	this.rowNames = [];  // of strings
	this.rowNameToNum = {};  // of string->[int]
	
	this.data = []; // 2-D array of strings
	this.scripts = []; // of {url: string, name: string}
	
	this.listeners = {}; // listener type (string) -> [functions]
	
	this.fireEvents = true;

	this.loadDataFromPage(tableElem);
	if (typeof scriptElemOrScratchSpaceUrl == "string") {
		this.loadScriptsFromScratchSpace(scriptElemOrScratchSpaceUrl);
	}
	else if (scriptElemOrScratchSpaceUrl != null) {
		this.loadScriptsFromPage(scriptElemOrScratchSpaceUrl);
	}
}

VegemiteTable.prototype = {

	////////////////////////////////////////////////////////////
	// Constants
	
	
	////////////////////////////////////////////////////////////
	// Methods

	// function getId(): string
	getId: function() {
		return this.tableId;
	},
	
	// function addColumn(columnName=null: string): void
	addColumn: function(columnName) {
		var columnNum = this.columnNames.length;
		
		if (columnName == null) {
			columnName = this.columnNames.length.toString();
		}
		
		this.columnNames.push(columnName);
		this._setColumnNameHelper(columnNum, columnName);			
		
		// add the new column to each row
		for (var i = 0; i < this.data.length; i++) {
			var row = this.data[i];
			row.push("");
		}
		
		this._fireEvent("columnAdded", {index: columnNum});
	},
	
	
	// function getColumnCount(): int
	getColumnCount: function() {
		return this.columnNames.length;
	},
	
	
	// function getColumnNameAt(index: int): string
	getColumnNameAt: function(index) {
		return this.columnNames[index];
	},

	// private function setColumnNameHelper(index: int, name: string): void
	_setColumnNameHelper: function(index, name) {
		// Sets the new column name without dealing with any old names
		this.columnNames[index] = name;
		var lowerCaseColumnName = name.toLowerCase();
		if (!this.columnNameToNum[lowerCaseColumnName]) {
			this.columnNameToNum[lowerCaseColumnName] = [];
		}
		this.columnNameToNum[lowerCaseColumnName].push(index);
		this.columnNameToNum[lowerCaseColumnName].sort(function(a, b) {return a - b});
	},
	
	
	// function setColumnNameAt(index: int, name: string): void
	setColumnNameAt: function(index, name) {
		// First, remove the old column name
		var oldColumnNameLowerCase = this.getColumnNameAt(index).toLowerCase();
		var oldColumnNameIndices = this.columnNameToNum[oldColumnNameLowerCase];
		
		for (var i = 0, n = oldColumnNameIndices.length; i < n; i++) {
			if (oldColumnNameIndices[i] == index) {
				oldColumnNameIndices.splice(i, 1);
				break;
			}
		}
		if (oldColumnNameIndices.length == 0) {
			delete this.columnNameToNum[oldColumnNameLowerCase];
		}
		
		// Now set the new column name
		this._setColumnNameHelper(index, name);
	},
	
	
	// function getColumnNameOccurrenceAt(index: int): int?
	getColumnNameOccurrenceAt: function(index) {
		var lowerCaseColumnName = this.columnNames[index].toLowerCase();
		for (var i = 0, n = this.columnNameToNum[lowerCaseColumnName].length; i < n; i++) {
			if (this.columnNameToNum[lowerCaseColumnName][i] == index) {
				return i + 1;
			}
		}
		return null;
	},
	
	// function addRow(): void
	addRow: function() {
		var newRow = [];
		for (var i = 0; i < this.columnNames.length; i++) {
			newRow.push("");
		}
		
		this.data.push(newRow);
		
		this._fireEvent("rowAdded", {index: this.data.length - 1});
	},
	
	// function getRowCount(): int
	getRowCount: function() {
		return this.data.length;
	},
	
	
	// function getDataAt(rowIndex: int, columnIndex: int): string
	getDataAt: function(rowIndex, columnIndex) {
		return this.data[rowIndex][columnIndex];
	},
	
	
	// function setDataAt(rowIndex: int, columnIndex: int, stringValue: string): void
	setDataAt: function(rowIndex, columnIndex, stringValue) {
		var oldValue = this.getDataAt(rowIndex, columnIndex);
		this.data[rowIndex][columnIndex] = stringValue;
		this._fireEvent("dataChanged", {
			rowIndex: rowIndex,
			columnIndex: columnIndex,
			oldValue: oldValue,
			newValue: stringValue
		});
	},
	
	
	// function addScript(script: {url: string, name: string}, index=null: int?): void
	addScript: function(script, index) {
		var existingIndex = this.getScriptIndex(script);
		if (existingIndex == -1) {
			if (index == null) {
				this.scripts.push(script);
			}
			else {
				this.scripts.splice(index, 0, script);
			}
			var that = this;
			this._fireEvent("scriptAdded", {source: that, index: index, script: script});
			if (index == null) {
				return this.scripts.length - 1;
			}
			else {
				return index;
			}
		}
		else {
			return existingIndex; 
		}
	},
	
	// function removeScript(index: int): {url: string, name: string}
	removeScript: function(index) {
		return this.scripts.splice(index, 1);
	},

	// function getScript(index: int): {url: string, name: string} 
	getScript: function(index) {
		return this.scripts[index];
	},
	
	// function getScriptCount(): int
	getScriptCount: function() {
		return this.scripts.length;
	},

	// function getScriptIndex: function(script: {url: string, name: string}): int
	getScriptIndex: function(script) {
		var existingIndex = -1;
		for (var i = 0, n = this.getScriptCount(); i < n; i++) {
			var existingScript = this.getScript(i);
			if (existingScript.url == script.url) {
				existingIndex = i;
			}
		}
		return existingIndex;
	},
	
	// function getColumnIndicesWithName(columnName): [int]
	getColumnIndicesWithName: function(columnName) {
		var lowerCaseColumnName = columnName.toLowerCase();
		return this.columnNameToNum[lowerCaseColumnName] || [];
	},
	
	// function getColumnIndex(columnName: string, columnNameOccurrence: int?): int
	getColumnIndex: function(columnName, columnNameOccurrence) {
		var columnNameOccurrenceIndex;
		if (columnNameOccurrence == null) {
			columnNameOccurrenceIndex = 0;
		}
		else {
			columnNameOccurrenceIndex = columnNameOccurrence - 1;
		}
		
		var columnIndices = this.getColumnIndicesWithName(columnName);
		if (columnNameOccurrenceIndex >= columnIndices.length) {
			return -1;
		}
		else {
			return columnIndices[columnNameOccurrenceIndex];
		}
	},
	
	
	// Used to resize the data table to a specific row/column size.
	//
	// private function modifyDataToSize(rowSize: int, columnSize: int): void
	_modifyDataToSize: function(rowSize, columnSize) {
		var columnChange = (columnSize != this.columnNames.length);
		var columnsShrink = (columnSize < this.columnNames.length);
		
		var rowChange = (rowSize != this.data.length);
		var rowsShrink = (rowSize < this.data.length);
		
		if (rowChange && rowsShrink) {
			// remove extra rows that we don't need anymore
			this.data.splice(rowSize, this.data.length - rowSize);
		}
		
		if (columnChange) {
			if (columnsShrink) {
				// remove extra columns that we don't need
				this.columnNames.splice(columnSize, this.columnNames.length - columnSize);
				
				for (var i = 0; i < this.data.length; i++) {
					this.data[i].splice(columnSize, this.columnNames.length - columnSize);
				}
			}
			else {
				// add extra column names (using numeric names)
				var numExtraColumns = columnSize - this.columnNames.length;
				for (var i = 0; i < numExtraColumns; i++) {
					this.columnNames.push(this.columnNames.length.toString());
				}
				
				// add extra columns with empty data to the existing rows
				for (var i = 0; i < this.data.length; i++) {
					var data = this.data[i];
					for (var j = 0; j < numExtraColumns; j++) {
						data.push("");
					}
				}
			}
		}
		
		if (rowChange && !rowsShrink) {
			// add rows
			var numExtraRows = rowSize - this.data.length;
			for (var i = 0; i < numExtraRows; i++) {
				var newRow = [];
				for (var j = 0; j < columnSize; j++) {
					newRow.push("");
				}
				
				this.data.push(newRow);
			}
		}
	},
	
	//	function loadDataFromPage(tableElem: DOMElement): void
	loadDataFromPage: function(tableElem) {
		this.tableElem = tableElem;
		
		var u = getUtils()
		var doc = u.getDocumentWithEvaluate(this.tableElem)
		if (!doc) 
			debug("scratch-table's loadDataFromPage can't find a document")
		
		var rows = u.getNodes('descendant::tr', this.tableElem)
		if (rows.length == 0) {
			return;
		}
		
		var columns = u.getNodes('descendant::th|td', rows[0])
		
		// Extract header row, if any
		var headerRowEntries = u.getNodes('descendant::th', rows[0])
		if (headerRowEntries != null) {
			rows.shift();
			for (var c = 0; c < headerRowEntries.length; c++) {
				this.addColumn(u.trim(headerRowEntries[c].textContent)) // or perhaps .childNodes
			}
		}
		
		this._modifyDataToSize(rows.length, columns.length)
		
		//fill in the cell data
		for (var r = 0; r < this.getRowCount(); r++) {
			var row = rows[r]
			var entries = u.getNodes('descendant::th|td', row)
			for (var c = 0; c < this.getColumnCount(); c++) {
				this.setDataAt(r, c, u.trim(entries[c].textContent)) // or perhaps .childNodes
			}
		}
	},

	loadDataFromScratchSpace: function(scratchSpaceUrl) {
		//TODO
		// scratchSpaceUrl will have the format:
		// http://coscripter.almaden.ibm.com/coscripter/api/data/1000/script/2
		//
		// read JSON data from scratchSpaceUrl, which is a list of {url: string, name: string}
		// add each to this.scripts
	},
	
	loadScriptsFromPage: function(list) {
		// Assumes that list is an OL or UL with LI child nodes
		// Each LI node consists of an A with the name of the script as A's child
		this.scriptListElem = list;
		var doc = list.ownerDocument;
		var itemResult = doc.evaluate("li", list, null, 7 /*XPathResult.ORDERED_NODE_SNAPSHOT_TYPE*/, null);
		for (var i = 0; i < itemResult.snapshotLength; i++) {
			var item = itemResult.snapshotItem(i);
			var link = doc.evaluate("a", item, null, 9 /*XPathResult.FIRST_NODE_SNAPSHOT_TYPE*/, null).singleNodeValue;
			if (link != null) {
				var name = link.textContent;
				var url = link.href;
				this.addScript({url: url, name: name});
			}
		}
	},
	
	setFireEvents: function(flag) {
		this.fireEvents = flag;
	},
	
	_getListeners: function(eventType) {
		var listenersForEventType = this.listeners[eventType];
		if (listenersForEventType == null) {
			listenersForEventType = [];
			this.listeners[eventType] = listenersForEventType;
		}
		return listenersForEventType;
	},
	
	addEventListener: function(eventType, listener) {
		this._getListeners(eventType).push(listener);
	},
	
	removeEventListener: function(eventType, listener) {
		var listenersForEventType = this._getListeners(eventType);
		for (var i = listenersForEventType.length - 1; i >= 0; i--) {
			if (listenersForEventType[i] == listener) {
				listenersForEventType.splice(i, 1);
			}
		}
	},

	_fireEvent: function(eventType, eventObject) {
		if (this.fireEvents) {
			var listenersForEventType = this._getListeners(eventType);
			for (var i = 0, n = listenersForEventType.length; i < n; i++) {
				var listener = listenersForEventType[i];
				listener(eventObject);
			}
		}
	}
}

ScratchTableService = function() {
	// Add any initialisation for your component here.
	this.wrappedJSObject = this;
}

ScratchTableService.prototype = {
	createTable: function(tableElem, tableId, scriptElemOrScratchSpaceUrl) {
		return new VegemiteTable(tableElem, tableId, scriptElemOrScratchSpaceUrl)
	},
	
////////////////////////////////////////////////////////////////////////////////
// the code below is based on template from:
// developer.mozilla.org/en/docs/Code_snippets:JS_XPCOM
// template had the license: MIT License 

	QueryInterface: function(iid) {
		if (iid.equals(Components.interfaces.nsISupports)) {
			return this;
		}
		else {
			throw Components.results.NS_ERROR_NO_INTERFACE;
		}
	}
}

var initModule = {
	ServiceCID: Components.ID("{fcb73aa0-228f-45ad-85c2-51269b471b57}"),  // Insert a guid in the quotes
	ServiceContractID: "@coscripter.ibm.com/coscripter-scratch-table/;1",                          // Insert a contract ID in the quotes
	ServiceName: "coscripter-scratch-table",                                                      // Insert your own name in the quotes
	
	registerSelf : function(compMgr, fileSpec, location, type) {
		compMgr = compMgr.QueryInterface(CI.nsIComponentRegistrar);
		compMgr.registerFactoryLocation(this.ServiceCID,this.ServiceName,this.ServiceContractID,
			fileSpec,location,type);
	},

	unregisterSelf : function(compMgr, fileSpec, location) {
		compMgr = compMgr.QueryInterface(CI.nsIComponentRegistrar);
		compMgr.unregisterFactoryLocation(this.ServiceCID,fileSpec);
	},

	getClassObject : function(compMgr, cid, iid) {
		if (!cid.equals(this.ServiceCID))
			throw Components.results.NS_ERROR_NO_INTERFACE
		if (!iid.equals(Components.interfaces.nsIFactory))
			throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
		return this.instanceFactory;
	},

	canUnload : function(compMgr) {
		return true;
	},

	instanceFactory: {
		singleton : null,
		createInstance: function (outer, iid)
		{
			if (outer != null)
				throw Components.results.NS_ERROR_NO_AGGREGATION;
			if (this.singleton == null)
				this.singleton = new ScratchTableService();
			return this.singleton.QueryInterface(iid);
		}
	}
}; //Module

function NSGetModule(compMgr, fileSpec) {
	return initModule;
}
