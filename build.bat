@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo 关闭所有 ClaudeTrans 进程...
taskkill /F /IM ClaudeTrans.exe 2>nul

echo 删除旧版本...
if exist "dist" (
    rmdir /s /q dist
    echo 已删除 dist 文件夹
)

echo.
echo 开始打包...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo 打包成功！
    echo ========================================
    echo.
    start "" "%~dp0dist\win-unpacked"
) else (
    echo.
    echo ========================================
    echo 打包失败，请检查错误信息
    echo ========================================
)

pause
