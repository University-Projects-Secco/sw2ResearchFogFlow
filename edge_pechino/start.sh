if [ $# -eq 0 ]; then
	htype='3.0'
else
	htype='arm'
fi

docker run -d   --name=metricbeat_pechino --user=root   --volume="$(pwd)/metricbeat.docker.yml:/usr/share/metricbeat/metricbeat.yml:ro"   --volume="/var/run/docker.sock:/var/run/docker.sock:ro"   --volume="/sys/fs/cgroup:/hostfs/sys/fs/cgroup:ro"   --volume="/proc:/hostfs/proc:ro"   --volume="/:/hostfs:ro"   docker.elastic.co/beats/metricbeat:7.6.0 metricbeat -e   -E output.elasticsearch.hosts=["192.168.1.131:9200"]
docker run -d --name=edgebroker_pechino -v $(pwd)/config.json:/config.json fogflow/broker:$htype
docker run -d --name=edgeworker_pechino -v $(pwd)/config.json:/config.json -v /tmp:/tmp -v /var/run/docker.sock:/var/run/docker.sock fogflow/worker:$htype

