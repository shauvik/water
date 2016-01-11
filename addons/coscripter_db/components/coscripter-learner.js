/**
 * @author Jalal
 */

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
Contributor(s): Jalal Mahmud<jumahmud@us.ibm.com>, Clemens Drews <cdrews@almaden.ibm.com> 

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
const CLASS_ID = Components.ID("04bcd120-667a-11de-8a39-0800200c9a66");
const CLASS_NAME = "CoscripterConceptLearner";
const CONTRACT_ID = "@coscripter.ibm.com/coscripter-conceptlearner/;1";

//======================================================
// Debug Section

var consoleService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);

//var doConsoleDebugging = false ;
var Preferences = {
	DO_CONSOLE_DEBUGGING		: true,
	DO_DUMP_DEBUGGING 			: true,
}

function debug(msg){
	if(Preferences.DO_CONSOLE_DEBUGGING){
		consoleService.logStringMessage("from concept learner: " + msg );
	}else if(Preferences.DO_DUMP_DEBUGGING){
		dump(" from coscripter learner: " + msg + "\n");
	}
}

//debug('parsing coscripter learner');

function getCoscripterConceptLearner(){
	return Components.classes["@coscripter.ibm.com/coscripter-conceptlearner/;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
}




    

    /**
	 * Hashtable provides a methods over Javascript objects 
	 * to easily treat it as a hashtable.
	 */
	function Hashtable() {
		var hashtable = new Array();
		
		this.clear = function() {
			hashtable = new Array();
		}
		
		this.containsKey = function(key) {
			return (hashtable[key] != null);
		};
		
		this.containsValue = function(value) {
			if (value == null)
				return false;
			
			for (var i in hashtable) {
				if (hashtable[i] == value) {
					return true;
				}
			}
				
			return false;
		};
		
		this.containsValueReturnKey = function(value) {
			if (value == null)
				return -1;
			
			for (var i in hashtable) {
				if (hashtable[i] == value) {
					return i;
				}
			}
				
			return -1;
		};
		
		this.get = function(key) {
			if (this.containsKey(key))
				return hashtable[key];
			else return null;	
		};
		
		this.put = function(key, value) {
		    if (key == null || value == null) {
		        throw "NullPointerException: key and value are null";
		    } else {
		        hashtable[key] = value;
		    }
		};
		
		this.remove = function(key) {
			var value = hashtable[key];
		    hashtable[key] = null;
		    return value;
		}
		
		this.size = function() {
			var size = 0;
		    for (var i in hashtable) {
		        if (hashtable[i] != null) {
		            size++;
				}
		    }
		    return size;
		};
		
		this.isEmpty = function() {
			return (this.size() == 0);
		};
		
		this.keys = function() {
			var keys = new Array();
			for (var i in hashtable) {
				if (hashtable[i] != null)
					keys.push(i);
			}
			return keys;
		};
		
		this.values = function() {
			var values = new Array();
			for (var i in hashtable) {
				if (hashtable[i] != null)
					values.push(hashtable[i]);
			}
			return values;
		};
		
		this.toString = function() {
			var str = "";
			for (var i in hashtable) {
				str += i + " : " + hashtable[i] + "\n";
			}
			return str;
		}
		
		return this;
}

/**
 * Directorizer is a Singleton object to create directories easily.
 */
var Directorizer = {
	/**
	 * Returns the profile directory.
	 * @return nsIFile
	 */
	getProfileDir : function()
	{
		return Components.classes["@mozilla.org/file/directory_service;1"]
						.getService(Components.interfaces.nsIProperties)
						.get("ProfD", Components.interfaces.nsIFile);
	},
	
	/**
	 * Returns the directory with the specified root and name.
	 * The root directory must exist. If directories specified by name
	 * do not exist, they are created.
	 * @return nsIFile
	 */
	get : function(root, name) 
	{
		var tokens = name.split("/");
		
		var dir = root.clone();
		for (var i = 0; i < tokens.length; i++)
		{
			var token = tokens[i];
			if (token.length > 0)
			{
				dir.append(token);
				
				if (!dir.exists())
				{
					dir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0755);
				}
			}
		}
		
		return dir;
	},
	
	/**
	 * Returns the directory with the specified root and name.
	 * The root directory must exist. If directories specified by name
	 * do not exist, they are created.
	 * @return nsIFile
	 */
	getButDontCreate : function(root, name) 
	{
		var tokens = name.split("/");
		
		var dir = root.clone();
		for (var i = 0; i < tokens.length; i++)
		{
			var token = tokens[i];
			if (token.length > 0)
			{
				dir.append(token);
				
				if (!dir.exists())
				{
					//dir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0755);
					return null;
				}
			}
		}
		
		return dir;
	},
	
	/**
	 * Returns the contents of the directory specified by root and name.
	 * @return Array of nsIFile objects
	 */
	entries : function(root, name)
	{
		var dir = Directorizer.get(root, name);
		var files = dir.directoryEntries.QueryInterface(Components.interfaces.nsISimpleEnumerator);
		var entries = new Array();
		while (files.hasMoreElements()) {
			var file = files.getNext().QueryInterface(Components.interfaces.nsIFile);
			entries.push(file);
		}
		return entries;
	}
};



function CoscripterConceptLearner(){	
	// Component registry
    this.components = Components.classes["@coscripter.ibm.com/registry;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
 
 		
	this.conceptWordHash = new Hashtable();	
	this.conceptWordTFIDFHash = new Hashtable();	
		
	this.wordConceptInverseHash = new Hashtable();	 
	this.wordConceptTFIDFInverseHash = new Hashtable();	 
		
		
	this.conceptActionPatternHash = new Hashtable();	
	this.conceptActionPatternTFIDFHash = new Hashtable();	
		
	this.actionPatternConceptInverseHash = new Hashtable();		
	this.actionPatternConceptTFIDFInverseHash = new Hashtable();		
		
		
	this.actionPatternWordsInverseHash = new Hashtable();		
	this.actionPatternWordsTFIDFInverseHash = new Hashtable();		
		
			
	this.concepts = new Array();
	this.features = new Array();
		
	this.patternconcepts = new Array();
	this.patterns = new Array();	


	this.wrappedJSObject= this;
    return this;
}


CoscripterConceptLearner.prototype ={
	QueryInterface: function(aIID){
		// add any other interfaces you support here
		if (!aIID.equals(nsISupports))
			throw Components.results.NS_ERROR_NO_INTERFACE;
		return this;
	},
	
	
  
  extractIndent : function (txt) {
    var indent = 0;
    for ( var i = 0; i < txt.length; i++ ) {
       if ( txt[i] == '*' )
          indent++;
       else
          break;
	}
    return indent;
   },
   
   
	
	
    loadConceptModels: function() {
		try {
			var modelFromDisk = this.loadModelFile("conceptmodel1.json");
			if (modelFromDisk == null) return;			
	
			/////////////////////////////////////////////////////////////////////////
			var conceptmodel = modelFromDisk.conceptmodel;				
			
			for (var i = 0; i < conceptmodel.length; i++) {
				var concept = conceptmodel[i];
				var conceptkey = concept.split(":")[0];
				var conceptval = concept.split(":")[1];
				var conceptvaltokens = conceptval.split(",");
				var conceptwordArray = new Array();
			
				for (var j = 0; j < conceptvaltokens.length; j++) {
					var conceptword = conceptvaltokens[j];
					conceptwordArray = conceptwordArray.concat(new Array(conceptword));	
				}
				this.conceptWordHash.put(conceptkey, conceptwordArray);
			}			
			this.concepts = this.conceptWordHash.keys();			
			//alert("loaded: concepts " + this.concepts);	
			
			/////////////////////////////////////////////////////////////////////////			
			var wordmodel = modelFromDisk.wordmodel;						
			
			for (var i = 0; i < wordmodel.length; i++) {
				var word = wordmodel[i];
				var wordkey = word.split(":")[0];
				var wordval = word.split(":")[1];
				var wordvaltokens = wordval.split(",");
				var wordconceptArray = new Array();
				for (var j = 0; j < wordvaltokens.length; j++) {
					var wordconcept = wordvaltokens[j];
					wordconceptArray = wordconceptArray.concat(new Array(wordconcept));
				}
				this.wordConceptInverseHash.put(wordkey, wordconceptArray);
			}			
			this.features = this.wordConceptInverseHash.keys();				
			//alert("loaded: features " + this.features);	
						
			/////////////////////////////////////////////////////////////////////////			
			var conceptpatternmodel = modelFromDisk.conceptPatternModels;									
			
			//alert("loaded: concept pattern models " + modelFromDisk.conceptPatternModels);
			
			for (var i = 0; i < conceptpatternmodel.length; i++) {
				var pattern = conceptpatternmodel[i];				
				var patternkey = pattern.split(":")[0];				
				var patternval = pattern.split(":")[1];				
				var patternvaltokens = patternval.split(",");
				
				var conceptPatternArray = new Array();				
				for (var j = 0; j < patternvaltokens.length; j++) {
					var patternconcept = patternvaltokens[j];
					conceptPatternArray = conceptPatternArray.concat(new Array(patternconcept));
				}
				this.conceptActionPatternHash.put(patternkey, conceptPatternArray);
			}			
			this.patternconcepts = this.conceptActionPatternHash.keys();		
			//alert("loaded: patternconcepts " + this.patternconcepts);
			
			/////////////////////////////////////////////////////////////////////////			
			var patternconceptmodel = modelFromDisk.patternConceptModels;									
			
			//alert("loaded: pattern concept models " + modelFromDisk.patternConceptModels);			
			
			for (var i = 0; i < patternconceptmodel.length; i++) {
				var concept = patternconceptmodel[i];
				
				//alert("concept pattern is " + conceptpattern);
				
				var conceptkey = concept.split(":")[0];				
				var conceptval = concept.split(":")[1];
				
				var conceptvaltokens = conceptval.split(",");
				var patternConceptArray = new Array();
				
				for (var j = 0; j < conceptvaltokens.length; j++) {
					var conceptpattern = conceptvaltokens[j];
					//alert("concept pattern is " + conceptpattern);
					patternConceptArray = patternConceptArray.concat(new Array(conceptpattern));
				}
				//alert("concept pattern is " + conceptkey + "conceptval is " + conceptval);
				
				this.actionPatternConceptInverseHash.put(conceptkey, patternConceptArray);
			}
			this.patterns = this.actionPatternConceptInverseHash.keys();
			//alert("loaded: patterns " + this.patterns);					
			
			//////////////////////////////////////////////////////////////////////////
			var patternWords = modelFromDisk.patternWords;									
			
			for (var i = 0; i < patternWords.length; i++) {
				var patternWord = patternWords[i];
				
				var patternWordkey = patternWord.split(":")[0];				
				var patternWordval = patternWord.split(":")[1];
				
				var patternWordvaltokens = patternWordval.split(",");
				var patternWordArray = new Array();
				
				for (var j = 0; j < patternWordvaltokens.length; j++) {
					var patternword = patternWordvaltokens[j];
					patternWordArray = patternWordArray.concat(new Array(patternword));
				}
				this.actionPatternWordsInverseHash.put(patternWordkey, patternWordArray);
			}		
			//alert("loaded: word patterns " + this.actionPatternWordsInverseHash.keys());			
			
		
		    /////////////////////////////////////////////////////////////////////////
			var conceptmodelTFIDF = modelFromDisk.conceptmodelTFIDF;				
			
			for (var i = 0; i < conceptmodelTFIDF.length; i++) {
				var concept = conceptmodelTFIDF[i];
				var conceptkey = concept.split(":")[0];
				var conceptval = concept.split(":")[1];
				var conceptvaltokens = conceptval.split(",");
				var conceptwordArray = new Array();
			
				for (var j = 0; j < conceptvaltokens.length; j++) {
					var conceptword = conceptvaltokens[j];
					conceptwordArray = conceptwordArray.concat(new Array(conceptword));	
				}
				this.conceptWordTFIDFHash.put(conceptkey, conceptwordArray);
			}			
			//this.concepts = this.conceptWordHash.keys();			
			//alert("loaded: concepts " + this.concepts);	
			
			/////////////////////////////////////////////////////////////////////////			
			var wordmodelTFIDF = modelFromDisk.wordmodelTFIDF;						
			
			for (var i = 0; i < wordmodelTFIDF.length; i++) {
				var word = wordmodelTFIDF[i];
				var wordkey = word.split(":")[0];
				var wordval = word.split(":")[1];
				var wordvaltokens = wordval.split(",");
				var wordconceptArray = new Array();
				for (var j = 0; j < wordvaltokens.length; j++) {
					var wordconcept = wordvaltokens[j];
					wordconceptArray = wordconceptArray.concat(new Array(wordconcept));
				}
				this.wordConceptTFIDFInverseHash.put(wordkey, wordconceptArray);
			}			
			//this.features = this.wordConceptInverseHash.keys();				
			//alert("loaded: features " + this.features);	
						
			/////////////////////////////////////////////////////////////////////////			
			var conceptpatternmodelTFIDF = modelFromDisk.conceptPatternModelsTFIDF;									
			
			//alert("loaded: concept pattern models " + modelFromDisk.conceptPatternModels);
			
			for (var i = 0; i < conceptpatternmodelTFIDF.length; i++) {
				var pattern = conceptpatternmodelTFIDF[i];				
				var patternkey = pattern.split(":")[0];				
				var patternval = pattern.split(":")[1];				
				var patternvaltokens = patternval.split(",");
				
				var conceptPatternArray = new Array();				
				for (var j = 0; j < patternvaltokens.length; j++) {
					var patternconcept = patternvaltokens[j];
					conceptPatternArray = conceptPatternArray.concat(new Array(patternconcept));
				}
				this.conceptActionPatternTFIDFHash.put(patternkey, conceptPatternArray);
			}			
			//this.patternconcepts = this.conceptActionPatternHash.keys();		
			//alert("loaded: patternconcepts " + this.patternconcepts);
			
			/////////////////////////////////////////////////////////////////////////			
			var patternconceptmodelTFIDF = modelFromDisk.patternConceptModelsTFIDF;									
			
			//alert("loaded: pattern concept models " + modelFromDisk.patternConceptModels);			
			
			for (var i = 0; i < patternconceptmodelTFIDF.length; i++) {
				var concept = patternconceptmodelTFIDF[i];
				
				//alert("concept pattern is " + conceptpattern);
				
				var conceptkey = concept.split(":")[0];				
				var conceptval = concept.split(":")[1];
				
				var conceptvaltokens = conceptval.split(",");
				var patternConceptArray = new Array();
				
				for (var j = 0; j < conceptvaltokens.length; j++) {
					var conceptpattern = conceptvaltokens[j];
					//alert("concept pattern is " + conceptpattern);
					patternConceptArray = patternConceptArray.concat(new Array(conceptpattern));
				}
				this.actionPatternConceptTFIDFInverseHash.put(conceptkey, patternConceptArray);
			}
			//this.patterns = this.actionPatternConceptInverseHash.keys();
			//alert("loaded: patterns " + this.patterns);					
			
			//////////////////////////////////////////////////////////////////////////
			var patternWordsTFIDF = modelFromDisk.patternWordsTFIDF;									
			
			for (var i = 0; i < patternWordsTFIDF.length; i++) {
				var patternWord = patternWordsTFIDF[i];
				
				var patternWordkey = patternWord.split(":")[0];				
				var patternWordval = patternWord.split(":")[1];
				
				var patternWordvaltokens = patternWordval.split(",");
				var patternWordArray = new Array();
				
				for (var j = 0; j < patternWordvaltokens.length; j++) {
					var patternword = patternWordvaltokens[j];
					patternWordArray = patternWordArray.concat(new Array(patternword));
				}
				this.actionPatternWordsTFIDFInverseHash.put(patternWordkey, patternWordArray);
			}		
			//alert("loaded: word patterns " + this.actionPatternWordsInverseHash.keys());			
		
		
		
		
		} catch (e) {
			
		}			
	}, 	
	
	/**
	 * Load the Model object at the specified filename.
	 * @return Session object
	 */
	loadModelFile : function(filename) {
		try {
			var file = Directorizer.getButDontCreate(Directorizer.getProfileDir(), "actionshot/logs/" + filename);
			
			var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
			var sstream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
			
			//var fh = fopen(file, 0);			
			var fptr = fstream.init(file, -1, 0, 0);
			//return fptr;
			//if (fptr != null) {
			var sptr = sstream.init(fstream);
			
			if (file != null) {
				var data = "";
				var str = sstream.read(4096);
				while (str.length > 0) {
					data += str;
					str = sstream.read(4096);
				}
				
				sstream.close();
				fstream.close();
				
				
				// Decode the JSON data.
				var nativeJSON = Components.classes["@mozilla.org/dom/json;1"].createInstance(Components.interfaces.nsIJSON);
				var obj = nativeJSON.decode(data);
				
				var model = function(wordConceptInverseHash, 
		                     conceptWordHash, 
							 conceptActionPatterns, 
   						     actionPatternConcepts, 
							 patternWords, 
							 wordConceptInverseHashTFIDF, 
		                     conceptWordHashTFIDF, 
							 conceptActionPatternsTFIDF, 
						     actionPatternConceptsTFIDF, 
							 patternWordsTFIDF				 
	                 ) {
			
										
						this.wordmodel = wordConceptInverseHash;
						this.conceptmodel = conceptWordHash;				
						
						this.patternConceptModels = actionPatternConcepts;										
						this.conceptPatternModels = conceptActionPatterns;
						
						this.patternWords = patternWords;	
						
						this.wordmodelTFIDF = wordConceptInverseHashTFIDF;
						this.conceptmodelTFIDF = conceptWordHashTFIDF;				
						
						this.patternConceptModelsTFIDF = actionPatternConceptsTFIDF;				
						this.conceptPatternModelsTFIDF = conceptActionPatternsTFIDF;
						
						this.patternWordsTFIDF = patternWordsTFIDF;			
						
						return this;
				};

				return new model(obj.wordmodel, obj.conceptmodel, obj.conceptPatternModels, obj.patternConceptModels, obj.patternWords, obj.wordmodelTFIDF, obj.conceptmodelTFIDF, obj.conceptPatternModelsTFIDF, obj.patternConceptModelsTFIDF, obj.patternWordsTFIDF);
		  	}	
			else return null;
		} catch (e) {
			return null;	
		}	
		//} else return null;	
	},
	
	countFreqTFIDF : function (conceptVector, word, conceptVectorTFIDF) {
		var count = 0;
		for (var i = 0; i < conceptVector.length; i++) {
			if (conceptVector[i] == word) 
			count+=conceptVectorTFIDF[i];
		}
		return count;
	},

	computeCosineSimilarity: function(documentVector, conceptVector){
		var len1 = documentVector.length;
		var len2 = conceptVector.length;
		var similarity = 0;
		//alert("document vector is " + documentVector + "length of doc is" + documentVector.length);		    
			
		for (var i = 0; i<documentVector.length; i++) {
			//alert("document vector is[i] " + documentVector[i] + " concept vector is" + conceptVector);	
			if (conceptVector.indexOf(documentVector[i]) != -1) {
				//alert("I got a match here " + documentVector[i] + "concept vector is" + conceptVector);	
				countF = this.countFreq(conceptVector, documentVector[i]);
				similarity+=countF;
			}	
		}
		
		//alert("similarity is now " + similarity);		    

		var len = len1 + len2;
		similarity = 2*(similarity * 1.0)/len;
		return similarity;	
	}, 
	
	computeCosineSimilarityWithTFIDF: function(documentVector, conceptVector, conceptVectorTFIDF){
		var len1 = documentVector.length;
		var len2 = conceptVector.length;
		var similarity = 0;
		//alert("document vector is " + documentVector + "length of doc is" + documentVector.length);		    
			
		for (var i = 0; i<documentVector.length; i++) {
			//alert("document vector is[i] " + documentVector[i] + " concept vector is" + conceptVector);	
			if (conceptVector.indexOf(documentVector[i]) != -1) {
				//alert("I got a match here " + documentVector[i] + "concept vector is" + conceptVector);	
				countF = this.countFreqTFIDF(conceptVector, documentVector[i], conceptVectorTFIDF);
				similarity+=countF;
			}	
		}
		var len3 = 0;
		for (var j = 0; j< conceptVectorTFIDF.length; j++)
			len3+=conceptVectorTFIDF[j];
		
		var len = len1 + len3;
		similarity = (similarity * 1.0)/len;
		return similarity;	
	}, 

	getConceptByCosineSimilarityWithTFIDF : function (wordVector) {		
	    var maxSimilarity = 0;
		var detectedConcept = null;
		var newconceptvector = new Array();
		for (i = 0; i < this.concepts.length; i++) {
			var concept = this.concepts[i];
			var conceptVector = this.conceptWordHash.get(concept); 
			var conceptVectorTFIDF = this.conceptWordTFIDFHash.get(concept);
			
			var similarity = 0;
			var similarity = this.computeCosineSimilarityWithTFIDF(wordVector, conceptVector, conceptVectorTFIDF);
			if (similarity > maxSimilarity) {
				maxSimilarity = similarity;
				detectedConcept = concept;
			}
		}
		return detectedConcept;
	},

	getConceptByActionPatternCosineSimilarityWithTFIDF : function (patternVector) {		
	    var maxSimilarity = 0;
		var detectedConcept = null;
		for (i = 0; i < this.patternconcepts.length; i++) {
			var patternconcept = this.patternconcepts[i];
			var conceptVector = this.conceptActionPatternHash.get(patternconcept); 
			var conceptVectorTFIDF = this.conceptActionPatternTFIDFHash.get(patternconcept);
			//alert("hello, this concept vector is " + conceptVector + " pattern vector is " + patternVector);		    
			
			var similarity = 0;
			var similarity = this.computeCosineSimilarityWithTFIDF(patternVector, conceptVector, conceptVectorTFIDF);
			
			//alert("cosine similarity is  " + similarity);		    
			
			if (similarity > maxSimilarity) {
				maxSimilarity = similarity;
				detectedConcept = patternconcept;
				//alert("Hello: the concept is" + detectedConcept);
			}
		}

		return detectedConcept;
	},
	
	determineAction: function(words) {
		var actionPatterns = this.actionPatternWordsInverseHash.keys();
		var maxSimilarity = 0;
		var detectedPattern = words[0];
		try {
			for (var i = 0; i < actionPatterns.length; i++) {
				var actionPattern = actionPatterns[i];
				var wordsFromPattern = this.actionPatternWordsInverseHash.get(actionPattern);
				var wordsFromPatternArray = new Array();
				for (var j = 0; j < wordsFromPattern.length; j++) {
					var wordsFromPatternArray1 = wordsFromPattern[j].split(/[^\w]/);
					wordsFromPatternArray = wordsFromPatternArray.concat(wordsFromPatternArray1);
				}
				var similarity = 0;
				var similarity = this.computeCosineSimilarity(wordsFromPatternArray, words);
				if (similarity > maxSimilarity) {
					maxSimilarity = similarity;
					detectedPattern = actionPattern;
				}
			}
			debug("determined the action pattern " + detectedPattern);
		} catch (e) {
			debug("exception to determine an action pattern for the words " + words);
		}			
		return detectedPattern;		
		
	},
	
	determineConcept: function(words){
		var totalconcepts = new Array();
		var newwords = new  Array();
			
		for (var j = 0; j < words.length; j++) {
			var word = words[j];
			if (word == "") 
				continue;
			if (word.toLowerCase() == "on" ||
			word.toLowerCase() == "the" ||
			word.toLowerCase() == "for" ||
			word.toLowerCase() == "by" ||
			word.toLowerCase() == "to") 
				continue;
			var concepts = this.wordConceptInverseHash.get(word);
			var conceptsTFIDF = this.wordConceptTFIDFInverseHash.get(word);
			totalconcepts = totalconcepts.concat(concepts);						
			newwords = newwords.concat(word);
		}		
		var detectedConcept = this.getConcept(totalconcepts);
		detectedConcept = this.getConceptByCosineSimilarityWithTFIDF(newwords);
		return detectedConcept;
	},
	
	getConcept: function(totalconcepts) {		
		var maxFreq = 0;
		var maxConcept = null;		
		var i = 0;
			
		for (i=0; i<this.concepts.length; i++) {
			var concept = this.concepts[i];
			var freq = 0;	
			for (var j = 0; j<totalconcepts.length; j++) {
				if (totalconcepts[j] == concept) {
					freq++;					
				}
			}
			if (freq > maxFreq) {
				maxFreq = freq;
				maxConcept = concept;
			}
		}		
		return maxConcept;
	},

	determineConceptWithActionPattern : function (actionpattern){
		var totalconcepts = new Array();
		var newwords = new  Array();
		//debug("I am here");
		var totalconcepts = this.actionPatternConceptInverseHash.get(actionpattern);		
		debug('total concepts is  ' + totalconcepts + 'for the action pattern ' + actionpattern);
		debug('but the keys are ' + this.actionPatternConceptInverseHash.keys());
		debug('but the hastable is ' + this.actionPatternConceptInverseHash.toString());
		
		try {
		
			if (totalconcepts != null) {
				var detectedConcept = this.getConceptByActionPatternCosineSimilarityWithTFIDF(actionpattern);
				debug('detected concept for the pattern ' + actionpattern + 'is ' + detectedConcept);
				return detectedConcept;
			}
			else {
				return null;
			}
		} catch (e) {
			debug("From concept learner exception for " + actionpattern);							
		}
	}
 

}
//************************************************************************
//********************* XPCOM MODULE REGISTRATION*************************
//************************************************************************

//=================================================
// Note: You probably don't want to edit anything
// below this unless you know what you're doing.
//
// Factory
var CoscripterConceptLearnerFactory = {
	singleton : null,
	createInstance: function (outer, iid)
	{
		if (outer != null)
			throw Components.results.NS_ERROR_NO_AGGREGATION;
		if (this.singleton == null)
			this.singleton = new CoscripterConceptLearner();
		return this.singleton.QueryInterface(iid);
	}
};


// Module
var CoscripterConceptLearnerModule = {
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
			return CoscripterConceptLearnerFactory;
		throw Components.results.NS_ERROR_NO_INTERFACE;
	},

	canUnload: function(aCompMgr) { return true; }
};

//module initialization
function NSGetModule(aCompMgr, aFileSpec) { return CoscripterConceptLearnerModule; }
//debug('done parsing coscripter concept learner');

