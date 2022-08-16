#Copyright Maple Labs, GNU Affero General Public License v3.0
#https://github.com/maple-labs/xmpl-simulations/blob/cccf213d574334a3d7e61ffaae9cffca2df3fdc9/scripts/write-to-file.sh
#!/usr/bin/env bash
set -e

while getopts f:i: flag
do
    case "${flag}" in
        f) file=${OPTARG};;
        i) input=${OPTARG};;
    esac
done

echo $input >> $file

echo "0x"