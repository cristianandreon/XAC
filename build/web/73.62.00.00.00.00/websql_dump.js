/*
 * websqldump.js v1.0.0
 * Copyright 2016 Steven de Salas
 * http://github.com/sdesalas/websqldump
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */


	var wd = {};

	// Default config
	wd.config = {
		database : undefined,
		table : undefined, // undefined to export all tables
		version : '1.0',
		info : '',
		dbsize : 0, // 5 * 1024 * 1024, // 5MB
		linebreaks : false,
		schemaonly : false,
		dataonly : false,
		spliter : false,
		success : function(sql) {
			console.log(sql);
		},
		error : function(message) {
			throw new Error(message);
		}
	}

	wd.exportTable = function(config) {
		// Use closure to avoid overwrites
		var table = config.table;
		// Export schema
		if (!config.dataonly) {
			wd
					.execute({
						db : config.db,
						sql : "SELECT sql FROM sqlite_master WHERE type='table' AND tbl_name=?;",
						params : [ table ],
						success : function(results) {
							if (!results.rows || !results.rows.length) {
								if (typeof (config.error) === "function")
									config.error('No such table: ' + table);
								return;
							}
							var sqlSTMT = results.rows.item(0)["sql"] + ";"+(config.spliter?config.spliter:"");
							if (sqlSTMT.indexOf("CREATE TABLE") == 0) {
								// console.warn(""+sqlSTMT);
							}
							config.exportSql.push(sqlSTMT);
							if (config.schemaonly) {
								if (typeof (config.success) === "function")
									config.success(config.exportSql.toString());
								return;
							}
						}
					});
		}
		// Export data
		if (!config.schemaonly) {
			wd.execute({
				db : config.db,
				sql : "SELECT * FROM '" + table + "';",
				success : function(results) {
					if (results.rows && results.rows.length) {
						for (var i = 0; i < results.rows.length; i++) {
							var row = results.rows.item(i);
							var _fields = [];
							var _values = [];
							for ( var col in row) {
								_fields.push(col);
								// var db_value = String(row[col]).replaceAll("'","''");
								// var db_value = String(row[col]).replaceAll("'","");
								var db_value = String(row[col]).replace(/[^a-zA-Z0-9 {}()\[\]\!£$%&/\(\)=?^@#-_\^]/g, "");
								var db_value = db_value.replaceAll(";##", ""); 
								// var db_value = String(row[col]).replace(/[^a-zA-Z0-9 ]/g, "");
								_values.push('"' + db_value + '"');
							}
							config.exportSql.push("INSERT INTO " + table + "("
									+ _fields.join(",") + ") VALUES ("
									+ _values.join(",") + ");"+(config.spliter?config.spliter:"") );
						}
					}
					if (typeof (config.success) === "function")
						config.success(config.exportSql.toString());
				},
				error : function(err) {
					if (typeof (config.error) === "function")
						config.error(err);
				}
			});
		}
	}

	wd.export = function(config) {
		// Apply defaults
		for ( var prop in wd.config) {
			if (typeof config[prop] === 'undefined')
				config[prop] = wd.config[prop];
		}
		config.db = wd.open(config);
		config.exportSql = config.exportSql || [];
		config.exportSql.toString = function() {
			return this.join(config.linebreaks ? ';\n' : ''); // + ';';
		}
		if (config.table) {
			wd.exportTable(config);
		} else {
			config.exported = []; // list of exported tables
			config.outstanding = []; // list of outstanding tables
			var success = config.success;
			config.success = function() {
				config.exported.push(config.table);
				// Check if its all done
				if (config.exported.length >= config.outstanding.length) {
					if (typeof (success) === "function")
						success(config.exportSql.toString());
				}
			}
			// Export all tables in db
			wd.execute({
				db : config.db,
				sql : "SELECT tbl_name FROM sqlite_master WHERE type='table';",
				success : function(results) {
					if (results.rows) {
						// First count the outstanding tables
						var tbl_name;
						for (var i = 0; i < results.rows.length; i++) {
							tbl_name = results.rows.item(i)["tbl_name"];
							if (tbl_name.indexOf('__WebKit') !== 0 && tbl_name != 'sqlite_sequence' ) 
									// skip
									// webkit
									// internals
								config.outstanding.push(tbl_name);
						}
						// Then export them
						for (var i = 0; i < config.outstanding.length; i++) {
							config.table = config.outstanding[i];
							wd.exportTable(config);
						}
					}
				},
				error : function(err) {
					if (typeof (error) === "function")
						error(transaction, err);
				}
			});
		}
	};

	wd.open = function(config) {
		if (!config)
			throw new Error('Please use a config object');
		if (!config.database)
			throw new Error('Please define a config database name.');
		return window.openDatabase(config.database, config.version || '1.0',
				config.info || '', config.dbsize || 512000);
	};

	// Helper method for executing SQL code in DB
	wd.execute = function(config) {
		if (!config)
			throw new Error('Please use a config object');
		if (!config.db)
			throw new Error('Please define a db obj to execute against');
		if (!config.sql)
			throw new Error('Please define some sql to execute.');
		config.db.transaction(function(transaction) {
			transaction.executeSql(config.sql, config.params || [], function(
					transaction, results) {
				if (typeof (config.success) === "function")
					config.success(results);
			}, function(transaction, err) {
				// console.error(config.sql);
				if (typeof (config.error) === "function")
					config.error(err);
			});
		});
	};

	window.websqldump = {
		export : function() {
			wd.export.apply(wd, arguments);
		}
	};



	
function create_database(DBName, sql, pon_create_db_done) {
	
	// Creazione del database
	if (wd) {
		
		GLImportedDBInfo = '';
		
		console.log("create_database():sql:"+sql.length);
		
		var config = wd.config;
		config.database = DBName;
		config.db = wd.open(config);
		config.db.transaction(function (tx) {
			try {
				tx.executeSql('DROP TABLE IF EXISTS settings',[],webDBonSuccess,webDBonError);
				tx.executeSql('DROP TABLE IF EXISTS users',[],webDBonSuccess,webDBonError);
				tx.executeSql('DROP TABLE IF EXISTS languages',[],webDBonSuccess,webDBonError);
				tx.executeSql('DROP TABLE IF EXISTS alarms',[],webDBonSuccess,webDBonError);
				tx.executeSql('DROP TABLE IF EXISTS events',[],webDBonSuccess,webDBonError);
				tx.executeSql('DROP TABLE IF EXISTS work_set',[],webDBonSuccess,webDBonError);
				tx.executeSql('DROP TABLE IF EXISTS session',[],function(results) {
					var sql_array = sql.split(';##');
					var errors = 0, executed = 0, done_items = 0, num_items = sql_array.length;
					
					GLImportedDBInfo += sql.length+" bytes of data"+"<br>"+num_items+" statements rows"+"<br>"
					
					for (var i=0; i<num_items; i++) {
						if (sql_array[i]) {
							var sqlSTMT = sql_array[i]; 
							tx.executeSql(sqlSTMT,[],
									function(tx, r) {							
										executed++;
										done_items++;
										if (done_items >= num_items) {											
											if (pon_create_db_done) {
												pon_create_db_done();
											} else {
												on_create_db_done();
											}
										}
									}, function(tx, err, sqlSTMT) {
										var err = "create_database() FAILED : code:" + err.code + " - " + err.message+"\n\n";
										// alert(err);
										console.error(err);
										// console.error(sql_array[i]);
										errors++;
										done_items++;
										if (done_items >= num_items) {											
											if (pon_create_db_done) {
												pon_create_db_done();
											} else {
												on_create_db_done();
											}
										}
									}
							);
						} else {
							done_items++;
						}
					}
					
					if (errors) {
						alert("create_database() "+errors+" ERROR(S)");
					}
					if (executed) {
						if (pon_create_db_done) {
							pon_create_db_done();
						} else {
							on_create_db_done();
						}
					}
					
				},webDBonError);

			} catch(e) {
				alert(e);
			}
		}, webDBonError);
		
	} else {
		GLImportedDBInfo = 'NO WD!';
	}
}

function on_create_db_done () {
	alert("create DB done");
}
	



function dump_database(DBName, pdump_database_done) {
	
	// dump del database
	if (wd) {
		var config = wd.config;
		config.database = DBName;
		config.table = null;
		config.spliter = '##';
		config.sql = null;
		config.exportSql = null;
		config.success = pdump_database_done ? pdump_database_done:dump_database_done;
		
		wd.export(config);
	}
}



function dump_database_done (sql) {
	// console.log(sql);
	// alert(sql);
	var zippedSql = Iuppiter.compress(sql);
	var zippedSqlb64 = window.btoa(zippedSql);
	var jsonDB = JSON.stringify(zippedSql);
	
	alert("DB size:"+sql.length+" - zipped DB size:"+zippedSql.length+" - zippedB64 DB size:"+zippedSqlb64.length+" - B64:"+window.btoa(sql).length+" - json:"+jsonDB.length);
	
}
