import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Exclusão de dados | Chegamed",
  description:
    "Como solicitar a exclusão de dados de pacientes, prescrições e entregas no Chegamed.",
};

const SUPPORT_EMAIL = "suporte@chegamed.com.br";

export default function ExclusaoDosDadosPage() {
  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-6 px-6 py-16 sm:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Exclusão de dados
        </h1>

        <p className="text-lg leading-8 text-zinc-700 dark:text-zinc-300">
          Excluir sua conta remove seus dados de acesso, mas dados de
          pacientes, prescrições, entregas e fotos vinculados à empresa
          parceira continuam existindo, pois pertencem à empresa e podem ser
          usados por outros profissionais dela. Para pedir a exclusão desses
          dados, envie uma solicitação diretamente pelo aplicativo.
        </p>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
            Como solicitar a exclusão de dados
          </h2>
          <ol className="list-decimal space-y-2 pl-5 text-zinc-700 dark:text-zinc-300">
            <li>Faça login no aplicativo Chegamed.</li>
            <li>Acesse a tela de Perfil.</li>
            <li>
              Toque no menu de <strong>três pontinhos (⋮)</strong>, no canto
              superior direito.
            </li>
            <li>
              Selecione a opção{" "}
              <strong>&quot;Solicitar exclusão de dados&quot;</strong>.
            </li>
            <li>
              Descreva, se quiser, quais dados deseja que sejam excluídos e
              envie a solicitação.
            </li>
          </ol>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
            O que acontece depois
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Você recebe um e-mail confirmando o recebimento da solicitação, e
            nossa equipe responde em até 15 dias úteis, conforme previsto na
            LGPD. Como parte desses dados pode ter valor probatório ou
            regulatório para a empresa parceira (farmácia ou clínica), a
            exclusão é feita manualmente após uma análise.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
            Não consegue acessar o aplicativo?
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Se você não consegue fazer login, envie sua solicitação por
            e-mail para{" "}
            <a
              className="font-medium text-black underline dark:text-zinc-50"
              href={`mailto:${SUPPORT_EMAIL}`}
            >
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        </section>

        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Para excluir sua conta (dados de login), veja{" "}
          <Link
            className="font-medium underline"
            href="/exclusao-de-conta"
          >
            como excluir sua conta
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
