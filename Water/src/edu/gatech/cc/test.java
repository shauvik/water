package edu.gatech.cc;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class test {
	private static int countMatches(Pattern pattern, String str)
	{
	  int matches = 0;
	  Matcher matcher = pattern.matcher(str);
	  String x;
	  while (matcher.find()){
		  x="";
		  x=matcher.group(1);
		  System.out.println(x);
	  }
	return matches;
	}
	public static void main(String[] args) {
		String blah ="/~dan/${version}/administrator/${blooh}";
//		blah="foo[aaa]";
		String x="aaaaa${a}";
//		
		//"$\\{(.+)\\}"
		Pattern p=Pattern.compile("\\$\\{(.*?)\\}");
		countMatches(p, blah);
//		System.out.println(x.matches());
//		System.out.println("+1".matches("(\\-|\\+)*[1-9][0-9]*"));
		

	}

}
