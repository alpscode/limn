import os
import pathlib
from functools import lru_cache
from flask import send_file
from PIL import Image


@lru_cache(maxsize=100)
def list_directory(dir):
    files = []
    for i in pathlib.Path(dir).iterdir():
        if pathlib.Path.is_file(i):
            files.append({'type': 'file', 'address': str(i),
                          'thumb': '/thumb?loc=' + str(i),
                          'src': '/image?loc=' + str(i),
                          'name': '',
                          'no': hash(i)
                          })
            
        else:
            files.append({'type': 'directory', 'address': str(i), 'src': "", 'name': i.name,
            'no': hash(i)})
    return sorted(files, key=lambda i: i['address'])


@lru_cache(maxsize=None)
def get_thumbnail(img_location, size):
    thumb_url = "/tmp/thumbs/" + str(hash(img_location)) + ".jpg"
    if os.path.exists(thumb_url):
        return thumb_url
    img = Image.open(img_location)
    side = min(img.size)
    w, h = img.size
    square = img.crop(((w - side) // 2,
                      (h - side) // 2,
                      (w + side) // 2,
                      (h + side) // 2))
    thumb = square.resize((size, size), Image.LANCZOS)
    thumb.save(thumb_url, quality=90)
    return thumb_url

def get_image(img_location, maxwidth, maxheight):
    if maxwidth is None:
        return img_location
    else:
        cache_url = f"/tmp/cache/{str(hash(img_location))}_w{str(maxwidth)}_h{str(maxheight)}.jpg"
        if os.path.exists(cache_url):
            return cache_url
        img = Image.open(img_location)
        w, h = img.size
        resize_ratio = min(int(maxwidth) / w, int(maxheight) / h)
        resized = img.resize((int(w*resize_ratio), int(h*resize_ratio)), Image.LANCZOS)
        resized.save(cache_url, quality=90)
        return cache_url

def clear_cache():
    list_directory.cache_clear()
