package edu.gatech.cc;

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
import org.openqa.selenium.server.RemoteCommandException;
import org.openqa.selenium.server.SeleniumServer;
import org.openqa.selenium.server.commands.SeleniumCoreCommand;

import edu.gatech.cc.utils.WaterUtils;


public class WaterRecorder {
	static final Log LOGGER = LogFactory.getLog(WaterRecorder.class);
	int action_counter = 0;
	String test_name = "Default";
	public WaterRecorder() {
		LOGGER.info("WATER RECORDER: INIT");
		this.action_counter=1;
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
		
		if(WaterUtils.hasLocator(cmd)){
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
//				System.out.println(dynHTML);
				dynHTML=dynHTML.substring(dynHTML.indexOf(',')+1);
				
			}catch(RemoteCommandException e){
				System.err.println("WATeR ERROR: While getting HTML source");
			}
			//System.out.println(dynHTML);
		
			try {
				FileWriter fw = new FileWriter("D:\\water\\"+sessionId+"\\"+this.action_counter+suffix+".txt");
				fw.write(dynHTML);
				fw.close();
			} catch (IOException e) {
				e.printStackTrace();
			}	
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

	public void after(String results, String cmd, Vector<String> values, String nodeid, String sessionId) {
		 try {
			 PrintStream p;
			 String path = "D:\\water\\"+sessionId;
			 new File(path).mkdirs();
			 path = path + "\\log.txt"; 
				 
			 if(this.action_counter==1){
				 p = new PrintStream(new BufferedOutputStream(new FileOutputStream(path)));
			 }
			 else{
				 p= new PrintStream(new BufferedOutputStream(new FileOutputStream(path,true)));
			 }
		      if(nodeid.length()==0 || !nodeid.startsWith("OK,")){
		    	  System.out.println("PAANI IN HERE");
		    	  System.out.println(nodeid);
		    	  nodeid="-1";
		      }
		      else{
		    	  nodeid=nodeid.substring(3);
		      }
			  p.println(this.action_counter+";"+cmd+";"+values.toString()+";"+results+";"+nodeid);
		      p.close();

		    } catch(FileNotFoundException e){
			    	System.err.println("WATER ERROR: File not found");
			        e.printStackTrace();
		    }
		LOGGER.info("WATER AFTER");
		//saveDynamicHTML(cmd, sessionId, "_after");
		
		this.action_counter++;
	}
}
