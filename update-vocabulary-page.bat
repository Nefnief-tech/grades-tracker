@echo off
echo Updating vocabulary page...
cd /d f:\grade-tracker-v2
copy app\vocabulary\page.new.tsx app\vocabulary\page.tsx /y
echo Update complete! The vocabulary page has been updated with image extraction support.
pause