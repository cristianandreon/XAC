/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package xProject;

import java.util.ArrayList;
import javax.websocket.Session;

/**
 *
 * @author root
 */
public class WebsocketSessions {
    
    public ArrayList<Device> devices = new ArrayList();
    
    
    public Device addDevice (Session peer, WebsocketServer websocketServer) {
        Device device = new Device();
        device.session = peer;
        device.websocketServer = websocketServer;
        devices.add(device);
        return device;
    }
    
    public boolean removeDevice (Session peer) {
        for (Device device : devices) {
            if (device.session == peer) {
                devices.remove(device);
                return true;
            }
        }
        return false;
    }

    public Device updateNames (Session peer, String name, String serialNumber, boolean endPoint) {
        for (Device device : devices) {
            if (device.session == peer) {
                if (endPoint) {
                    if (name != null)
                        device.machineName = name;
                    if (serialNumber != null)
                        device.machineSerialNum = serialNumber;
                    // System.out.print("T name="+name+" - serialNumber:"+serialNumber);
                    device.isMachine = true;
                    return device;
                } else {
                    if (name != null)
                        device.assisterName = name;
                    if (serialNumber != null)
                        device.assisterSerialNum = serialNumber;
                    // System.out.print("C name="+name+" - serialNumber:"+serialNumber);
                    device.isMachine = false;
                    return device;
                }
            }
        }
        return null;
    }
    
    
    public Device getAssisterDevice (String serialNumber) {
        for (Device device : devices) {
            if (!device.isMachine) {
                if (device.assisterSerialNum != null) {
                    if (device.assisterSerialNum.equals(serialNumber)) {
                        return device;
                    }
                }
            }
        }
        return (Device)null;
    }

    public Device getLinkedAssisterDevice (String machineSerialNumber) {
        for (Device device : devices) {
            if (!device.isMachine) {
                if (device.machineSerialNum != null) {
                    if (device.machineSerialNum.equals(machineSerialNumber)) {
                        return device;
                    }
                }
            }
        }
        return (Device)null;
    }

    public Device getMachineDevice (String serialNumber) {
        for (Device device : devices) {
            if (device.isMachine) {
                if (device.machineSerialNum != null) {
                    if (device.machineSerialNum.equals(serialNumber)) {
                        return device;
                    }
                }
            }
        }
        return (Device)null;
    }
    
}


