[CmdletBinding()]
param()

Trace-VstsEnteringInvocation $MyInvocation
try {
	Import-VstsLocStrings "$PSScriptRoot\task.json"

	[string]$verb = Get-VstsInput -Name verb
	[string[]]$otherArgs = (Get-VstsInput -Name otherArgs).Split("`n");

	[System.Console]::OutputEncoding = [System.Text.Encoding]::UTF8

	$tempFile = [guid]::NewGuid()
	$hasError = $false

	& "$PSScriptRoot\MSDeploy.cmd" -verb:$verb $otherArgs "2>>$tempFile.error" | Out-Host

	if (Test-Path "$tempFile.error" -PathType Leaf) {
		gc "$tempFile.error" -Encoding UTF8 | % {
			$hasError = $true
			Write-Warning $_
		}
		Remove-Item "$tempFile.error"
	}

	if ($hasError -eq $true) {
		Write-Error "MsDeploy發生錯誤"
	}
}
finally {
	Trace-VstsLeavingInvocation $MyInvocation
}
