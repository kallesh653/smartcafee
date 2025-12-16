' Cold Drink Billing System - Silent Launcher
' This script launches the application without showing command windows

Dim WshShell, projectPath, fso

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get the directory where this script is located
projectPath = fso.GetParentFolderName(WScript.ScriptFullName)
projectPath = fso.GetParentFolderName(projectPath) ' Go up one level to main project folder

' Check if node_modules exist (first time check)
If Not fso.FolderExists(projectPath & "\backend\node_modules") Then
    MsgBox "First time setup required!" & vbCrLf & vbCrLf & _
           "Please run '⭐ FIRST TIME SETUP.bat' first to install dependencies and create admin user." & vbCrLf & vbCrLf & _
           "After setup completes, you can use this shortcut.", _
           vbExclamation, "Cold Drink Billing System"
    WScript.Quit
End If

' Start Backend Server
WshShell.Run "cmd /c cd /d """ & projectPath & "\backend"" && npm run dev", 0, False

' Wait for backend to start
WScript.Sleep 3000

' Start Frontend Server
WshShell.Run "cmd /c cd /d """ & projectPath & "\frontend"" && npm run dev", 0, False

' Wait for frontend to start
WScript.Sleep 5000

' Open browser
WshShell.Run "http://localhost:8080", 1, False

' Show notification
MsgBox "Cold Drink Billing System Started!" & vbCrLf & vbCrLf & _
       "Application: http://localhost:8080" & vbCrLf & _
       "Backend: http://localhost:8000" & vbCrLf & vbCrLf & _
       "Login:" & vbCrLf & _
       "Username: admin" & vbCrLf & _
       "Password: admin123" & vbCrLf & vbCrLf & _
       "To stop: Open Task Manager and end 'node.exe' processes", _
       vbInformation, "Cold Drink Billing System"

Set WshShell = Nothing
Set fso = Nothing
