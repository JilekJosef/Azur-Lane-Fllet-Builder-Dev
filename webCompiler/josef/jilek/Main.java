package josef.jilek;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.Objects;
import java.util.regex.Matcher;


public class Main {

    public static void main(String[] args) throws IOException {

        //thumbnails preparation
        File f =  new File("./shipThumbnails/36x36_noMetadata");
        String[] files = f.list();

        StringBuilder out = new StringBuilder();

        for (int i = 0; i < Objects.requireNonNull(files).length; i++) {
            File temp = new File("./shipThumbnails/36x36_noMetadata/"+files[i]);
            byte[] bytes = Files.readAllBytes(temp.toPath());
            String encodedFile = Base64.getEncoder().encodeToString(bytes);
            out.append(files[i]).append(";").append(encodedFile).append(";");

        }
        FileWriter fileWriter = new FileWriter("./shipThumbnails/shipThumbnails.txt");
        PrintWriter printWriter = new PrintWriter(fileWriter);
        printWriter.write(out.substring(0,out.toString().length()-1));
        printWriter.close();

        //excel data
        String ships = Files.readString(Paths.get("./shipData/ships.csv"));
        ships = ships.replaceFirst("[\n\r]+$", "");
        ships = ships.replaceAll("\\uFEFF", "");
        ships = ships.replaceAll("\\r\\n", ";");
        ships = ships.replaceAll("\u00a0", " ");

        String effis = Files.readString(Paths.get("./shipData/effis.csv"));
        effis = effis.replaceFirst("[\n\r]+$", "");
        effis = effis.replaceAll("\\uFEFF", "");
        effis = effis.replaceAll("\\r\\n", ";");
        effis = effis.replaceAll("\u00a0", " ");

        String classC = Files.readString(Paths.get("./shipData/class.csv"));
        classC = classC.replaceFirst("[\n\r]+$", "");
        classC = classC.replaceAll("\\uFEFF", "");
        classC = classC.replaceAll("\\r\\n", ";//");
        classC = classC.replaceAll("\u00a0", " ");

        String mainJS = Files.readString(Paths.get("./mainJS/main.js"));
        mainJS = mainJS.replaceFirst("const shipsRaw = \"\";","const shipsRaw = \"" + ships + "\";");
        mainJS = mainJS.replaceFirst("const shipEffisRaw = \"\";","const shipEffisRaw = \"" + effis + "\";");
        mainJS = mainJS.replaceFirst("const shipClassesRaw = \"\";","const shipClassesRaw = \"" + classC + "\";");
        mainJS = mainJS.replaceFirst("const shipThumbnailsRaw = \"\";","const shipThumbnailsRaw = \"" + Files.readString(Paths.get("./shipThumbnails/shipThumbnails.txt")) + "\";");

        //HTML injection //loaded files should be escaped
        String index = Files.readString(Paths.get("./index.html"));
        index = index.replaceFirst("<link rel=\"stylesheet\" href=\"assets/bootstrap/css/bootstrap.min.css\">", "<style>" + Files.readString(Paths.get("./assets/bootstrap/css/bootstrap.min.css")) + "</style>");
        index = index.replaceFirst("<link rel=\"stylesheet\" href=\"assets/css/styles.min.css\">", "<style>" + Files.readString(Paths.get("./assets/css/styles.min.css")) + "</style>");

        index = index.replaceFirst("<title>AL_FB_UI</title>", "<title>Azur Lane Fleet Builder</title>" +
                "<script>" + Matcher.quoteReplacement(Files.readString(Paths.get("./JQuery/jquery-3.6.0.min.js"))) + "</script>" +
                "<script>" + Matcher.quoteReplacement(mainJS) + "</script>"
        );

        //export
        fileWriter = new FileWriter("./out/web/index.html");
        printWriter = new PrintWriter(fileWriter);
        printWriter.write(index);
        printWriter.close();

    }
}
