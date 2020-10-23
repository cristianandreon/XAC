



var GLTargetObj = null;
var GLTargetObjType = null;
var GLTargetObjValue = null;
var GLIntervalID = 0;
var GLfps = 30;

var GLKeyboardCanvas = null;
var GLKeyboardCtx = null,
    cell_size,
    border_size,
    GLDisplayChars = [],
    display_counter = 0,
    keysets = [ [], [] ],
    selset = 0,
    turbo_mode = 0,
    mouse = {
        x: 0,
        y: 0,
        down: 0
    };



function start_edit_session(obj) { 
	// obj.type = "text";	
	obj.setAttribute('data-edit', '1');	
}

function stop_edit_session(obj) { 
	// obj.type = "text";	
	obj.setAttribute('data-edit', '');	
}


function keyboard_click_handler(obj) { 
	var rect = obj.getBoundingClientRect();
	GLTargetObj = obj;
	
	GLTargetObjType = obj.type;
	obj.type = "text";	
	GLTargetObj.setAttribute('data-edit', '1');	
	GLTargetObjValue = obj.value;
	
	GLDisplayChars = [];
	for (i=0; i<obj.value.length; i++) {
		GLDisplayChars.push(obj.value.charAt(i));
	}
	obj.value="";
	GLKeyboardCanvas.style.position="";
	GLKeyboardCanvas.style.marginLeft = rect.left+'px';
	GLKeyboardCanvas.style.marginTop = (rect.bottom+3)+'px';	
	// alert("Coordinates: " + rect.left + "px, " + rect.top + "px");	);
	GLKeyboardCanvas.parentNode.style.display='block';
	GLIntervalID = setInterval(loop, 1000/GLfps);
	}

function keyboard_dismiss_handler(ok) { 
	GLKeyboardCanvas.parentNode.style.display='none';
	clearInterval(GLIntervalID);

	if(GLTargetObj) {
		GLTargetObj.type = GLTargetObjType;
		// A carico della funzione che aggiorna la COntrol Unit
		// GLTargetObj.setAttribute('data-edit', '');
	}
		
	if(ok) {
		if(GLTargetObj) {
			GLTargetObj.value = GLDisplayChars.join("");
			var event = document.createEvent("HTMLEvents");
			event.initEvent("change",true,false);
			GLTargetObj.dispatchEvent(event);
		}
		
	} else {
		if(GLTargetObj)
			GLTargetObj.value = GLTargetObjValue;
	}
	GLTargetObj = null;	
}


function init_keyboard() {
	GLTargetObj = document.getElementById("display");
	GLKeyboardCanvas = document.getElementById("keyboard_canvas");
	GLKeyboardCtx = GLKeyboardCanvas.getContext("2d"),
    cell_size,
    border_size,
    GLDisplayChars = [],
    display_counter = 0,
    keysets = [ [], [] ],
    selset = 0,
    turbo_mode = 0,
    mouse = {
        x: 0,
        y: 0,
        down: 0
    };
}


function link_keyboard(className) {

	GLKeyboardCanvas.parentNode.style.zIndex = 999;
	GLKeyboardCanvas.style.zIndex = -1;
	GLKeyboardCanvas.parentNode.addEventListener('click', function(){ keyboard_dismiss_handler(false); }, false);
	GLKeyboardCanvas.parentNode.style.width="100%";
	GLKeyboardCanvas.parentNode.style.height="100%";
	
	GLKeyboardCanvas.addEventListener('click', function(){ event.stopPropagation(); }, false);
	 
	var class_list = Array(className, "uiVar", "searchText");
	
	for (iclass=0; iclass<class_list.length; iclass++) {
		var controlUnitVars = document.getElementsByClassName(class_list[iclass]);

		for (var j = 0; j < controlUnitVars.length; j++) {
			
			if (controlUnitVars[j].tagName == 'INPUT') {
				if (controlUnitVars[j].type == 'number' || controlUnitVars[j].type == 'text' || controlUnitVars[j].type == 'password' || controlUnitVars[j].type == 'file' || controlUnitVars[j].type == 'search') {
					if (!controlUnitVars[j].readOnly) {
						// console.log("keyboard linked to "+controlUnitVars[j].id);
					  	if (!GLIsRemoteSide) {
					  		controlUnitVars[j].addEventListener('click', function(){ keyboard_click_handler(this); }, false);
					  	} else {
					  		controlUnitVars[j].addEventListener('click', function(){ start_edit_session(this); }, false);			  		
					  		controlUnitVars[j].addEventListener('blur', function(){ stop_edit_session(this); }, false);
					  	}
						/* controlUnitVars[j].append(function() { keyboard_click_handler(this); }); */
					}
				}
			}
		}	
	}
}


/* Functions */
function char_inserter(chr){
    return function(){
        GLDisplayChars.push(chr);
    };
}
function char_remove(){
    GLDisplayChars.pop();
}
function display_clear(){
    GLDisplayChars = [];
}
function display_render(s){
    var interval = 60 / 3;
    if(GLTargetObj)
		GLTargetObj.value = s.join("");
    display_counter = (++display_counter) % interval;
    if(display_counter < interval / 2){
        if(GLTargetObj)
			GLTargetObj.value += "_";
    }
}

function init(chars){
    var i, j, k, chr;
    for(i = 0; i < chars.length; i++){
        for(j = 0; j < chars[i].length; j++){
            for(k = 0; k < chars[i][j].length; k++){
                chr = chars[i][j][k];
                if(chr != ' '){
                    keysets[i].push(new Key(k, j, 1, 1, chr, char_inserter(chr)));
                }
            }
        }
    }
    var k_backspace = new Key(11, 0,  4, 1, "Backspace", char_remove           	),
        k_tab       = new Key(12, 1,  3, 1, "Tab",       char_inserter("    ") 	),
        k_enter     = new Key(12, 2,  3, 1, "Enter",     set_return() 			),
        k_shiftup   = new Key(12, 3,  3, 1, "Shift",     set_shifter(1)        	),
        k_shiftdn   = new Key(12, 3,  3, 1, "Shift",     set_shifter(0)        	),
        k_space     = new Key( 0, 4,  9, 1, "Space",     char_inserter(' ')    	),
        k_turbo     = new Key( 9, 4,  3, 1, "Cancel",     key_cancel          	),
        k_clear     = new Key(12, 4,  3, 1, "Clear",     display_clear         	);

    keysets[0].push(k_backspace, k_tab, k_enter, k_shiftup, k_space, k_turbo, k_clear);
    keysets[1].push(k_backspace, k_tab, k_enter, k_shiftdn, k_space, k_turbo, k_clear);
}


function key_runner(key){
    return function(){
        var x = key.x * cell_size,
            y = key.y * cell_size,
            w = key.width * cell_size,
            h = key.height * cell_size,
            b = border_size;

        GLKeyboardCtx.fillStyle = "#ffffff";
        GLKeyboardCtx.fillRect(x, y, w, h);

        GLKeyboardCtx.beginPath();
        GLKeyboardCtx.rect(x + b, y + b, w - (b * 2), h - (b * 2));

        if(GLKeyboardCtx.isPointInPath(mouse.x, mouse.y)){
            GLKeyboardCtx.fillStyle = "#eeeeff";
            if(mouse.down){
                this.click();
                if(!turbo_mode){
                    mouse.down = 0;
                }
            }
        } else {
            GLKeyboardCtx.fillStyle = "#ddddee";
        }
        
        GLKeyboardCtx.closePath();
        GLKeyboardCtx.fillRect(x + b, y + b, w - (b * 2), h - (b * 2));
        GLKeyboardCtx.fillStyle = "#000000";
        GLKeyboardCtx.font = "" + (cell_size / 2) + "pt Calibri";
        GLKeyboardCtx.textBaseline = "middle";
        GLKeyboardCtx.textAlign = "center";
        GLKeyboardCtx.fillText(this.label, x + (w / 2), y + (h / 2));
    };
}

function loop(){
    GLKeyboardCtx.clearRect(0, 0, GLKeyboardCanvas.width, GLKeyboardCanvas.height);
    var i;
    for(i = 0; i < keysets[selset].length; i++)
        keysets[selset][i].run();
    display_render(GLDisplayChars);
}

function mouse_button(evt){
    mouse.down = (evt.type == "mousedown");
    return;
}

function mouse_move(evt){
    mouse.x = evt.clientX - GLKeyboardCanvas.offsetLeft;
    mouse.y = evt.clientY - GLKeyboardCanvas.offsetTop;
}


function set_return(){
    return function(){
    	keyboard_dismiss_handler(true);
    };
}


function set_shifter(set){
    return function(){
        selset = set;
    };
}

function key_toggle(){
    mouse.down = 0;
}

function key_cancel(){
	keyboard_dismiss_handler(false);
}


/* Classes */
function Key(x, y, width, height, label, click){
    this.x      = x;
    this.y      = y;
    this.width  = width;
    this.height = height;
    this.label  = label;
    this.click  = click;
    this.run    = key_runner(this);
}




/* Main */
(function main(args){
	
	init_keyboard();
	
    cell_size = args.cell_size;
    border_size = args.border_size;
    GLKeyboardCanvas.width = args.width * cell_size;
    GLKeyboardCanvas.height = args.height * cell_size;
    
    args.body.addEventListener("mousemove", mouse_move,   0);
    args.body.addEventListener("mousedown", mouse_button, 0);
    args.body.addEventListener("mouseup",   mouse_button, 0);
    init(args.chars);
})

/* Arguments */
({
    fps: GLfps,
    width: 15,
    height: 5,
    cell_size: 40,
    border_size: 1,
    chars: [
        [
            "`1234567890 ",
            "qwertyuiop[]",
            "asdfghjkl;'\\",
            "zxcvbnm,./-="
        ],
        [
            "~!@#$%^&*()",
            "QWERTYUIOP{}",
            "ASDFGHJKL:\"|",
            "ZXCVBNM<>?_+"
        ]
    ],
    body: document.body
});
