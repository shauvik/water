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


const CC = Components.classes, CI = Components.interfaces, CIS = CI.nsISupports

var STATUSBAR_ENABLE_DISABLE_ID = 'coscripter-enable-disable';
var STATUSBAR_OPEN_CLOSE_ID = 'coscripter-open-close';


var consoleService = null

var onLoadObserver = {
	observe : function(content, notification, urlStr){
		var doc = content;
		var url = urlStr;	
		refreshStatusPanel(doc,url);
	}
}
		

function debug(msg) {
	if(consoleService == null){
		consoleService = CC['@mozilla.org/consoleservice;1'].getService(CI.nsIConsoleService)
	}
	consoleService.logStringMessage(msg)
}

function getMainWindow(){
	var windowMediator = CC["@mozilla.org/appshell/window-mediator;1"].getService(CI.nsIWindowMediator);
	var mainWindow = windowMediator.getMostRecentWindow("navigator:browser");
	return mainWindow;
}

function onPopupShowing(){
	var w = getMainWindow();
	updateCoscripterMenuItem(w.document);
	var url = w.getBrowser().selectedBrowser.currentURI.spec;
	loadRelatedScripts(w.document, url);
}

// added lazy loading to work around a bug that occurs irregularly.
var utils = null//Components.classes["@coscripter.ibm.com/coscripter-utils/;1"].getService(Components.interfaces.nsISupports).wrappedJSObject
function getUtils(){
	if(utils == null){
		utils = CC["@coscripter.ibm.com/coscripter-utils/;1"].getService(CIS).wrappedJSObject
	}
	return utils
}
// the code above needs to be reviewed eventually

// ================================================
// COSCRIPTER STATUS BAR
// ================================================
function loadRelatedScripts(doc,url){
	var coscripterPrefs = getUtils().getCoScripterPrefs();
	var fullUrl = getUtils().getKoalescenceAPIFunction('byurl','q=' + encodeURIComponent(url));
	var windowMediator = CC["@mozilla.org/appshell/window-mediator;1"].getService(CI.nsIWindowMediator)
	var window = windowMediator.getMostRecentWindow("navigator:browser");

	showLoadingItem(window.document, true);
	showNoScriptsItem(window.document, false);
	removePopupItems(window.document);
	if(!fullUrl){
		populatePopup(window.document,[]);
		return;
	}
	getUtils().loadWebPage(fullUrl,function(response){displayRelatedScripts(doc,response)});
}

function showLoadingItem(doc, displayP) {
	var loading = doc.getElementById('coscripter-loading');
	if (displayP) {
		loading.removeAttribute('hidden');
	} else {
		loading.setAttribute('hidden', 'true');
	}
}

function showNoScriptsItem(doc, displayP) {
	var item = doc.getElementById('coscripter-no-related-scripts');
	if (displayP) {
		item.removeAttribute('hidden');
	} else {
		item.setAttribute('hidden', 'true');
	}
}

function displayRelatedScripts(doc,response){
   	try{
		if(response == null || response == "")
			return;
   		var windowMediator = CC["@mozilla.org/appshell/window-mediator;1"].getService(CI.nsIWindowMediator)
   		var window = windowMediator.getMostRecentWindow("navigator:browser");
   		var nativeJSON = CC["@mozilla.org/dom/json;1"].createInstance(CI.nsIJSON);
		var scripts = nativeJSON.decode(response);
			
   		populatePopup(window.document,scripts);
   	}catch(e){
   		dump('Error refreshing status panel: ' + e + '\n')
   	}
}

function populatePopup(document,scripts){
	showLoadingItem(document, false);
	if (scripts.length > 0) {
		var i;
		for (i = 0; i < Math.min(5, scripts.length); i++) {
			addPopupItem(document, scripts[i]);
		}
		if (i < scripts.length) {
			var item = document.createElement("menuitem");
			item.setAttribute('label', "More...");
			item.setAttribute('oncommand',
				"coscripter.components.statusbar().findRelated(window);");
			document.getElementById('coscripter-statusbar-popup').appendChild(item);
		}
	}else{
		showNoScriptsItem(document, true);
	}
}

function updateCoscripterMenuItem(doc){
	// TL: this is broken in FFox 3: it always returns Close
	/*
	var openCloseItem = doc.getElementById(STATUSBAR_OPEN_CLOSE_ID);
	var label = (getUtils().isSidebarOpen(getMainWindow())?"Close":"Open") + " CoScripter sidebar" ;
	openCloseItem.setAttribute('label',label);
	*/
}

function relatedScriptEnabled(){
	var prefs = getUtils().getCoScripterPrefs();
	return prefs.prefHasUserValue('relatedScriptsEnabled')?prefs.getBoolPref('relatedScriptsEnabled'):false;
}

function enableRelatedScripts(on){
	var prefs = getUtils().getCoScripterPrefs();
	prefs.setBoolPref('relatedScriptsEnabled', on);
	refresh();
}

function addPopupItem(document,procedure){
   	var label = procedure.title + ' (' + procedure.creator.name + ')';
   	var url = procedure['json-url'] ;
	var item = document.createElement('menuitem');
	item.setAttribute('label', label);
	item.setAttribute('oncommand','coscripter.loadProcedureIntoSidebar("' + url+'",false)');
	item.setAttribute('tooltiptext','Open with CoScripter');
	document.getElementById('coscripter-statusbar-popup').appendChild(item);
}

function removePopupItems(document){
	var item = document.getElementById('coscripter-no-related-scripts');
	var menuPopup = document.getElementById('coscripter-statusbar-popup');
	while (item.nextSibling) {
		menuPopup.removeChild(item.nextSibling);
	}
}

// Open the "show related scripts" window
function findRelated(window) {
	var browser = getUtils().getBrowserDocument(window);
	var params = { inn: { 'title' : browser.title,
							'url' : browser.location.href },
					out: null };
	var win = window.openDialog("chrome://coscripter/content/related.xul",
		"Related scripts",
		"chrome, dialog, resizable=yes, width=670, height=650",
		params).focus();
}

// ================================================
// END COSCRIPTER STATUS BAR
// ================================================


///////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////  ON Methods ////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// the code below is based on template from:
// developer.mozilla.org/en/docs/Code_snippets:JS_XPCOM
// template had the license: MIT License 
var global_this = this

function Statusbar()
{
	this.wrappedJSObject = global_this
}

Statusbar.prototype.QueryInterface = function(iid)
{
	if (iid.equals(Components.interfaces.nsISupports))
	{
		return this;
	}
	else
	{
		throw Components.results.NS_ERROR_NO_INTERFACE;
	}
}

var initModule =
{
	ServiceCID: Components.ID("{eacc937a-95fa-4911-82d8-0b3f9aae84e8}"),  // Insert a guid in the quotes
	ServiceContractID: "@coscripter.ibm.com/coscripter-statusbar/;1",                          // Insert a contract ID in the quotes
	ServiceName: "coscripter-statusbar",                                                      // Insert your own name in the quotes
	
	registerSelf: function (compMgr, fileSpec, location, type)
	{
		compMgr = compMgr.QueryInterface(CI.nsIComponentRegistrar);
		compMgr.registerFactoryLocation(this.ServiceCID,this.ServiceName,this.ServiceContractID,
			fileSpec,location,type);
	},

	unregisterSelf: function (compMgr, fileSpec, location)
	{
		compMgr = compMgr.QueryInterface(CI.nsIComponentRegistrar);
		compMgr.unregisterFactoryLocation(this.ServiceCID,fileSpec);
	},

	getClassObject: function (compMgr, cid, iid)
	{
		if (!cid.equals(this.ServiceCID))
			throw Components.results.NS_SRROR_NO_INTERFACE
		if (!iid.equals(Components.interfaces.nsIFactory))
			throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
		return this.instanceFactory;
	},

	canUnload: function(compMgr)
	{
		return true;
	},

	instanceFactory:
	{
		createInstance: function (outer, iid)
		{
			if (outer != null)
				throw Components.results.NS_ERROR_NO_AGGREGATION;
			return new Statusbar().QueryInterface(iid);
		}
	}
}; //Module

function NSGetModule(compMgr, fileSpec)
{
	return initModule;
}

