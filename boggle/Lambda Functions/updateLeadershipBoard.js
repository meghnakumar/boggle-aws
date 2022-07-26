const aws = require('aws-sdk');

exports.handler = async (event, context) => {
    let responseBody = "";
    let statusCode = 0;
    const userID = event['userID']
    const score = event['score']
    const userName = event['userName']
    
    try{
        const params = {
        TableName: "Leadership",
        Item: {
            userID: userID,
            userName: userName,
            score: score
        },
    };
        const docClient = new aws.DynamoDB.DocumentClient();

        //scanning all the values of Leadership table and adding it to an array
        const { Items = [] } =  await docClient.scan({TableName: "Leadership"}).promise();
        Items.sort((a,b) => b.score - a.score);

        //comparing the input score from the score received from table. 
        const isScoreGreater = Items.some( data => data['score'] < score )

        /*Since leadership can store maximum of 5 values, if the items count is less than five this new entry will get added directly 
        to the table else if iscoreGreater is true then it will get added and the other lowest value will be removed from the table*/
        if (Items.length < 5) {
          const data = await docClient.put(params).promise();
        } else if (isScoreGreater){
          const removeItem = Items.pop()
            var fileItem = {
            Key: {
              userID: removeItem['userID']
            },
            TableName: 'Leadership',           
            };
       const removed = await docClient.delete(fileItem, function(err, data) {
              if (err) {
                console.log(err, err.stack);
              }
              else {
                console.log(data);
              }
            });
          
        const data = await docClient.put(params).promise();
        }
        
        statusCode = 204;
        
    }catch (err) {
        console.log(err);
        const message = `Error`;
        console.log(message);
        throw new Error(message);
    }

const response = {
        statusCode: statusCode,
        headers: {
            "Content-Type": "application/json"
        },
        body: responseBody
    };

    return response;
};
