' Cold Drink Billing System - Stop Application
' This script stops all running node processes

Dim WshShell, result

Set WshShell = CreateObject("WScript.Shell")

result = MsgBox("Do you want to stop the Cold Drink Billing System?" & vbCrLf & vbCrLf & _
                "This will close all server processes.", _
                vbQuestion + vbYesNo, "Stop Application")

If result = vbYes Then
    ' Kill all node processes
    WshShell.Run "taskkill /F /IM node.exe", 0, True

    MsgBox "Application stopped successfully!" & vbCrLf & vbCrLf & _
           "All servers have been shut down.", _
           vbInformation, "Cold Drink Billing System"
End If

Set WshShell = Nothing
