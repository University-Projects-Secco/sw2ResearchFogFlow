mvn clean install
#replace the tag if you want to modify the fog function
docker build -t "galaxarum/measure_robot_status_time" .
#the modified version must be uploaded to docker hub
docker push galaxarum/measure_robot_status_time
