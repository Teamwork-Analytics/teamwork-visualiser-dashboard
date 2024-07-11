# fitbit-receiver

A NodeJS server that receive data from Android app (which is fetched from fitbit watch), and store them in csv file.

## Overview

This server open port `3168` to receive API call. Once it received a POST request at `/data` it stores the data point in a csv file (by adding a new line).

## How to run

1. Navigate to this directory using `cd gitbit-receiver` from root of the project.
2. Do `node server.js` to run this server. (`npm install` might be required to install dependencies).
3. [Reminder] While installing android application (android-fitbit-middleman), please ensure the IP address is correctly pointing to this server.

## Configuration

In `dataHandler.js`, configure the filePath so the server save the data into the correct filePath of the devices.

## File saved

The server will check the type and the user of the received data and create a new file for it if it doesn't exist. The name of the file will be similar to: `heart rate-yellow.csv`

## Work in progress - differentiating sessions

The server is currently storing every data it has in the same file. To grab the data for your session, filter the data according to the time and data. We are trying to implement ways so the file will be differentiate by sessions. Once it is done, please remove this section from README.md.
