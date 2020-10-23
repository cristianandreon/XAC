<%-- 
    Document   : index
    Created on : Jul 5, 2017, 9:36:41 PM
    Author     : root
--%>

<!DOCTYPE html>

<%@page contentType="text/html" pageEncoding="UTF-8"
        import="javax.servlet.*"
        import="javax.servlet.http.*"
        import="javax.servlet.jsp.*"
        %>

<%@page import="xProject.xUtility"%>

<%
    xUtility.get_abs_path(request);
%>

<!DOCTYPE html>
<!--
To change this license header, choose License Headers in Project Properties.
To change this template file, choose Tools | Templates
and open the template in the editor.
-->
<html>
    <head>
        <title>xProject Remote Service Gateway</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">



        <style type="text/css">

            html {overflow-y:hidden;height:100%;font-family:Calibri,Sans-serif; }
            body {overflow-y:auto;height:100%; margin:0; padding:0;}

            .tableClass > { padding: 5px; border: 1px solid lightgray; text-align:left; }
            .tableClass > tr:nth-child(even) { background-color: rgba(94, 115, 140, 0.11);	}
            .tableClass > tbody { display:block; height:auto; overflow-y: scroll; border-bottom: 1px solid #2196F3; border-top: 1px solid #2196F3; }
            .tableClass > thead, .tableClass > tfoot, .tableClass > tbody tr { display:table; width:100%; table-auto; }
            .tableClass > thead, .tableClass > tfoot { width: calc( 100% - 0em ) }
            .tableClass > table { display:table; height: 500px; width:400px; }
            .nd table { width:auto; overflow:hidden; }

            .varRowBK { background-color:lightGray; padding-left:10px; font-size:13px; height:50px; }
            .varRow { padding-left:10px; font-size:11px; height:50px; }

        </style>

        <script lang="javascript">

            // For testing purposes
            var output = null;
            var GLClientWS = null;

            var GLRemoteConnectGatewayTest = false;

            var GLTargetName = "";
            var GLTargetSN = "";
            var GLClientName = "xProject assist center";
            var GLClientSN = "73.73.73.73.73.73";

            var GLStartServiceOnConnect = false;


            var GLRemoteConnectGateway = "cnconline.info";
            var GLRemoteConnectGatewayResource = "xProjectAssistCenter/wsServer";
            var GLRemoteConnectGatewayPort = 8080;

            var GLLeftFrameURL = "/xProjectAssistCenter/hostList.jsp";


            var GLRemoteConnectCheckInterval = null;
            var GLIsRemoteConnected = false;


            function close_connection() {
                if (GLClientWS)
                    GLClientWS.close();
                GLClientWS = null;
            }



            function open_connection() {

                if (!GLClientWS) {
                    var arr = document.location.host.split(":");

                    var wsUri = "ws://" + document.location.host + (arr.length < 2 ? ":8080" : "") + "/xProjectAssistCenter/wsServer";
                    // var wsUri = "ws://" + (GLRemoteConnectGatewayTest ? "192.168.1.111" : GLRemoteConnectGateway) + ":" + GLRemoteConnectGatewayPort + "/" + GLRemoteConnectGatewayResource;

                    writeToScreen("Connecting to " + wsUri);

                    GLClientWS = new WebSocket(wsUri);

                    if (GLClientWS) {
                        GLClientWS.onerror = function (evt) {
                            try {
                                if (document.getElementById("remoteUIframe").contentWindow.on_remote_error) {
                                    document.getElementById("remoteUIframe").contentWindow.on_remote_error(GLClientWS);
                                }
                            } catch (e) {
                                alert(e);
                            }
                            writeToScreen('<span style="color: red;">ERROR:</span> ' + evt.data);
                        };

                        GLClientWS.onopen = function (evt) {
                            writeToScreen("Connected");

                            GLClientWS.send("&aName=" + GLClientName);
                            GLClientWS.send("&SN=" + GLClientSN);

                            if (GLStartServiceOnConnect) {
                                GLStartServiceOnConnect = false;
                                if (GLTargetSN)
                                    start_service_II(GLTargetName, GLTargetSN);
                            }


                            objIframe = document.getElementById("leftUIframe");
                            if (leftUIframe) {
                                if (leftUIframe.src != GLLeftFrameURL) {
                                    leftUIframe.src = GLLeftFrameURL;
                                } else {
                                    // Aggiornato in seguito da refresh_host_list();
                                    // leftUIframe.window.location.reload();
                                }
                            }

                            if (!GLRemoteConnectCheckInterval)
                                GLRemoteConnectCheckInterval = setInterval('remote_connection_check()', 60 * 1000);

                            // Test
                            // content_read_loop();
                        };

                        GLClientWS.onclose = function (evt) {
                            try {
                                if (document.getElementById("remoteUIframe").contentWindow.on_remote_close) {
                                    document.getElementById("remoteUIframe").contentWindow.on_remote_close(GLClientWS);
                                }
                            } catch (e) {
                                alert(e);
                            }
                            writeToScreen("Connection closed [" + evt.reason + "]");
                        };

                        GLClientWS.onmessage = function (e) {
                            // writeToScreen(evt.data);
                            var keyCHar = e.data ? e.data[0] : 0;
                            if (keyCHar == '^') {
                                keyCHar = e.data ? e.data[1] : 0;
                                if (keyCHar == '^') {

                                    if (e.data.substring(2, 14) == "[reloadHost]" ||
                                            e.data.substring(2, 16) == "[disconnected]" ||
                                            e.data.substring(2, 15) == "[reconnected]" ||
                                            e.data.substring(2, 13) == "[connected]"
                                            ) {
                                        ///////////////////////////////////////////
                                        // Ricaricamento elenco host
                                        //
                                        setTimeout("refresh_host_list();", 100);
                                    }

                                    if (e.data.substring(2, 13) == "[connected]") {
                                        GLIsRemoteConnected = true;
                                    } else if (e.data.substring(2, 15) == "[reconnected]") {
                                        GLIsRemoteConnected = true;
                                    } else if (e.data.substring(2, 16) == "[disconnected]") {
                                        GLIsRemoteConnected = false;
                                    } else if (e.data.substring(2, 14) == "[reloadHost]") {
                                    } else {
                                        alert("undetected center message : " + e.data);
                                    }
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
                                        // 
                                        // 
                                        // Verifica se l'app è carica ...per poter creare il DB

                                        var objIframe = document.getElementById("remoteUIframe");
                                        if (objIframe) {
                                            if (objIframe.contentWindow.create_database == 'function') {
                                                create_database(GLDBName, e.data.substring(10), function () {
                                                    if (window.parent.document) {
                                                        if (window.parent.writeToScreen) {
                                                            window.parent.writeToScreen("DB download done..." + GLImportedDBInfo);
                                                        }
                                                    }
                                                    alert("Database successfully created...\n\nConfirm page reload to apply changes");
                                                    window.location.reload();
                                                });
                                            } else {
                                                alert("In order to create DB you should before download the App");
                                            }
                                        } else {
                                            alert("In order to create DB you should before download the App...frame is missing");
                                        }

                                    } else if (e.data.substring(2, 13) == "getPages()=") {
                                        //////////////////////////////////////////////
                                        // Creazione delle pagine della macchina a cura dell' Assist Center
                                        //
                                        if (window.parent.writeToScreen) {
                                            window.parent.writeToScreen("App download done...");
                                        }
                                        if (e.data.substring(13, 17) == "[OK]") {
                                            alert("App registered by xProject Assist Center...\n\n" + e.data.substring(17) + "\n\nConfirm page reload to apply changes");
                                            window.location.reload();
                                        } else {
                                            alert("UI Pages download FAILED:" + e.data.substring(15));
                                        }


                                    } else {
                                        alert("Undetected remote cmd ui reply : " + e.data.substring(2));
                                    }
                                } else {
                                    alert("Misformatted remote cmd ui reply : " + e.data.substring(1));
                                }
                            } else {
                                // Messaggio non gestito
                            }
                        };

                    } else {
                        writeToScreen('<span style="color: red;">NO WebSocket!</span>');
                    }
                }
            }



            ////////////////////////////////////////
            // Controllo connessione periodica
            //
            function remote_connection_check() {
                if (GLClientWS) {
                    if (GLClientWS.readyState != GLClientWS.OPEN &&
                            GLClientWS.readyState != GLClientWS.CONNECTING &&
                            GLClientWS.readyState != GLClientWS.CLOSING) {
                        GLClientWS.close();
                        GLClientWS = null;
                    } else {
                        GLClientWS.send("");
                    }
                }
            }



            function start_service(targetName, targetSN) {
                GLTargetName = targetName;
                GLTargetSN = targetSN;
                if (!GLClientWS) {
                    GLStartServiceOnConnect = true;
                    open_connection();
                } else {
                    start_service_II(targetName, targetSN);
                }
            }

            function start_service_II(targetName, targetSN) {

                if (GLClientWS) {

                    // caricamento pagine dell'endpoint
                    try {
                        var objIframe = document.getElementById("remoteUIframe");
                        if (objIframe) {
                            var uiPageURL = "/xProjectAssistCenter/" + targetSN + "/index.html?remote=1&remoteSN=" + targetSN;
                            if (objIframe.src != uiPageURL) {
                                objIframe.src = uiPageURL;

                                // Nun funzia!
                                // objIframe.contentDocument.body.addEventListener("load" , function() { alert("iframe loaded"); on_iframe_loaded(this); }, false);                                    
                                var inter = window.setInterval(function () {
                                    if (objIframe.contentWindow.document.readyState === "complete") {
                                        window.clearInterval(inter);
                                        // grab the content of the iframe here
                                        on_iframe_loaded(this);
                                    }
                                }, 100);
                            }
                        }
                    } catch (e) {
                        alert(e);
                    }

                    GLClientWS.send("&eName=" + GLTargetName);
                    GLClientWS.send("&eSN=" + GLTargetSN);

                    setTimeout("refresh_host_list();", 100);

                } else {
                    alert("start_service():no connection");
                }
            }



            function stop_service(targetName, targetSN) {
                if (GLClientWS) {

                    // caricamento pagine dell'endpoint
                    try {

                        GLTargetName = null;
                        GLTargetSN = null;

                        GLClientWS.send("&aStop");

                        // GLClientWS.close();
                        // GLClientWS = null;

                    } catch (e) {
                        alert(e);
                    }

                    try {
                        // esegue la callback di connessione remota aperta
                        var objFrame = document.getElementById("remoteUIframe");
                        if (objFrame)
                            if(objFrame.contentWindow.on_remote_close)
                                objFrame.contentWindow.on_remote_close();
                    } catch (e) {
                        alert(e);
                    }

                    setTimeout("refresh_host_list();", 100);

                } else {
                    alert("start_service():no connection");
                }
            }


            // Fine caricamento interfaccia UI
            function on_iframe_loaded(rootObj) {
                try {
                    // esegue la callback di connessione remota aperta
                    if (document.getElementById("remoteUIframe").contentWindow.on_remote_open) {
                        document.getElementById("remoteUIframe").contentWindow.on_remote_open(GLClientWS);
                    } else {
                    }
                } catch (e) {
                    alert(e);
                }
            }





            function refresh_host_list() {
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

            // Test
            function content_read_loop() {
                if (GLClientWS)
                    GLClientWS.send("!sys.time");
                setTimeout('content_read_loop()', 3000);
            }

            function writeToScreen(message) {
                objIframe = document.getElementById("leftUIframe");
                if (objIframe) {
                    output = objIframe.contentDocument.getElementById("output");
                    if (output)
                        output.innerHTML += message + "<br/>";
                }
            }

            function getEndPointDB(obj) {
                if (GLClientWS) {
                    var GLRemoteConnect = false;
                    objIframe = document.getElementById("remoteUIframe");
                    if (objIframe) {
                        GLRemoteConnect = objIframe.contentWindow.GLRemoteConnect;
                    }
                    if (GLIsRemoteConnected) {
                        if (!GLRemoteConnect)
                            GLRemoteConnect = 1;
                    }
                    if (GLRemoteConnect) {
                        writeToScreen("Downloading Customer's Database...<br/>");
                        // | = Pacchetto per la UI
                        GLClientWS.send("|getDB()");
                        obj.disabled = true;
                    } else {
                        alert("Please connect to any host");
                    }
                }
            }

            function getEndPointPages(obj) {
                if (GLClientWS) {
                    var GLRemoteConnect = false;
                    objIframe = document.getElementById("remoteUIframe");
                    if (objIframe) {
                        GLRemoteConnect = objIframe.contentWindow.GLRemoteConnect;
                    }
                    if (GLIsRemoteConnected) {
                        if (!GLRemoteConnect)
                            GLRemoteConnect = 1;
                    }
                    if (GLRemoteConnect) {
                        writeToScreen("Downloading Customer's Application...<br/>");
                        // | = Pacchetto per la UI
                        GLClientWS.send("|getPages()");
                        obj.disabled = true;
                    } else {
                        alert("Please connect to any host");
                    }
                }
            }


            function startup() {
                open_connection();
            }

        </script>
    </head>
    <body onload="startup()">
    <center><div style="font-size: 42px; font-style: italic; font-weight: 600; text-shadow: 3px 3px lightgrey;">xProject Assist Center<span style="font-size:45%; margin-left:10px;"> Ver.1.01</span></div></center>
    <table style="width: 99%; height: 100%; vertical-align: top;">
        <tr>
            <td id="leftUIframeTD" style="width:30%; vertical-align: top;">            
                <iframe id="leftUIframe" class="remoteUI" src="" style="height: 100%; width: 100%; display:block; border-radius: 11px 0px 0px 11px; ">
                    <p>Your browser does not support iframes.</p>
                </iframe>
            </td>
            <td style="height: 100%;">
                <iframe id="remoteUIframe" class="remoteUI" src="/xProjectAssistCenter/defaultPage.jsp" style="height: 100%; width: 100%; display:block; border-radius: 0px 11px 11px 0px; overflow:auto; ">
                    <p>Your browser does not support iframes.</p>
                </iframe>
            </td>
        </tr>
    </table>
</body>
</html>
