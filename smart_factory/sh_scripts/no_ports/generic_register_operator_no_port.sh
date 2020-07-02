#!/bin/bash
#usage: "sh register-operator.sh 4041 docker_image_name owner [tag]
IMAGE=$1;
OWNER=${2-galaxarum};
VERSION=${3-latest}
curl -iX POST \
          'http://192.168.1.132:8070/ngsi10/updateContext' \
        -H 'Content-Type: application/json' \
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
if [ $? -eq 0 ];
then
  echo "registered operator $IMAGE"
else
  1>&2 echo "failed to register operator $IMAGE"
fi