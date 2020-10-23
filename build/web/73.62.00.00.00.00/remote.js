//////////////////////////////////////////////
// Gestione Connessioni remote
//

var GLRemoteWS = null;
var GLRemoteConnect = 0;

// 
var GLOutDiv = null;
var GLImportedDBInfo = null;

//////////////////////////////////////
// Controllo connessione periodico
//
var GLRemoteConnectCheckInterval = null;



function init_remote_server() {
	
	if (GLSettings) {
		if (GLSettings.remote_gateway) {
		} else {
			alert("init_remote_server():invalid remote gataway...");
			return;
		}
		
	} else {
		alert("init_remote_server():unable to set remote gataway");
		return;
	}

	GLOutDiv = document.getElementById("remote_content");
	if (GLOutDiv) {
		GLOutDiv.innerHTML = "<h4> *** WARNING : Starting the remote connection the machine will share any local informations with the <span style=\"color:navy\"><b>\"xProject Assist Center\"</b> (aka XAC) </span></h4>";
		GLOutDiv.innerHTML += "<h4><dir>Local information are : alarms, work_set, session, users, production data, picture, logic applications, and so on</dir></h4><br>";
		GLOutDiv.innerHTML += "<h5><dir>Gataway "+(GLUseLocalGateway?" [TEST] ":"")+" : "+GLSettings.remote_gateway + ':'+GLSettings.remote_gateway_port+'/'+GLSettings.remote_gateway_resource+"</dir></h5><br>";
		GLOutDiv.innerHTML += "Ready...<br>";
	}
}




///////////////////////////////////////////////////////////////
//
// Usata dalla macchina per abilitare il collegamento remoto
//
// Gestione WebSocket con il client remoto
// L'endPoint (macchina) è definito dentro la stram.js
//

function start_remote_server() {

	var connString = 'ws://' + GLSettings.remote_gateway + ':'+GLSettings.remote_gateway_port+'/'+GLSettings.remote_gateway_resource;

	if (!GLRemoteWS || (GLRemoteWS && GLRemoteWS.readyState != GLRemoteWS.OPEN) ) {
		
		if (!GLRemoteWS) {
			GLRemoteWS = new WebSocket(connString);
			if (!GLRemoteWS) {
				alert('Remote connection error : maybe xProject Assist Center offline...');
			} else {
				GLRemoteWS.bynaryType = "blob";
				GLRemoteWS.bynaryType = "arraybuffer";
				if (!GLRemoteConnectCheckInterval)
					GLRemoteConnectCheckInterval = setInterval('remote_connection_check()', 60*1000);
			}
		}

		
		
		GLRemoteWS.onerror = function(e, msg) {
			if (e) {
				alert('Remote connection error : maybe xProject Assist Center offline...'+e);
			} else {
				console.log('Remote connection error');
			}
			GLOutDiv.innerHTML += "<br/>[ERROR] "+e.target.url;
			if (GLRemoteConnect > 0) 
				GLRemoteConnect = 0;
			if (GLRemoteWS)
				GLRemoteWS.close();
			GLRemoteWS = null;
			set_obscured(false);
		};
	
		GLRemoteWS.onclose = function(e) {
			console.log('Remote connection closed');
			GLOutDiv.innerHTML += "<br/>[CLOSED] code:"+e.code+" - reason:"+e.reason;
			if (GLRemoteConnect > 0) 
				GLRemoteConnect = 0;
			set_obscured(false);
		};
	
		GLRemoteWS.onopen = function(e) {
			console.log('Remote connection open');
			GLOutDiv.innerHTML += "[STARTED]<br/>";
			GLRemoteConnect = 1;
			GLRemoteWS.send("&mName=xProject XP1.30 - cypress edition")
			GLRemoteWS.send("&SN=73.62.00.00.00.00")
			set_obscured(true);
		};
	
		GLRemoteWS.onmessage = function(e) {
			// console.log('{New Remote Message:' + e + '}');
			if (GLRemoteConnect != 2) {
				GLRemoteConnect = 2;
				set_obscured(true);
			}

			var keyCHar = e.data ? e.data[0] : 0;
	        	
	        if (keyCHar == '|') {
	        	// Pacchetto per la UI
	        	process_ui_remote_message(e.data.substring(1));
	        	
	        } else if (keyCHar == '^') {
        		///////////////////////////////////////
        		// Pacchetto dal centro assistenza
        		// Es.: Notifica chiusura assister
    			//
    			handle_assist_center_message(e.data);
		        
	        } else {
				if (GLConnection) {
					// Inoltra in messaggio alla Control Unit
	        		GLConnection.send('>'+e.data);
	        	} else {
	        		// pacchetto perso
					GLOutDiv.innerHTML += e.data;				
	        	}				
			}
		};
	}
}






////////////////////////////////////////
// Controllo connessione periodica
//
function remote_connection_check() {
	if (GLRemoteWS) {
		if (GLRemoteWS.readyState != GLRemoteWS.OPEN &&
			GLRemoteWS.readyState != GLRemoteWS.CONNECTING &&
			GLRemoteWS.readyState != GLRemoteWS.CLOSING) {
			GLRemoteWS.close();
			GLRemoteWS = null;
		} else {
			GLRemoteWS.send("");
		}
	}
}



////////////////////////////////////////////////////
// Processa il messaggio dal centro assistenza
//
function handle_assist_center_message( data ) {

	keyCHar = data ? data[1] : 0;
	if (keyCHar == '^') {
	
		if (data.substring(2, 13) == "[connected]") {
			/////////////////////////////////////
			// Conessione dell'end point
			//
			if (GLIsRemoteSide) {
				GLRemoteConnect = 2;
					if (GLIsRemoteSide != 'undefined')
						GLIsRemoteSide = true;
				set_obscured( false );
			}
			
		} else if (data.substring(2, 16) == "[disconnected]") {
			/////////////////////////////////////
			// Disconnessione dell'end point
			//
			
			if (GLIsRemoteSide) {
				// alert ("Machine was disonnected...\n\n");
				// window.location.reload();
				GLRemoteConnect = 1;
				set_obscured( true );
			} else {
				// alert ("Client was disonnected...\n\n");
				if (GLRemoteConnect > 0)
					GLRemoteConnect = 1;
				set_obscured( true );
			}	        					
		
		} else if (data.substring(2, 14) == "[reloadHost]") {
			////////////////////////////////////
			// Ricaricamento elenco Host
			//
				
			if (GLIsRemoteSide) {
		        var objTopframe = window.parent;
		        if (objTopframe) {
		        	var leftFrame = objTopframe.document.getElementById("leftUIframe");
		        	if (leftFrame) {
		        		leftFrame.contentWindow.location.reload();
		        		if (leftFrame.contentWindow.refresh_content) { 
		        			leftFrame.contentWindow.refresh_content();
		        			// leftFrame.contentDocument.
		        		}
		        	}
		        }	        						
			}
			
		} else if (data.substring(2, 15) == "[reconnected]") {
			////////////////////////////////////////////////////////
			// Risconnessione dell'end point o dell'assister
			//
			
			if (GLIsRemoteSide) {
				// alert ("Machine was disonnected...\n\n");
				// window.location.reload();
				GLRemoteConnect = 3;
				set_obscured( false );
			} else {
				// alert ("Client was disonnected...\n\n");
				if (GLRemoteConnect > 0)
					GLRemoteConnect = 2;
				set_obscured( false );
			}	        					
			
		} else if (data.substring(2, 20) == "[machineConnected]") {
			///////////////////////////////////////////
			// Connessione dell'end point (macchina)
			//
			if (GLIsRemoteSide) {
		        var objTopframe = window.parent;
		        if (objTopframe) {
		        	var leftFrame = objTopframe.document.getElementById("leftUIframe");
		        	if (leftFrame) {
		        		leftFrame.contentWindow.location.reload();
		        		if (leftFrame.contentWindow.refresh_content) { 
		        			leftFrame.contentWindow.refresh_content();
		        			// leftFrame.contentDocument.
		        		}
		        	}
		        }	        						
			}
			
		} else {
			alert("Undetected center message : " + data.substring(2));
		}			        		
	} else {		        			
		alert("Misformatted center message : " + data.substring(1));
	}
}





function stop_remote_server() {
	if (GLRemoteWS)
		GLRemoteWS.close();
	GLRemoteWS = null;	
	GLRemoteConnect = 0;
	set_obscured(false);
}








////////////////////////////////////////////////////
// Processa un messaggio destinato alla UI
//
function process_ui_remote_message( data ) {
	console.warn("remote ui cmd:"+data);
	if (data == "getDB()") {
		// test dump del database
		dump_database(GLDBName, process_ui_remote_db_reply);
	
	} else if (data == "getPages()") {
		get_serialized_page_data(process_ui_remote_ui_reply);
		
	} else {
		console.error("undetected remote ui cmd:"+data);
		
	}
}

////////////////////////////////////////////////////
// Replica ad un messaggio destinato alla UI
//
function process_ui_remote_db_reply( data ) {
	console.warn("remote ui cmd:"+data);
	if (GLRemoteWS) {
		console.log("reply to remote ui cmd:["+data.length+"]");
		// console.log("reply to remote ui cmd:["+data.length+"] - '"+data+"'");
		GLRemoteWS.send("||getDB()="+data)
	} else {
		console.error("unable to reply to remote ui cmd...connection broken");
	}
}

////////////////////////////////////////////////////
//Replica ad un messaggio destinato alla UI
//
function process_ui_remote_ui_reply( data ) {
	if (GLRemoteWS) {
		console.log("reply to remote ui cmd:["+data.length+"]");
		// console.log("reply to remote ui cmd:["+data.length+"] - '"+data+"'");
		GLRemoteWS.send("||getPages()="+data)
	} else {
		console.error("unable to reply to remote ui cmd...connection broken");
	}
}

