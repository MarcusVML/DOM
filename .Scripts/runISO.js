const { spawn } = require('child_process')

module.exports = function (args, callback) {
    let ps1 =``
    if(args[0]=="Inverter - 3 pontos"){
    ps1 = `
    $Excel =  New-Object -ComObject Excel.Application
    $Control = "${args[7]}"
    $Wb = $Excel.Workbooks.Open($Control)

    $Wb.Sheets(2).Cells(9, 8) = ${args[1]} #Capacidade de Refrigeração 35* - 100%
    $Wb.Sheets(2).Cells(9, 12) = ${args[2]} #Consumo de energia 35* - 100*
    
    $Wb.Sheets(2).Cells(10, 8) = ${args[3]} #Capacidade de Refrigeração 35* - 50%
    $Wb.Sheets(2).Cells(10, 12) = ${args[4]} #Consumo de energia 35* - 50%
    
    $Wb.Sheets(2).Cells(16, 8) = ${args[5]} #Capacidade de Refrigeração 29* - 50%
    $Wb.Sheets(2).Cells(16, 12) = ${args[6]} #Consumo de energia 29* - 50%

    $v1 = ($Wb.Sheets(2).Cells(14, 29).Value())
    $v2 = ($Wb.Sheets(2).Cells(15, 29).Value())
    $Wb.Close($true)
    $Excel.Visible = $true
    $Excel.Quit()
    Write-Output $v1" - "$v2
    `
    }

    if(args[0]=="Fixo - 2 pontos"){
        ps1 = `
        $Excel =  New-Object -ComObject Excel.Application
        $Control = "${args[5]}"
        $Wb = $Excel.Workbooks.Open($Control)
    
        $Wb.Sheets(5).Cells(9, 8) = ${args[1]} #Capacidade de Refrigeração 35* - 100%
        $Wb.Sheets(5).Cells(9, 12) = ${args[2]} #Consumo de energia 35* - 100*
        
        $Wb.Sheets(5).Cells(13, 8) = ${args[3]} #Capacidade de Refrigeração 29* - 50%
        $Wb.Sheets(5).Cells(13, 12) = ${args[4]} #Consumo de energia 29* - 50%

    
        $v1 = ($Wb.Sheets(5).Cells(12, 29).Value())
        $v2 = ($Wb.Sheets(5).Cells(13, 29).Value())
        $Wb.Close($true)
        $Excel.Visible = $true
        $Excel.Quit()
        Write-Output $v1" - "$v2
        `
    }

    if(args[0]=="Fixo - 1 ponto"){
        ps1 = `
        $Excel =  New-Object -ComObject Excel.Application
        $Control = "${args[5]}"
        $Wb = $Excel.Workbooks.Open($Control)
    
        $Wb.Sheets(5).Cells(9, 8) = ${args[1]} #Capacidade de Refrigeração 35* - 100%
        $Wb.Sheets(5).Cells(9, 12) = ${args[2]} #Consumo de energia 35* - 100*
        
        $Wb.Sheets(5).Cells(13, 8) = ${args[3]} #Capacidade de Refrigeração 29* - 50% (No caso ele apenas utiliza os valores alterados do ensaio a 35 -100)
        $Wb.Sheets(5).Cells(13, 12) = ${args[4]} #Consumo de energia 29* - 50% (No caso ele apenas utiliza os valores alterados do ensaio a 35 -100)

    
        $v1 = ($Wb.Sheets(5).Cells(12, 29).Value())
        $v2 = ($Wb.Sheets(5).Cells(13, 29).Value())
        $Wb.Close($true)
        $Excel.Visible = $true
        $Excel.Quit()
        Write-Output $v1" - "$v2
        `
    }

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
                    Consumo_energia: reportNumber.split(' - ')[0],
                    IDRS: reportNumber.split(' - ')[1],
                    status: 'ok',
                    html: `<h4>Valores Adquiridos!</h4>`
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