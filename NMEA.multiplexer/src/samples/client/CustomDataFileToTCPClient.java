package samples.client;

import nmea.api.NMEAClient;
import nmea.api.NMEAEvent;
import nmea.api.NMEAListener;
import samples.reader.CustomFileReader;
import servers.TCPWriter;

/**
 * Read a file containing logged data and rebroadcast them on TCP
 */
public class CustomDataFileToTCPClient extends NMEAClient
{
  private TCPWriter tcpWriter = null;

  public CustomDataFileToTCPClient(String s, String[] sa)
  {
    super(s, sa);
    try {
      tcpWriter = new TCPWriter(7001);
    } catch (Exception ex) {
      ex.printStackTrace();
    }
  }
  
  public void dataDetectedEvent(NMEAEvent e)
  {
    System.out.println("Received from File:" + e.getContent());
    if (tcpWriter != null) {
      tcpWriter.write(e.getContent().getBytes()); // Re-broadcasting on TCP
    }
  }

  private static CustomDataFileToTCPClient customClient = null;
  
  public static void main(String[] args)
  {
    System.out.println("CustomDataFileToTCPClient invoked with " + args.length + " Parameter(s).");
    for (String s : args)
      System.out.println("CustomDataFileToTCPClient prm:" + s);

    String dataFile = "./sample.data/2010-11-08.Nuku-Hiva-Tuamotu.nmea";
    if (args.length > 0)
      dataFile = args[0];
    
    String prefix = null; // "*";
    String[] array = null; // {"GVS", "GLL", "RME", "GSA", "RMC"};
    customClient = new CustomDataFileToTCPClient(prefix, array);
      
    Runtime.getRuntime().addShutdownHook(new Thread() 
      {
        public void run() 
        {
          System.out.println ("Shutting down nicely.");
          customClient.stopDataRead();
        }
      });

    customClient.setEOS("\n"); // TASK Sure?
    customClient.initClient();
    customClient.setReader(new CustomFileReader(customClient.getListeners(), dataFile));
    customClient.startWorking();
  }

  private void stopDataRead()
  {
    if (customClient != null)
    {
      for (NMEAListener l : customClient.getListeners())
        l.stopReading(new NMEAEvent(this));
    }
  }
}