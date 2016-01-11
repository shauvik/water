#!/usr/bin/python

import os,sys,string


def main():
  version = sys.argv[1]
  #Checkout from svn
  os.system("svn co -r %s --username anonymous --password '' http://joomlacode.org/svn/joomla/development/trunk %s"%(version,version))

  os.system("chmod a+w %s"%(version))

  config = getFileContents("%s/tests/system/servers/config-def.php-dist"%(version))

  config=string.replace(config,"var $folder = 'c:/xampp/htdocs';","")
  config=string.replace(config, "//	var $folder = '/usr/local/apache/htdocs';","       var $folder = '/home/dan/~www';")
  config=string.replace(config, "/your_joomla_root/","/~dan/%s/"%(version))
  config=string.replace(config, "var $db_user = 'root';","var $db_user = 'dan';")
  config=string.replace(config, "var $db_pass = 'password';","var $db_pass = 'zd1019';")
  config=string.replace(config, "var $db_name = 'joomla-1-6_source';","var $db_name = 'joomla_%s';"%(version))
  config=string.replace(config, "//	var $sample_data = false;","  	var $sample_data = true;")
  config=string.replace(config, "// var $adminTemplate = 'hathor';","   var $adminTemplate = 'hathor';"); 
  #config=string.replace(config, "*chrome","*firefox")
  
  setFileContents("%s/tests/system/servers/configdef.php"%(version), config)

  updateSeleniumTimeout("%s/tests/system/SeleniumJoomlaTestCase.php"%(version))
  
  #configureCoverageURL("%s/tests/system/SeleniumJoomlaTestCase.php"%(version))
  #installOnly("%s/tests/system/suite/TestSuite.php"%(version))

  #os.system("cd %s/tests/system;phpunit --log-junit ../../results.xml --coverage-html ../../report/ --bootstrap servers/configdef.php suite/TestSuite.php"%(version))
  os.system("cd %s/tests/system;phpunit --log-junit ../../results.xml --log-tap ../../results.tap --bootstrap servers/configdef.php suite/TestSuite.php"%(version))
  #os.system("cd %s/tests/system;phpunit --log-junit ../../results.xml --coverage-html ../../report/ --bootstrap servers/configdef.php suite/doInstall.php"%(version))

def updateSeleniumTimeout(fileName):
  data = getFileContents(fileName)
  data = string.replace(data, '$this->waitForPageToLoad("30000")', '$this->waitForPageToLoad("60000")')
  setFileContents(fileName, data)

def getFileContents(fileName):
  cFile= open(fileName)
  data=cFile.read()
  cFile.close()
  return data

def setFileContents(fileName, contents):
  cFile= open(fileName,"w")
  cFile.write(contents)
  cFile.close()

def installOnly(fileName):
  code = getFileContents(fileName)
  code = string.replace(code, "('DoInstall');", "('DoInstall'); \n/*", 1)
  code = string.replace(code, "\t\treturn $suite;", "*/\t\treturn $suite;", 1)
  setFileContents(fileName, code)


def configureCoverageURL(file):
  tFile = open(file)
  data = tFile.read()
  tFile.close()
  INSTR = '''protected $coverageScriptUrl = 'http://localhost/~dan/phpunit_coverage.php';
	public $cfg;'''
  data = string.replace(data, "public $cfg;", INSTR)
  
  tFile = open(file,"w")
  tFile.write(data)
  tFile.close()

if __name__ == "__main__":
  if len(sys.argv) < 2:
    print "Usage: ./auto.py version"
    exit()
  main()
