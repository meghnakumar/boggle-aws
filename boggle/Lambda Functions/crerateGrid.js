const AWS = require("aws-sdk");

// Configure AWS Lambda Region
AWS.config.update({region: "us-east-1"});
const lambda = new AWS.Lambda();


//Generates a random letter of the alphabet - uses both upper case and lower case letter to increase randomness
function getRandomLetter() {

    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    let character = possible.charAt(Math.floor(Math.random() * possible.length));

    return character;
}

// Generates a random Vowel - uses both upper case and lower case letter to increase randomness
function getRandomVowel() {

    const possible = "aeiouAEIOU";

    let character = possible.charAt(Math.floor(Math.random() * possible.length));

    return character;
}

//Randomly selects a position in a Grid row
function between(min, max) {
    return Math.floor(
        Math.random() * (max - min) + min
    )
}

//Fisher Yates algorithm for random shuffle, shuffles the grid letters to increase randomness
function fisherYates ( matrix ) {

    var i = matrix.length;

    if ( i == 0 ) return false;

    while ( --i ) {

        var j = Math.floor( Math.random() * ( i + 1 ) );
        [matrix[i], matrix[j]] = [matrix[j], matrix[i]];

    }

    return matrix;
}


//handler function
exports.handler = (event, context) => {

    const gridDimension = event['gridSize'];
    const gridSize = gridDimension * gridDimension;
    console.log("Input Grid Size: " + gridDimension)

    let matrix = new Array(gridDimension);
    var i, j = 0;

    for (i = 0; i < gridDimension; i++) {

        matrix[i] = new Array(gridDimension);

        for (j = 0; j < gridDimension; j++) {

            var letter = getRandomLetter();
            matrix[i][j]= letter;
        }
    }

    console.log("Generated matrix : " + matrix)

    //Checks number of vowels in a grid row
    const count = str => (str.match(/[aeiouAEIOU]/gi) || []).length;
    for (const row in matrix) {
        let c = count(matrix[row].toString());

        //if there are no vowels, randomly add one in a random position - Vowels lead to more words.
        if(c == 0){
            let split = matrix[row].toString().split(',')
            let loc = between(0, gridDimension)
            split[loc] = getRandomVowel()
            console.log("Correcting for Vowels in row : " + (parseFloat(row) + 1))
            matrix[row] = split
        }
    }


    console.log("Before Shuffle: " + matrix);

    //perform fisher yates shuffle
    const matrixShuffled = fisherYates(matrix);

    console.log("After Shuffle : " + matrixShuffled);


    const finalGrid = [];
    //convert all letters touppercase for Front-end
    matrix.forEach( x => finalGrid.push(x.toString().toUpperCase() ));
    console.log("All To Uppercase: " + finalGrid);

    //Flatten the gird from matrix to one string
    let finalGridToString = '';
    for (var sec in finalGrid) {
        finalGridToString += finalGrid[sec] + ',';
    }

    //Create request grid for SolveBogglegrid Lambda function
    let outMatrix = {};
    outMatrix['gridSize'] = gridDimension;
    outMatrix['grid'] = finalGridToString.replace(/,\s*$/, "");
    outMatrix['switch'] = 'true'
    console.log("Payload for solveBoggleGrid : ");
    console.dir(outMatrix, {
        depth: null,
    });


    //Configure packet for SolveBogglegrid Lambda function
    var params = {
        FunctionName: 'solveBoggleGrid', // the lambda function we are going to invoke
        InvocationType: 'RequestResponse',
        LogType: 'Tail',
        Payload: JSON.stringify(outMatrix)
    };


    //Invoke solveBoggleGrid Lambda function
    var promise = new Promise(function(resolve,reject){
        lambda.invoke(params, function(err, data) {
            if (err) {
                reject(err);
            } else {

                resolve(data.Payload);
            }
        });
    });

    //Resolve the response, and send it back as a response for the lambda
    promise.then(function(list){
        outMatrix['listOfWords'] = JSON.parse(list);
        outMatrix['numberOfWords'] = Object.keys(outMatrix['listOfWords']).length;
        console.log("Final Output Response : "  + outMatrix)
        context.succeed(outMatrix)
    });


};
