import json

import logging
import boto3

#Code Reference: https://www.kodyaz.com/aws/send-sns-notification-from-aws-lambda-function-using-python.aspx
AWS_REGION = 'us-east-1'
sns_client = boto3.client('sns', region_name=AWS_REGION)
dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)


def lambda_handler(event, context):

    topic_arn = "arn:aws:sns:us-east-1:045804653870:LeaderboardNotification"
    response = dynamodb.Table('Leadership').scan()
    data = response['Items']
    message = ""
    rank=1
    for value in data:
        message+="Rank: "+str(rank)+" \n" +"Score: "+ str(value['score']) + " by "+value['userID']+"\n"
        rank+=1
    print(message)

    #Publishing to a topic
    sns_client.publish(TopicArn=topic_arn, 
        Message=message, 
        Subject="Boggle Game Leaderboard")
    
    