/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package xProject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.Writer;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.web.context.request.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

// HttpServletRequest request = ((ServletRequestAttributes)RequestContextHolder.getRequestAttributes()).getRequest();

/**
 *
 * @author root
 */
@ServerEndpoint("/wsServer")



// HttpServletRequest request = ((ServletRequestAttributes)RequestContextHolder.getRequestAttributes()).getRequest();

public class WebsocketServer {

    static public WebsocketSessions sessions = new WebsocketSessions();
    
    static public Firmwares firmwares = new Firmwares();

    static public String relativePath = null, absPath = null;
    
    static public String connectedMachineSN;
        
    public Session session = null;

    public boolean isMachine = false;

// N.B.: Riferimenti relativi : endpoint per l'endpoint è il client
    public Device sourceDevice = null;
    public Device targetDevice = null;
    
    

    @OnMessage
    // public String onMessage(ByteBuffer byteBuffer) {
    // public String onMessage(byte[] byteArray, boolean last, Session session) {
    public String onMessage(String message, Session session) {
        try {
            // if (byteArray != null && byteArray.length>0) {
            // String message = byteArray.toString();
            // System.out.println("[INFO] message=\'" + message + "'");

            /*
            if (byteBuffer != null) {
                String message = byteBuffer.toString();
             */
            if (message != null && !message.isEmpty()) {

                //////////////////////////////////////
                // Comandi ciave
                //
                if (message.charAt(0) == '&') {
                    if (message.regionMatches(true, 1, "aName=", 0, 6)) {
                        // Registra come client (centro assistenza)
                        isMachine = false;
                        sourceDevice = sessions.updateNames(session, message.substring(6 + 1), null, isMachine);
                        System.out.println("[INFO] aName= \'" + message.substring(6 + 1) + "' isMachine:" + isMachine + " " + this + " - sourceDevice:" + sourceDevice + " - targetDevice:" + targetDevice);
                        // return "[C"+message+"->"+serialNumber+"]";

                    } else if (message.regionMatches(true, 1, "mName=", 0, 6)) {
                        // endpoint (macchina) che imposta il target
                        isMachine = true;
                        sourceDevice = sessions.updateNames(session, message.substring(6 + 1), null, isMachine);
                        System.out.println("[INFO] mName= \'" + message.substring(6 + 1) + "' isMachine:" + isMachine + " " + this + " - sourceDevice:" + sourceDevice + " - targetDevice:" + targetDevice);
                        // return "[T"+message+"->"+name+"]";

                    } else if (message.regionMatches(true, 1, "eName=", 0, 6)) {
                        // client Che regisra il nome dell'isMachine (macchina)
                        if (sourceDevice != null) {
                            sourceDevice.machineName = message.substring(6 + 1);
                            System.out.println("[INFO] eName= \'" + message.substring(6 + 1) + "' isMachine:" + isMachine + " " + this + " - sourceDevice:" + sourceDevice + " - targetDevice:" + targetDevice);
                        }

                    } else if (message.regionMatches(true, 1, "aStop", 0, 5)) {
                        System.out.println("[INFO] Close connection ...isMachine:" + isMachine);
                        // Chiude senza rimuovere il peer : notifica la disconnessione all'altro capo
                        handle_close_event(null);

                    } else if (message.regionMatches(true, 1, "SN=", 0, 3)) {
                        System.out.println("[INFO] SN= \'" + message.substring(3 + 1) + "' isMachine:" + isMachine);
                        sessions.updateNames(session, null, message.substring(3 + 1), isMachine);
                        // return "[SN"+message+"->"+serialNumber+"]";
                        handle_set_serial_number(message.substring(3 + 1));

                    } else if (message.regionMatches(true, 1, "eSN=", 0, 4)) {
                        // Client che ivia le coorddinate per il collegamento all'endpoint
                        System.out.println("[INFO] eSN= \'" + message.substring(4 + 1) + "' isMachine:" + isMachine + " " + this);
                        handle_set_endpoint_serial_number(message.substring(4 + 1));

                    } else {
                        System.out.println("[ERROR] unrecognized message : " + message);
                    }

                    //////////////////////////////////////
                    // Risposta ai Messaggi per la UI
                    //
                } else if (message.charAt(0) == '|') {
                    if (message.charAt(1) == '|') {
                        if (message.regionMatches(true, 2, "getPages()=", 0, 11)) {
                            // Creazione delle pagine
                            create_ui_pages_from_string(session, message.substring(11 + 2));
                            handle_forward_nessage("||getPages()=[OK][Bytes processed:"+message.length()+"]");
                        } else {
                            // System.out.println("[INFO] Undetected Message= \'" + message + "' isMachine:" + isMachine + " " + this);
                            handle_forward_nessage(message);
                        }
                    } else {
                        // System.out.println("[INFO] Wrong Message= \'" + message + "' isMachine:" + isMachine + " " + this);
                        handle_forward_nessage(message);
                    }

                } else {
                    ///////////////////////
                    // Inoltro messaggio
                    //
                    handle_forward_nessage(message);
                }
            }

        } catch (IllegalStateException ex) {
            System.out.println("[ERROR] Connection broken... isMachine:" + isMachine);
            try {
                this.session.close();
            } catch (IOException ex1) {
                Logger.getLogger(WebsocketServer.class.getName()).log(Level.SEVERE, null, ex1);
            }

        } catch (Exception ex) {
            ex.printStackTrace(System.out);
        }
        return null;
    }

    @OnOpen
    public void onOpen(Session peer) {
        session = peer;
        sessions.addDevice(peer, this);
        targetDevice = null;
        sourceDevice = null;

        session.setMaxIdleTimeout(1*60*1000+5*1000);
        try {
            session.setMaxBinaryMessageBufferSize(2*1024*10242*1024);
            } catch (Exception ex1) {
                Logger.getLogger(WebsocketServer.class.getName()).log(Level.SEVERE, null, ex1);
            }
        try {
            session.setMaxTextMessageBufferSize(2*1024*10242*1024);
            } catch (Exception ex1) {
                Logger.getLogger(WebsocketServer.class.getName()).log(Level.SEVERE, null, ex1);
            }
    }

    @OnClose
    public void onClose(Session peer) {
        if (isMachine) {
            System.out.println("[INFO] isMachine \'" + sourceDevice.machineName + "\' disonnected from client \'" + sourceDevice.assisterName + "\'");
        } else {
            System.out.println("[INFO] client \'" + sourceDevice.assisterName + "\' disonnected from isMachine \'" + sourceDevice.machineName + "\'");
        }

        // Processa l'evento
        handle_close_event(peer);

        session = null;
        sourceDevice = null;
        targetDevice = null;
    }

    @OnError
    public void onError(Throwable t) {
    }

    public int handle_close_event(Session peer) {
        if (targetDevice != null) {
            try {
                if (targetDevice.session != null) {
                    System.out.println("[INFO] \'" + (isMachine ? sourceDevice.machineName : sourceDevice.assisterName) + "\' closed...Notify close event to " + (isMachine ? sourceDevice.assisterName : sourceDevice.machineName) + "...");
                    targetDevice.session.getBasicRemote().sendText("^^[disconnected]");
                } else {
                    System.out.println("[INFO] Invalid session...");
                }
            } catch (IllegalStateException ex) {
                try {
                    System.out.println("[INFO] Illegal target session ...");
                    targetDevice.session.close();
                } catch (IOException ex1) {
                    Logger.getLogger(WebsocketServer.class.getName()).log(Level.SEVERE, null, ex1);
                }
            } catch (IOException ex) {
                Logger.getLogger(WebsocketServer.class.getName()).log(Level.SEVERE, null, ex);
            }
            if (targetDevice.websocketServer != null) {
                // aggiorna il target
                targetDevice.websocketServer.targetDevice = null;
                if (targetDevice.websocketServer.sourceDevice != null) {
                    targetDevice.websocketServer.sourceDevice.status = (targetDevice.isMachine ? "Waiting assister's reconnect" : "Waiting machine's reconnect");
                }
            }
        } else {
            System.out.println("[INFO] \'" + (isMachine ? sourceDevice.machineName : sourceDevice.assisterName) + "\' closed...");
        }

        notify_reload_hosts_to_all();

        // Inizio stramning
        on_stop_streaming(session);

        if (peer != null) {
            if (!sessions.removeDevice(peer)) {
            } else {
                System.out.println("[INFO] " + (isMachine ? "Machine" : "Assister") + " removed...");
            }
        }

        return 1;
    }

    public void handle_set_serial_number(String serial_num) {
        if (isMachine) {
            // Lato Macchina : Ricerca del client per la ricosonnessione
            if (targetDevice == null) {
                targetDevice = sessions.getLinkedAssisterDevice(serial_num);
                if (targetDevice != null) {
                    if (targetDevice.websocketServer != null) {
                        // Ri-collega il target al client
                        System.out.println("[INFO] Client \'" + targetDevice.assisterName + "\' and target \'" + sourceDevice.machineName + "'] Re-connected");
                        targetDevice.websocketServer.targetDevice = sourceDevice;
                        // targetDevice.clientName = sourceDevice.targetName;
                        targetDevice.status = sourceDevice.status = "CONNECTED";
                        // Inizio stramning
                        on_start_streaming(session);

                        try {
                            targetDevice.session.getBasicRemote().sendText("^^[reconnected]");
                        } catch (IllegalStateException ex) {
                            try {
                                targetDevice.session.close();
                            } catch (IOException ex1) {
                                Logger.getLogger(WebsocketServer.class.getName()).log(Level.SEVERE, null, ex1);
                            }
                        } catch (IOException ex) {
                            Logger.getLogger(WebsocketServer.class.getName()).log(Level.SEVERE, null, ex);
                        }

                        try {
                            sourceDevice.session.getBasicRemote().sendText("^^[reconnected]");
                        } catch (IllegalStateException ex) {
                            try {
                                sourceDevice.session.close();
                            } catch (IOException ex1) {
                                Logger.getLogger(WebsocketServer.class.getName()).log(Level.SEVERE, null, ex1);
                            }
                        } catch (IOException ex) {
                            Logger.getLogger(WebsocketServer.class.getName()).log(Level.SEVERE, null, ex);
                        }

                    } else {
                        System.out.println("[INFO] targetDevice.websocketServer invalid!");
                    }
                } else {
                    // System.out.println("[INFO] targetDevice not found!");
                }
            } else {
                System.out.println("[INFO] targetDevice already set!");
            }

            notify_reload_hosts_to_all();

        } else {
            // Lato Assister
            if (targetDevice == null) {
                // Ricerca di endPoint (macchina) precedentemento connesso
                targetDevice = sessions.getMachineDevice(serial_num);
                if (targetDevice != null && targetDevice.session != null) {
                    if (targetDevice.websocketServer != null) {
                        // Ri-collega il target al client
                        System.out.println("[INFO] Target \'" + targetDevice.assisterName + "\' and target \'" + sourceDevice.machineName + "'] Re-connected");
                        targetDevice.websocketServer.targetDevice = sourceDevice;
                        // targetDevice.clientName = sourceDevice.targetName;
                        targetDevice.status = sourceDevice.status = "CONNECTED";
                        // Inizio stramning
                        on_start_streaming(session);

                        notify_reload_hosts_to_all();

                        try {
                            targetDevice.session.getBasicRemote().sendText("^^[reconnected]");
                        } catch (IllegalStateException ex) {
                            try {
                                targetDevice.session.close();
                            } catch (IOException ex1) {
                                Logger.getLogger(WebsocketServer.class.getName()).log(Level.SEVERE, null, ex1);
                            }
                        } catch (IOException ex) {
                            Logger.getLogger(WebsocketServer.class.getName()).log(Level.SEVERE, null, ex);
                        }

                    } else {
                        System.out.println("[INFO] targetDevice.websocketServer invalid!");
                    }
                } else {
                    // System.out.println("[INFO] targetDevice not found!");
                }
            }
        }
    }

    public void handle_set_endpoint_serial_number(String serial_num) {

        if (sourceDevice != null) {
            if (isMachine == false) {
                // collega il client al enpdpoint
                targetDevice = sessions.getMachineDevice(serial_num);
                if (targetDevice != null) {
                    if (targetDevice.websocketServer != null) {
                        if (targetDevice.websocketServer.targetDevice != null) {
                            // Risorsa occupata
                            System.out.println("[INFO] Client \'" + sourceDevice.assisterName + "\' Busy");
                            sourceDevice.status = "BUSY";

                        } else {
                            // collega il target al client
                            System.out.println("[INFO] Client \'" + sourceDevice.assisterName + "\' and target \'" + targetDevice.machineName + "'] Connected");
                            targetDevice.websocketServer.targetDevice = sourceDevice;
                            targetDevice.assisterName = sourceDevice.assisterName;
                            targetDevice.status = sourceDevice.status = "CONNECTED";
                            sourceDevice.machineSerialNum = targetDevice.machineSerialNum;
                            sourceDevice.machineName = targetDevice.machineName;
                            try {
                                targetDevice.session.getBasicRemote().sendText("^^[connected]");
                            } catch (IOException ex) {
                                Logger.getLogger(WebsocketServer.class.getName()).log(Level.SEVERE, null, ex);
                            }
                            try {
                                sourceDevice.session.getBasicRemote().sendText("^^[connected]");
                            } catch (IOException ex) {
                                Logger.getLogger(WebsocketServer.class.getName()).log(Level.SEVERE, null, ex);
                            }
                            // Inizio stramning
                            on_start_streaming(session);
                        }
                    } else {
                        System.out.println("[ERROR] target device hasn't websocter linked!");
                    }
                } else {
                    System.out.println("[ERROR] target device not found");
                }
            } else {
                System.out.println("[ERROR] Client has wrong endpoint");
            }
        } else {
            System.out.println("[ERROR] Client not defined...Please send first aName feild");
        }
    }

    private void handle_forward_nessage(String message) {
        if (targetDevice != null) {
            if (targetDevice.session != null) {
                try {
                    targetDevice.session.getBasicRemote().sendText(message);
                    // targetDevice.session.getBasicRemote().sendBinary(ByteBuffer.wrap(byteArray));
                    // targetDevice.session.getBasicRemote().sendBinary(byteBuffer);
                } catch (IllegalStateException ex) {
                    System.out.println("[ERROR] Target connection broken... isMachine:" + isMachine);
                    try {
                        targetDevice.session.close();
                    } catch (IOException ex1) {
                        Logger.getLogger(WebsocketServer.class.getName()).log(Level.SEVERE, null, ex1);
                    }
                } catch (IOException ex) {
                    Logger.getLogger(WebsocketServer.class.getName()).log(Level.SEVERE, null, ex);
                }
            } else {
                targetDevice = null;
            }
        }
    }

    // rate publisher thread, generates a new value for USD rate every 2 seconds.
    static {
        Thread rateThread = new Thread() {
            public void run() {
                DecimalFormat df = new DecimalFormat("#.####");
                while (true) {
                    double d = 2 + Math.random();
                    if (sessions.devices != null) {
                        // sendAll("USD Rate: " + df.format(d));
                    }
                    try {
                        sleep(2000);
                    } catch (InterruptedException e) {
                    }
                }
            }
        ;
        };

    rateThread.start();
    }

    static private void notify_reload_hosts_to_all() {
        for (Device device : sessions.devices) {
            if (!device.isMachine) {
                if (device.session != null) {
                    try {
                        device.session.getBasicRemote().sendText("^^[reloadHost]");
                    } catch (IllegalStateException ex) {
                        System.out.println("[INFO] Assister " + device.assisterName + " broken...");
                    } catch (IOException ex) {
                        Logger.getLogger(WebsocketServer.class.getName()).log(Level.SEVERE, null, ex);
                    }
                }
            }
        }
    }

    static private void sendAll(String msg) {

        try {

            /* Send the new rate to all open WebSocket sessions */
            ArrayList<Session> closedSessions = new ArrayList<>();
            for (Device device : sessions.devices) {
                if (!device.session.isOpen()) {
                    System.out.println("Closed session: " + device.session.getId());
                    // closedSessions.add(session);
                } else {
                    device.session.getBasicRemote().sendText(msg);
                }
            }
            // queue.removeAll(closedSessions);
            // System.out.println("Sending " + msg + " to " + sessions.devices.size() + " clients");
        } catch (Throwable e) {
            e.printStackTrace();
        }
    }

    static public int on_start_streaming(Session session) {
        return 1;
    }

    static public int on_stop_streaming(Session session) {
        return 1;
    }

    public int create_ui_pages_from_string(Session session, String data) throws IOException {
        int retVal = 0;
        JSONObject jObject = null;
        
        try {
            
            jObject = new JSONObject(data); // json
        
            // JSONObject jsonObj = jObject.getJSONObject("PAGE_DATA"); // get data object
            String SN = jObject.getString("SN");
            String baseURL = jObject.getString("baseURL");
  
            // session.getContainer().
            // HTTPServletRequest request = ((ServletRequestAttributes)RequestContextHolder.getRequestAttributes()).getRequest();
            // HTTPServletRequest request = GLRequest.get();
  
            String[] pathList = absPath.split("/");
            String finalPath = null;

            if (pathList.length >= 2) {
                if (pathList[pathList.length-1].equalsIgnoreCase("web")) {
                    if (pathList[pathList.length-2].equalsIgnoreCase("build")) {
                        finalPath = "";
                        for (int ipath=0; ipath<pathList.length-2; ipath++) {
                            finalPath += pathList[ipath] + "/";
                        }
                        finalPath += "web/";
                    }
                }
            }
                    
            String path = (finalPath != null ? finalPath : absPath) + SN + "/index.html";
            
            // Use relative path for Unix systems
            File f = new File(path);

            f.getParentFile().mkdirs(); 
            f.createNewFile();

            System.out.println("OUT File : " + f.getAbsoluteFile());

            FileOutputStream out = new FileOutputStream(path);
            out.write(Base64.getDecoder().decode(jObject.getString("content")));
            out.close();                    
            

            
                    
            JSONArray scriptsSrc = jObject.getJSONArray("scriptsSrc"); 
            JSONArray scriptsContent = jObject.getJSONArray("scriptsContent"); 

            for (int i=0; i<scriptsSrc.length(); i++) {
                String scriptSrc = scriptsSrc.getString(i);
                String scriptContent = scriptsContent.getString(i);
                if (scriptContent != null && !scriptContent.isEmpty()) {
                    // Creazione file
                    f = new File(scriptSrc);
                    String fileName = f.getName();
                    path = (finalPath != null ? finalPath : absPath) + SN + "/" + fileName;
                    System.out.println("Script File : " + path + " - size : " + scriptContent.length() );
                    if (!f.delete()) {
                        System.out.println("DELETE File : " + path + " FAILED");
                    }
                    out = new FileOutputStream(path);
                    out.write(Base64.getDecoder().decode(scriptContent));
                    out.close();                    
                }
            }
            

            try {

                JSONArray imagesSrc = jObject.getJSONArray("imagesSrc"); 
                JSONArray imagesContent = jObject.getJSONArray("imagesContent"); 

                for (int i=0; i<imagesSrc.length(); i++) {
                    String imageSrc = imagesSrc.getString(i);
                    String imageContent = imagesContent.getString(i);
                    if (imageContent != null && !imageContent.isEmpty()) {
                        // Creazione file
                        f = new File(imageSrc);
                        String fileName = f.getName();
                        path = (finalPath != null ? finalPath : absPath) + SN + "/"+fileName;
                        System.out.println("Image File : " + path+" - size : " + imageContent.length() );
                        if (!f.delete()) {
                            System.out.println("DELETE File : " + path + " FAILED");
                        }

                        out = new FileOutputStream(path);
                        out.write(Base64.getDecoder().decode(imageContent));
                        out.close();                    
                    }
                }

            } catch (JSONException ex) {
                Logger.getLogger(WebsocketServer.class.getName()).log(Level.SEVERE, null, ex);
            }
        
        } catch (JSONException ex) {
            Logger.getLogger(WebsocketServer.class.getName()).log(Level.SEVERE, null, ex);
        }
        
        return retVal;
    }

}
