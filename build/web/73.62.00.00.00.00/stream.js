


////////////////////////////////////////
// Controllo connessione periodica
//
function connection_check() {
	if (!GLStop) {
		if (GLConnection) {
			if (GLConnection.readyState != GLConnection.OPEN && 
					GLConnection.readyState != GLConnection.CONNECTING &&
					GLConnection.readyState != GLConnection.CLOSING) {
				GLConnection.close();
				GLConnection = null;
				do_start_stream();
			}
		} else {
			do_start_stream();
		}
	}
	
	if (GLSettings)
		if (GLSettings.dirty)
			write_settings(null, null);
}



function stop_stream () {
	GLStop = 1;
	do_stop_stream ();
}

function do_stop_stream () {
    if (GLConnection)
        GLConnection.close();
    GLConnection = null;
    document.getElementById("msg").innerHTML = "stopped";
    document.getElementById("connectionStatus").src = "red.png";
}


function change_conn_status(obj) {
	if (GLStop) {
		start_stream();
	} else {
		stop_stream();
	}
}


function start_stream() {
	GLStop = 0;
	do_start_stream();
}



function do_start_stream() {

    var obj = document.getElementById("refreshRate");   
    if (obj)
        if(GLSettings)
        	obj.value = GLSettings.refresh_rate;

    
    
    if (GLIsRemoteSide) {
    	/////////////////////////////////
    	// Connessione remota
    	//

    	document.getElementById("connectionStatus").src = "blue.png";
    	document.getElementById("msg").innerHTML = "Remote";

    	// Salta il login e passa allo stream
    	GLConnStep = 100;
    	
    	//////////////////////////////////////////
    	//
    	// Gestione ricaricamento pagina :
    	// Invia l'evento Connessione remota aperta
    	//
    	if (!GLRemoteWS && GLConnection) {
        	if (window.parent.GLClientWS) {
        		GLRemoteWS = window.parent.GLClientWS; 
        		on_remote_open(GLRemoteWS);
        	}
    	}	    	    	
    	
    } else {
    
    	/////////////////////////////////
    	// Connessione locale
    	//

    	var server = null;
	    obj = document.getElementById("addr");
	    if (obj) {
	    	if (obj.value > 0 && obj.value < 256) {
		    	GLServerIP = '192.168.1.'+obj.value;
		
			    var server = 'ws://'+GLServerIP+':'+GLServerPort+"/";
	    	}
	    }
	
	    if (server) {	    	
		    if (!GLConnection) {
		    	try {		    		
			    	GLConnStep = 0;
		    		GLConnection = new WebSocket(server);
		    		GLConnection.bynaryType = "blob";
		    		GLConnection.bynaryType = "arraybuffer";
		    		
		    		document.getElementById("connectionStatus").src = "yellow.png";
		    		document.getElementById("msg").innerHTML = "<b>"+GLServerIP/*+':'+GLServerPort*/+"</b>...";
		        } catch (e) {
		            console.log('Error:'+e.message);
		            return;
		        }
		    }
		    
		    
	    } else {	    	
	    	document.getElementById("connectionStatus").src = "gray.png";
	    	document.getElementById("msg").innerHTML = "Invalid addr...";	   	
	    }
    }
	 
    
    
    if (GLConnection) {
    	
		try {
	
		    
		    if (!GLConnection) {
		        alert("No WebSocket");
		        
		    } else {
		    
		        GLConnection.onerror = function(error) {
		        	document.getElementById("connectionStatus").src = "red.png";
		            document.getElementById("msg").innerHTML = "Error:"+error.data;
		            set_obscured(true);
		            console.log('Error detected: ' + error);
		            if (GLConnection)
		                GLConnection.close();
		            GLConnection = null;
		            GLStreamCounter = 0;
		        }    
		        
		        
		        
		        //////////////////////////////////////////
		        // Lettura risposta dal Control Unit
		        //
		        GLConnection.onmessage = function(e) {
		
		        	var keyCHar = e.data ? e.data[0] : 0;
		        	
		        	if (keyCHar == '<') {
		        		///////////////////////////////
		        		// Pacchetto da inoltrare
		        		//
		        		
		        		if (GLRemoteWS && GLRemoteWS.readyState == GLRemoteWS.OPEN) {
			        		/////////////////////////////////////////
			        		// Collegamento remoto
			        		// Inoltra il dato all'end-point
			        		//
			        		GLRemoteWS.send(e.data.substring(1));
			        		
		        		} else {
		        			////////////////////////
		        			// pacchetto perso
		        			//
		        			if (GLRemoteConnect > 0) 
		        				GLRemoteConnect = 1;
		        			set_obscured(false);
		        		}
		        		
		        	} else if (keyCHar == '|') {
		        		keyCHar = e.data ? e.data[1] : 0;
		        		if (keyCHar == '|') {
			        		////////////////////////////////////////////////////
			        		// Pacchetto risposta a messaggio per la UI
			        		// Es.: Risposta alla richiesta di download del DB
		        			//
		        			if (e.data.substring(2, 10) == "getDB()=") {
		        				//////////////////////////////////////////////
		        				// Creazione del database
		        				//
		        				create_database(GLDBName, e.data.substring(10), function () {
		        					if(window.parent.document) {
		        						if (window.parent.writeToScreen) {
		        							window.parent.writeToScreen ("DB download done..."+GLImportedDBInfo); 
		        						}
		        					}
		        					alert ("Database successfully created...\n\nConfirm page reload to apply changes"); 
		        					window.location.reload(); 
		        					} 
		        				);		        					
		        				
		        			} else if (e.data.substring(2, 13) == "getPages()=") {
		        				//////////////////////////////////////////////
		        				// Creazione delle pagine della macchina a cura dell' Assist Center
		        				//
		        				if (window.parent.writeToScreen) {
		        					window.parent.writeToScreen("App download done..."); 
        						}
		        				if (e.data.substring(13, 17) == "[OK]") {
		        					alert ("App registered by xProject Assist Center...\n\n"+e.data.substring(17)+"\n\nConfirm page reload to apply changes");
		        					window.location.reload(); 
		        				} else {
		        					alert ("UI Pages download FAILED:"+e.data.substring(15) );
		        				}

	        					
		        			} else {
		        				alert("Undetected remote cmd ui reply : "+e.data.substring(2));
		        			}			        		
		        		} else {
		        			alert("Misformatted remote cmd ui reply : "+e.data.substring(1));
		        		}
		        		
		        		
		        	} else if (keyCHar == '^') {
		        		///////////////////////////////////////
		        		// Pacchetto dal centro assistenza
		        		// Es.: Notifica chiusura assister
	        			//
	        			handle_assist_center_message(e.data);
	        			

		        		

		        	} else {
		        		///////////////////////////////
		        		// Pacchetto da processare
		        		//

		        	
			        	if (GLConnStep == 0) {
				            // 
		        			GLStreamCounter = 0;
		
			        	} else if (GLConnStep == 5) {
			        		///////////////////
			        		// Risultato Login
			        		//
			        		// alert("login result:"+e.data);
			        		if (keyCHar == '#') {
			        			var resultData = e.data.substring(1);
				        		if (resultData) {
				        			GLSettings.user_name = GLLogin.UserName;
				        			GLSettings.token = GLLogin.Token = resultData;
				        			GLLogin.Status = GLLogin.UserName; + '['+GLLogin.Token+']';
				        			console.log('Login token:'+GLLogin.Token+'');
				        			onLoginDone();
					        		
					        		// salvataggio autologin
					        		if (GLSettings.auto_login)
					        			write_settings(null, null);	        		
		
					        		GLConnStep = GLAfterLoggedConnStep;
				        			
				        		} else {
				        			GLSettings.token = GLLogin.Token = null;
				        			GLLogin.Status = "Login failed";
				        			alert("Login failed!");
				        			console.error('Login failed ('+GLLogin.UserName+')');	        			
				        			onLoginFail();
				        			
				        			GLConnStep = 6;
				        		}		        		
				        		
				        		login_refresh();
			        		}
			        		
			        	} else if (GLConnStep == 6) {
			        		//////////////////////////
			        		// Login fallito
			        		//
			        		onLoginFail();
			        		
			        		login_refresh();
			        		
			        		GLConnStep = GLAfterLoggedConnStep;
			        		
			        		
			        	} else if (GLConnStep == 7) {
			        		//////////////////////////
			        		// Logout
			        		//
			        		if (e.data) {
			        		}
		
			        		
			        	} else if (GLConnStep == 8) {
			        		//////////////////////////
			        		// Attesa invio comando ...
			        		//
		
			        	} else if (GLConnStep == 9) {
			        		
			        		/////////////////////////////////////////////////////
			        		// Responso Contatore caricamento parametri
			        		//
			        		if (e.data) {
				        		var keyCHar = e.data[0];
				        		if (keyCHar == '!') {
				        			GLWorkSetLoadCount = Number(e.data.substring(1));
				        		}
				        		
				        		GLConnStep = 10;
			        		}
			        		
			        		
			        		
			        	} else if (GLConnStep == 10) {
			        		///////////////////////////////////////////
			        		// Attesa Invio Parametri e Impostazioni
			        		//
		
			        		
			        	} else if (GLConnStep == 100) {
			        		////////////////////////////////////////
			        		// Attesa Invio risoluzione dei nomi
			        		//
			        		
			        	} else if (GLConnStep == 200) {
			        		///////////////////////////
			        		// Risoluzione dei nomi
			        		//
			        		if (e.data) {
				        		var keyCHar = e.data[0];
				        		if (keyCHar == '=') {
				        			var resolvedVarIds = e.data.substring(1).split(";");
				        			
				        			if (GLDebug)
				        				console.log('Resolving:['+e.data+']....');
				        			
				        			for (var i=0; i<resolvedVarIds.length; i++) {
				        				if (i<GLNumUIObj) {
				        					if (resolvedVarIds[i]) {
				        						if (!isNaN(resolvedVarIds[i])) {
				        							GLUIObj[i].cuId = resolvedVarIds[i];
				        							if (GLUIObj[i].obj.getAttribute('data-error') == '1') {
				        								GLUIObj[i].obj.style.border="";
				        								GLUIObj[i].obj.style.color = "";
				        								GLUIObj[i].obj.setAttribute('data-error','');
				        							}
				        						} else {
				        							console.error('Unresolved NaN #'+i+' ["'+resolvedVarIds[i]+'"<->'+GLUIObj[i].obj.id+']');
				        							GLUIObj[i].obj.style.border="1px dashed red";
				        							GLUIObj[i].obj.innerHTML = '['+GLUIObj[i].obj.id+']';
				        							GLUIObj[i].obj.style.color = "red";
				        							GLUIObj[i].obj.setAttribute('data-error','1');
				        						}
			        						} else {
			        							console.error('Unresolved #'+i+':["'+resolvedVarIds[i]+'"<->'+GLUIObj[i].obj.id+']');
			        							GLUIObj[i].obj.style.border="1px solid red";
			        							GLUIObj[i].obj.innerHTML = '['+GLUIObj[i].obj.id+']';
			        							GLUIObj[i].obj.style.color = "red";
			        							GLUIObj[i].obj.setAttribute('data-error','1');
			        						}
				        				}
				        			}
				
				        			// Passa al ciclo di lavoro
				        			console.log('Start streaming:'+GLNumUIObj+' objects....');
				        			GLConnStep = 300;
				        			
				        			on_before_start_stream();
				        			
				        		} else {
				        			console.log('Skipped message:['+e.data+']');
				        		}
			        		}	
			
			        	} else if (GLConnStep == 300) {
			        		/////////////////////////////////////////////////////////////
			        		// ciclo lavoro con gli Id della control unit (+veloce)
			        		//
			        		if (e.data) {
				        		var keyCHar = e.data[0];
				        		if (keyCHar == '<' && e.data[1] == '<') {
				        			///////////////////////////////////////////
				        			// Esecuzione kavascript, codice <<
				        			//
				        			try {
				        				eval(e.data.substring(2));
				        			} catch (e) {
				        				alert(e);
				        			}
				        			
				        		} else if (keyCHar == '!') {
				        			// Risultato esecuzione
				        			try {
				        				// e.data.substring(1);
				        			} catch (e) {
				        			}
				        			
				        		} else if (keyCHar == '@') {
				        			// Dati : valori dei campi
						            var varValues = e.data.substring(1).split(";");
						            var cVar = 0;
						            for (var i=0; i<GLNumUIObj; i++) {
				            			if (GLUIObj[i].cuId) {
				            				if (cVar < varValues.length) {
					            				if (GLUIObj[i].obj) {
						            				process_ui_obj(GLUIObj[i], GLUIObj[i].obj, GLUIObj[i].objI, GLUIObj[i].objS, GLUIObj[i].objT, GLUIObj[i].objTC, GLUIObj[i].objTCo, GLUIObj[i].objSK, GLUIObj[i].obj.id, varValues[cVar]);
					            				}
					            				cVar++;
				            				}
					            		}
					        		}
			        			}        			
			        		}
			        		
			        		if (GLStreamCounter==1) {
			        			on_after_start_stream();		        			
			        		}
			        		
			        		GLStreamCounter++;
			        	}
			        }
		        }
			        
			        
			        
		        
		        // CloseEvent.code property containing a numerical code according to RFC 6455 11.7 and a CloseEvent.reason
		        GLConnection.onclose = function(CloseEvent){
		        	handle_connection_close();
		        }
		        
		        
		        
		        GLConnection.onopen = function() {
		        	handle_connection_open();
		        }
		    }
		    
	    } catch (e) {
	        console.log('Error:'+e.message);
	        return;
	    }
    }
}




//////////////////////////////////////////
// Chiamata alla prima dello Stream
//
function on_before_start_stream () {
}




//////////////////////////////////////////
// Chiamata alla prima lettura eseguita
//
function on_after_start_stream () {
	// 	Rinfresco Softkey non necessario : 
	// refresh_softkeys();
}






function handle_connection_open () {

	try {

	    if (GLIsRemoteSide) {
	    	
	    	set_obscured(false);
	    	
	    	GLConnStep = 100;
	    	
	    	
	    } else {

	    	// Send a small message to the console once the GLConnection is established
			document.getElementById("connectionStatus").src = "green.png";
			document.getElementById("msg").innerHTML = "Connected";
			console.log('Connection open');

			set_obscured(false);
			
			GLConnStep = 0;
	    }		
		
		
		
		////////////////////////////////////
		// Inizializza i Servizi (HTTP) 
		//
	    if (GLIsRemoteSide) {
	    	// Connessione remota
	    } else {
	    	// Connessione locale
	    	init_services();
	    }
		
		
		///////////////////////////////////
		// Avvio Streaming : invio dati
		//
	    if (GLIsRemoteSide) {
	    	setTimeout("send_data()", GLRemoteRefreshRateMs > 0 ? GLRemoteRefreshRateMs : 100);
	    } else {
	    	setTimeout("send_data()", GLSettings.refresh_rate > 0 ? GLSettings.refresh_rate : 100);
	    }
		
    } catch (e) {
        document.getElementById("msg").innerHTML = "Error:"+e.message;
        console.log('Error:'+e.message);
    }
}









function handle_connection_close () {

	try {
		        
    	document.getElementById("connectionStatus").src = "red.png";
        document.getElementById("msg").innerHTML = "Connection closed ["+CloseEvent.reason+"]";
        set_obscured(true);
        console.log('Connection closed ['+CloseEvent.reason+']');

	} catch (e) {
        document.getElementById("msg").innerHTML = "Error:"+e.message;
        console.log('Error:'+e.message);
    }
}






///////////////////////////////////////
// Invia un comando esplicito alla CU
// Usato dai pulsanti dalla UI
//
function send_cmd(cmd) {
	
	if (GLRemoteWS && GLRemoteWS.readyState == GLRemoteWS.OPEN) {
		/////////////////////////////////////////
		// Collegamento remoto lato endPoint (macchina)
		// 
	}
	
	
    if (GLConnection) {
        if (GLConnection.readyState == GLConnection.OPEN) {        	
            try {
                GLConnection.send(cmd);
            } catch (e) {
                document.getElementById("msg").innerHTML = "Error:"+e.message;
                console.log('Error:'+e.message);
            }
            
        } else {
            // document.getElementById("msg").innerHTML = "Connection teminated";
        	console.warn('Cannot send data : conection teminated');
        }
    }
}



/////////////////////////////////
// Invia la richiesta alla CU
//
function send_data() {

	if (GLRemoteWS && GLRemoteWS.readyState == GLRemoteWS.OPEN) {
		/////////////////////////////////////////
		// Collegamento remoto lato endPoint (macchina)
		// 
		// L'invio dati alla CU è ammesso in connessione remota  
		// politica : tutti parlano con tutti
		// 
	}

		
    if (GLConnection) {
    	
        if (GLConnection.readyState == GLConnection.OPEN) {
        	
        	var cmdToSend = "";
        	
        	if (GLConnStep == 0) {
        		
        		///////////////////////////////
        		// Riciesta di autenticazione
        		//
        		onLoginFail();
        		
        		if (GLSettings.auto_login) {
        			if (GLSettings.token) {
        				GLLoginPending = 1;
        			}        			
        		}
        		
        		if (GLLoginPending) {
        			cmdToSend = handle_login_request();
        		} else if (GLLogoutPending) {
        			cmdToSend = handle_logout_request();
        		}	
        		

        	} else if (GLConnStep == 5) {
        		
        		////////////////////////
        		// Attesa Login
        		//
	            
        		
        	} else if (GLConnStep == 6) {
        		
        		////////////////////////
        		// Login Fallito
        		//

        		login_refresh();
        		
        		GLConnStep = GLAfterLoggedConnStep;
        		
        	
        	} else if (GLConnStep == 7) {
        		
        		////////////////////////
        		// Logout
        		//

        		login_refresh();
        		
        		GLConnStep = GLAfterLoggedConnStep;


        		
        		
        		
        		
        	} else if (GLConnStep == 8) {
        		
        		////////////////////////////////////////
        		// Lettura caricamento parametri
        		//

        		cmdToSend = "!workSet.loadCount";
        		
        		GLConnStep = 9;
        		
        	} else if (GLConnStep == 9) {
        		
        		///////////////////////////////////////////////
        		// Attesa responso caricamento parametri
        		//



        	} else if (GLConnStep == 10) {
        		
	        	//////////////////////////////////////////////////////
	        	// Invio Parametri ed impostazioni alla control unit 
	        	//	            
	            if (GLWorkSet) {
	            	if (GLWorkSetLoadCount == 0) {
	            		if (GLWorkSet.setCurrent() < 0) {
	            			console.error("Send workSet Failed!");
	            			alert("Send workSet Failed!");
	            		} else {
	            			console.log('WorkSet sent to C.U.');
	            		}
	            	} else if (GLWorkSetLoadCount < 0) {
	            		console.err('WorkSet params undeterminated');
	            		
	            	} else {
	            		console.log('WorkSet params already sent ('+GLWorkSetLoadCount+')');
	            	}
	            } else {
            		console.err('No WorkSet available!');	            	
	            }

	            // N.B.: Per default Lascia prevalere le impostazione della control Unit
	            if (GLOverWriteCUSettings) {
	            	if (GLSettings) {
	            		if (GLSettings.setCurrent() < 0) {
	            			alert("Set Settings Failed!");
	            		}
		            } else {
	            		console.err('No Settings available!');	            	
	            	}
	            } else {
            		console.log('Settings overload disabled');	            	
	            }
	            
	            GLConnStep = 100;
        		
	            
        		
        	} else if (GLConnStep == 100) {
        		
        		//////////////////////////////////////////////////////
        		// Ricerca e Risoluzione dei nomi delle varibili
        		//
        		
        		var controlUnitVars = document.getElementsByClassName("cuVar");
        		var controlUnitIstograms = document.getElementsByClassName("cuVarIstogram");
        		var controlUnitImages = document.getElementsByClassName("cuVarStat");
        		var controlUnitIOImages = document.getElementsByClassName("cuVarStatIO");
        		var controlUnitTraces = document.getElementsByClassName("cuVarTrace");
        		var controlUnitTraceCharts = document.getElementsByClassName("cuVarTraceChart");
        		var controlUnitSoftKeys = document.getElementsByClassName("cuVarSK");

        		// Lista allarmi
        		var controlUnitAlarmList = document.getElementById("mac.alarmList");
        		var controlUnitLastAlarms = document.getElementById("mac.lastAlarms");
        		
        		// Azzera gli oggetti UI
        		GLNumUIObj = 0;
        		
        		GLUIObj = new Array(); // N.B.: potenziale memory leak sugli oggetti precedenti l'assegnazione

        		cmdToSend = "?";
				
        		// Ricerca degli oggetti html associati
        		for (i = 0; i < controlUnitVars.length; i++) {
        			if (controlUnitVars[i].id) {
        				if (is_visible(controlUnitVars[i])) {
        					var controlUnitIstogramsObj = null, controlUnitImageObj = null, controlUnitTraceObj = null, controlUnitTraceChartObj = null, controlUnitSoftKeysObj = null;
        					
        					cmdToSend += (GLNumUIObj>0?";":"")+controlUnitVars[i].id;
        					
        					// Ricerca degli istogrammi associati
        					for (var j = 0; j < controlUnitIstograms.length; j++) {
        						if (controlUnitIstograms[j].id == controlUnitVars[i].id+"-I") {
        							if (is_visible(controlUnitIstograms[j])) {
        								controlUnitIstogramsObj = controlUnitIstograms[j];
        								break;
        							}
        						}
        					}
        					// Ricerca delle immagini di stato associate
        					for (var j = 0; j < controlUnitImages.length; j++) {
        						if (controlUnitImages[j].id == controlUnitVars[i].id+"-S") {
        							if (is_visible(controlUnitImages[j])) {
        								controlUnitImageObj = controlUnitImages[j];
        								break;
        							}
        						}
        					}
        					// Ricerca delle immagini degli IO associati
        					for (var j = 0; j < controlUnitIOImages.length; j++) {
        						if (controlUnitIOImages[j].id == controlUnitVars[i].id+"-S") {
        							if (is_visible(controlUnitIOImages[j])) {
        								controlUnitImageObj = controlUnitIOImages[j];
        								break;
        							}
        						}
        					}
        					// Ricerca dei Trace associati
        					for (var j = 0; j < controlUnitTraces.length; j++) {
        						if (controlUnitTraces[j].id == controlUnitVars[i].id+"-T") {
        							if (is_visible(controlUnitTraces[j])) {
        								controlUnitTraceObj = controlUnitTraces[j];
        								break;
        							}
        						}
        					}
        					// Ricerca dei TraceChart associati
        					for (var j = 0; j < controlUnitTraceCharts.length; j++) {
        						if (controlUnitTraceCharts[j].id == controlUnitVars[i].id+"-TC") {
        							if (is_visible(controlUnitTraceCharts[j])) {
        								controlUnitTraceChartObj = controlUnitTraceCharts[j];
        								break;
        							}
        						}
        					}
        					// Ricerca dei TraceChart associati
        					for (var j = 0; j < controlUnitSoftKeys.length; j++) {
        						if (controlUnitSoftKeys[j].id == controlUnitVars[i].id+"-SK") {
        							if (is_visible(controlUnitSoftKeys[j])) {
        								controlUnitSoftKeysObj = controlUnitSoftKeys[j];
        								break;
        							}
        						}
        					}

        					// Aggiunta alla lista degli oggetti UI
        					GLUIObj.push( { 
        						cuId:0 
        						,obj:controlUnitVars[i] 
        						,objI:controlUnitIstogramsObj 
        						,objS:controlUnitImageObj 
        						,objT:controlUnitTraceObj 
        						,objTC:controlUnitTraceChartObj 
        						,objTCo:null
        						,objSK:controlUnitSoftKeysObj
        						,counter:0
        						,colIndex:null
        						,rotate:false
        						,temporary:false
        						,min_rows : 0
        						,row_height : 0
        						,font_size_array : null
        						} );
        					GLNumUIObj++;
        					
        				} else {
        					// console.log('filtered out :'+controlUnitVars[i].id);
        				}
        			}
        		}

        		
        		/////////////////////////////////////////////
        		// Aggiunta dell'oggetto lista allarmi
        		//
        		if(controlUnitAlarmList) {
        			if (is_visible(controlUnitAlarmList)) {
        				// Agggiunta alle varuiabili da risolvere
        				cmdToSend += (GLNumUIObj>0?";":"")+controlUnitAlarmList.id;
	        			// Aggiunta alla lista degli oggetti UI
						GLUIObj.push( { 
							cuId:0 
							,obj:controlUnitAlarmList 
							,objI:null
							,objS:null 
							,objT:null 
							,objTC:null 
							,objTCo:null
							,objSK:null
							,counter:0
							,colIndex:Array(0, 1, 2, 3, 4)
							,rotate:false
							,temporary:false
							,min_rows:2
							,row_height:17
							,font_size_array:Array(100, 100, 100, 75, 80)
							} );
						GLNumUIObj++;        			
	        		}
        		}
        		
        		////////////////////////////////////////////
        		// Aggiunta dell'oggetto ultimi allarmi 
        		//
        		if(controlUnitLastAlarms) {
        			if (is_visible(controlUnitLastAlarms)) {
        				// Agggiunta alle variabili da risolvere
        				cmdToSend += (GLNumUIObj>0?";":"")+controlUnitLastAlarms.id;
	        			// Aggiunta alla lista degli oggetti UI
						GLUIObj.push( { 
							cuId:0 
							,obj:controlUnitLastAlarms 
							,objI:null 
							,objS:null 
							,objT:null 
							,objTC:null 
							,objTCo:null
							,objSK:null
							,counter:GLCurAlarmList
							,colIndex:Array(0, 1, 2, 3, 4)
							,rotate:true
							,temporary:true
							,min_rows:0
							,row_height:12
							,font_size_array:Array(100, 100, 100, 75, 80)
							} );
						GLNumUIObj++;        			
	        		}
        		}

        		if (GLDebug)
        			console.log('asking for:{'+cmdToSend+'}');
        		console.log('No ui objs:'+GLNumUIObj+' waiting for reply....');
        		
        		
        		// Copia per debug
        		GLVariableList = cmdToSend;
        		
        		// Attesa risposta
        		GLConnStep = 200;
        		
        		
        		
        		///////////////////////////////////////////////////////
        		// Invio del contatore record letti tabella allarmi
        		//
        		if(controlUnitAlarmList || controlUnitLastAlarms) {
        			if (is_visible(controlUnitAlarmList) || is_visible(controlUnitLastAlarms)) {
        				// setTimeout(function() { send_cmd("!mac.curAlarm="+GLCurAlarmList+"") }, 10);
        				if(GLConnection)
        					GLConnection.send("!mac.curAlarm="+GLCurAlarmList+"");
        			}
        		}
        		
        		
        		
        	} else if (GLConnStep == 200) {
        		/////////////////////
        		// Attesa risposta
        		//
        		
        	} else if (GLConnStep == 300) {

        		///////////////////////////////
        		// Riciesta di autenticazione
        		//
        		
        		if (GLLoginPending) {
        			cmdToSend = handle_login_request();

        		} else if (GLLogoutPending) {
            		cmdToSend = handle_logoff_request();
            		
        		} else {	
	        		
	        		///////////////////////////////////////////////////////
	        		// ciclo lavoro : usa gli Id della control unit
	        		//
	        		if (GLReloadContent) {
	        			GLConnStep = 100;
	        			GLReloadContent = 0;
	        			return send_data();
	        			
	        		} else {
	        			cmdToSend = "@";
		        		for (i = 0; i < GLNumUIObj; i++) {
		        			if (GLUIObj[i].cuId) {
		        				cmdToSend += (i>0?";":"")+GLUIObj[i].cuId; 
		        			}
		        		}
	        		}
	        	}
        	}
        	
        	
        	////////////////////////////////
        	// Invio richiesta alla CU
        	//
            try {
            	
            	if(cmdToSend) { 
            		GLConnection.send(cmdToSend);
            	} else {
            		// Tiene attiva la connessione
            		GLConnection.send('');
            	}

            	
                setTimeout("send_data()", GLSettings.refresh_rate);
                
            } catch (e) {
                document.getElementById("msg").innerHTML = "Error:"+e.message;
                console.log('Error:'+e.message);
            }
        	
        	
        } else if (GLConnection.readyState == GLConnection.CLOSED) {
           	document.getElementById("msg").innerHTML = "Connection Closed";
           	document.getElementById("connectionStatus").src = "red.png";
           	set_obscured(true);
           	console.log('Conection teminated');
          	
        } else if (GLConnection.readyState == GLConnection.CONNECTINH) {
           	document.getElementById("msg").innerHTML = "Connecting...";
           	document.getElementById("connectionStatus").src = "yellow.png";
           	set_obscured(true);
           	console.log('Conection teminated');
           	
        } else if (GLConnection.readyState == GLConnection.CLOSING) {
           	document.getElementById("msg").innerHTML = "Closing Connection...";
           	document.getElementById("connectionStatus").src = "yellow.png";
           	set_obscured(true);
           	console.log('Conection teminated');
           	
        } else {
            document.getElementById("msg").innerHTML = "Connection Undefined";
            document.getElementById("connectionStatus").src = "red.png";
            set_obscured(true);
            console.log('Conection teminated');
        }
        
    } else {
        // document.getElementById("msg").innerHTML = "No Connection";
        // document.getElementById("connectionStatus").src = "red.png";
        // set_obscured(true);
        // console.log('Conection teminated');
    }
}

