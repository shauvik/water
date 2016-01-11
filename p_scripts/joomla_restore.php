<?php

$db = $_REQUEST['version'];
$query = $_REQUEST['query'];
$Q = array(
  "cp0003"=>"DELETE FROM `jos_content` WHERE `title` LIKE 'Com_Content001 Test Article'",
  "foo"=>"bar"
);

?>
<fieldset>
  <legend>Test data reset:</legend>
  <form>
    <label for="version">Version:</label>
    <input type="text" name="version" value="<?php echo $db; ?>"/>
    <br/>
    <label for="query">Test case:</label>
    <select name="query">
<?php
foreach($Q as $k=>$v){
  echo "      <option value='".$k."'>".$k."</option>";
}
?>
    </select>
    <br/>
    <input type="submit" value="Reset Data" />
  </form>
</fieldset>
<?php

if($db && $query){
  mysql_connect('localhost', 'dan', 'zd1019') or die('Connection Error');
  mysql_select_db('joomla_'.$db);

  $result = mysql_query($Q[$query]) or die('Query error');

/*
  echo "<ul>";
  while($row=mysql_fetch_assoc($result)){
    echo "<li>".$row["id"]." - ".$row["title"];
  }
  echo "</ul>";
*/

mysql_close();
}
?>
