' Cold Drink Billing System - Desktop Shortcut Creator
' Run this ONCE to create a desktop shortcut

Dim WshShell, desktopPath, shortcut, projectPath, fso, iconPath

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get paths
desktopPath = WshShell.SpecialFolders("Desktop")
projectPath = fso.GetParentFolderName(WScript.ScriptFullName)
projectPath = fso.GetParentFolderName(projectPath) ' Go up to main project folder

' Create shortcut
Set shortcut = WshShell.CreateShortcut(desktopPath & "\Cold Drink Billing.lnk")

shortcut.TargetPath = projectPath & "\launcher\ColdDrinkApp.vbs"
shortcut.WorkingDirectory = projectPath
shortcut.Description = "Cold Drink Billing System - Click to start application"
shortcut.IconLocation = "shell32.dll,21" ' Shopping bag icon

shortcut.Save

MsgBox "Desktop shortcut created successfully!" & vbCrLf & vbCrLf & _
       "You will find 'Cold Drink Billing' icon on your desktop." & vbCrLf & vbCrLf & _
       "Double-click it anytime to start the application!" & vbCrLf & vbCrLf & _
       "NOTE: Make sure you have run '⭐ FIRST TIME SETUP.bat' at least once before using the shortcut.", _
       vbInformation, "Shortcut Created"

Set shortcut = Nothing
Set WshShell = Nothing
Set fso = Nothing
