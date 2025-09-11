let fundData = {};

function generateAuctionTable() {
    const fundName = document.getElementById('fundName').value;
    const totalValue = parseFloat(document.getElementById('totalValue').value);
    const numMembers = parseInt(document.getElementById('numInstallments').value);
    const installmentType = document.getElementById('installmentType').value;

    if (!fundName || !totalValue || !numMembers) {
        alert('Please fill in all required fields');
        return;
    }

    fundData = {
        name: fundName,
        totalValue: totalValue,
        numMembers: numMembers,
        installmentType: installmentType,
        monthlyInstallment: totalValue / numMembers
    };

    // Generate auction table
    let tableHTML = `
        <table class="auction-table">
            <thead>
                <tr>
                    <th>Month</th>
                    <th>Description</th>
                    <th>Auction Value (₹)</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (let i = 1; i <= numMembers + 1; i++) {
        if (i === 2) {
            tableHTML += `
                <tr class="organizer-row">
                    <td>${i}</td>
                    <td>Organizer (No Auction)</td>
                    <td>No Auction</td>
                </tr>
            `;
        } else {
            tableHTML += `
                <tr>
                    <td>${i}</td>
                    <td>Auction Month</td>
                    <td><input type="number" id="auction${i}" placeholder="Enter auction value" min="0"></td>
                </tr>
            `;
        }
    }

    tableHTML += `
            </tbody>
        </table>
    `;

    document.getElementById('auctionTableContainer').innerHTML = tableHTML;
    document.getElementById('auctionSection').style.display = 'block';
}

function calculateResults() {
    const { totalValue, numMembers, monthlyInstallment } = fundData;
    const totalDues = numMembers + 1;
    
    let results = [];
    let auctionValues = {};

    // Collect auction values
    for (let i = 1; i <= totalDues; i++) {
        if (i !== 2) { // Skip organizer month
            const auctionInput = document.getElementById(`auction${i}`);
            if (auctionInput && auctionInput.value) {
                auctionValues[i] = parseFloat(auctionInput.value);
            } else if (i !== 2) {
                alert(`Please enter auction value for Month ${i}`);
                return;
            }
        }
    }

    // Calculate total amount each person will pay over all months
    // Organizer doesn't pay, so we exclude month 2 from total dues calculation
    const actualPaymentMonths = totalDues - 1; // Excluding organizer month
    let totalAuctionSavings = 0;
    
    for (let i = 1; i <= totalDues; i++) {
        if (i === 2) {
            // Organizer month - organizer doesn't pay, members don't pay this month
            continue;
        } else {
            // Add auction savings (auction amount divided by number of members)
            const auctionValue = auctionValues[i] || 0;
            totalAuctionSavings += auctionValue / numMembers;
        }
    }

    const totalPaidByEachPerson = (monthlyInstallment * actualPaymentMonths) - totalAuctionSavings;

    // Calculate for each month
    for (let month = 1; month <= totalDues; month++) {
        let result = {
            month: month,
            type: '',
            auctionValue: 0,
            receivedAmount: 0,
            monthlyPayment: monthlyInstallment,
            totalPaid: totalPaidByEachPerson, // Same for everyone after all auction deductions
            profit: 0,
            interestRate: 0,
            duration: totalDues - 1 // Duration in months (excluding the month when money is received)
        };

        if (month === 2) {
            // Organizer month - gets full fund value, organizer doesn't pay anything
            result.type = 'Organizer';
            result.auctionValue = 0;
            result.receivedAmount = totalValue; // Full amount
            result.monthlyPayment = 0; // Organizer doesn't pay
            result.totalPaid = 0; // Organizer never pays into the fund
            result.profit = result.receivedAmount; // Pure profit for organizer
            result.interestRate = 0; // Not applicable for organizer
        } else {
            // Regular auction month
            result.auctionValue = auctionValues[month] || 0;
            result.receivedAmount = totalValue - result.auctionValue;
            
            // Adjusted monthly payment for this specific month (reduced by auction share)
            const auctionSharePerPerson = result.auctionValue / numMembers;
            result.monthlyPayment = monthlyInstallment - auctionSharePerPerson;
        }

        result.profit = result.receivedAmount - result.totalPaid;

        if (result.profit > 0) {
            result.type = result.type || 'RD (Profit)';
            // Calculate RD interest rate
            if (result.totalPaid > 0 && result.duration > 0) {
                const monthlyRate = Math.pow((result.receivedAmount / result.totalPaid), (1 / result.duration)) - 1;
                result.interestRate = monthlyRate * 12 * 100; // Annual rate
            }
        } else if (result.profit < 0) {
            result.type = result.type || 'Loan (Loss)';
            // Calculate loan interest rate
            if (result.receivedAmount > 0 && result.duration > 0) {
                const monthlyRate = Math.pow((result.totalPaid / result.receivedAmount), (1 / result.duration)) - 1;
                result.interestRate = monthlyRate * 12 * 100; // Annual rate
            }
        } else {
            result.type = result.type || 'Break Even';
            result.interestRate = 0;
        }

        results.push(result);
    }

    displayResults(results);
}

function displayResults(results) {
    // Update summary
    document.getElementById('monthlyInstallment').textContent = `₹${fundData.monthlyInstallment.toLocaleString()}`;
    document.getElementById('totalDuration').textContent = `${fundData.numMembers + 1} months`;
    document.getElementById('totalMembers').textContent = fundData.numMembers;

    // Generate results table
    let tableHTML = `
        <table class="results-table">
            <thead>
                <tr>
                    <th>Month</th>
                    <th>Type</th>
                    <th>Auction Value</th>
                    <th>Amount Received</th>
                    <th>Monthly Payment</th>
                    <th>Total Paid</th>
                    <th>Profit/Loss</th>
                    <th>Interest Rate (Annual %)</th>
                    <th>Duration (Months)</th>
                </tr>
            </thead>
            <tbody>
    `;

    results.forEach(result => {
        const rowClass = result.type.includes('Loan') ? 'loan-row' : 
                        result.type.includes('RD') ? 'rd-row' : 'organizer-row';
        
        tableHTML += `
            <tr class="${rowClass}">
                <td>${result.month}</td>
                <td><strong>${result.type}</strong></td>
                <td>₹${result.auctionValue.toLocaleString()}</td>
                <td>₹${result.receivedAmount.toLocaleString()}</td>
                <td>₹${result.monthlyPayment.toLocaleString()}</td>
                <td>₹${result.totalPaid.toLocaleString()}</td>
                <td style="color: ${result.profit >= 0 ? 'green' : 'red'}">
                    ${result.profit >= 0 ? '+' : ''}₹${result.profit.toLocaleString()}
                </td>
                <td><strong>${result.interestRate.toFixed(2)}%</strong></td>
                <td>${result.duration}</td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    document.getElementById('resultsTableContainer').innerHTML = tableHTML;
    document.getElementById('resultsSection').style.display = 'block';
    
    // Show export button
    document.getElementById('exportBtn').style.display = 'inline-block';
}

function exportToExcel() {
    if (!calculationResults.length) {
        alert('No data to export. Please calculate results first.');
        return;
    }

    // Prepare data for Excel
    const excelData = [];
    
    // Add header with fund information
    excelData.push(['Chit Fund Analysis Report']);
    excelData.push(['']);
    excelData.push(['Fund Name:', fundData.name]);
    excelData.push(['Total Fund Value:', `₹${fundData.totalValue.toLocaleString()}`]);
    excelData.push(['Number of Members:', fundData.numMembers]);
    excelData.push(['Installment Type:', fundData.installmentType]);
    excelData.push(['Monthly Installment:', `₹${fundData.monthlyInstallment.toLocaleString()}`]);
    excelData.push(['Total Duration:', `${fundData.numMembers + 1} months`]);
    excelData.push(['']);
    excelData.push(['']);

    // Add table headers
    excelData.push([
        'Month',
        'Type',
        'Auction Value (₹)',
        'Amount Received (₹)',
        'Monthly Payment (₹)',
        'Total Paid (₹)',
        'Profit/Loss (₹)',
        'Interest Rate (Annual %)',
        'Duration (Months)'
    ]);

    // Add calculation results
    calculationResults.forEach(result => {
        excelData.push([
            result.month,
            result.type,
            result.auctionValue,
            result.receivedAmount,
            result.monthlyPayment,
            result.totalPaid,
            result.profit,
            parseFloat(result.interestRate.toFixed(2)),
            result.duration
        ]);
    });

    // Add summary section
    excelData.push(['']);
    excelData.push(['Summary:']);
    
    const loanMonths = calculationResults.filter(r => r.type.includes('Loan')).length;
    const rdMonths = calculationResults.filter(r => r.type.includes('RD')).length;
    const organizerMonths = calculationResults.filter(r => r.type.includes('Organizer')).length;
    
    excelData.push(['Loan Months:', loanMonths]);
    excelData.push(['RD (Profitable) Months:', rdMonths]);
    excelData.push(['Organizer Months:', organizerMonths]);
    
    const avgInterestRate = calculationResults
        .filter(r => r.interestRate > 0 && !r.type.includes('Organizer'))
        .reduce((sum, r) => sum + r.interestRate, 0) / 
        calculationResults.filter(r => r.interestRate > 0 && !r.type.includes('Organizer')).length;
    
    if (!isNaN(avgInterestRate)) {
        excelData.push(['Average Interest Rate:', `${avgInterestRate.toFixed(2)}%`]);
    }

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Set column widths
    ws['!cols'] = [
        { wch: 8 },  // Month
        { wch: 15 }, // Type
        { wch: 18 }, // Auction Value
        { wch: 18 }, // Amount Received
        { wch: 18 }, // Monthly Payment
        { wch: 15 }, // Total Paid
        { wch: 15 }, // Profit/Loss
        { wch: 20 }, // Interest Rate
        { wch: 12 }  // Duration
    ];

    // Style the header rows
    const headerStyle = {
        font: { bold: true, size: 14 },
        fill: { fgColor: { rgb: "4FACFE" } },
        alignment: { horizontal: "center" }
    };

    // Apply styles to headers (row 11 is the table header)
    const headerRow = 10; // 0-indexed
    for (let col = 0; col < 9; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: headerRow, c: col });
        if (!ws[cellRef]) ws[cellRef] = {};
        ws[cellRef].s = headerStyle;
    }

    // Add conditional formatting colors based on type
    for (let i = 0; i < calculationResults.length; i++) {
        const row = headerRow + 1 + i;
        const result = calculationResults[i];
        let fillColor = "";
        
        if (result.type.includes('Loan')) {
            fillColor = "FFE6E6"; // Light red
        } else if (result.type.includes('RD')) {
            fillColor = "E6FFE6"; // Light green
        } else if (result.type.includes('Organizer')) {
            fillColor = "FFF2E6"; // Light orange
        }
        
        if (fillColor) {
            for (let col = 0; col < 9; col++) {
                const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
                if (!ws[cellRef]) ws[cellRef] = {};
                ws[cellRef].s = { fill: { fgColor: { rgb: fillColor } } };
            }
        }
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Chit Fund Analysis');

    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `ChitFund_${fundData.name.replace(/[^a-zA-Z0-9]/g, '_')}_${currentDate}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, filename);
}