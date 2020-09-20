#!/bin/bash
if [[ "${UPLOAD_ADDR}" ]]; then
    [[ "${UPLOAD_PORT}" ]] && PORT=${UPLOAD_PORT} || PORT=80
    echo $PORT
    ADDR="${UPLOAD_ADDR}"
    DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
    cd "$DIR/../crawler"
    python3 "$DIR/../crawler/crawler.py"
    if [ $? -eq 0 ]
    then
        echo "Score crawler successful!"
        echo "Beginning upload to server"
        scp -P $PORT "$DIR/../crawler/osuFM.db" "$ADDR"
        if [ $? -ne 0 ]
        then
            echo "Upload failed please check settings"
            exit 1
        fi
        exit 0
    else
        echo "Crawler failed please check log" >&2
        exit 1
    fi
  
else
    echo "Enviornment variable for upload address not found"
fi