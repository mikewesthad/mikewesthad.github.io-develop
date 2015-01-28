import os
import Image

overrideImages = False
qualityVal = 90
desiredWidth = 1920.0
imagesDir = os.path.join(os.getcwd(), "assets", "images", "projects", "view_history")

# Recursively find all files in imagesDir
for (root, dirs, files) in os.walk(imagesDir):
	for name in files:
		base, ext = name.split(".")
		ext = ext.lower()
		if ext in ("png", "jpg"):
			pathToOriginal = os.path.join(root, name)
			pathToCompressed = os.path.join(root, base+"_comp.jpg")
			mbFileSize = os.stat(pathToOriginal).st_size/1024.0/1024.0
			if mbFileSize > 1:
				print name, mbFileSize

				im = Image.open(pathToOriginal)
				w, h = im.size
				if w > desiredWidth:
					newW = int(desiredWidth)
					newH = int(desiredWidth/w * h)
					imCompressed = im.resize((newW, newH), Image.ANTIALIAS)
					imCompressed = imCompressed.convert("RGB") 
					imCompressed.save(pathToCompressed, quality=qualityVal)
					