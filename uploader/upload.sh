#!/bin/bash
if [[ "${AWS_S3_BUCKET}" ]]; then
    echo $PORT
    DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
    cd "$DIR/../crawler"
    python3 "$DIR/../crawler/crawler.py"
    if [ $? -eq 0 ]
    then
        echo "Score crawler successful!"
        echo "Beginning upload to server"
        aws s3 sync "$DIR/../crawler" s3://${AWS_S3_BUCKET}/static --acl public-read --follow-symlinks --exclude "*" --include "osuDB.db" --include "datemodified"  --delete
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
    echo "Enviornment variable for s3 bucket not found"
fi