import Link from "next/link";
import { Phone, WhatsApp } from "@/components/ui/icons";
import { formatPrice, vehicleTitle } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import { whatsappVehicleLink } from "@/lib/whatsapp";
import type { Vehicle } from "@/types/vehicle";

/**
 * The purchase panel. Its copy changes with the vehicle's status so a sold car
 * never shows a buy button, and a reserved one says so before the visitor
 * writes a message.
 */
export function VehicleContactCTA({ vehicle }: { vehicle: Vehicle }) {
  const sold = vehicle.status === "sold";
  const reserved = vehicle.status === "reserved";

  return (
    <div className="rounded-2xl border border-line bg-surface p-6 lg:p-7">
      {(sold || reserved) && (
        <p className="plate mb-4 inline-flex rounded-full bg-surface-3 px-3 py-1.5 text-[0.6875rem] uppercase leading-none tracking-[0.12em] text-fg">
          {sold ? "Vendido" : "Reservado"}
        </p>
      )}

      <p className="eyebrow">{sold ? "Anunciado por" : "Preço"}</p>
      <p
        className={`mt-2 font-display text-[2rem] font-semibold leading-none tracking-[-0.035em] tnum ${
          sold ? "text-fg-subtle line-through decoration-1" : "text-fg"
        }`}
      >
        {formatPrice(vehicle.price)}
      </p>

      {sold ? (
        <>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-fg-muted">
            Este veículo já foi vendido. A equipe pode avisar quando entrar algo
            parecido no estoque.
          </p>
          <div className="mt-6 space-y-3">
            <Link
              href="/estoque"
              className="btn btn-primary btn-lg group w-full"
            >
              Ver veículos disponíveis
            </Link>
            <a
              href={whatsappVehicleLink(vehicle)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-lg w-full"
            >
              <WhatsApp className="text-[1.125rem]" />
              Procuro um carro assim
            </a>
          </div>
        </>
      ) : (
        <>
          {reserved && (
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-fg-muted">
              Reservado para um cliente. Vale perguntar — reservas nem sempre se
              confirmam.
            </p>
          )}

          <div className="mt-6 space-y-3">
            <a
              href={whatsappVehicleLink(vehicle)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-lg w-full"
            >
              <WhatsApp className="text-[1.125rem]" />
              Tenho interesse neste veículo
            </a>

            <Link
              href={`/financiamento?veiculo=${vehicle.slug}`}
              className="btn btn-secondary btn-lg w-full"
            >
              Simular financiamento
            </Link>

            <Link
              href={`/venda-seu-carro?interesse=${vehicle.slug}`}
              className="flex h-11 w-full items-center justify-center text-[0.875rem] text-fg-subtle underline-offset-4 transition-colors duration-200 hover:text-fg hover:underline"
            >
              Quer usar seu carro na troca?
            </Link>
          </div>
        </>
      )}

      <div className="mt-6 space-y-2.5 border-t border-line pt-6">
        <a
          href={`tel:${siteConfig.phone.e164}`}
          className="-my-1 flex items-center gap-2.5 py-1.5 text-[0.9375rem] text-fg"
        >
          <Phone className="shrink-0 text-[1.0625rem] text-fg-subtle" />
          <span className="plate underline-offset-4 hover:underline">
            {siteConfig.phone.display}
          </span>
        </a>
        <p className="text-[0.8125rem] leading-relaxed text-fg-subtle">
          {siteConfig.address.street} · {siteConfig.address.neighbourhood}
          <br />
          {siteConfig.address.city} - {siteConfig.address.state}
        </p>
      </div>

      {/* Kept out of the way: the message is already about this car. */}
      {!sold && (
        <p className="mt-5 text-[0.75rem] leading-relaxed text-fg-subtle">
          O WhatsApp abre com o{" "}
          <span className="text-fg-muted">{vehicleTitle(vehicle)}</span> já
          identificado na mensagem.
        </p>
      )}

    </div>
  );
}
