//======================================================
// XPCOM registration constants Section
const nsISupports = Components.interfaces.nsISupports;

// You can change these if you like - 
const CLASS_ID = Components.ID("56b99b14-870c-4cfb-8b55-efe1ea0da7df");
const CLASS_NAME = "CoScripter Component Registry";
const CONTRACT_ID = "@coscripter.ibm.com/registry;1";

//======================================================
// Debug Section

var consoleService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);

//var doConsoleDebugging = false ;
var Preferences = {
	DO_CONSOLE_DEBUGGING: false,
	DO_DUMP_DEBUGGING: false,
}

function debug(msg){
	if (Preferences.DO_CONSOLE_DEBUGGING) {
		consoleService.logStringMessage("components-registry.js: " + msg);
	}
	if (Preferences.DO_DUMP_DEBUGGING) {
		dump("components-registry.js: " + msg + "\n");
	}
}

debug('parsing component-registry.js');



function getRegistry(){
	return Components.classes[CONTRACT_ID].getService(Components.interfaces.nsISupports).wrappedJSObject;
}


function Registry(){
	debug('Registry Object created');
	this.wrappedJSObject = this;
    this.consoleService = function(){
        return Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);
    }
    this.addComponent("yule","@coscripter.ibm.com/yule;1");
	this.addComponent("utils", "@coscripter.ibm.com/utils/;1");
    this.addComponent("labeler", "@coscripter.ibm.com/coscripter-labeler/;1");
	this.addComponent("abstracter", "@coscripter.ibm.com/coscripter-abstracter/;1");
	this.addComponent("contextRecorder", "@coscripter.ibm.com/coscripter-contextRecorder/;1");
    this.addComponent("parser","@coscripter.ibm.com/coscripter-strict-parser;1");
	this.addComponent("commands", "@coscripter.ibm.com/coscripter-command;1");
	this.addComponent("commandGenerator", "@coscripter.ibm.com/coscripter-command-generator;1");
	this.addComponent("tabler", "@coscripter.ibm.com/coscripter-scratch-table/;1");
	this.addComponent("logger", "@coscripter.ibm.com/coscripter-logger/;1");
	this.addComponent("utils", "@coscripter.ibm.com/coscripter-utils/;1");
	this.addComponent("statusbar", "@coscripter.ibm.com/coscripter-statusbar/;1");
	this.addComponent("databaseXpcom", "@coscripter.ibm.com/coscripter-database/;1");
    this.addComponent("uFObserver","@coscripter.ibm.com/coscripter-uf-observer/;1");
    this.addComponent("compiler","@coscripter.ibm.com/compiler;1");
    this.addComponent("executionEngine","@coscripter.ibm.com/execution-engine;1");
    this.addComponent("filterPassword","@coscripter.ibm.com/filter-password;1");
    this.addComponent("executionEnvironment","@coscripter.ibm.com/execution-exec-env;1");
    this.addComponent("coscripterPreview","@coscripter.ibm.com/coscripter-preview;1");
    this.addComponent("autoClip","@coscripter.ibm.com/auto-clip;1");
	debug('Registry Object filled up');
	return this;
}

Registry.prototype = {
	/** 
	 * for nsISupports
	 */
	QueryInterface: function(aIID){
		// add any other interfaces you support here
		if (!aIID.equals(nsISupports)) 
			throw Components.results.NS_ERROR_NO_INTERFACE;
		return this;
	},
	addComponent: function(name, gid){
        //debug("adding " + name + " component");
		this["_" + name] = null;
		this[name] = function(){
			try {
				if (this["_" + name] == null) {
					if (typeof(Components.classes[gid]) != "undefined") {
						this["_" + name] = Components.classes[gid].getService(Components.interfaces.nsISupports).wrappedJSObject;
					}
				}
                return this["_" + name];
			} 
			catch (e) {
				//debug("Error encountered in " + name + "(): " + e.toSource());
                return null ;
			}
		}
	}
}

function getRegistry(){
	return Components.classes["@coscripter.ibm.com/registry;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
}

//************************************************************************
//********************* XPCOM MODULE REGISTRATION*************************
//************************************************************************

//=================================================
// Note: You probably don't want to edit anything
// below this unless you know what you're doing.
//
// Factory
var RegistryFactory = {
	singleton: null,
	createInstance: function(outer, iid){
		if (outer != null) 
			throw Components.results.NS_ERROR_NO_AGGREGATION;
		if (this.singleton == null) 
			this.singleton = new Registry();
		return this.singleton.QueryInterface(iid);
	}
};


// Module
var RegistryModule = {
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
			return RegistryFactory;
		throw Components.results.NS_ERROR_NO_INTERFACE;
	},
	
	canUnload: function(aCompMgr){
		return true;
	}
};

//module initialization
function NSGetModule(aCompMgr, aFileSpec){
	return RegistryModule;
}

debug('done parsing components-registry.js');
