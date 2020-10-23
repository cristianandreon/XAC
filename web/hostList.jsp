<%-- 
    Document   : index
    Created on : Jul 5, 2017, 9:36:41 PM
    Author     : root
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>



<!DOCTYPE html>
<!--
To change this license header, choose License Headers in Project Properties.
To change this template file, choose Tools | Templates
and open the template in the editor.
-->
<html>
    <head>
        <title>xProject Assist Center</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">



        <style type="text/css">

            html {overflow-y:hidden;height:100%;font-family:Calibri,Sans-serif; }
            body {overflow-y:hidden;height:100%; margin:0; padding:0;}

            .tableClass { padding: 5px; border: 1px solid lightgray; text-align:left; }
            .tableClass tr:nth-child(even) { background-color: rgba(94, 115, 140, 0.11);	}
            .tableClass tbody { display:block; height:300px; overflow-y: scroll; border-bottom: 1px solid #2196F3; border-top: 1px solid #2196F3; }
            .tableClass thead, .tableClass tfoot, .tableClass tbody tr { display:table; width:100%; table-layout: auto; }
            .tableClass thead, .tableClass tfoot { width: calc( 100% - 0em ) }
            .tableClass table { display:table; height: 500px; width:400px; }
            .nd table { width:auto; overflow:hidden; }

            .varRowBK { background-color:lightGray; padding-left:10px; font-size:13px; height:50px; }
            .varRow { padding-left:10px; font-size:11px; height:50px; }

        </style>

        <script lang="javascript">

            function start_service(assisterName, targetSN) {
                return window.parent.start_service(assisterName, targetSN);
            }

            function stop_service(assisterName, targetSN) {
                return window.parent.stop_service(assisterName, targetSN);
            }

            function refresh_content() {
                // Da implementare lettura AJAX delle hosts
                return;
            }

            function getEndPointDB(obj) {
                return window.parent.getEndPointDB(obj);
            }

            function getEndPointPages(obj) {
                return window.parent.getEndPointPages(obj);
            }

            function show_hide_left_frame(obj) {
                var objTopframe = window.parent;
                if (objTopframe) {
                    var leftUIframeDiv = document.getElementById("leftUIframeDiv");
                    var leftUIframeOver = document.getElementById("leftUIframeOver");
                    var leftFrame = objTopframe.document.getElementById("leftUIframeTD");
                    if (leftUIframeDiv && leftUIframeOver && leftFrame) {
                        if (obj.src.indexOf("hide.png") >= 0) {
                            leftFrame.style.width = "18px";
                            leftUIframeDiv.style.display = "none";
                            leftUIframeOver.style.display = "";
                        } else {
                            leftFrame.style.width = "30%";
                            leftUIframeDiv.style.display = "";
                            leftUIframeOver.style.display = "none";
                        }
                    }
                }
            }
            (this)

        </script>

    </head>
    <body>
        <div id="mainContent">
            <div id="leftUIframeOver" style="z-index:999; display:none; position:absolute; width:100%; height:100%; background-color:lightGray; vert-align:top; text-align:right; ">
                <img src="show.png" style="z-index:-1; width:16px; height:16px; margin-top: 7px; " onclick="show_hide_left_frame(this)" style="" />
            </div>
            <div id="leftUIframeDiv">

                <%@ include file="hostListContent.jsp" %>



                <table class="" align="center" cellpadding=0 cellspacing=0 style="width: 100%; border:1px solid lightGray;">
                    <tbody>
                        <tr>
                            <td class="" style="width:1em">
                                <div id="frmList" style="border: 1px solid gray; width:100%; height: 100px; overflow-y: scroll; ">

                                    <%@ include file="firmwaretListContent.jsp" %>

                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td class="" style="width:1em">
                                <div id="output" style="border: 1px solid gray; width:100%; height: 60px; overflow-y: scroll; "></div>
                            </td>
                        </tr>
                        <tr>
                            <td class="" style="width:1em">
                                <div id="buttons" style="test-align:center">
                                    <center><input id="donwloadDB" style="width:100%; height:40px;" value="Get Customer DB" type="button" onclick="getEndPointDB(this)"/></center>
                                </div>
                                <div id="buttons" style="test-align:center">
                                    <center><input id="donwloadPages" style="width:100%; height:40px;" value="Get Customer App" type="button" onclick="getEndPointPages(this)"/></center>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td class="" style="width:1em">
                                <%=xProject.WebsocketServer.absPath%>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
    </body>
</html>
