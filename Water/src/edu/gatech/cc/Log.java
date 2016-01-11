package edu.gatech.cc;

public class Log {
	private int testId;
	private String action;
	private String command;
	private String finalMsg;
	private int nodeId;
	
	public Log(int testId,String action,String command,String finalMsg, int nodeId){
		this.testId=testId;
		this.action=action;
		this.command=command;
		this.finalMsg=finalMsg;
		this.nodeId=nodeId;
	}

	

	public int getNodeId() {
		return nodeId;
	}



	public void setNodeId(int nodeId) {
		this.nodeId = nodeId;
	}



	@Override
	public String toString() {
		return "Log [testId=" + testId + ", action=" + action + ", command="
				+ command + ", finalMsg=" + finalMsg + ", nodeId=" + nodeId
				+ "]";
	}



	public int getTestId() {
		return testId;
	}

	public void setTestId(int testId) {
		this.testId = testId;
	}

	public String getAction() {
		return action;
	}

	public void setAction(String action) {
		this.action = action;
	}

	public String getCommand() {
		return command;
	}

	public void setCommand(String command) {
		this.command = command;
	}

	public String getFinalMsg() {
		return finalMsg;
	}

	public void setFinalMsg(String finalMsg) {
		this.finalMsg = finalMsg;
	}
	
}
