/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package xProject;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.ArrayList;

/**
 *
 * @author root
 */
public class Firmwares {

    public ArrayList<Firmware> firmwareList = new ArrayList();
    public String error = null, folder = null;

    public int readFirmwares(String macAddr) {
        int nFiles = 0;

        error = "";
        firmwareList.clear();
        
        try {
            if (macAddr != null && !macAddr.isEmpty()) {
                File folderFile = new File(xProject.WebsocketServer.absPath + "/" + macAddr + "/Firmwares/");
                folder = folderFile.getAbsoluteFile().getAbsolutePath();
                listFilesForFolder(folderFile);
            }
        } catch (Exception e) {
            e.printStackTrace();
            error = e.getMessage();
        }

        nFiles = firmwareList.size();

        return nFiles;
    }

    public void listFilesForFolder(final File folder) {
        firmwareList.clear();
        try {
            if (folder != null) {
                for (File fileEntry : folder.listFiles()) {
                    if (fileEntry.isDirectory()) {
                        listFilesForFolder(fileEntry);
                    } else {
                        String fileName = fileEntry.getName();
                        if (fileName.indexOf("lcu.") == 0) {
                            Firmware firmware = new Firmware();
                            firmware.fileName = fileName;
                            firmware.version = fileName.substring(fileName.indexOf("lcu.") + 4);

                            File file = fileEntry.getAbsoluteFile();
                            double bytes = (double) file.length();
                            firmware.fileSize = String.valueOf(bytes / 1024.0) + "kb";

                            SimpleDateFormat sdf = new SimpleDateFormat("MM/dd/yy HH:mm");
                            firmware.fileDate = sdf.format(file.lastModified());

                            firmwareList.add(firmware);
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            error = e.getMessage();
        }
    }
}
