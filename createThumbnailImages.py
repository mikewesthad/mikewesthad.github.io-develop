import os
from PIL import Image

overrideImages = False
qualityVal = 95
desiredWidth = 475.0
imagesDir = os.path.join(os.getcwd(), "assets", "images")

# Recursively find all files in imagesDir
for (root, dirs, files) in os.walk(imagesDir):
	for name in files:
		base, ext = name.split(".")
		ext = ext.lower()
		if ext in ("png", "jpg"):
			pathToOriginal = os.path.join(root, name)
			pathToThumbnail = os.path.join(root, base+"Thumbnail.jpg")

			if overrideImages or not(os.path.isfile(pathToThumbnail)): 
				im = Image.open(pathToOriginal)
				w, h = im.size
				if w > desiredWidth:
					newW = int(desiredWidth)
					newH = int(desiredWidth/w * h)
					imThumb = im.resize((newW, newH), Image.ANTIALIAS)
					imThumb = imThumb.convert("RGB") 
					imThumb.save(pathToThumbnail, quality=qualityVal)
					print "Created thumbnail for {0}".format(pathToOriginal)
