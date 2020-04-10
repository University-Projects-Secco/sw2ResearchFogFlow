cd ..
cd broker && ./build.sh
cd angular-dashboard && npm install && cd ..
cd context_consumer && npm install && cd ..
cd context_producer && npm install && cd ..
cd fog_function && ./build.sh
