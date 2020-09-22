# osuFM

osu! Farmers Market is an all in one way to find the most farmable maps on osu!. The program supports all game modes, and a wide range of options for gathering data.

# Repository Structure

- `crawler/` Contains code to gather user and beatmap statistics. The crawler is multi-threaded which should help performance. You can choose the number of threads in the config.
- `site/` Contains the front end to display map information.

# Installation

**Requirements**

- osu! api key
- Python 3.5+

**Step 1: Installing requirements**

Clone the repository onto your local machine
`git clone https://github.com/HyperBCS/osuFM.git`

Browse to the crawler folder

`cd crawler`

Install the python requirements

`pip3 install -r requirements.txt`

**Step 2: Config Setup**

Open `keys.cfg.example` and fill out the information. You will need your osu! api key which can be obtained from the bottom of the osu [profile settings](https://osu.ppy.sh/home/account/edit)

Now rename `keys.cfg.example` to `keys.cfg`

**Step 3: Run Crawler**

To begin gathering data.
`python3 crawl.py`

Once this finishes you will have a `comp_maps.csv` and `datemodified` in your crawler directory. These should be placed in `$PROJ_ROOT/site/static/data`

**Step 4: Starting the web interface**

Upload the files to any web host and the site should be running

