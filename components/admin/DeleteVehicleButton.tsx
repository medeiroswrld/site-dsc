"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteVehicle } from "@/lib/admin/actions";

/**
 * Deleting takes the photos out of storage too, so it asks first and names the
 * car — "Excluir?" on its own is too easy to confirm by reflex.
 */
export function DeleteVehicleButton({
  vehicleId,
  name,
}: {
  vehicleId: string;
  name: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    const confirmed = confirm(
      `Excluir "${name}" e todas as fotos dele? Esta ação não pode ser desfeita.\n\nSe o carro foi vendido, prefira mudar a situação para "Vendido".`,
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteVehicle(vehicleId);
      if (result.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        alert(result.message ?? "Não foi possível excluir.");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="btn btn-md border border-line-strong text-fg-subtle transition-colors hover:border-brand hover:text-brand-text"
    >
      {pending ? "Excluindo…" : "Excluir"}
    </button>
  );
}
