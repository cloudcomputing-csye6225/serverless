Introduction
The Assignment Submission System is a serverless application designed to handle and process assignment submissions. It utilizes AWS Lambda, Mailgun for email notifications, Google Cloud Storage for storing assignment submissions, and DynamoDB for tracking submission information.

Dependencies
The system relies on the following external libraries and services:

mailgun-js: Used for sending email notifications through the Mailgun API.
@google-cloud/storage: Google Cloud Storage client library for Node.js.
node-fetch: A lightweight module that brings window.fetch to Node.js.
aws-sdk: The official AWS SDK for JavaScript, used for DynamoDB integration.
uuid: Generates unique identifiers.
Configuration
Ensure that you have the required environment variables set:

MAILGUN_API_KEY: Mailgun API key for sending emails.
MAILGUN_DOMAIN: Mailgun domain for sending emails.
GOOGLE_ACCESS_KEY: Base64-encoded Google Cloud service account key.
GOOGLE_PROJECT_ID: Google Cloud project ID.
GOOGLE_BUCKET_NAME: Google Cloud Storage bucket name.
DYNAMODB_TABLE_NAME: DynamoDB table name.
Handler Function
The handler function is the entry point for AWS Lambda. It processes SNS messages triggered by assignment submissions. The key steps include:

Parsing the SNS message.
Extracting relevant information such as GitHub URL, assignment ID, email, and account ID.
Generating a timestamp and constructing an object name for the assignment ZIP file.
Uploading the assignment to Google Cloud Storage using the uploadAssignment function.
Sending email notifications through Mailgun based on the upload status.
Recording submission information in DynamoDB.
Upload to Google Cloud Storage
The uploadAssignment function is responsible for uploading assignment submissions to Google Cloud Storage. Key steps include:

Decoding the base64-encoded Google Cloud service account key.
Initializing the Google Cloud Storage client with the provided project ID and credentials.
Fetching the assignment ZIP file from the provided GitHub URL.
Saving the assignment ZIP file to the specified Google Cloud Storage bucket and object name.
Returning a status of "SUCCESS" or "FAILURE" based on the upload result.
DynamoDB Integration
The system integrates with DynamoDB to record assignment submission information. The put operation adds a new item to the specified DynamoDB table, including details such as assignment ID, GitHub URL, status, timestamp, email, and bucket location.