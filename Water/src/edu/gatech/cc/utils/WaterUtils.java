package edu.gatech.cc.utils;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;

import edu.gatech.cc.WaterCommand;

public class WaterUtils {
	static final Log LOGGER = LogFactory.getLog(WaterUtils.class);
	
	public static boolean hasLocator(String cmd){
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
			//WATER:Selenium Core commands
			case clickAndWait:
			case assertElementPresent:
			case assertText:
				return true;
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
			case echo:
				//Don't do anything now
				break;
			case UNSUPPORTED_COMMAND:
				LOGGER.warn("WATER: Unsupported Command (Add cmd to WaterCommand) cmd="+cmd);
				break;
			default:
				LOGGER.info("WATER: Unhandled WaterCommand? cmd="+cmd);
		}
		return false;
	}
}
