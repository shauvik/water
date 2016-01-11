package edu.gatech.cc;
import java.io.File;
import java.io.IOException;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Scanner;

import org.apache.commons.codec.binary.Base64;


public class BuildTree {
	
	private static String unescape(String s) {
	    StringBuffer sbuf = new StringBuffer () ;
	    int l  = s.length() ;
	    int ch = -1 ;
	    int b, sumb = 0;
	    for (int i = 0, more = -1 ; i < l ; i++) {
	      /* Get next byte b from URL segment s */
	      switch (ch = s.charAt(i)) {
		case '%':
		  ch = s.charAt (++i) ;
		  int hb = (Character.isDigit ((char) ch) 
			    ? ch - '0'
			    : 10+Character.toLowerCase((char) ch) - 'a') & 0xF ;
		  ch = s.charAt (++i) ;
		  int lb = (Character.isDigit ((char) ch)
			    ? ch - '0'
			    : 10+Character.toLowerCase ((char) ch)-'a') & 0xF ;
		  b = (hb << 4) | lb ;
		  break ;
		case '+':
		  b = ' ' ;
		  break ;
		default:
		  b = ch ;
	      }
	      /* Decode byte b as UTF-8, sumb collects incomplete chars */
	      if ((b & 0xc0) == 0x80) {			// 10xxxxxx (continuation byte)
		sumb = (sumb << 6) | (b & 0x3f) ;	// Add 6 bits to sumb
		if (--more == 0) sbuf.append((char) sumb) ; // Add char to sbuf
	      } else if ((b & 0x80) == 0x00) {		// 0xxxxxxx (yields 7 bits)
		sbuf.append((char) b) ;			// Store in sbuf
	      } else if ((b & 0xe0) == 0xc0) {		// 110xxxxx (yields 5 bits)
		sumb = b & 0x1f;
		more = 1;				// Expect 1 more byte
	      } else if ((b & 0xf0) == 0xe0) {		// 1110xxxx (yields 4 bits)
		sumb = b & 0x0f;
		more = 2;				// Expect 2 more bytes
	      } else if ((b & 0xf8) == 0xf0) {		// 11110xxx (yields 3 bits)
		sumb = b & 0x07;
		more = 3;				// Expect 3 more bytes
	      } else if ((b & 0xfc) == 0xf8) {		// 111110xx (yields 2 bits)
		sumb = b & 0x03;
		more = 4;				// Expect 4 more bytes
	      } else /*if ((b & 0xfe) == 0xfc)*/ {	// 1111110x (yields 1 bit)
		sumb = b & 0x01;
		more = 5;				// Expect 5 more bytes
	      }
	      /* We don't test if the UTF-8 encoding is well-formed */
	    }
	    return sbuf.toString() ;
	  }
	
	@SuppressWarnings("deprecation")
	public ArrayList<String[]> readFile(String fileName){
		try{
			Scanner scan=new Scanner(new File(fileName));
			ArrayList<String[]> allNodeLines=new ArrayList<String[]>();
			while(scan.hasNextLine()){
				String nodeStr=scan.nextLine();
				if(nodeStr.charAt(0)==','){
					nodeStr=nodeStr.substring(1);
				}
				String[] nodeProperties=nodeStr.split("\\+\\-h\\+\\-");
				for(int i=0;i<nodeProperties.length;i++){
					String tempStr=nodeProperties[i].substring(1, nodeProperties[i].length()-1);
					byte[] myBytes=new Base64().decode(tempStr);
					
					String myString = new String(myBytes,0,myBytes.length,"UTF-8");
					myString=unescape(myString);
					if(myBytes[0]==0)
						myString="";
					nodeProperties[i]="("+myString+")";
				}
				//Debug Statmnt: if stmt should never get hit
				if(nodeProperties.length<18){
					System.out.println("fn:"+fileName+" nodeStr:"+nodeStr);
				}
				allNodeLines.add(nodeProperties);
				
			}
			return allNodeLines;
		}
		catch(Exception e)
		{
			e.printStackTrace();
		}
		return null;
	}
	
	public HashMap<Integer, DomNode> addAllNodesToHashMap(ArrayList<String[]> allNodes){
		HashMap<Integer, DomNode> allNodeHashMap=new HashMap<Integer, DomNode>();
		
		String domId;
		String nodeName;
		int id;
		int nodeType;
		int x0;
		int y0;
		int x1;
		int y1;
		boolean clickable;
		int parent;
		String xPath;
		int zIndex;
		boolean visible;
		String childHash;
		String domName;
		String linkText;
		String classes;
		
		for(String[] node:allNodes){
			
			if(node[0].length()>2){
				domId=node[0].substring(1, node[0].length()-1);
			}
			else{
				domId="";
			}
			if(domId.equals("undefined") || domId.equals("notPresent")){
				domId="";
			}
			if(node[1].length()>2){
				nodeName=node[1].substring(1, node[1].length()-1);
			}
			else{
				nodeName="";
			}
//			System.out.println(node[2]);
			id=Integer.parseInt(node[2].substring(1, node[2].length()-1));
			nodeType=Integer.parseInt(node[3].substring(1, node[3].length()-1));
			if(node[5].substring(1, node[5].length()-1).equals("-1-1")){
				x0=-1111111;
			}
			else{
				x0=Integer.parseInt(node[5].substring(1, node[5].length()-1));
			}
			if(node[6].substring(1, node[6].length()-1).equals("-1-1")){
				y0=-1111111;
			}
			else{
				y0=Integer.parseInt(node[6].substring(1, node[6].length()-1));
			}
			if(node[7].substring(1, node[7].length()-1).equals("-1-1")){
					x1=-1111111;
			}
			else{
				x1=Integer.parseInt(node[7].substring(1, node[7].length()-1));
			}
			if(node[8].substring(1, node[8].length()-1).equals("-1-1")){
				y1=-1111111;
			}
			else{
				y1=Integer.parseInt(node[8].substring(1, node[8].length()-1));
			}
			
			if(Integer.parseInt(node[9].substring(1, node[9].length()-1))==1){
				clickable=true;
			}
			else{
				clickable=false;
			}
			parent=Integer.parseInt(node[10].substring(1, node[10].length()-1));
			xPath=node[11].substring(1, node[11].length()-1);
			zIndex=Integer.parseInt(node[12].substring(1, node[12].length()-1));
			
			if(Integer.parseInt(node[13].substring(1, node[13].length()-1))==1){
				visible=true;
			}
			else{
				visible=false;
			}
			
			childHash=node[14].substring(1, node[14].length()-1);
			if(node[15].length()>2){
				domName=node[15].substring(1, node[15].length()-1);
			}
			else{
				domName="";
			}
			if(node[16].length()>2){
				linkText=node[16].substring(1, node[16].length()-1);
			}
			else{
				linkText="";
			}
			if(node[17].length()>2){
				classes=node[17].substring(1, node[17].length()-1);
			}
			else{
				classes="";
			}
				String childrenText=node[4].substring(1, node[4].length()-1);
				int[] childrenNosint=null;
				if(childrenText.length()>0){
					String[] childrenNos=childrenText.split(",");
					childrenNosint=new int[childrenNos.length];
			
					for(int i=0;i<childrenNos.length;i++){
						childrenNosint[i]=Integer.parseInt(childrenNos[i]);
					}
				}
				
			DomNode tempNode=new DomNode(domId, nodeName, id, nodeType, childrenNosint, x0, y0, x1, y1, clickable, parent, xPath, zIndex, visible, childHash, domName, linkText, classes);
			allNodeHashMap.put(id, tempNode);
		}
		return allNodeHashMap;
		
	}
	public HashMap<Integer, DomNode> buildFinalTree(HashMap<Integer, DomNode> allNodes){
		HashMap<Integer, DomNode> finalNodeList=new HashMap<Integer, DomNode>();
		for(int i=0;i<allNodes.size();i++){
			DomNode tempNode=allNodes.get(i);
			if(tempNode.getChildrenNos()!=null){
				for(int child:tempNode.getChildrenNos()){
					tempNode.addChild(allNodes.get(child));
				}			
			}
			finalNodeList.put(tempNode.getId(), tempNode);
		}
		return finalNodeList;
		
		
	}
	
	public static void main(String[] args){
		BuildTree b=new BuildTree();
		ArrayList<String[]> allNodeLines=b.readFile("D:\\current\\old\\2_before.txt");
		HashMap<Integer, DomNode> map=b.addAllNodesToHashMap(allNodeLines);
		HashMap<Integer, DomNode> allNodes=b.buildFinalTree(map);
//		System.out.println(root.getChildren().get(0).getChildren().get(1).getChildren().get(0)+" ");
	}
}
