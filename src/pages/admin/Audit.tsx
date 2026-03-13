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

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
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
    let mounted = true;

    async function load() {
      setLoading(true);

      try {
        const res = (await apiFetch(
          `/audit?search=${encodeURIComponent(
            dq
          )}&page=${page}&limit=${LIMIT}`
        )) as AuditResponse;

        if (!mounted) return;

        setRows(res.data ?? []);
        setTotal(res.total ?? 0);
        setTotalPages(res.totalPages ?? 1);
      } catch {
        if (!mounted) return;

        setRows([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [dq, page]);

  const start = useMemo(() => (page - 1) * LIMIT + 1, [page]);

  const end = useMemo(() => Math.min(page * LIMIT, total), [page, total]);

  return (
    <div className="space-y-6">

      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">

          <div>
            <div className="text-blue-300 text-sm font-semibold tracking-widest">
              ADMIN PANEL
            </div>

            <h1 className="text-3xl font-extrabold mt-1">
              Audit Logs
            </h1>

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
                  <td className="px-6 py-4 text-slate-300">
                    {formatDate(r.createdAt)}
                  </td>

                  <td className="px-6 py-4">
                    <span className={actionBadge(r.action)}>
                      {r.action}
                    </span>
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
          Showing {total === 0 ? 0 : start} – {end} of {total}
        </div>

        <div className="flex gap-2">

          <Button
            variant="ghost"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>

          <Button
            variant="ghost"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>

        </div>

      </div>

    </div>
  );
}