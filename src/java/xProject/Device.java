/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package xProject;

import javax.websocket.Session;

/**
 *
 * @author root
 */

public class Device {
    
    public boolean isMachine;
    public String assisterName;
    public String assisterSerialNum;

    public String machineName;
    public String machineSerialNum;
    public String status;
    
    public int Id;
    public Session session;
    public WebsocketServer websocketServer;
    
}
