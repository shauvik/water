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


// Component services

var consoleService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);
function debug(msg) {
 	//return ;	//comment out to turn on debugging
  consoleService.logStringMessage(msg);
}

var CSTest = {
    components : Components.classes["@coscripter.ibm.com/registry;1"].getService(Components.interfaces.nsISupports).wrappedJSObject,
	// Koala window
	k : window.top.coscripter,
	// Interpreter
	slopInterpreter : Components.classes["@coscripter.ibm.com/coscripter-slop-interpreter/;1"].getService(Components.interfaces.nsISupports).wrappedJSObject,
	onTestSidebarLoad: function() {
		// initialization goes here
		CSTest.loadTestcasesFromServer();
	},

	onTestSidebarUnload: function() {
		// do nothing
	},
	onVerifyTestCase: function(){
		// Populate our text boxes with data about this target
		var tree = document.getElementById("testcase_tree");
		var testcase = tree.view.getItemAtIndex(tree.currentIndex).testcase_data;
		CSTest.verifySlop(testcase,CSTest.setTestCaseStatus);
	},
	onVerifyAll:function(){
		var tree = document.getElementById("testcase_tree");
		CSTest.testAll = true ;
		
		for(var i=0 ; i<tree.view.rowCount ; i++){
			tree.view.getItemAtIndex(i).testcase_data.status="";
			tree.view.setCellText(i, tree.columns.getNamedColumn("status_column"),"");
		}
		
		if(tree.view.rowCount>0){
			CSTest.verifyCase(0);
		}			
	},
	verifyCase:function(n){
		var tree = document.getElementById("testcase_tree");
		if(n<tree.view.rowCount){
			CSTest.ensureRowIsVisible(n);
			var testcase = tree.view.getItemAtIndex(n).testcase_data;
			CSTest.verifySlop(testcase,CSTest.setTestCaseStatus);
		}
	},
	ensureRowIsVisible: function(index) {
		var tree = document.getElementById("testcase_tree");
		// ensure it's visible
		var box = tree.boxObject;
		box.QueryInterface(Components.interfaces.nsITreeBoxObject);
		box.ensureRowIsVisible(index);
	},
	setTestCaseStatus:function(success,testcase){
		var tree = document.getElementById("testcase_tree");
		// use the currentCase state to determine which tree item to update
		var index = testcase.index;
		tree.view.getItemAtIndex(index).testcase_data = testcase ;
		tree.view.setCellText(index, tree.columns.getNamedColumn("status_column"),testcase.status);
		if(index < ( tree.view.rowCount-1 ) && CSTest.testAll){
			index += 1 ;
			CSTest.verifyCase(index);
		}else{
			CSTest.testAll = false ;
		}
	},
	onTestParsing: function(){
		alert('onTestParsing');
	},
	verifySlop:function(testcase,callback){
		var b = components.utils().getBrowser(window.top);
		b.loadURI(testcase.url);

		
		var endDocumentLoadObserver = {
			observe:function(window){
				observerService.removeObserver(endDocumentLoadObserver,"EndDocumentLoad");
				CSTest.verifySlopAfterLoad(testcase,callback);
			}
		}
		
		var observerService = Components.classes["@mozilla.org/observer-service;1"].
    		getService(Components.interfaces["nsIObserverService"]);
  		observerService.addObserver(endDocumentLoadObserver, "EndDocumentLoad", false);
	},
	verifySlopAfterLoad:function(testcase,callback){
		// find the target that is specified by the xpath
		try{
		   	var xpathElements = []
			w = getCurrentContentWindow()
		   	var target = CSTest.findXPathElement(w.document,testcase.xpath);
			if(target == null) {
				testcase.status = "XPath Element not found"
				callback(false,testcase);
				return ;
			}
			var hilightNode = target ;
			if(testcase.act == "select"){
				 
				while(hilightNode.nodeName != "SELECT" && hilightNode.parentNode != hilightNode){
					hilightNode = hilightNode.parentNode ;
				}
			}
			CSTest.highlightNode(hilightNode,"#0000ff")// hilight the expected target blue
		
		}catch(e){
			testcase.status = "XPath Element not found due to exception: " + e;
			callback(false,testcase);
			return ;
		}
		
		// parse the slop if possible
		try{
			var p = coscripter.components.parser() ;
			var parser = new p.Parser(testcase.slop);
			var command = parser.parse();
		}catch(e){
			testcase.status = "Parser threw exception: " + e ;
			callback(false,testcase);
			return ;
		}
		
		// find the target specified by the slop and check if it's the same as specified by the testcase
		testcase.verify = {} ;
		// finds target ?
		try{	
			var parserTarget = command.findTarget();	
			testcase.verify.target = ( parserTarget == target ) /// this has to be '===' since you can't get access to the XPCWrapped objects themselves
			if(target != null){
				CSTest.highlightNode(parserTarget,"#00ff00","5px")// hilight the expected target blue
			}
		}catch(e){
			testcase.verify.target = false ;
		}
		
		// finds correct action ?
		try {
			testcase.verify.action = ( command.getAction() == testcase.act);
			// extracts corrent text value ? (if applicable)
			testcase.verify.textvalue = ( (testcase.action != "enter" && testcase.action != "select") || command.getTextvalue() == testcase.text);
			if(testcase.act == coscripter.components.commands().ACTIONS.SELECT){
				var targetAndType = coscripter.components.labeler().getTargetAndType(target)
				target = targetAndType[0];
			}
			var targetLabel = coscripter.components.labeler().getLabel(target);
			var slopLabel = command.getTargetLabel();
			// TL: removing the check for (!targetLabel && !slopLabel); it is
			// erroneously causing (targetLabel="", slopLabel=null) to compare
			// equal, when they should not be
			// TL TODO: check ordinal
			// TL: if the slopLabel is a RegExp, then don't check
			// slopreverse because it will not compare correctly
			if (slopLabel !== null && typeof(slopLabel.test) == "function") {
				// It's a RegExp
				testcase.verify.slopreverse = true;
			} else {
				if(targetLabel == slopLabel) {
					testcase.verify.slopreverse = true ;
				}else{
					testcase.verify.slopreverse = false ;
				}
			}
		} catch(e) {
			testcase.verify.slopreverse = false;
		}

		// Check toSlop() method
		try {
			var generated_slop = "ERROR";
			generated_slop = command.toSlop();
			testcase.verify.toslop = (generated_slop == testcase.slop);
		} catch (e) {
			testcase.verify.toslop = false;
		}

		// Check ordinal
		testcase.verify.uniqueDescriptor = false;
		var uniqueDescriptor = null;
		try {
			var contentWindow = getCurrentContentWindow();
			var targetType = coscripter.components.labeler().getTargetType(target);
			var targetMatches = coscripter.components.labeler().listTargetMatches(command, contentWindow);
			if (targetMatches && targetMatches.length > 1) {  // Find a unique description
				var ancestorLabelsP = false;
				uniqueDescriptor = components.utils().findUniqueDescriptor(target, targetMatches, ancestorLabelsP);
			}
			if (uniqueDescriptor == components.utils().getOrdinal(command.getOrdinal())) {
				testcase.verify.uniqueDescriptor = true;
			} else {
				testcase.verify.uniqueDescriptor = false;
			}
		} catch (e) {
			dump('error getting ordinal: ' + e.toSource() + '\n');
			debug('error getting ordinal: ' + e.toSource() + '\n');
			testcase.verify.uniqueDescriptor = false;
		}
		
		var success = testcase.verify.target && testcase.verify.action && testcase.verify.textvalue && testcase.verify.slopreverse && testcase.verify.uniqueDescriptor && testcase.verify.toslop;
		
		if(success){
			testcase.status = "verify ok"	
		}else{
			if(parserTarget == null){
				testcase.status = "No target found" ;
			}else{
				testcase.status = testcase.verify.target?"":"Correct Target not found"
			}
			testcase.status += testcase.verify.action?"":" Action incorrect"
			testcase.status += testcase.verify.textvalue?"":" Textvalue incorrect"
			testcase.status += testcase.verify.slopreverse?"":" recorded label did not match; expected \"" + slopLabel + "\" but got \""+ targetLabel + "\"";
			var ordinal;
			if (command.getOrdinal() != null) {
				ordinal = components.utils().getOrdinal(command.getOrdinal());
				ordinal = '"' + ordinal + '"';
			} else {
				ordinal = 'no ordinal';
			}
			testcase.status += testcase.verify.uniqueDescriptor?"":" ordinal incorrect; expected " + ordinal + " but got \"" + uniqueDescriptor + "\"";
			testcase.status += testcase.verify.toslop?"":" toSlop() does not match; got \"" + command.toSlop() + "\"";
		}
		callback(success,testcase);
	},
	findXPathElement:function(doc,xpath){
		try{
			var xpathExprs = xpath.split("/document()");
			
			var contextDoc = doc;
			var node = contextDoc.evaluate(xpathExprs[0], contextDoc, null, 9, null).singleNodeValue;

			for(var i = 1; i < xpathExprs.length && node != null; i++)
			{
				if (node.contentDocument == null)
					return null;
				
				contextDoc = node.contentDocument;
				node = contextDoc.evaluate(xpathExprs[i], contextDoc, null, 9, null).singleNodeValue;		
			}
			
			return node;
		}catch(e){
			debug("CSTest.findXPathElement threw exception: " +e);
		}  
	},
	// Capture a new testcase
	onCaptureTestcase: function() {
    	var doc = components.utils().getBrowserDocument(window);
	    var cururl = doc.location.href.toString();
		var urlbox = document.getElementById("testcase_URL");
		urlbox.value = cururl;
		
		doc.addEventListener("mouseover", CSTest.highlightTarget, false);
		doc.addEventListener("mouseout", CSTest.unhighlightTarget, false);
		// doc.addEventListener("click", CSTest.captureTarget, true);
		coscripter.components.commandGenerator().addListener(CSTest.recordAction);
		
		// Unselect anything in the tree so that it gets created as a new one
		var tree = document.getElementById("testcase_tree");
		tree.view.selection.clearSelection();
		// Clear out the other textboxes
		var namebox = document.getElementById("testcase_Name");
		var slopbox = document.getElementById("testcase_Slop");
		var xpathbox = document.getElementById("testcase_XPath");
		var actbox = document.getElementById("testcase_Action");
		var textbox = document.getElementById("testcase_Text");
		namebox.value = "";
		slopbox.value = "";
		xpathbox.value = "";
		actbox.value = "";
		textbox.value = "";
	},
	// Update the current testcase
	updateTestcase: function() {
		// Only works if a row in the tree is selected
		var tree = document.getElementById("testcase_tree");
		if (!tree.view.selection.isSelected(tree.currentIndex)) {
			alert("Click on a testcase first");
			return;
		}

		// Clear out the other textboxes
		var slopbox = document.getElementById("testcase_Slop");
		var xpathbox = document.getElementById("testcase_XPath");
		var actbox = document.getElementById("testcase_Action");
		var textbox = document.getElementById("testcase_Text");
		slopbox.value = "";
		xpathbox.value = "";
		actbox.value = "";
		textbox.value = "";
		
		// Load the page in the main browser
    	var doc = components.utils().getBrowserDocument(window);
		var urlbox = document.getElementById("testcase_URL");
		doc.location.href = urlbox.value;

		// Wait for the document to finish loading, then add our event
		// listeners
		components.utils().betterThenDoThis(window, function() {
			var doc = components.utils().getBrowserDocument(window);
			doc.addEventListener("mouseover", CSTest.highlightTarget, false);
			doc.addEventListener("mouseout", CSTest.unhighlightTarget, false);
			// doc.addEventListener("click", CSTest.captureTarget, true);
			coscripter.components.commandGenerator().addListener(CSTest.recordAction);
		});
	},
	highlightTarget: function(event) {
		var target = event.target;
		CSTest.highlightNode(target)
	},
	highlightNode: function(node,color,width,style){
		node.style.setProperty("-moz-outline-style", style?style:"solid", "important");
		node.style.setProperty("-moz-outline-width", width?width:"2px", "important");
		node.style.setProperty("-moz-outline-color", color?color:"#ff0000", "important");
	},
	unhighlightTarget: function(event) {
		var target = event.target;
		CSTest.unhighlightNode(target);
	},
	unhighlightNode:function(node){
		node.style.removeProperty("-moz-outline-style");
		node.style.removeProperty("-moz-outline-width");
		node.style.removeProperty("-moz-outline-color");
	},
	// I think this is unused now
	captureTarget: function(event) {
		// Prevent the click from going through to the underlying page
		event.stopPropagation();
		event.preventDefault();
		
		// Remove our event listeners
		var doc = components.utils().getBrowserDocument(window);
		doc.removeEventListener("mouseover", CSTest.highlightTarget, false);
		doc.removeEventListener("mouseout", CSTest.unhighlightTarget, false);
		doc.removeEventListener("click", CSTest.captureTarget, true);
		
		// Unhighlight the node
		var target = event.target;
		CSTest.unhighlightNode(target);
		// Populate our text boxes with data about this target
		var xpath = CSTest.BuildXPathForNode(target);
		var xpathbox = document.getElementById("testcase_XPath");
		xpathbox.value = xpath;
		var slop = coscripter.components.labeler().getLabel(target);
		var slopbox = document.getElementById("testcase_Slop");
		slopbox.value = slop;
	},
	recordAction: function(recordedCommand) {
		try {
			// DEATHTOME if (skipCommand(recordedCommand)) return;
			var slopbox = document.getElementById("testcase_Slop");
			// Generate the slop and display it
			slopbox.value = recordedCommand.toSlop();
			
			// Populate the XPath box
			var xpathbox = document.getElementById("testcase_XPath");
			// if we recorded a select, we need to get the option out
			var target = recordedCommand.getTarget();
			if (components.utils().stringContains(target.nodeName, "SELECT")) {
				target = target[target.selectedIndex]
			}
			xpathbox.value = CSTest.BuildXPathForNode(target);
			// Populate action and text
			var actbox = document.getElementById("testcase_Action");
			actbox.value = recordedCommand.getAction();
			var textbox = document.getElementById("testcase_Text");
			if (recordedCommand.string) {
				textbox.value = recordedCommand.string.getValue();
			}
			
			// Stop recording
			coscripter.components.commandGenerator().removeListener(CSTest.recordAction);
			// Remove our event listeners
			var doc = components.utils().getBrowserDocument(window);
			doc.removeEventListener("mouseover", CSTest.highlightTarget, false);
			doc.removeEventListener("mouseout", CSTest.unhighlightTarget, false);
			// unhighlight target
			CSTest.unhighlightNode(recordedCommand.getTarget());
		} catch (e) {
			// FIXME: CD 3/16 2010 this throws an error since it's called back 
			// from yule and does not contain the right "this" context
			debug("Error in recordAction: " + e);
		}
	},
	
	// Utility functions
  	BuildXPathForNode: function(node) {
		if (node.namespaceURI == "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul") {
        	return "";
    	}

    	var parent = node.parentNode;
   		var path = "";

    	if (parent === null) {
    		if (node.defaultView !== null &&
				node.defaultView.frameElement !== null &&
				node.defaultView.frameElement.namespaceURI != "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul")
			{
			path = CSTest.BuildXPathForNode(node.defaultView.frameElement);
			path += "/document()";
			}
    	}
    	else if (parent == node) {
			return "";
		} else {
			path = CSTest.BuildXPathForNode(parent);

			if (node.nodeType == 1) { // Node.ELEMENT_NODE
          		path += "/" + node.nodeName;
      		} else if (node.nodeType == 2) { // Node.ATTRIBUTE_NODE
          		path += "/@" + node.nodeName;
      		} else if (node.nodeType == 3) { // Node.TEXT_NODE
          		path += "/text()";
      		}

      		var index = 1;
      		if (node.nodeName.toLowerCase() != "html") {
         		var n = node.previousSibling;
          		while (n !== null) {
            		// TL: check the previous sibling's node type as well as the node
            		// name for a match.  I saw one page where the previousSibling was
            		// a Document node whose nodename was HTML, even though this
            		// didn't exist as an <html> node in the page.
            		if ((n.nodeName == node.nodeName) && (n.nodeType == node.nodeType)) {
              			index++;
					}

            		n = n.previousSibling;
          		}
      		}

      		path += "[" + index + "]";
    	}

    	return path;
  	},
	
	saveTestcase: function() {
		// save testcase to server
		try {
			var params = {};
			var namebox = document.getElementById("testcase_Name");
			var urlbox = document.getElementById("testcase_URL");
			var xpathbox = document.getElementById("testcase_XPath");
			var slopbox = document.getElementById("testcase_Slop");
			var actbox = document.getElementById("testcase_Action");
			var textbox = document.getElementById("testcase_Text");
			params.name = namebox.value;
			params.url = urlbox.value;
			params.xpath = xpathbox.value;
			params.slop = slopbox.value;
			params.act = actbox.value;
			params.text = textbox.value;
			if (!params.url || "" == components.utils().trim(params.url)) {
				alert("No URL specified, not saving!");
				return;
			}
			
			// Save as an existing testcase if a row in the tree is selected
			var tree = document.getElementById("testcase_tree");
			var oldrowindex = null;
			if (tree.view.selection.isSelected(tree.currentIndex)) {
				params.id = tree.view.getItemAtIndex(tree.currentIndex).testcase_data['id'];
				oldrowindex = tree.view.getItemAtIndex(tree.currentIndex).testcase_data.index;
			}
			
			var testcaseURL = components.utils().getKoalescenceAPIFunction("testcase");
			var ret = components.utils().post(testcaseURL, params);
			if (ret === null) {
				alert("Error saving testcase to server");
			} else if (ret[0] != 200) {
				alert("Error saving testcase: " + ret[1]);
			} else {
				// Save succeeded
				var nativeJSON = CC["@mozilla.org/dom/json;1"].createInstance(CI.nsIJSON);
				var scriptdata = nativeJSON.decode(ret[1]);
				CSTest.setStatus("Testcase saved with id " + scriptdata['id']);

				// insert it into the tree
				var listbox = document.getElementById("testcase_list");
				var tree = document.getElementById("testcase_tree");
				if (oldrowindex == null) {
					// at the end as a new entry
					scriptdata.index = tree.view.rowCount;
					var treeitem = CSTest.makeTreeItemFromTestcase(scriptdata);
					listbox.appendChild(treeitem);
				} else {
					scriptdata.index = oldrowindex;
					tree.view.getItemAtIndex(oldrowindex).testcase_data = scriptdata;
					// clear out the old test result
					tree.view.setCellText(oldrowindex, tree.columns.getNamedColumn("status_column"),"");
					tree.view.setCellText(oldrowindex, tree.columns.getNamedColumn("name_column"), scriptdata.name);
				}
				// select it
				CSTest.ensureRowIsVisible(scriptdata.index);
				tree.view.selection.select(scriptdata.index);
			}
		} catch (e) {
			debug("Error in saveTestcase: " + e);
		}
	},
		// When the user clicks on a row in the table, display it in the textboxes
	displayTestCase: function(row) {
		try {
			var tree = document.getElementById("testcase_tree");
			// If it's not really selected, return
			if (!tree.view.selection.isSelected(row)) return;
			var testcase = tree.view.getItemAtIndex(tree.currentIndex).testcase_data;	
			
			var namebox = document.getElementById("testcase_Name");
			var urlbox = document.getElementById("testcase_URL");
			var xpathbox = document.getElementById("testcase_XPath");
			var slopbox = document.getElementById("testcase_Slop");
			var actbox = document.getElementById("testcase_Action");
			var textbox = document.getElementById("testcase_Text");
			
			namebox.value = testcase.name;
			urlbox.value = testcase.url;
			xpathbox.value = testcase.xpath;
			slopbox.value = testcase.slop;
			actbox.value = testcase.act || "";
			textbox.value = testcase.text || "";
		} catch (e) {
			debug("Error in displayTestCase: " + e);
		}
	},
	// if selectedRow is set and != -1, then select that row in the tree after recreating it
	loadTestcasesFromServer: function(selectedRow) {
		try {
			var testcaseAPI = components.utils().getKoalescenceAPIFunction("testcase");
			var ret = components.utils().loadWebPage(testcaseAPI);

			var nativeJSON = CC["@mozilla.org/dom/json;1"].createInstance(CI.nsIJSON);
			var testcases = nativeJSON.decode(ret);
			
			var listbox = document.getElementById("testcase_list");
			// Remove old contents
			components.utils().removeAllChildren(listbox);
			
			for (var i=0; i<testcases.length; i++) {
				testcases[i].index = i;
				var treeitem = CSTest.makeTreeItemFromTestcase(testcases[i]);
				listbox.appendChild(treeitem);
			}
			
			if (selectedRow && selectedRow > -1) {
				debug('trying to reselect row ' + selectedRow);
				var tree = document.getElementById("testcase_tree");
				tree.view.selection.select(selectedRow);
			}
		} catch (e) {debug(e);}
	},

	makeTreeItemFromTestcase: function(testcase) {
		var treeitem = document.createElement("treeitem");
		treeitem.testcase_data = testcase;
		var treerow = document.createElement("treerow");
		treeitem.appendChild(treerow);
		var treecell = document.createElement("treecell");
		treecell.setAttribute("label", testcase.id);
		treerow.appendChild(treecell);
		treecell = document.createElement("treecell");
		treecell.setAttribute("label", testcase.name);
		treerow.appendChild(treecell);
		treecell = document.createElement("treecell");
		treecell.setAttribute("label", "");
		treerow.appendChild(treecell);
		return treeitem;
	},

	deleteTestcase: function() {
		if (!window.confirm("Delete testcase?")) return;
		var tree = document.getElementById("testcase_tree");
		var testcase = tree.view.getItemAtIndex(tree.currentIndex).testcase_data;
		var params = {};
		var testcaseURL = components.utils().getKoalescenceAPIFunction("testcase");
		var ret = components.utils().deleteRequest(testcaseURL + '/' +testcase.id, params);
		if (ret === null) {
			alert("Error deleting testcase from server");
		} else if (ret[0] != 200) {
			alert("Error deleting testcase: " + ret[1]);
		} 

		var item = tree.view.getItemAtIndex(testcase.index);
		item.parentNode.removeChild(item);
		var oldindex = testcase.index;
		CSTest.renumberTestcaseIndices();
		if (oldindex >= tree.view.rowCount) {
			oldindex = tree.view.rowCount - 1;
		}
		CSTest.ensureRowIsVisible(oldindex);
		tree.view.selection.select(oldindex);
	},

	renumberTestcaseIndices: function() {
		var tree = document.getElementById("testcase_tree");
		for (var i=0; i<tree.view.rowCount; i++) {
			var tcdata = tree.view.getItemAtIndex(i).testcase_data;
			tcdata.index = i;
		}
	},
	
	// --------------------------------------------------------
	// Statusbar functions
	setStatus: function(msg) {
		var status = document.getElementById("statusbar");
		components.utils().removeAllChildren(status);
		status.appendChild(document.createTextNode(msg));     
	}
};


