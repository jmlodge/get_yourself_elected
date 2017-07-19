from flask import Flask
from flask import render_template
from pymongo import MongoClient
import os
import json

app = Flask(__name__)

MONGODB_HOST = 'ds163232.mlab.com:63232'
# MONGODB_PORT = 27017
# DBS_NAME = 'donorsUSA'
MONGO_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
DBS_NAME = os.getenv('MONGO_DB_NAME', 'donorsUSA')
COLLECTION_NAME = 'projects'
FIELDS = {'funding_status': True, 'school_state': True, 'school_city': True, 'resource_type': True,
          'poverty_level': True, 'date_posted': True, 'total_donations': True, 'primary_focus_subject': True,
          'grade_level': True, 'school_metro': True,'_id': False}


@app.route('/')
def index():
    return render_template("index.html")


@app.route('/campaign')
def campaign():
    return render_template("campaign.html")


@app.route('/donorsUS/projects')
def donor_projects():

    with MongoClient(MONGO_URI) as conn:

        collection = conn[DBS_NAME][COLLECTION_NAME]
        # filters collection to only return state of interest
        projects = collection.find({'school_state': 'NY'}, projection=FIELDS, limit=20000)
        return json.dumps(list(projects))


if __name__ == '__main__':
    app.run(debug=True)
