


function store_alarm(type,code,description,datetime,actuatorId,note) { 

	if (GLdb) {
		GLdb.transaction(function (tx) {
	  	   try {
	  		   
	  		 description = description.replaceAll("'","''");
	
	  		 tx.executeSql("INSERT INTO alarms (type,code,description,datetime,actuatorId,note) VALUES ("+type+","+code+",'"+description+"','"+datetime+"',"+actuatorId+",'"+note+"')",[],webDBonSuccess,webDBonError);
	  		 
	  		 GLReadHistoricalAlarms = false;
	  		   
	  	   } catch (e) {  		   
	  		   alert("store_alarm() : "+e);
	  	   }
		}, webDBonError);
	} else {
		alert("store_alarm:no connection");
	}
}


function reload_alarms() {
	var historicalAlarmList = document.getElementById("historicalAlarmList");
	if (historicalAlarmList) 
		if (historicalAlarmList.style.display == 'none')
			return;
	read_historical_alarms(post_reload_alarms, null);
}

function post_reload_alarms() {
	var serchAlarm = document.getElementById("serchAlarm");
	if (serchAlarm.value)
	serchAlarm.onchange();
}


function searchInAlarmTable(inputObj) {
    var alarmsListTitle = document.getElementById("mac.alarmList");
	var historicalAlarmList = document.getElementById("historicalAlarmList");
	var retVal = null;
	
	if (historicalAlarmList) { 
		if (historicalAlarmList.style.display == 'none') {
			retVal = searchInTable(inputObj,alarmsListTitle);
		} else {
			retVal = searchInTable(inputObj,historicalAlarmList);
		}
	} else {
		retVal = searchInTable(inputObj,alarmsListTitle);
	}
	
	if(retVal) {
		GLAlarmsCount = retVal[0];
		GLAlarmsFilteredOut = retVal[1];
		update_alarm_count();
	}
}

function update_alarm_count() {
	var errorTableCounter = document.getElementById("errorTableCounter");
	if (errorTableCounter) {
		if (GLAlarmsFilteredOut) {
			errorTableCounter.innerHTML = (GLAlarmsCount-GLAlarmsFilteredOut) + "/" + GLAlarmsCount; 
		} else {
			errorTableCounter.innerHTML = GLAlarmsCount;
		}
	}
}


function read_historical_alarms( postFunc, postData ) {
	
    var historicalAlarmList = document.getElementById("historicalAlarmList");

	if (GLdb) {
		GLdb.transaction(function (tx) {
	  	   try {
    
			   // Lettura eventi
			   tx.executeSql("SELECT * FROM alarms", [], function (tx, results) {
		         
				   var len = results.rows.length, i;
		
				   jsonSTR = "{\"alarmList\":{\"tot\":"+len+",\"count\":"+len+",\"rebuild\":1,\"lastAlarms\":0,\"alarms\":[";		   
				   
				   for (i = 0; i < len; i++) {
		
					   if (i) {
		             	   jsonSTR += ",[";
		               } else {
		             	   jsonSTR += "[";
		               }
		
		                
		               jsonSTR += "\"" + results.rows.item(i).type + "\"";
		               jsonSTR += ",\"" + results.rows.item(i).code + "\"";
		               jsonSTR += ",\"" + results.rows.item(i).description + "\"";
		               jsonSTR += ",\"" + results.rows.item(i).datetime + "\"";
		               jsonSTR += ",\"" + results.rows.item(i).actuatorId + "\"";
		
		               jsonSTR += "]";
					   
					   // results.rows.item(i).id;
					   // results.rows.item(i).type;
					   // results.rows.item(i).code;
					   // results.rows.item(i).description;
					   // results.rows.item(i).datetime;
					   // results.rows.item(i).actuatorId;
					   // results.rows.item(i).note;
		        	}
		        	
		        	
		        	jsonSTR += "]}}";
		            
		        	// Creazione oggetto UI
		        	uiObj = { cuId:0,obj:historicalAlarmList,objI:null,objS:null,objT:null,objTC:null,objTCo:null,counter:0,colIndex:Array(0, 1, 2, 3, 4),rotate:false,temporary:false,min_rows:2,row_height:17,font_size_array:Array(100, 100, 100, 75, 80) };
				   
		        	
		        	// Creazione tabella HTML
		        	create_table_from_json(uiObj, historicalAlarmList, JSON.parse(jsonSTR));
		
		        	GLReadHistoricalAlarms = true;
		        	
		        	if (postFunc) {
		        		postFunc(postData);
		        	}
					   
		      	
			   }, webDBonError);
		
	  	   } catch (e) {
	  		   alert("read_historical_alarms() : "+e);
	  	   }		  			   

		}, webDBonError);
	
	} else {
		alert("read_historical_alarms:no connection");
	}
}



