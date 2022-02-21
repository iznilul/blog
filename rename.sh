#!/bin/bash
for file in `ls`
do
	echo $file
	suffix=${file##*.}
	if [ $suffix == jpg ] || [ $suffix == tif ] || [ $suffix == image ] || [ $suffix == png ] || [ $suffix == jpeg ] || [ $suffix == bmp ] || [ $suffix == gif ]
	then
		current=$((`date '+%s'`*1000+`date '+%N'`/1000000))
		filename=$current.$suffix
		mv $file $filename
		echo -n "rename to "
		echo $filename
	fi
done
sleep 5