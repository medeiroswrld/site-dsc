import { AdminShell } from "@/components/admin/AdminShell";
import { VehicleForm } from "@/components/admin/VehicleForm";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function NewVehiclePage() {
  await requireAdmin();

  return (
    <AdminShell
      title="Cadastrar veículo"
      description="Preencha os dados do carro. Depois de salvar você adiciona as fotos."
      backHref="/admin"
      backLabel="Estoque"
    >
      <div className="max-w-3xl">
        <VehicleForm />
      </div>
    </AdminShell>
  );
}
