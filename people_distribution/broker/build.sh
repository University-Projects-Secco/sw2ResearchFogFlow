CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -installsuffix cgo -o broker
docker build -t "fogflow/broker_prometheus" .
