import { AdminShell } from "@/components/admin/AdminShell";
import { NewPasswordForm } from "@/components/admin/NewPasswordForm";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function ChangePasswordPage() {
  const user = await requireAdmin();

  return (
    <AdminShell
      title="Trocar senha"
      description={`Conta ${user.email}.`}
      backHref="/admin"
      backLabel="Estoque"
    >
      <div className="max-w-sm">
        {/* Already signed in, so there is no recovery link to wait for. */}
        <NewPasswordForm requireSession={false} />
      </div>
    </AdminShell>
  );
}
