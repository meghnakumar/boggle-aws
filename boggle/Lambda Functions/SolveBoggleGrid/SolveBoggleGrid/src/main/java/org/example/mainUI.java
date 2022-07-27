package org.example;

import com.amazonaws.services.s3.model.S3ObjectInputStream;

import java.io.*;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

public class mainUI {



    public static void main(String[] args) throws IOException {

    Boggle Boggle = new Boggle();

    BufferedReader filereader = new BufferedReader(new InputStreamReader(URI.create("https://dictionarybogglegame.s3.amazonaws.com/wordstest.txt").toURL().openConnection().getInputStream()));
    Boggle.getDictionary(filereader);


    }
}