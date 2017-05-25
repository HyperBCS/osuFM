# osuFM

This is an all in one way to find the most farmable maps on osu!. The program supports all game modes, and a wide range of options for gathering data. Data can be gathered from the top 10k players and the scores be analyzed to determine the best maps.

# Repository Structure

- `crawler/` Contains code to gather user and beatmap statistics
- `osuFM/` Contains the front end to display map information

# Installation

**Requirements**

- Node.js
- npm
- Python 3.5+

**Step 1: Installing requirements**

Clone the repository onto your local machine
`git clone https://github.com/HyperBCS/osuFM.git`

Browse to the crawler folder

`cd crawler`

Install the python requirements

`pip3 install -r requirements.txt`

Install the node.js requirements

    cd ../osuFM
    npm install

**Step 2: Config Setup**

Open `keys.cfg.example` and fill out the information. You will need your osu! api key which can be obtained [here](https://osu.ppy.sh/p/api)

Now rename `keys.cfg.example` to `keys.cfg`

**Step 3: Run Crawler**

To begin gathering data.
`python3 crawl.py`

Once this finishes you will have all the data to run the site. The database is automatically created and placed into the right place.

**Step 4: Starting the web interface**

This will start the web interface on port 5000.

    cd ../osuFM
    npm start
    
To access the site point your browser to [localhost:5000](http://localhost:5000)
