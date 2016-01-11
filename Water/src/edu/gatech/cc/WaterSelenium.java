package edu.gatech.cc;

import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.HttpCommandProcessor;

public class WaterSelenium extends DefaultSelenium {
	 public WaterSelenium(String serverHost, int serverPort, String browserStartCommand, String browserURL) {
	        super(serverHost, serverPort, browserStartCommand, browserURL);
	 }
	 
	//WATER: getSessionID from CommandProcessor 
	public String getWaterSessionId(){
		if(this.commandProcessor instanceof HttpCommandProcessor){
			return ((HttpCommandProcessor) this.commandProcessor).getWaterSessionId();
		}
		return null;
	}
	 
	 
    //WATER: Add Assert Commands
	public String assertElementPresent(String locator){
		return commandProcessor.doCommand("assertElementPresent", new String[] {locator,});
	}
	public String clickAndWait(String locator){
		return commandProcessor.doCommand("clickAndWait", new String[] {locator,});
	}
	public String assertText(String locator,String text){
		return commandProcessor.doCommand("assertText", new String[] {locator,text});
	}
	
}
