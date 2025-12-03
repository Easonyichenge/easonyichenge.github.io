#!/bin/bash
API_KEY="CWA-B5914331-BEC0-45B6-84B8-7A5A415C2B7D"
# Taipei City endpoint
ENDPOINT="F-D0047-061"
URL="https://opendata.cwa.gov.tw/api/v1/rest/datastore/${ENDPOINT}?Authorization=${API_KEY}&limit=1"

curl -s "$URL" > response.json
