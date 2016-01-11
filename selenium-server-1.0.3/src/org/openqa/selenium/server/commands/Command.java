package org.openqa.selenium.server.commands;

import org.openqa.selenium.server.RemoteCommandException;

/**
 * Selenium Command
 */
public abstract class Command {

    public abstract String execute() throws RemoteCommandException;

}
