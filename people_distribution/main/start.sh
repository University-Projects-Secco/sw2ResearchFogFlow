docker-compose down
docker-compose up -d

curl -iX POST 'http://localhost:8070/ngsi10/updateContext' -H 'Content-Type: application/json' -d "@ngsi_register_json/register_image.json"
curl -iX POST 'http://localhost:8070/ngsi10/updateContext' -H 'Content-Type: application/json' -d "@ngsi_register_json/register_operator.json"
sleep 5
curl -iX POST 'http://localhost:8070/ngsi10/updateContext' -H 'Content-Type: application/json' -d "@ngsi_register_json/register_fog_function.json"
