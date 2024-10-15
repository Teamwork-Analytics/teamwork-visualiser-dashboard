# teamwork-visualiser-dashboard

A dashboard to collect, analyse, and visualize all teamwork activities (i.e., multimodal learning analytics visual interfaces). Several features are adapted from previous work: https://github.com/Teamwork-Analytics/obs-rules and https://github.com/vanechev/obs-tool/

# Running the application

1. Make sure you have the `config.env` file in the `/server` directory, as it contains env variables needed to run the application. Ensure that Node and NPM are available in your system. You can double-check environment variables to direct the path to the `saved_data` directory (i.e., CSV files).

2. Do a global search on the variable IP in .env and replace all occurrences of that IP variable to the IP address of your device for deploying the server.

3. In `/client` and the `/server`, run `npm install` to install the package dependencies. In `/py-server`, run `pip install -r requirements.txt` (ensure you run this using [venv](https://docs.python.org/3/library/venv.html)). 

4. We have four apps to run this system.
   To run the server, in `/server`, run `npm run dev` in the console/terminal.
   To run the client, in `/client`, run `npm start` in the console/terminal.
   To run the visualisation server that uses Python algorithms, in `/py-server`, run `python server-visualiser.py` in the console/terminal.
   To run the data visualisation processing server, in  `py-server`, run `python server.py` in the console/terminal.

5. The application will be running on `localhost:3000`.
