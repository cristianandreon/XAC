var GLDebug = 0;

var GLxmlhttp = new XMLHttpRequest();
var GLxmlhttp_busy = false;


        
function do_read_url ( url, post_data, div_obj, bAsync ) {
    
    try {     
    
    	if (GLxmlhttp_busy)
    		return 0;
    	
    	var resultText = "";
        GLxmlhttp_busy = true;
        
        if (bAsync) {
        	GLxmlhttp.onreadystatechange = function() {
        		xmlhttp_default_callback(GLxmlhttp, div_obj);
            	};
        	} else {
            	GLxmlhttp.onreadystatechange = null;
        	}
                
    	GLxmlhttp.onerror = function(e) {
    		// console.error("An error occurred during the transaction:");
        	};
        	
        GLxmlhttp.open(post_data?"POST":"GET", url, bAsync);
        // GLxmlhttp.setRequestHeader( "If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT" );
        // GLxmlhttp.setRequestHeader( "Origin", "xProject UI" );
        if (post_data) {
        	GLxmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        } else {
        }
    	GLxmlhttp.send(post_data?post_data:'');

        if (bAsync) {
        } else {
            if (GLxmlhttp.status == 200) {
            	try {
		       		 if(div_obj) {
		    			 div_obj.innerHTML = GLxmlhttp.responseText;
	                } else {
	                	alert ('do_read_url : server error : '+GLxmlhttp.status);
	                }            
            	} catch (error) {
            		alert ('do_read_url : error : ' + error);
            	}
            }
        }
        
	} catch (error) {
    	if (div_obj)
    		div_obj.innerHTML = "<center><div style=\"color:darkRed\"><h2>"+error+"</h2></div></center>";
		alert ('do_read_url : error : ' + error);
	}

	GLxmlhttp_busy = false;

	return 1;    
}


function xmlhttp_default_callback(GLxmlhttp, div_obj) {  
    try {
        if (GLxmlhttp.readyState == 4) {
        	 if (GLxmlhttp.status == 200) {
        		 if(div_obj)
        			 div_obj.innerHTML = GLxmlhttp.responseText;
        	 } else {
        		 div_obj.innerHTML = "<center><div style=\"color:Red\"><h2>HTML Status Error : <b>"+GLxmlhttp.status+"</b></h2></div></center>";
        	 }
        	 // delete GLxmlhttp;
        }    
    
    } catch (error) {
    	alert ('xmlhttp_default_callback : error : ' +error);
    }    
}



function init_services() {
	reload_services();
}


function reload_services() {
    var addr = document.getElementById("addr");
    if (addr) {
    	if (addr.value > 0 && addr.value < 256) {
	    	GLServerIP = 'http://'+'192.168.1.'+addr.value;
	    	var url = GLServerIP+":8080/";
	
			var obj = document.getElementById("serviceHTTPframe");
			if (obj) {
				obj.src = url; 
			} else {
	    	}
	    }	
	}
}

