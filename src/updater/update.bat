@echo off
setlocal

timeout /t 1 /nobreak >nul 2>&1

cd ..

for /f "delims=" %%i in ('dir /b /a:-D ".\*" ^| findstr /v /c:"updater" /c:"update"') do (
    del /q ".\%%i"
)

for /f "delims=" %%i in ('dir /b /ad ".\*" ^| findstr /v /c:"updater" /c:"update"') do (
    rd /s /q ".\%%i"
)

xcopy /s /e ".\update\*" ".\" /Y

start "" ".\cmc-mod-manager.exe"
