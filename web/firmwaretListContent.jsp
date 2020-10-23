<%-- 
    Document   : ...
    Created on : Jul 5, 2017, 9:36:41 PM
    Author     : root
--%>

<%@page import="xProject.xUtility"%>

<%
    xUtility.get_abs_path(request);

    String debug = request.getParameter("debug"); 
    String MacAddr = request.getParameter("MacAddr"); 
    String connectedMachineSN = ( (MacAddr != null && !MacAddr.isEmpty()) ? MacAddr : xProject.WebsocketServer.connectedMachineSN);
            
    xProject.WebsocketServer.firmwares.readFirmwares(connectedMachineSN);

    int nFrm = xProject.WebsocketServer.firmwares.firmwareList.size();

    out.print("<script type=\"text/javascript\" language=\"javascript\">\n"
        +"function select_firmware(file_name) {\n"            
        +"  parent.postMessage('frmFileUrl='+'/Firmwares/'+file_name, '*');\n"
        +"}</script>");

    /*
        +"  var frmHTTPservice = window.parent;\n"
        +"  if (frmHTTPservice) {\n"
        +"      try {\n"
        +"          if (frmHTTPservice.contentWindow) {\n"
        +"              frmHTTPservice.contentWindow.postMessage('frmFileUrl='+'/Firmwares/'+file_name, '*');\n"
        +"          }\n"
        +"      } catch (e) { console.error(e); } \n"
        +"      try {\n"
        +"          if (frmHTTPservice.postMessage) {\n"
        +"              frmHTTPservice.postMessage('frmFileUrl='+'/Firmwares/'+file_name, '*');\n"
        +"          }\n"
        +"      } catch (e) { console.error(e); } \n"
        +"  }\n"
    
    */
    
        
    out.print("<div style=\"font-family: tahoma;\">");
        
        
    if (connectedMachineSN == null || connectedMachineSN.isEmpty()) {
        out.print("<div style=\"font-size:85%; color: darkRed; background-color:lightGray; padding: 7px;\">No machine address</div>");
    } else {
        out.print("<div style=\"color: darkRed; background-color:lightGray\">Machine " + connectedMachineSN + " : " + nFrm + " firmware available(s)</div>");
    }
    
    if (xProject.WebsocketServer.firmwares.error != null && !xProject.WebsocketServer.firmwares.error.isEmpty()) {
        out.print("<div style=\"font-size:95%; color: darkRed; background-color:lightGray\">Error:" + xProject.WebsocketServer.firmwares.error + "</div>");
    }

    if (nFrm<=0) {
        if (xProject.WebsocketServer.firmwares.folder != null && !xProject.WebsocketServer.firmwares.folder.isEmpty()) {
            if (debug != null && !debug.isEmpty()) {
                if (debug.equalsIgnoreCase("1")) {
                    out.print("<div style=\"font-size:95%; color: darkRed; background-color:lightGray\">Folder:" + xProject.WebsocketServer.firmwares.folder + "</div>");
                }
            }
        }
    }
            
    out.print("<table cellpadding=3 cellspacing=0 style=\"width:100%; text-align: left; border: 1px solid gray; \">");
    
    if (nFrm>0) {
        out.print("<thead>");
        out.print("<tr style=\"background-color:lightGray; color: darkRed; border-bottom: 1px solid lightGray; \">");
        out.print("<th style=\"width:20px; height: 19px;\"><span>#</span></th>");

        out.print("<th><span>Firmware</span></th>");
        out.print("<th style=\"width:90px; \"><span>Date</span></th>");
        out.print("<th style=\"width:60px; \"><span>Size</span></th>");
        out.print("<th style=\"width:20px; \"></th>");
        out.print("</tr>");
        out.print("</thead>");
    
        for (int i = 0; i < nFrm; i++) {
            xProject.Firmware firmware = xProject.WebsocketServer.firmwares.firmwareList.get(i);

            out.print("<tr style=\"border-bottom:1px solid gray; color: darkRed; border-bottom: 1px solid lightGray;\">");
            out.print("<td style=\"width:20px; height: 19px;\">" + (i + 1) + "</td>");

            if (firmware.version != null) {
                if (firmware.fileName != null) {
                    out.print("<td><span style=\"font-size:80%\"><b>" + firmware.fileName + "</b></span></td>");
                    out.print("<td style=\"width:90px; \"><span style=\"font-size:70%\">" + firmware.fileDate + "</span></td>");
                    out.print("<td style=\"width:60px; \"><span style=\"font-size:60%\">" + firmware.fileSize + "</span></td>");
                    out.print("<td style=\"width:20px; \"><input id=\"row.\"" + (i + 1) + " value=\">\" type=\"button\" onclick=\"select_firmware('" + (firmware.fileName != null ? firmware.fileName : "") + "');\" /></td>");
                } else {
                }
            } else {
            }
            out.print("</tr>");
        }
    }

    out.print("</table>");

    out.print("</div>");

%>
