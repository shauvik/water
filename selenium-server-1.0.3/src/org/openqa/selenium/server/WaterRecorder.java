package org.openqa.selenium.server;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintStream;
import java.util.Scanner;
import java.util.Vector;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.selenium.server.commands.SeleniumCoreCommand;

public class WaterRecorder {
	static final Log LOGGER = LogFactory.getLog(WaterRecorder.class);
	int action_counter = 0;
	String test_name = "Default";
	public WaterRecorder() {
		LOGGER.info("WATER RECORDER: INITy");
		this.action_counter=1;
	}

	public WaterRecorder(SeleniumServer remoteControl) {
		this();
	}
	
	public void setTestName(String testName){
		this.test_name = testName;
	}

	public void before(String cmd, Vector<String> values, String sessionId) {
		
		//DEBUG PRINT
		StringBuffer val = new StringBuffer();
		for(String v: values){
			if(val.length() > 0){ val.append(","); }
			val.append(v);
		}
		LOGGER.info("WATER BEFORE: cmd="+cmd+"; values="+val+"; sessID="+sessionId);
		
		//TODO: Save DOM instead; Inject JS; getEval
		saveDynamicHTML(cmd, sessionId, "_before");
		
	}

	private void saveDynamicHTML(String cmd, String sessionId, String suffix) {
		//HANDLE COMMAND
		switch(WaterCommand.getValue(cmd)){
			//Commands with locator
			case click:
			case doubleClick:
			case contextMenu:
			case clickAt:
			case doubleClickAt:
			case contextMenuAt:
			case fireEvent:
			case focus:
			case keyPress:
			case keyDown:
			case keyUp:
			case mouseOver:
			case mouseOut:
			case mouseDown:
			case mouseDownRight:
			case mouseDownAt:
			case mouseDownRightAt:
			case mouseUp:
			case mouseUpRight:
			case mouseUpAt:
			case mouseUpRightAt:
			case mouseMove:
			case mouseMoveAt:
			case type:
			case typeKeys:
			case check:
			case uncheck:
			case select:
			case addSelection:
			case removeSelection:
			case removeAllSelections:
			case submit:
			case selectFrame:
			case highlight:
			case dragdrop:
			case dragAndDrop:
			case dragAndDropToObject:
			case setCursorPosition:
			case assignId:
			case attachFile:

				String dynHTML = "";
				try{
					String entireJSFile=readEntireJsFile();
					Vector<String> addScriptArgs=new Vector<String>();
					//The entire script file
					addScriptArgs.add(entireJSFile);
					//Script id tag
					addScriptArgs.add("blah");
					
					
					Vector<String> bccCheckArgs=new Vector<String>();
					bccCheckArgs.add("function bcctest(){try{bcc; return 1;}catch(e){return -1;}} bcctest();");
					bccCheckArgs.add("bcc.init();");
					
						//try{bcc.init();}catch(e){alert("BBB");}
					String bccAttached=new SeleniumCoreCommand("getEval", bccCheckArgs, sessionId).execute();
					if(bccAttached.contains("-1")){
						LOGGER.info("WATER: Attach script");
						String temp=new SeleniumCoreCommand("addScript", addScriptArgs, sessionId).execute();
					}
					
					Vector<String> getEvalArgs=new Vector<String>();
					getEvalArgs.add("bcc.init();");
					getEvalArgs.add("bcc.init();");
					LOGGER.info("WATER: Get BCC Data");
					dynHTML = new SeleniumCoreCommand("getEval", getEvalArgs, sessionId).execute();
					System.out.println(dynHTML);
					dynHTML=dynHTML.substring(dynHTML.indexOf(',')+1);
					
				}catch(RemoteCommandException e){
					System.err.println("WATeR ERROR: While getting HTML source");
				}
				//System.out.println(dynHTML);
			
				try {
					FileWriter fw = new FileWriter("D:\\current\\"+this.action_counter+suffix+".txt");
					fw.write(dynHTML);
					fw.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			//Commands without locator
			case shiftKeyDown:
			case shiftKeyUp:
			case metaKeyDown:
			case metaKeyUp:
			case altKeyDown:
			case altKeyUp:
			case controlKeyDown:
			case controlKeyUp:
			case setSpeed:
			case open:
			case openWindow:
			case selectWindow:
			case selectPopUp:
			case deselectPopUp:
			case waitForPopUp:
			case chooseCancelOnNextConfirmation:
			case chooseOkOnNextConfirmation:
			case answerOnNextPrompt:
			case goBack:
			case refresh:
			case close:
			case windowFocus:
			case windowMaximize:
			case allowNativeXpath:
			case ignoreAttributesWithoutValue:
			case waitForCondition:
			case setTimeout:
			case waitForPageToLoad:
			case waitForFrameToLoad:
			case createCookie:
			case deleteCookie:
			case deleteAllVisibleCookies:
			case setBrowserLogLevel:
			case runScript:
			case addLocationStrategy:
			case captureEntirePageScreenshot:
			case rollup:
			case addScript:
			case removeScript:
			case useXpathLibrary:
			case setContext:
			case captureScreenshot:
			case shutDownSeleniumServer:
			case keyDownNative:
			case keyUpNative:
			case keyPressNative:
				//Don't do anything now
				break;
			case UNSUPPORTED_COMMAND:
				LOGGER.warn("MOCHI: Unsupported Command (Add cmd to MochiCommand) cmd="+cmd);
				break;
			default:
				LOGGER.info("MOCHI: Unhandled MochiCommand? cmd="+cmd);
		}
	}

	private String readEntireJsFile() {
		String retString="";
		try {
			
			Scanner scan = new Scanner(new File("D:\\water_sel\\webdiff.js"));
			while(scan.hasNextLine()){
				retString=retString+scan.nextLine()+"\n";
			}
		} catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return retString;
	}

	public void after(String results, String cmd, Vector<String> values, String sessionId) {
		 try {
			 PrintStream p;
			 if(this.action_counter==1){
				 p = new PrintStream(new BufferedOutputStream(new FileOutputStream("D:\\current\\log.txt")));
			 }
			 else{
				 p= new PrintStream(new BufferedOutputStream(new FileOutputStream("D:\\current\\log.txt",true)));
			 }
		      
			  p.println(this.action_counter+";"+cmd+";"+values.toString()+";"+results);
		      p.close();

		    } catch (Exception e) {
		      e.printStackTrace();
		    }
		LOGGER.info("WATER AFTER");
		//saveDynamicHTML(cmd, sessionId, "_after");
		
		this.action_counter++;
	}
}
