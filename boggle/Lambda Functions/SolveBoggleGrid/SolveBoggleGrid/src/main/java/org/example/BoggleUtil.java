package org.example;

import java.util.*;


/**
 * The Class handler.Boggle Util.
 * <br>
 * Contains the assisting methods for finding the Words in a handler.Boggle Grid
 * Based on a Dictionary fed to the System.
 *
 * Utilises a Prefix Tree static Class for storing the words and for their retrieval.
 */
public class BoggleUtil {

    //Stores Number of Rows in the input handler.Boggle Grid.
    private int ROWS;

    //Stores Number of Columns in the input handler.Boggle Grid.
    private int COLS;

    //Maximum number of pointers for the Prefix Tree, equal to the number of characters of the alphabet.
    private static final int alphabetLimit = 26;

    //Map to store a word found in the handler.Boggle Grid,
    // and a list of all the corresponding paths that can be used to make that word.
    // Later, we will pick one path from the list based on smallest X & Y coordinates.
    private Map<String, List<String>> wordsFound;

    /**
     * The Static Class Prefix Tree Node.
     * <br>
     * Represents and Initializes a Prefix Tree to store all the words fed into the dictionary
     * Later, the Prefix Tree can be traversed to find the words.
     */
    static class PrefixTreeNode {

        //The leafNode in a Prefix Tree is true when the node represents the end of a word.
        boolean leafNode;

        //An Array of type PrefixTreeNode, with size same as maximum number of alphabets.
        //Each node (except the root) can store one letter of the alphabet.
        PrefixTreeNode[] childNode = new PrefixTreeNode[alphabetLimit];

        /**
         * Constructor - Instantiates a new Prefix Tree Node.
         */
        public PrefixTreeNode()
        {
            //Set leaf node to false, it can oly be true when it represents end of  Word in the tree.
            leafNode = false;
            //Initialise child nodes of the Prefix Tree as null.
            for (int i = 0; i < alphabetLimit; i++) {
                childNode[i] = null;
            }
        }
    }


    /**
     * private method - isSafeToVisit
     * <br>
     * Method to check that current location coordinate (i,j) are valid i.e. is within the matrix range.
     *
     * @param i       the i handler.Coordinate
     * @param j       the j handler.Coordinate
     * @param visited array that stores whether a location has been visited or not
     * @return boolean - True or False - whether the location is in the Matrix and is safe to visit.
     */
    private boolean isSafeToVisit(int i, int j, boolean[][] visited)
    {
        //Check that i is between 0 & Row limit
        //Check that j is between 0 & Col limit
        //Check visited[i][j] is true or false
        //Return the logical evaluation of the expression
        return (i >= 0 && i < ROWS && j >= 0 && j < COLS && !visited[i][j]);
    }


    /**
     *  private method - Inserts a Word into the Prefix Tree.
     * <br>
     * If a word is not present, inserts it in the Prefix Tree
     * If the key word is already in the prefixTree, just marks the leaf node as true.
     *
     * @param root     the root node of the Prefix Tree
     * @param keyValue the key value - the Word to be added to the Prefix Tree.
     */
    private void insertIntoPrefixTree(PrefixTreeNode root, String keyValue)
    {
        //Get the length of the input word
        int n = keyValue.length();
        //Get the root node of the Prefix Tree
        PrefixTreeNode prefixRoot = root;

        //For each letter in the word
        for (int i = 0; i < n; i++) {

            //Calculate the index of the node based on the character value
            int index = keyValue.charAt(i) - 'a';
            //If the child node is null, create new PrefixTreeNode instance
            if (prefixRoot.childNode[index] == null)
                prefixRoot.childNode[index] = new PrefixTreeNode();

            prefixRoot = prefixRoot.childNode[index];
        }

        //Mark last node as the leaf node
        prefixRoot.leafNode = true;
    }


    /**
     *  private method - Search for a Word in the handler.Boggle Grid.
     *
     * <br>
     * Recursively searches for a word from the dictionary fed to the system in the Prefix Tree.
     * <br>
     * This is a method to recursively search for all the words that are present on the dictionary and also belong in the boggleGrid.
     * It keeps tracks of the Cells visited to avoid re-visiting a cell while identifying the path for a word.<br><br>
     * With each recursive call, it stores the current location (i,j) in the grid in a string and passes it to the next recursive call and so on
     * until the recursion reaches its end when a leafNode = true is found (which represents the end of a word).<br>
     * Once a leafNode is found to be true , signifying the end of the path for that word, the method stores the Word & its path in a Map.<br>
     *
     * Since it is possible that the same word can be made many ways in the handler.Boggle Grid, we store a List of all the paths for each individual word.
     * Later, we can pick the optimal path from each word's path list.
     *
     * @param root       the root node of the Prefix Tree
     * @param boggleGrid the handler.Boggle Grid entered into the system
     * @param i          the i handler.Coordinate
     * @param j          the j handler.Coordinate
     * @param visitedLocation    the equivalent boolean matrix of the handler.Boggle grid used to track visited cells
     * @param word       the word - the keyword string that grows recursively until it matches a word in the dictionary
     * @param path       the path - String that appends the current grid coordinates with each recursion.
     */
    private void searchWordInGrid(PrefixTreeNode root, char[][] boggleGrid, int i, int j, boolean[][] visitedLocation, String word, String path) {

        //If leafNode is true it represents that we found a word in the Prefix Tree
        if (root.leafNode){

            //Add to the path so far, the last cell's coordinates
            String finalPath =  path + String.valueOf(i) + String.valueOf(j);

            //Create a List to store paths for a word.
            List<String> pathList = new ArrayList<>();

            //Check if word already exists in the Map of found Words.
            if(wordsFound.containsKey(word)){

                // If the word already exists in the Map, fetch it's current path list,
                // so we can update the path list for that word
                pathList = wordsFound.get(word);
            }

            //Add the new path to the list of the word
            pathList.add(finalPath);

            //Add word & its path list to the Map
            wordsFound.put(word, pathList);
        }



        // If both i and j are in range of the matrix,
        // and we visit that element of the matrix for the first time.
        if (isSafeToVisit(i, j, visitedLocation)) {

            // Mark the element as visited
            visitedLocation[i][j] = true;

            //Append to the path the current location (i,j), add '|' as a delimiter to separate the coordinates in each recursion.
            path += String.valueOf(i) + String.valueOf(j) + "|";

            // Traverse all child nodes of the root node
            for (int K = 0; K < alphabetLimit; K++) {
                if (root.childNode[K] != null) {

                    // current character to process.
                    // all character values are expected to be lowercase.
                    char ch = (char)(K + 'a');

                    // Recursively search remaining characters of the word
                    // in prefixTree for all 8 adjacent cells of a particular cell in boggleGrid[i][j]
                    // if that is a valid location in the Grid, and has not been visited before.

                    //Search the Cell that is Diagonally up to the Right
                    if (isSafeToVisit(i + 1, j + 1, visitedLocation) && boggleGrid[i + 1][j + 1] == ch) {
                        searchWordInGrid(root.childNode[K], boggleGrid, i + 1, j + 1, visitedLocation, word + ch, path);
                    }
                    //Search the Cell that is Above
                    if (isSafeToVisit(i, j + 1, visitedLocation) && boggleGrid[i][j + 1] == ch) {
                        searchWordInGrid(root.childNode[K], boggleGrid, i, j + 1, visitedLocation, word + ch, path);
                    }
                    //Search the Cell that is Diagonally up to the Left
                    if (isSafeToVisit(i - 1, j + 1, visitedLocation) && boggleGrid[i - 1][j + 1] == ch) {
                        searchWordInGrid(root.childNode[K], boggleGrid, i - 1, j + 1, visitedLocation, word + ch, path);
                    }
                    //Search the Cell that is to the Right
                    if (isSafeToVisit(i + 1, j, visitedLocation) && boggleGrid[i + 1][j] == ch) {
                        searchWordInGrid(root.childNode[K], boggleGrid, i + 1, j, visitedLocation, word + ch, path);
                    }
                    //Search the Cell that is Diagonally down to the Right
                    if (isSafeToVisit(i + 1, j - 1, visitedLocation) && boggleGrid[i + 1][j - 1] == ch) {
                        searchWordInGrid(root.childNode[K], boggleGrid, i + 1, j - 1, visitedLocation, word + ch, path);
                    }
                    //Search the Cell that is Below
                    if (isSafeToVisit(i, j - 1, visitedLocation) && boggleGrid[i][j - 1] == ch) {
                        searchWordInGrid(root.childNode[K], boggleGrid, i, j - 1, visitedLocation, word + ch, path);
                    }
                    //Search the Cell that is Diagonally down to the Left
                    if (isSafeToVisit(i - 1, j - 1, visitedLocation) && boggleGrid[i - 1][j - 1] == ch) {
                        searchWordInGrid(root.childNode[K], boggleGrid, i - 1, j - 1, visitedLocation, word + ch,path);
                    }
                    //Search the Cell that is to the Left
                    if (isSafeToVisit(i - 1, j, visitedLocation) && boggleGrid[i - 1][j] == ch) {
                        searchWordInGrid(root.childNode[K], boggleGrid, i - 1, j, visitedLocation, word + ch,path);
                    }
                }
            }

            // Mark the current element as unvisited
            visitedLocation[i][j] = false;
        }
    }

    /**
     *  private method - Finds the words from the dictionary in the handler.Boggle Grid.
     *  <br>
     *  Method to look for words starting from each individual Character in the handler.Boggle Grid Cells.
     *  We move Cell-by-cell, and the internal search is handled by recursive calls of searchWordInGrid.
     *
     * @param boggle the handler.Boggle Grid that has individual character in each cell.
     * @param parent the parent - the root/parent node of the Prefix Tree
     */
    private void findWordsInDictionary(char[][] boggle, PrefixTreeNode parent) {

        //String to store the Word
        String str = "";
        //String to store the path to create that word.
        String path = "";

        // Create new Matrix, of the same dimensions as the handler.Boggle Grid, to keep track of visited cells
        // Mark all character cells as not visited to begin with.
        boolean[][] visited = new boolean[ROWS][COLS];

        // Traverse all handler.Boggle Grid elements
        for (int i = 0; i < ROWS; i++) {
            for (int j = 0; j < COLS; j++) {
                // we start searching for word in dictionary
                if (parent.childNode[(boggle[i][j]) - 'a'] != null) {

                    //Add Character from the cell to the string
                    //Using String concatenation, can be replaced with a String Builder,
                    str = str + boggle[i][j];

                    //Initial call to the searchWordInGrid method, it makes recursive calls internally
                    //We start here again when we begin from a new Cell in handler.Boggle Grid
                    searchWordInGrid(parent.childNode[(boggle[i][j]) - 'a'], boggle, i, j, visited, str, path);

                    //Reset the Word string.
                    str = "";
                }
            }
        }
    }


    /**
     * public method - Process the handler.Boggle Grid to find the Words from the Dictionary.
     *
     * <br><br>
     * This method accepts a List of words (dictionary), a MxN Matrix of lowercase characters i.e. the handler.Boggle Grid,
     * and the number of rows and cols of the grid, and processes that information to report a List of Strings (words found in the puzzle),
     * where each string is of the form : word \t starting_X \t staring_Y \t navigation_sequence
     *
     * <br><br>
     * Where: word - is the word found in the grid
     *        starting_X and starting_Y are the grid coordinates of the start of the word, with the lower left corner having X and Y as both 1.
     *         navigation_sequence is a sequence of letters (no separation between them) to show how you
     *         navigate through the grid to form the desired word.
     * <br><br>
     *  The Letter Sequence : L – go left, R – go right , U – go up , D – go down ,
     *  N – go diagonally up and to the left , E – go diagonally up and to the right ,
     *  S – go diagonally down and to the right , W – go diagonally down and to the left.
     *
     * <br><br>
     *  The method first internally adds all the words in the dictionary to the prefix tree using the insertIntoPrefixTree() method,
     *  then calls the findWordsInDictionary to store all the Words found in the handler.Boggle puzzle and their various paths into the wordsFound Map.
     *  Then calls the resolvePaths method to obtain the reported paths in the above-mentioned format.
     *
     * @param dictionary the dictionary of words fed into the system.
     * @param boggleGrid the handler.Boggle puzzle Grid where each cell of a MxN matrix houses a character.
     * @param rows       the rows size of the matrix
     * @param cols       the cols size of the matrix
     * @return the List of Strings where each string is a reported path of the format : word \t starting_X \t staring_Y \t navigation_sequence
     */
    public List<String> processGridToFindWords(List<String> dictionary, char [][] boggleGrid , int rows, int cols) {

        // Convert the dictionary to an array for easy processing
        String[] dict = dictionary.toArray(new String[0]);

        //Create a list of strings to store the reported paths
        List<String> reportedPaths = new ArrayList<>();

        //Initialise global ROW and COLS with the values
        ROWS = rows;
        COLS = cols;

        //Initialise the global wordsFound Mao=p as a TreeMap so that the words stored are in sorted order.
        wordsFound = new TreeMap<>();

        // Create the Root Node of the Prefix Tree to be used in the processing.
        PrefixTreeNode root = new PrefixTreeNode();

        // Insert all the words of the dictionary into the Prefix Tree
        for (String s : dict) {

            //Call to insert words into the dictionary using private method insertIntoPrefixTree
            insertIntoPrefixTree(root, s);
        }

        // Call to find the words and their paths using private method findWordsInDictionary
        findWordsInDictionary(boggleGrid, root);

        //Call to obtain reported paths for all words found the specified format.
        reportedPaths = resolvePaths(boggleGrid, rows, cols);

        //Return the Reported Paths
        return reportedPaths;
    }


    /**
     * private method - Resolves the paths found for each word in the wordsFound Map
     * to a Reported Path of specific format of : word \t starting_X \t staring_Y \t navigation_sequence
     *
     * <br><br>
     * This method sequentially takes each word in the wordsFound map, and for each word; first converts the paths in
     * the path list to their equivalent paths for a new Matrix of the same dimensions as the handler.Boggle Grid but where the
     * Coordinates are differently labeled in the way that both X & Y coordinates begin with 1 in the lower left corner
     * then pick a specific path for that word (called Chosen Path) based on the rule that the path with the smallest X coordinate would be prioritised,
     * in case of a tie, the smallest Y coordinate is prioritised next - all this is done by calling the resolvePathsToCoordinates method.
     *
     * <br><br>
     * Once the Chosen Path is identified for a Word, the method calls reportNavigationSequence method to obtain the navigational sequence.
     * At last, for each word, we concatenate the Word, it's stating X & Y coordinates, and the navigation sequence,
     * and add them to the List of Stings to be returned.
     *
     * @param grid the handler.Boggle puzzle Grid where each cell of a MxN matrix houses a character.
     * @param rows the number of rows in the grid
     * @param cols the number of columns in the grid
     * @return the List of Strings where each string is a reported path of the format: word \t starting_X \t staring_Y \t navigation_sequence
     */
    private List<String> resolvePaths(char [][] grid, int rows, int cols ){

        //A Matrix of the same dimensions as the handler.Boggle Grid, but each cell is an Object of the Class handler.Coordinate.
        Coordinate[][] pathGrid = new Coordinate[rows][cols];

        //List to store the resolved paths to return.
        List<String> resolvedPaths =  new ArrayList<>();

        //String to store the word.
        String word = "";
        //String to store the reported path.
        String reportedPath = "";

        //X & Y coordinates from where the word begins.
        int start_x = 0;
        int start_y = 0;

        //The Chosen Path - the path chosen from the various paths that make the same word
        //This is chosen on the basis of the smallest value of X coordinate, and smallest Y in case of a tie.
        //The path is represented by an Array of handler.Coordinate Objects.
        Coordinate[] chosenPath = null;

        //Create a Matrix of the same dimensions as handler.Boggle Grid, but with X & Y coordinates starting with 1 in the lower left corner.
        //Each cell is an Object of the handler.Coordinate class, having an X & Y coordinate.
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                pathGrid[i][j] = new Coordinate(j + 1,rows - i );
            }
        }

        //For each word in the wordsFound Map
        for (String w : wordsFound.keySet()){

            //Start a new String
            StringBuilder br = new StringBuilder().append("");

            //Store the word.
            word = w;

            //Call the resolvePathsToCoordinates method to obtain a chosen path
            chosenPath = resolvePathsToCoordinates(wordsFound.get(w), pathGrid);

            if(chosenPath != null){

                //The first handler.Coordinate element of the Chosen Path is the Starting Location for the Word
                //Take the X & Y coordinate form the fist element and store in the variables.
                start_x = chosenPath[0].x_coordinate;
                start_y = chosenPath[0].y_coordinate;

                //Call the reportNavigationSequence method to obtain the navigation sequence from the Starting Location to the end of the Word.
                reportedPath = reportNavigationSequence(chosenPath);
            }

            //Construct the Reported Path Sting from valid parameters in the format specified : <word> <starting X> <staring Y> <navigation sequence>
            //Separated by '\t', except within the Navigation sequence.
            br.append(word).append("\t").append(String.valueOf(start_x)).append("\t").append(String.valueOf(start_y)).append("\t").append(reportedPath);

            //Add the Reported Path to the List to return.
            resolvedPaths.add(br.toString());
        }

        //Return the List of Reported Paths
        return resolvedPaths;
    }


    /**
     * private method - Resolves Paths to handler.Coordinate Objects.
     *
     * <br><br>
     * This method first converts the paths in the path list of a word (String) in the wordsFound Map to their equivalent paths (handler.Coordinate Object Array)
     * for a new Matrix of the same dimensions as the handler.Boggle Grid but where each cell is a handler.Coordinate class Object, and are differently labeled
     * in the way that both X & Y coordinates begin with 1 in the lower left corner,
     * then pick a specific path for that word (called Chosen Path) based on the rule
     * that the path with the smallest X coordinate would be prioritised, in case of a tie,
     * the smallest Y coordinate is prioritised next
     *
     * @param paths    the paths - List of the various Paths that give the same word in the wordsFound Map
     * @param pathGrid the path grid - A Matrix of the same dimensions as the handler.Boggle Grid, but each cell is an Object of the Class handler.Coordinate.
     * @return an Array of handler.Coordinate Objects, where each element represents the coordinate of every cell in the path to form a word.
     */
    private Coordinate[] resolvePathsToCoordinates( List<String> paths, Coordinate[][] pathGrid ) {

        //List of Paths to store the paths as handler.Coordinate Object Arrays once converted from Strings.
        List<Coordinate[]> listOfPaths = new LinkedList<>();

        //For each Path string in the List
        for (String s : paths) {

            //Split the string at the '|' delimiter which was used to keep different coordinates separate.
            String[] locations = s.split("\\|");

            //New Array of the same length as the number of elements in the path
            Coordinate[] individualPath = new Coordinate[locations.length];

            for (int i = 0; i < locations.length; i++) {

                //Sequentially store the Coordinates from pathGrid to the new Array using the positions (i,j) of the elements.
                individualPath[i] = pathGrid[Integer.parseInt(String.valueOf(locations[i].charAt(0)))][Integer.parseInt(String.valueOf(locations[i].charAt(1)))];
            }

            //Add the individual path array to the List.
            listOfPaths.add(individualPath);
        }

        //Initialise the first array in the list as the chosen path.
        //This helps in case there is only one path for a word in the Grid.
        //Also helps in performing comparisons.
        Coordinate[] chosenPath = listOfPaths.get(0);

        //For each handler.Coordinate Path Array in the List
        //Compare the starting location's X coordinates, and pick the path with the smaller X, assign it to Chosen Path
        //In case of  tie with the X handler.Coordinate, compare the Y coordinates., and assign path with the smaller Y to the Chosen Path
        //This logic can be improved to always pick the least X coordinate for all values in path and not just the starting location.
        for (Coordinate[] path: listOfPaths) {

            //Comparing the first (starting) element's X Coordinates, picking smaller
            if(path[0].x_coordinate < chosenPath[0].x_coordinate){

                chosenPath = path;
            }

           //If X coordinate is same
            if(path[0].x_coordinate == chosenPath[0].x_coordinate) {

                //Compare Y coordinates, pick the smaller
                if (path[0].y_coordinate < chosenPath[0].y_coordinate) {

                    chosenPath = path;
                }
            }

        }

     //Return the Chosen path.
     return chosenPath;

    }


    /**
     * private method - Reports the Navigation Sequence String based on the path for a Word found in the handler.Boggle Grid.
     * <br>
     * Once a Chosen Path is identified for a Word, this method obtains the navigational sequence form that path by comparing
     * the X & Y coordinates of one element to the next one in the handler.Coordinate Object Array Path sequentially, and appending the
     * Direction identified to a string, which is returned once the last element is reached.
     * <br><br>
     * The comparisons are performed using the compareCoordinates method.
     *
     * @param chosenPath the chosenPath - Array of handler.Coordinate Objects, where each element represents the coordinate of every cell in the path to form a word.
     * @return the Navigational Sequence String
     */
    private String reportNavigationSequence(Coordinate[] chosenPath) {

        StringBuilder br = new StringBuilder().append("");

        //Check if the path is not null or empty
        if (chosenPath != null && chosenPath.length > 0){

            for (int i = 0; i < chosenPath.length - 1; i++) {

                //Starting with the first element, perform comparisons to the next element in the path
                // to find out in which direction we move to form the word.
                //Call to compareCoordinates method for comparisons

                char direction = compareCoordinates(chosenPath[i],chosenPath[i+1]);

                if(Character.isAlphabetic(direction)){

                    //Add the returned Directional identifier (L,R,U,D,N,S,W,E) to the Navigational sequence.
                    br.append(direction);
                }
            }
        }

        //Return the Navigational Sequence String obtained from the path.
      return br.toString();
    }


    /**
     * private method - Compare handler.Coordinate Objects.
     * <br>
     * This method compares two objects of the class handler.Coordinate and returns a directional identifier to indicate which
     * direction in the Grid we have to move to go from first handler.Coordinate object to the second handler.Coordinate object.
     * <br><br>
     * This method utilises the logic that we can identify in which of the 8 possible directions
     * we move from first handler.Coordinate to the second coordinate by comparing the values of the X & Y coordinates.
     * The rule and their results are mentioned for each case within the method.
     *
     * @param a the first handler.Coordinate - form where we start in the grid.
     * @param b the second handler.Coordinate - from where we end up in the grid.
     * @return the direction in we had to move to go from 'a' to 'b'.
     */
    private char compareCoordinates( Coordinate a, Coordinate b) {

        char direction = '!';

        //Check if both handler.Coordinate Objects are defined
        if(a != null & b != null){

            //While going from a to b :

            //If the X coordinate value stays the same, but Y decreases, we go Downwards (D).
            if(a.x_coordinate == b.x_coordinate && a.y_coordinate > b.y_coordinate){

                direction = 'D';
            }
            //If the X coordinate value stays the same, but Y increases, we go Upwards (U).
            else if(a.x_coordinate == b.x_coordinate && a.y_coordinate < b.y_coordinate ) {

                direction = 'U';
            }
            //If the Y coordinate value stays the same, but X increases, we go to the Right (R).
            else if(a.y_coordinate == b.y_coordinate && a.x_coordinate < b.x_coordinate ){

                direction = 'R';
            }
            //If the Y coordinate value stays the same, but X decreases, we go to the Left (L).
            else if(a.y_coordinate == b.y_coordinate && a.x_coordinate > b.x_coordinate ){

                direction = 'L';
            }
            //If both X & Y increases, we go Diagonally Up and to the Right (E).
            else if(a.x_coordinate < b.x_coordinate && a.y_coordinate < b.y_coordinate){

                direction = 'E';
            }
            //If both X & Y decreases, we go Diagonally Down and to the Left (W).
            else if(a.x_coordinate > b.x_coordinate && a.y_coordinate > b.y_coordinate){

                direction = 'W';
            }
            //If X increases but Y decreases, we go Diagonally Down and to the Right (S).
            else if(a.x_coordinate < b.x_coordinate && a.y_coordinate > b.y_coordinate){

                direction = 'S';
            }
            //If Y increases but X decreases, we go Diagonally Up and to the Left (N).
            else if(a.x_coordinate > b.x_coordinate && a.y_coordinate < b.y_coordinate){

                direction = 'N';
            }
        }

        //Return the Directional Identifier.
        return direction;
    }


}

