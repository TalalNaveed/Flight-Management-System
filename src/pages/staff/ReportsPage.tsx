import { Container, Paper, TextField, Button, Typography, Grid, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, CardContent } from '@mui/material'
import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Navbar from '../../components/Navbar'
import { getSalesReports } from '../../services/mockApi'

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [reportData, setReportData] = useState<any>(null)

  // Helper: get date N days ago
  const getDaysAgo = (days: number): string => {
    const d = new Date()
    d.setDate(d.getDate() - days)
    return d.toISOString().split('T')[0]
  }

  // Helper: get date N months ago
  const getMonthsAgo = (months: number): string => {
    const d = new Date()
    d.setMonth(d.getMonth() - months)
    return d.toISOString().split('T')[0]
  }

  const handleGenerateReport = async (fromDate?: string, toDate?: string) => {
    try {
      const data = await getSalesReports({
        from: fromDate || dateFrom || undefined,
        to: toDate || dateTo || undefined,
      })
      setReportData(data)
      if (fromDate || toDate) {
        setDateFrom(fromDate || '')
        setDateTo(toDate || '')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to generate report')
    }
  }

  const quickFilters = [
    { label: 'Last 7 Days', action: () => handleGenerateReport(getDaysAgo(7), new Date().toISOString().split('T')[0]) },
    { label: 'Last 30 Days', action: () => handleGenerateReport(getDaysAgo(30), new Date().toISOString().split('T')[0]) },
    { label: 'Last Month', action: () => handleGenerateReport(getMonthsAgo(1), new Date().toISOString().split('T')[0]) },
    { label: 'Last Year', action: () => handleGenerateReport(getMonthsAgo(12), new Date().toISOString().split('T')[0]) },
  ]

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
          Sales Reports
        </Typography>

        {/* Filters Card */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Filter by Date Range
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              type="date"
              label="From"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 200 }}
            />
            <TextField
              type="date"
              label="To"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 200 }}
            />
            <Button variant="contained" color="primary" onClick={() => handleGenerateReport()}>
              Generate Report
            </Button>
          </Box>

          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: '#666' }}>
            Quick Filters:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {quickFilters.map((filter, idx) => (
              <Button key={idx} variant="outlined" size="small" onClick={filter.action}>
                {filter.label}
              </Button>
            ))}
          </Box>
        </Paper>

        {/* Total Summary Card */}
        {reportData && (
          <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #003366 0%, #0099cc 100%)', color: 'white' }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Tickets Sold
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                      {reportData.total || 0}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Revenue
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                      ${(reportData.monthly?.reduce((sum: number, m: any) => sum + (m.revenue || 0), 0) || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Average Revenue/Ticket
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                      ${((reportData.monthly?.reduce((sum: number, m: any) => sum + (m.revenue || 0), 0) || 0) / (reportData.total || 1)).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Months in Report
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                      {reportData.monthly?.length || 0}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Charts and Tables */}
        {reportData && reportData.monthly && reportData.monthly.length > 0 ? (
          <Grid container spacing={3}>
            {/* Bar Chart */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Monthly Ticket Sales
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.monthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" label={{ value: 'Tickets Sold', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Revenue ($)', angle: 90, position: 'insideRight' }} />
                    <Tooltip formatter={(value: any) => typeof value === 'number' ? value.toLocaleString() : value} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="ticketsSold" fill="#003366" name="Tickets Sold" />
                    <Bar yAxisId="right" dataKey="revenue" fill="#0099cc" name="Revenue ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Data Table */}
            <Grid item xs={12}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#003366' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Month</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }} align="right">
                        Tickets Sold
                      </TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }} align="right">
                        Revenue
                      </TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }} align="right">
                        Avg Price/Ticket
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.monthly.map((row: any) => (
                      <TableRow key={row.month} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                        <TableCell sx={{ fontWeight: 500 }}>{row.month}</TableCell>
                        <TableCell align="right">{row.ticketsSold.toLocaleString()}</TableCell>
                        <TableCell align="right">${row.revenue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</TableCell>
                        <TableCell align="right">
                          ${(row.revenue / row.ticketsSold).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Summary Row */}
                    <TableRow sx={{ backgroundColor: '#f0f0f0', fontWeight: 600 }}>
                      <TableCell sx={{ fontWeight: 700 }}>TOTAL</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {reportData.monthly.reduce((sum: number, m: any) => sum + m.ticketsSold, 0).toLocaleString()}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        ${reportData.monthly.reduce((sum: number, m: any) => sum + m.revenue, 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        ${(reportData.monthly.reduce((sum: number, m: any) => sum + m.revenue, 0) / reportData.total).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        ) : (
          <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
            Select a date range and generate a report to view sales data.
          </Typography>
        )}
      </Container>
    </>
  )
}