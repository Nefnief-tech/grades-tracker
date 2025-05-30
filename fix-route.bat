@echo off
echo Fixing the vocabulary extraction route file...
cd /d f:\grade-tracker-v2
del app\api\vocabulary\extract\route.ts
rename app\api\vocabulary\extract\route.fixed.ts route.ts
echo Fix complete! The route.ts file has been replaced with the fixed version.
pause