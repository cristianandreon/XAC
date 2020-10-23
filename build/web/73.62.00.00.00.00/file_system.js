
function read_file_sytem(folder) {

	try {

		// var myObject = new ActiveXObject("Scripting.FileSystemObject");

		window.webkitStorageInfo
				.requestQuota(
						PERSISTENT,
						1024 * 1024,
						function(grantedBytes) {

							window.requestFileSystem = window.requestFileSystem
									|| window.webkitRequestFileSystem;

							window
									.requestFileSystem(
											PERSISTENT,
											grantedBytes,
											function(fs) {

												var folder = '/';
												// var folder = window.location;
												// var folder =
												// ""+decodeURIComponent(document.URL.substr(0,document.URL.lastIndexOf('/')))+"";
												// var folder = 'file:///D:/';
												// var folder = 'MyPictures';

												console
														.warn("Reading folder : "
																+ folder);

												window.resolveLocalFileSystemURL = window.resolveLocalFileSystemURL
														|| window.webkitResolveLocalFileSystemURL;

												fs.root
														.getDirectory(
																"xProjectConfig",
																{
																	create : true
																},
																function(
																		newDirEntry) {
																	console
																			.log(newDirEntry);
																}, errorHandler);

												fs.root
														.getDirectory(
																folder,
																{
																	create : false
																},
																function(
																		dirEntry) {
																	var dirReader = dirEntry
																			.createReader();
																	dirReader
																			.readEntries(
																					function(
																							entries) {
																						console
																								.log('Directory: '
																										+ entries);
																						for (var i = 0; i < entries.length; i++) {
																							var entry = entries[i];
																							if (entry.isDirectory) {
																								console
																										.log('Directory: '
																												+ entry.fullPath);
																							} else if (entry.isFile) {
																								console
																										.log('File: '
																												+ entry.fullPath);
																							}
																						}
																					},
																					errorHandler);
																}, errorHandler);

											}, errorHandler);

						}, function(e) {
							console.log('Error', e);
						});

	} catch (e) {
		alert("read_file_sytem() : " + e + "");
	}
}

function errorHandler(e) {
	var msg = '';

	switch (e.code) {

	case 10:
		msg = 'QUOTA_EXCEEDED_ERR';
		break;
	case 1:
		msg = 'NOT_FOUND_ERR';
		break;
	case 2:
		msg = 'SECURITY_ERR';
		break;
	case 9:
		msg = 'INVALID_MODIFICATION_ERR';
		break;
	case 7:
		msg = 'INVALID_STATE_ERR';
		break;
	case 8:
		msg = 'SYNTAX_ERR';
		break;
	default:
		msg = 'Unknown Error';
		break;
	}
	;

	console.error('Error: ' + msg + " - " + e.message);
	// alert('Error: ' + msg+" - "+e.message);
}

function toArray(list) {
	return Array.prototype.slice.call(list || [], 0);
}

function listResults(entries) {
	// Document fragments can improve performance since they're only appended
	// to the DOM once. Only one browser reflow occurs.
	var fragment = document.createDocumentFragment();

	entries.forEach(function(entry, i) {
		var img = entry.isDirectory ? '<img src="folder-icon.gif">'
				: '<img src="file-icon.gif">';
		var li = document.createElement('li');
		// li.innerHTML = [img, '<span>', entry.name, '</span>'].join('');
		// fragment.appendChild(li);
	});

	alert(fragment); // document.querySelector('#filelist').appendChild();
}

function onInitFs(fs) {

	// alert("onInitFs()");

	var dirReader = fs.root.createReader();
	var entries = [];

	// Call the reader.readEntries() until no more results are returned.
	var readEntries = function() {
		dirReader.readEntries(function(results) {
			if (!results.length) {
				listResults(entries.sort());
			} else {
				entries = entries.concat(toArray(results));
				readEntries();
			}
		}, errorHandler);
	};

	readEntries(); // Start reading dirs.
}



class PAGES_DATA {
	
	constructor() {
		this.content = null;
		this.scriptsSrc = [];
		this.scriptsContent = [];
		this.scriptsSize = [];
		this.totSize = 0;
		this.imagesSrc = [];
		this.imagesContent = [];
		this.imagesSize = [];		
	}
}


function get_serialized_page_data(on_serialized_done) {
	if (on_serialized_done) {
		var PagesData = get_page_data();		
		var json = JSON.stringify(PagesData);
		on_serialized_done(json);
		return 1;
	}
	return 0;
}

function get_page_data() {
	
	PagesData = new PAGES_DATA();
	
	PagesData.content = '<head>' + document.getElementsByTagName('head')[0].innerHTML + '</head><body>' + document.body.innerHTML + '</body>';

	var httpRequest = new XMLHttpRequest();
	var scripts = document.getElementsByTagName("script")
	for (var i = 0; i < scripts.length; i++) {
		me = scripts[i];
		console.warn(me.src);
		httpRequest.onreadystatechange = function() {
			if (httpRequest.readyState === 4) {
				if (httpRequest.status === 200) {
					PagesData.scriptsSrc.push(httpRequest.responseURL);
					PagesData.scriptsContent.push(httpRequest.responseText);
					PagesData.scriptsSize.push(httpRequest.responseText.length);
					PagesData.totSize += httpRequest.responseText.length;
				} else if (httpRequest.status == 0) {
					PagesData.scriptsSrc.push(httpRequest.responseURL);
					PagesData.scriptsContent.push(httpRequest.responseText);
					PagesData.scriptsSize.push(httpRequest.responseText.length);
					PagesData.totSize += httpRequest.responseText.length;
				}
			}
		};

		try {
			httpRequest.open('GET', me.src, false);
			httpRequest.send();
		} catch(e) {
			alert("get_page_data() error : "+e+"");
		}
	}

	var images = document.getElementsByTagName("img")
	for (var i = 0; i < images.length; ++i) {
		me = images[i];
		console.warn(me.src);
		httpRequest.onreadystatechange = function() {
			if (httpRequest.readyState === 4) {
				if (httpRequest.status === 200) {
					PagesData.imagesSrc.push(httpRequest.responseURL);
					PagesData.imagesContent.push(httpRequest.responseText);
					PagesData.imagesSize.push(httpRequest.responseText.length);
					PagesData.totSize += httpRequest.responseText.length;
				} else if (httpRequest.status == 0) {
					PagesData.imagesSrc.push(httpRequest.responseURL);
					PagesData.imagesContent.push(httpRequest.responseText);
					PagesData.imagesSize.push(httpRequest.responseText.length);
					PagesData.totSize += httpRequest.responseText.length;
				}
			}
		};

		try {
			httpRequest.open('GET', me.src, false);
			httpRequest.send();
		} catch(e) {
			alert("get_page_data() error : "+e+"");
		}
	}

	return PagesData;
}