const { spawn } = require('child_process')
module.exports = function (args, callback) {
    const ps1 = `
    $Excel =  New-Object -ComObject Excel.Application
    $Control = "${args[4]}"
    $Wb = $Excel.Workbooks.Open($Control)
    $Ano = Get-Date -Format 'yyyy'
    $user =  $($($(whoami -fqdn) -split "=")[1] -split ",")[0]
    if ($Wb.Sheets(1).Range("G5").Value -eq ''){$Linha = 5}else{$Linha = $Wb.Sheets(1).Range("G4").End(-4121).Row + 1}
    
    
    $Wb.Sheets(1).Cells($Linha, 5) = "${args[0]}" # Cliente
    $Wb.Sheets(1).Cells($Linha, 6) = "${args[1]}" # Amostra/Produto
    $Wb.Sheets(1).Cells($Linha, 7) = "${args[2]}" # Protocolo
    $Wb.Sheets(1).Cells($Linha, 8) = "${args[3]}" # Orçamento
    $Wb.Sheets(1).Cells($Linha, 9) = Get-Date -Format 'dd/MM/yyyy'
    $Wb.Sheets(1).Cells($Linha, 10) = $user
    $lab = $Wb.Sheets(1).Cells($Linha, 2).Text
    $report = $($lab +  $($Linha - 4).ToString('0000') + '/'+ $Ano)
    $Wb.Close($true)
    $Excel.Visible = $true
    $Excel.Quit()
    Write-Output $report
    `

    const commands = ps1.split('\n')
        .filter((line) => line.trim() !== '')
        .map((line) => line.trim())

    // 65001 is the code page for UTF-8
    const ps = spawn('chcp 65001 >NUL & powershell.exe', [], {
        shell: true
    })

    let outputData = '';
    let getOutput = false;
    ps.stdout.on('data', (data) => {
        data = data.toString();
        if (getOutput) {
            outputData += data;
        }
        if (data.startsWith('PS ')) {
            const command = commands.shift()
            if (command) {
                ps.stdin.write(command + '\r\n')
                if (commands.length === 0) {
                    getOutput = true
                }
            } else {
                const reportNumber = outputData.split('\n')[1].trim()
                callback({
                    report: reportNumber,
                    status: 'ok',
                    html: `<h4>${reportNumber}</h4>`
                })
                ps.kill()
            }
        }
    })

    ps.stderr.on('data', (data) => {
        console.log(data)
        ps.kill()
        throw new Error(data.toString())
    })
}