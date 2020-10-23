
//////////////////////////////////////////////
// Gestione Ricette
//
var GLWorkSet = null;
var GLWorkSets = null;
var GLNumWorkSets = null;




///////////////////////////////////////////
// Set Parametri macchina (persistenza)
//
class WORK_SET {

	constructor(_name, _description, _production, _preform_weight, _capacity, _id) {
		
    		this.name = _name;
    		this.description = _description;
    		this.production = _production; 
    		this.preform_weight = _preform_weight
    		this.capacity = _capacity;
    		
    		var date = new Date();
    		this.last_save = date.getFullYear() + '-' + date.getMonth()+1 +'-' + date.getDate() + ' ' +date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    		this.time_code = null;

    		this.id = _id;

    		this.dirty = false;
    		this.renamed = false;			   

    		this.refresh = function () {
    			on_work_set_loaded (this);
    		}
    	    
    		// Parametri ricetta
		    this.params = {
		    		
	    		// pref. contenitore
	    		preform_thickness:8.5
	    		,preform_color:"transparent"
			
				// produzione
				,num_bottles_to_product:2000
		
				// soffiaggio
				,primary_air_gap:180.0
				,secondary_air_gap:0.1
				,discharge_air_time_ms:2.0
				,recovery_air_factor:0
				,pressure_min:28.0
				,pressure_max:40.0
				,max_pressure_in_mold:0.5		
				
				,pressure_check:6.0
				,pressure_check_gap:1.5
				,pressure_check_time:1.2
				
				,stretch_speed:1200.0
				,stretch_force:90.0
				,stretch_mantein_force:30.0
				,stretch_bottom_gap:6.0
				
				,trasnferitor_speed:100.0
				,mold_speed:100.0
				,mold_quote:100.0
			
				// Temperatura preforme
				,preform_temp1:105.0
				,preform_temp2:105.0
				,preform_temp3:100.0
				,preform_temp_gap1:5.0
				,preform_temp_gap2:5.0
				,preform_temp_gap3:5.0
		
				// Riscaldamento preforme
				,global_heat_ratio1:50.0
				,global_heat_ratio2:75.0
				,init_heat_ratio1:60.0
				,init_heat_ratio2:85.0
				,standby_heat_ratio1:20.0
				,standby_heat_ratio2:20.0

				
				,owen1_min_temp:30.0
				,owen2_min_temp:30.0
				,owen1_max_temp:70.0
				,owen2_max_temp:70.0

				
				
				,row_1_1:60.0
				,row_1_2:50.0
				,row_1_3:40.0
				,row_1_4:40.0
				,row_1_5:40.0
				,row_1_6:40.0
				,row_1_7:40.0
				,row_1_8:40.0
				,row_1_9:40.0
				,row_1_10:50.0
				,row_1_11:60.0
				,row_1_12:70.0
				,row_1_13:0.0
				,row_1_14:0.0
				,row_1_15:0.0
				,row_1_16:0.0
				,row_2_1:60.0
				,row_2_2:50.0
				,row_2_3:40.0
				,row_2_4:40.0
				,row_2_5:40.0
				,row_2_6:40.0
				,row_2_7:40.0
				,row_2_8:40.0
				,row_2_9:40.0
				,row_2_10:50.0
				,row_2_11:60.0
				,row_2_12:70.0
				,row_2_13:0.0
				,row_2_14:0.0
				,row_2_15:0.0
				,row_2_16:0.0
				
				,ventilation:80.0
				
				// Rafreddamento
				,max_water_temp:16
				,min_water_temp:8
				
				// Tempi e timeout
			    ,pit_unlock_time_ms:200.0
			    ,preform_loader_up_time_ms:100
			    ,bottle_eject_down_time_ms:100
		
			    // Timeout generali (msec)
			    ,empy_preform_elevator_timeout_ms:10000
			    ,empy_preform_orientator_roller_timeout_ms:5000
			    ,empy_preform_orientator_pit_timeout_ms:5000
		
			    // Tempi (sec)
			    ,fan_motor_time_msec:3000
			    ,roll_motor_time_msec:3000
			    ,aspiration_persistence_time_msec:5000*60
			    ,preform_elevator_time_msec:10000
			    ,unjammer_time_msec:3000
			    
		
			    // scarico contenitori
			    ,online_bottles_transfer_present:1
			    ,force_bottles_discharge:0

		    }
		}	    
		
		// legge i parametri dall'unita di controllo	
		getCurrent() {		
			return 1;
		}

		// passa i parametri all'unita di controllo	
		setCurrent() {
			
			var cmd = '!';
			
			
			// Dati Intestazione
			cmd += 'workSet.name='+this.name;
			cmd += ';'+'workSet.description='+this.description;
			cmd += ';'+'workSet.production='+this.production;
			cmd += ';'+'workSet.preform_weight='+this.preform_weight;
			cmd += ';'+'workSet.capacity='+this.capacity;
			
			// Dati Variabili
			for(var param in this.params) {

				// Rimpiazzo carateri speciali
			    var key = param.replaceAll('_', '.');	    
				
			    cmd += ';'+'workSet.'+key+'='+this.params[param];
			}
			
			
			if(GLConnection) {
				// console.log("sending cmd:"+cmd);
				console.log("sending workSet...");
				GLConnection.send(cmd);
			}
			
			return 1;
		}
		
		// salva su database
		saveInDB() {		
			return 1;
		}

		// salva su file (esporta)
		saveToFile(fileName) {		
			return 1;
		}

		// carica da file (importa)
		LoadFromFile(fileName) {		
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



function work_set_init () {

	// Parametri lavoro di default
	GLWorkSet = new WORK_SET("test", "default workSet", 500, 495, 25, -1);

	/*
	// Test 
	GLWorkSet.params.preform_weight = 20.5;
	var str = GLWorkSet.toJSON();	
	alert(str);

	GLWorkSet.fromJSON(str);

	alert(GLWorkSet.params.preform_weight);
	*/

	
	// elenco ricette a disposizione (salvate nel database)

	
	///////////////////////////
	// Lettua elenco ricette
	//
	reload_parameters_set();

	
	
	
	
	
	/*
	// Test aggiunta ricetta
	if (add_or_update_work_set( GLWorkSet ) < 0) {
		alert("Errore aggiunta ricetta");
	}
	*/
	 
 	
	
	
	///////////////////////////////////////
	// Lettura configurazione di default
	//
	console.log("loading workSet "+GLSettings.work_set_id);
	
	// Imposta la ricetta da caricare sulla base della configurazione globale
	GLWorkSet.id = GLSettings.work_set_id;

	// Lettura dettaglio ricetta
	read_work_set(GLWorkSet, on_work_set_loaded, true);
	

	// alert("Loaded cfg : "+GLWorkSet.name+" - id:"+GLWorkSet.id+" pref weight:"+GLWorkSet.params.preform_weight);
 
}



function reload_parameters_set() {
	read_work_sets( work_sets_to_table, document.getElementById('archiveTable') );
}




///////////////////////////
// Lettua elenco ricette
//
function read_work_sets( afterFunc, tableObj ) {
	var retVal = 0;

	GLdb.transaction(function (tx) {
	
		try {
		
		   tx.executeSql("SELECT * FROM work_set", [], function (tx, results) {
				
			   var len = results.rows.length, i;
			   
			   msg = "<p>work_set rows: " + len;
			   document.getElementById('msg').innerHTML +=  msg;
	
			   if (len <= 0) {
				   try {
					   console.warn("No work_set founds");
				   } catch(e) {
					   alert(e);
				   }
			   } else {
				   var i;
				   GLNumWorkSets = results.rows.length
				   GLWorkSets = new Array(GLNumWorkSets);
				   retVal = GLNumWorkSets;
				   for (i = 0; i < len; i++) {
					   // msg = "<p><b>" + results.rows.item(i).log + "</b></p>";
					   
					   GLWorkSets[i] = new WORK_SET(results.rows.item(i).set_name, results.rows.item(i).description, results.rows.item(i).production, results.rows.item(i).preform_weight, results.rows.item(i).capacity, results.rows.item(i).id);
					   // document.getElementById('msg').innerHTML +=  "["+GLWorkSets[i].name+"-"+GLWorkSets[i].description+"-"+GLWorkSets[i].id+"]";
					   GLWorkSets[i].last_save = results.rows.item(i).last_save;
					   GLWorkSets[i].time_code = results.rows.item(i).time_code; 
				   }
				   
				   if (afterFunc)
					   afterFunc(tableObj);
			   }
			   
		   }, webDBonError);
		
	
		} catch(e) {
			alert(e);
		}

	}, webDBonError);
	
	return retVal;
}






function work_sets_to_table(objTable) {
	
	if (objTable) {
	
		
		while(objTable.rows.length > 2) {
			objTable.deleteRow(1);
			}
		
		for (var i = 0; i < GLNumWorkSets; i++) {
			   // msg = "<p><b>" + results.rows.item(i).log + "</b></p>";
			   // GLWorkSets[i].name
			   // GLWorkSets[i].description
			   // GLWorkSets[i].id

			var newText;
			
			// Insert a row in the table at the last row
			var tableRef = objTable.getElementsByTagName('tbody')[0];
			var newRow = tableRef.insertRow(tableRef.rows.length-1);
			newRow.className="";

			// Insert a cell in the row at index 0
			var newCell = newRow.insertCell(0);
			

			// Append a text node to the cell
			var div = document.createElement('div');
			div.innerHTML = '<input id="archiveNode-'+GLWorkSets[i].id+'" data-rel="'+GLWorkSets[i].id+'" type="checkbox" style="width:20px; height:20px;" onClick="select_work_set(this);"></input>';
			newCell.style.width = "22px";
			newCell.className = "firstCell";
			newCell.appendChild(div);

			newCell = newRow.insertCell(1);
			newText = document.createTextNode(GLWorkSets[i].name);
			newCell.style.width = "90px";
			newCell.className = "internalCell";
			newCell.appendChild(newText);
			
			newCell = newRow.insertCell(2);
			newText = document.createTextNode(GLWorkSets[i].description);
			newCell.style.width = "auto";
			newCell.className = "internalCell";
			newCell.appendChild(newText);

			newCell = newRow.insertCell(3);
			newText = document.createTextNode(''+GLWorkSets[i].production+'');
			newCell.style.width = "70px";
			newCell.className = "internalCell";
			newCell.appendChild(newText);
			
			newCell = newRow.insertCell(4);
			newText = document.createTextNode(''+GLWorkSets[i].preform_weight+'');
			newCell.style.width = "70px";
			newCell.className = "internalCell";
			newCell.appendChild(newText);

			newCell = newRow.insertCell(5);
			newText = document.createTextNode(''+GLWorkSets[i].capacity+'');
			newCell.style.width = "70px";
			newCell.className = "internalCell";
			newCell.appendChild(newText);

			newCell = newRow.insertCell(6);
			newText = document.createTextNode(''+GLWorkSets[i].last_save+'');
			newCell.style.width = "60px";
			newCell.style.fontSize = "75%";
			newCell.className = "internalCell";
			newCell.appendChild(newText);

			newCell = newRow.insertCell(7);
			newText = document.createTextNode(''+GLWorkSets[i].time_code+'');
			newCell.style.width = "60px";
			newCell.style.fontSize = "75%";
			newCell.className = "lastCell";
			newCell.appendChild(newText);

		}
	} else {
		console.error("work_sets_to_table() : Table not valid");
	}
}


// Calback selezione ricetta
function select_work_set( objCheck ) {
	if (objCheck) {
		if (objCheck.checked) {
			for (var i = 0; i < GLNumWorkSets; i++) {
				var id = 'archiveNode-'+GLWorkSets[i].id;
				if (objCheck.getAttribute('data-rel')==GLWorkSets[i].id) {
				} else {
					objCheck2 = document.getElementById(id);
					if (objCheck2) {
						objCheck2.checked = false;
					}					
				}
			}
		}
	}	
}

// Calback selezione ricetta
function get_selected_work_set() {
	var retVal = 0;
	for (var i = 0; i < GLNumWorkSets; i++) {
		var id = 'archiveNode-'+GLWorkSets[i].id;
		var objCheck = document.getElementById(id);
		if (objCheck)
			if (objCheck.checked)
				retVal = GLWorkSets[i].id;
	}	

	return retVal;
}





//////////////////////////////
// Lettua dettaglio ricetta
//
function read_work_set ( work_set_obj, on_loaded, quietMode ) {
	var retVal = 0;

	if (work_set_obj) {
		
		// Controllo se la macchina è in automatico
		if (quietMode) {
			retVal = 1;
		} else {
			retVal = confirm("Load selected file ?");
		}
		
		if (retVal) {
		
			GLdb.transaction(function (tx) {
			
				try {
				
				   tx.executeSql("SELECT * FROM work_set where id="+work_set_obj.id, [], function (tx, results) {
						
					   var len = results.rows.length, i;
					   
					   if (len <= 0) {
						   try {
							   console.warn("No work_set math "+work_set_obj.id+" founds");
						   } catch(e) {
							   alert(e);
						   }
					   } else {
						   for (var i=0; i<results.rows.length; i++) {
							   // msg = "<p><b>" + results.rows.item(i).log + "</b></p>";
							   // results.rows.item(i).name
							   // results.rows.item(i).description
							   // results.rows.item(i).id
							   // document.getElementById('msg').innerHTML +=  "["+GLWorkSets[i].name+"-"+GLWorkSets[i].description+"-"+GLWorkSets[i].id+"]";
						   
							   work_set_obj.name = results.rows.item(i).set_name;
							   work_set_obj.description = results.rows.item(i).description;
							   work_set_obj.production = results.rows.item(i).production;
							   work_set_obj.preform_weight = results.rows.item(i).preform_weight;
							   work_set_obj.capacity = results.rows.item(i).capacity;
							   work_set_obj.time_code = results.rows.item(i).time_code;
							   work_set_obj.last_save = results.rows.item(i).last_save;
							   work_set_obj.dirty = false;							   
	
							   if (results.rows.item(i).json_data) {
								   var strJSON = null;
								   try {
									   strJSON = window.atob(results.rows.item(i).json_data);
									   if (strJSON) {
										   // alert("IN DB : "+strJSON);
										   work_set_obj.fromJSON(strJSON);
									   } else {
										   alert("Ricetta non valida");
										   return -1;
									   }
									} catch(e) {
										alert("Ricetta non corretta");
										return -1;
									}
							   } else {
								   alert("Ricetta vuota");
								   // Inizializza i parametri
								   var new_work_set_obj = WORK_SET(work_set_obj.name, work_set_obj.desc, 500, 495, 25, -1);
								   work_set_obj.params = new_work_set_obj.params;
								   return -1;
							   }
								   
							   
							   break;
						   }
						   
						   
						   if (on_loaded) {
							   on_loaded(work_set_obj);
						   }
					   }
					   
				   }, webDBonError);
	
				} catch(e) {
					alert(e);
				}
	
			}, webDBonError);
		}
	}

	return retVal;
}



////////////////////////////////////
// Nuova ricetta
//
function new_work_set() {

	GLSettings.work_set_id = -1;

	// Imposta la ricetta da caricare sulla base della configurazione globale
	GLWorkSet.id = GLSettings.work_set_id;
	GLWorkSet.name = '';
	
	on_work_set_loaded( GLWorkSet );	

}



////////////////////////////////////
// Carica la ricetta selezionata
//
function load_work_set() {
	var id = get_selected_work_set();
	if (id) {
		var proceed = true;
		var connected = false;
		
		if (GLConnection) {
			if (GLConnection.readyState == GLConnection.OPEN) {
				connected = true;
			} 
		}
		
		if (!connected) {
			alert("Contorl Unit non connected! Unable to load workSet");
			return;
		}

		obj_stat = document.getElementById("mac.stat_msg");
		if (obj_stat) {
			if (obj_stat.innerHTML == "AUTOMATIC") {
				if (confirm("Machine is in running state\n\nDo you want to load workSet anaway ?")) {					
				} else {
					return;
				}
			}
			
		} else {
			alert("Unable to detect Contorl Unit status! Cannot safe load workSet");
			return;
		}
		
		
		///////////////////////////////////////
		// Lettura configurazione di default
		//
		GLSettings.work_set_id = id;
		
		console.log("loading workSet "+GLSettings.work_set_id);
		
		// Imposta la ricetta da caricare sulla base della configurazione globale
		GLWorkSet.id = GLSettings.work_set_id;

		// Lettura dettaglio ricetta
		read_work_set(GLWorkSet, on_work_set_loaded_to_cu, false);
		
		// Salva le impostazioni
		GLSettings.dirty = true;
		write_settings(null, null);
		
	} else {
		alert ("Please select a file to load")
	}
}

function on_work_set_loaded( work_set ) {
	// Ricetta corrente
	document.getElementById('archiveTableCurrent').value = work_set.name + (work_set.dirty ? '*':''); 
}



function archiveTableCurrentRename(obj) {
	if (GLWorkSet) {
		if (GLWorkSet.name != obj.value) {
			if (obj.value) {
				GLWorkSet.name = obj.value;
				GLWorkSet.renamed = true;
			} else {
				alert("Invalid name");
				obj.focus();
			}
		}
	}	
}



function on_work_set_loaded_to_cu( work_set ) {
	if (work_set) {
		if (work_set.setCurrent() < 0) {
			alert("Send workSet Failed!");
			console.error("Send workSet Failed!");
		}
		on_work_set_loaded( work_set );
	}
}




////////////////////////////////////
// Salva la ricetta selezionata
//
function save_work_set() {
	var reloadParamSets = false;
	
	if (GLWorkSet.id <= 0) {
		reloadParamSets = true;
	}

	if (GLWorkSet.name=='') {
		// Salvataggio con nome
		reloadParamSets = true;
		GLWorkSet.name = prompt("Please enter the workSet name", "");
		}
	
	if (GLWorkSet.renamed) {
		// Salvataggio con nome
		reloadParamSets = true;
		GLWorkSet.renamed = false;
	}
	
	if (GLWorkSet.name != '') {
		
		///////////////////////////////////////
		// Salvaggio ricetta
		//
		if (add_or_update_work_set ( GLWorkSet ) < 0) {
			alert("Save workSet failed!");
		}
		
		GLSettings.work_set_id = GLWorkSet.id;
		GLWorkSet.dirty = false;

		///////////////////////////
		// Lettua elenco ricette
		//
		if (reloadParamSets) {
			read_work_sets( work_sets_to_table, document.getElementById('archiveTable') );
		} else {
			GLWorkSet.refresh();
		}

	} else {
	}
}




////////////////////////////////////
// Carica la ricetta selezionata
//
function erase_work_set() {
var id = get_selected_work_set();

if (id) {

	///////////////////////////////////////
	// Lettura configurazione di default
	//

	if (confirm("Delete Selected File ?")) {
			console.log("deleting cfg "+id);

		delete_work_set( id );

		/////////////////////////////
		// Ri-Lettua elenco ricette
		//
		read_work_sets( work_sets_to_table, document.getElementById('archiveTable') );
		}

	} else {
		alert ("Please select a file to delete")
	}
}




//////////////////////////////
// Aggiunta ricetta al set
//
function add_or_update_work_set( work_set ) {
	var retVal = 0;
	var sqtSTMT = "";
	
	GLdb.transaction(function (tx) {

		var date = new Date();
		 	
		work_set.last_save = date.getFullYear() + '-' + date.getMonth()+1 +'-' + date.getDate() + ' ' +date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds(); 
		
		var paramsJSON = work_set.toJSON();
		var paramsJSONEnc = window.btoa(paramsJSON); 
		
		// alert("TO DB : "+paramsJSON);
		
		if (work_set.id > 0) {
			sqtSTMT = "INSERT OR REPLACE INTO work_set (id,set_name,description,production,preform_weight,capacity,last_save,user_id,json_data) VALUES ("
			+work_set.id
			+","+"'"+work_set.name+"'"
			+","+"'"+work_set.description+"'"
			+","+work_set.production
			+","+work_set.preform_weight
			+","+work_set.capacity
			+","+"'"+work_set.last_save+"'"
			+","+GLUserId
			+",'"+paramsJSONEnc+"'"
			+")";
		} else {
			sqtSTMT = "INSERT INTO work_set (set_name,description,production,preform_weight,capacity,last_save,user_id,json_data) VALUES ("
				+""+"'"+work_set.name+"'"
				+","+"'"+work_set.description+"'"
				+","+work_set.production
				+","+work_set.preform_weight
				+","+work_set.capacity
				+","+"'"+work_set.last_save+"'"
				+","+GLUserId
				+","+"'"+paramsJSONEnc+"'"
				+")";
		}
		
		tx.executeSql(sqtSTMT, [], function (tx, results) {

			try {

				if (results.insertId > 0) {
					work_set.id = results.insertId;
				} else {
					console.warn("Inserimento ricetta fallita");
				}
				

			} catch(e) {
				alert(e);
			}
				
		}, webDBonError);
			
	}, webDBonError);
	
	return retVal;
}





//////////////////////////////
// Cancezione ricetta al set
//
function delete_work_set( work_set_id ) {
	var retVal = 0;
	var sqtSTMT = "";

	GLdb.transaction(function (tx) {

		if (work_set_id) {

			tx.executeSql("DELETE FROM work_set WHERE id="+work_set_id, [], function (tx, results) {

				try {

					for (var i=0; i<GLNumWorkSets; i++) {
						if (GLWorkSets[i].id == work_set_id) {
							GLWorkSets.splice(i);
							break;
						}
					}

				} catch(e) {
					alert(e);
				}

			}, webDBonError);
		}

	}, webDBonError);

	return retVal;
}





function searchInArchiveTable(inputObj) {
    var archiveTable = document.getElementById("archiveTable");
	var retVal = null;
	
	if (archiveTable) { 
		retVal = searchInTable(inputObj,archiveTable);
	} else {
	}
	
	if(retVal) {
		// GLArchiveCount = retVal[0];
		// GLArchiveFilteredOut = retVal[1];
		// update_archive_count();
	}
}
