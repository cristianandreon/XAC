/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package xProject;

import javax.servlet.http.HttpServletRequest;

/**
 *
 * @author root
 */
public class xUtility {

    /*
     */

    public static void get_abs_path(HttpServletRequest request) {
    
    ThreadLocal GLRequest = new ThreadLocal();

    GLRequest.set(request);

    xProject.WebsocketServer.relativePath = request.getContextPath();
    // xProject.WebsocketServer.absPath = request.getSession().getServletContext().getContextPath(); // .getRealPath("/");
    // xProject.WebsocketServer.absPath = request.getSession().getServletContext().getResourcePaths("/").toString();
    xProject.WebsocketServer.absPath = request.getSession().getServletContext().getRealPath("/");
    }

    
}
