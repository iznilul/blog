#!/bin/bash
for file in `ls`
do
	echo $file
	suffix=${file##*.}
	if [ $suffix == jpg ] || [ $suffix == jpeg ] || [ $suffix == tif ] || [ $suffix == image ] || [ $suffix == png ] || [ $suffix == jpeg ] || [ $suffix == bmp ] || [ $suffix == gif ]
	then
		current=$((`date '+%s'`*1000+`date '+%N'`/1000000))
		filename=$current.$suffix
		mv $file $filename
		echo -n "rename to "
		echo $filename
	fi
done
echo "更名完成"
sleep 5
