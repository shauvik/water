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

Components.utils.import("resource://coscripter/coscripter-scratch-space.js");

/////////////////////////
//
//	constructSpaceUI
//	saveScratchSpace
//	importDataFile
//
/////////////////////////


/**
 * Opens a blank editor within the specific UI in the specified window (i.e. the docked or the floating window)
 */
var CoScripterScratchSpaceEditor = function(scratchSpaceUI, browserWindow, editorWindow, context) {
	// 'context' is the constant spaceUI.FLOATING_WINDOW or spaceUI.DOCKED_PANE
    this.components = Components.classes["@coscripter.ibm.com/registry;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
	this.scratchSpaceUI = scratchSpaceUI;	// Coscripter has a global var scratchSpaceUI, which is defined in coscripter-scratch-space-overlay.js and .xul
	this.browserWindow = browserWindow;
	this.editorWindow = editorWindow;
	this.parent = scratchSpaceUI.getEditorAttachPoint(context);
	this.context = context;
	this.selectAll = [];  // list of booleans, length is number of tables
	this.cellMetadata = []; // cellMetadata[0][4][2] returns the metadata of table 0, row 4, col 2
	
	//A ScratchSpace is a list of Tables. A Table contains the actual data that is displayed in a CoScripterScratchSpaceEditor.
	this.scratchSpace = scratchSpaceUI.getScratchSpace();	
	this.constructSpaceUI(context);
}


CoScripterScratchSpaceEditor.prototype = {
	//	constructSpaceUI
	constructSpaceUI: function(context) {
		// There is no xul file for the CoScripterScratchSpaceEditor. It is constructed by this method.
		var doc = this.getDocument();
		
		// Set the title
		this.titleTextBox = this.scratchSpaceUI.getTitleTextBox(context);
		this.titleTextBox.value = this.scratchSpace.getTitle();
		
		// Start laying out the editor
		this.scratchSpaceContainer = doc.createElement("vbox");
		//this.scratchSpaceContainer.setAttribute("width", "800");
		this.scratchSpaceContainer.setAttribute("flex", 1);
		this.scratchSpaceContainer.setAttribute("id", "coscripterScratchSpaceEditor");

		var that = this;
		
		// Add tabs for each table
		var tabBox = doc.createElement("tabbox");
		this.scratchSpaceContainer.appendChild(tabBox);
		tabBox.setAttribute("flex", 1);
		
		var tabPanels = doc.createElement("tabpanels");
		tabBox.appendChild(tabPanels);
		tabPanels.setAttribute("style", "border-bottom: 0px solid");
		tabPanels.setAttribute("flex", 1);
		
		this.tableUIs = [];
		
		var scratchSpaceTables = this.scratchSpace.getTables();
		var runMenu = this.scratchSpaceUI.getScriptsMenu(context);
		while (runMenu.firstChild) {
			runMenu.removeChild(runMenu.firstChild);
		}
	
		for (var tableNum = 0, numTables = scratchSpaceTables.length; tableNum < numTables; tableNum++) {
			var table = scratchSpaceTables[tableNum];
			
			var tabPanel = doc.createElement("tabpanel");
			tabPanels.appendChild(tabPanel);
			
			// Add the spreadsheet editor for the table
			var newTableUI = this.constructTableUI(tableNum);
			this.tableUIs.push(newTableUI);
			tabPanel.appendChild(newTableUI);

			// Add button for running scripts
			var runMenuPopup = doc.createElement("menupopup");
			runMenu.appendChild(runMenuPopup);

			var numScripts = table.getScriptCount();
			for (var i = 0; i < numScripts; i++) {
				var script = table.getScript(i);
				this.addScriptToRunMenu(script, runMenu, runMenuPopup);
			}

			if (tableNum != 0) {
				runMenuPopup.setAttribute("hidden", "true");
			}
			else {
				runMenu.disabled = (numScripts == 0);
			}
			
			//TODO when the current table is changed, enable the right popup
			// in the Run menu
		}
		
		var tabs = doc.createElement("tabs");
		this.tabs = tabs;
		tabs.setAttribute("class", "tabs-bottom");
		
		tabBox.appendChild(tabs);
		for (var tableNum = 0, numTables = scratchSpaceTables.length; tableNum < numTables; tableNum++) {
			var table = scratchSpaceTables[tableNum];
			
			var tab = doc.createElement("tab");
			tabs.appendChild(tab);

			tab.setAttribute("class", "tab-bottom");
			tab.setAttribute("label", table.getTitle());
		}
		
		this.parent.appendChild(this.scratchSpaceContainer);

		// Listen for events from the table
		for (var tableNum = 0, numTables = scratchSpaceTables.length; tableNum < numTables; tableNum++) {
			var table = scratchSpaceTables[tableNum];
			table.addEventListener("scriptAdded", function(event) {
				that.scriptAdded(event);
			}, true);
		}
	},
	
	constructTableUI: function(index) {
		var that = this;

		var doc = this.getDocument();
		var scratchSpaceTable = this.scratchSpace.getTables()[index];
		
		// Add XUL table
		var treeElem = doc.createElement("tree");
		treeElem.setAttribute("id", "coscripter-scratch-space-table-editor-" + index);
		treeElem.setAttribute("flex", "1");
		treeElem.setAttribute("seltype", "cell");
		treeElem.setAttribute("editable", "true");
		treeElem.setAttribute("hidecolumnpicker", "true");
		treeElem.setAttribute("enableColumnDrag", "true");
		
		//treeElem.setAttribute("style", "position:absolute; left: " + tablePos.left + "px; top: " + tablePos.top + "px; height:auto; width:" + this.table.tableElem.clientWidth + "px");
		//treeElem.setAttribute("style", "height:auto; width:" + this.table.tableElem.clientWidth + "px");
		
		var treeColsElem = doc.createElement("treecols");
		treeElem.appendChild(treeColsElem);
		
		var ordinal = 1;
		
		// Add checkbox column for selecting rows
		var treeColElem = doc.createElement("treecol");
		treeColElem.setAttribute("type", "checkbox");
		treeColElem.setAttribute("editable", "true");
		treeColElem.setAttribute("src", "chrome://global/skin/checkbox/cbox-check.gif");
		treeColElem.setAttribute("class", "treecol-image");
		treeColElem.setAttribute("flex", "1");
		treeColElem.setAttribute("maxwidth", "20");
		treeColElem.setAttribute("ordinal", ordinal);
		treeColElem.addEventListener('click', function(event) {
			that.selectAllColHeaderClicked(event);
		}, true);
		this.selectAll.push(true);
		ordinal++;
		treeColsElem.appendChild(treeColElem);
		
		var splitterElem = doc.createElement("splitter");
		splitterElem.setAttribute("class", "tree-splitter");
		splitterElem.setAttribute("ordinal", ordinal);
		ordinal++;
		treeColsElem.appendChild(splitterElem);
		
		// Add column for displaying the row number
		var treeColElem = doc.createElement("treecol");
		treeColElem.setAttribute("editable", "false");
		treeColElem.setAttribute("flex", "1");
		treeColElem.setAttribute("maxwidth", "30");
		treeColElem.setAttribute("ordinal", ordinal);
		ordinal++;
		treeColsElem.appendChild(treeColElem);
		
		var splitterElem = doc.createElement("splitter");
		splitterElem.setAttribute("class", "tree-splitter");
		splitterElem.setAttribute("ordinal", ordinal);
		ordinal++;
		treeColsElem.appendChild(splitterElem);
		
		
		// Add columns for data
		for (var colNum = 0, numCols = scratchSpaceTable.getColumnCount(); colNum < numCols; colNum++) {
			var treeColElem = doc.createElement("treecol");
			treeColElem.setAttribute("label", String.fromCharCode(colNum + "A".charCodeAt(0)));
			treeColElem.setAttribute("flex", "1");
			treeColElem.setAttribute("ordinal", ordinal);
			ordinal++;
			treeColsElem.appendChild(treeColElem);

			var splitterElem = doc.createElement("splitter");
			splitterElem.setAttribute("class", "tree-splitter");
			splitterElem.setAttribute("ordinal", ordinal);
			ordinal++;
			treeColsElem.appendChild(splitterElem);
		}
		
		// Add column for adding a column
		var treeColElem = doc.createElement("treecol");
		treeColElem.setAttribute("label", "+");
		treeColElem.setAttribute("editable", "false");
		treeColElem.setAttribute("flex", "1");
		treeColElem.setAttribute("maxwidth", "35");
		treeColElem.setAttribute("ordinal", ordinal);
		ordinal++;
		treeColElem.addEventListener('click', function(event) {
			that.addColumn(index);
		}, true);
		treeColsElem.appendChild(treeColElem);

		var treeChildrenElem = doc.createElement("treechildren");
		treeElem.appendChild(treeChildrenElem);
		
		// Put in a row for editable column headers
		var treeItemElem = doc.createElement("treeitem");
		treeChildrenElem.appendChild(treeItemElem);
		
		var treeRowElem = doc.createElement("treerow");
		treeItemElem.appendChild(treeRowElem);
		
		// Add checkbox cell
		var treeCellElem = doc.createElement("treecell");
		treeCellElem.setAttribute("class", "checkbox-cell");
		treeCellElem.setAttribute("properties", "disabled");
		treeCellElem.setAttribute("editable", "false");
		treeRowElem.appendChild(treeCellElem);
		
		// Add row number cell
		var treeCellElem = doc.createElement("treecell");
		treeCellElem.setAttribute("properties", "disabled");
		treeCellElem.setAttribute("editable", "false");
		treeRowElem.appendChild(treeCellElem);
		
		// Add cells for column headers
		for (var colNum = 0, numCols = scratchSpaceTable.getColumnCount(); colNum < numCols; colNum++) {
			var treeCellElem = doc.createElement("treecell");
			treeRowElem.appendChild(treeCellElem);
			treeCellElem.setAttribute("label", scratchSpaceTable.getColumnNameAt(colNum));
			treeCellElem.setAttribute("properties", "header");
		}

		// Add "+" cell for adding a column
		var treeCellElem = doc.createElement("treecell");
		treeRowElem.appendChild(treeCellElem);
		treeCellElem.setAttribute("properties", "disabled");
		treeCellElem.setAttribute("editable", "false");
		treeCellElem.setAttribute("label", "");
		
		// Add rows for the table data itself
		for (var rowNum = 0, numRows = scratchSpaceTable.getRowCount(); rowNum < numRows; rowNum++) {
			var treeItemElem = doc.createElement("treeitem");
			treeChildrenElem.appendChild(treeItemElem);
			
			var treeRowElem = doc.createElement("treerow");
			treeItemElem.appendChild(treeRowElem);
			
			// Add checkbox cell
			var treeCellElem = doc.createElement("treecell");
			treeCellElem.setAttribute("class", "checkbox-cell");
			treeCellElem.setAttribute("properties", "header");
			treeRowElem.appendChild(treeCellElem);
			
			// Add row number cell
			treeCellElem = doc.createElement("treecell");
			treeCellElem.setAttribute("properties", "header");
			treeCellElem.setAttribute("editable", "false");
			treeCellElem.setAttribute("label", (rowNum + 1));
			treeRowElem.appendChild(treeCellElem);
			
			// ** Add cells for table data **
			for (var colNum = 0, numCols = scratchSpaceTable.getColumnCount(); colNum < numCols; colNum++) {
				treeCellElem = doc.createElement("treecell");
				treeRowElem.appendChild(treeCellElem);
				treeCellElem.setAttribute("label", scratchSpaceTable.getDataAt(rowNum, colNum));
			}
			
			// Add empty cell in "add column" column
			var treeCellElem = doc.createElement("treecell");
			treeCellElem.setAttribute("properties", "disabled");
			treeCellElem.setAttribute("editable", "false");
			treeRowElem.appendChild(treeCellElem);
		}
		
		// Add a row for adding a new row
		var treeItemElem = doc.createElement("treeitem");
		treeChildrenElem.appendChild(treeItemElem);
		
		var treeRowElem = doc.createElement("treerow");
		treeItemElem.appendChild(treeRowElem);
		
		// Add checkbox cell placeholder
		var treeCellElem = doc.createElement("treecell");
		treeCellElem.setAttribute("properties", "disabled");
		treeCellElem.setAttribute("editable", "false");
		treeRowElem.appendChild(treeCellElem);
		
		// Add "+" cell for adding a row
		treeCellElem = doc.createElement("treecell");
		treeCellElem.setAttribute("properties", "header");
		treeCellElem.setAttribute("editable", "false");
		treeCellElem.setAttribute("label", "+");
		treeRowElem.appendChild(treeCellElem);
		
		// Add cell placeholders for table data
		for (var colNum = 0, numCols = scratchSpaceTable.getColumnCount(); colNum < numCols; colNum++) {
			treeCellElem = doc.createElement("treecell");
			treeRowElem.appendChild(treeCellElem);
			treeCellElem.setAttribute("properties", "disabled");
			treeCellElem.setAttribute("editable", "false");
		}
		
		// Add empty cell in "add column" column
		var treeCellElem = doc.createElement("treecell");
		treeCellElem.setAttribute("properties", "disabled");
		treeCellElem.setAttribute("editable", "false");
		treeRowElem.appendChild(treeCellElem);
		
		// Add click handler to detect whether the "add row" or "add column" buttons are clicked
		treeElem.addEventListener('click', function(event) {
			that.treeClicked(event);
		}, false);
		return treeElem;
	},
	
	getBrowserWindow: function() {
		return this.browserWindow;
	},
	
	getEditorWindow: function() {
		return this.editorWindow;
	},

	getDocument: function() {
		return this.parent.ownerDocument;
	},
	
	
	getTree: function(tableIndex) {
		return this.tableUIs[tableIndex];
	},
	
	getTreeBoxObject: function(tableIndex) {
		return this.getTree(tableIndex).boxObject.QueryInterface(Components.interfaces.nsITreeBoxObject);
	},
	
	getCurrentTableIndex: function() {
		return this.tabs.selectedIndex;
	},
	
	getSelectedRows: function(tableIndex) {
		var treeBoxObject = this.getTreeBoxObject(tableIndex); 
		var treeView = treeBoxObject.view;
		var treeColumns = treeBoxObject.columns;
		var selectedRows = [];
		
		for (var i = 0, n = this.getDataRowCount(tableIndex); i < n; i++) {
			if (this.isDataRowSelected(tableIndex, i)) {
				selectedRows.push(i);
			}
		}
		return selectedRows;
	},

	setDataRowSelected: function(tableIndex, rowIndex, isSelected) {
		var treeBoxObject = this.getTreeBoxObject(tableIndex); 
		var treeView = treeBoxObject.view;
		var treeColumns = treeBoxObject.columns;
		
		// Offset by 1 to account for the column headers
		treeView.setCellValue(rowIndex + 1, treeColumns[0], isSelected ? "true" : "false");
	},
	
	isDataRowSelected: function(tableIndex, rowIndex) {
		var treeBoxObject = this.getTreeBoxObject(tableIndex); 
		var treeView = treeBoxObject.view;
		var treeColumns = treeBoxObject.columns;
		
		// Offset by 1 to account for the column headers
		return treeView.getCellValue(rowIndex + 1, treeColumns[0]) == "true";
	},

	toggleSelectAll: function(tableIndex) {
		var treeBoxObject = this.getTreeBoxObject(tableIndex);
		var column0 = treeBoxObject.columns[0];
		var treeView = treeBoxObject.view;
		var selectAllValue = this.selectAll[tableIndex];
		for (var i = 1, n = treeView.rowCount - 1; i < n; i++) {
			treeView.setCellValue(i, column0, selectAllValue);
		}
		this.selectAll[tableIndex] = !selectAllValue;
	},

	isCellForAddingRows: function(tableIndex, rowIndex, columnIndex) {
		return (rowIndex == this.getTree(tableIndex).view.rowCount - 1) && (columnIndex == 1);
	},
	
	isCellForAddingColumns: function(tableIndex, rowIndex, columnIndex) {
		return (rowIndex == 0) && (columnIndex == this.getTree(tableIndex).columns.count - 1);
	},
	
	// ======= Table data methods
	getScratchSpace: function() {
		return this.scratchSpace;
	},
	
	//	saveScratchSpace
	saveScratchSpace: function() {
		// For each Table in the ScratchSpace,
		//Save the data from the Editor back into the Table object
		// To save the Table to the Server, use ScratchSpaceUtils.saveSpaceToServer
		this.scratchSpace.setTitle(this.titleTextBox.value);
		var tables = this.scratchSpace.getTables();
		for (var i = 0, n = tables.length; i < n; i++) {
			this.saveTable(i);
		}
	},

	saveTable: function(tableIndex) {
		// A Table contains the actual data that is displayed and edited in the Editor
		var table = this.scratchSpace.getTables()[tableIndex];

		// Stop any editing within the tree
		this.getTree(tableIndex).stopEditing(true);
		
		// Make sure there are enough columns
		for (var i = 0, n = this.getDataColumnCount(tableIndex) - table.getColumnCount(); i < n; i++) {
			table.addColumn("");
		}
		
		// Make sure there are enough rows
		for (var i = 0, n = this.getDataRowCount(tableIndex) - table.getRowCount(); i < n; i++) {
			table.addRow("");
		}
		
		//TODO this will need to handle deletions once the underlying model does
		
		// Save column headers
		for (var colNum = 0, numCols = this.getDataColumnCount(tableIndex); colNum < numCols; colNum++) {
			table.setColumnNameAt(colNum, this.getDataColumnName(tableIndex, colNum));
		}
		
		// Save data
		for (var rowNum = 0, numRows = this.getDataRowCount(tableIndex); rowNum < numRows; rowNum++) {
			for (var colNum = 0, numCols = this.getDataColumnCount(tableIndex); colNum < numCols; colNum++) {
				table.setDataAt(rowNum, colNum, this.getData(tableIndex, rowNum, colNum));
			}
		}
	},
	
	//	importDataFile
	// Select a tab-delimited file using the filePicker. 
	//Read it in, put its data in the editor.
	importDataFile: function() {
		const nsIFilePicker = Components.interfaces.nsIFilePicker;
		var fp = Components.classes["@mozilla.org/filepicker;1"]
                   .createInstance(nsIFilePicker);
		var win = this.components.utils().getCurrentCoScripterWindow()
		
		fp.init(win, "Import Tab-Delimited File", nsIFilePicker.modeOpen);
		fp.appendFilters(nsIFilePicker.filterText);
		var rv = fp.show();
		if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
			var file = fp.file;
			// read the data into a scratch space table
			// display this table in the editor	  
			var data = this.readTDFileWithColumnHeaders(file)
			//var scratchSpace = ScratchSpaceUtils.createScratchSpace(data);	
		}
		
		/*
		if (scratchSpace.id == null) {  // create new scratch space

		}
		else { // modify existing scratch space

		}
		var tables = scratchSpace.getTables();
		var serializedTables = [];
		for (var i = 0, n = tables.length; i < n; i++) {
			serializedTables.push(ScratchSpaceUtils.serializeTable(tables[i]));
		}
		var id = scratchSpace.getId();
		if (id != null) {

		}
		*/
	},	// end of importSpace
	
	// Read in the data from a tab-delimited file
	readTDFile: function(iFile){
		var text = ""
		var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream)
		var sstream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream)
		fstream.init(iFile, -1, 0, 0)
		sstream.init(fstream)
		var str = sstream.read(4096)
		while (str.length > 0) {
			text += str
			str = sstream.read(4096)
		}
		sstream.close()
		fstream.close()
		if (text == null) {return;}
		
		var treeView = this.getTreeBoxObject(0).view;
		var startRowIndex = 0; 
		var startColumnIndex = 0;
		
		// Fill in the table
		var data = text.split('\r');
		if (data[data.length - 1] == "") {data.splice(data.length - 1, 1);}
		// Make sure there are enough rows
		var numRows = this.getDataRowCount(0);
		for (var i = 0, rowsNeeded = startRowIndex + data.length - numRows; i < rowsNeeded; i++) {
			this.addRow(0);
		}
		for (var i = 0, n = data.length; i < n; i++) {
			var row = data[i].split('\t');
			var rowNum = startRowIndex + i;
			// Make sure there are enough columns
			var numCols = this.getDataColumnCount(0);
			for (var j = 0, colsNeeded = startColumnIndex + row.length - numCols; j < colsNeeded; j++) {
				this.addColumn(0);
			}
			for (var j = 0, m = row.length; j < m; j++) {
				var datum = row[j];
				this.setData(0, rowNum, startColumnIndex + j, datum);
			}
		}
	},	// end of readTDFile

	// Read in the data from a tab-delimited file
	readTDFileWithColumnHeaders: function(iFile){
		var text = ""
		var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream)
		var sstream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream)
		fstream.init(iFile, -1, 0, 0)
		sstream.init(fstream)
		var str = sstream.read(4096)
		while (str.length > 0) {
			text += str
			str = sstream.read(4096)
		}
		sstream.close()
		fstream.close()
		if (text == null) {return;}
		
		//var treeView = this.getTreeBoxObject(0).view;
		var startRowIndex = 0; 
		var startColumnIndex = 0;
		
		// Fill in the table
		var data = text.split('\r');
		if (data[data.length - 1] == "") {data.splice(data.length - 1, 1);}
		// Make sure there are enough rows
		var numRows = this.getDataRowCount(0);
		for (var i = 0, rowsNeeded = startRowIndex + data.length - numRows; i < rowsNeeded; i++) this.addRow(0);
		
		for (var i = 0, n = data.length; i < n; i++) {
			var row = data[i].split('\t');
			var rowNum = startRowIndex + i - 1;	// - 1 because the initial row of data is the column headers (AC)
			// Make sure there are enough columns
			var numCols = this.getDataColumnCount(0);
			for (var j = 0, colsNeeded = startColumnIndex + row.length - numCols; j < colsNeeded; j++) {
				this.addColumn(0);
			}
			for (var j = 0, m = row.length; j < m; j++) {
				var datum = row[j]
				if (i == 0) this.setDataColumnName(0, startColumnIndex + j, datum)	// column headers
				else this.setData(0, rowNum, startColumnIndex + j, datum)
			}
		}
	},	// end of readTDFileWithColumnHeaders

	displayData: function(data){
		var table = this.scratchSpace.getTables()[tableIndex];

		// Stop any editing within the tree
		this.getTree(tableIndex).stopEditing(true);
		
		// Make sure there are enough columns
		for (var i = 0, n = this.getDataColumnCount(tableIndex) - table.getColumnCount(); i < n; i++) {
			table.addColumn("");
		}
		
		// Make sure there are enough rows
		for (var i = 0, n = this.getDataRowCount(tableIndex) - table.getRowCount(); i < n; i++) {
			table.addRow("");
		}
		
		//TODO this will need to handle deletions once the underlying model does
		
		/*
		// Import column headers
		for (var colNum = 0, numCols = this.getDataColumnCount(tableIndex); colNum < numCols; colNum++) {
			table.setColumnNameAt(colNum, this.getDataColumnName(tableIndex, colNum));
		}
		*/
		
		// Import data
		for (var rowNum = 0, numRows = this.getDataRowCount(tableIndex); rowNum < numRows; rowNum++) {
			for (var colNum = 0, numCols = this.getDataColumnCount(tableIndex); colNum < numCols; colNum++) {
				table.setDataAt(rowNum, colNum, this.getData(tableIndex, rowNum, colNum));
			}
		}
	},
	
	refresh: function() {
		this.titleTextBox.value = this.scratchSpace.getTitle();
		var tables = this.scratchSpace.getTables();
		for (var i = 0, n = tables.length; i < n; i++) {
			this.refreshTable(i);
		}
	},
	
	refreshTable: function(tableIndex) {
		var table = this.scratchSpace.getTables()[tableIndex];
		
		// Make sure there are enough columns in the UI
		for (var i = 0, n = table.getColumnCount() - this.getDataColumnCount(tableIndex); i < n; i++) {
			this.addColumn(tableIndex);
		}
		
		// Make sure there are enough rows
		var tableRowCount = table.getRowCount();
		var treeRowCount = this.getDataRowCount(tableIndex);
		for (var i = 0, n = tableRowCount - treeRowCount; i < n; i++) {
			this.addRow(tableIndex);
		}
		
		//TODO this will need to handle deletions once the underlying model does
		
		// Update column headers
		for (var colNum = 0, numCols = table.getColumnCount(); colNum < numCols; colNum++) {
			this.setDataColumnName(tableIndex, colNum, table.getColumnNameAt(colNum));
		}
		
		// Update data
		for (var rowNum = 0, numRows = table.getRowCount(); rowNum < numRows; rowNum++) {
			for (var colNum = 0, numCols = table.getColumnCount(); colNum < numCols; colNum++) {
				this.setData(tableIndex, rowNum, colNum, table.getDataAt(rowNum, colNum));
			}
		}
	},
	
	getDataRowCount: function(tableIndex) {
		// -1 for the editable column headers, -1 for the "new row" row
		return this.getTreeBoxObject(tableIndex).view.rowCount - 2;
	},
	
	getDataColumnCount: function(tableIndex) {
		// -1 for the checkbox column, -1 for the row number, -1 for the "new column" column
		return this.getTreeBoxObject(tableIndex).columns.count - 3;
	},
	
	getDataColumnName: function(tableIndex, columnIndex) {
		var treeBoxObject = this.getTreeBoxObject(tableIndex); 
		return treeBoxObject.view.getCellText(0, treeBoxObject.columns[columnIndex + 2]);
	},

	setDataColumnName: function(tableIndex, columnIndex, newValue) {
		var treeBoxObject = this.getTreeBoxObject(tableIndex); 
		treeBoxObject.view.setCellText(0, treeBoxObject.columns[columnIndex + 2], newValue); 
	},
	

	getDataColumnNameOccurrence: function(tableIndex, columnIndex) {
		var columnName = this.getDataColumnName(tableIndex, columnIndex);
		var occurrence = 0;
		var totalOccurrence = 0;
		for (var i = 0, n = this.getDataColumnCount(); i < n; i++) {
			if (this.getDataColumnName(i).toLowerCase() == columnName.toLowerCase()) {
				if (i <= columnIndex) {
					occurrence++;
				}
				totalOccurrence++;
			}
		}
		
		if (totalOccurrence > 1) {
			return occurrence;
		}
		else {
			return null;
		}
	},

	getDataColumnIndex: function(tableIndex, columnName, columnNameOccurrence) {
		if (columnNameOccurrence == null) {
			columnNameOccurrence = 1;
		}
		
		var occurrence = 0;
		for (var i = 0, n = this.getDataColumnCount(tableIndex); i < n; i++) {
			if (this.getDataColumnName(tableIndex, i).toLowerCase() == columnName.toLowerCase()) {
				occurrence++;
				if (occurrence == columnNameOccurrence) {
					return i;
				}
			}
		}
		return -1;
	},
	
	getData: function(tableIndex, rowIndex, columnIndex) {
		var treeBoxObject = this.getTreeBoxObject(tableIndex); 
		return treeBoxObject.view.getCellText(rowIndex + 1, treeBoxObject.columns[columnIndex + 2]); 
	},
	
	setData: function(tableIndex, rowIndex, columnIndex, newValue) {
		var treeBoxObject = this.getTreeBoxObject(tableIndex); 
		treeBoxObject.view.setCellText(rowIndex + 1, treeBoxObject.columns[columnIndex + 2], newValue);
	},
	
	getMetadata: function(tableIndex, rowIndex, columnIndex) {
		if (this.cellMetadata[tableIndex] == null) {
			return null;
		}
		if (this.cellMetadata[tableIndex][rowIndex] == null) {
			return null;
		}
		return this.cellMetadata[tableIndex][rowIndex][columnIndex];
	},
	
	setMetadata: function(tableIndex, rowIndex, columnIndex, metadata) {
		if (this.cellMetadata[tableIndex] == null) {
			this.cellMetadata[tableIndex] = [];
		}
		if (this.cellMetadata[tableIndex][rowIndex] == null) {
			this.cellMetadata[tableIndex][rowIndex] = [];
		}
		
		var oldMetadata = this.getMetadata(tableIndex, rowIndex, columnIndex);
		var wasLink = (oldMetadata ? "url" in oldMetadata : false);
		this.cellMetadata[tableIndex][rowIndex][columnIndex] = metadata;
		var isLink = (metadata ? "url" in metadata : false);

		// Change the style of the cell if it has become a link, or
		// if a link was removed
		if (wasLink != isLink) {
			var treeRowIndex = rowIndex + 1;
			var treeColumnIndex = columnIndex + 2;
			var tree = this.getTree(this.getCurrentTableIndex());
			var treeRow = tree.view.getItemAtIndex(treeRowIndex).firstChild;
			var treeCell = treeRow.getElementsByTagName("treecell")[treeColumnIndex];
			if (isLink) {
				treeCell.setAttribute("properties", "link");
			}
			else {
				treeCell.setAttribute("properties", "");
			}  
			this.getTreeBoxObject(this.getCurrentTableIndex()).invalidateCell(treeRowIndex, tree.columns[treeColumnIndex]);
		}
	},	
	
	addScriptToRunMenu: function(script, runMenu, runMenuPopup) {
		var that = this;
		var doc = this.getDocument();
		var runMenuItem = doc.createElement("menuitem");
		runMenuPopup.appendChild(runMenuItem);
		runMenuItem.setAttribute("label", script.title);
		runMenuItem.setAttribute("value", script.url);
		runMenuItem.addEventListener('command', function(event) {
			that.runMenuItemSelected(event);
		}, true);
		runMenu.disabled = false;
	},
	
	
	addRow: function(tableIndex) {
		var doc = this.getDocument();
		var treeBoxObject = this.getTreeBoxObject(tableIndex);
		var treeColumnsCount = treeBoxObject.columns.count;
		var treeChildrenElem = this.getTree(tableIndex).getElementsByTagName("treechildren")[0];

		var treeItemElem = doc.createElement("treeitem");
		//treeChildrenElem.appendChild(treeItemElem);
		treeChildrenElem.insertBefore(treeItemElem, treeChildrenElem.lastChild);
		
		var treeRowElem = doc.createElement("treerow");
		treeItemElem.appendChild(treeRowElem);

		// Add checkbox cell
		var treeCellElem = doc.createElement("treecell");
		treeCellElem.setAttribute("class", "checkbox-cell");
		treeCellElem.setAttribute("properties", "header");
		treeRowElem.appendChild(treeCellElem);			
		
		// Add row number cell
		treeCellElem = doc.createElement("treecell");
		treeCellElem.setAttribute("properties", "header");
		treeCellElem.setAttribute("editable", "false");
		treeCellElem.setAttribute("label", this.getDataRowCount(tableIndex));
		treeRowElem.appendChild(treeCellElem);			
		
		// Add cell for table data
		for (var colNum = 0, numCols = this.getDataColumnCount(tableIndex); colNum < numCols; colNum++) {
			treeCellElem = doc.createElement("treecell");
			treeRowElem.appendChild(treeCellElem);
		}
		
		// Add empty cell under "add column" column
		treeCellElem = doc.createElement("treecell");
		treeCellElem.setAttribute("properties", "disabled");
		treeCellElem.setAttribute("editable", "false");
		treeRowElem.appendChild(treeCellElem);
		
		treeBoxObject.invalidate();
	},
	
	deleteRow: function(tableIndex, rowIndex) {
		var doc = this.getDocument();
		var treeBoxObject = this.getTreeBoxObject(tableIndex);
		var treeChildrenElem = this.getTree(tableIndex).getElementsByTagName("treechildren")[0];
		
		treeChildrenElem.removeChild(treeChildrenElem.childNodes[rowIndex + 1]);
		
		// Renumber the remaining rows below
		for (var i = rowIndex + 1, n = treeChildrenElem.childNodes.length - 1; i < n; i++) {
			var treeItemElem = treeChildrenElem.childNodes[i];
			treeItemElem.childNodes[0].childNodes[1].setAttribute("label", i);
		}

		treeBoxObject.invalidate();
	},
	
	addColumn: function(tableIndex) {
		var doc = this.getDocument();
		
		// We need to explicitly set the ordinal of the new column and splitter.
		// Otherwise, the columns are in the wrong order after undocking and redocking.
		var ordinal = this.getTreeBoxObject(tableIndex).columns.count * 2 - 1;
		
		var tree = this.getTree(tableIndex);
		var treeColsElem = tree.getElementsByTagName("treecols")[0];

		var treeColElem = doc.createElement("treecol");
		treeColElem.setAttribute("label", String.fromCharCode(this.getDataColumnCount(tableIndex) + "A".charCodeAt(0)));
		treeColElem.setAttribute("flex", "1");
		treeColElem.setAttribute("ordinal", ordinal);
		ordinal++;
		treeColsElem.insertBefore(treeColElem, treeColsElem.lastChild);
		
		var treeRows = tree.getElementsByTagName("treerow");
		for (var i = 0, n = treeRows.length; i < n; i++) {
			var treeRow = treeRows[i];
			var treeCell = doc.createElement("treecell");
			if (i == 0) {
				treeCell.setAttribute("properties", "header");
			}
			else if (i == n - 1) {
				treeCell.setAttribute("properties", "disabled");
				treeCell.setAttribute("editable", "false");
			}
			treeRow.insertBefore(treeCell, treeRow.lastChild);
		}
		
		var splitterElem = doc.createElement("splitter");
		splitterElem.setAttribute("class", "tree-splitter");
		splitterElem.setAttribute("ordinal", ordinal);
		ordinal++;
		treeColsElem.insertBefore(splitterElem, treeColsElem.lastChild);
		
		// Reset the ordinal of the "add column" column
		treeColsElem.lastChild.setAttribute("ordinal", this.getTreeBoxObject(tableIndex).columns.count * 2 - 1);
		
		tree.boxObject.invalidate();
	},
	
	// ======= Handlers for events from the table model
	scriptAdded: function(event) {
		var scriptsMenu = this.scratchSpaceUI.getScriptsMenu(this.context);
		var currentMenuPopUp = scriptsMenu.childNodes[this.getCurrentTableIndex()];
		this.addScriptToRunMenu(event.script, scriptsMenu, currentMenuPopUp);
	},
	
	// ======= Handlers for events from the UI
	runMenuItemSelected: function(event) {
		var menuItem = event.originalTarget;

		// If no rows are selected, select them all first
		var t = this.getCurrentTableIndex();
		var selectedRows = this.getSelectedRows(t);
		if (selectedRows.length == 0) {
			//Selecting no rows defaults to running the script over the whole table
			this.toggleSelectAll(t);
		}
		
		// Run the selected item
		var c = CoScripterScratchSpaceOverlay.getTargetWindow().top.coscripter;
		c.loadProcedureIntoSidebarWithScratchSpaceEditor(menuItem.getAttribute("value"), true, this);
	},
	
	treeClicked: function(event) {
		var tableIndex = this.getCurrentTableIndex();
		var row = {};
		var col = {};
		var obj = {};
		this.getTreeBoxObject(tableIndex).getCellAt(event.clientX, event.clientY, row, col, obj);

		if (col.value == null) {
			return;
		}

		var u = this.components.utils();
		var labeler = this.components.labeler();
		var commands = this.components.commands();
		var coScripterWindow = u.getCoScripterWindow(window)
		var rowIndex = row.value
		var columnIndex = col.value.index
		var dataRowIndex = rowIndex - 1;
		var dataColumnIndex = columnIndex - 2;
		var metadata = this.getMetadata(tableIndex, dataRowIndex, dataColumnIndex);
		
		//if this is a click on a link in a cell,
		//take over for command-generator (since yule isn't sending chrome clicks)
		if (metadata && coScripterWindow.recording) {
			var targetLabel = "column " + u.convertColumnNumberToLetter(dataColumnIndex) + " of row " + (dataRowIndex + 1) + " of the " // so that labeler doesn't get called
			var targetType = labeler.WEBTYPES.SCRATCHSPACETABLE;
			var commandObj = commands.createClickFromParams(event, targetLabel, targetType);
			//Hack Hack. Call command-processor's receiveRecordedCommand directly
			coScripterWindow.receiveRecordedCommand(commandObj)
		}
				
		if (this.isCellForAddingRows(tableIndex, rowIndex, columnIndex)) {
			this.addRow(tableIndex);
		}
		else if (this.isCellForAddingColumns(tableIndex, rowIndex, columnIndex)) {
			this.addColumn(tableIndex);
		}
		else {
			if (metadata != null && metadata.url) {
				CoScripterScratchSpaceOverlay.getTargetWindow().gBrowser.selectedBrowser.contentDocument.defaultView.location = metadata.url; 
			}
		}
	},
	
	selectAllColHeaderClicked: function(event) {
		var tableIndex = this.getCurrentTableIndex();
		this.toggleSelectAll(tableIndex);
	}
}
