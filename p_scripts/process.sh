#!/bin/bash

awk ' { print $(NF-1) }' results.tap | sed s/:// | sed s/-// > r.txt
