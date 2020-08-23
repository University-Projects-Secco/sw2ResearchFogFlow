#!/bin/bash

function usage() {
  echo "Command options are:"
  echo "-i image name"
  echo "-t type of input entities"
  echo "[-a ip address of fogflow component. Default is localhost]"
  echo "[-s enables silent output]"
}

IP=localhost
while getopts i:a:t:s option; do #parse input options
  case "${option}" in
  i) IMAGE=${OPTARG} ;;
  a) IP=${OPTARG} ;;
  t) TYPE=${OPTARG} ;;
  s) SILENT=true ;;
  \?) exit 1;;
  *)
    echo "invalid option: ${option}->${OPTARG}. "
    usage
    ;;
  esac
done

if [ -z "${IMAGE}" ]; then echo "Missing image name"; usage; exit 1;
elif [ -z "${TYPE}" ]; then echo "Missing image owner"; usage; exit 1;
fi

curl -iX POST "http://$IP:8070/ngsi10/updateContext" \
  ${SILENT:+'-o /dev/null'} \
  ${SILENT:+'-s'} \
        -H 'Content-Type: application/json' \
        -d "{
  \"contextElements\": [
    {
      \"entityId\": {
        \"id\": \"FogFunction.$IMAGE\",
        \"type\": \"FogFunction\",
        \"isPattern\": false
      },
      \"attributes\": [
        {
          \"name\": \"name\",
          \"type\": \"string\",
          \"value\": \"$IMAGE\"
        },
        {
          \"name\": \"topology\",
          \"type\": \"object\",
          \"value\": {
            \"name\": \"$IMAGE\",
            \"description\": \"\",
            \"tasks\": [
              {
                \"name\": \"main\",
                \"operator\": \"$IMAGE\",
                \"input_streams\": [
                  {
                    \"selected_type\": \"$TYPE\",
                    \"selected_attributes\": [],
                    \"groupby\": \"EntityType\",
                    \"scoped\": false
                  }
                ],
                \"output_streams\": [
                  {
                    \"entity_type\": \"Out\"
                  }
                ]
              }
            ]
          }
        },
        {
          \"name\": \"designboard\",
          \"type\": \"object\",
          \"value\": {
            \"edges\": [
              {
                \"id\": 1,
                \"block1\": 2,
                \"connector1\": [
                  \"stream\",
                  \"output\"
                ],
                \"block2\": 1,
                \"connector2\": [
                  \"streams\",
                  \"input\"
                ]
              }
            ],
            \"blocks\": [
              {
                \"id\": 1,
                \"x\": 40,
                \"y\": -68,
                \"type\": \"Task\",
                \"module\": null,
                \"values\": {
                  \"name\": \"main\",
                  \"operator\": \"$IMAGE\",
                  \"outputs\": [
                    \"Out\"
                  ]
                }
              },
              {
                \"id\": 2,
                \"x\": -275,
                \"y\": -74,
                \"type\": \"EntityStream\",
                \"module\": null,
                \"values\": {
                  \"selectedtype\": \"$TYPE\",
                  \"selectedattributes\": [
                    \"all\"
                  ],
                  \"groupby\": \"EntityType\",
                  \"scoped\": false
                }
              }
            ]
          }
        },
        {
          \"name\": \"intent\",
          \"type\": \"object\",
          \"value\": {
            \"topology\": \"$IMAGE\",
            \"priority\": {
              \"exclusive\": false,
              \"level\": 0
            },
            \"qos\": \"default\",
            \"geoscope\": {
              \"scopeType\": \"global\",
              \"scopeValue\": \"global\"
            }
          }
        },
        {
          \"name\": \"status\",
          \"type\": \"string\",
          \"value\": \"enabled\"
        }
      ],
      \"domainMetadata\": [
        {
          \"name\": \"location\",
          \"type\": \"global\",
          \"value\": \"global\"
        }
      ]
    }
  ],
  \"updateAction\": \"UPDATE\"
}"
RETURN=$?
if [ "$RETURN" -eq 0 ];
then
  echo "registered function $IMAGE"
else
  1>&2 echo "failed to register function $IMAGE"
fi
exit $RETURN