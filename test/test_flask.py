#!/usr/local/bin/tentacles/python3/bin/python -tt

from flask import Flask, request
app = Flask(__name__)


@app.route("/")
def index():
    return 'Flask works!'

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8080)
