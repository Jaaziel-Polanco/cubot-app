export default function AdminReportsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Reports</h1>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Sales Report</h2>
          <p className="text-sm text-muted-foreground mb-4">Export all sales data with filters</p>
          <a
            href="/api/admin/reports/sales?format=csv"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Download CSV
          </a>
        </div>

        <div className="bg-card rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Commissions Report</h2>
          <p className="text-sm text-slate-600 mb-4">Export all commissions data</p>
          <a
            href="/api/admin/reports/commissions?format=csv"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Download CSV
          </a>
        </div>
      </div>
    </div>
  )
}
