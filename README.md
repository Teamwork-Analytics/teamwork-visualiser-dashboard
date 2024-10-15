# teamwork-visualiser-dashboard

A dashboard to collect, analyse, and visualize all teamwork activities (i.e., multimodal learning analytics visual interfaces). Several features are adapted from previous work: https://github.com/Teamwork-Analytics/obs-rules and https://github.com/vanechev/obs-tool/

# Running the application

1. Make sure you have the `config.env` file in the `/server` directory, as it contains env variables needed to run the application. Ensure that Node and NPM are available in your system. You can double-check environment variables to direct the path to the `saved_data` directory (i.e., CSV files).

2. Do a global search on the variable IP in .env file and replace all occurrences of that IP variable to the IP address of your device for deploying the server.

3. Update the VISUALISATION_DIR in .env file. This directory is where you save the data. Create that directory and add the sample data. 

4. In `/client` and the `/server`, run `npm install` to install the package dependencies. In `/py-server`, run `pip install -r requirements.txt` (ensure you run this using [venv](https://docs.python.org/3/library/venv.html)). 

5. We have four apps to run this system.
   To run the server, in `/server`, run `npm run dev` in the console/terminal.
   To run the client, in `/client`, run `npm start` in the console/terminal.
   To run the visualisation server that uses Python algorithms, in `/py-server`, run `python server-visualiser.py` in the console/terminal.
   To run the data visualisation processing server, in  `py-server`, run `python server.py` in the console/terminal.

6. The application will be running on `localhost:3000`.

7. Check the sample data in the corresponding session.

# Additional procedures if the MongoDB is not established

Initialising the database: 
Make a post to: http://localhost:5002/api/simulations/ 

with json body:

{
    "simulationId": "494",
    "name": "Thu 29 Aug 2pm-5pm: Session B",
    "projectName": "Peninsula Nursing Simulation 2024"
}

Then, create a session by:

Make a post to: http://localhost:5002/api/simulations/ 

{
    "simulationId": "494",
    "name": "Thu 29 Aug 2pm-5pm: Session B",
    "projectName": "Peninsula Nursing Simulation 2024"
}

Then there should be a session to enter the simulation panel.
