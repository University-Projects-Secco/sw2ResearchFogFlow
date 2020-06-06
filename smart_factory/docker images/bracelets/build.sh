mvn clean install
#replace the tag if you want to modify the fog function
docker build -t "galaxarum/bracelets" .
#the modified version must be uploaded to docker hub
docker push galaxarum/bracelets
