
//////////////////////////////////////////////
// Gestione Ricette
//
var GLSettings = null;
var GLISSettingsRead = false;
var GLUseLocalGateway = false;


// ////////////////////////////////////
// Configurazione UI e Impostazione
//
class SETTINGS {

	constructor() {
		
		this.work_set_id = 1;
		this.user_name = 'guest';
		this.token = null;
		this.cu_addr = 200;
		this.refresh_rate = 50;
		this.auto_login = false;
		this.lang = 'ENG';
		this.last_page = "tab1";
		this.dirty = true;

		this.remote_gateway = "cnconline.info";
		this.remote_gateway_resource = "xProjectAssistCenter/wsServer";
		this.remote_gateway_port = 8080;
	
		this.refresh = function () {
		}
		
		this.params = {
				
	
		    // Numero cicli attesa riscaldamento forni
		    startup_owens_cycles:10,
		    startup_owens_delay_ms:10,
	
		    // Numero cicli attesa speginmento forni
		    turnoff_owens_cycles:7,
		    turnoff_owens_delay_ms:0,
	
		    // Numero di cicli senza carico innesco standby forni
		    owens_standby_cycles:3,
		    owens_standby_delay_ms:0,
		    owens_towork_cycles:3,
		    owens_towork_delay_ms:3,
		    
		    initial_owens_cycles:3,
		    initial_owens_ratio:1.20,
		            
		    chain_stepper1_pause_ms:100,
		    chain_stepper2_pause_ms:100,
		    chain_stepper3_pause_ms:100,
		    
		    trasf_x_forward_pause_ms:100,
		    chain_trasf_z_down_pause_ms:100,
	
		    chain_picker_open_pause_ms:100,
		    chain_picker_close_pause_ms:100,
		            
		    pref_load_inside_pause_ms:100,
		    pref_load_outside_pause_ms:100,
	
		    pit_stopper_inside_pause_ms:100,
		    pit_stopper_outside_pause_ms:100,
	
		    
		    // Attesa spegnimento aspiratori
		    aspirator_delay_ms:5*60*1000,
		    	
		}				
	}


		

	// passa i parametri all'unita di controllo
	setCurrent() {
		
		var cmd = '!';
		
		// Dati Instazione
		cmd += ''+'settings.user_name='+this.user_name;
		cmd += ';'+'settings.auto_login='+this.auto_login;
		
		// Dati Variabili
		var jsonObj = JSON.parse(this.toJSON());

		// for all properties
		for(var key in jsonObj) { 
		    cmd += ';'+'settings.'+key+'='+this.params[key];
		}
		
		
		if(GLConnection) {
			console.log("sending cmd:"+cmd);
			GLConnection.send(cmd);
		}
		
		return 1;
	}
	
	// salva su database
	saveInDB() {		
		return 1;
	}


	// crea l'oggetto json dei parametri in formato sringa
	toJSON() {
		return objectToJSON(this);
	}

	// crea la struttura JSON dall'oggetto stringa
	fromJSON(str) {
		return objectFromJSON(this, str);
	}		
}




function settings_init () {

	// Parametri lavoro di default
	GLSettings = new SETTINGS();
	
}


function settings_refresh() {

	if (GLSettings) {
	
		// Rinfresco Impostazione (Parte fissa)
		var obj = document.getElementById("addr");
		if (obj)
			obj.value = GLSettings.cu_addr;
		
		obj = document.getElementById("refreshRate");
		if (obj)
			obj.value = GLSettings.refresh_rate;
		
		obj = document.getElementById("UserName");
		if (obj)
			obj.value = GLSettings.user_name;
	
		obj = document.getElementById("Autologin");
		if (obj)
			obj.checked = GLSettings.auto_login ? true : false;
	
	
		obj = document.getElementById("gatewayAddress");
		if (obj)
			obj.value = GLSettings.remote_gateway;

		obj = document.getElementById("gatewayResource");
		if (obj)
			obj.value = GLSettings.remote_gateway_resource;
		
		obj = document.getElementById("gatewayPort");
		if (obj)
			obj.value = GLSettings.remote_gateway_port;

		
		// Rinfresco Impostazione (Parte variabile)
		if (GLOverWriteCUSettings) {
			updateObjsFromParam(GLSettings);		
		}
	} else {
		alert("settings_refresh(): no settings read!");
	}
}




// /////////////////////////
// Lettura impostazioni
//
function read_settings(afterFunc, param) {
	var retVal = 0;

	GLdb.transaction(function (tx) {
	
		try {
		
		   tx.executeSql("SELECT * FROM settings", [], function (tx, results) {				
			   var len = results.rows.length, i;			   
			   if (len <= 0) {
				   try {
					   console.warn("No settings founds, setting defaults...");
					   
 					   // Inserimento configurazione di default
 					  var json_sting = window.btoa(objectToJSON(GLSettings));		     					  

 					  tx.executeSql("INSERT INTO settings (work_set_id,user_name,token,auto_login,cu_addr,refresh_rate,last_page,lang,remote_gateway,remote_gateway_resource,remote_gateway_port,json_data) VALUES ("+GLSettings.work_set_id+",'"+GLSettings.user_name+"','"+GLSettings.token+"',"+(GLSettings.auto_login?1:0)+","+GLSettings.cu_addr+","+GLSettings.refresh_rate+",'"+GLSettings.last_page+"','"+GLSettings.lang+"','"+GLSettings.remote_gateway+"','"+GLSettings.remote_gateway_resource+"',"+GLSettings.remote_gateway_port+",'"+json_sting+"')",[]
 					  	
 					  ,function (tx, results) {
 						 
 	 					  console.log("Settings created");

 	 					  GLSettings.id = results.insertId;
 						  
 					  }, webDBonError);

 					  
 					  GLISSettingsRead = true;
 					  
 					  if (afterFunc)
 						  afterFunc(param);
 					  

					   
				   } catch(e) {
					   alert(e);
				   }
				   
			   } else {
				   
				   	retVal = 1;
					   
				   	// console.warn("Reading settings...");
				   
				   	if (!GLSettings)
				   		GLSettings = new SETTINGS();
			   
				   	GLSettings.id = results.rows.item(0).id;
				   	GLSettings.work_set_id = results.rows.item(0).work_set_id;
				   	GLSettings.cu_addr = results.rows.item(0).cu_addr;
				   	GLSettings.refresh_rate = results.rows.item(0).refresh_rate;
				   	GLSettings.last_page = results.rows.item(0).last_page;
				   	GLSettings.lang = results.rows.item(0).lang;
				   	GLSettings.user_name = results.rows.item(0).user_name;
				   	GLSettings.token = results.rows.item(0).token;
				   	GLSettings.auto_login = results.rows.item(0).auto_login ? true:false;
				   	
				   	if (GLUseLocalGateway) {
					   	GLSettings.remote_gateway = "192.168.1.111";
					   	GLSettings.remote_gateway_resource = "xProjectAssistCenter/wsServer";
					   	GLSettings.remote_gateway_port = 8080;
				   	} else {
					   	GLSettings.remote_gateway = results.rows.item(0).remote_gateway;
					   	GLSettings.remote_gateway_resource = results.rows.item(0).remote_gateway_resource;
					   	GLSettings.remote_gateway_port = results.rows.item(0).remote_gateway_port;
				   	}
				   	
				   	try {
				   		GLSettings.fromJSON(window.atob(results.rows.item(0).json_data));
				   	} catch(e) {				   		
				   	}
			   
				   	GLISSettingsRead = true;
				   	
				   	if (afterFunc)
				   		afterFunc(param);
			   }
			   
		   }, webDBonError);
		
	
		} catch(e) {
			alert(e);
		}

	}, webDBonError);
	
	return retVal;
}




///////////////////////////
// Scrittura impostazioni
//
function write_settings(afterFunc, param) {
	var retVal = 0;

	GLdb.transaction(function (tx) {
	
		try {
		
			if (GLSettings.id) {
				var json_sting = null;

			   	try {
			   		json_sting = window.btoa(objectToJSON(GLSettings));
			   	} catch(e) {				   		
			   	}
				
				tx.executeSql("INSERT OR REPLACE INTO settings (id,work_set_id,user_name,token,auto_login,cu_addr,refresh_rate,last_page,lang,remote_gateway,remote_gateway_resource,remote_gateway_port,json_data) VALUES ("
						+GLSettings.id+","+GLSettings.work_set_id+",'"+GLSettings.user_name+"','"+GLSettings.token+"',"+(GLSettings.auto_login?1:0)+","+GLSettings.cu_addr+","+GLSettings.refresh_rate+",'"+GLSettings.last_page+"','"+GLSettings.lang
						+"','"+GLSettings.remote_gateway 
						+"','"+GLSettings.remote_gateway_resource
						+"',"+GLSettings.remote_gateway_port
						+",'"+json_sting+"')", [], function (tx, results) {
					
				   try {
					   
					   if (results.rowsAffected >= 1) {
						   GLSettings.dirty = false;
						   console.log("Settings saved");
					   } else {
						   console.err("Settings saved failed");
					   }
					   
				   } catch(e) {
					   alert(e);
				   }
					   
				   	if (afterFunc)
				   		afterFunc(param);
				   
			   }, webDBonError);
			} else {
				alert("write_settings():invalid id");
			}		
	
		} catch(e) {
			alert(e);
		}

	}, webDBonError);
	
	return retVal;
}




