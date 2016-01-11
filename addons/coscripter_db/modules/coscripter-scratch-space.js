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

//////////////////////////
//
//	ScratchSpaceUtils
//		loadSpaceFromServer
//		saveSpaceToServer
//
//	ScratchSpace object
//
//	ScratchSpaceTable object
//
//////////////////////////

const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
const nsISupports = Components.interfaces.nsISupports;
const CC = Components.classes, CI = Components.interfaces, CIS = CI.nsISupports;

var gUtils = null; // global utils object to cache the components call 
function getUtils() {
	if (gUtils == null) {
		gUtils = CC["@coscripter.ibm.com/coscripter-utils/;1"].getService(CIS).wrappedJSObject;
	}
	return gUtils;
}
var consoleService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);
var nativeJSON = CC["@mozilla.org/dom/json;1"].createInstance(CI.nsIJSON);

var EXPORTED_SYMBOLS = ["ScratchSpace", "ScratchSpaceTable", "ScratchSpaceUtils"];


//	ScratchSpaceUtils
ScratchSpaceUtils = {
	/**
	 * @param {Object} data    an object of the form:
	 * {
	 *    title: String,
	 *    description: String,
	 *    ownerId: String,
	 *    spaceIsPrivate: String,
	 *    tables: []
	 * }
	 * 
	 * and where each item in tables is of the form:
	 * {
	 *     title: String,
	 *     data: [], // of [] of Strings
	 *     notes: String,
	 *     scriptData: [] // of {id: int, title: string}
	 *     log: String
	 * }
	 * 
	 */
	createScratchSpace: function(params) {
		params = params || {};
		
		var tables;
		if (params.tables) {
			tables = [];
			for (var i = 0, n = params.tables.length; i < n; i++) {
				var paramsTable = params.tables[i];
				var newTableData = {
					id: paramsTable.id,
					title: paramsTable.title,
					data: paramsTable.data,
					notes: paramsTable.notes,
					scripts: [],
					log: []
				}
				for (var j = 0, m = params.tables[i].scriptData.length; j < m; j++) {
					var scriptData = params.tables[i].scriptData[j];
					var scriptUrl = getUtils().getKoalescenceAPIFunction('script/' + scriptData.id);
					newTableData.scripts.push({url: scriptUrl, title: scriptData.title});
				}
				if (params.tables[i].log) {
					var logLines = params.tables[i].log.split('\n');
					for (var k = 0, nk = logLines.length; k < nk; k++) {
						var logLine = logLines[k];
						var action = ScratchSpaceTable.Action.parse(logLine);
						newTableData.log.push(action);
					}
				}
				tables.push(newTableData);
			}
		}
		else {
			tables = [{title: "Tab 1", data: [["Col 1"], [""]], notes: "", scripts: [], log: []}]
		}
		
		return new ScratchSpace(
			params.id || null,
			params.title || "Untitled Table",
			params.description || "",
			params.ownerId || null,
			params.spaceIsPrivate || true,
			tables
		);
	},
	
	//	function loadDataFromPage(tableElem: DOMElement): void
	extractDataFromPage: function(tableElem) {
		var newData = [];
		this.tableElem = tableElem;
		
		var u = getUtils();
		var doc = u.getDocumentWithEvaluate(this.tableElem);
		if (!doc) {
			consoleService.logStringMessage("scratch-table's loadDataFromPage can't find a document");
			return;
		}
		
		var rows = u.getNodes('descendant::tr', this.tableElem)
		if (rows.length == 0) {
			return;
		}
		
		var columns = u.getNodes('descendant::th|td', rows[0])
		
		// Extract header row, if any
		var headerRowEntries = u.getNodes('descendant::th', rows[0])
		if (headerRowEntries != null) {
			rows.shift();
			var colHeaders = [];
			for (var c = 0; c < headerRowEntries.length; c++) {
				colHeaders.push(u.trim(headerRowEntries[c].textContent)) // or perhaps .childNodes
			}
			newData.push(colHeaders);
		}
		
		
		//fill in the cell data
		for (var r = 0; r < rows.length; r++) {
			var row = rows[r]
			var entries = u.getNodes('descendant::th|td', row)
			var rowData = [];
			for (var c = 0; c < columns.length; c++) {
				rowData.push(u.trim(entries[c].textContent)) // or perhaps .childNodes
			}
			newData.push(rowData);
		}
		
		return newData;
	},

	extractScriptsFromPage: function(listElem) {
		// Assumes that list is an OL or UL with LI child nodes
		// Each LI node consists of an A with the name of the script as A's child
		var scripts = [];
		var doc = listElem.ownerDocument;
		var itemResult = doc.evaluate("li", listElem, null, 7 /*XPathResult.ORDERED_NODE_SNAPSHOT_TYPE*/, null);
		for (var i = 0; i < itemResult.snapshotLength; i++) {
			var item = itemResult.snapshotItem(i);
			var link = doc.evaluate("a", item, null, 9 /*XPathResult.FIRST_NODE_SNAPSHOT_TYPE*/, null).singleNodeValue;
			if (link != null) {
				var name = link.textContent;
				var url = link.href;
				scripts.push({url: url, name: name});
			}
		}
		return scripts;
	},

	getSpacesFromServer: function(cb) {
		var url = getUtils().getKoalescenceAPIFunction('scratch_spaces');
		
		var response = getUtils().loadJSONWithStatus(url, function(success, statusCode, data) {
			if (success) {
				cb(data);
			}
			else {
				cb(null);
			}
		});
	},

//		loadSpaceFromServer
	loadSpaceFromServer: function(scratchSpaceId, cb) {
		var url = getUtils().getKoalescenceAPIFunction('scratch_space/' + scratchSpaceId);
		
		var response = getUtils().loadJSONWithStatus(url, function(success, statusCode, scratchSpaceData) {
			if (success) {
				for (var i = 0, n = scratchSpaceData.tables.length; i < n; i++) {
					var table = scratchSpaceData.tables[i];
					table.data = nativeJSON.decode(table.dataJson);
				}
				var scratchSpace = ScratchSpaceUtils.createScratchSpace(scratchSpaceData);
				cb(scratchSpace);
			}
			else {
				cb(null);
			}
		});
	},
	
//		deleteSpaceFromServer
	deleteSpaceFromServer: function(scratchSpaceId) {
		var url = getUtils().getKoalescenceAPIFunction('delete_scratch_space/' + scratchSpaceId);
		var response = getUtils().post(url, {})
		return (response[0] == 200)
	},
	
	serializeTable: function(table) {
		// Save columns
		var data = [];
		var colHeaders = [];
		for (var colNum = 0, numCols = table.getColumnCount(); colNum < numCols; colNum++) {
			colHeaders.push(table.getColumnNameAt(colNum));
		}
		data.push(colHeaders);
		
		// Save data
		for (var rowNum = 0, numRows = table.getRowCount(); rowNum < numRows; rowNum++) {
			var row = [];
			for (var colNum = 0, numCols = table.getColumnCount(); colNum < numCols; colNum++) {
				row.push(table.getDataAt(rowNum, colNum));
			}
			data.push(row);
		}
		
		// Save scripts
		var scriptIds = [];
		for (var i = 0, n = table.getScriptCount(); i < n; i++) {
			var script = table.getScript(i);
			// Assume the ID of the script is the last part of the script's URL
			scriptIds.push(script.url.slice(script.url.lastIndexOf("/") + 1));
		}
		
		// Save log
		var logList = [];
		var log = table.getLog();
		for (var i = 0, n = log.length; i < n; i++) {
			logList.push(log[i].toString());
		}
		
		var serializedTable = {
			title: table.getTitle(),
			dataJson: nativeJSON.encode(data),
			notes: table.getNotes(),
			scriptIds: scriptIds,
			log: logList.join('\n')
		};
		var id = table.getId();
		if (id != null) {
			serializedTable.id = id;
		} 
		return serializedTable;
	},
	
//		saveSpaceToServer
	saveSpaceToServer: function(scratchSpace, cb) {
		var saveUrl;
		var httpMethod;
		
		if (scratchSpace.id == null) {  // create new scratch space
			saveUrl = getUtils().getKoalescenceAPIFunction('scratch_spaces');
			httpMethod = "POST";
		}
		else { // modify existing scratch space
			saveUrl = getUtils().getKoalescenceAPIFunction('scratch_space/' + scratchSpace.id);
			httpMethod = "PUT";
		}
		
		var tables = scratchSpace.getTables();
		var serializedTables = [];
		for (var i = 0, n = tables.length; i < n; i++) {
			serializedTables.push(ScratchSpaceUtils.serializeTable(tables[i]));
		}
		
		var params = {
			title: scratchSpace.getTitle(),
			description: scratchSpace.getDescription(),
			spaceIsPrivate: scratchSpace.isPrivate(),
			tablesJson: nativeJSON.encode(serializedTables)
		}
		
		var id = scratchSpace.getId();
		if (id != null) {
			params.id = id;
		}
		
		getUtils().httpRequest(saveUrl, httpMethod, params, function(success, statusCode, response) {
			if (success) {
				// In case the scratch space or any of its tables are
				// newly created, save their new IDs
				scratchSpace.setId(response.id);
				for (var i = 0, n = response.tableIds.length; i < n; i++) {
					scratchSpace.getTables()[i].setId(response.tableIds[i]);
				}
			}
			cb(success, statusCode, response);
		}, null, true);
	},

	saveSpaceLocally: function(scratchSpace, cb) {
		/*
		if (scratchSpace.id == null) {  // create new scratch space
			saveUrl = getUtils().getKoalescenceAPIFunction('scratch_spaces');
			httpMethod = "POST";
		}
		else { // modify existing scratch space
			saveUrl = getUtils().getKoalescenceAPIFunction('scratch_space/' + scratchSpace.id);
			httpMethod = "PUT";
		}
		*/
		
		var tables = scratchSpace.getTables();
		var serializedTables = [];
		for (var i = 0, n = tables.length; i < n; i++) {
			serializedTables.push(ScratchSpaceUtils.serializeTable(tables[i]));
		}
		
		var params = {
			title: scratchSpace.getTitle(),
			description: scratchSpace.getDescription(),
			spaceIsPrivate: scratchSpace.isPrivate(),
			tablesJson: nativeJSON.encode(serializedTables)
		}
		
		var id = scratchSpace.getId();
		if (id != null) {
			params.id = id;
		}
		
	},


}	// end of ScratchSpaceUtils


////////////////////////////////////////////////////////////////////////////////
//	ScratchSpace object
//

ScratchSpace = function(id, title, description, ownerId, spaceIsPrivate, tables) {
	this.id = id;
	this.title = title;
	this.description = description;
	this.ownerId = ownerId;
	this.spaceIsPrivate = spaceIsPrivate;
	
	this.tables = [];
	for (var i = 0, n = tables.length; i < n; i++) {
		var table = tables[i];
		this.createTable(table.id, table.title, table.data, table.scripts, table.notes, table.log);
	}
}

ScratchSpace.prototype = {
	getId: function() {
		return this.id;
	},
	
	setId: function(newId) {
		this.id = newId;
	},
	
	getTitle: function() {
		return this.title;
	},
	
	setTitle: function(newTitle) {
		this.title = newTitle;
	},
	
	getDescription: function() {
		return this.description;
	},
	
	getOwnerId: function() {
		return this.ownerId;
	},
	
	isPrivate: function() {
		return this.spaceIsPrivate;
	},
	
	getTables: function() {
		return this.tables;
	},

	createTable: function(id, title, data, scripts, notes, log) {
		var newTable = new ScratchSpaceTable(this, id, title || "", data || [], scripts || [], notes || "", log || []);
		this.getTables().push(newTable);
		return newTable;
	},
}


////////////////////////////////////////////////////////////////////////////////
//	ScratchSpaceTable object
//
// row and column indices are 0-based
//
// EVENTS
//
// void     addDataChangeListener : function(callback) - callback takes 4 parameters: rowIndex, columnIndex, oldValue, newValue
// void     addDataLoadListener : function(callback)
// void     addDataSaveListener : function(callback)

ScratchSpaceTable = function(scratchSpace, id, title, data, scripts, notes, log) {
	this.scratchSpace = scratchSpace;
	
	// Instance variables
	this.id = id;
	this.title = title;
	
	this.columnNames = [];  // of strings
	this.columnNameToNum = {};  // of string->[int]
	this.rowNames = [];  // of strings
	this.rowNameToNum = {};  // of string->[int]
	
	this.data = []; // 2-D array of strings
	if (data.length >= 1) {
		for (var j = 0, m = data[0].length; j < m; j++) {
			var colName = data[0][j];
			this.addColumn(colName);
		}
		this._modifyDataToSize(data.length - 1, data[0].length);
	}
	for (var i = 1, n = data.length; i < n; i++) {
		var row = data[i];
		for (var j = 0, m = row.length; j < m; j++) {
			var datum = data[i][j];
			this.setDataAt(i - 1, j, datum);
		}
	}
	 
	this.scripts = scripts; // of {url: string, name: string}
	
	this.listeners = {}; // listener type (string) -> [functions]
	
	this.fireEvents = true;
	
	this.notes = notes;
	this.log = log;
	this.loggingEnabled = true;
}

ScratchSpaceTable.prototype = {

	////////////////////////////////////////////////////////////
	// Constants
	
	
	////////////////////////////////////////////////////////////
	// Methods

	// function getScratchSpace(): ScratchSpace
	getScratchSpace: function() {
		return this.scratchSpace;
	},
	
	// function getId(): string
	getId: function() {
		return this.id;
	},
	
	// function setId(newId: string)
	setId: function(newId) {
		this.id = newId;
	},
	
	// function getTitle(): string
	getTitle: function() {
		return this.title;
	},
	
	// function getNotes(): string
	getNotes: function() {
		return this.notes;
	},
	
	// function getLog(): [] of ScratchSpaceTable.Action
	getLog: function() {
		return this.log;
	},
	
	// function logAction(action: ScratchSpaceTable.Action):
	logAction: function(action) {
		if (this.loggingEnabled) {
			this.log.push(action);
		}
	},
	
	setLoggingEnabled: function(flag) {
		this.loggingEnabled = flag;
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

	// function getScript(index: int): {url: string, title: string} 
	getScript: function(index) {
		return this.scripts[index];
	},
	
	// function getScriptCount(): int
	getScriptCount: function() {
		return this.scripts.length;
	},

	// function getScriptIndex: function(script: {url: string, title: string}): int
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

ScratchSpaceTable.Action = function() {
	//TODO figure out what, if anything, goes in here
}

ScratchSpaceTable.Action.parse = function(s) {
	// Simple regex matching for now
	if (m = s.match(/extract\s+(.*)\s+from\s+(.*)/i)) {
		var url = m[2];
		var xpathsJson = m[1];
		var xpaths = nativeJSON.decode(xpathsJson);
		return new ScratchSpaceTable.ExtractAction(url, xpaths);
	}
	else if (m = s.match(/run\s+script\s+(\d+)(?:\s+on\s+row\s+(\d+))?/i)) {
		var scriptId = parseInt(m[1]);
		if (m[2] != null) {
			var rowIndex = parseInt(m[2]);
			return new ScratchSpaceTable.RunScriptAction(scriptId, rowIndex);
		}
		else {
			return new ScratchSpaceTable.RunScriptAction(scriptId);
		}
	}
	else {
		return new ScratchSpaceTable.UnrecognizedAction(s);
	}
}

ScratchSpaceTable.ExtractAction = function(url, xpaths) {
	this.url = url;
	this.xpaths = xpaths;
}

ScratchSpaceTable.ExtractAction.prototype.toString = function() {
	return "Extract " + this.xpaths.toSource() + " from " + this.url;
}

ScratchSpaceTable.ExtractAction.prototype.run = function(scratchSpaceEditor) {
	//TODO
}

ScratchSpaceTable.RunScriptAction = function(scriptId, rowIndex) {
	this.scriptId = scriptId;
	if (rowIndex == null) {
		this.rowIndex = -1;
	}
	else {
		this.rowIndex = rowIndex;
	}
}

ScratchSpaceTable.RunScriptAction.prototype.toString = function() {
	var s = "Run script " + this.scriptId;
	if (this.rowIndex != -1) {
		s += " on row " + this.rowIndex;
	}
	return s;
}

ScratchSpaceTable.RunScriptAction.prototype.run = function(scratchSpaceEditor) {
	var coscripter = scratchSpaceEditor.getBrowserWindow().top.coscripter;
	var scriptUrl = getUtils().getKoalescenceAPIFunction('script/' + this.scriptId);
	
	if (this.rowIndex == -1) {
		coscripter.loadProcedureIntoSidebar(scriptUrl, true);
	}
	else {
		var currentTableIndex = scratchSpaceEditor.getCurrentTableIndex();
		// Select only the row specified in this action
		for (var i = 0, n = scratchSpaceEditor.getDataRowCount(currentTableIndex); i < n; i++) {
			scratchSpaceEditor.setDataRowSelected(currentTableIndex, i, false);
		}
		scratchSpaceEditor.setDataRowSelected(currentTableIndex, this.rowIndex, true);
		
		coscripter.loadProcedureIntoSidebarWithScratchSpaceEditor(scriptUrl, true, scratchSpaceEditor);
	}
}

ScratchSpaceTable.InsertRowAction = function() {
	//TODO
}

ScratchSpaceTable.InsertColumnAction = function() {
	//TODO
}

ScratchSpaceTable.DeleteRowAction = function() {
	//TODO
}

ScratchSpaceTable.DeleteColumnAction = function() {
	//TODO
}

ScratchSpaceTable.EditCellAction = function() {
	//TODO
}

ScratchSpaceTable.UnrecognizedAction = function(str) {
	this.str = str;
}

ScratchSpaceTable.UnrecognizedAction.prototype.toString = function() {
	return this.str;
}

ScratchSpaceTable.UnrecognizedAction.prototype.run = function() {
	// Intentionally empty
}
