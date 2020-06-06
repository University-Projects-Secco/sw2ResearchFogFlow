mvn clean install
#replace the tag if you want to modify the fog function
docker build -t "galaxarum/detect_idle" .
#the modified version must be uploaded to docker hub
docker push galaxarum/detect_idle
