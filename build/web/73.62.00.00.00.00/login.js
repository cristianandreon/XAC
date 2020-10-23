

var GLLoginPending = false;
var GLLogoutPending = false;
var GLDefStatus = "Waiting autentication";

var GLLogin = { UserName:null, Password:null, Token:null, Status:GLDefStatus };


function login_refresh() {
	var userStatus = document.getElementById("userStatus");
	if(userStatus)
		userStatus.innerHTML = GLLogin.Status;
	
	var user = document.getElementById("UserName");
	var pass = document.getElementById("Password");
	var auto = document.getElementById("Autologin");
	var loginBt = document.getElementById("loginBt");
	var logoutBt = document.getElementById("logoutBt");

	if (GLLogin.Token) {
		user.disabled=true;
		pass.disabled=true;
		auto.disabled=true;
		loginBt.style.display='none';
		logoutBt.style.display='';
	} else {
		user.disabled=false;
		pass.disabled=false;
		auto.disabled=false;
		loginBt.style.display='';
		logoutBt.style.display='none';
	}	
}


function doLogin() { 
	
	var user = document.getElementById("UserName");
	var pass = document.getElementById("Password");
	var auto = document.getElementById("Autologin");
	var loginBt = document.getElementById("loginBt");
	var logoutBt = document.getElementById("logoutBt");
	var hasToken = false;
	
	if (loginBt)
		loginBt.disable = true; 
	
	if (user && pass && auto) {
		
		GLSettings.auto_login = auto.checked;
		
		if (auto.checked) {
			if (GLSettings.token) {
				hasToken = true;				
			}
		}
		
		if (hasToken) {
			GLLogin.UserName = user.value;
			GLLogin.Password = null;
			GLLogin.Token = GLSettings.token;
		} else {
			GLLogin.UserName = user.value;
			GLLogin.Password = pass.value;
			GLLogin.Token = null;
		}
		
		GLLoginPending = true;
		
		if (GLConnection) {
			if (GLConnection.readyState == GLConnection.OPEN) {
				loginBt.value = "Login";
			} else {
				loginBt.value = "Waiting for connectoin";
			}
		} else {
			loginBt.value = "Waiting for connectoin";
		}
		
	} else {
		alert("doLogin() : Missing login form items!");
	}
}



function doLogout() { 
	
	GLLogin.UserName = GLSettings.user_name;
	GLLogin.Password = null;
	GLLogin.Token = GLSettings.token = null;
	GLLogin.Status = GLDefStatus;
		
	onLoginFail();
	
	login_refresh();		
}


function onLoginDone() {
	var controlUnitVars = document.getElementsByClassName("cuVar");
	for (i = 0; i < controlUnitVars.length; i++) {
		if (controlUnitVars[i].id) {
			if (controlUnitVars[i].tagName=='INPUT') {
				if (controlUnitVars[i].type=='button') {
				} else {					
				}
				controlUnitVars[i].disabled = false;
			}
		}
	}	
}

function onLoginFail() {
	var controlUnitVars = document.getElementsByClassName("cuVar");
	for (i = 0; i < controlUnitVars.length; i++) {
		if (controlUnitVars[i].id) {
			if (controlUnitVars[i].tagName=='INPUT') {
				if (controlUnitVars[i].type=='button') {
				} else {					
				}
				controlUnitVars[i].disabled = true;
			}
		}
	}	
}

function users_manager() {
}


function user_status() {
	alert(GLLogin.Status)
}
