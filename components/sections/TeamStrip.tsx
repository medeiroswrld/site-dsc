import Image from "next/image";

/**
 * A equipe, numa faixa que corre sozinha.
 *
 * São dez pessoas. Em grade isso ocuparia três fileiras e empurraria o resto
 * da home para baixo; numa faixa que desliza, ocupa uma linha e mostra todo
 * mundo. A loja vende atendimento direto — a seção logo acima diz que quem
 * recebe o cliente é quem acompanha a proposta até o fim — e rosto é o que
 * torna essa frase verificável.
 *
 * A animação é CSS puro. É a mesma decisão do título do topo: um efeito
 * contínuo como este não justifica carregar biblioteca, e em CSS ele roda no
 * compositor, sem custo de JavaScript a cada quadro.
 */
const EQUIPE = [
  { nome: "Daiane", foto: "/equipe/daiane.webp" },
  { nome: "Fábio", foto: "/equipe/fabio.webp" },
  { nome: "Junior", foto: "/equipe/junior.webp" },
  { nome: "Lais", foto: "/equipe/lais.webp" },
  { nome: "Larissa", foto: "/equipe/larissa.webp" },
  { nome: "Mauricio", foto: "/equipe/mauricio.webp" },
  { nome: "Oseias", foto: "/equipe/oseias.webp" },
  { nome: "Queixo", foto: "/equipe/queixo.webp" },
  { nome: "Rodrigo", foto: "/equipe/rodrigo.webp" },
  { nome: "Victor", foto: "/equipe/victor.webp" },
];

export function TeamStrip() {
  return (
    <section className="bg-bg pb-14 lg:pb-20" aria-labelledby="equipe-titulo">
      <div className="mx-auto w-full max-w-[110rem] px-5 sm:px-8 lg:px-12">
        <p className="plate text-[0.6875rem] uppercase tracking-[0.18em] text-fg-subtle">
          Quem atende você
        </p>
        <h2
          id="equipe-titulo"
          className="mt-3 max-w-xl font-display text-[1.375rem] font-semibold tracking-[-0.02em] text-fg sm:text-[1.625rem]"
        >
          A mesma equipe do primeiro contato até a entrega da chave.
        </h2>
      </div>

      {/* Sangra até a borda: a faixa entrando e saindo da tela é o que sugere
          que há mais gente do que cabe no enquadramento. */}
      <div className="team-strip mt-8" role="group" aria-label="Equipe da D.S.C. Seminovos">
        <ul className="team-strip__track">
          {EQUIPE.map((pessoa) => (
            <TeamMember key={pessoa.nome} {...pessoa} />
          ))}
          {/* A segunda cópia é o que fecha o laço sem salto. Fica fora da
              árvore de acessibilidade para não repetir os nomes no leitor. */}
          {EQUIPE.map((pessoa) => (
            <TeamMember key={`${pessoa.nome}-repeticao`} {...pessoa} aria-hidden />
          ))}
        </ul>
      </div>
    </section>
  );
}

function TeamMember({
  nome,
  foto,
  "aria-hidden": ariaHidden,
}: {
  nome: string;
  foto: string;
  "aria-hidden"?: boolean;
}) {
  return (
    <li
      className="team-strip__item"
      aria-hidden={ariaHidden}
      {...(ariaHidden ? { inert: true } : {})}
    >
      <div className="relative h-[5.5rem] w-[5.5rem] overflow-hidden rounded-full border border-line-strong bg-surface-2 sm:h-[6.5rem] sm:w-[6.5rem]">
        <Image
          src={foto}
          alt={ariaHidden ? "" : `${nome}, da equipe da D.S.C. Seminovos`}
          fill
          sizes="104px"
          className="object-cover"
        />
      </div>
      <span className="mt-2.5 block text-center text-[0.8125rem] text-fg-muted">
        {nome}
      </span>
    </li>
  );
}
