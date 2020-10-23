
// N.B. accetta i dati binari
// Setting binaryType to accept received binary as either 'blob' or 'arraybuffer'
// connection.binaryType = 'arraybuffer';

var GLDebug = true;
var GLIsRemoteSide = false;
var GLRemoteRefreshRateMs = 250;
var GLRemoteSN = null;

var GLServerIP;
// var GLServerIP = '192.168.1.106';

var GLServerPort = 7362;

var GLConnection = null;
var GLConnectCheckInterval = null;

var GLStop = 1;
var GLReloadContent = 0;
var GLWorkSetLoadCount = -1;

var GLUseCache = true;
var GLConnStep = 0;
var GLAfterLoggedConnStep = 10;
var GLStreamCounter = 0;


// Ultimo allarme letto
var GLCurAlarmList = 0;

// Elenco varibili correntemente usato
var GLVariableList = null;


// Storico allarmi letto
GLReadHistoricalAlarms = false;
GLAlarmsCount = 0;
GLAlarmsFilteredOut = 0;


// N.B.: Per default Lascia prevalere le impostazione della control Unit
GLOverWriteCUSettings = false;


 
var uiObject = {	
	cuId : 0		// Id nella conrtol unit
	,obj : null		// Oggetto html
	,objI : null	// Oggetto html Istogramma associato
	,objS : null	// Oggetto html Immagine di Stato associata (On/Off)
	,objT : null	// Oggetto html Trace associato
	,objTC : null	// Oggetto html Trace chart associato
	,objTCo : null	// Oggetto Trace chart associato
	,objSK : null	// Oggetto SoftKey associato
	,counter : 0	// Oggetto contatore (es. liste parziali)
	,colIndex : null // Mappa colonne
	,rotate : false	 // se true ricrea la tabella su evento di update, diversamente appende i records
	,temporary : false
	,row_height:0	// altezza riga
	,font_size_array : null
}

// class uiObject GLUIObj[] = new Array();
var GLUIObj = new Array();
var GLNumUIObj = 0;





			

//////////////////////////////////////////////
// Gestione database locale
//
var GLdb = null;
var GLIDB = null;
var GLDBName = 'xProjectDB';
var GLDBDesc = 'xProject production database';
var GLDBVer = '1.0';

var webDBonError = function(tx, e) {
	if (e)
		alert("There has been an error: " + e.message);
}

var webDBonSuccess = function(tx, r) {
}


var GLUserId = -1;



//////////////////////////////////
// Enumeratore metodi (debug)
//
function getMethods(obj) {
	  var result = [];
	  for (var id in obj) {
	    try {
	      if (typeof(obj[id]) == "function") {
	        result.push(id + ": " + obj[id].toString());
	      }
	    } catch (err) {
	      result.push(id + ": inaccessible");
	    }
	  }
	  return result;
	}

	



function set_obscured( bDark ) {
	try {
		var obj = document.getElementById("frontgroundDiv");
		if (obj) {
			if(bDark || GLRemoteConnect) {
				if (GLRemoteConnect == 0) {
					obj.style.backgroundColor='rgba(0, 0, 0, 0.33)';
				} else if (GLRemoteConnect == 1) {
					// endpoint in attesa
					obj.style.backgroundColor='rgba(0, 0, 150, 0.33)';
				} else if (GLRemoteConnect == 2) {
					// endpoint connesso
					obj.style.backgroundColor='rgba(0, 0, 150, 0.15)';
				} else if (GLRemoteConnect == 3) {
					// client connesso
					obj.style.backgroundColor='rgba(0, 0, 150, 0.05)';
				} else {
					// endpoint indeterminato
					obj.style.backgroundColor='rgba(0, 0, 75, 0.50)';				
				}
			} else {
				obj.style.backgroundColor='transparent';
			}
		}
    } catch (err) {
    }
}






/////////////////////////////////////
// Inizializzazione applicazione
//
function init_ui () {
	
	try {
		
		set_obscured(true);
		
		if (!window.indexedDB) {
		    // window.alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
			if (!openDatabase) {		
			    window.alert("Your browser doesn't support WebSQL");
			    return;
			    
			} else {
			}
		} else {
			if (!openDatabase) {		
			    window.alert("Your browser doesn't support WebSQL...\r\nUnable to use batabase (local data)");
			    return;
			    
			} else {
			}
		}

		
		// Connessione remota
		GLIsRemoteSide = getParameterByName('remote');
		GLRemoteSN = getParameterByName('remoteSN');
		
		if (GLIsRemoteSide) {
			// Punta ad un db locale diverso (per il test sulla stessa macchina)
			if (GLRemoteSN) {
				GLDBName = 'xProjectRemoteDB.'+GLRemoteSN;
				GLDBDesc = 'xProject production remote database';
				
				console.warn("Apertura database Remoto : "+GLDBName);
				
			} else {
				// Invalid Remote SN
				alert("Remote Connection : Invalid Serial Number!\n\nUnable to create DB...");
			}
		}
		
		
		if (openDatabase) {
			
			GLdb = openDatabase(GLDBName, GLDBVer, GLDBDesc, 0);
			if (GLdb) {
				
				if (!GLdb.transaction) {		
				    window.alert("Your browser doesn't support WebSQL transaction"+getMethods(GLdb));
				}

				/*
				for (var i = 0; i < localStorage.length; i++){
				    var item = localStorage.getItem(localStorage.key(i));
				    alert(item);
				}
				*/				
				
				// Inizializzazione tabelle
				GLdb.transaction(function (tx) {
					try {
						tx.executeSql('CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT,event TEXT,time_code TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',[],webDBonSuccess,webDBonError);
						tx.executeSql('CREATE TABLE IF NOT EXISTS session (id INTEGER PRIMARY KEY AUTOINCREMENT, id_work_set INTEGER,id_user INTEGER,time_code TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',[],webDBonSuccess,webDBonError);
						tx.executeSql('CREATE TABLE IF NOT EXISTS alarms (id INTEGER PRIMARY KEY AUTOINCREMENT, type INTEGER, code INTEGER, description TEXT, datetime TEXT, actuatorId INTEGET, note TEXT, UNIQUE (`type` ,`code` ,`datetime` ,`actuatorId`) ON CONFLICT IGNORE)',[],webDBonSuccess,webDBonError);
						tx.executeSql('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT,grp TEXT,time_code TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',[],webDBonSuccess,webDBonError);
						tx.executeSql('CREATE TABLE IF NOT EXISTS work_set (id INTEGER PRIMARY KEY AUTOINCREMENT, set_name TEXT, description TEXT, production INTEGER, preform_weight INTEGER, capacity INTEGER, last_save TIMESTAMP, user_id INTEGER, json_data TEXT, TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',[],webDBonSuccess,webDBonError);
						tx.executeSql('CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY AUTOINCREMENT,work_set_id INTEGER, user_name TEXT, token TEXT, auto_login INTEGER, cu_addr INTEGER, refresh_rate INTEGER, last_page TEXT, lang TEXT, remote_gateway TEXT,remote_gateway_resource TEXT,remote_gateway_port INTEGER, json_data TEXT,time_code TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',[],webDBonSuccess,webDBonError);
						tx.executeSql('CREATE TABLE IF NOT EXISTS languages (id INTEGER PRIMARY KEY AUTOINCREMENT,key TEXT,value TEXT, lang_id INTEGER)',[],webDBonSuccess,webDBonError);
					} catch(e) {
						alert(e);
					}
				}, webDBonError);
				
				
				
				GLdb.transaction(function (tx) {
					
		     	   try {

		     		   // Evento Nuova sessione
		     		   tx.executeSql("INSERT INTO events (event) VALUES ('start session')",[],webDBonSuccess,webDBonError);            	
		     		   
		     		   // Selezione lista utenti
		     		   tx.executeSql("SELECT * FROM users", [], function (tx, results) {
		
		     			   var len = results.rows.length, i;
		     			   
		     			   // msg = "<p>Users rows: " + len + "</p>";
		     			   // document.getElementById('msg').innerHTML +=  msg;
		     			  
		     			   if (len <= 0) {
		     				   try {
		     					   tx.executeSql("INSERT INTO users (user,grp) VALUES ('Admin','admins')",[],webDBonSuccess,webDBonError);
		     					   tx.executeSql("INSERT INTO users (user,grp) VALUES ('Operator','users')",[],webDBonSuccess,webDBonError);
		     					   tx.executeSql("INSERT INTO users (user,grp) VALUES ('Guest','guests')",[],webDBonSuccess,webDBonError);
		     				   } catch(e) {
		     					   alert(e);
		     				   }
		     			   } else {
		     				   var userList = document.getElementById('userList');
		     				   if (userList) {
		     					  var htmlOptions = '';
		     					  for(var i = 0; i < results.rows.length; i++) {
		     					    htmlOptions += '<option id="'+results.rows[i].id+'" value="'+results.rows[i].user+'" />';
		     					  }
		     					 userList.innerHTML = htmlOptions;
		     				   }		     				   
		     			   }
		     		   }, webDBonError);
						   

		     		   
		     		   // Lettura eventi
			     	   tx.executeSql("SELECT * FROM events", [], function (tx, results) {
			                var len = results.rows.length, i;

			                // msg = "Events rows: " + len + "</p>";
			                // document.getElementById('msg').innerHTML +=  msg;
			                
			           }, webDBonError);


			     	   
			     	   post_init_ui_I(tx);
			     	   

						
		     	   } catch(e) {
		     		   alert(e);
		     	   }
		            
		         }, webDBonError);
				
			} else {
				alert("Database non disponibile");
			}
		}
		
		
	} catch(e) {
		alert("init_ui() : "+e+"");
	}
}









//////////////////////////////////////////////////////
//Continua l'inizializzazione applicazione Step II
//

function post_init_ui_I(tx) {
    
  
  /////////////////////////
  // lettura lingua
  //
  read_main_languages(tx);


  
  
  /////////////////////////////////////////////////////////////						
  // Setup impostazioni (persistenza parametri macchina)
  //
  settings_init();
						
						
						
						
		
		

  /////////////////////////////////////////////////////////////
  // Gestione della connessione lato client (Assistente)
  //
  if (GLIsRemoteSide) {
	   if (parent) {
		   if (parent.GLClientWS) {
				GLConnection = parent.GLClientWS;
				// GLClientWS = null;
			console.warn(' Remote/Local Connection copied');
		   }
	   }
  }

	
	
		
  	/////////////////////////////
	// Evento chiusura pagina
	//
  	if (!GLIsRemoteSide) {
		window.onbeforeunload = function(event) {
			// if (config("WorkSet parameters changed...Doy you want to save it ?")) {
			if (GLWorkSet) {
				if (GLWorkSet.dirty) {
					save_work_set();
				}
			}
		    event.returnValue = "Reload page ?";
		};
  	}	
	
	////////////////////////////////////////////////////////////////////////
	// Lettura Impostazioni e continuazione della inizializzazione
	//
	read_settings(post_init_ui_II, null);
	
}
		




//////////////////////////////////////////////////////
// Continua l'inizializzazione applicazione Step II
//
function post_init_ui_II() {
	
	try {
		
		// Imposta il tab principale
		if (!GLSettings) {
			set_tab(tabWorkspaces[0], document.getElementById('tab1'));
		} else {
			if (!GLSettings.last_page)
				GLSettings.last_page = 'tab1';			
			set_tab(tabWorkspaces[0], document.getElementById(GLSettings.last_page));
			
			if (!GLSettings.lang)
				GLSettings.lang = 'ITA';
					
			read_languages( set_cur_lang, GLSettings.lang );
		}
		
		// Imposta il 1 sub_tab su Service
		set_tab(tabWorkspaces[1], document.getElementById('tab91'));
		
		// Imposta il 2 sub_tab su Settings
		set_tab(tabWorkspaces[2], document.getElementById('tab81'));


		
		// Ultimo allarme letto
		GLCurAlarmList = 0;
	 
		
	 
		//////////////////////////////////////////////////////////////
		// Setup gestione ricette  (persistenza parametri utente)
		//
		work_set_init();
	 

		
  	   ////////////////////////////////////////
  	   // Collegamento remoto se EndPoint
  	   //
  	   if (!GLIsRemoteSide) {
  		   init_remote_server();
  	   }
	 
	
		////////////////////////////////////////////////
		// Collega la tastiera e gestisce l'input
		//
  	   	link_keyboard("cuVar");
	
	
	 
	
		/////////////////////////////////////////////
		// Imposta la callback per gli oggetti UI
		//
		setup_editable_object();
	 
	 
	 
	 
		/////////////////////////////////////////////
		// Imposta l'evento onClick per i pulsanti
		//
		set_onclick_event_to_cuvar_bt();
	
	 

		/////////////////////////////////////
		// Rinfresco Impostazioni lette
		//
		settings_refresh();


		//////////////////////////////////////
		// Rinfresco Impostazioni lette
		//
		login_refresh();

		
		
		
		
		//////////////////////////////////////
		// Controllo connessione periodico
		//
		GLConnectCheckInterval = setInterval('connection_check()', 3000);

		
		////////////////////////
		// Avvio Stream
		//
		start_stream();


		
		// Test
		// read_file_sytem("D:\\Archivio Software\\REAL TIME\\XPROJECT\\UI\\CCU");
		

		
		
		
	} catch(e) {
		alert("post_init_ui() : "+e+"");
	}
}




/////////////////////////////////////////////
// Collegamento remoto :
// Callback lato client (Assistente)
//
function on_remote_error(clientWS) {
}

// Evento Esterno Connessione remota chiusa
function on_remote_close(clientWS) {
	GLConnection = null;
	GLRemoteConnect = 1;
	set_obscured(true);
}

// Evento Connessione remota aperta
function on_remote_open(clientWS) {
	// Imposta la connessione
	GLConnection = clientWS;

	GLRemoteConnect = 3;
	
	// Esegue l'evento di connessione aperta (avvia lo stream etc..)
	handle_connection_open();
	
	// Avvia lo stream
	start_stream();
}





/////////////////////////////////////////////
// Imposta la callback per gli oggetti UI
//
function setup_editable_object() {	
	var controlUnitVars = document.getElementsByClassName("cuVar");
	for (var i = 0; i < controlUnitVars.length; i++) {
		if (controlUnitVars[i].id) {
			if (controlUnitVars[i].tagName == "INPUT") {
				if (controlUnitVars[i].readOnly) {
				} else {
					if(window.addEventListener) {
						controlUnitVars[i].addEventListener('onchange', function(){ on_ui_var_change(this); }, false);
						// console.log('addEventListener on '+controlUnitVars[i].id);
					} else if (window.attachEvent){
						controlUnitVars[i].attachEvent('onchange', function(){ on_ui_var_change(this); }, false);
						// console.log('attachEvent on '+controlUnitVars[i].id);
					}
					controlUnitVars[i].onchange = function() { on_ui_var_change(this); };
				}
			}
		}
	}
}




function handle_login_request() {
	var cmdToSend = '';
	var logByUserPass = false;
	
	if (GLConnStep == 300) {
		// Dopo il login riprende il flusso
		GLAfterLoggedConnStep = GLConnStep;
	} else {
		GLAfterLoggedConnStep = 8;
	}
	
	if (GLSettings.auto_login && GLSettings.token) {
		if (GLSettings.user_name) {
			GLLogin.UserName = GLSettings.user_name;
			cmdToSend = '#'+'user='+GLLogin.UserName+';token='+window.btoa(GLSettings.token);
			GLConnStep = 5;
		} else {
			logByUserPass = true;
		}
	} else {
		logByUserPass = true;
	}

	if (logByUserPass) {
		if (GLLogin.UserName) {
			cmdToSend = '#'+'user='+GLLogin.UserName+';password='+window.btoa(GLLogin.Password);
			GLConnStep = 5;
		}
	}
	
	// alert("sending login:"+cmdToSend);
	console.log('Login user : '+GLLogin.UserName+'...');
	GLLoginPending = false;
	return cmdToSend;
}


function handle_logoff_request() {
	var cmdToSend = '';

	if (GLConnStep == 300) {
		// Dopo il login riprende il flusso
		GLAfterLoggedConnStep = GLConnStep;
	} else {
		GLAfterLoggedConnStep = 10;
	}

	GLLogin.UserName = GLSettings.user_name;
	cmdToSend = '#'+'user='+';token='+'';
	GLConnStep = 7;
	GLLogoutPending = false;
	return cmdToSend;
}


function is_visible(obj) {
	var parentObj = obj	
	while (parentObj) {
		if (parentObj.nodeName == "BODY") 
			return true;
		if (parentObj.className != 'inactive') {
			// if (parentObj.className != 'none')
			parentObj = parentObj.parentNode;			
		} else {
			return false;
		}
	}
	return true;
}


/////////////////////////////////
// Rilegge gli oggetti della UI
//
function reload_content() {
	if (GLConnStep == 300) {
		// Affida al flusso il cambio di stato
		GLReloadContent = 1;
	} else {
		// Rewind
		GLConnStep = 100;
	}
}



function restart_stream() {
	if (!GLStop) {
		do_stop_stream();
		do_start_stream();
	}
}

function set_refresh_rate( val ) {
	if(GLSettings) {
	    if (val >= 1 && val <= 60000) {
	    	if (GLSettings.refresh_rate != val) {
	    		GLSettings.refresh_rate = val;
	    		write_settings(null, null);
	    	}
	    } else {
	        obj = document.getElementById("refreshRate");
	        if (obj) 
	            obj.value = GLSettings.refresh_rate;
	    }    
	}
}


function set_cu_addr( val ) {
    if (val >= 1 && val <= 255) {
    	if (GLSettings.cu_addr != val) {
    		GLSettings.cu_addr = val;
    		write_settings(null, null);
    	}
    }    
}


function set_remote_gateway( val ) {
	if (GLSettings.remote_gateway != val) {
		GLSettings.remote_gateway = val;
		write_settings(null, null);
	}
}

function set_remote_gateway_resource( val ) {
	if (GLSettings.remote_gateway_resource != val) {
		GLSettings.remote_gateway_resource = val;
		write_settings(null, null);
	}
}

function set_remote_gateway_port( val ) {
	if (GLSettings.remote_gateway_port != val) {
		GLSettings.remote_gateway_port = val;
		write_settings(null, null);
	}
}














// //////////////////////////////////////////////////////
// Assegna all'oggetto UI il valore ricevuto dalla CU
//
function process_ui_obj(uiObj, obj, objI, objS, objT, objTC, objTCo, objSK, name, value) {

	if (name == "sys.console") {
		value = value.replaceAll('[31m', '<span style="color:#f54f4f">');
		value = value.replaceAll('[32m', '<span style="color:#89ff00">');
		value = value.replaceAll('[33m', '<span style="color:#ffff02">');
		value = value.replaceAll('[34m', '<span style="color:#0880f7">');
		value = value.replaceAll('[35m', '<span style="color:magenta">');
		value = value.replaceAll('[36m', '<span style="color:cyan">');
		value = value.replaceAll('[0m', '</span>');
	}

	// Oggetto testo
	if (obj) {
		if (obj.className == "cuVarList") {
			//
			// Oggetto lista (table da oggetto json)
			//
			try { 
				if (value) {
					var jsonSTR = window.atob(decodeURIComponent(value));
					if (jsonSTR) {
						var jsonObj = JSON.parse(jsonSTR);
						if (jsonObj) {
							// alert("alarms:" + jsonObj.alarmList.count + " - alarms data:" + jsonObj.alarmList.alarms);	
							create_table_from_json(uiObj, obj, jsonObj);
						}
					}
				}
            } catch (e) {
                document.getElementById("msg").innerHTML = "Error:"+e.message;
                console.log('Error:'+e.message+" \""+jsonSTR+"\"");
            }
        	
		} else {
			if (obj.tagName == "INPUT") {
				if (obj.getAttribute('data-edit')) {
					// In fase di editing
				} else {
					if (obj.value != value) {
						if (obj.tagName=='INPUT') {
							if (obj.type=='number') {
								if (isNaN(value)) {
									// alert("Waiting for a number on field "+obj.id+" but returned:"+value);
									obj.style.border="2px solid orange";
									obj.type="text";
								}
							}
						}
						obj.value = value;
					}
				}
			} else {
				if (obj.getAttribute('data-edit')) {
					// In fase di editing
				} else {
					if (obj.innerHTML != value)
						obj.innerHTML = value;
				}
			}
		}
	}

	// Istogramma
	if (objI) {
	} else {
		// Ricerca nel DOM (old styyle)
		// objI = document.getElementById(name+"-I");
	}
	if (objI) {
		try { 
			var wh = Number(value);
			if (objI.id == "act.pressBott.Pos-I") {
				objI.style.width = ((wh / 10)) + "%";
			}
			objI.style.width = ((wh / 10)) + "%";
		} catch (e) { }
	}

	// Immagine On/Off (Status)
	if (objS) {
	} else {
		// Ricerca nel DOM (old style)
		// objS = document.getElementById(name+"-S");
	}
	if (objS)
		objS.style.backgroundColor = ((value == "ON" || value == "1" || value == 1) ? "darkGreen"
				: "darkRed");

	// Trace
	if (objT) {
	} else {
		// objT = document.getElementById(name+"-T");
	}
	if (objT) {
		if (value != "") {
			draw_trace(objT, value);
		}
	}

	// Trace Chart
	if (objTC) {
	} else {
		// objTC = document.getElementById(name+"-TC");
	}
	if (objTC) {
		if (value != "") {
			draw_trace_chart(uiObj, objTC, objTCo, value);
		}
	}
	
	
	// SoftKey	
	if (objSK) {
		// var obj = document.getElementById("mac.single_load");
		var objSKparent = objSK.parentNode; // document.getElementById("softkey1");
		if(objSKparent) {
			if (value=='ON') {
				objSKparent.className='on';
			} else {
				objSKparent.className='off';
			}
		}
	}	
}





function create_table_from_json(uiObj, obj, jsonObj) {
	var tableHTML;
	
	if (uiObj.counter == 0) {
	} else {
		// Appende alla tabella		
	}

	if (uiObj.temporary) {
		// tabella vista temporanea
	} else {
		// tabella allarmi (incrementale)
	}
	
	var tableRef = null, objTable = null;
	
	for (var i=0, m=obj.childNodes.length; i<m; i++) {
	     if (obj.childNodes[i].nodeType===document.ELEMENT_NODE) {
    		 if (obj.childNodes[i].id==obj.id+".table") {
    			 objTable = obj.childNodes[i];
    			 break;
    		 }
	     } 
	}
		
	if (objTable) {
		var tableRef = objTable.getElementsByTagName('tbody')[0];
		
		if (uiObj.rotate || jsonObj.alarmList.rebuild) {
			// rimuove le esistenti righe
			while(objTable.rows.length > uiObj.min_rows) {
				objTable.deleteRow(uiObj.min_rows>0?1:0);
			}
		}
		
		
		var widthArray = Array(22, 50, 100, 580, 100, -100);
		
		for (var i=0; i<jsonObj.alarmList.count; i++) {
			var alarm = jsonObj.alarmList.alarms[i];		
			if (alarm) {
				var newRow = tableRef.insertRow(uiObj.rotate?0:0);
				newRow.className="";
				newRow.style.height = uiObj.row_height+"px";

				// Insert a cell in the row at index 0
				var newCell = newRow.insertCell(0);
				
				newCell.className = "firstCell";

				// Checkbox selezione
				var div = document.createElement('div');
				// div.innerHTML = '<input id="obj.id+".table.rec."-'+(tableRef.rows.length+1)+'" data-rel="'+""+'" type="checkbox" style="width:20px; height:20px;" onClick="select_work_set(this);"></input>';
				newCell.className = "firstCell";
				newCell.appendChild(div);
				newCell.style.width = widthArray[0]+"px";
				newCell.style.height = uiObj.row_height+"px";
			
				// Colonne dei records
				if (uiObj.colIndex) {
					for (var j=0; j<uiObj.colIndex.length; j++) {
						if (uiObj.colIndex[j] < alarm.length) {
							
							newCell = newRow.insertCell(j+1);
							
							if (uiObj.colIndex[j] == 0) {
								var imgSrc = '';
								var div = document.createElement('div');
								var iconSize = 24;
								
								if (uiObj.rotate) {
									iconSize = 16;
								}
								
								if (alarm[uiObj.colIndex[j]] == 0) {
									imgSrc = "info.png";
								} else if (alarm[uiObj.colIndex[j]] == 1) {
									imgSrc = "info.png";									
								} else if (alarm[uiObj.colIndex[j]] == 2) {
									imgSrc = "warn.png";									
								} else if (alarm[uiObj.colIndex[j]] == 3) {
									imgSrc = "error.png";
								} else if (alarm[uiObj.colIndex[j]] == 4) {
									imgSrc = "fatal_error.png";
								}
								div.innerHTML = '<center><img id="" src="'+imgSrc+'" style="width:'+iconSize+'px; height:'+iconSize+'px; " onClick="reload_alarms();" /></center>';
								newCell.appendChild(div);
								
							} else {
								newText = document.createTextNode(''+alarm[uiObj.colIndex[j]]+'');
								newCell.appendChild(newText);
							}
							
							// newCell.style.width = "100px";
							newCell.className = (j+1<uiObj.colIndex.count ? "internalCell":"lastCell");
							if(uiObj.font_size_array)
								newCell.style.fontSize = uiObj.font_size_array[j]+"%";
							newCell.style.height = "17px";
							newCell.style.width = widthArray[1+j]+"px";
							newCell.style.height = uiObj.row_height+"px";

							// tableHTML += '<td class="internalCell" data-search="" colspan="1">'+alarm[uiObj.colIndex[j]]+'</td>';
						}
					}
					
					if (uiObj.temporary) {
						store_alarm(alarm[0],alarm[1],alarm[2],alarm[3],alarm[4],'');
					}
				}
			}
		}
	}
	

	// Aggiorna l'indice
	uiObj.counter += jsonObj.alarmList.count;

	if (uiObj.temporary) {
		// tabella vista temporanea
	} else {
		// tabella allarmi (incrementale)
		GLCurAlarmList = uiObj.counter;
	}
}





function draw_trace(objT, value) {

	if (objT) {
		var binary_string =  window.atob(decodeURIComponent(value));
		
		var dv = new DataView (new ArrayBuffer(binary_string.length));
		var c = 0;
		for (var i=0; i<binary_string.length; i++) {
			c = binary_string.charCodeAt(i);
			dv.setUint8(i, c, true);	        	
		}
		
		// dv = new DataView (binary_string);
		if (binary_string && binary_string.length) {
					
			var nPts = binary_string.length / 4;
			var Pt = 0.0; 
		
			var maxValue = -999999.9;
			for (var i=0; i<nPts; i++) {
				Pt = dv.getFloat32(i*4, true);
				if (Pt > maxValue)
					maxValue = Pt;
			}
			
			var wh = objT.width;
			var ht = objT.height;
			
			var scaleX = wh / nPts;
			var scaleY = ht / (maxValue*1.05);
			var ctx = objT.getContext("2d");

			ctx.clearRect(0, 0, wh, ht);
			ctx.beginPath();
			
			ctx.strokeStyle = '#ff0000';
			
			for (var i=0; i<nPts; i++) {
				Pt = dv.getFloat32(i*4, true);
				if (!i) {
					ctx.moveTo(i*scaleX, ht-Pt*scaleY);
				} else {
					ctx.lineTo(i*scaleX, ht-Pt*scaleY);
				}
				
				// if (i==100) ctx.strokeStyle = '#000000';
			}
			ctx.stroke();
		}
	}
}






function draw_trace_chart(uiObj, objTC, objTCo, value) {
	
	if (objTC) {
		var binary_string =  window.atob(decodeURIComponent(value));
		
		var dv = new DataView (new ArrayBuffer(binary_string.length));
		var c = 0;
		for (var i=0; i<binary_string.length; i++) {
			c = binary_string.charCodeAt(i);
			dv.setUint8(i, c, true);	        	
		}
		
		// dv = new DataView (binary_string);
		if (binary_string && binary_string.length) {
					
			var nPts = binary_string.length / 4;
			var Pt = 0.0; 
			
			
			var data_array = new Array(nPts);

			var maxValue = -999999.9;
			for (var i=0; i<nPts; i++) {
				Pt = dv.getFloat32(i*4, true);
				if (Pt > maxValue)
					maxValue = Pt;
			}
			
			var scaleX = objTC.width / nPts;
			var scaleY = objTC.height / (maxValue*1.05);

			for (var i=0; i<nPts; i++) {
				Pt = dv.getFloat32(i*4, true);				
				data_array.push({ x:(i*scaleX), y:(objTC.offsetHeight-Pt*scaleY) });
			}
			

				
			if (!uiObj.objTCo) {
				uiObj.objTCo = new Chart(objTC, {
	
			    	type: 'line',
			        data: {
			            datasets: [{
			                label: 'Stretch',
			                data:data_array
			            }]
			        },
			        options: {
			        	responsive: false,
			        	maintainAspectRatio: true,			        	
			        	animation: {
			        	        duration: 0
			        	    },	        	
			            scales: {
			                xAxes: [{
			                    type: 'linear',
			                    position: 'bottom'
			                }]
			            }
			        }
			    });
			} else {
				// Add two random numbers for each dataset
				if (uiObj.objTCo.datasets) {
					uiObj.objTCo.datasets.push([{ label: 'Stretch', data:data_array }]);
					// Remove the first point so we dont just add values forever
					uiObj.objTCo.removeData();
				}
			}
		}
	}
}


String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};






////////////////////////
// Storico allarmi
//
function show_historical_alarms(objImg) {
	try {
		var alarmList = document.getElementById("mac.alarmList");
        var historicalAlarmList = document.getElementById("historicalAlarmList");
        var alarmsListTitle = document.getElementById("alarmsListTitle");
        var reloadAlarms = document.getElementById("reloadAlarms");
        
        if (alarmList && historicalAlarmList) {
        	if (alarmList.style.display == 'none') {
        		historicalAlarmList.style.display = 'none';
        		alarmList.style.display = '';
        		objImg.style.filter ='grayscale(80%)';
        		alarmsListTitle = "Alarms list";
        		reloadAlarms.style.filter = 'grayscale(80%)';
        		reloadAlarms.disabled = true;
        		
        	} else {        		
        		alarmList.style.display = 'none';
        		historicalAlarmList.style.display = '';
        		objImg.style.filter = 'grayscale(0%)';
        		alarmsListTitle = "Historical alarms list";
        		reloadAlarms.style.filter = 'grayscale(0%)';
        		reloadAlarms.disabled = false; 

        		// Lettura storico allarmi
        		if (!GLReadHistoricalAlarms) {
        			read_historical_alarms(null, null);
        		}
        	}
        }
        
        update_alarm_count();
        
    } catch (e) {
    }
}




function searchInTable(inputObj, tableObj) {
	var filter, tr, td, i, filteredOut;
	var AlarmsCount = 0;
	var AlarmsFilteredOut = 0;
	
	filter = inputObj.value.toUpperCase();
	tr = tableObj.getElementsByTagName("tr");
  
	for (i = 0; i < tr.length; i++) {
		filteredOut = filter!=''?true:false;
		
		if (tr[i].className=='uiHTableHeader' || tr[i].className=='uiHTableFooter') {
			filteredOut = false;
			
		} else {
		    tds = tr[i].getElementsByTagName("td");
		    for (j = 0; j < tds.length; j++) {
		    	td = tds[j];
		    	if (td) {
		    		if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
		    			filteredOut = false;
		    			break;
		    		}
		    	}
		    }
		}
		
	    AlarmsCount++;
	    if (filteredOut) {
	    	AlarmsFilteredOut++;
	    	tr[i].style.display = "none";
	    } else {
	    	tr[i].style.display = "";
	    }
	}
	
	return Array(AlarmsCount, AlarmsFilteredOut);
}







///////////////////////////////////////////////////////
//Callback che gestisce la variazione del campo
//
function on_ui_var_change(obj) {
// alert("on_ui_var_change:"+obj.id+"="+obj.value);

	// aggiorna la control unit
	if (obj.className == 'cuVar') {
		send_cmd('!'+obj.id+'='+obj.value);
		}

	///////////////////////////////////////////////////////////////
	// Oggetto collegato ad una impostazione (persistenza) ?
	//
	if (obj.getAttribute('data-rel') == 'settings' || obj.id.indexOf( "settings." )==0 ) {
	
		// Aggiorna i paramertri (parte variabile della struttura) dall'oggetto html
		updateParamFromObj(GLSettings, obj);
		
		GLSettings.dirty = true;
	
		// salva le impostazioni
		write_settings(null, null);

	///////////////////////////////////////////////////////////////
	// Oggetto collegato ad una parametro lavoro (UI) ?
	//
	} else if (obj.getAttribute('data-rel') == 'workSet' || obj.id.indexOf( "workSet." )==0 ) {

		// Aggiorna i paramertri (parte variabile della struttura) dall'oggetto html
		updateParamFromObj(GLWorkSet, obj);
		
		GLWorkSet.dirty = true;
		
	}
	
	
	// Ripristina il refresh (a carico della funzione che aggiorna la Control Unit)		
	setTimeout(function() { obj.setAttribute('data-edit', ''); }, 250);	
}




//////////////////////////////////////////////////////
// Gestione pulsanti : Invio il comando alla CU
//
function process_cuvar_button(obj) {
	if (obj) {
		if (obj.id) {
			send_cmd('!'+obj.id);		
		}
	}
}




/////////////////////////////////////////////
// Inposta la callback all'oggetto INPUT
//
function set_onclick_event_to_cuvar_bt() {
	var controlUnitVars = document.getElementsByClassName("cuVarBt");
	// Ricerca degli oggetti html associati
	for (i = 0; i < controlUnitVars.length; i++) {
		if (controlUnitVars[i].id) {
			if (is_visible(controlUnitVars[i])) {
			}
			if (controlUnitVars[i].tagName=='INPUT') {
				if (controlUnitVars[i].type=='button') {
					if(window.addEventListener) {
						controlUnitVars[i].addEventListener('onclick', function(){ process_cuvar_button(this); }, false);
					} else if (window.attachEvent){
						controlUnitVars[i].attachEvent('onclick', function(){ process_cuvar_button(this); }, false);
					}
					controlUnitVars[i].onclick = function() { process_cuvar_button(this); };
				}
			}
		}
	}	
}
	
	

///////////////////////////////////////////////////////////////
// crea l'oggetto json dei parametri in formato sringa
//
function objectToJSON(rootObj) {
	var sobj = {}, i, j = 0;
	for (i in rootObj) { 
		if (rootObj.hasOwnProperty(i)) {
			if (typeof rootObj[i] == 'function') {						
				// sobj[j] = rootObj[i].toString(); j++;	
			} else {
				sobj[j] = rootObj[i]; 
				j++;
			}
		}
	}
	return JSON.stringify(rootObj.params);
}


///////////////////////////////////////////////////////
// crea la struttura JSON dall'oggetto stringa
//
function objectFromJSON(rootObj, str) {
	if (str) {
		if (typeof str == "string") {
			var jsonObj = JSON.parse(str);
			var i;
			for (i in rootObj.params) { 
				if (rootObj.params.hasOwnProperty(i)) {
					if (typeof rootObj.params[i] == 'string') {						
						rootObj.params[i] = "";	
					} else if (typeof rootObj.params[i] == 'number') {
						rootObj.params[i] = 0;
					} else if (typeof rootObj.params[i] == 'object') {
						rootObj.params[i] = null;
					}
				}
			}
			for(var key in jsonObj) { 
				// for all properties
			    var setter = "set"+key[0].toUpperCase()+key.substr(1); // (e.g. : key=property => setter=setProperty
				// following the OP's comment, we check if the setter exists :
			    if(setter && setter in jsonObj){
			    	rootObj[setter](jsonObj[key]);
			    } else {
			    	rootObj.params[key] = jsonObj[key];
			    }
			}
			 			    
			return rootObj;
		}
	}
}		


// Aggiorna l'oggetto html dai paramertri (parte variabile della struttura)
function updateObjsFromParam(rootObj) {
	if (rootObj) {
		for (var param in rootObj.params) { 
			if (typeof rootObj.params[i] == 'string') {						
			} else if (typeof rootObj.params[i] == 'number') {
			} else if (typeof rootObj.params[i] == 'object') {
			}
			
			var id = null;
			
		    // Rimpiazzo carateri speciali
		    key = param.replaceAll('_', '.');	    
			
			if (rootObj == GLSettings) {
				id = 'settings.'+key;
			} else if (rootObj == GLWorkSet) {
				id = 'workSet.'+key;
			}
			if (id) {
				var val = rootObj.params[key];
				var obj = document.getElementById(id);
				if (obj) 
					obj.value = val;
			} else {
				alert("updateObjsFromParam() : undetected target");
			}
		}
	}
}		


// Aggiorna i paramertri (parte variabile della struttura) dall'oggetto html
function updateParamFromObj(rootObj, htmlObj) {
	if (htmlObj) {
		var key = htmlObj.id;
		var val = htmlObj.value;

		// Ricava il valore della chiave 
		if (key.indexOf( "settings." )==0) {
			key = key.substr(9);
			
		} else if (key.indexOf( "workSet." )==0) {
			key = key.substr(8);
		}
		
		try {
			rootObj.dirty = true;
		} catch (e) {			
		}
		
	    var setter = "set"+key[0].toUpperCase()+key.substr(1);

	    // Rimpiazzo carateri speciali
	    key = key.replaceAll('.', '_');	    

	    if(setter && setter in rootObj){
	    	rootObj[setter](val);
	    } else {
	    	rootObj.params[key] = val;
	    }
	    
	    rootObj.refresh();
		 			    
		return 1;
	}
}		


//////////////////////////////
// Gestione SoftKey
//

function set_softkey(softKey) {
	if (softKey.className == 'on')
		softKey.className = 'off';
	else
		softKey.className = 'on';
}


function set_load_on_off(softKey) {
	if (softKey.className == 'on')
		send_cmd('!mac.load_off')
	else
		send_cmd('!mac.load_on')
}

function set_single_load_on_off(softKey) {
	if (softKey.className == 'on')
		send_cmd('!mac.single_load_off')
	else
		send_cmd('!mac.single_load_on')
}

function set_heat_on_off(softKey) {
	if (softKey.className == 'on')
		send_cmd('!mac.heat_off')
	else
		send_cmd('!mac.heat_on')
}

function set_blow_on_off(softKey) {
	if (softKey.className == 'on')
		send_cmd('!mac.blow_off')
	else
		send_cmd('!mac.blow_on')
}

function set_inline_output_on_off(softKey) {
	if (softKey.className == 'on')
		send_cmd('!mac.inline_output_off')
	else
		send_cmd('!mac.inline_output_on')
}

function push_softkey(softKey) {
	softKey.className = 'on';
	setTimeout(function() { softKey.className = 'off'; }, 100);
}





function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}