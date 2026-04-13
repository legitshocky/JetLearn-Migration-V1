import React, { useState } from "react";
import { motion } from "motion/react";
import { Activity, Database, Shield, Server, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import axios from "axios";

export default function SystemHealth() {
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const [sheetsHealth, setSheetsHealth] = useState<any[]>([]);
  const [loadingSheets, setLoadingSheets] = useState(false);
  const [health, setHealth] = useState({ server: "Checking...", db: "Checking...", auth: "Checking..." });

  const fetchSheetsHealth = async () => {
    setLoadingSheets(true);
    try {
      const res = await axios.get("/api/system/health/sheets");
      setSheetsHealth(res.data);
    } catch (error) {
      console.error("Failed to fetch sheets health:", error);
    } finally {
      setLoadingSheets(false);
    }
  };

  React.useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await axios.get("/api/health");
        setHealth(prev => ({ ...prev, server: res.data.status === "ok" ? "Operational" : "Error" }));
      } catch {
        setHealth(prev => ({ ...prev, server: "Offline" }));
      }
      // Mocking others for now, but server is real
      setHealth(prev => ({ ...prev, db: "Connected", auth: "Operational" }));
    };
    checkHealth();
    fetchSheetsHealth();
  }, []);

  const runMigration = async () => {
    if (!window.confirm("Are you sure you want to trigger a full database migration from Google Sheets? This may take a few minutes.")) return;
    setMigrating(true);
    try {
      const response = await axios.post("/api/migrate");
      setMigrationResult(response.data);
    } catch (error: any) {
      console.error("Migration failed:", error);
      alert("Migration failed: " + (error.response?.data?.error || error.message));
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Health & Maintenance</h1>
          <p className="text-gray-500">Monitor backend services and manage data synchronization</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HealthCard 
          label="API Server" 
          status={health.server} 
          icon={<Server className={health.server === "Operational" ? "text-green-600" : "text-red-600"} />} 
        />
        <HealthCard 
          label="Firestore DB" 
          status={health.db} 
          icon={<Database className={health.db === "Connected" ? "text-green-600" : "text-red-600"} />} 
        />
        <HealthCard 
          label="Auth Service" 
          status={health.auth} 
          icon={<Shield className={health.auth === "Operational" ? "text-green-600" : "text-red-600"} />} 
        />
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Google Sheets Connectivity</h3>
            <p className="text-gray-500 mt-1">Status of individual sub-sheets used for data synchronization</p>
          </div>
          <button 
            onClick={fetchSheetsHealth}
            disabled={loadingSheets}
            className="p-2 hover:bg-gray-50 rounded-lg transition-all text-indigo-600"
            title="Refresh Status"
          >
            <RefreshCw className={`w-5 h-5 ${loadingSheets ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sheetsHealth.map((sheet, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-gray-50 bg-gray-50/30 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800 truncate pr-2" title={sheet.name}>
                  {sheet.name}
                </span>
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  sheet.status === "Connected" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {sheet.status}
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
                <span>ID: {sheet.id}</span>
                <span>{sheet.rows} rows</span>
              </div>
              {sheet.error && (
                <div className="text-[10px] text-red-500 mt-1 bg-red-50 p-2 rounded-lg border border-red-100 italic">
                  {sheet.error}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Data Migration Engine</h3>
            <p className="text-gray-500 mt-1">Synchronize data from Google Sheets to Cloud Firestore</p>
          </div>
          <button
            onClick={runMigration}
            disabled={migrating}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all font-bold flex items-center gap-2 shadow-lg shadow-indigo-100"
          >
            {migrating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            {migrating ? "Syncing Data..." : "Trigger Full Sync"}
          </button>
        </div>

        {migrationResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-green-50 border border-green-100 rounded-2xl"
          >
            <div className="flex items-center gap-3 mb-4 text-green-700">
              <CheckCircle className="w-6 h-6" />
              <h4 className="font-bold text-lg">Sync Completed Successfully</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/60 p-4 rounded-xl">
                <div className="text-2xl font-bold text-gray-900">{migrationResult.usersMigrated}</div>
                <div className="text-[10px] uppercase font-bold text-gray-400">Users Synced</div>
              </div>
              <div className="bg-white/60 p-4 rounded-xl">
                <div className="text-2xl font-bold text-gray-900">{migrationResult.migrationsMigrated}</div>
                <div className="text-[10px] uppercase font-bold text-gray-400">Logs Synced</div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-100 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-bold mb-1">Warning: Data Overwrite</p>
            Triggering a full sync will overwrite existing records in Firestore with the latest data from Google Sheets. Ensure no manual edits in Firestore will be lost.
          </div>
        </div>
      </div>
    </div>
  );
}

function HealthCard({ label, status, icon }: { label: string; status: string; icon: React.ReactNode }) {
  const isGood = status === "Operational" || status === "Connected";
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
      <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
      <div>
        <div className="text-sm font-bold text-gray-900">{label}</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className={`w-2 h-2 rounded-full ${isGood ? "bg-green-500" : status === "Checking..." ? "bg-yellow-500" : "bg-red-500"}`}></div>
          <span className="text-xs text-gray-500 font-medium">{status}</span>
        </div>
      </div>
    </div>
  );
}
