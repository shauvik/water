package edu.gatech.cc;
import java.util.ArrayList;

import javax.swing.text.AsyncBoxView.ChildLocator;


public class DomNode {
	private String domId;
	private String nodeName;
	private int id;
	private int nodeType;
	private int[] childrenNos;
	public int[] getChildrenNos() {
		return childrenNos;
	}
	public void setChildrenNos(int[] childrenNos) {
		this.childrenNos = childrenNos;
	}

	private ArrayList<DomNode> children=new ArrayList<DomNode>();
	private int x0;
	private int y0;
	private int x1;
	private int y1;
	private boolean clickable;
	private int parent;
	private String xPath;
	private int zIndex;
	private boolean visible;
	private String childHash;
	private String domName;
	private String linkText;
	private String classes;
	
	public DomNode(String domId,String nodeName, int id, int nodeType, int[] childrenNos,int x0,int y0,int x1,int y1,boolean clickable,int parent,String xPath,int zIndex, boolean visible,String childHash, String domName,String linkText, String classes){
		this.domId=domId;
		this.nodeName=nodeName;
		this.id=id;
		this.nodeType=nodeType;
		this.x0=x0;
		this.y0=y0;
		this.x1=x1;
		this.y1=y1;
		this.clickable=clickable;
		this.parent=parent;
		this.xPath=xPath;
		this.zIndex=zIndex;
		this.visible=visible;
		this.childHash=childHash;
		this.domName=domName;
		this.linkText=linkText;
		this.classes=classes;
		this.childrenNos=childrenNos;
	}
	public void addChild(DomNode n){
		this.children.add(n);
		
	}
	public ArrayList<DomNode> getChildren(){
		return children;
	}
	public String getDomId() {
		return domId;
	}

	public void setDomId(String domId) {
		this.domId = domId;
	}

	public String getNodeName() {
		return nodeName;
	}

	public void setNodeName(String nodeName) {
		this.nodeName = nodeName;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getNodeType() {
		return nodeType;
	}

	public void setNodeType(int nodeType) {
		this.nodeType = nodeType;
	}

	public int getX0() {
		return x0;
	}

	public void setX0(int x0) {
		this.x0 = x0;
	}

	public int getY0() {
		return y0;
	}

	public void setY0(int y0) {
		this.y0 = y0;
	}

	public int getX1() {
		return x1;
	}

	public void setX1(int x1) {
		this.x1 = x1;
	}

	public int getY1() {
		return y1;
	}

	public void setY1(int y1) {
		this.y1 = y1;
	}

	public boolean isClickable() {
		return clickable;
	}

	public void setClickable(boolean clickable) {
		this.clickable = clickable;
	}

	public int getParent() {
		return parent;
	}

	public void setParent(int parent) {
		this.parent = parent;
	}

	public String getxPath() {
		return xPath;
	}

	public void setxPath(String xPath) {
		this.xPath = xPath;
	}

	public int getzIndex() {
		return zIndex;
	}

	public void setzIndex(int zIndex) {
		this.zIndex = zIndex;
	}

	public boolean isVisible() {
		return visible;
	}

	public void setVisible(boolean visible) {
		this.visible = visible;
	}

	public String getChildHash() {
		return childHash;
	}

	public void setChildHash(String childHash) {
		this.childHash = childHash;
	}

	public String getDomName() {
		return domName;
	}

	public void setDomName(String domName) {
		this.domName = domName;
	}

	public String getLinkText() {
		return linkText;
	}

	public void setLinkText(String linkText) {
		this.linkText = linkText;
	}

	public String getClasses() {
		return classes;
	}

	public void setClasses(String classes) {
		this.classes = classes;
	}

	@Override
	public String toString() {
		return "Node [domId=" + domId + ", nodeName=" + nodeName + ", id=" + id
				+ ", nodeType=" + nodeType + ", chidrenNos=" + childrenNos
				+  ", x0=" + x0 + ", y0=" + y0
				+ ", x1=" + x1 + ", y1=" + y1 + ", clickable=" + clickable
				+ ", parent=" + parent + ", xPath=" + xPath + ", zIndex="
				+ zIndex + ", visible=" + visible + ", childHash=" + childHash
				+ ", domName=" + domName + ", linkText=" + linkText
				+ ", classes=" + classes + "]";
	}
}
