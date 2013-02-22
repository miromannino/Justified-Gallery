java -jar closure/closure-stylesheets.jar --output-file css/jquery.justifiedgallery.min.css css/jquery.justifiedgallery.css
java -jar closure/compiler.jar --js=js/jquery.justifiedgallery.js --js_output_file=js/jquery.justifiedgallery.min.js

cp js/jquery.justifiedgallery.min.js tmp
cat copyright.txt > js/jquery.justifiedgallery.min.js
echo "
" >> js/jquery.justifiedgallery.min.js
cat tmp >> js/jquery.justifiedgallery.min.js

cp css/jquery.justifiedgallery.min.css tmp
cat copyright.txt > css/jquery.justifiedgallery.min.css
echo "
" >> css/jquery.justifiedgallery.min.css
cat tmp >> css/jquery.justifiedgallery.min.css

rm tmp