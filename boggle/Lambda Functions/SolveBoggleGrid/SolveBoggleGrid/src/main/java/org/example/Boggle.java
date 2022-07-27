package org.example;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;


/**
 * The Class handler.Boggle.
 * <br>
 * This class accepts a dictionary of words and a puzzle grid (not
 * necessarily square) and provides a sorted list of all the words found in the puzzle in a specific format.
 */
public class Boggle {

    // The Character Matrix that represents the handler.Boggle Grid.
    private char [][] boggleGrid;

    //Stores Number of Rows in the input handler.Boggle Grid.
    private int rows;

    //Stores Number of Columns in the input handler.Boggle Grid.
    private int cols;

    //List of Strings to store the words of the dictionary for the handler.Boggle Puzzle.
    private List<String> dictionary;

    //Variables to keep track of whether a valid Dictionary & Puzzle are currently loaded in the system.
    private boolean isDictionaryLoaded = false;
    private boolean isPuzzleLoaded = false;



    /**
     * Gets Dictionary.
     *
     * This method reads a set of words that are candidates for the solution. Each word will be on a line of its own.
     * The end of the words is signalled either by the end-of-file marker on the stream or by a blank line in the
     * stream. This method returns true if the words are all read and ready to use for puzzle-solving.
     * <br><br>
     * This method assumes that the incoming words are all in lower-case, and ignores words of length less than 2 characters.
     *
     * @param stream the BufferedReader stream - can be a stream reader, file reader etc.
     * @return boolean - True or False whether the dictionary is loaded and ready to be used for puzzle solving.
     */
    public boolean getDictionary(BufferedReader stream) {

        System.out.println("Please enter the Dictionary for the handler.Boggle Puzzle to use.");

        //Set is dictionary loaded to false when the method begins.
        isDictionaryLoaded = false;
        // Local variable to track if a valid dictionary was loaded.
        boolean validDictionary = false;

        //Define the Dictionary variable
        dictionary = new LinkedList<>();

        String input = "";

        try {

            //While there in non-null input from the buffered stream
            while ((input = stream.readLine()) != null) {

                //If input is null or empty line, break loop.
                if (input == null || input.isEmpty()) {

                    break;
                }

                //For each string/word entered, check if it has more than 2 characters and that it is alphabetic only.
                if( input.length() > 1 && isStringOnlyAlphabetic(input)) {

                    //Add valid words to the dictionary.
                    dictionary.add(input);
                }
            }

            // If dictionary has words, print the total number of words loaded in the dictionary
            // Set validDictionary = isDictionaryLoaded true.
            if(!dictionary.isEmpty()){
                System.out.println("Total words loaded: " + dictionary.size());
                validDictionary = true;
                isDictionaryLoaded = true;
            }

        }
        //In case of any IOException, the dictionary will not be ready to use, therefore, return false.
        catch (IOException e) {

            System.out.println(e.getMessage());
            return false;

        }

        //Return validDictionary boolean value.
        return validDictionary;
    }


    /**
     * Gets Puzzle.
     * <br>
     * This method read a rectangular grid of letters (MxN) that form the handler.Boggle puzzle board.
     * <br> Every row of the puzzle should have the same number of letters.
     * The end-of-file marker in the stream or a blank line in the stream marks the end
     * of a puzzle. Returns true if a puzzle is read and can be used for puzzle-solving.
     *
     * @param stream the BufferedReader stream - can be a stream reader, file reader etc.
     * @return boolean - True or False whether the puzzle is loaded and ready to be solved.
     */
    public boolean getPuzzle(BufferedReader stream) {

        System.out.println("Please enter the puzzle grid one row at a time");

        //Local variable to track if a valid dictionary was loaded.
        boolean validGrid = false;
        //Set puzzle is loaded to false when the method begins
        isPuzzleLoaded = false;

        // Keeps track of the number of characters in the first row entered for the grid
        // We will use this to check if all rows of the grid have the same number of letters.
        // Initialised to 0
        int col_size = 0;

        String input = "";
        String userInput = "";

        try {

            //While there in non-null input from the buffered stream
            while ((input = stream.readLine()) != null) {

                //If input is null or empty line, break loop.
                if (input == null || input.isEmpty()) {
                    break;
                }

                //If the Grid has a non-alphabetic character, throw an exception as handler.Boggle can only have alphabetic characters in cells.
                if (!isStringOnlyAlphabetic(input)) {
                    throw new IOException("Invalid Input: Values for the handler.Boggle Grid can only be lower case alphabets.");
                }

                //For first valid input, capture the size of the first row of characters in the grid to compare with next rows.
                if (col_size == 0) {
                    col_size = input.length();
                }

                // If there are inconsistencies in the number of characters per row of the grid, throw an error.
                if (input.length() != col_size) {
                    throw new IOException("Invalid Input: Inconsistent number of characters in the length of the Grid row. Each row of handler.Boggle Grid must have same number of cells.");
                }

                userInput += input;
            }
        }
        //In case of any IOException, the dictionary will not be ready to use, therefore, return false.
        catch (IOException e) {

            System.out.println(e.getMessage());
            return false;
        }

        //If the Grid input is empty, i.e. 0*0 grid, Inform user, Return false.
        if (userInput.isEmpty()) {
            System.out.println("Invalid Input : Input values for the Boggle grid are Empty.");
        } else {

            //Make sure all characters of the gird are in lowercase.
            userInput = userInput.toLowerCase();
            // Split user input by rows.
            String[] breakInput = splitStringByCharSize(userInput, col_size);

            // Column size of the handler.Boggle Grid is taken from above.
            cols = col_size;
            // Row size of the handler.Boggle Grid is the number of rows in the matrix.
            rows = breakInput.length;

            // Check that there is at least one row and at least one column, i.e. the minimum handler.Boggle Grid is 1*1.
            if (rows >= 1 && cols >= 1) {

                // Create a handler.Boggle Grid with the dimensions calculated above.
                boggleGrid = new char[rows][cols];

                for (int i = 0; i < rows; i++) {

                    // Convert each row to a Character array.
                    char[] row = breakInput[i].toCharArray();

                    for (int j = 0; j < cols; j++) {
                        //Add each character to a cell of the handler.Boggle Puzzle grid.
                        boggleGrid[i][j] = row[j];
                    }

                }

                // Set validGrid = isPuzzleLoaded = true
                validGrid = true;
                isPuzzleLoaded = true;
            }
        }

      // Return validGrid boolean value.
      return validGrid;

    }


    /**
     * Solve Grid.
     * <br>
     * This method finds all the words of the dictionary that appear in the puzzle grid.
     * <br> Words can start at any entry of the grid and cannot reuse a cell of the grid in the same word.
     * This method return the list of words found (in sorted order)
     * as well as the navigational path followed by the word in the Grid in a specific format provided below.
     * <br><br>
     *
     * The format of the Navigational Path is : word \t starting_X \t staring_Y \t navigation_sequence.
     * <br><br>
     * Where:
     *      word - is the word found in the grid
     *      starting_X and starting_Y are the grid coordinates of the start of the word, with the lower left corner having X and Y as both 1.
     *      navigation_sequence is a sequence of letters (no separation between them) to show how you navigate through the grid to form the desired word.
     * <br><br>
     * The Letter Sequence for the Navigational Path :
     *      L – go left, R – go right , U – go up , D – go down ,
     *      N – go diagonally up and to the left , E – go diagonally up and to the right ,
     *      S – go diagonally down and to the right , W – go diagonally down and to the left.
     *
     *
     * @return the List of Strings where each string is a reported path of the format : word \t starting_X \t staring_Y \t navigation_sequence.
     */
    public List<String> solve(){

        // Object of Class handler.BoggleUtil
        BoggleUtil boggleUtil = new BoggleUtil();

        //Intialise the list of Strings with an Empty string.
        List<String> resolvedPaths = List.of("");

        //Only if both, a valid puzzle & a valid dictionary are in the system, then solve the handler.Boggle Puzzle
        if(isPuzzleLoaded && isDictionaryLoaded) {

            //Call to processGridToFindWords to Process the handler.Boggle Grid to find the Words from the Dictionary.
            resolvedPaths = boggleUtil.processGridToFindWords(dictionary, boggleGrid, rows, cols);

            //If there are words found then print the total number of words found.
            if(resolvedPaths != null && !resolvedPaths.isEmpty()) {

                System.out.println("Total Number of Words found in the Grid: " + resolvedPaths.size());

               /* for (String s : resolvedPaths) {
                    System.out.println(s);
                }*/
            }

        }
        //In case either the puzzle or the dictionary or both are invalid or missing, throw exception.
        //Throwing exception would mean the puzzle can't be solved.
        else {

             String PUZZLE_MISSING = "A valid handler.Boggle Puzzle is not loaded in the system. Cannot solve a puzzle that is invalid.";
             String DICTIONARY_MISSING = "A valid Dictionary is not loaded into the system. Cannot solve a handler.Boggle Puzzle without a valid Dictionary.";
             String BOTH_MISSING = "Both Dictionary and handler.Boggle Grid are not loaded into the system. Cannot solve a puzzle that does not exist in the system.";

            if(!isPuzzleLoaded && !isDictionaryLoaded){
                throw new RuntimeException(BOTH_MISSING);
            } else if (!isPuzzleLoaded) {
                throw new RuntimeException(PUZZLE_MISSING);
            } else if (!isDictionaryLoaded) {
                throw new RuntimeException(DICTIONARY_MISSING);
            }
        }

        //Return the List of reported Paths.
        return resolvedPaths;
    }


    /**
     * Print String.
     *
     * This method prints the input handler.Boggle Grid.
     *
     * @return the string
     */
    public String print(){

        StringBuilder br = new StringBuilder().append("");

        //If a puzzle is loaded, and the handler.Boggle Gird is populated then create a string from all the characters in the cells.
        if( isPuzzleLoaded && boggleGrid!= null && boggleGrid.length > 0 ) {

            for (int i = 0; i < rows; i++) {
                for (int j = 0; j < cols; j++) {

                    //Add tab between characters in the same row.
                    br.append(boggleGrid[i][j]).append("\t");
                }

                //Move to new line for a new row in the grid.
                br.append("\n");
            }
        }

        return br.toString();
    }


    /**
     * private method - isStringOnlyAlphabetic
     * <br>
     * Method to check that current input string is made up of only lowercase alphabetic letters.
     *
     * @param inputText - the input String
     * @return boolean - True or False - whether the input string is purel alphabetic and has only lowercase letters.
     */
    private static boolean isStringOnlyAlphabetic(String inputText) {

        return ((inputText != null) && (!inputText.equals("")) && (inputText.matches("^[a-z]*$")));
    }


    /**
     * private method - splitStringByCharSize
     * <br>
     * Method to split the user input for the handler.Boggle Grid into rows for the Grid puzzle.
     *
     * @param inputText the input String
     * @param charSize  the size of each row in the grid i.e. the number of characters in one row of the grid.
     * @return an array representing the Grid.
     */
    private static String[] splitStringByCharSize(String inputText, int charSize) {

        List<String> subStrings = new ArrayList<>();

        int length = inputText.length();
        for (int i = 0; i < length; i += charSize) {
            subStrings.add(inputText.substring(i, Math.min(length, i + charSize)));
        }
        return subStrings.toArray(new String[0]);
    }

}

