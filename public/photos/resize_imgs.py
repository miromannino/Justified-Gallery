#!/usr/bin/python3

import os
import sys
import PIL
from PIL import Image

# Flickr-style suffixes/sizes matching justified-gallery's default
# sizeRangeSuffixes (see src/data/images.ts).
sizes = {
  't': 100,
  'm': 240,
  'n': 320,
  'z': 640,
  'b': 1024,
}

def resize(imgPath, resizedImgPath, longestSizeNewValue):
  img = Image.open(imgPath)
  print('img ' + str(img.size[0]) + 'x' + str(img.size[1]))

  if img.size[0] > img.size[1]:
    percentW = (longestSizeNewValue / float(img.size[0]))
    newH = int(float(img.size[1]) * percentW)
    img = img.resize((longestSizeNewValue, newH), PIL.Image.LANCZOS)
  else:
    percentH = (longestSizeNewValue / float(img.size[1]))
    newW = int(float(img.size[0]) * percentH)
    img = img.resize((newW, longestSizeNewValue), PIL.Image.LANCZOS)

  img.save(resizedImgPath)

for imgPath in sys.argv[1:]:
  splitImgPath = imgPath.split('.')
  imgPathWithoutExt = '.'.join(splitImgPath[:-1])
  for sizeK in sizes.keys():
    resize(imgPath, imgPathWithoutExt + '_' + sizeK + '.' + splitImgPath[-1], sizes[sizeK])
  # The full-resolution original isn't served by the site (see images.ts) —
  # remove it so it doesn't end up shipped under public/.
  os.remove(imgPath)
