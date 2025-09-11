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
