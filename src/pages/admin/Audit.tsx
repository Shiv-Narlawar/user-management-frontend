import { useEffect, useMemo, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { apiFetch } from "../../lib/api";
import { useDebounce } from "../../hooks/useDebounce";

type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "USER_CREATED"
  | "USER_UPDATED"
  | "USER_DELETED"
  | "ROLE_UPDATED"
  | "PERMISSIONS_UPDATED"
  | "DEPARTMENT_CREATED"
  | "DEPARTMENT_UPDATED"
  | "DEPARTMENT_DELETED"
  | "USER_ASSIGNED_TO_DEPT";

interface AuditRow {
  id: string;
  action: AuditAction | string;
  actorId?: string;
  actorEmail?: string;
  targetId?: string;
  targetType?: string;
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

export default function Audit() {
  const [q, setQ] = useState("");
  const dq = useDebounce(q, 350);

  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [endpointMissing, setEndpointMissing] = useState(false);

  // Reset to first page when search changes
  useEffect(() => {
    setPage(1);
  }, [dq]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setEndpointMissing(false);

      try {
        const res = (await apiFetch(
          `/audit?search=${encodeURIComponent(dq)}&page=${page}&limit=${LIMIT}`
        )) as Partial<AuditResponse>;

        if (!mounted) return;

        const data = res.data ?? [];

        setRows(data);
        setTotal(res.total ?? data.length);
        setTotalPages(res.totalPages ?? 1);
      } catch {
        if (!mounted) return;

        setEndpointMissing(true);
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
  const end = useMemo(
    () => Math.min(page * LIMIT, total),
    [page, total]
  );

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-blue-300 text-sm font-semibold tracking-widest">
              ADMIN
            </div>
            <div className="text-4xl font-extrabold mt-2">
              Audit Logs
            </div>
            <div className="text-slate-400 mt-2">
              Track security & administrative actions.
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by action / email / message..."
              className="w-80"
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

      {endpointMissing && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/30 p-6 text-slate-300">
          <div className="text-lg font-bold">
          </div>
          <div className="mt-2 text-sm text-slate-400">
            <span className="text-slate-200 font-semibold">
            </span>{" "}
            to display logs here.
          </div>
        </div>
      )}

      {!endpointMissing && (
        <>
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
                      Loading…
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-6 text-slate-400">
                      No audit events found.
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
                      <td className="px-6 py-4 font-semibold">
                        {r.action}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {r.actorEmail ?? r.actorId ?? "—"}
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

          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">
              Showing {total === 0 ? 0 : start}–{end} of {total}
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
        </>
      )}
    </div>
  );
}