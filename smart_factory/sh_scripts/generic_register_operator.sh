#!/bin/bash

function usage() {
  echo "Command options are:"
  echo "-i image name"
  echo "-o owner of the docker image"
  echo "[-a ip address of fogflow component. Default is localhost]"
  echo "[-v version of the docker image. Default is LATEST]"
  echo "[-s enables silent output]"
}

IP=localhost
VERSION=latest
while getopts i:a:o:v:s option; do #parse input options
  case "${option}" in
  i) IMAGE=${OPTARG} ;;
  a) IP=${OPTARG} ;;
  o) OWNER=${OPTARG} ;;
  v) VERSION=${OPTARG} ;;
  s) SILENT=true ;;
  \?) exit 1;;
  *)
    echo "invalid option: ${option}->${OPTARG}. "
    usage
    ;;
  esac
done

if [ -z "${IMAGE}" ]; then echo "Missing image name"; usage; exit 1;
elif [ -z "${OWNER}" ]; then echo "Missing image owner"; usage; exit 1;
fi

curl -iX POST \
  "http://$IP:8070/ngsi10/updateContext" \
  -H 'Content-Type: application/json' \
  ${SILENT:+'-o /dev/null'} \
  ${SILENT:+'-s'} \
  -d "{
   \"contextElements\": [
      {
         \"entityId\":{
            \"id\":\"$IMAGE\",
            \"type\":\"Operator\"
         },
         \"attributes\":[
            {
               \"name\":\"designboard\",
               \"type\":\"object\",
               \"value\":{
                  \"blocks\":[
                     {
                        \"id\":1,
                        \"module\":null,
                        \"type\":\"Operator\",
                        \"values\":{
                           \"description\":\"\",
                           \"name\":\"$IMAGE\"
                        },
                        \"x\":-186,
                        \"y\":-69
                     }
                  ],
                  \"edges\":[]
               }
            },
            {
               \"name\":\"operator\",
               \"type\":\"object\",
               \"value\":{
                  \"description\":\"\",
                  \"name\":\"$IMAGE\",
                  \"parameters\":[]
               }
            }
         ],
         \"domainMetadata\":[
            {
               \"name\":\"location\",
               \"type\":\"global\",
               \"value\":\"global\"
            }
         ]
      },
      {
         \"entityId\":{
            \"id\":\"$OWNER/$IMAGE:$VERSION\",
            \"type\":\"DockerImage\"
         },
         \"attributes\":[
            {
               \"name\":\"image\",
               \"type\":\"string\",
               \"value\":\"$OWNER/$IMAGE\"
            },
            {
               \"name\":\"tag\",
               \"type\":\"string\",
               \"value\":\"$VERSION\"
            },
            {
               \"name\":\"hwType\",
               \"type\":\"string\",
               \"value\":\"X86\"
            },
            {
               \"name\":\"osType\",
               \"type\":\"string\",
               \"value\":\"Linux\"
            },
            {
               \"name\":\"operator\",
               \"type\":\"string\",
               \"value\":\"$IMAGE\"
            },
            {
               \"name\":\"prefetched\",
               \"type\":\"boolean\",
               \"value\":false
            }
         ],
         \"domainMetadata\":[
            {
               \"name\":\"operator\",
               \"type\":\"string\",
               \"value\":\"$IMAGE\"
            },
            {
               \"name\":\"location\",
               \"type\":\"global\",
               \"value\":\"global\"
            }
         ]
      }
   ],
   \"updateAction\": \"UPDATE\"
}
"
if [ $? -eq 0 ]; then
  echo "registered operator $IMAGE"
else
  echo 1>&2 "failed to register operator $IMAGE"
fi