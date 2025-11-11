import java.io.*;
import java.net.*;

public class JavaTCPClient {
    public static void main(String[] args) throws Exception {
        String host = "127.0.0.1";
        int port = 9000;
        Socket socket = new Socket(host, port);
        BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
        BufferedWriter out = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream()));

        // Reader thread
        new Thread(() -> {
            try {
                String line;
                while ((line = in.readLine()) != null) {
                    System.out.println("IN: " + line);
                }
            } catch (Exception e) { }
        }).start();

        // Send simple messages typed into console
        BufferedReader stdin = new BufferedReader(new InputStreamReader(System.in));
        String s;
        while ((s = stdin.readLine()) != null) {
            out.write(s + "\n");
            out.flush();
        }
        socket.close();
    }
}
