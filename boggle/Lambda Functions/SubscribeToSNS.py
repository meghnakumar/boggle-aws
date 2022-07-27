import json

import logging
import boto3

#Code Reference: https://hands-on.cloud/working-with-sns-in-python-using-boto3/
AWS_REGION = 'us-east-1'

sns_client = boto3.client('sns', region_name=AWS_REGION)

def lambda_handler(event, context):
    body = json.dumps(event)
    print(body)
    print("event",event)
    userEmail = event['userID']
    topic_arn = "arn:aws:sns:us-east-1:045804653870:LeaderboardNotification"
    
    # Create Email Subscription
    response = sns_client.subscribe(TopicArn=topic_arn, Protocol="Email", Endpoint=userEmail)
    subscription_arn = response["SubscriptionArn"]
    output = {
        body: response
    };

    return output;
