<%-- 
    Document   : ...
    Created on : Jul 5, 2017, 9:36:41 PM
    Author     : root
--%>


<table class="tableClass" align="center" cellpadding=0 cellspacing=0 style="width: 100%; height:auto; border:1px solid lightGray;">
    <thead>
        <tr>
            <th class="varRowBK" colspan="4">
                Machine connected list (<% out.print(xProject.WebsocketServer.sessions.devices.size()); %>)
            </th>
            <th class="varRowBK" colspan="1">
                <img src="update.png" onclick="window.location.reload();" style="" />
            </th>
            <th class="varRowBK" colspan="1" style="width:32px !important">
                <img src="hide.png" onclick="show_hide_left_frame(this)" style="" />
            </th>
            </rt>
    </thead>
    <thead>
        <tr>
            <th class="varRowBK" style="width:60px;">
                Connect
            </th>
            <th class="varRowBK" style="width:20px;">
                #
            </th>
            <th class="varRowBK" style="width:110px;">
                Machine
            </th>
            <th class="varRowBK" style="width:90px;">
                Serial Number
            </th>
            <th class="varRowBK" style="width:auto">
                Remote host
            </th>
            <th class="varRowBK" style="width:1em">
            </th>
        </tr>
    </thead>
    <tbody>

        <%
            int n = xProject.WebsocketServer.sessions.devices.size();
            
            xProject.WebsocketServer.connectedMachineSN = null;
            
            for (int i = 0; i < n; i++) {
                xProject.Device device = xProject.WebsocketServer.sessions.devices.get(i);

                out.print("<tr>");
                out.print("<td class=\"varRow\" style=\"width:85px;\">");

                if (device.isMachine) {
                    // Macchina
                    if (device.machineSerialNum != null) {
                        if (device.websocketServer.targetDevice == null) {
                            out.print("<input id=\"row.\"" + (i + 1) + " value=\"connect\" type=\"button\" onclick=\"start_service('" + (device.assisterName != null ? device.assisterName : "") + "','" + (device.machineSerialNum != null ? device.machineSerialNum : "") + "');\" />");
                        } else {
                            // connesso
                            out.print("<table class=\"nd\">");
                            // out.print("<tr><td><span style=\"color: blue;\">" + (device.status != null ? device.status : "") + "</span></td></tr>");
                            out.print("<tr><td><span style=\"color: blue; font-size:85%\">");
                            out.print("<input id=\"row.\"" + (i + 1) + " value=\"close\" type=\"button\" onclick=\"stop_service('" + (device.assisterName != null ? device.assisterName : "") + "','" + (device.machineSerialNum != null ? device.machineSerialNum : "") + "');\" />");
                            // out.print( (device.websocketServer.targetDevice.machineName != null ? device.websocketServer.targetDevice.machineName : "???") );
                            out.print("</span></td></tr></table>");
                            xProject.WebsocketServer.connectedMachineSN = device.machineSerialNum;
                        }
                    } else {
                        out.print("<span style=\"color: red;\">[ERROR:No SerialNumer]</span>");
                    }
                } else {
                    // Assistente
                    out.print("<span style=\"color: navy;\">" + (device.websocketServer.targetDevice != null ? device.websocketServer.targetDevice.status : "") + "</span>");
                }

                out.print("</td>");
                out.print("<td class=\"varRow\" style=\"width:20px;\">");
                out.print(i + 1);
                out.print("</td>");
                out.print("<td class=\"varRow\" style=\"width:110px;\">");
                out.print(device.assisterName != null ? device.assisterName : "");
                out.print("</td>");
                out.print("<td class=\"varRow\" style=\"width:90px;\"><h4>");
                if (device.isMachine) {
                    out.print("<span style=\"color:blue\">" + (device.machineSerialNum != null ? device.machineSerialNum : "") + "</span>");
                } else {
                    out.print("<span style=\"color:navy\">" + (device.assisterSerialNum != null ? device.assisterSerialNum : "") + "</span>");
                }
                out.print("</h4></td>");
                out.print("<td class=\"varRow\" style=\"width:--120px;\">");
                out.print(device.machineName != null ? device.machineName : "");
                out.print("</td>");
                out.print("</tr>");
            }
        %>

    </tbody>
</table>

