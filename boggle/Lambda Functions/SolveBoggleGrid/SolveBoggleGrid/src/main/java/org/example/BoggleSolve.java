package org.example;

import java.io.*;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.Context;

public class BoggleSolve implements RequestHandler<Map<String,String>, List<String>> {

    private Logger logger = Logger.getLogger("BoggleSolve");

    @Override
    public List<String> handleRequest(Map<String, String> event, Context context){

        logger.info("Started Processing");
        Instant start = Instant.now();
        Boggle Boggle = new Boggle();

        String values = event.get("grid").replaceAll(",","").toLowerCase();
        logger.info("values : " + values);
        String gridDimension = event.get("gridSize");
        logger.info("gridSize : " + gridDimension);
        String dictSwitch = event.get("switch");

        String[] gridMatrix = values.split("(?<=\\G.{" + gridDimension + "})");
        String gridStream = "";
        for (int i = 0; i < Integer.parseInt(gridDimension); i++) {
            gridStream += gridMatrix[i] + "\n";
        }
        logger.info("Loaded Grid: " + gridStream);

        InputStream in = BoggleSolve.class.getClassLoader().getResourceAsStream("wordlist.txt");
        InputStream grid =  new ByteArrayInputStream(gridStream.getBytes(StandardCharsets.UTF_8));


        BufferedReader filereader = null;
        logger.info("Attempting to load Dict");

        //Code to pick dictionary from S3 or local.
        try {
            if("true".equals(dictSwitch.toLowerCase())){
                filereader = new BufferedReader(new InputStreamReader(URI.create("https://dictionarybogglegame.s3.amazonaws.com/wordstest.txt").toURL().openConnection().getInputStream()));
            } else {
                filereader = new BufferedReader(new InputStreamReader(in));
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        logger.info("Dict Loaded");

        BufferedReader gridReader = null;
        logger.info("Attempting to load Grid");
        gridReader = new BufferedReader(new InputStreamReader(grid));
        logger.info("Grid Loaded");

        Boggle.getDictionary(filereader);

        Boggle.getPuzzle(gridReader);

        logger.info("Grid:\n" + Boggle.print());

        List<String> wordsWithPaths = Boggle.solve();

        List<String> onlyWords = new ArrayList<>();
        for (String s : wordsWithPaths) {
            onlyWords.add(s.split("\\t")[0].toUpperCase());
        }

        Instant end = Instant.now();
        logger.info("Duration : " + Duration.between(start, end).toSeconds());


        return onlyWords;
    }


}
