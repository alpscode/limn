from flask import Flask, render_template, request, send_file
from background import list_directory, clear_cache, get_thumbnail, get_image
from flask_cors import CORS
import json


app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 60
CORS(app)


jinja_options = app.jinja_options.copy()
jinja_options.update(dict(
    block_start_string='*%',
    block_end_string='%*',
    variable_start_string='**',
    variable_end_string='**',
    comment_start_string='<#',
    comment_end_string='#>',
))
app.jinja_options = jinja_options


@app.route('/')
def homepage():
    return render_template("index.html", album=list_directory('/usermedia'))


@app.route('/content')
def get_directory():
    dir = request.args.get('dir')
    # return render_template("content.html", items=list_directory(dir))
    return json.dumps(list_directory(dir))


@app.route('/refresh')
def refresh():
    clear_cache()


@app.route('/thumb')
def thumbnail_request():
    image_loc = request.args.get('loc')
    size = int(request.args.get('size', default=200))
    return send_file(get_thumbnail(image_loc, size), mimetype='image')


@app.route('/image')
def image_request():
    image_loc = request.args.get('loc')
    width = request.args.get('width', default=None)
    height = request.args.get('height', default=None)
    return send_file(get_image(image_loc, width, height), mimetype='image')


@app.after_request
def add_header(response):    
  response.headers['X-UA-Compatible'] = 'IE=Edge,chrome=1'
  if ('Cache-Control' not in response.headers):
      response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
      response.headers['Pragma'] = 'no-cache'
  return response


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=False)
