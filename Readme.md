# Chit Fund Calculator

A comprehensive web-based calculator to analyze chit fund investments, calculate interest rates, and determine whether each month acts as a loan or recurring deposit (RD).

## Features

- **Dynamic Calculation**: Enter fund details and auction values to get instant analysis
- **Interest Rate Analysis**: Calculate effective annual interest rates for each month
- **Loan vs RD Classification**: Automatically determines if a month is profitable (RD) or costly (Loan)
- **Organizer Analysis**: Special handling for organizer month calculations
- **Responsive Design**: Works on desktop and mobile devices

## How to Use

1. Enter your fund details:
   - Fund name
   - Total fund value
   - Number of members
   - Installment type (monthly/weekly)

2. Input auction values for each month
3. Click "Calculate Interest Rates" to see detailed analysis

## Hosting

### GitHub Pages
1. Fork/clone this repository
2. Go to repository Settings → Pages
3. Select source branch (main/master)
4. Your site will be available at `https://yourusername.github.io/chit-fund-calculator`

### Amazon S3
1. Create an S3 bucket
2. Enable static website hosting
3. Upload all files maintaining the folder structure
4. Set index.html as the index document

## License

MIT License - Feel free to use and modify as needed.