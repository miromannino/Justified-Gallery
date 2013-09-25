@REM For Windows Platform
java -jar closure/closure-stylesheets.jar --output-file css/jquery.justifiedgallery.min.css css/jquery.justifiedgallery.css
java -jar closure/compiler.jar --js=js/jquery.justifiedgallery.js --js_output_file=js/jquery.justifiedgallery.min.js

copy js\jquery.justifiedgallery.min.js tmp
type copyright.txt > js/jquery.justifiedgallery.min.js
echo. >> js\jquery.justifiedgallery.min.js
type tmp >> js\jquery.justifiedgallery.min.js

copy css\jquery.justifiedgallery.min.css tmp
type copyright.txt > css\jquery.justifiedgallery.min.css
echo. >> css\jquery.justifiedgallery.min.css
type tmp >> css\jquery.justifiedgallery.min.css

del tmp