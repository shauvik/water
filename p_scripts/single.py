#!/usr/bin/python

import os,sys,string


def main():
  version = sys.argv[1]

  os.system("cd %s/tests/system;phpunit --log-junit ../../results.xml --bootstrap servers/configdef.php suite/TestSuite.php"%(version))
  #os.system("cd %s/tests/system;phpunit --log-junit ../../results.xml --coverage-html ../../report/ --bootstrap servers/configdef.php suite/TestSuite.php"%(version))


if __name__ == "__main__":
  if len(sys.argv) < 2:
    print "Usage: ./auto.py version"
    exit()
  main()
