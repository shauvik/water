package edu.gatech.cc;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Scanner;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.omg.CORBA.Current;

import edu.gatech.cc.utils.WaterUtils;


public class WaterRepair {
	private String currentMsg="";
	int currentCounter=0;
	String currentTestCase="C:\\Users\\husayn\\Desktop\\ofbizSO.html";
	String currentTestCaseOutput="C:\\temp_h\\ofbizSO";
	private ArrayList<String> repairList=new ArrayList<String>();
	public ArrayList<String[]> parseLog(String fileLoc){
		ArrayList<String[]> allLogLines=new ArrayList<String[]>();
		try{
			Scanner scan=new Scanner(new File(fileLoc));
			while(scan.hasNextLine()){
				String logLine=scan.nextLine();
				String[] logSplit=logLine.split(";");
				allLogLines.add(logSplit);
			}
			return allLogLines;
		}
		catch(Exception e){
			e.printStackTrace();
		}
		return null;
	}
	
	public ArrayList<Log> makeLogObjects(ArrayList<String[]> allLogLines){
		ArrayList<Log> logLines=new ArrayList<Log>();
		for(String[] logLine:allLogLines){
			logLines.add(new Log(Integer.parseInt(logLine[0]), logLine[1], logLine[2], logLine[3],Integer.parseInt(logLine[4])));
		}
		
		return logLines;
	}
	
	public List<HashMap<Integer, DomNode>> getDomTreeCollection(ArrayList<Log> logLines, String newOld,String oldDataPath,String newDataPath){
		List<HashMap<Integer, DomNode>> domRoots = new ArrayList<HashMap<Integer, DomNode>>();
		for(int i=0;i<=logLines.size();i++){
			domRoots.add(new HashMap<Integer, DomNode>());
		}
		for(Log logLine:logLines){
			if(WaterUtils.hasLocator(logLine.getAction())){
				BuildTree b=new BuildTree();
				ArrayList<String[]> allNodeLines;
				if(newOld.equals("new")){
					allNodeLines=b.readFile(newDataPath+"\\"+logLine.getTestId()+"_before.txt");
				}
				else{
					allNodeLines=b.readFile(oldDataPath+"\\"+logLine.getTestId()+"_before.txt");
				}
				
				HashMap<Integer, DomNode> map=b.addAllNodesToHashMap(allNodeLines);
				domRoots.set(logLine.getTestId(), b.buildFinalTree(map));
			}
		}
		
		return domRoots;
	}
	
	public int[] findIMsg(ArrayList<Log> logLines){
		for(Log line: logLines){
			int msgId=getMessageType(line.getFinalMsg());
			if(msgId!=2){
				int[] tempArr=new int[3];
				tempArr[0]=line.getTestId();tempArr[1]=msgId;
				currentMsg=line.getFinalMsg();
				return tempArr;
			}
		}
		return null;
	}
	
	public void suggestRepairs(int i,int msg,List<HashMap<Integer, DomNode>> oldDomTrees,List<HashMap<Integer, DomNode>> newDomTrees, int oldNodeId){
		if(msg==0){
			//Locator update
			repairLocators(i,oldDomTrees.get(i),newDomTrees.get(i),oldNodeId);
		}
		else if(msg==1){
			//Locator update
			repairLocators(i,oldDomTrees.get(i),newDomTrees.get(i),oldNodeId);
//			repairList=new ArrayList<String>();//Remove this line it was to skip the if stmt
			if(repairList.size()>0){
				return;
			}
			//Value Update
			if(currentMsg.matches(".*Actual value .* did not match .*")){
				Pattern p=Pattern.compile("value '(.*?)'");
				Matcher matcher = p.matcher("ERROR: Actual value 'Works Wow!' did not match 'Works!'");
				String newVal="";
				 while(matcher.find()){
					 newVal=matcher.group(1);
				 }
				checkRepair(currentTestCase,i,newVal,currentTestCaseOutput,2);
				
			}
			
		}
		
		return;
	}
	
	public void checkRepair(String testCasePath,int i,String repair,String outputPath,int arg){
		String testCase=SeleniumHTMLDriver.changeTestCase(testCasePath,arg,i,repair);
		testCasePath=testCaseToFile(testCase,outputPath+"_"+i+"_"+currentCounter);
		String sessidN=SeleniumHTMLDriver.runTestCase(testCasePath,"anotherBlah"+currentCounter);
		int n=Integer.valueOf(sessidN.substring(sessidN.indexOf(',')+1));
		int oldCounter=currentCounter;
		currentCounter++;
		if(n==0){
			 if(testCasePath.length()>0){
				 repairList.add(testCasePath);
				 
			 }
			 
			 return;
		}
		else if(n>i){
			///Suggest a multistep repair
			currentTestCase=testCasePath;
			try {
				Thread.sleep(20000);
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			suggestRepairData("D:\\water\\old","D:\\water\\anotherBlah"+oldCounter);
		}
		
		return ;
		
		
	}
	private String testCaseToFile(String testCase, String outputPath) {
		try {
			BufferedWriter out = new BufferedWriter(new FileWriter(outputPath));
			out.write(testCase);
			out.close();
			return outputPath;
			} 
			catch (Exception e) 
			{ 
			System.out.println("testCase to file failed");

			}
			return "";
		
	}
	/** List order maintained 
	 * @return **/

	
	public void repairLocators(int i, HashMap<Integer, DomNode> oldTree, HashMap<Integer, DomNode> newTree, int oldNodeId) {
		// TODO Auto-generated method stub
		ArrayList<DomNode> nodeOrepairList=new ArrayList<DomNode>();
		DomNode nodeO=oldTree.get(oldNodeId);
		System.out.println("oldNode: "+nodeO);
		String oldDomId=nodeO.getDomId();
		String oldXPath=nodeO.getxPath();
		String oldClassName=nodeO.getClasses();
		String oldLinkText=nodeO.getLinkText();
		String oldName=nodeO.getDomName();
		
		Set<DomNode> matches=new HashSet<DomNode>();
		
		Collection<DomNode> newTreeList = newTree.values();
		
		if(oldDomId.length()>0){
			for(DomNode n:newTreeList)
			{
				if(n.getDomId().equals(oldDomId))
				{
					System.out.println("old id:" + oldDomId+" "+n);
					matches.add(n);
				}
			}
		}
		
		if(oldXPath.length()>0){
			for(DomNode n:newTreeList)
			{
				if(n.getxPath().equals(oldXPath))
				{
					System.out.println("old xp:" + oldXPath+" "+n);
					matches.add(n);
				}
			}
		}
		
		if(oldClassName.length()>0){
			for(DomNode n:newTreeList)
			{
				if(n.getClasses().equals(oldClassName))
				{
					System.out.println("old class:" + oldClassName+" "+n);
					matches.add(n);
				}
			}
		}
		
		if(oldLinkText.length()>0){
			for(DomNode n:newTreeList)
			{
				if(n.getLinkText().equals(oldLinkText))
				{
					System.out.println("old lt:" + oldLinkText+" "+n);
					matches.add(n);
				}
			}
		}
		
		if(oldName.length()>0){
			for(DomNode n:newTreeList)
			{
				if(n.getDomName().equals(oldName))
				{
					System.out.println("old dom name"+oldName);
					matches.add(n);
				}
			}
		}
		
		//TODO:Repair TC: Parse Test Case
		String retPath="";
		for(DomNode newnode:matches){
//			nodeOrepairList.add(newnode);
			checkRepair(currentTestCase,i,"/"+newnode.getxPath(),currentTestCaseOutput,1);
			System.err.println("Property Match: "+newnode+" "+i+" "+nodeO);
			
		
			
		}
		if(matches.size()==0){
			ArrayList<Double> sIList=new ArrayList<Double>(); 
			for(DomNode n:newTreeList)
			{
				double sI=getSimilarityIndex(nodeO,n);
				if(sI>0.5){
					sIList.add(sI);
					matches.add(n);
				}
			}
			int j=0;
			for(DomNode newnode:matches){
				checkRepair(currentTestCase,i,"/"+newnode.getxPath(),currentTestCaseOutput,1);
				System.err.println("sI Match: "+newnode+" "+i+" "+sIList.get(j));
				
				j++;
			}
		}
//		repairs.put(nodeO, nodeOrepairList);
	}

private double getSimilarityIndex(DomNode a, DomNode b) {
		double alpha=0.9;
		double rho,rho1,rho2=0;
		if(a.getNodeName().equals(b.getNodeName())){
			LevenshteinDistance l=new LevenshteinDistance();
			double levDist=l.computeLevenshteinDistance(a.getxPath(),b.getxPath());
			rho1=1-levDist/Math.max(a.getxPath().length(), b.getxPath().length());
			
			if(Math.abs(a.getX0()-b.getX0())<=5 && Math.abs(a.getX1()-b.getX1())<=5 && Math.abs(a.getY0()-b.getY0())<=5 && Math.abs(a.getY1()-b.getY1())<=5){
				rho2=rho2+1;
			}
			if(a.isClickable()==b.isClickable()){
				rho2=rho2+1;
			}
			if(a.isVisible()==b.isVisible()){
				rho2=rho2+1;
			}
			if(a.getzIndex()==b.getzIndex()){
				rho2=rho2+1;
			}
			rho2=rho2/5;
			rho=(rho1*alpha+rho2*(1-alpha));
			
			return rho; 
		}
		return 0;
	}

//	public void
	public void suggestRepairData(String oldDataPath,String newDataPath){
		ArrayList<Log> oldLog = makeLogObjects(parseLog(oldDataPath+"\\log.txt"));
		ArrayList<Log> newLog = makeLogObjects(parseLog(newDataPath+"\\log.txt"));
		List<HashMap<Integer, DomNode>> oldDomTrees=getDomTreeCollection(oldLog,"old",oldDataPath,newDataPath);
		List<HashMap<Integer, DomNode>> newDomTrees=getDomTreeCollection(newLog,"new",oldDataPath,newDataPath);
		int[] iMsg=findIMsg(newLog);
		int i=iMsg[0];
		int msg=iMsg[1];
		int oldNodeId=-1;
		for(Log oldLine:oldLog){
			if(oldLine.getTestId()==i)
				oldNodeId=oldLine.getNodeId();
		}
		
		suggestRepairs(i,msg,oldDomTrees,newDomTrees,oldNodeId);
	}
	public int getMessageType(String msg){
		String[] locator_errors = {".*Element .* not found.*","Invalid xpath.*", "Specified element is not a select"};
		String[] assertion_failures = {".*Expected .* but was .*", ".*Actual value .* did not match .*", ".*Actual value .* did not match .*","ERROR: false"};

	  for(String err : locator_errors){ if(msg.matches(err)) return 0; }
	  for(String err : assertion_failures){ if(msg.matches(err)) return 1; }
	  return 2;
	}
	public static void main(String[] args){
		WaterRepair w=new WaterRepair();
		w.suggestRepairData("D:\\water\\old","D:\\water\\new");
		System.out.println(w.repairList+"  "+w.repairList.size());
	}
	
}
