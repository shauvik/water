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


const CC = Components.classes, CI = Components.interfaces; 
var consoleService = CC['@mozilla.org/consoleservice;1']
			.getService(CI.nsIConsoleService);
function log(msg) {consoleService.logStringMessage(msg)};

/*This file contains
 listSlopInterpretations	the entry point for this file
    										i.e. this was originally the only function that gets called from outside this xpcom object
										Called by makeThisTheRunLine in the sidebar.
										Now addPBDLineToSidebar calls listCommands to see whether an ordinal needs to be added
											to make the PBDLine match the correct target
 createFormCommands 	creates all possible commands the user could perform 
										on html elements on the current web page
 preUseWebElement.		adds the .use object to each possible command.   
										.use.exec is the function that will actually execute this command
										.use.text is a human-readable description of the command
 listCommands				adds the GoTo Command to the list of Form Commands, 
										and sorts all of the commands by how well they match the slop
 createGoToCommand		creates a command to go to some other web page from the current page
 previewCommand 			highlights an element on the current page to show what this command will do if executed
*/

////////////////////////////////////////////////
// EXAMPLE:   If  www.google.com is loaded in the window...
//
//      listSlopInterpretations(window, "go put 'koala' in the search box", 2)
//
//returns the array
//      [
//          {
//              text : "enter 'koala' into the 'Google Search' textbox",
//              wordsUsed : ["put", "search", "box"], // these words from the original slop were used to arrive at this interpretation
//              execute : function() {...}, // calling this function will animate a green box over the search textbox, and enter the text 'koala'
//              preview : function() {...}, // calling this function will place a green box over the search textbox,
//													//showing what words will be entered there,
//                                          		// and remove the previously previewed command
//              command : ...you probably don't need this stuff...
//          },
//
//          {
//              text : "go to 'koala'",
//              wordsUsed : ["go"], // these words from the original slop were used to arrive at this interpretation
//              execute : function() {...}, // calling this function will go to the url 'koala', which firefox will probably pass through a search engine
//              preview : function() {...}, // the goto command doesn't have a preview, but calling this will remove the previously previewed command
//              command : ...you probably don't need this stuff...
//          }
//          // there might have been more interpretations, but we told it to keep at most 2 of them
//      ]
////////////////////////////////////////////////


// the Main Content Window is where the user acts on the current web page.
function listSlopInterpretations(mainContentWindow, slop, keepThisMany) {
    if (keepThisMany == 0) return [];
    // grab a pointer to the utility library if we don't already have it
    if ((typeof u) == "undefined") {
        u = Components.classes["@coscripter.ibm.com/coscripter-utils/;1"].getService(Components.interfaces.nsISupports).wrappedJSObject
    }
    document = mainContentWindow.document
    // delegate the task of interpreting slop to the listCommands function below
    var interpretations = []
    var commands = listCommands(mainContentWindow, slop)
    
    // keep only the proper number of interpretations
    u.trimArrayToSize(commands, keepThisMany)
    
    // ok, we are going to take each *command* and make an *interpretation* out of it...
    // ...this is pretty straightforward, except for the business about *preUse*,
    // what this does is perform some additional processing on the command,
    // for instance, if the command was an 'enter' command, then we need to guess
    // what text in the command is meant as the argument (e.g. the word 'koala' in the command 'enter koala into the textbox');
    // now we could have done this before, but we delay doing it till now,
    // because it can be computationally expensive,
    // and so we'll just do it for the top rated commands that we're actually going to keep
    
    // the command needs a copy of the original slop
    var slopIdent = new u.Ident(slop)
    
    for (var i = 0; i < commands.length; i++) {    
        var command = commands[i]
        
        // and now we actually call preUse (see discussion above)
        command.preUse(slopIdent)
        
        // this just builds the interpretation object, mainly with delegations to the original command object
        interpretations.push({
            command : command,
            text : command.use.text,
            wordsUsed : command.wordsUsed,
            execute : function (thenDoThis) {
                this.command.use.exec(thenDoThis)
            },
            preview : function () {
                previewCommand(this.command)
            }
        })
    }
    return interpretations
}

// these are words associated with different types of html objects, as well as the "open" command (which navigates to a new webpage);
// the number after each word is not currently used (it was used as a weight at one point, and it could conceivably be used that way in the future,
// see createFormCommands below)
var wordDataObjects = {
    "button" : {        
        "button" : 1.0,
    },
    "button link" : {        
        "button" : 1.0, "link" : 1.0, "anchor" : 1.0, "hyperlink" : 1.0
    },
    "checkbox" : {        
        "checkbox" : 1.0, "check" : 0.5, "box" : 0.5, "square" : 0.5
    },
    "radiobutton" : {        
        "radiobutton" : 1.0, "radio" : 0.5, "button" : 0.5, "circle" : 0.5
    },
    "textbox" : {        
        "textbox" : 1.0, "textarea" : 1.0, "text" : 0.5, "area" : 0.5, "field" : 1.0, "box" : 0.5, "input" : 1.0
    },
    "passwordbox" : {        
        "textbox" : 1.0, "textarea" : 1.0, "text" : 0.5, "area" : 0.5, "field" : 1.0, "box" : 0.5, "input" : 1.0, "password" : 1.0
    },
    "link" : {        
        "link" : 1.0, "anchor" : 1.0, "hyperlink" : 1.0
    },
    "listbox" : {        
        "choice" : 1.0, "menu" : 1.0, "options" : 0.5, "area" : 0.5, "box" : 0.5, "popup" : 1.0, "pop-up" : 1.0, "drop" : 0.5, "drop-down" : 1.0
    },
    "listitem" : {        
        "link" : 1.0, "anchor" : 1.0, "hyperlink" : 1.0
    },
}


var wordDataActions = {
    "button" : {
        "click" : 1.0, "press" : 1.0, "push" : 1.0, "hit" : 1.0,
    },
    "button link" : {
        "click" : 1.0, "press" : 1.0, "push" : 1.0, "hit" : 1.0, "follow" : 1.0,
    },
    "checkbox" : {
        "select" : 1.0, "check" : 1.0, "enable" : 1.0, "pick" : 1.0, "highlight" : 1.0, "set" : 1.0, "choose" : 1.0, "deselect" : 1.0, "unselect" : 1.0, "uncheck" : 1.0, "disable" : 1.0, "unpick" : 1.0, "clear" : 1.0, "unset" : 1.0,
    },
    "radiobutton" : {
        "select" : 1.0, "check" : 1.0, "enable" : 1.0, "pick" : 1.0, "highlight" : 1.0, "set" : 1.0, "choose" : 1.0,
    },
    "textbox" : {
        "enter" : 1.0, "=" : 1.0, "append" : 1.0, "type" : 1.0, "fill" : 1.0, "write" : 1.0, "print" : 1.0, "add" : 1.0, "insert" : 1.0, "put" : 1.0, "place" : 1.0,
    },
    "passwordbox" : {
        "enter" : 1.0, "type" : 1.0, "fill" : 1.0, "write" : 1.0, "print" : 1.0, "add" : 1.0, "insert" : 1.0,
    },
    "link" : {
        "click" : 1.0, "press" : 1.0, "push" : 1.0, "hit" : 1.0, "follow" : 1.0,
    },
    "listbox" : {
        "select" : 1.0, "check" : 1.0, "enable" : 1.0, "pick" : 1.0, "highlight" : 1.0, "set" : 1.0, "choose" : 1.0, 
    },
    "listitem" : {
        "select" : 1.0, "check" : 1.0, "enable" : 1.0, "pick" : 1.0, "highlight" : 1.0, "set" : 1.0, "choose" : 1.0, "deselect" : 1.0, "unselect" : 1.0, "uncheck" : 1.0, "disable" : 1.0, "unpick" : 1.0, "clear" : 1.0, "unset" : 1.0,
    },
    
    "open" : {
        "go" : 1, "goto" : 1, "open" : 1, "retrieve" : 1, "get" : 1, "load" : 1, "fetch" : 1,
    },
}


// this function is called on a command after it is rated as one of the top ones that we might actually want to execute,
// but before we can execute any command, we may need to do some additional calculations,
// like finding the argument for an enter command (e.g. the word 'koala' in the command 'enter koala into the textbox')
//
//The main thing this function does is add an attribute called *use* to the Command object,
// and places some information into it, including:
//      node : a pointer to the html element that the command will operate on (except for the goto command),
//      text : a string of human readable text which represents the command,
//      exec : a function that can be called to actually execute the command
//
// "this" is a command, and slopIdent is the ident for the current sloppy command line that we are interpreting, 
//assuming that this command's command.node is the target
function preUseWebElement(slopIdent) {

    // NOTE: it may have been possible to store the slop (which is in the *slopIdent* variable) as part of the command,
    // but I think there is a reason I didn't... I just don't remember now

    // Getting this information for buttons, links, checkboxes, listitems, and radiobuttons is pretty straightforward,
    // whereas we do a little more work for textboxes and passwordboxes
    if (this.type == "button" || this.type == "link") {
        this.use = {
            node : this.node,
            text : "click the \"" + this.label + "\" " + this.type,
            exec : function(thenDoThis) {
                u.click(this.node, thenDoThis)
            }
        }
    } else if (this.type == "button link" ) {
        this.use = {
            node : this.node,
            text : "click the \"" + this.label + "\" " + "button",
            exec : function(thenDoThis) {
                u.click(this.node, thenDoThis)
            }
        }
    } else if (this.type == "radiobutton" ) {
        this.use = {
            node : this.node,
            text : "select the \"" + this.label + "\" " + "button",
            exec : function(thenDoThis) {
                u.click(this.node, thenDoThis)
            }
        }
    } else if (this.type == "checkbox" || this.type == "listitem") {
        // for these objects, we need to figure out whether we are selecting or deselecting them, or inverting their selection (toggling),
        // and we do this with some simple heuristics
        
        if (slopIdent.set["toggle"] || slopIdent.set["flip"]) {
            this.use = {
                node : this.node,
                text : "toggle the \"" + this.label + "\" " + this.type,
                exec : function(thenDoThis) {
                    u.toggle(this.node, thenDoThis)
                }
            }
        } else {
            var on = true
            for (var word in slopIdent.set) {
                //if (word.match(/^(off|dis|un|de|not|non)/)) { 
                if (word.match(/^(off|disable|deselect|unselect|uncheck|unpick|unset|unmark)$/)) { 
                    on = false
                    break
                }
            }
            this.use = {
                node : this.node,
                text : "turn " + (on ? "on" : "off") + " the \"" + this.label + "\" " + this.type,
                exec : function(thenDoThis) {
                    u.turn(this.node, on, thenDoThis)
                }
            }
        }
    } else if (this.type == "textbox" || this.type == "passwordbox") {
    
        // we are going to enter (or append) text to the object,
        // so we need to figure out what text we are going to apply,
        // which we'll do by looking at substrings of text from the slop,
        // and finding a substring of text that we can extract from the slop,
        // such that the remaining slop is still a strong match for the command,
        //
        // for example: say we have the slop "enter koala into the textbox",
        // then extracting the word 'koala' leaves "enter into the textbox",
        // which still matches the words "enter", and "textbox", which is all it matched before,
        //
        // we also give extra points if the words in the slop immediately after or before the text
        // happen to be prepositions, so in our example above, it is good that the word "into" follows our extracted text "koala"
        //
        // we would have given even more points if there happend to be quotes on either side of the text we extracted
        //
		
		// This algorithm preferred "Division" to "your Bond Division" in 
		// 'enter your Bond Division into the "Division" textbox "SR"'
		//so "**2) Look up Koala database references" in makeThisTheRunLine now changes the slop to
		// 'enter "SR" into the "Division" textbox'
    
        var bestSubString = ""
        var bestScore = -1000000000
        for (var s = 0; s < slopIdent.tokens.length; s++) {
            for (var e = s + 1; e <= slopIdent.tokens.length; e++) {
				// The outer loop iterates over each word in the string as the starting word in subString,
				//and the inner loop tries all subStrings starting with that word. 
				//So for "Click the Continue button", subString is set to "click, click the, click the Continue, click the Continue button, the, the Continue, the Continue button, Continue, Continue button, button.
				// leftOver is set to the string with subString removed
                var leftOver = slopIdent.leftOver(s, e, "    ")
                var subString = slopIdent.subString(s, e)
                
                var score = 0
                score += this.calcScore(new u.Ident(leftOver))
                var re = /^(:|=|as|to|for|of|in)\s*/i
                var re2 = /\s+(to|into|on|at|in)$/i
                if (subString.match(re) && (e == slopIdent.tokens.length)) {
                    score += 1
                    subString = subString.replace(re, "")
                } else if (subString.match(re2)) {
                    score += 1
                    subString = subString.replace(re2, "")
                }
                if (subString.match(/^"([^"]*")+$/) || subString.match(/^'([^']*')+$/)) {
					//Huge bonus for being enclosed in quotes
					// This makes\"Project\" win over CHA in 'enter CHA into the "Project" textbox'
					//It's basically a bad idea to just look at slop without doing any syntactic parsing. (AC)
                    if (subString.match(/^"[^"]*"$/) || subString.match(/^'[^']*'$/) || !leftOver.match(/'|"/)) {
                        score += 3
                    } else {
                        score += 1
                    }
                    subString = subString.substring(1, subString.length - 1)
                }
                score += 0.001 * (e - s)
                
                if (score > bestScore) {
                    bestScore = score
                    bestSubString = subString
                }
            }
        }
        
        // now we'll see if we are appending text, or entering it;
        // for now, we'll default to entering text unless they use the magic keyword "append"
        if (slopIdent.set["append"]) {
            this.use = {
                node : this.node,
                text : "append \"" + bestSubString + "\" to the \"" + this.label + "\" " + this.type,
                
                // now this is new... what is decorateDiv?
                // well, we usually preview a command by placing a trasparent green box above it,
                // but this doesn't reveal enough for commands like "enter" or "append";
                // we'd like the user to see what the textbox will look like after the command has executed,
                // so the code that previews the command will see if the command has a *decorateDiv* function,
                // and if it does, it will give the command an extra opportunity to show any extra information it would like
                // in the otherwise bland transparent green rectangle
                //
                decorateDiv : function(div) {
                    var doc = div.ownerDocument
                    var textarea1 = doc.createElement("textarea")
                    var textarea2 = doc.createElement("textarea")
                    
                    textarea1.value = this.node.value
                    u.unfancy_appendText(bestSubString.replace(/\S/g, " "), textarea1)
                    textarea2.value = this.node.value.replace(/\S/g, " ")
                    u.unfancy_appendText(bestSubString, textarea2)
                    
                    textarea2.style.color = "green"
                    
                    div.style.opacity = 1
                    var pos = u.getNodePosition(this.node)
                    div.style.left = "" + (pos.x - 2) + "px"
                    div.style.top = "" + (pos.y - 2) + "px"
                    div.style.width = "" + (pos.w + 7) + "px"
                    div.style.height = "" + (pos.h + 7) + "px"
                    
                    textarea1.style.position = "absolute"
                    textarea1.style.top = "3px"
                    textarea1.style.left = "3px"
                    textarea1.style.width = "" + (pos.w - 7) + "px"
                    textarea1.style.height = "" + (pos.h - 7) + "px"
                    
                    textarea2.style.position = "absolute"
                    textarea2.style.top = "3px"
                    textarea2.style.left = "3px"
                    textarea2.style.width = "" + (pos.w - 7) + "px"
                    textarea2.style.height = "" + (pos.h - 7) + "px"
                    
                    div.appendChild(textarea1)
                    div.appendChild(textarea2)
                    
                    textarea2.style.opacity = 0.5
                    
                    textarea1.scrollTop = textarea1.scrollHeight
                    textarea2.scrollTop = textarea2.scrollHeight
                },
                exec : function(thenDoThis) {
                    u.appendText(bestSubString, this.node, thenDoThis)
                }
            }
        } else {
            this.use = {
                node : this.node,
                text : "enter \"" + bestSubString + "\" into the \"" + this.label + "\" " + this.type,
                
                // now this is new (unless you read the very same comment above)... what is decorateDiv?
                // well, we usually preview a command by placing a trasparent green box above it,
                // but this doesn't reveal enough for commands like "enter" or "append";
                // we'd like the user to see what the textbox will look like after the command has executed,
                // so the code that previews the command will see if the command has a *decorateDiv* function,
                // and if it does, it will give the command an extra opportunity to show any extra information it would like
                // in the otherwise bland transparent green rectangle
                //
                decorateDiv : function(div) {
                    var doc = div.ownerDocument
                    var textarea1 = doc.createElement("input")
                    var textarea2 = doc.createElement("input")
                    
                    textarea1.value = ""
                    textarea2.value = bestSubString
                    
                    textarea2.style.color = "green"
                    
                    div.style.opacity = 1
                    var pos = u.getNodePosition(this.node)
                    div.style.left = "" + (pos.x - 3) + "px"
                    div.style.top = "" + (pos.y - 3) + "px"
                    div.style.width = "" + (pos.w + 6) + "px"
                    div.style.height = "" + (pos.h + 6) + "px"
                    
                    textarea1.style.position = "absolute"
                    textarea1.style.top = "3px"
                    textarea1.style.left = "3px"
                    textarea1.style.width = "" + (pos.w) + "px"
                    textarea1.style.height = "" + (pos.h) + "px"
                    
                    textarea2.style.position = "absolute"
                    textarea2.style.top = "3px"
                    textarea2.style.left = "3px"
                    textarea2.style.width = "" + (pos.w) + "px"
                    textarea2.style.height = "" + (pos.h) + "px"
                    
                    div.appendChild(textarea1)
                    div.appendChild(textarea2)
                    
                    textarea2.style.opacity = 0.5
                },
                exec : function(thenDoThis) {
                    u.enter(bestSubString, this.node, thenDoThis)
                }
            }
        }
    } else {
    }
}


// 'enter your Bond Division into the "Division" textbox "SR"' returns 'your Bond Division'
function extractDbValue(slopIdent) {
	
}

// this is a list of words associated with various numbers, you can add more numbers if you like, and more words too
// (it is not necessary for the numbers to be contiguous, and it is not necessary for each number to have the same number of words associated with it)
var cardinals = {
    1 : "1 1st first",
    2 : "2 2nd second",
    3 : "3 3rd third",
    4 : "4 4th fourth",
    5 : "5 5th fifth",
    6 : "6 6th sixth",
    7 : "7 7th seventh",
    8 : "8 8th eighth",
    9 : "9 9th ninth",
    10 : "10 10th tenth",
}

// *window* should have some html that we are going to find commands in
// This function returns a list of Commands, sorted by how well they match the *slop*
function listCommands(mainContentWindow, slop) {
	var maxLabelLength = 50 // make sure this is the same length used in u.findUniqueDescriptor
	// remove any "..."'s ancestor descriptor before determining the slop
	var slopTargetAncestorDescriptor 		// e.g. | "Shop by Commodity"'s |
	slop = slop.replace(/ \"[^\"]*\"[\u0019\u2019\x19']s /, 
					// this function removes the ancestor descriptor from the slop
					//and it also sets slopTargetAncestorDescriptor to the match
					function (match) {		
						slopTargetAncestorDescriptor = match.substring(2, match.length-4)
						slopTargetAncestorDescriptor = slopTargetAncestorDescriptor.substring(0, maxLabelLength)
						return " "
					})
	// Eventually  do a more extensive parse (AC):
	//var slopAction, slopTarget, slopTargetDescriptor, slopTargetAncestorDescriptor, slopDbEntryName
	//parseSlop(slop, slopAction, slopTarget, slopTargetDescriptor, slopTargetAncestorDescriptor, slopDbEntryName)

	var slopIdent = new u.Ident(slop)  
    
// I. Build a list of all of the possible things the user could do on this page
    var commands = []
    
// I. A
    // the first command to add is available on any webpage;
    // namely, the command to go to a different webpage
	commands[0] = createGoToCommand(mainContentWindow)
    
// I. B
    // we delegate the task of finding commands to act on html elements to the 
	// createFormCommands function.
    // It acts recursively on frames and iframes in the mainContentWindow
    createFormCommands(mainContentWindow, commands)
    
// II. Sort by score
    // now that we have a list of commands,
    // we calculate their scores, to see how well each of them matches the input slop    
    for (var i = 0; i < commands.length; i++) {
        var command = commands[i]
        command.calcScore(slopIdent)
    }
	
    // now we sort them with a stable Sort
    // to ensure that html elements remain in order, so that we can use ordinals to index them if necessary  
    u.stableSort(commands, function(a, b) {return b.score - a.score})
    
    // this bit of code says,
    // if there is a tie amongst the highest scoring commands,
    // the user or recorder may have anticipated this, and supplied 
	// an ancestor descriptor, or an ordinal index into these commands,
    // so we'll check for that...
    //
    // e.g. consider www.google.com, and the user types "press the button",
    // well, there are two buttons, and each one would match the words "press" and "button",
    // so we'd have a tie between "Google Search" and "I'm Feeling Lucky",
    // but let's say the user typed "press the second button",
    // then we'd still have a tie, since the word "second" doesn't correspond to either button,
    // but we'll now look at the word "second" and pick the second highest scoring command as the desired one
	var ancestorDescriptors, ordinalScore
 	ancestorDescriptors:
	for (var i = 0; i < commands.length; i++) {
        var command = commands[i]
        if (command.score == commands[0].score) {
			// check for matching slopTargetAncestorDescriptor
			if (slopTargetAncestorDescriptor && 
				(ancestorDescriptors = u.findUniqueDescriptor(command.node, []))) {
				for (var j=0; j<ancestorDescriptors.length; j++) {
					if (ancestorDescriptors[j].search(slopTargetAncestorDescriptor) +1){
						commands.splice(i, 1)
						commands.unshift(command)
						break ancestorDescriptors;
					}
				}
			}
			// check for matching ordinal
            ordinalScore = slopIdent.score(new u.Ident(cardinals[i + 1]), command.wordsUsed)
            if (ordinalScore > 0) {
                commands.splice(i, 1)
                commands.unshift(command)
                break
            }
        } else {
            break
        }
    }
    
    return commands
}    


function createGoToCommand(mainContentWindow) {
	var command = {canExecute : true}
	
	command.calcScore = function(ident) {	
		// "go to <url>" is a clear win
		var gotoRegexp = new RegExp("^\\s*go\\s*(to)?\\s*[:'\"\\(]*\\s*" + u.urlRegex.source, "i")
		if (ident.string.match(gotoRegexp)) {
			this.score = 100
			return
		}
			
		// this gives a score representing how well the given *ident* matches this command,
		// based on how many words in the *ident* correspond to words commonly associated with this command,
		// like "go" "open" "load" etc... (they are listed in *wordData* above)
		this.score = 0
		this.wordsUsed = {}
		for (var word in ident.set) {
			var score = u.bagGet(wordDataActions["open"], word)
			this.score += score
			if (score > 0.2) {
				this.wordsUsed[word] = 1
			}
		}
		
		// we also add some score if we find a long string of stuff that looks like a url
		this.score += u.safeLength(ident.string.match(/:\/|\w[.\/\\]\w/g))
	}
	
	command.preUse = function(ident) {
		// similar to the enter command (see comments above),
		// we try to find a substring in the *ident* which is most likely to be the url argument for this command
	
		// ... first, we try matching the url with a regular expression that is pretty strict about url syntax,
		// and we keep the longest such match
		var bestSubString = null
		var url = ident.string.match(new RegExp(u.urlRegex.source, "g"))
		if (url) {
			bestSubString = ""
			for (var i in url) {
				if (url[i].length > bestSubString.length) {
					bestSubString = url[i]
				}
			}
		}
		// ... if we fail to find a url that way,
		// then we use a technique similar to that used for extracting a string of text in the enter and append commands above
		if (!bestSubString) {
			bestSubString = ""
			var bestScore = -1000000000
			for (var s = 0; s < ident.tokens.length; s++) {
				for (var e = s + 1; e <= ident.tokens.length; e++) {
					var leftOver = ident.leftOver(s, e, "    ")
					var subString = ident.subString(s, e)
					
					var score = 0
					if (subString.match(/^"([^"]*")+$/) || subString.match(/^'([^']*')+$/)) {
						if (subString.match(/^"[^"]*"$/) || subString.match(/^'[^']*'$/) || !leftOver.match(/'|"/)) {
							score += 0.2
						} else {
							score += 0.1
						}
						subString = subString.substring(1, subString.length - 1)
					}
					score += u.safeLength(subString.match(/:\/|\w[.\/\\]\w/g))
					score -= u.safeLength(subString.match(/\s+/))
					
					if (score > bestScore) {
						bestScore = score
						bestSubString = subString
					}
				}
			}
		}  // end of if (!bestSubString)
		var inNewWindow = ""
		if (ident.string.search(/tab\s*$/)+1) inNewWindow = "inNewTab"
		if (ident.string.search(/window\s*$/)+1) inNewWindow = "inNewWindow"
		this.use = {
			node : null,
			text : "go to " + bestSubString,
			exec : function(thenDoThis) {
				u.goToUrl(u.getBrowser(u.getChromeWindowForWindow(mainContentWindow)), bestSubString, thenDoThis, inNewWindow)
			}
		}   // end of this.use
	}  // end of preUse
	
	return command
}


// For each html tag element on the current web page,
// cobble together a Command object listing synonyms for the element, and for what can be done with it.
// Add all of these Commands to the *commands* array
/* For example,  
<option alt="50 properties" value="50">50</option>
gets a Command object with
	label:		"50 properties 50"
	node:		the target element
	type:		"listitem"
	words:	an Ident
	preUse:	the preUseWebElement function
	calcScore:	the function words.score(Ident, this.wordsUsed)
	
The 'words' Ident has 
	.set:		"select check enable pick hilite set choose link anchor hyperlink"
	.token:	"50 properties 50 select check enable pick hilite set choose link anchor hyperlink"
*/
function createFormCommands(window, commands) {
    // recursively scrape for commands on frames nested beneath this window
    for (var i = 0; i < window.frames.length; i++) {
        createFormCommands(window.frames[i], commands)
    }

    var document = window.document
    var htmlElements, node
    try {
        // this xpath will return a list of all of the html elements on the page (that the user can perform an action on)
        htmlElements = document.evaluate("//A | //OPTION | //BUTTON | //TEXTAREA | //INPUT[not(@type) or @type!='hidden']", document, null, 0, null)
		//var ACount = document.evaluate("count(//A)",  document, null, 1, null).numberValue
        while (node = htmlElements.iterateNext()) {
            // we convert the element's tag type to a human-readable form (more importantly, a form that exists in the *wordData* object above), such as listitem
            var type = getLabeler().getTargetType(node)						
            var label = getLabeler().getLabel(node)
            
			// here, we build a set of words associated with this element,
			// e.g. the "I'm feeling lucky" button on google's main page will have words like:
			// "I'm" "feeling" "lucky" "button" "press" "click" etc...
			var words = []
			
			// the first set of words comes from the label itself
			 words.push(label)
			
			// next we generate some words based on things like where the object is located on the webpage            
			var pos = u.getNodePosition(node)
			if (pos.w > 64 && pos.h > 64) {
				words.push("big")
				words.push("large")
			}
			if (pos.x <= 100) {
				words.push("left")
			}
			if (pos.x >= node.ownerDocument.defaultView.innerWidth - 100) {
				words.push("right")
			}
			if (pos.y <= 100) {
				words.push("top")
			}
		
			// finally, we add all the words from the *wordData* object, based on this object's type
			for (var k in wordDataObjects[type]) {words.push(k)}
			for (var k in wordDataActions[type]) {words.push(k)}
		
			// now we build a nice long string of all these words, and make an Ident out of it
			words = new u.Ident(words.join(" "))
		
			// finally, we pack all this info into a command
			commands.push({
				node : node,
				label : label,
				type : type,
				words : words,
				canExecute : true,
				preUse : preUseWebElement, // see above
				calcScore : function (ident) {
					this.wordsUsed = {}
					this.score = this.words.score(ident, this.wordsUsed)
					return this.score
				},
			})
        } //end of while iteration over htmlElement nodes
    } catch (e) {
       dump("Error iterating through interesting nodes: " + e + "\n");
    }
}


// this function should have whatever code is necessary to undo the previously highlighted command
var dealWithPreviouslyHighlightedNode = null

function clearPreview() {
    if (dealWithPreviouslyHighlightedNode) {
        dealWithPreviouslyHighlightedNode()
    }
    dealWithPreviouslyHighlightedNode = null
}

// *runMe* is a Command object,
// and this code will preview it (and remove whatever was previewed earlier)
function previewCommand(runMe) {
    clearPreview()
    
    if (runMe && runMe.use) {
        if (runMe.use.node) {
			if ((typeof u) == "undefined") {
				u = Components.classes["@coscripter.ibm.com/coscripter-utils/;1"].getService(Components.interfaces.nsISupports).wrappedJSObject
			}
            // make sure we can see the node we are previewing
            u.ensureVisible(runMe.use.node)
        
            // highlight the node, and if the command has some special desires about how to highlight itself,
            // give it a go (see the 'enter' and 'append' command comments above about 'decorateDiv')
            var color = runMe.canExecute ? "green" : "red";
            var div = u.highlightNode(runMe.use.node, color)
            if (runMe.use.decorateDiv) {
                runMe.use.decorateDiv(div)
            }
            
            // we want the user to be able to click the thing that is highlighted if they want to,
            // but this is impossible when there is a div blocking the mouse commands (and I don't know a good way to forward them
            // to the node beneath them),
            // so instead, we handle mouse events to hide the div whenever the user hovers their mouse over it
            //            
            var overHandler = function(e) {
                u.setVisible(div, false)
            }
            var outHandler = function(e) {
                u.setVisible(div, true)
            }
            
            div.addEventListener("mouseover", overHandler, false)
            runMe.use.node.addEventListener("mouseout", outHandler, false)
            
			// if the node is a textbox, hide the div whenever the user starts typing into the textbox
			if (runMe.targetType == "textbox") {
				runMe.use.node.addEventListener("keypress", overHandler, false)
			}
			
            // create a function that will undo all this, we'll need this later when the user wants to preview some other command            
            dealWithPreviouslyHighlightedNode = function() {
                runMe.use.node.removeEventListener("mouseout", outHandler, false)
                runMe.use.node.removeEventListener("keypress", overHandler, false)
                div.parentNode.removeChild(div)
            }
        }
    }
}


// Labeler
var gLabeler = null ;
function getLabeler(){
	// Ensure single instance
	if (gLabeler == null) {
		gLabeler = CC["@coscripter.ibm.com/coscripter-labeler/;1"].getService(CI.nsISupports).wrappedJSObject;
	}
	return gLabeler;
}

////////////////////////////////////////////////////////////////////////////////
// the code below is based on template from:
// developer.mozilla.org/en/docs/Code_snippets:JS_XPCOM
// template had the license: MIT License 

var global_this = this

function ExampleComponent()
{
	// Add any initialisation for your component here.
    this.wrappedJSObject = global_this;
}

ExampleComponent.prototype = {
QueryInterface: function(iid)
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
};

var initModule =
{
	ServiceCID: Components.ID("{618596c9-00f6-4fda-9a65-cb14cffd1c3d}"),  // Insert a guid in the quotes
	ServiceContractID: "@coscripter.ibm.com/coscripter-slop-interpreter/;1",                          // Insert a contract ID in the quotes
	ServiceName: "coscripter-slop-interpreter",                                                      // Insert your own name in the quotes
	
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
			throw Components.results.NS_ERROR_NO_INTERFACE
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
			return new ExampleComponent().QueryInterface(iid);
		}
	}
}; //Module

function NSGetModule(compMgr, fileSpec)
{
	return initModule;
}
