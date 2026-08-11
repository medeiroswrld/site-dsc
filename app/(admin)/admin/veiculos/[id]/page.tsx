import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { DeleteVehicleButton } from "@/components/admin/DeleteVehicleButton";
import { PhotoManager } from "@/components/admin/PhotoManager";
import { VehicleForm } from "@/components/admin/VehicleForm";
import { requireAdmin } from "@/lib/admin/auth";
import { getVehicleForAdmin } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function EditVehiclePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ novo?: string }>;
}) {
  await requireAdmin();

  const [{ id }, { novo }] = await Promise.all([params, searchParams]);
  const vehicle = await getVehicleForAdmin(id);
  if (!vehicle) notFound();

  const title = `${vehicle.brand} ${vehicle.model} ${vehicle.version}`.trim();

  return (
    <AdminShell
      title={title}
      description={`Ano ${vehicle.year_model} · ${vehicle.photos.length} foto${
        vehicle.photos.length === 1 ? "" : "s"
      }`}
      backHref="/admin"
      backLabel="Estoque"
      actions={
        <>
          <Link
            href={`/estoque/${vehicle.slug}`}
            target="_blank"
            className="btn btn-secondary btn-md"
          >
            Ver no site
          </Link>
          <DeleteVehicleButton vehicleId={vehicle.id} name={title} />
        </>
      }
    >
      {novo && (
        <p className="mb-8 rounded-xl border border-brand/40 bg-brand/10 px-4 py-3 text-[0.875rem] text-brand-text">
          Veículo cadastrado. Agora envie as fotos — sem elas o carro aparece no
          site com um espaço reservado.
        </p>
      )}

      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-7">
        <PhotoManager vehicleId={vehicle.id} photos={vehicle.photos} />
      </div>

      <div className="mt-10 max-w-3xl">
        <VehicleForm vehicle={vehicle} />
      </div>
    </AdminShell>
  );
}
