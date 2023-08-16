const { spawn } = require('child_process')
module.exports = function (args, callback) {
    let ps1 =``
    if(args[0]=="Inverter - 3 pontos"){
    ps1 = `
    $Excel =  New-Object -ComObject Excel.Application
    $Control = "${args[15]}"
    $Wb = $Excel.Workbooks.Open($Control)

    #script para escrever no arquivo cálculo travas

    $Wb.Sheets(1).Cells(3, 3) = ${args[1]} #Capacidade de Refrigeração 35* - 100%
    $Wb.Sheets(1).Cells(4, 3) = ${args[2]} #Consumo de energia 35* - 100*
    $Wb.Sheets(1).Cells(5, 3) = ${(args[1]*1000)/args[2]} #W/W
    
    $Wb.Sheets(1).Cells(6, 3) = ${args[3]} #Capacidade de Refrigeração 35* - 50%
    $Wb.Sheets(1).Cells(7, 3) = ${args[4]} #Consumo de energia 35* - 50%
    $Wb.Sheets(1).Cells(8, 3) = ${(args[3]*1000)/args[4]} #W/W

    $Wb.Sheets(1).Cells(9, 3) = ${args[5]} #Capacidade de Refrigeração 29* - 50%
    $Wb.Sheets(1).Cells(10, 3) = ${args[6]} #Consumo de energia 29* - 50%
    $Wb.Sheets(1).Cells(11, 3) = ${(args[5]*1000)/args[6]} #W/W

    $Wb.Sheets(1).Cells(12, 3) = ${args[7]} #W/W
    
    $Wb.Sheets(1).Cells(3, 4) = ${args[8]} #Capacidade de Refrigeração 35* - 100%
    $Wb.Sheets(1).Cells(4, 4) = ${args[9]} #Consumo de energia 35* - 100*
    $Wb.Sheets(1).Cells(5, 4) = ${(args[8]*1000)/args[9]} #W/W
    
    $Wb.Sheets(1).Cells(6, 4) = ${args[10]} #Capacidade de Refrigeração 35* - 50%
    $Wb.Sheets(1).Cells(7, 4) = ${args[11]} #Consumo de energia 35* - 50%
    $Wb.Sheets(1).Cells(8, 4) = ${(args[10]*1000)/args[11]} #W/W

    $Wb.Sheets(1).Cells(9, 4) = ${args[12]} #Capacidade de Refrigeração 29* - 50%
    $Wb.Sheets(1).Cells(10, 4) = ${args[13]} #Consumo de energia 29* - 50%
    $Wb.Sheets(1).Cells(11, 4) = ${(args[12]*1000)/args[13]} #W/W

    $Wb.Sheets(1).Cells(12, 4) = ${args[14]} #W/W

    
    $Wb.Close($true)
    $Excel.Visible = $true
    $Excel.Quit()

    $Excel =  New-Object -ComObject Excel.Application
    $Control = "R:\\Compartilhado\\FOR TEL\\DOM\\Arquivos\\Travas_Criterio_B.xlsm"
    $Wb = $Excel.Workbooks.Open($Control)

    $Wb.Sheets(2).Cells(9, 8) = ${args[1]*1000} #Capacidade de Refrigeração 35* - 100%
    $Wb.Sheets(2).Cells(9, 12) = ${args[2]} #Consumo de energia 35* - 100*
    
    $Wb.Sheets(2).Cells(10, 8) = ${args[3]*1000} #Capacidade de Refrigeração 35* - 50%
    $Wb.Sheets(2).Cells(10, 12) = ${args[4]} #Consumo de energia 35* - 50%

    $v1 = ($Wb.Sheets(2).Cells(15, 29).Value())

    $Wb.Close($true)
    $Excel.Visible = $true
    $Excel.Quit()

    $Excel =  New-Object -ComObject Excel.Application
    $Control = "R:\\Compartilhado\\FOR TEL\\DOM\\Arquivos\\ISO16358-1.xlsm"
    $Wb = $Excel.Workbooks.Open($Control)


    $Wb.Sheets(2).Cells(9, 8) = ${args[8]*1000} #Capacidade de Refrigeração 35* - 100%
    $Wb.Sheets(2).Cells(9, 12) = ${args[9]} #Consumo de energia 35* - 100*
    
    $Wb.Sheets(2).Cells(10, 8) = ${args[10]*1000} #Capacidade de Refrigeração 35* - 50%
    $Wb.Sheets(2).Cells(10, 12) = ${args[11]} #Consumo de energia 35* - 50%
    
    $Wb.Sheets(2).Cells(16, 8) = ${args[12]*1000} #Capacidade de Refrigeração 29* - 50%
    $Wb.Sheets(2).Cells(16, 12) = ${args[13]} #Consumo de energia 29* - 50%

    $Wb.Sheets(2).Cells(21, 24) = ${args[7]} #Capacidade de Refrigeração 29* - 50%
    $Wb.Sheets(2).Cells(21, 27) = $v1 #Consumo de energia 29* - 50%

    $Wb.Close($true)
    $Excel.Visible = $true
    $Excel.Quit()

    Write-Output "teste"
    `
    }
    if(args[0]!="Inverter - 3 pontos"){
        callback({
            status: 'Off',
            html: `<h4>Script não executado!</h4>`
        })
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
                callback({
                    status: 'ok',
                    html: `<h4>Valores Escritos!</h4>`
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
