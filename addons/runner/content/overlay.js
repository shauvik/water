var HelloWorld = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
	
  },

  onMenuItemCommand: function() {
	//alert("here");
	//var i=0;
	//var scripts=[1,2,3];
	var str=window.prompt("Enter scripts to run","");
	scripts= str.split(',');
	//scripts=[1,2,3];
	i=0;
	HelloWorld.abc();
  },
  script_run: function(){
  
  
  	// DB Connect
	var file = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties)
                     .get("ProfD", Components.interfaces.nsIFile);
	file.append("my_db_file_name.sqlite");

	var storageService = Components.classes["@mozilla.org/storage/service;1"]
                        .getService(Components.interfaces.mozIStorageService);
	var dbConn = storageService.openDatabase(file); // Will also create the file if it does not exist
	//Insert script into db
	
	dbConn.executeSimpleSQL("INSERT INTO coscripter(id,status) VALUES("+scripts[i]+",'Running')");
	window.top.getBrowser().selectedBrowser.contentWindow.location.href ="coscriptrun:file:///D:/classes/cs4980/mochi/coscripter_capture/front_end_scripts/"+scripts[i];
	i++;
	
	if(i==scripts.length){
		alert("run finish");
	}
	//while(n==0){
		//HelloWorld.nsWaitForDelay();
		
 window.setTimeout(HelloWorld.backgroundTask, 5000);
/*
		var statement = dbConn.createStatement("SELECT * FROM coscripter where status='Running'");
	
		if(statement.step()){
			statement.reset();
		}
		else{
			alert('Done');
			n=1;
		}
	}
	HelloWorld.script_run();*/
	//dbConn.executeSimpleSQL("UPDATE coscripter SET status='Done' where status='Running'");
	
  },
  
  abc: function(){	
	
		HelloWorld.script_run();
		
	},
	backgroundTask: function() {
   // Perform a small amount of work
	/*var statement = dbConn.createStatement("SELECT * FROM coscripter where status='Running'");
		alert(statement);
		if(statement.step()){
			statement.reset();
		}
		else{
			alert('Done');
		}*/
		// DB Connect
		//alert('x');
		var n=0;
	var file = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties)
                     .get("ProfD", Components.interfaces.nsIFile);
	file.append("my_db_file_name.sqlite");
	//alert('y');
	var storageService = Components.classes["@mozilla.org/storage/service;1"]
                        .getService(Components.interfaces.mozIStorageService);
	var dbConn = storageService.openDatabase(file); // Will also create the file if it does not exist
		//alert(dbConn);
		var statement = dbConn.createStatement("SELECT * FROM coscripter where status='Running'");
		//alert(statement);
		if(statement.step()){
			if (document.documentURI.indexOf("dnsNotFound") > -1) {
				dbConn.executeSimpleSQL("UPDATE coscripter SET status='Page Not Found' where status='Running'");
				n=1;
			}
			statement.reset();
		}
		else{
			//alert('Done');
			n=1;
		}
		if(n==0){
			window.setTimeout(arguments.callee, 5000);
		}
		else{
			HelloWorld.script_run();
		}
 }
 


};

window.addEventListener("load", function(e) { HelloWorld.onLoad(e); }, false); 
