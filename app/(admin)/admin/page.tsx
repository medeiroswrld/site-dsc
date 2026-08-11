import { PendingLink } from "@/components/ui/PendingLink";
import { AdminShell } from "@/components/admin/AdminShell";
import { VehicleTable } from "@/components/admin/VehicleTable";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminStats, listVehiclesForAdmin } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  await requireAdmin();

  const vehicles = await listVehiclesForAdmin();
  const stats = await getAdminStats(vehicles);

  return (
    <AdminShell
      title="Estoque"
      description="Cadastre, edite e publique os veículos que aparecem no site."
      actions={
        <PendingLink href="/admin/veiculos/novo" className="btn btn-primary btn-md">
          Cadastrar veículo
        </PendingLink>
      }
    >
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "No estoque", value: stats.total },
          { label: "Disponíveis", value: stats.available },
          { label: "Reservados", value: stats.reserved },
          { label: "Vendidos", value: stats.sold },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-line bg-surface px-4 py-3.5"
          >
            <dt className="plate text-[0.625rem] uppercase tracking-[0.14em] text-fg-subtle">
              {item.label}
            </dt>
            <dd className="mt-1.5 font-display text-[1.5rem] font-semibold leading-none text-fg tnum">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>

      {stats.withoutPhotos > 0 && (
        <p className="mt-4 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-[0.875rem] text-brand-text">
          {stats.withoutPhotos}{" "}
          {stats.withoutPhotos === 1
            ? "veículo está sem foto e aparece com um espaço reservado no site."
            : "veículos estão sem foto e aparecem com um espaço reservado no site."}
        </p>
      )}

      <div className="mt-8">
        <VehicleTable vehicles={vehicles} />
      </div>
    </AdminShell>
  );
}
