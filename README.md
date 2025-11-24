#=========================
# CONFIG SECTION
#=========================
$vaultBaseUrl    = "https://example.vault.com"
$vaultOneTimeUri = "$vaultBaseUrl"
$xVaultToken     = "1234"          # One-time token from portal
$appRole         = "ZS123"         # Update based on your setup
$secretIdFile    = "C:\Secure\secret_id.txt"
$textFilePath    = "C:\Secure\vault_passwords.txt"  # Output file for testing
$domain          = "oracle"
$serviceId       = "sass_owner"    # Update accordingly

#=========================
# STEP 1: GET SECRET ID with One-Time Token
#=========================
Function Get-SecretId {
    if (Test-Path $secretIdFile) {
        Write-Host "Secret ID already exists, using saved value."
        return Get-Content $secretIdFile
    } else {
        $Params = @{
            Method  = "Post"
            Uri     = $vaultBaseUrl
            Headers = @{ "x-vault-token" = $xVaultToken }
        }
        $resp = Invoke-RestMethod @Params
        $data = $resp.data
        
        if ($data -is [string]) {
            if ($data -match "secret_id\s*=\s*([^\;]+);") {
                $secretId = $Matches[1].Trim()
            } elseif ($data.secret_id) {
                $secretId = $data.secret_id
            } else {
                throw "Secret_id not found."
            }
        } elseif ($data.secret_id) {
            $secretId = $data.secret_id
        } else {
            throw "Secret_id not present in response"
        }
        Set-Content -Path $secretIdFile -Value $secretId
        Write-Host "New Secret ID acquired and saved."
        return $secretId
    }
}

#=========================
# STEP 2: GET CLIENT TOKEN using Secret ID
#=========================
Function Get-ClientToken($role_id, $secret_id) {
    $login = "auth/approle/login"
    $URL = "$vaultBaseUrl/v1/$login"
    $body = @{
        "role_id"   = $role_id
        "secret_id" = $secret_id
    }
    $bodyJson = $body | ConvertTo-Json
    $res = Invoke-RestMethod -Uri $URL -Method Post -Body $bodyJson
    $token = $res.auth.client_token
    Write-Host "Client token acquired."
    return $token
}

#=========================
# STEP 3: Retrieve Secret (Database Password)
#=========================
Function Get-DbPassword($clientToken, $domain, $serviceId) {
    $adPasswdsEP = "secrets/database/$domain/static-creds/$serviceId"
    $URL = "$vaultBaseUrl/v1/$adPasswdsEP"
    $headers = @{ "x-vault-token" = $clientToken }
    $res = Invoke-RestMethod -Uri $URL -Method Get -Headers $headers
    $password = $res.data.password
    Write-Host "Password retrieved for $domain/$serviceId"
    return $password
}

#=========================
# STEP 4: Write to TEST Output Text File
#=========================
Function Write-PasswordTextFile($oraclePassword, $sqlPassword) {
    $output = @"
Oracle password: $oraclePassword
SQL password: $sqlPassword
"@
    Set-Content -Path $textFilePath -Value $output
    Write-Host "Passwords written to test text file: $textFilePath"
}

#=========================
# RUN THE WORKFLOW
#=========================
$secretId = Get-SecretId
$clientToken = Get-ClientToken $appRole $secretId
$oraclePassword = Get-DbPassword $clientToken "oracle" $serviceId
$sqlPassword = Get-DbPassword $clientToken "ms-sql" $serviceId # If you want to test multiple

Write-PasswordTextFile $oraclePassword $sqlPassword
