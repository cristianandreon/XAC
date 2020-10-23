
//////////////////////////////////////////////
// Gestione Ricette
//
var GLLangs = null;
var GLNumLangs = 0;





///////////////////////////
// Lettua elenco lingue
//
function read_languages( afterFunc, param ) {
	var retVal = 0;

	GLdb.transaction(function (tx) {
	
		try {
		
			/*
			 * tx.executeSql("INSERT INTO languages (id,key,value,id_lang) VALUES (1, '','ENG',0)",[],webDBonSuccess,webDBonError);
			 * tx.executeSql("INSERT INTO languages (id,key,value,id_lang) VALUES (2, '','ITA',0)",[],webDBonSuccess,webDBonError);
			 * tx.executeSql("INSERT INTO languages (key,value) VALUES ('uiLangITA','Italian',1)",[],webDBonSuccess,webDBonError);
			 * tx.executeSql("INSERT INTO languages (key,value) VALUES ('uiLangENG','English',1)",[],webDBonSuccess,webDBonError);
			 * tx.executeSql("INSERT INTO languages (key,value) VALUES ('uiLangITA','Italiano',2)",[],webDBonSuccess,webDBonError);
			 * tx.executeSql("INSERT INTO languages (key,value) VALUES ('uiLangENG','Inglese',2)",[],webDBonSuccess,webDBonError);
			 * 
			*/
			
			tx.executeSql("SELECT * FROM languages WHERE lang_id=0", [], function (tx, results) {
				
				var len = results.rows.length, i;
	
				if (len <= 0) {
					try {
						console.warn("No languages found");
					} catch(e) {
						alert(e);
				   }
					
				} else {
					var i;
					GLNumLangs = results.rows.length
					GLLangs = new Array(GLNumLangs);

					for (i = 0; i < len; i++) {
						GLLangs[i] = { id:results.rows.item(i).id, lang:results.rows.item(i).value };
					}
				   
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


 function read_main_languages(tx) {
	 
	 
	  tx.executeSql("SELECT * FROM languages WHERE lang_id=0", [], function (tx, results) {
	
		   var len = results.rows.length, i;
		   
		  
		   if (len <= 0) {
			   // Inizializzazione
			   
			   try {
				   
				   tx.executeSql("INSERT INTO languages (id,key,value,lang_id) VALUES (1, '','ENG',0)",[],webDBonSuccess,webDBonError);
				   tx.executeSql("INSERT INTO languages (id,key,value,lang_id) VALUES (2, '','ITA',0)",[],webDBonSuccess,webDBonError);
				   tx.executeSql("INSERT INTO languages (key,value,lang_id) VALUES ('uiLangITA','Italian',1)",[],webDBonSuccess,webDBonError);
				   tx.executeSql("INSERT INTO languages (key,value,lang_id) VALUES ('uiLangENG','English',1)",[],webDBonSuccess,webDBonError);
				   tx.executeSql("INSERT INTO languages (key,value,lang_id) VALUES ('uiLangITA','Italiano',2)",[],webDBonSuccess,webDBonError);
				   tx.executeSql("INSERT INTO languages (key,value,lang_id) VALUES ('uiLangENG','Inglese',2)",[],webDBonSuccess,webDBonError);

				   tx.executeSql("INSERT INTO languages (key,value,lang_id) VALUES ('uiLogin','Login',1)",[],webDBonSuccess,webDBonError);
				   tx.executeSql("INSERT INTO languages (key,value,lang_id) VALUES ('uiLogin','Entra',2)",[],webDBonSuccess,webDBonError);
				   
				   tx.executeSql("INSERT INTO languages (key,value,lang_id) VALUES ('uiLogout','Logout',1)",[],webDBonSuccess,webDBonError);
				   tx.executeSql("INSERT INTO languages (key,value,lang_id) VALUES ('uiLogout','Esci',2)",[],webDBonSuccess,webDBonError);

				   tx.executeSql("INSERT INTO languages (key,value,lang_id) VALUES ('uiUser','User name',1)",[],webDBonSuccess,webDBonError);
				   tx.executeSql("INSERT INTO languages (key,value,lang_id) VALUES ('uiUser','Nome utente',2)",[],webDBonSuccess,webDBonError);

				   tx.executeSql("INSERT INTO languages (key,value,lang_id) VALUES ('uiPass','Password',1)",[],webDBonSuccess,webDBonError);
				   tx.executeSql("INSERT INTO languages (key,value,lang_id) VALUES ('uiPass','Password',2)",[],webDBonSuccess,webDBonError);
				   
				   tx.executeSql("INSERT INTO languages (key,value,lang_id) VALUES ('uiLogAuto','Automatic login',1)",[],webDBonSuccess,webDBonError);
				   tx.executeSql("INSERT INTO languages (key,value,lang_id) VALUES ('uiLogAuto','Entra automaticamente',2)",[],webDBonSuccess,webDBonError);

				   tx.executeSql("INSERT INTO languages (key,value,lang_id) VALUES ('uiCUAddr','Control Unit Address',1)",[],webDBonSuccess,webDBonError);
				   tx.executeSql("INSERT INTO languages (key,value,lang_id) VALUES ('uiCUAddr','Indirizzo Unita di Controllo',2)",[],webDBonSuccess,webDBonError);
				   
				   tx.executeSql("INSERT INTO languages (key,value,lang_id) VALUES ('uiSK1','Single Load',1)",[],webDBonSuccess,webDBonError);
				   tx.executeSql("INSERT INTO languages (key,value,lang_id) VALUES ('uiSK1','Carico Singolo',2)",[],webDBonSuccess,webDBonError);

				   tx.executeSql("INSERT INTO languages (key,value,lang_id) VALUES ('uiSK2','Continuous Load ',1)",[],webDBonSuccess,webDBonError);
				   tx.executeSql("INSERT INTO languages (key,value,lang_id) VALUES ('uiSK2','Carico Continuo',2)",[],webDBonSuccess,webDBonError);
				   
				   tx.executeSql("INSERT INTO languages (key,value,lang_id) VALUES ('uiSK3','Heat',1)",[],webDBonSuccess,webDBonError);
				   tx.executeSql("INSERT INTO languages (key,value,lang_id) VALUES ('uiSK3','Riscaldamento',2)",[],webDBonSuccess,webDBonError);
				   
				   tx.executeSql("INSERT INTO languages (key,value,lang_id) VALUES ('uiSK4','Blow',1)",[],webDBonSuccess,webDBonError);
				   tx.executeSql("INSERT INTO languages (key,value,lang_id) VALUES ('uiSK4','Soffiaggio',2)",[],webDBonSuccess,webDBonError);

				   tx.executeSql("INSERT INTO languages (key,value,lang_id) VALUES ('uiSK5','In-line Output',1)",[],webDBonSuccess,webDBonError);
				   tx.executeSql("INSERT INTO languages (key,value,lang_id) VALUES ('uiSK5','Scarico in Linea',2)",[],webDBonSuccess,webDBonError);

				   tx.executeSql("INSERT INTO languages (key,value,lang_id) VALUES ('uiSK6','Reset Alarms',1)",[],webDBonSuccess,webDBonError);
				   tx.executeSql("INSERT INTO languages (key,value,lang_id) VALUES ('uiSK6','Cancella Allarmi',2)",[],webDBonSuccess,webDBonError);
				   
			   } catch(e) {
				   alert(e);
			   }
		   } else {
		   }
	  }, webDBonError);

 }


/*
"1"	""	"ENG"	"0"
"2"	""	"ITA"	"0"
"3"	"uiLangITA"	"Italian"	"1"
"4"	"uiLangENG"	"English"	"1"
"5"	"uiLangITA"	"Italiano"	"2"
"6"	"uiLangENG"	"Inglese"	"2"
"7"	"uiLogin"	"Login"	"1"
"8"	"uiLogin"	"Entra"	"2"
"9"	"uiLogout"	"Logout"	"1"
"10"	"uiLogout"	"Esci"	"2"
"11"	"uiUser"	"User name"	"1"
"12"	"uiUser"	"Nome utente"	"2"
"13"	"uiPass"	"Password"	"1"
"14"	"uiPass"	"Password"	"2"
"15"	"uiLogAuto"	"Automatic login"	"1"
"16"	"uiLogAuto"	"Entra automaticamente"	"2"
"17"	"uiCUAddr"	"Control Unit Address"	"1"
"18"	"uiCUAddr"	"Indirizzo Unita di Controllo"	"2"
 * */

function set_cur_lang( cur_lang_name ) {	

	GLdb.transaction(function (tx) {

		for (var i=0; i<GLNumLangs; i++) {
			
			if (GLLangs[i].lang == cur_lang_name) {
				
				if (GLSettings.lang != cur_lang_name) {
					GLSettings.lang = cur_lang_name;
					GLSettings.dirty = true;
					write_settings(null, null);
				}
		
				try {
			
					tx.executeSql("SELECT * FROM languages WHERE lang_id="+GLLangs[i].id+"", [], function (tx, results) {			
						var len = results.rows.length, i;		
						if (len <= 0) {
							try {
								console.warn("No key languages found");
							} catch(e) {
								alert(e);
						   }					
						} else {
							for (var i = 0; i < len; i++) {
								var key = results.rows.item(i).key;
								var obj = document.getElementById(key);
								if (obj) {
									if (obj.tagName == 'DIV') {
										obj.innerHTML = results.rows.item(i).value;
									} else {
										obj.value = results.rows.item(i).value;
									}
								} else {
								    var items = document.querySelectorAll('[data-lang]');
					                for (var item in items) {
					                	if (items.hasOwnProperty(item)) {
					                		if (items[item].getAttribute('data-lang') == key) {					                			
					                			if (item.tagName == 'DIV') {
					                				items[item].innerHTML = results.rows.item(i).value;
					                			} else {
					                				items[item].value = results.rows.item(i).value;
					                			}
												break;
											}
					                	}
					                }
								}
							}
						   
							// if (afterFunc) afterFunc(param);
						}
					   
					}, webDBonError);
					
					
				} catch(e) {
					alert(e);
				}						
				
				return;
			}
		}
	}, webDBonError);
}