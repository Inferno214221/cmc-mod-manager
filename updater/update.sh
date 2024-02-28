#!/bin/bash

sleep 1

cd ..

find . -mindepth 1 -maxdepth 1 ! -path "./updater" ! -path "./update" -exec rm -r {} + &&

cp -R ./update/* ./ &&

chmod +x ./cmc-mod-manager
./cmc-mod-manager