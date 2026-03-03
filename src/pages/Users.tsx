import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { apiFetch } from "../lib/api";
import type { Role, Status } from "../types/rbac";

interface UserRow {
  id: string;
  name: string;
  email: string;
  roleName: Role;
  status: Status;
}

interface UsersResponse {
  data: UserRow[];
  total: number;
  page: number;
  totalPages: number;
}

const LIMIT = 10;

export default function Users() {
  const { user } = useAuth();
  const role: Role = user?.role ?? "USER";

  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState<string>("");
  const dq = useDebounce(q, 400);

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const allowUpdate = role === "ADMIN" || role === "MANAGER";
  const allowDelete = role === "ADMIN";

  
  useEffect(() => {
    setPage(1);
  }, [dq]);

  useEffect(() => {
    let mounted = true;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const res = (await apiFetch<UsersResponse>(
          `/users?search=${encodeURIComponent(dq ?? "")}&page=${page}&limit=${LIMIT}`
        )) as UsersResponse;

        if (!mounted) return;

        setRows(res.data ?? []);
        setTotal(res.total ?? 0);
        setTotalPages(res.totalPages ?? 1);
      } catch {
        if (!mounted) return;
        setError("Failed to load users");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [dq, page]);

  async function onDelete(id: string): Promise<void> {
    if (!allowDelete) return;

    const ok = window.confirm("Soft delete this user?");
    if (!ok) return;

    try {
      await apiFetch(`/users/${id}`, { method: "DELETE" });
      setPage(1);
    } catch {
      setError("Delete failed");
    }
  }

  const start = useMemo(() => (total === 0 ? 0 : (page - 1) * LIMIT + 1), [page, total]);
  const end = useMemo(() => Math.min(page * LIMIT, total), [page, total]);

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="text-3xl font-extrabold">
              {role === "USER" ? "Directory" : "Users"}
            </div>
            <div className="text-sm text-slate-400 mt-1">
              Showing {start} – {end} of {total}
            </div>
          </div>

          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or email..."
            className="w-72"
          />
        </div>
      </Card>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
          {error}
        </div>
      )}

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-950/40 border-b border-slate-800">
            <tr className="text-slate-300">
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-6 text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-6 text-slate-400">
                  No users found.
                </td>
              </tr>
            ) : (
              rows.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-slate-800 hover:bg-slate-900/25"
                >
                  <td className="px-6 py-4 font-semibold">{u.name}</td>
                  <td className="px-6 py-4 text-slate-300">{u.email}</td>
                  <td className="px-6 py-4">{u.roleName}</td>
                  <td className="px-6 py-4">{u.status}</td>
                  <td className="px-6 py-4 text-right">
                    {allowUpdate && <Button variant="ghost">Edit</Button>}
                    {allowDelete && (
                      <Button variant="danger" onClick={() => onDelete(u.id)}>
                        Delete
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">
          Page {page} of {totalPages}
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
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}