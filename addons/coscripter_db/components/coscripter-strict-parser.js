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
Contributor(s): Greg Little, Allen Cypher (acypher@us.ibm.com), Tessa Lau, Clemens Drews, James Lin, Jeffrey Nichols, Eser Kandogan, Jeffrey Wong, Gaston Cangiano, Jeffrey Bigham, Jalal Mahmud.

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
// Coscripter Strict Parser
//
//	ParserConstants
//	tokendefs
//
//	General Parsing Methods
//
//	parse()
//		EnterCommand
//		SelectCommand
//		ClickCommand
//		CopyCommand
//
//	targetSpec
//		parseVariableValue
//
//////////////////////////////////////////////

// dump('Parsing coscripter-strict-parsers.js component\n');

function CoScripterStrictParser()
{
	this.wrappedJSObject = this;
	return this;
}

/////////////////////////////////////////////////////////
// private object constructors
/////////////////////////////////////////////////////////

// A parsed Token is stored here
var Token = function(type,str,index){
    this.type= type;
    this.str=str;
	this.index = index ;
    return this ;
}

// definitions of the possible tokens and reserved words
var Tokendef = function(type,regex){
    this.type = type;
    this.regex = regex;
    return this ;
}

/////////////////////////////////////////////////////////
// CoScripterStrictParser prototype
/////////////////////////////////////////////////////////

CoScripterStrictParser.prototype = {
	
	ParseException : function(string){
		this.string = string ;
		return this ;
	},
		
	Parser : function(str,options){
		var components = Components.classes["@coscripter.ibm.com/registry;1"].getService(Components.interfaces.nsISupports).wrappedJSObject
		this.execEnv = components.executionEnvironment(); 		
		this.str = str;
		this.pos = 0;
		
		if (options != null) {
			if (typeof(options) != 'undefined') {
				// pass in your own execution environment into the constructor if 
				// you don't want the default one
				this.execEnv = options['execEnv'];
			}
		}
		this.str = str;
		this.pos = 0;
		return this ;
	},
	
	
	//	ParserConstants
	ParserConstants : {	
		GOTO : 'goto',
		PASTE : 'paste',
		GOBACK : 'goback',
		GOFORWARD : 'goforward',
		ENTER : 'enter',
		APPEND : 'append',
		SELECT  : 'select',
		TURN  : 'turn',
		CLICK : 'click',
		COPY : 'copy',
		SWITCH:'switch',
		CREATE:'create',
		RELOAD:'reload',		
		EXPAND: 'expand',
		COLLAPSE: 'collapse',
		TOGGLE: 'toggle',
		CLOSE:'close',
		FROM  : 'from',
		NUMBERWORD  : 'number',
		STRING : 'string',
		MATCHTOKEN : 'matchtoken',
		ENDSWITH : 'endswith',
		STARTSWITH : 'startswith',
		CONTAINS : 'contains',
		DISAMBIGUATOR : 'disambiguator',
		ORDINAL : 'ordinal',
		WORD : 'word',
		REGEX : 'regex',
		XPATH : 'xpath',
		LOC : 'loc',	// e.g. {x:12, y:55}  a location, used with an xPath
		SPACE : 'space',
		IN : 'in',
		AT : 'at',
		OF : 'of',
		IF : 'if',
		END : 'end',
		YOUR : 'your',
		YOU : 'you',
		EXAMPLE : 'example',
		TEXTBOX : 'textbox',
		CHECKBOXELEMENT : 'checkbox',
		RADIOBUTTONELEMENT : 'radiobutton',
		CLOSEBUTTONELEMENT : 'closebutton',
		BUTTONELEMENT : 'buttonelement',
		LINKELEMENT : 'linkelement',
		MENU : 'menu',
		ITEM : 'item',	//'item' is used by: dijitTreeNode, onClick handlers,  (AC)
		SECTION : 'section',//dojo section (for expand/collapse)
		THAT : 'that',
		TAB : 'tab',	// Browser Tab
		LISTELEMENT : 'listelement',
		AREAELEMENT : 'area',
		REGIONELEMENT : 'region',		
		CELL : 'cell',
		ROW : 'row',
		COLUMN : 'column',
		CELLREFERENCE : 'cellreference',	// eg cell A12
		//SCRATCHTABLEREFERENCE : 'scratch space',
		SCRATCHTABLEREFERENCE : 'scratchtable',
		TABLEREFERENCE : 'tablereference',
		BEGINEXTRACTION : 'begin extraction',
		ENDEXTRACTION : 'end extraction',
		TEXTEDITOR : 'text editor',	// Dojo rich text editor
		TEXT : 'text',
		ELEMENT : 'element',
		AFTER : 'after',
		PERIOD : '.',
		URL : 'url',
		THE : 'the',
		ONOFF : 'onoff',
		PAUSE : 'pause',
		WAIT : 'wait',
		SECONDS : 'seconds',
		NUM : 'num',
		COLON: ':',
		SEARCH : 'search',
		FOR : 'for',
		NEXT : 'next',
		PREVIOUS : 'previous',
		VERIFY: 'verify',	
		NOT : 'no',
		ARTICLE : 'a',
		AN: 'an',
		WHICH: 'which',
		WHOSE: 'whose',	
		REGIONELEMENT : 'region',
		DIALOGBOX : 'dialog box',			
		MAINWINDOW : 'main window',
		WINDOW : 'window',
		JS : 'Javascript',
		POUNDSIGN : '#'		
	},

	QueryInterface: function(aIID)
	{
	    // add any other interfaces you support here
	    if (!aIID.equals(Components.interfaces.nsISupports))
	        throw Components.results.NS_ERROR_NO_INTERFACE;
	    return this;
	}
}

CoScripterStrictParser.prototype.ParseException.prototype = {
	toString : function(){
		return this.string; 
	}
}

var ParserConstants = CoScripterStrictParser.prototype.ParserConstants;
var ParseException = CoScripterStrictParser.prototype.ParseException;

CoScripterStrictParser.prototype.Parser.prototype = {
	//	tokendefs
	tokendefs: [
		new Tokendef(ParserConstants.SPACE,/\s+/g),
        new Tokendef(ParserConstants.VERIFY,/(assert|verify)([\s]+there[\s]+is[\s]+)/gi),
        new Tokendef(ParserConstants.CLIP,/clip[\s]+the/gi),
		new Tokendef(ParserConstants.PASTE, /paste/gi),
        new Tokendef(ParserConstants.GOBACK,/go[\s]+back/gi),
        new Tokendef(ParserConstants.GOFORWARD,/go[\s]+forward/gi),
        new Tokendef(ParserConstants.GOTO,/go([\s]*to|) /gi),
		new Tokendef(ParserConstants.SWITCH,/switch to/gi),
		new Tokendef(ParserConstants.CREATE,/create/gi),
		new Tokendef(ParserConstants.CLOSE,/close/gi),
		new Tokendef(ParserConstants.RELOAD,/reload/gi),
		new Tokendef(ParserConstants.EXPAND,/expand/gi),
		new Tokendef(ParserConstants.COLLAPSE,/collapse/gi),
		new Tokendef(ParserConstants.TOGGLE,/toggle/gi),
		new Tokendef(ParserConstants.ENTER, /enter/gi),
		new Tokendef(ParserConstants.APPEND, /append/gi),
        new Tokendef(ParserConstants.CLICK,/(control)?(-)?click([\s]+on|)([\s]+the|)/gi),
		new Tokendef(ParserConstants.IN,/in(to|)([\s]+the|)/gi),
		new Tokendef(ParserConstants.AT,/at/gi),
		new Tokendef(ParserConstants.SELECT,/(select|choose)/gi),
		new Tokendef(ParserConstants.TURN,/turn/gi),
		new Tokendef(ParserConstants.PAUSE,/pause/gi),
		new Tokendef(ParserConstants.WAIT,/wait[\s]+(for the|until[\s]+there[\s]+is[\s]+)/gi),	    
		new Tokendef(ParserConstants.COPY, /copy/gi),
		new Tokendef(ParserConstants.IF, /if there is[\s]+/gi),
		new Tokendef(ParserConstants.SECONDS,/seconds/gi),
		new Tokendef(ParserConstants.FROM,/from([ ]the|)/gi),
		new Tokendef(ParserConstants.NUMBERWORD,/number/gi),
		new Tokendef(ParserConstants.YOUR,/your/gi),
		new Tokendef(ParserConstants.YOU,/you(:|)/gi),
		new Tokendef(ParserConstants.MATCHTOKEN,/the item that/gi),
		new Tokendef(ParserConstants.NOT,/no/gi), 
		new Tokendef(ParserConstants.AN,/an/gi), 		
		new Tokendef(ParserConstants.ARTICLE,/a/gi),
		new Tokendef(ParserConstants.THAT,/that/gi),
		new Tokendef(ParserConstants.WHICH,/which/gi),
		new Tokendef(ParserConstants.WHOSE,/whose/gi),
		new Tokendef(ParserConstants.NAME,/name/gi),
		new Tokendef(ParserConstants.CONTAINING,/containing/gi),
		new Tokendef(ParserConstants.STARTSWITH,/starts with/gi),
		new Tokendef(ParserConstants.ENDSWITH,/ends with/gi),
		new Tokendef(ParserConstants.CONTAINS,/contains/gi),
		new Tokendef(ParserConstants.EXAMPLE,/\((e\.g\.|i\.e\.)[^\)]*\)/gi),
		new Tokendef(ParserConstants.TEXTBOX,/(input([ ]|)field|(text|)box)/gi),
		new Tokendef(ParserConstants.AREAELEMENT,/area/gi),	// has to be before ELEMENT
		new Tokendef(ParserConstants.CHECKBOXELEMENT,/check[ ]*box/gi),
		new Tokendef(ParserConstants.RADIOBUTTONELEMENT,/(radio[ ]*button)/gi),
		new Tokendef(ParserConstants.CLOSEBUTTONELEMENT,/(close[ ]*button)/gi),
		new Tokendef(ParserConstants.BUTTONELEMENT,/button/gi),
		new Tokendef(ParserConstants.LINKELEMENT,/link/gi),
		new Tokendef(ParserConstants.MENUITEM,/menu[\s]*(item)+/gi),
		new Tokendef(ParserConstants.MENU,/menu/gi),
		new Tokendef(ParserConstants.ITEM,/item/gi),
		new Tokendef(ParserConstants.SECTION,/section/gi),
		new Tokendef(ParserConstants.TAB,/tab/gi),
		new Tokendef(ParserConstants.LISTELEMENT,/(listbox|list)/gi),
		new Tokendef(ParserConstants.CELL,/cell([ ]+(at|in))?/gi),
		new Tokendef(ParserConstants.ROW,/row/gi),
		new Tokendef(ParserConstants.COLUMN,/column/gi),
		//new Tokendef(ParserConstants.SCRATCHTABLEREFERENCE,/scratch space/gi),
		new Tokendef(ParserConstants.SCRATCHTABLEREFERENCE,/scratchtable/gi),
		new Tokendef(ParserConstants.TABLEREFERENCE,/table [0-9]+/gi),
		new Tokendef(ParserConstants.ELEMENT,/a|p|table|div|span|td|tr|anchor|heading|h[1-6]|element|node/gi),		
		new Tokendef(ParserConstants.DIALOGBOX,/dialog\s+box/gi),
		new Tokendef(ParserConstants.MAINWINDOW,/main\s+window/gi),
        new Tokendef(ParserConstants.WINDOW,/window/gi),
		new Tokendef(ParserConstants.BEGINEXTRACTION,/begin extraction/gi),
		new Tokendef(ParserConstants.ENDEXTRACTION,/end extraction/gi),
		new Tokendef(ParserConstants.TEXTEDITOR, /text editor/gi),
		new Tokendef(ParserConstants.TEXT, /text/gi),
		new Tokendef(ParserConstants.COLON, /:/),
		new Tokendef(ParserConstants.SEARCH, /\bsearch\b/gi),
		new Tokendef(ParserConstants.FOR, /\bfor\b/gi),
		new Tokendef(ParserConstants.NEXT, /\bnext\b/gi),
		new Tokendef(ParserConstants.PREVIOUS, /\bprevious\b/gi),
        new Tokendef(ParserConstants.POUNDSIGN,/#/gi),
		// TL TODO: parse everything that the recorder can spit out
		new Tokendef(ParserConstants.ORDINAL,/first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|thirteenth|fourteenth|fifteenth|sixteenth|seventeenth|eighteenth|nineteenth|[0-9]*1st|[0-9]*2nd|[0-9]*3rd|[0-9]*[0-9]th/gi),
		new Tokendef(ParserConstants.NUM,/\d+/gi),
		new Tokendef(ParserConstants.REGEX,/(r\"([^"\\]|\\.)*")|(r\'([^\'\\]|\\.)*\')/g),
		new Tokendef(ParserConstants.XPATH,/(x\"([^"\\]|\\.)*")|(r\'([^\'\\]|\\.)*\')/g),
		new Tokendef(ParserConstants.LOC,/\(([0-9]+\.?[0-9]*),([0-9]+\.?[0-9]*)\)/g),
		new Tokendef(ParserConstants.DISAMBIGUATOR,/(\"[^\"]*\"\'s)|('[^']*)'\'s|\"[^\"]*\" row\'s/g), //third exp is kludgy for "new3" row's (AC)
		new Tokendef(ParserConstants.STRING,/(\"([^"\\]|\\.)*")|(\'([^\'\\]|\\.)*\')/g),	// quoted string	
		new Tokendef(ParserConstants.PERIOD,/\./g),
		new Tokendef(ParserConstants.URL,/(file:\/\/|((http|https|ftp):\/\/)?[0-9a-zA-Z]+(\.[0-9a-zA-Z]+)+)?/),
		new Tokendef(ParserConstants.THE,/the/gi),
		new Tokendef(ParserConstants.ONOFF,/(on|off)/gi),
		new Tokendef(ParserConstants.OF,/of/gi), // must appear after ONOFF
		new Tokendef(ParserConstants.IN,/in(to|)([\s]+the[\s]+|)/gi),
		new Tokendef(ParserConstants.FROM,/from([ ]the|)/gi),
		new Tokendef(ParserConstants.AFTER, /after (the)?/gi),
        new Tokendef(ParserConstants.REGIONELEMENT,/region/gi),
 		new Tokendef(ParserConstants.JS,/(j\"([^"\\]|\\.)*")|(j\'([^\'\\]|\\.)*\')/g),
		// TL: moving CELLREFERENCE down to the end because it should not
		// override the "h2" match in ELEMENT
		new Tokendef(ParserConstants.CELLREFERENCE,/[a-zA-Z][0-9]+/gi),
		new Tokendef(ParserConstants.WORD,/[^\s'\"]+/g), // matches everything else		
    ], 
		
//	General Parsing Methods
// ********************************************************************************		
// **********************General Parsing Methods***********************************
// ********************************************************************************
// Scan for the next tokenRegex
	lex : function (){
	    var found = false;
	    var maxMatchLength = 0 ;
	    for(var i=0;i<this.tokendefs.length;i++){
			var tokendef = this.tokendefs[i]
			var tokenType = tokendef.type
			var tokenRegex = tokendef.regex
	        tokenRegex.lastIndex = this.pos ;
	        var match =tokenRegex.exec(this.str);
	        if (match !=null){
	            if(this.pos == match.index && match[0].length > maxMatchLength ){
	                maxMatchLength = match[0].length ;
					var t = new Token(tokenType,match[0],match.index);
					found = true;
	            }
	        }
	    }
	    if(found){
	    	this.pos += t.str.length ;
	    	return t;
	    }else{
			if ( this.pos >= this.str.length ){
				var t = new Token('end', null,this.pos);
	    		return t; 
			}else{
				throw new ParseException("no valid token found at pos" + this.pos + " : " + this.str.substring(this.pos));
			}
	    }
		return null;
	},

	// get the next token of type tokenType
	// if not available throws exception
	mandatory : function(tokenType){
		var token = this.nextToken();
		
		if( tokenType != null && token.type != tokenType){ 
			throw new ParseException("Expected " + tokenType + " but found " +token.type +" : " + token.str);
		} 
		return token ; 
	},

	// get the next token
	nextToken : function(){
		if(this.curToken != null){
			var t = this.curToken;
			this.curToken = null;
			return t ;
			
		}
		do{
			var token = this.lex();
		}while(token.type == ParserConstants.SPACE);
		
		return token;
	},

	// get the next token if its of type tokenType/null otherwise	
	optional : function(tokenType){
		var token = this.peekToken();
		if( tokenType !=null &&  token.type !=  tokenType){
			return null ; 
		}else { 
			return this.nextToken() ;
		}	 
	},

	// look ahead to see what the next token is
	peekToken : function(){
		if(this.curToken == null){
			do{
				this.curToken = this.lex();
			}while(this.curToken.type == ParserConstants.SPACE);
		}
		return this.curToken ;
	},
	// end of general parsing methods
	
	// ********************************************************************************		
	// ********************* Slop Specific Parsing Methods ****************************
	// ********************************************************************************

	//	parse()
	// parse a slop string
	parse : function(){
	    var token = this.mandatory();
		if (token.type == ParserConstants.VERIFY) {
			return this.AssertCommand(token);     
		} else if (token.type == ParserConstants.CLIP) {
			return this.ClipCommand(token);
		} else if (token.type == ParserConstants.GOTO) {
			return this.GotoCommand(token);
		} else if (token.type == ParserConstants.PASTE) {
			return this.PasteCommand(token);
		} else if (token.type == ParserConstants.GOBACK) {
			return this.GobackCommand(token);
		} else if (token.type == ParserConstants.GOFORWARD) {
			return this.GoforwardCommand(token);
		} else if (token.type == ParserConstants.SWITCH) {
			return this.SwitchCommand(token);
		} else if (token.type == ParserConstants.CREATE) {
			return this.CreateCommand(token);
		} else if (token.type == ParserConstants.CLOSE) {
			return this.CloseCommand(token);
		} else if (token.type == ParserConstants.RELOAD) {
			return this.ReloadCommand(token);
		} else if (token.type == ParserConstants.TOGGLE) {
			return this.ToggleCommand(token);
		} else if (token.type == ParserConstants.EXPAND || token.type == ParserConstants.COLLAPSE) {
			return this.ExpandCollapseCommand(token);
		} else if (token.type == ParserConstants.ENTER) {
			return this.EnterCommand(token);
		} else if (token.type == ParserConstants.APPEND) {
			return this.AppendCommand(token);
		} else if (token.type == ParserConstants.SELECT) {
			return this.SelectCommand(token);
		} else if (token.type == ParserConstants.TURN) {
	   	    return this.TurnCommand(token);
        } else if (token.type == ParserConstants.CLICK ) {
    		return this.ClickCommand(token);
		} else if (token.type == ParserConstants.YOU) {
			return this.YouCommand(token);
		} else if (token.type == ParserConstants.PAUSE) {
			return this.PauseCommand(token);
		} else if (token.type == ParserConstants.WAIT) {
			return this.WaitCommand(token);
		} else if (token.type == ParserConstants.COPY) {
			return this.CopyCommand(token);
		} else if (token.type == ParserConstants.IF) {
			return this.IfCommand(token);
		} else if (token.type == ParserConstants.BEGINEXTRACTION) {
			return this.BeginExtractionCommand(token);
		} else if (token.type == ParserConstants.ENDEXTRACTION) {
			return this.EndExtractionCommand(token);
		} else if (token.type == ParserConstants.SEARCH) {
			return this.FindCommand(token);
		} else throw new ParseException("Expected GOTO/ENTER/SELECT/CLICK/COPY/PASTE/IF but found " + token.type + " : " + token.str);
	},

	YouCommand : function (){
		// YOU STRING|WORD +
		// Parse the rest of the string as a nested command
		var nestedCommand;
		try {
			nestedCommand = this.parse();
		} catch (e) {
			// Unable to parse embedded command
			nestedCommand = null;
		}
		var commandComponent = getCommandComponent();
		var youCommand = new commandComponent.YouCommand(this.str, this.execEnv, nestedCommand);
		return youCommand;
	},

	GotoCommand : function (){
		// GOTO STRING|URL|WORD
		var commandComponent = getCommandComponent();
		var gotoCommand = new commandComponent.GotoCommand(this.str,this.execEnv);
		var loc = new commandComponent.VariableValue();

		var t = this.optional(ParserConstants.YOUR);
		if(t!=null){
			loc.setNeedVar(true);
		}
		
		t= this.optional(ParserConstants.STRING);
		
		if(t!=null){
			loc.setVarOrVal(this.unQuote(t.str));
		}else{
			t= this.optional(ParserConstants.URL);
			if(t!=null){
				loc.setVarOrVal(t.str);
			}else{
				t= this.optional(ParserConstants.WORD);
				if(t!=null){
					loc.setVarOrVal(t.str);
				}
			}
		}
		gotoCommand.loc = loc;
		// TODO: need to support: go to your "favoritesite" (e.g., http://google.com)
		this.optional(ParserConstants.EXAMPLE);
		this.optional(ParserConstants.PERIOD);
		this.mandatory(ParserConstants.END);
		return gotoCommand;
	},
	
	GobackCommand:function(){
		var commandComponent = getCommandComponent();
		var gobackCommand = new commandComponent.GoforwardCommand(this.str,this.execEnv);
		gobackCommand.direction = gobackCommand.BACK
		return gobackCommand;
	},
	GoforwardCommand:function(){
		var commandComponent = getCommandComponent();
		var goforwardCommand = new commandComponent.GoforwardCommand(this.str,this.execEnv);
		return goforwardCommand;
	},
	SwitchCommand:function(){
		var commandComponent = getCommandComponent();
		var switchCommand = new commandComponent.SwitchCommand(this.str,this.execEnv);
		// Label Tab
		t = this.optional(ParserConstants.THE)
		
		switchCommand.targetSpec = this.targetSpec([ParserConstants.TAB]);

		return switchCommand
	},
	CreateCommand:function(){
		var commandComponent = getCommandComponent();
		var createCommand = new commandComponent.CreateCommand(this.str,this.execEnv);
		
		var t=this.optional(ParserConstants.TAB);

		return createCommand;
	},

	CloseCommand:function(){
		var commandComponent = getCommandComponent();
		var closeCommand = new commandComponent.CloseCommand(this.str,this.execEnv);
		// Label Tab
		t = this.optional(ParserConstants.THE)
		
		closeCommand.targetSpec = this.targetSpec([ParserConstants.TAB]);

		return closeCommand;
	},
	
	ReloadCommand:function(){
		var commandComponent = getCommandComponent();
		var reloadCommand = new commandComponent.ReloadCommand(this.str,this.execEnv);
		return reloadCommand;
	},

	ToggleCommand:function(){
		var commandComponent = getCommandComponent();
		var toggleCommand = new commandComponent.ToggleCommand(this.str,this.execEnv);
		toggleCommand.targetSpec = this.targetSpec([ParserConstants.ITEM]); 
		return toggleCommand ;
	},

	ExpandCollapseCommand:function(token){
		// (EXPAND | COLLAPSE) THE [TARGET SPEC]
		var commandComponent = getCommandComponent();
		var expandCollapseCommand = new commandComponent.ExpandCollapseCommand(this.str,this.execEnv);

		expandCollapseCommand.turnon = (token.type == ParserConstants.EXPAND);

		var t = this.mandatory(ParserConstants.THE)
		expandCollapseCommand.targetSpec = this.targetSpec([ParserConstants.ITEM,  ParserConstants.SECTION]);
		
		this.optional(ParserConstants.PERIOD);
		this.mandatory(ParserConstants.END);

		return expandCollapseCommand;
	},
	
	//		EnterCommand
	EnterCommand : function(){
		// ENTER (STRING|(WORD+)) IN [TARGET SPEC]
		var commandComponent = getCommandComponent();
		var enterCommand = new commandComponent.EnterCommand(this.str,this.execEnv);
		enterCommand.string = this.parseVariableValue();
		
		var t = this.mandatory(ParserConstants.IN)
		enterCommand.targetSpec = this.targetSpec([ParserConstants.TEXTBOX, ParserConstants.TEXTEDITOR]);
		
		this.optional(ParserConstants.PERIOD);
		this.mandatory(ParserConstants.END);
		
		return enterCommand;
	},

	//		AppendCommand
	AppendCommand : function(){
		// APPEND (STRING|(WORD+)) TO [TARGET SPEC]
		var commandComponent = getCommandComponent();
		var appendCommand = new commandComponent.AppendCommand(this.str,this.execEnv);
		//appendCommand.string = new commandComponent.VariableValue();
		appendCommand.string = this.parseVariableValue();
		
		var t = this.mandatory(ParserConstants.TO)
		t = this.optional(ParserConstants.THE)
		appendCommand.targetSpec = this.targetSpec([ParserConstants.TEXTBOX, ParserConstants.TEXTEDITOR]);
		
		this.optional(ParserConstants.PERIOD);
		this.mandatory(ParserConstants.END);
		
		return appendCommand;
	},
	
	//		SelectCommand
	SelectCommand : function(){
		// SELECT (STRING|(WORD+)) FROM [TARGETFIELD SPEC]
		// SELECT THE [MENUTARGET SPEC]
		var commandComponent = getCommandComponent(); 
		var selectCommand = new commandComponent.SelectCommand(this.str,this.execEnv);
		var variablevalueConstructor = getCommandComponent().VariableValue;
		selectCommand.string = new variablevalueConstructor();
		
		//scratchtable
		// Select column A of row 2 of the table FROM [TARGETFIELD SPEC]
		var t = this.optional(ParserConstants.COLUMN);
		if (t != null) {
			selectCommand.string.type = commandComponent.TARGETAREATYPE.SCRATCHTABLE;
			// column A of row 2
			t = this.mandatory(this.NUM);
			selectCommand.string.columnLetter = t.str ;
			t = this.optional(ParserConstants.OF);
			t = this.mandatory(ParserConstants.ROW);
			t = this.mandatory(this.NUM);
			selectCommand.string.rowNumber = t.str ;
			t = this.optional(ParserConstants.OF);
			t = this.optional(ParserConstants.THE);
			t = this.mandatory(ParserConstants.SCRATCHTABLEREFERENCE);
			selectCommand.string.tablereference = t.str ;
			
			t = this.mandatory(ParserConstants.FROM)
			selectCommand.targetSpec = this.targetSpec([ParserConstants.LISTELEMENT]);
	
			this.optional(ParserConstants.PERIOD);
			this.mandatory(ParserConstants.END);
			return selectCommand;
		}else {
			t = this.optional(ParserConstants.MATCHTOKEN);
			if(t!=null){
				// Match type is now a property of the
				// targetSpec/VariableValue, rather than a property of the
				// command itself (because each command may have multiple
				// targetSpecs, and each one may have a different match
				// type).  Here we're setting the match type of the
				// listitem.
				t = this.optional(ParserConstants.CONTAINS);
				if(t!=null){
					selectCommand.string.setMatchType( ParserConstants.CONTAINS );
				}else {
					var t = this.optional(ParserConstants.ENDSWITH);
					if(t!=null){
						selectCommand.string.setMatchType (ParserConstants.ENDSWITH );
					}else{
						t = this.mandatory(ParserConstants.STARTSWITH);
						if(t!=null){
							selectCommand.string.setMatchType (ParserConstants.STARTSWITH);
						}
					}
				}	
			}
		}
			
		t = this.optional(ParserConstants.THE)
		if(t!=null){
			// select the "File>New Tab" menu
			selectCommand.targetSpec = this.targetSpec([ParserConstants.MENU]);
			this.optional(ParserConstants.PERIOD);
			this.mandatory(ParserConstants.END);
			return selectCommand;
		}
		
		t = this.optional(ParserConstants.YOUR);
		if(t!=null){
			selectCommand.string.setNeedVar(true);
		}
		t = this.optional(ParserConstants.WORD)
		if(t !=null){
			selectCommand.string.setVarOrVal(this.stringFromWords(t));
		}else{
			t = this.optional(ParserConstants.STRING)
			if(t!=null){
				selectCommand.string.setVarOrVal(this.unQuote(t.str));
			}else{
				t = this.mandatory(ParserConstants.REGEX)
				selectCommand.string.setVarOrVal(new RegExp(this.unQuote(t.str.substr(1)))); // remove the leading 'r' before unquoting 
			}
		}

		t = this.optional(ParserConstants.EXAMPLE);
		if(t!=null && selectCommand.string.getNeedVar()){
			selectCommand.string.literal = t.str ;
		}

		t = this.mandatory(ParserConstants.FROM)
		selectCommand.targetSpec = this.targetSpec([ParserConstants.LISTELEMENT]);

		this.optional(ParserConstants.PERIOD);
		this.mandatory(ParserConstants.END);
		return selectCommand;
	},
	
	TurnCommand : function(){
		// TURN (ON|OFF) THE [TARGETFIELD SPEC] CHECKBOX
		var commandComponent = getCommandComponent() ; 
		var turnCommand = new commandComponent.TurnCommand(this.str,this.execEnv);
		
		var t = this.mandatory(ParserConstants.ONOFF)
		if(t !=null){
			turnCommand.turnon = (t.str == "on");
		}else{
		}
		
		t = this.optional(ParserConstants.THE)
		
		turnCommand.targetSpec = this.targetSpec([ParserConstants.CHECKBOXELEMENT,ParserConstants.RADIOBUTTONELEMENT,ParserConstants.ITEM]);
		//t=this.optional();
		//if (t != null) {
		//	turnCommand.targetSpec.targetType = getLabeler().WEBTYPES.CHECKBOX;
		//} else {
		//	t = this.optional(ParserConstants.RADIOBUTTONELEMENT);
		//	if (t != null) {
		//		turnCommand.targetSpec.targetType = getLabeler().WEBTYPES.RADIOBUTTON;
		//	}
		//}
		this.optional(ParserConstants.PERIOD);
		this.mandatory(ParserConstants.END);
		return turnCommand;
	},
	
	// TL: refactoring to reuse code from AssertCommand
	WaitCommand : function() {
		// WAIT FOR THE TARGETSPEC TARGETTYPE
		try {
			var commandComponent = getCommandComponent();
			var waitCommand = new commandComponent.WaitCommand(this.str, this.execEnv);
			waitCommand.string = new commandComponent.VariableValue();
			var t = this.checkArticle(waitCommand);	
			if (t == null) {
				this.checkNegation(waitCommand); // the command does not have any article, check for negation
			}	
     		this.checkText(waitCommand);
			return this.parseAssertionTargetSpec(waitCommand);
		} catch (e) {
			dump("Error parsing WaitCommand: should do something here\n");
			return null;
		}	
	},

	AssertCommand : function(token) {
		// (VERIFY|ASSERT) THERE IS [A|NO] [TARGET SPEC]		
		// e.g., verify there is a "foo" link
		// e.g., verify there is no "foo" link
		// verify there is a td that contains "foo"
		// verify there is a text "foo" in the "password" textbox
		// verify there is a text foo in the password textbox
		// verify there is a text "foo" in the link
		// TODO: do not support "starts with" and "ends with" for regions
		//       i.e., only "contains" is supported 
		var commandComponent = getCommandComponent();
		var assertCommand = new commandComponent.AssertCommand(this.str,this.execEnv);
		// The 'string' property is used as a secondary variable to catch
		// the "foo" in: verify there is a text "foo" in the "password"
		// textbox
		assertCommand.string = new commandComponent.VariableValue();	        	
		// first checking whether "an" appears, i.e. verify there is an ...
		var t = this.checkArticle(assertCommand);	
		if (t == null) {
			this.checkNegation(assertCommand); // the command does not have any article, check for negation
		}	
		this.checkText(assertCommand);
		return this.parseAssertionTargetSpec(assertCommand);
	},

	// Look for:
	//    a|an 
	checkArticle : function(assertCommand) {
		// first checking whether "an" appears, i.e. verify there is an ...
		var t = this.optional(ParserConstants.AN);		
		if (t == null) // "an" is not found, now check if "a" appears. 
			t = this.optional(ParserConstants.ARTICLE);		
		if (t != null) // the command is positive. 
			assertCommand.positive = true;	
		return t;	
	},

	
	// Look for:
	//    not 
	checkNegation : function(assertCommand) {
		var t = this.optional(ParserConstants.NOT);
		if (t != null) {
			assertCommand.positive = false;			
		} else {
			assertCommand.positive = true;
		}	
	},

	// Look for:
	//    text "foo" in/into the
	//    text foo in/into the
	checkText : function(assertCommand) {
		// text "foo" in/into the
		var t = this.optional(ParserConstants.TEXT)
		if (t != null) {
			t = this.optional(ParserConstants.WORD)
			if(t !=null){
				assertCommand.string.setVarOrVal(this.stringFromWords(t));
			}else{
			    t = this.mandatory(ParserConstants.STRING)
				if(t!=null){
				  assertCommand.string.setVarOrVal(this.unQuote(t.str));
				}
			}		
			t = this.mandatory(ParserConstants.IN)
		}				
	},

	// Parse the latter part of an assert/verify/if/clip command
	parseAssertionTargetSpec : function(assertCommand) {
		// here target type can be button/textbox/link, etc.	
	    var targetType = this.getAnyElement();
				
		if (targetType != null) {	// verify there is a td that contains "foo"
			var t = this.optional(ParserConstants.THAT);								
			if (t!= null) {
				t = this.mandatory(ParserConstants.CONTAINS);
				if (t != null) {
					assertCommand.targetSpec = this.targetSpec();
					assertCommand.targetSpec.targetType = targetType;
					assertCommand.targetSpec.targetLabel.setMatchType(ParserConstants.CONTAINS);
				}					
			} else {
				t = this.optional(ParserConstants.WHICH);
				if (t!= null) {
				   t = this.mandatory(ParserConstants.CONTAINS);
				   if (t != null) {
					 assertCommand.targetSpec = this.targetSpec();
			   		 assertCommand.targetSpec.targetType = targetType;
				     assertCommand.targetSpec.targetLabel.setMatchType(ParserConstants.CONTAINS);
				   } 						
				} else {
					// JM:
					//TODO: currently we can parse, whose name contains or whose name is, but don't actually verify that
					// perhaps we should not be parsing this as well
				  	t = this.optional(ParserConstants.WHOSE);
					  	if (t!= null) {
				    	t = this.mandatory(ParserConstants.NAME);
				    	if (t != null) {							
					   		t = this.mandatory(ParserConstants.CONTAINS);
						    if (t != null) {
							   	assertCommand.targetSpec = this.targetSpec();
							   	assertCommand.targetSpec.targetType = targetType;
							   	assertCommand.targetSpec.targetLabel.setMatchType(ParserConstants.CONTAINS);
						    } else {
					   	    	t = this.mandatory(ParserConstants.IS);
						    	if (t!=null) {
							   		assertCommand.targetSpec = this.targetSpec();
						   			assertCommand.targetSpec.targetType = targetType;
								} // end if t != null
						  	} // end else
						} // end if 
					} // end if   
				} // end else
			} // end else
			
		} else { 	// verify there is a "foo" link
		   	assertCommand.targetSpec = this.targetSpec();
			targetType = this.getAnyElement();
			assertCommand.targetSpec.targetType = targetType;
		}					
		this.optional(ParserConstants.PERIOD);
		this.mandatory(ParserConstants.END);		
		return assertCommand;
	},

	// This calls the same code that AssertCommand does to parse the target
	// specifier
	ClipCommand : function(token) { // CLIP THE [TARGET SPEC]		
		var commandComponent = getCommandComponent();
        var clipCmd = new commandComponent.ClipCommand(this.str,this.execEnv);
		return this.parseAssertionTargetSpec(clipCmd);
	},
	
	
	//		ClickCommand
	ClickCommand : function(token){
		// (CONTROL-|)CLICK [CLICK TARGET SPEC]
		var commandComponent = getCommandComponent();		
		var clickCommand = new commandComponent.ClickCommand(this.str,this.execEnv);
	    // maybe it was a control-click?	
		if (token != null && token.str.match(/^control/i) !==null) {
			clickCommand.controlP = true;
		}else{
			clickCommand.controlP = false;
		}
		
		clickCommand.targetSpec = this.targetSpec([ParserConstants.BUTTONELEMENT,ParserConstants.LINKELEMENT,ParserConstants.ITEM,ParserConstants.AREAELEMENT,ParserConstants.MENU, ParserConstants.TAB, ParserConstants.TEXTBOX, ParserConstants.CLOSEBUTTONELEMENT]);
		
		// Click the cell in the "username" column of the "new1" row of the "database" table
		var t = this.optional(ParserConstants.COLUMN);
		if (t != null) {
			clickCommand.sourceType = commandComponent.TARGETAREATYPE.SCRATCHTABLE;
			// column A of row 2
			t = this.mandatory(this.NUM);
			clickCommand.columnLetter = t.str ;
			t = this.optional(ParserConstants.OF);
			t = this.mandatory(ParserConstants.ROW);
			t = this.mandatory(this.NUM);
			clickCommand.rowNumber = t.str ;
			t = this.optional(ParserConstants.OF);
			t = this.optional(ParserConstants.THE);
			t = this.mandatory(ParserConstants.SCRATCHTABLEREFERENCE);
			clickCommand.tablereference = t.str ;
			return clickCommand;
		}

		// Click column A of row 2 of the scratch space
		var t = this.optional(ParserConstants.COLUMN);
		if (t != null) {
			clickCommand.sourceType = commandComponent.TARGETAREATYPE.SCRATCHTABLE;
			// column A of row 2
			t = this.mandatory(this.NUM);
			clickCommand.columnLetter = t.str ;
			t = this.optional(ParserConstants.OF);
			t = this.mandatory(ParserConstants.ROW);
			t = this.mandatory(this.NUM);
			clickCommand.rowNumber = t.str ;
			t = this.optional(ParserConstants.OF);
			t = this.optional(ParserConstants.THE);
			t = this.mandatory(ParserConstants.SCRATCHTABLEREFERENCE);
			clickCommand.tablereference = t.str ;
			return clickCommand;
		}

		t=this.optional(ParserConstants.BUTTONELEMENT);
		if (t != null) {
			clickCommand.targetSpec.targetType = getLabeler().WEBTYPES.BUTTON;
		} else {
			t = this.optional(ParserConstants.LINKELEMENT);
			if (t != null) {
				clickCommand.targetSpec.targetType = getLabeler().WEBTYPES.LINK;
			} else {
				t = this.optional(ParserConstants.ITEM);
				if (t != null) {
					clickCommand.targetSpec.targetType = getLabeler().WEBTYPES.ITEM;
				} else {
					t = this.optional(ParserConstants.AREAELEMENT);
					if (t != null) {
						clickCommand.targetSpec.targetType = getLabeler().WEBTYPES.AREA;
					} else {
						t = this.optional(ParserConstants.MENU);
						if (t != null) {
							clickCommand.targetSpec.targetType = getLabeler().WEBTYPES.MENU;
						}
					}
				}
			}
		}

		this.optional(ParserConstants.PERIOD);
		this.mandatory(ParserConstants.END);
		return clickCommand ;
	},

	PauseCommand : function(){
		// PAUSE NUM SECONDS
		var commandComponent = getCommandComponent();
		var pauseCommand = new commandComponent.PauseCommand(this.str,this.execEnv);

		var t = this.mandatory(ParserConstants.NUM);
		if (t != null) {
			pauseCommand.pauseLength = parseInt(t.str);
		}

		t = this.mandatory(ParserConstants.SECONDS);
		this.optional(ParserConstants.PERIOD);
		this.mandatory(ParserConstants.END);

		return pauseCommand;
	},

	//		CopyCommand
	CopyCommand : function(){
		var commandComponent = getCommandComponent();
		var labeler = getLabeler();
		var u = getUtils();
		var copyCommand = new commandComponent.CopyCommand(this.str,this.execEnv);
		t = this.optional(ParserConstants.THE);

		//////////
		// TABLES
		//Copy the cell at/in the     	first 			column 		of the 	second 		row	 	of the scratchtable
		//Copy the cell at/in the     	number 4 		column 		of the 	number 2 	row	 	of the scratchtable
		//Copy the cell at/in the     	"Total Cost" 	column 		of the 	"Palo Alto"	row		of the scratchtable
		//Copy the cell at/in	     					column 6 	of 					row 2	of the scratchtable
		//note that in these cases, the ordinal is not a disambiguator
		t = this.optional(this.CELL);
		// CELL at/in
		if (t != null) {	
			var tableTargetSpecConstructor = commandComponent.TableTargetSpec;
			var tableTargetSpec = new tableTargetSpecConstructor();
			tableTargetSpec.targetType = labeler.WEBTYPES.TABLECELL;
			tableTargetSpec.tableType = labeler.WEBTYPES.SCRATCHTABLE;
			//var variablevalueConstructor = getCommandComponent().VariableValue;
			//spec.targetLabel = new variablevalueConstructor();
			t = this.optional(ParserConstants.THE);
			
			t = this.optional(ParserConstants.ORDINAL);	// e.g. first column
			if(t!=null){		
				tableTargetSpec.targetColumnNumber = u.getCardinal(t.str); 
			}
			else {
				t = this.optional(ParserConstants.NUMBERWORD);	// "number 4" instead of "fourth"
				if(t!=null){
					t = this.mandatory(ParserConstants.NUM);	// preferably make this a variableValue that will ultimately have to be coercable into a number (AC)
					tableTargetSpec.targetColumnNumber = parseInt(t.str);
				}
				else {
					var variableValue = this.parseVariableValue()
					tableTargetSpec.targetColumnLabel = variableValue	// e.g. "Total Cost" column
				}
			}
			t = this.mandatory(ParserConstants.COLUMN)
			if(!tableTargetSpec.targetColumnNumber && tableTargetSpec.targetColumnLabel.getValue() == ""){
				t = this.mandatory(ParserConstants.NUM)	// e.g. column 6.  preferably make this a variableValue that will ultimately have to be coercable into a number (AC)
				tableTargetSpec.targetColumnNumber = t.str
			}	// end of COLUMN

			t = this.mandatory(ParserConstants.OF);
			t = this.optional(ParserConstants.THE);

			t = this.optional(ParserConstants.ORDINAL);	// e.g. first row
			if(t!=null){
				tableTargetSpec.targetRowNumber = u.getCardinal(t.str); 
			}
			else {
				t = this.optional(ParserConstants.NUMBERWORD);	// "number 4" instead of "fourth"
				if(t!=null){
					t = this.mandatory(ParserConstants.NUM);	// preferably make this a variableValue that will ultimately have to be coercable into a number (AC)
					tableTargetSpec.targetRowNumber = parseInt(t.str);
				}
				else {
					variableValue = this.parseVariableValue()
					tableTargetSpec.targetRowLabel = variableValue	// e.g. "Total Cost" row
				}
			}
			t = this.mandatory(ParserConstants.ROW)
			if(!tableTargetSpec.targetRowNumber && (!tableTargetSpec.targetRowLabel.getValue() || tableTargetSpec.targetRowLabel.getValue() == "")){
				t = this.mandatory(ParserConstants.NUM)	// e.g. rolumn 6.  preferably make this a variableValue that will ultimately have to be coercable into a number (AC)
				tableTargetSpec.targetRowNumber = t.str
			}	// end of ROW

			t = this.mandatory(ParserConstants.OF);
			t = this.optional(ParserConstants.THE);
			t = this.mandatory(ParserConstants.SCRATCHTABLEREFERENCE);
			this.optional(ParserConstants.PERIOD);
			this.mandatory(ParserConstants.END);
			copyCommand.targetSpec = tableTargetSpec
			copyCommand.sourceType = commandComponent.TARGETAREATYPE.SCRATCHTABLE;
			return copyCommand;
		}
		/*
		// special A5 spreadsheet syntax:
		// Copy Cell A5 in Table 3
		t = this.optional(ParserConstants.CELL);
		if (t != null) {
			copyCommand.sourceType = commandComponent.TARGETAREATYPE.TABLE;
			// A5 into Table 5
			t = this.mandatory(this.CELLREFERENCE);
			copyCommand.cellreference = t.str ;
			t = this.optional(ParserConstants.IN);
			t = this.mandatory(ParserConstants.TABLEREFERENCE);
			copyCommand.tablereference = t.str ;

			this.optional(ParserConstants.PERIOD);
			this.mandatory(ParserConstants.END);
			return copyCommand;
		}
		*/
		// end of TABLES
		//////////


		// Copy text after "Morningstar Stylebox"
		t = this.optional(ParserConstants.TEXT);
		if (t != null) {
			copyCommand.sourceType = commandComponent.TARGETAREATYPE.WEBPAGE;
			// after
			t = this.mandatory(ParserConstants.AFTER);
			// "Morningstar Stylebox"
			t = this.mandatory(ParserConstants.STRING);
			copyCommand.label = t.str;

			this.optional(ParserConstants.PERIOD);
			this.mandatory(ParserConstants.END);
			return copyCommand;
		}
		
		// Copy the targetspec
		// e.g. Copy the "Google Search" textbox
		// Copy the "Walk Score:" text
		copyCommand.targetSpec = this.targetSpec(ParserConstants.TEXT, ParserConstants.TEXTBOX);	// doesn't targetSpec include the element name, eg 'text' or 'textbox'??
		if (copyCommand.targetSpec.targetType == ParserConstants.TEXTBOX) {
			copyCommand.sourceType = commandComponent.TARGETAREATYPE.TEXTBOX
		}
		else {
			if (copyCommand.targetSpec.targetType == ParserConstants.TEXT) {
				copyCommand.sourceType = commandComponent.TARGETAREATYPE.TEXT;
			}
		}

		this.optional(ParserConstants.PERIOD);
		this.mandatory(ParserConstants.END);
		return copyCommand;
	},	// end of CopyCommand
	
	PasteCommand : function(){
		var commandComponent = getCommandComponent();
		var pasteCommand = new commandComponent.PasteCommand(this.str,this.execEnv);

		// Paste into column A of row 2 of the scratch space
		var t = this.optional(ParserConstants.IN);
		var t = this.optional(ParserConstants.COLUMN);
		if (t != null) {
			pasteCommand.destType = commandComponent.TARGETAREATYPE.SCRATCHTABLE;
			// column A of row 2
			t = this.mandatory(this.NUM);
			pasteCommand.columnLetter = t.str ;
			t = this.optional(ParserConstants.OF);
			t = this.mandatory(ParserConstants.ROW);
			t = this.mandatory(this.NUM);
			pasteCommand.rowNumber = t.str ;
			t = this.optional(ParserConstants.OF);
			t = this.optional(ParserConstants.THE);
			t = this.mandatory(ParserConstants.SCRATCHTABLEREFERENCE);
			pasteCommand.tablereference = t.str ;

			this.optional(ParserConstants.PERIOD);
			this.mandatory(ParserConstants.END);
			return pasteCommand;
		}

		// Paste into Cell A5 in Table 5
		var t = this.optional(ParserConstants.CELL);
		if (t != null) {
			pasteCommand.destType = commandComponent.TARGETAREATYPE.TABLE;
			// A5 into Table 5
			t = this.mandatory(ParserConstants.CELLREFERENCE);
			pasteCommand.cellreference = t.str ;
			t = this.optional(ParserConstants.IN);
			t = this.mandatory(ParserConstants.TABLEREFERENCE);
			pasteCommand.tablereference = t.str ;

			this.optional(ParserConstants.PERIOD);
			this.mandatory(ParserConstants.END);
			return pasteCommand ;
		}
		// Paste into the "Google Search" textbox
		else {
			pasteCommand.destType = commandComponent.TARGETAREATYPE.WEBPAGE;
			pasteCommand.targetSpec = this.targetSpec();
			t = this.optional(ParserConstants.TEXTBOX);
			if (t != null) {
				pasteCommand.targetSpec.targetType = getLabeler().WEBTYPES.TEXTBOX;
			}

			this.optional(ParserConstants.PERIOD);
			this.mandatory(ParserConstants.END);
			return pasteCommand;
		}
	},

	BeginExtractionCommand : function(){
		// BEGIN EXTRACTION
		var commandComponent = getCommandComponent();
		var beginExtractionCommand = new commandComponent.BeginExtractionCommand(this.str,this.execEnv);
		this.optional(ParserConstants.PERIOD);
		this.mandatory(ParserConstants.END);

		return beginExtractionCommand;
	},

	EndExtractionCommand : function(){
		// END EXTRACTION
		var commandComponent = getCommandComponent();
		var endExtractionCommand = new commandComponent.EndExtractionCommand(this.str,this.execEnv);
		this.optional(ParserConstants.PERIOD);
		this.mandatory(ParserConstants.END);

		return endExtractionCommand;
	},

	IfCommand : function(){
		// if there is a "Sign in" link
		// if there is a "Log in" button
		// if there is a "Email address:" textbox
		// if there is text "foo" in the "bar" textbox

		var commandComponent = getCommandComponent();
		var ifCommand = new commandComponent.IfCommand(this.str,this.execEnv);
		ifCommand.string = new commandComponent.VariableValue();	
		var t = this.checkArticle(ifCommand);	
		if (t == null) {
			this.checkNegation(ifCommand); // the command does not have any article, check for negation
		}	
		this.checkText(ifCommand);
		return this.parseAssertionTargetSpec(ifCommand);
	},

	FindCommand : function(){
		// ENTER (STRING|(WORD+)) IN [TARGET SPEC]
		var commandComponent = getCommandComponent();
		var findCommand = new commandComponent.FindCommand(this.str,this.execEnv);
		
		var t = this.optional(ParserConstants.FOR);
		
		t = this.optional(ParserConstants.NEXT);
		if(t!=null){
			findCommand.continueFlag = true;
			findCommand.previousFlag = false;
		}
		else
		{		
			t = this.optional(ParserConstants.PREVIOUS)
			if(t !=null){
				findCommand.continueFlag = true;
				findCommand.previousFlag = true;
			}else{
				t = this.mandatory(ParserConstants.STRING)
	
				findCommand.continueFlag = false;
				findCommand.searchTerm = this.unQuote(t.str);
			}
		}
		
		return findCommand;
	},

	////////////////////
	//	targetSpec
	////////////////////
	targetSpec : function(targetTypes){
		// Returns a targetSpec object that matches one of the specified targetTypes,
		//with optional disambiguator, label, and partial label match (e.g. "that begins with")
		//and possibly the containing window
		//
		// (DISAMBIGUATOR|ORDINAL|) STRING | WORD | XPATH
		// Field Description e.g. 
		//  "yo" textbox
		//  "yo" textbox
		//  first "yo" textbox/
		//  "News"'s "yo" textbox
		//  yo dude textbox
		//  /HTML/BODY[2]/A
		// "OK" button in the dialog box
		// "Total Cost" column of the first row of the scratchtable
		
		var targetSpecConstructor = getCommandComponent().TargetSpec;
		var spec = new targetSpecConstructor();
		//var variablevalueConstructor = getCommandComponent().VariableValue;
		//spec.targetLabel = new variablevalueConstructor();

		// ordinal
		t = this.optional(ParserConstants.DISAMBIGUATOR)
		if(t!=null){
			spec.disambiguator = t.str ;
		}
		t = this.optional(ParserConstants.ORDINAL);
		if(t!=null){
			spec.ordinal = getUtils().getCardinal(t.str); 
		}
		t = this.optional(ParserConstants.NUMBERWORD);	// "number 4" instead of "fourth"
		if(t!=null){
			t = this.mandatory(ParserConstants.NUM);
			if(t!=null){
				spec.ordinal = parseInt(t.str); 
			}
		}
		
		// label (we don't know yet if it's the label of the target or the label of a column of a table
		variableValue = this.parseVariableValue()
		//this.parseVariableValue(spec.targetLabel)
		
		// is this a table with a column label?  (e.g. the "Total Cost" column of the first row of the table)
		t = this.optional(ParserConstants.COLUMN)
		if (t != null) {
			var tableTargetSpecConstructor = getCommandComponent().TableTargetSpec;
			var tableSpec = new tableTargetSpecConstructor()
			tableSpec.disambiguator = spec.disambiguator	// probably not used (AC)
			tableSpec.ordinal = spec.ordinal	// probably not used (AC)
			tableSpec.targetColumnLabel = variableValue
			t = this.optional(ParserConstants.OF);
			t = this.optional(ParserConstants.THE);
			t = this.optional(ParserConstants.ORDINAL);
			if(t!=null){
				tableSpec.targetRowLabel = getUtils().getCardinal(t.str); 
			}
			t = this.optional(ParserConstants.NUMBERWORD);	// "number 4" instead of "fourth"
			if(t!=null){
				t = this.mandatory(ParserConstants.NUM);
				if(t!=null){
					tableSpec.targetRowLabel = parseInt(t.str); 
				}
			}
			t = this.mandatory(ParserConstants.ROW);
			t = this.optional(ParserConstants.OF);
			t = this.optional(ParserConstants.THE);
			t = this.mandatory(ParserConstants.SCRATCHTABLEREFERENCE);
			tableSpec.tablereference = t.str ;
			tableSpec.targetType = getCommandComponent().TARGETAREATYPE.SCRATCHTABLE;
			return tableSpec;
		}
		else {
			spec.targetLabel = variableValue
		}
			
		// targetName
		// xPath target
		var t = this.optional(ParserConstants.XPATH);
		if (t != null) {
			spec.xpath = this.unQuote(t.str.substr(1));
			t = this.optional(ParserConstants.AT)
			if(t!=null){
				t = this.optional(ParserConstants.LOC)
				if(t!=null){
					var tStr = t.str
					var clickLoc = {}
					var commaLoc = tStr.indexOf(",")
					clickLoc.x = tStr.substring(1,commaLoc);
					clickLoc.y = tStr.substring(commaLoc+1,tStr.length-1);
					spec.clickLoc = clickLoc;
				}
			}
		}
		// targetType
		else if (typeof(targetTypes)!='undefined') {
			for(var i=0;i<targetTypes.length;i++){
				var targetType = targetTypes[i];
				if((t = this.optional(targetType))!=null){
					spec.targetType = this.targetTypeForElement(targetType);
					break;			
				}
			}
		}
		//if (!spec.xpath && !spec.targetType) throw new ParseException("no targetName found ");
		
		
		// Partial Matches (e.g. contains, starts with, ends with)
		// (AC) need to add IS, and negations
		var t = this.optional(ParserConstants.THAT);
		if(t!=null && !(spec.targetLabel.literal || spec.targetLabel.dbkey || spec.targetLabel.tablereference)){	// there can't be both a label and a partial match phrase
			var matchtype = null
			t = this.optional(ParserConstants.CONTAINS);
			if(t!=null){
				matchtype = ParserConstants.CONTAINS
			}else {
				var t = this.optional(ParserConstants.ENDSWITH);
				if(t!=null){
					matchtype = ParserConstants.ENDSWITH
				}else{
					t = this.mandatory(ParserConstants.STARTSWITH);
					if(t!=null){
						matchtype = ParserConstants.STARTSWITH
					}
				}
			}	
			if(matchtype == null){
				throw new ParseException("Expected matchtype after 'THAT' ");
			}
			
			// the value following the partial match phrase can be any variableValue. It is stored as the spec.targetLabel
			this.parseVariableValue(spec.targetLabel)
			if (!(spec.targetLabel.literal || spec.targetLabel.dbkey || spec.targetLabel.tablereference)){
				throw new ParseException("Parser Exception: Expected match label after matchtype ");
			}
			spec.targetLabel.setMatchType(matchtype);
		}
		// END Partial Matches
		
		// Window descriptor
		t = this.optional(ParserConstants.IN)
		if(t!=null ){
			t = this.optional(ParserConstants.DIALOGBOX)	// in the dialog box
			if(t!=null ) {
				spec.isDialogP = true
			}else{
				t = this.optional(ParserConstants.MAINWINDOW)	// in the main window
				if(t!=null){
					spec.windowId=0
				}else{
					t = this.optional(ParserConstants.STRING)	// in the "Preferences" window
					if(t!=null){
						spec.windowName=this.unQuote(t.str);
						t = this.mandatory(ParserConstants.WINDOW)
					}else{
						t = this.optional(ParserConstants.WINDOW)	// in window #2; in window 2
						if(t!=null){
							t = this.optional(ParserConstants.POUNDSIGN)
							t = this.mandatory(ParserConstants.NUM)
							if(t!=null){
								spec.windowId=(t.str);
							}
						}
					}
				}
			}
		}

		return spec;
	},	// end of targetSpec
	
	//		parseVariableValue
	// A variableValue can be a stringLiteral, personalDBValue, regexp, javascript, or a tableCell
	parseVariableValue : function (variableValueObj){
		var commandComponent = getCommandComponent(); 
		if (!variableValueObj) variableValueObj = new commandComponent.VariableValue();		
		
		var t = this.optional(ParserConstants.CELL);	//scratchtable: the cell in the "L2 Risk" column of row 2 of the table
		if (t != null) {
			variableValueObj.type = commandComponent.TARGETAREATYPE.SCRATCHTABLE;
			// "L2 Risk" column of row 2
			t = this.optional(ParserConstants.IN);
			t = this.optional(ParserConstants.THE);
			var columnVVO = new commandComponent.VariableValue();	// VVO = variableValueObject
			this.parseVariableValue(columnVVO);
			variableValueObj.columnLabel = columnVVO ;
			t = this.mandatory(ParserConstants.COLUMN);
			//variableValueObj.columnLetter = t.str ;
			t = this.optional(ParserConstants.OF);
			t = this.optional(ParserConstants.THE);
			var rowVVO = new commandComponent.VariableValue();	// VVO = variableValueObject
			this.parseVariableValue(rowVVO);
			variableValueObj.rowLabel = rowVVO ;
			t = this.mandatory(ParserConstants.ROW);
			//t = this.mandatory(this.NUM);
			//variableValueObj.rowNumber = t.str ;
			t = this.optional(ParserConstants.OF);
			t = this.optional(ParserConstants.THE);
			t = this.mandatory(ParserConstants.SCRATCHTABLEREFERENCE);
			variableValueObj.tablereference = t.str ;		
			return variableValueObj;
		}else{
			t = this.optional(ParserConstants.COLUMN);	//scratchtable: column A of row 2 of the table
			if (t != null) {
				variableValueObj.type = commandComponent.TARGETAREATYPE.SCRATCHTABLE;
				// column A of row 2
				t = this.mandatory(this.NUM);
				variableValueObj.columnLetter = t.str ;
				t = this.optional(ParserConstants.OF);
				t = this.mandatory(ParserConstants.ROW);
				t = this.mandatory(this.NUM);
				variableValueObj.rowNumber = t.str ;
				t = this.optional(ParserConstants.OF);
				t = this.optional(ParserConstants.THE);
				t = this.mandatory(ParserConstants.SCRATCHTABLEREFERENCE);
				variableValueObj.tablereference = t.str ;		
				return variableValueObj;
			}else{
				// javascript
				var t = this.optional(ParserConstants.JS);	
				if(t!=null){
					var value = this.stringFromJS(t);
					variableValueObj.setVarOrVal(value);
				}else{
					// personalDBValue
					t = this.optional(ParserConstants.YOUR);
					if(t!=null){
						variableValueObj.setNeedVar(true);
					}
					// personalDBValue or stringLiteral or regexp label
					t = this.optional(ParserConstants.STRING)
					if(t!=null){
						variableValueObj.setVarOrVal(this.unQuote(t.str));
						// variableValueObj.getNeedVar()));
					}else{
						t=this.optional(ParserConstants.WORD)
						if(t != null){
							variableValueObj.setVarOrVal(this.stringFromWords(t));
						}else{
							t=this.optional(ParserConstants.REGEX)
							if(t != null){
								variableValueObj.setVarOrVal(new RegExp(this.unQuote(t.str.substr(1)))); // remove the leading 'r' before unquoting
							}
						}
					}
					t = this.optional(ParserConstants.EXAMPLE);
					if(t!=null && variableValueObj.getNeedVar()){
						variableValueObj.literal = t.str;
					}
				}
			}
		}	
		return variableValueObj;
	},	

	stringFromWords : function(firstWord){
		// this is parsing a string of words without quotes into a string
		var startpos = firstWord.index;
		var endpos = firstWord.index + firstWord.str.length;
		var t;
		while((t=this.optional(ParserConstants.WORD))!= null){
			endpos = t.index + t.str.length;
		}
		return this.str.substring(startpos,endpos);
	},

	stringFromJS : function(t){
		var sandbox = Components.utils.Sandbox("http://www.example.com/");
		var evalStr = t.str.substr(2,t.str.length-3);
		var evalResult = "";
		try{
			evalResult = Components.utils.evalInSandbox(evalStr,sandbox)
		}catch(e){
			evalResult = e.toString();
		}
		return evalResult ;
	},
	
	unQuote : function (str){
		str = str.replace(/\\"/g,'"');
		str = str.replace(/\\'/g,"'");
		return str.substring(1, str.length - 1);
	},

	getAnyElement : function() {
		var t;

		t=this.optional(ParserConstants.BUTTONELEMENT);
		if (t != null) {
			return getLabeler().WEBTYPES.BUTTON;
		}

		t = this.optional(ParserConstants.LINKELEMENT);
		if (t != null) {
			return getLabeler().WEBTYPES.LINK;
		}

		t = this.optional(ParserConstants.ITEM);
		if (t != null) {
			return getLabeler().WEBTYPES.ITEM;
		}

		t = this.optional(ParserConstants.AREAELEMENT);
		if (t != null) {
			return getLabeler().WEBTYPES.AREA;
		}

		t = this.optional(ParserConstants.RADIOBUTTONELEMENT);
		if (t != null) {
			return getLabeler().WEBTYPES.RADIOBUTTON;
		}

		t = this.optional(ParserConstants.CHECKBOXELEMENT);
		if (t != null) {
			return getLabeler().WEBTYPES.CHECKBOX;
		}

		t = this.optional(ParserConstants.TEXTBOX);
		if (t != null) {
			return getLabeler().WEBTYPES.TEXTBOX;
		}

		t = this.optional(ParserConstants.LISTELEMENT);
		if (t != null) {
			return getLabeler().WEBTYPES.LISTBOX;
		}
		
		t = this.optional(ParserConstants.ELEMENT);
		if (t != null) {
//			return 'element';
			return t.str;
		}


		// Otherwise, couldn't find an element
		return null;
	},
	targetTypeForElement : function (element){
		switch(element){
			case ParserConstants.BUTTONELEMENT:
			return getLabeler().WEBTYPES.BUTTON;
			case ParserConstants.LINKELEMENT:
			return getLabeler().WEBTYPES.LINK;
			case ParserConstants.MENU:
			return "menu";			
			case ParserConstants.ITEM:
			return getLabeler().WEBTYPES.ITEM;			
			case ParserConstants.SECTION:
			return "section";			
			case ParserConstants.TAB:
			return "tab";			
			case ParserConstants.AREAELEMENT:
			return getLabeler().WEBTYPES.AREA;			
			case ParserConstants.CLOSEBUTTONELEMENT:
			return getLabeler().WEBTYPES.CLOSEBUTTON;			
			case ParserConstants.RADIOBUTTONELEMENT:
			return getLabeler().WEBTYPES.RADIOBUTTON;			
			case ParserConstants.CHECKBOXELEMENT:
			return getLabeler().WEBTYPES.CHECKBOX;
			case ParserConstants.TEXTEDITOR:
			return getLabeler().WEBTYPES.TEXTEDITOR;	
			case ParserConstants.TEXTBOX:
			return getLabeler().WEBTYPES.TEXTBOX;	
			case ParserConstants.REGIONELEMENT:
			return getLabeler().WEBTYPES.REGION;						
			case ParserConstants.LISTELEMENT:
			return getLabeler().WEBTYPES.LISTBOX;
		}
		return null;
	}
}


// get access to the coscripter-labeler component for 
// findTargetElement and getLabel
var gLabeler = null ;
function getLabeler(){
    // Ensure single recorder instance
	if (gLabeler == null) {
		gLabeler = Components.classes["@coscripter.ibm.com/coscripter-labeler/;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
	}
	return gLabeler;
}

// get access to the coscripter-command component which
// contains type information for the various command objects
var gCommandComponent = null ;
function getCommandComponent(){
    // Ensure single instance
	if (gCommandComponent == null) {
		gCommandComponent = Components.classes["@coscripter.ibm.com/coscripter-command;1"].getService(Components.interfaces.nsISupports).wrappedJSObject; 
			
	}
	return gCommandComponent;
}

// get access to coscripter-utils
var gUtils = null;
function getUtils() {
    // Ensure single instance
	if (gUtils == null) {
		gUtils = Components.classes["@coscripter.ibm.com/coscripter-utils/;1"].getService(Components.interfaces.nsISupports).wrappedJSObject; 
	}
	return gUtils;
}


// You can change these if you like
const CLASS_ID = Components.ID("a682a6ec-bca0-4ba4-9165-245c00f10972");
const CLASS_NAME = "Strict Parser for Slop";
const CONTRACT_ID = "@coscripter.ibm.com/coscripter-strict-parser;1";


//=================================================
// Note: You probably don't want to edit anything
// below this unless you know what you're doing.
//
// Factory
var CoScripterStrictParserFactory = {
	_instance : null,
	createInstance: function (aOuter, aIID){
		if (aOuter != null){
			throw Components.results.NS_ERROR_NO_AGGREGATION;
		}
		if(this._instance == null){
			this._instance = new CoScripterStrictParser();
		}
		return (this._instance).QueryInterface(aIID);
	}
};

// Module
var CoScripterStrictParserModule = {
  registerSelf: function(aCompMgr, aFileSpec, aLocation, aType)
  {
    aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    aCompMgr.registerFactoryLocation(CLASS_ID, CLASS_NAME, CONTRACT_ID, aFileSpec, aLocation, aType);
  },

  unregisterSelf: function(aCompMgr, aLocation, aType)
  {
    aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    aCompMgr.unregisterFactoryLocation(CLASS_ID, aLocation);        
  },
  
  getClassObject: function(aCompMgr, aCID, aIID)
  {
    if (!aIID.equals(Components.interfaces.nsIFactory))
      throw Components.results.NS_ERROR_NOT_IMPLEMENTED;

    if (aCID.equals(CLASS_ID))
      return CoScripterStrictParserFactory;

    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  canUnload: function(aCompMgr) { return true; }
};

//module initialization
function NSGetModule(aCompMgr, aFileSpec) { return CoScripterStrictParserModule; }

// dump('Done Parsing coscripter-strict-parsers.js component\n');
