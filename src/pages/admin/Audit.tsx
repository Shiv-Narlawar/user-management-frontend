import { useEffect, useMemo, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { apiFetch } from "../../lib/api";
import { useDebounce } from "../../hooks/useDebounce";

interface AuditRow {
  id: string;
  action: string;
  actorId?: string;
  actorEmail?: string;
  actorName?: string;
  entityId?: string;
  entityType?: string;
  message?: string;
  createdAt: string;
}

interface AuditResponse {
  data: AuditRow[];
  total: number;
  page: number;
  totalPages: number;
}

const LIMIT = 10;

function parseAuditDate(value: string) {
  if (!value) return null;

  const trimmed = value.trim();

  // If backend sends ISO with timezone, use directly
  // Example: 2026-03-16T10:30:00.000Z
  const hasTimezone =
    trimmed.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(trimmed);

  const parsed = new Date(hasTimezone ? trimmed : `${trimmed}Z`);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function formatDate(value: string) {
  const date = parseAuditDate(value);

  if (!date) return value;

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }).format(date);
}

function actionBadge(action: string) {
  const base =
    "text-xs font-semibold px-3 py-1 rounded-full border inline-block";

  if (action.includes("LOGIN")) {
    return `${base} text-emerald-300 border-emerald-500/30 bg-emerald-500/10`;
  }

  if (action.includes("CREATED")) {
    return `${base} text-sky-300 border-sky-500/30 bg-sky-500/10`;
  }

  if (action.includes("UPDATED")) {
    return `${base} text-yellow-300 border-yellow-500/30 bg-yellow-500/10`;
  }

  if (action.includes("DELETED")) {
    return `${base} text-rose-300 border-rose-500/30 bg-rose-500/10`;
  }

  return `${base} text-slate-300 border-slate-700 bg-slate-800`;
}

function normalizeRows(rows: AuditRow[]) {
  const uniqueMap = new Map<string, AuditRow>();

  for (const row of rows) {
    if (!row?.id) continue;

    if (!uniqueMap.has(row.id)) {
      uniqueMap.set(row.id, row);
    }
  }

  return Array.from(uniqueMap.values()).sort((a, b) => {
    const aTime = parseAuditDate(a.createdAt)?.getTime() ?? 0;
    const bTime = parseAuditDate(b.createdAt)?.getTime() ?? 0;
    return bTime - aTime;
  });
}

export default function Audit() {
  const [q, setQ] = useState("");
  const dq = useDebounce(q, 350);

  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<AuditRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPage(1);
  }, [dq]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);

      try {
        const res = (await apiFetch(
          `/audit?search=${encodeURIComponent(
            dq
          )}&page=${page}&limit=${LIMIT}`
        )) as AuditResponse;

        if (ignore) return;

        const normalizedRows = normalizeRows(res.data ?? []);

        setRows(normalizedRows);
        setTotal(res.total ?? normalizedRows.length ?? 0);
        setTotalPages(Math.max(res.totalPages ?? 1, 1));
      } catch (error) {
        if (ignore) return;

        console.error("Failed to load audit logs:", error);
        setRows([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [dq, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages || 1);
    }
  }, [page, totalPages]);

  const start = useMemo(() => {
    if (total === 0) return 0;
    return (page - 1) * LIMIT + 1;
  }, [page, total]);

  const end = useMemo(() => {
    if (total === 0) return 0;
    return Math.min(page * LIMIT, total);
  }, [page, total]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-blue-300 text-sm font-semibold tracking-widest">
              ADMIN PANEL
            </div>

            <h1 className="text-3xl font-extrabold mt-1">Audit Logs</h1>

            <p className="text-slate-400 mt-1 text-sm">
              View system activities and administrative actions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search audit logs..."
              className="w-72"
            />

            <Button
              variant="ghost"
              onClick={() => {
                setQ("");
                setPage(1);
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-950/40 border-b border-slate-800">
            <tr className="text-slate-300">
              <th className="px-6 py-3 text-left">Time</th>
              <th className="px-6 py-3 text-left">Action</th>
              <th className="px-6 py-3 text-left">Actor</th>
              <th className="px-6 py-3 text-left">Message</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-6 text-slate-400">
                  Loading audit logs...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-6 text-slate-400">
                  No audit logs found.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-slate-800/70 hover:bg-slate-900/25"
                >
                  <td className="px-6 py-4 text-slate-300 whitespace-nowrap">
                    {formatDate(r.createdAt)}
                  </td>

                  <td className="px-6 py-4">
                    <span className={actionBadge(r.action)}>{r.action}</span>
                  </td>

                  <td className="px-6 py-4 text-slate-300">
                    {r.actorEmail ?? r.actorName ?? r.actorId ?? "System"}
                  </td>

                  <td className="px-6 py-4 text-slate-300">
                    {r.message ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">
          Showing {start} – {end} of {total}
          {totalPages > 1 ? ` • Page ${page} of ${totalPages}` : ""}
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            disabled={page === 1 || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>

          <Button
            variant="ghost"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}