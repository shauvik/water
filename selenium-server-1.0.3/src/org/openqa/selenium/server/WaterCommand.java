package org.openqa.selenium.server;

/*
 * -- SELENIUM CORE COMMANDS --
 * -- For completeness, we include all the commands supported by Selenium-Java-Client-Driver 1.0.1
 * 
	"click", new String[] {locator,}
	"doubleClick", new String[] {locator,}
	"contextMenu", new String[] {locator,}
	"clickAt", new String[] {locator,coordString,}
	"doubleClickAt", new String[] {locator,coordString,}
	"contextMenuAt", new String[] {locator,coordString,}
	"fireEvent", new String[] {locator,eventName,}
	"focus", new String[] {locator,}
	"keyPress", new String[] {locator,keySequence,}
	"shiftKeyDown", new String[] {}
	"shiftKeyUp", new String[] {}
	"metaKeyDown", new String[] {}
	"metaKeyUp", new String[] {}
	"altKeyDown", new String[] {}
	"altKeyUp", new String[] {}
	"controlKeyDown", new String[] {}
	"controlKeyUp", new String[] {}
	"keyDown", new String[] {locator,keySequence,}
	"keyUp", new String[] {locator,keySequence,}
	"mouseOver", new String[] {locator,}
	"mouseOut", new String[] {locator,}
	"mouseDown", new String[] {locator,}
	"mouseDownRight", new String[] {locator,}
	"mouseDownAt", new String[] {locator,coordString,}
	"mouseDownRightAt", new String[] {locator,coordString,}
	"mouseUp", new String[] {locator,}
	"mouseUpRight", new String[] {locator,}
	"mouseUpAt", new String[] {locator,coordString,}
	"mouseUpRightAt", new String[] {locator,coordString,}
	"mouseMove", new String[] {locator,}
	"mouseMoveAt", new String[] {locator,coordString,}
	"type", new String[] {locator,value,}
	"typeKeys", new String[] {locator,value,}
	"setSpeed", new String[] {value,}
	"check", new String[] {locator,}
	"uncheck", new String[] {locator,}
	"select", new String[] {selectLocator,optionLocator,}
	"addSelection", new String[] {locator,optionLocator,}
	"removeSelection", new String[] {locator,optionLocator,}
	"removeAllSelections", new String[] {locator,}
	"submit", new String[] {formLocator,}
	"open", new String[] {url,}
	"openWindow", new String[] {url,windowID,}
	"selectWindow", new String[] {windowID,}
	"selectPopUp", new String[] {windowID,}
	"deselectPopUp", new String[] {}
	"selectFrame", new String[] {locator,}
	"waitForPopUp", new String[] {windowID,timeout,}
	"chooseCancelOnNextConfirmation", new String[] {}
	"chooseOkOnNextConfirmation", new String[] {}
	"answerOnNextPrompt", new String[] {answer,}
	"goBack", new String[] {}
	"refresh", new String[] {}
	"close", new String[] {}
	"highlight", new String[] {locator,}
	"dragdrop", new String[] {locator,movementsString,}
	"setMouseSpeed", new String[] {pixels,}
	"dragAndDrop", new String[] {locator,movementsString,}
	"dragAndDropToObject", new String[] {locatorOfObjectToBeDragged,locatorOfDragDestinationObject,}
	"windowFocus", new String[] {}
	"windowMaximize", new String[] {}
	"setCursorPosition", new String[] {locator,position,}
	"assignId", new String[] {locator,identifier,}
	"allowNativeXpath", new String[] {allow,}
	"ignoreAttributesWithoutValue", new String[] {ignore,}
	"waitForCondition", new String[] {script,timeout,}
	"setTimeout", new String[] {timeout,}
	"waitForPageToLoad", new String[] {timeout,}
	"waitForFrameToLoad", new String[] {frameAddress,timeout,}
	"createCookie", new String[] {nameValuePair,optionsString,}
	"deleteCookie", new String[] {name,optionsString,}
	"deleteAllVisibleCookies", new String[] {}
	"setBrowserLogLevel", new String[] {logLevel,}
	"runScript", new String[] {script,}
	"addLocationStrategy", new String[] {strategyName,functionDefinition,}
	"captureEntirePageScreenshot", new String[] {filename,kwargs,}
	"rollup", new String[] {rollupName,kwargs,}
	"addScript", new String[] {scriptContent,scriptTagId,}
	"removeScript", new String[] {scriptTagId,}
	"useXpathLibrary", new String[] {libraryName,}
	"setContext", new String[] {context,}
	"attachFile", new String[] {fieldLocator,fileLocator,}
	"captureScreenshot", new String[] {filename,}
	"shutDownSeleniumServer", new String[] {}
	"keyDownNative", new String[] {keycode,}
	"keyUpNative", new String[] {keycode,}
	"keyPressNative", new String[] {keycode,}
 */


public enum WaterCommand {
	click,
	doubleClick,
	contextMenu,
	clickAt,
	doubleClickAt,
	contextMenuAt,
	fireEvent,
	focus,
	keyPress,
	shiftKeyDown,
	shiftKeyUp,
	metaKeyDown,
	metaKeyUp,
	altKeyDown,
	altKeyUp,
	controlKeyDown,
	controlKeyUp,
	keyDown,
	keyUp,
	mouseOver,
	mouseOut,
	mouseDown,
	mouseDownRight,
	mouseDownAt,
	mouseDownRightAt,
	mouseUp,
	mouseUpRight,
	mouseUpAt,
	mouseUpRightAt,
	mouseMove,
	mouseMoveAt,
	type,
	typeKeys,
	setSpeed,
	check,
	uncheck,
	select,
	addSelection,
	removeSelection,
	removeAllSelections,
	submit,
	open,
	openWindow,
	selectWindow,
	selectPopUp,
	deselectPopUp,
	selectFrame,
	waitForPopUp,
	chooseCancelOnNextConfirmation,
	chooseOkOnNextConfirmation,
	answerOnNextPrompt,
	goBack,
	refresh,
	close,
	highlight,
	dragdrop,
	setMouseSpeed,
	dragAndDrop,
	dragAndDropToObject,
	windowFocus,
	windowMaximize,
	setCursorPosition,
	assignId,
	allowNativeXpath,
	ignoreAttributesWithoutValue,
	waitForCondition,
	setTimeout,
	waitForPageToLoad,
	waitForFrameToLoad,
	createCookie,
	deleteCookie,
	deleteAllVisibleCookies,
	setBrowserLogLevel,
	runScript,
	addLocationStrategy,
	captureEntirePageScreenshot,
	rollup,
	addScript,
	removeScript,
	useXpathLibrary,
	setContext,
	attachFile,
	captureScreenshot,
	shutDownSeleniumServer,
	keyDownNative,
	keyUpNative,
	keyPressNative,
	UNSUPPORTED_COMMAND;
	
	public static WaterCommand getValue(final String command) {
		try {
			return valueOf(command);
		} catch(Exception e) {
			return UNSUPPORTED_COMMAND;
		}
	}
}
