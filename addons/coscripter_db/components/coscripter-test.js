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


const nsIAppShellService    = Components.interfaces.nsIAppShellService;
const nsISupports           = Components.interfaces.nsISupports;
const nsICategoryManager    = Components.interfaces.nsICategoryManager;
const nsIComponentRegistrar = Components.interfaces.nsIComponentRegistrar;
const nsICommandLine        = Components.interfaces.nsICommandLine;
const nsICommandLineHandler = Components.interfaces.nsICommandLineHandler;
const nsIFactory            = Components.interfaces.nsIFactory;
const nsIModule             = Components.interfaces.nsIModule;
const nsIWindowWatcher      = Components.interfaces.nsIWindowWatcher;

const CHROME_URI = "chrome://browser/content/browser.xul";
const KOALA_TEST_URL = "http://coscripter.researchlabs.ibm.com/coscripter/"
const clh_contractID = "@coscripter.ibm.com/commandlinehandler/general-startup;1?type=coscripter";
const clh_CID = Components.ID("{0d86db47-1af4-47c9-9bbb-0decdf30719d}");

// category names are sorted alphabetically. Typical command-line handlers use a
// category that begins with the letter "k".
const clh_category = "k-coscripter";

/**
 * Utility functions
 */

/**
 * Opens a chrome window.
 * @param aChromeURISpec a string specifying the URI of the window to open.
 * @param aArgument an argument to pass to the window (may be null)
 */
function openWindow(aChromeURISpec, aArgument){
	var ww = Components.classes["@mozilla.org/embedcomp/window-watcher;1"].getService(Components.interfaces.nsIWindowWatcher);
	

	var nsIDOMWindow = ww.openWindow(null, aChromeURISpec, "_blank",
                null,
                aArgument);

	if(ww.activeWindow!=null){
	dump('*********** active Window *************')
	deepDump(ww.activeWindow);

	var chromeWindow = ww.getChromeForWindow(ww.activeWindow);
	dump('*********** active Chrome Window *************')	
	deepDump(chromeWindow);
	}
	return nsIDOMWindow;
}
 
 
// *********************************************************************
// ********************************************************************* 
// *********************************************************************

// definitions
const CC = Components.classes, CI = Components.interfaces, CIS = CI.nsISupports
// -----------
var numChecks = 0 ;
var numFailedChecks = 0 ;

function deepDump(v,depth){
	if(depth > 1){
		return ;
	}	
	for(var p in v ){
		for(var i = 0 ; i<depth;i++){
			dump(' ');
		}
		if( typeof(v[p]) == 'object'){
			dump(p+':{object}');		
//			deepDump(v[p],depth+1);
	//		dump('}');		
			dump('\n');		
		}else{
			dump(p + ': ' + v[p] + '\n');
		}
	}

}
function runtests(chromeWindow){
	for( var p in this){
		if(p!= null && p.indexOf('test')==0 && typeof this[p] == 'function'){
			try{
				this[p](chromeWindow);
			}
			catch(e){
				dump( 'testcase ' + p + ' caused exception ' + e + '\n');
			}
		}
	}
//	testComponents();	
	
	//testBrowserOverlay();
	
	dump(  '\n\nran ' + numChecks + ' checks \n' );
	dump( numFailedChecks + ' checks failed \n' );
} 
 
function testParsing(window){
    // var commandText = 'click on the "images" link';
    //	checkSlopParsing(commandText);

    // This test fails because we don't have access to the
    // parseAsARecordedCommand function in coscripter-sidebar.js
    /*
    var u = CC["@coscripter.ibm.com/coscripter-utils/;1"].getService(CIS).wrappedJSObject;
    dump('window: ' + window + '\n');
    var cos = u.getCoScripterWindow(window);
    u.makeSidebarOpen(window,
    "chrome://coscripter/content/sidebar.xul",
    "view-coscripter-wikiproc-prototype-sidebar", function() {
	var parsedCommand;
	parsedCommand = cos.parseAsARecordedCommand("enter \"IBM\" into the \"Get Quotes\" textbox");
	assertEqual("IBM", parsedCommand.textValue);
	assertEqual("Get Quotes", parsedCommand.targetLabel);
	assertEqual("textbox", parsedCommand.targetType);
    })
    */
}

function testComponents(){
    var utils = CC["@coscripter.ibm.com/coscripter-utils/;1"].getService(CIS).wrappedJSObject
    assertNotNull(utils);

	var recorder = CC["@coscripter.ibm.com/coscripter-recorder/;1"].getService(CIS).wrappedJSObject
    assertNotNull(recorder);

	var statusbar = CC["@coscripter.ibm.com/coscripter-statusbar/;1"].getService(CIS).wrappedJSObject
    assertNotNull(recorder);

	var logger = CC["@coscripter.ibm.com/coscripter-logger/;1"].getService(CIS).wrappedJSObject
    assertNotNull(logger);
    
    var databaseXpcom = CC["@coscripter.ibm.com/coscripter-database/;1"].getService(CIS).wrappedJSObject
    assertNotNull(databaseXpcom);
 	
}
 
function testLocalLogging(){
	if(     getBoolPref('enablelogging') == false){
		dump('logging is disabled via preferences, skipping local logging test\n')
		return ;
	}
	if(	getBoolPref('remotelogging') == true){
		dump('preferences are set for remote logging, skipping local logging test\n')
		return ;
	}
	var logger = CC["@coscripter.ibm.com/coscripter-logger/;1"].getService(CIS).wrappedJSObject
    assertNotNull(logger);
	var event = 99;
	var script = 1;
	var extra = 'local logger test' ;
    logger.log(event,script,extra);
   	var file = Components.classes["@mozilla.org/file/directory_service;1"]
       	.getService(Components.interfaces.nsIProperties)
       	.get("ProfD", Components.interfaces.nsIFile);
    file.append('CoScripterData');
    file.append('coscripter-sidebar.log');

	var istream = Components.classes["@mozilla.org/network/file-input-stream;1"]
	                        .createInstance(Components.interfaces.nsIFileInputStream);
	istream.init(file, 0x01, 0444, 0);
	istream.QueryInterface(Components.interfaces.nsILineInputStream);
	
	// read lines into array
	var line = {} , hasmore,lastline;
	do {
	  hasmore = istream.readLine(line);
	  lastline = line.value; 
	} while(hasmore);
	// check that the last line in the log is the one we just generated
	assertTrue(lastline.indexOf(',"99","1","local logger test"')!= -1);
}

function testBrowserOverlay(window){
	assertNotNull(window);

}

//******************
//** assertions ****
//******************
function assertNotNull(p){
	numChecks ++ ;
	if(p == null){
		assertionFailed('expected not null but got "' + p + '"');
	}
}

function assertNull(p){
	numChecks ++ ;
	if(p != null){
		assertionFailed('expected null but got "' + p + '"');
	}
}

function assertEqual(expected,actual){
	if(expected != actual){
		assertionFailed('expected: ' + expected + ', got: ' + actual );
	}
} 

function assertTrue(bool){
	if(!bool){
		assertionFailed('boolean expression eval-ed to false');
	}
} 
function assertionFailed(str){
	numFailedChecks ++ ;
	dump(str + '\n');
}
// *********************************************************************
// ********************** End Assertion ********************************
// ********************************************************************* 
 
 
// *********************************************************************
// ********************** Prefs Code  **********************************
// ********************************************************************* 
 
function getBoolPref(key){
	var checked = false ;
	var coscripterPrefs=getCoScripterPrefs()
	if(!coscripterPrefs.prefHasUserValue(key))
		checked = false; 
	else
		checked = coscripterPrefs.getBoolPref(key)==null?false:coscripterPrefs.getBoolPref(key); 
	return checked 
}

function getCoScripterPrefs(){
	return Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("coscripter.");
}
// *********************************************************************
// ********************** End Prefs Code  **********************************
// ********************************************************************* 
 
/**
 * The XPCOM component that implements nsICommandLineHandler.
 * It also implements nsIFactory to serve as its own singleton factory.
 */
const myAppHandler = {
	/* nsISupports */
	QueryInterface : function clh_QI(iid){
	if (iid.equals(nsICommandLineHandler) ||
        iid.equals(nsIFactory) ||
        iid.equals(nsISupports))
      return this;

    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  /* nsICommandLineHandler */

  handle : function clh_handle(cmdLine)
  {
    try {
      var uristr = cmdLine.handleFlagWithParam("testscript", false);
      if (uristr) {
        var uri = cmdLine.resolveURI(uristr);
        openWindow(KOALA_TEST_URL, uri);
        cmdLine.preventDefault = true;
      }
    }
    catch (e) {
      Components.utils.reportError("incorrect parameter passed to -viewapp on the command line.");
    }

    if (cmdLine.handleFlag("testcoscripter", false)) {
		dump('*** coscripter testing *** 	\n');
		var window = openWindow(CHROME_URI,null);
		runtests(window);
		cmdLine.preventDefault = true;
    }
  },

  // follow the guidelines in nsICommandLineHandler.idl
  // specifically, flag descriptions should start at
  // character 24, and lines should be wrapped at
  // 72 characters with embedded newlines,
  // and finally, the string should end with a newline
  helpInfo : "  -testcoscripter           Open My Application\n" +
             "  -testscripts <uri>   load and execute coscripter test scripts,\n",	
  /* nsIFactory */

  createInstance : function clh_CI(outer, iid)
  {
    if (outer != null)
      throw Components.results.NS_ERROR_NO_AGGREGATION;

    return this.QueryInterface(iid);
  },

  lockFactory : function clh_lock(lock)
  {
    /* no-op */
  }
};

/**
 * The XPCOM glue that implements nsIModule
 */
const myAppHandlerModule = {
  /* nsISupports */
  QueryInterface : function mod_QI(iid)
  {
    if (iid.equals(nsIModule) ||
        iid.equals(nsISupports))
      return this;

    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  /* nsIModule */
  getClassObject : function mod_gch(compMgr, cid, iid)
  {
    if (cid.equals(clh_CID))
      return myAppHandler.QueryInterface(iid);

    throw Components.results.NS_ERROR_NOT_REGISTERED;
  },

  registerSelf : function mod_regself(compMgr, fileSpec, location, type)
  {
    //dump("*** registration of coscripter-test component\n");
    compMgr.QueryInterface(nsIComponentRegistrar);

    compMgr.registerFactoryLocation(clh_CID,
                                    "coscripterAppHandler",
                                    clh_contractID,
                                    fileSpec,
                                    location,
                                    type);

    var catMan = Components.classes["@mozilla.org/categorymanager;1"].
      getService(nsICategoryManager);
    catMan.addCategoryEntry("command-line-handler",
                            clh_category,
                            clh_contractID, true, true);
  },

  unregisterSelf : function mod_unreg(compMgr, location, type)
  {
    compMgr.QueryInterface(nsIComponentRegistrar);
    compMgr.unregisterFactoryLocation(clh_CID, location);

    var catMan = Components.classes["@mozilla.org/categorymanager;1"].
      getService(nsICategoryManager);
    catMan.deleteCategoryEntry("command-line-handler", clh_category);
  },

  canUnload : function (compMgr)
  {
    return true;
  }
};

/* The NSGetModule function is the magic entry point that XPCOM uses to find what XPCOM objects
 * this component provides
 */
function NSGetModule(comMgr, fileSpec)
{
  return myAppHandlerModule;
}	
