package edu.gatech.cc;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.htmlparser.Node;
import org.htmlparser.Parser;
import org.htmlparser.filters.TagNameFilter;
import org.htmlparser.nodes.TagNode;
import org.htmlparser.util.NodeIterator;
import org.htmlparser.util.NodeList;
import org.htmlparser.util.ParserException;

import com.thoughtworks.selenium.Selenium;
import com.thoughtworks.selenium.SeleniumException;

public class SeleniumHTMLDriver {
	Selenium selenium;
	private HashMap<String, String> storeVars;
	public String testSessionName = null;
	public SeleniumHTMLDriver(int port, String browserString, String url, String testSessionName) {
		storeVars=new HashMap<String, String>();
		this.selenium = new WaterSelenium("localhost", port,
				browserString, url);
		this.selenium.start();
		this.testSessionName = testSessionName;
	}
	
	public void stopSelenium(){
		this.selenium.stop();
	}
	
	public int PassResult(){
		
		return 0;
	}

	public static void main(String[] args) {
		// Parse HTML
		String oldHtmlFile = "C:\\Users\\husayn\\Desktop\\cp0004_order0.html";
		runTestCase(oldHtmlFile, "old");
		String newHtmlFile = "C:\\Users\\husayn\\Desktop\\cp0004_order.html";
		runTestCase(newHtmlFile, "new");
	}
	
	public static String changeTestCase(String htmlFile,int arg, int nodeNo,String repair){
			try{
				Parser parser = new Parser(htmlFile);
				int startPos=0,endPos=0;
				NodeList nl = parser.extractAllNodesThatMatch(new TagNameFilter("tr"));
				int steps = nl.size();
				
				for(int i=1;i<steps;i++){
					if(i==nodeNo){
						Node n = nl.elementAt(i);
						//System.out.println("=> "+n.toHtml());
						NodeList cl = n.getChildren();
						String cmd = cl.elementAt(1).getFirstChild().getText();
						Node arg1 = (cl.elementAt(3).getChildren()==null)? null: cl.elementAt(3);
						Node arg2 = (cl.elementAt(5).getChildren()==null)? null: cl.elementAt(5);
						if(arg==1){
							Node t = arg1.getFirstChild();
							startPos = t.getStartPosition();
							endPos = t.getEndPosition();
						}
						else{
							Node t = arg2.getFirstChild();
							startPos = t.getStartPosition();
							endPos = t.getEndPosition();
							
//							System.out.println("arrrrg2");
//							arg2.getFirstChild().setText("new_locator");
//							System.out.println(arg2.getFirstChild().getText()+"  bccc");
						}
					
					//MODIFY LIKE THIS
					//arg1.getFirstChild().setText("new_locator");
						break;
					}
				}
				parser.reset();

				NodeIterator nI = parser.elements();
				StringBuffer html = new StringBuffer();
				while(nI.hasMoreNodes()){
					Node n = nI.nextNode();
					html.append(n.toHtml());
				}
				if(endPos > 0){
					return html.substring(0,startPos)+repair+html.substring(endPos);
				}
			}
			catch(Exception e){
				e.printStackTrace();
			}
			return "";
	}
	public static String runTestCase(String htmlFile, String testSessionName) {
		SeleniumHTMLDriver htmlDriver=null;
		int maxStep=0;
		try {
			Parser parser = new Parser(htmlFile);
			//Extract URL
			NodeList nla = parser.extractAllNodesThatMatch(new TagNameFilter("link"));
			TagNode tn = (TagNode) nla.elementAt(0);
			String url = tn.getAttribute("href");
			
			//Init driver
			htmlDriver = new SeleniumHTMLDriver(4444, "*chrome", url, testSessionName);
			
			//Extract commands
			parser.reset();
			NodeList nl = parser.extractAllNodesThatMatch(new TagNameFilter("tr"));
			int steps = nl.size();
			
			for(int i=1;i<steps;i++){
				maxStep=i;
				Node n = nl.elementAt(i);
				//System.out.println("=> "+n.toHtml());
				NodeList cl = n.getChildren();
				String cmd = cl.elementAt(1).getFirstChild().getText();
				String arg1 = (cl.elementAt(3).getChildren()==null)? null: cl.elementAt(3).getFirstChild().getText();
				String arg2 = (cl.elementAt(5).getChildren()==null)? null: cl.elementAt(5).getFirstChild().getText();
				//System.out.println(cmd+","+arg1+","+arg2);
				
				//TODO:Parse args using regex to replace $var with the variable value
				try{
					htmlDriver.selInvoke2(cmd, arg1, arg2);
					maxStep=0;
				}catch (Exception e) {
					// TODO: handle exception
					System.out.println("The given test case has an error while running on the site.");
				}
				
				//MODIFY LIKE THIS
//				arg1.getFirstChild().setText("new_locator");
			}
		} catch (ParserException e) {
			e.printStackTrace();
		}
		
		//Save current session as desired
        try {
        	if(htmlDriver.testSessionName != null){
        		System.out.println(htmlDriver.getWaterSessionId()+"      "+htmlDriver.testSessionName);
        		Process pr = Runtime.getRuntime().exec("cmd /C move \"D:\\water\\"+htmlDriver.getWaterSessionId()+"\" \"D:\\water\\"+htmlDriver.testSessionName+"\"");
        		return htmlDriver.testSessionName+","+maxStep;
        	}
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		htmlDriver.stopSelenium();
		
		return htmlDriver.getWaterSessionId();
		
	}
	
	public String getWaterSessionId(){
		return ((WaterSelenium)this.selenium).getWaterSessionId();
	}

	private void testDriver(){
		SeleniumHTMLDriver htmlDriver = new SeleniumHTMLDriver(4444, "*chrome", "http://yahoo.com", null);
		htmlDriver.selInvoke("open", new String[] { "/" });
		//htmlDriver.testYahoo();		
		htmlDriver.stopSelenium();
	}
	
	private void testYahoo() {
		// Run commands
		this.selInvoke("open", new String[] { "/" });
		this.selInvoke("type", new String[] {"p_13838465-p", "shauvik"});
		this.selInvoke("clickAndWait", new String[] {"search-submit"});
		try {
			Thread.sleep(10000);
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	public ArrayList<String> findAllVars(String str){
		ArrayList<String> allVar=new ArrayList<String>();
		Matcher matcher =Pattern.compile("\\$\\{(.*?)\\}").matcher(str);
		while (matcher.find()){
			allVar.add(matcher.group(1));
		}
		return allVar;
	}
	public String replaceVarInArg(String arg,ArrayList<String> variables){
		for(String var:variables){
			String replaceVal=storeVars.get(var);
			arg=arg.replaceAll("\\$\\{"+var+"\\}", replaceVal);
		}
		return arg;
	}
	public void selInvoke2(String cmd, String arg1, String arg2) throws SeleniumException{
		if(arg1 !=null){
			arg1=replaceVarInArg(arg1,findAllVars(arg1));
		}
		if(arg2 !=null){
			arg2=replaceVarInArg(arg2,findAllVars(arg2));
		}
		
		if(arg1 != null){
			if(arg2 != null){
				selInvoke(cmd, new String [] {arg1, arg2});
			}else{
				selInvoke(cmd, new String [] {arg1});
			}
		}else{
			selInvoke(cmd, new String [] {});
		}
	}
	private void selInvoke(String mName,
			String[] args) throws SeleniumException{
		Class cls, cls1;
		try {
			
			cls = Class.forName("edu.gatech.cc.WaterSelenium");
			cls1 = Class.forName("com.thoughtworks.selenium.DefaultSelenium");
			Method[] ms = cls.getDeclaredMethods();
			List<Method> methods = new ArrayList<Method>(Arrays.asList(ms));
			methods.addAll(Arrays.asList(cls1.getDeclaredMethods()));	
			
			boolean isHandled=false;
			for (Method m : methods) {
				int len = m.getParameterTypes().length;
				if (mName.equals(m.getName()) && (len == args.length)) {
					isHandled=true;
					//System.err.println("Invoking "+m.getName()+ ":"+len);
					switch (len) {
					case 0:
						m.invoke(selenium);
						break;
					case 1:
						m.invoke(selenium, args[0]);
						break;
					case 2:
						m.invoke(selenium, args[0], args[1]);
						break;
					case 3:
						m.invoke(selenium, args[0], args[1], args[2]);
						break;
					default:
						System.err.println("Check Selenium command args.");
					}
				}
			}
			
			if(!isHandled){
				handleSpecialCommand(mName, args);
			}
		} catch (SeleniumException se) {
			se.printStackTrace();
			System.exit(0);
			return;
		} catch (InvocationTargetException e){
			//e.printStackTrace();
			Throwable t = e.getCause();
			if ("com.thoughtworks.selenium.SeleniumException".equals(t.getClass().getName())){
				throw (SeleniumException) t;
			}
		} catch (Exception e){
			e.printStackTrace();
		}
		return;
	}

	private void handleSpecialCommand(String mName, String[] args) {
		if("store".equals(mName)){
			storeVars.put(args[1], args[0]);
		}
		else{
			System.err.println("ERROR: Special Command '"+mName+"' not supported by SeleniumHTMLDriver");
		}
	}
}
