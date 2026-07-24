import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Exclusão de conta | Chegamed",
  description: "Como solicitar a exclusão da sua conta no Chegamed.",
};

export default function ExclusaoDeContaPage() {
  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-6 px-6 py-16 sm:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Exclusão de conta
        </h1>

        <p className="text-lg leading-8 text-zinc-700 dark:text-zinc-300">
          Você pode excluir sua conta no Chegamed a qualquer momento,
          diretamente pelo aplicativo.
        </p>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
            Como excluir sua conta
          </h2>
          <ol className="list-decimal space-y-2 pl-5 text-zinc-700 dark:text-zinc-300">
            <li>Faça login no aplicativo Chegamed.</li>
            <li>Acesse a tela de Perfil.</li>
            <li>
              Toque no menu de <strong>três pontinhos (⋮)</strong>, no canto
              superior direito.
            </li>
            <li>
              Selecione a opção <strong>&quot;Excluir conta&quot;</strong>.
            </li>
            <li>Digite sua senha para confirmar a exclusão.</li>
          </ol>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
            Não consegue acessar sua conta?
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Se você esqueceu sua senha ou não consegue fazer login, utilize a
            opção <strong>&quot;Esqueceu a senha?&quot;</strong> na tela de
            login do aplicativo para recuperar o acesso e, em seguida, siga
            os passos acima para excluir sua conta.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
            O que acontece com seus dados
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Ao confirmar a exclusão, sua conta e os dados de acesso associados
            a ela (login, senha e informações de perfil) são removidos
            permanentemente dos nossos sistemas.
          </p>
          <p className="text-zinc-700 dark:text-zinc-300">
            Dados de pacientes, prescrições e entregas vinculados à empresa
            parceira não são apagados junto com sua conta. Para solicitar a
            exclusão desses dados, veja{" "}
            <Link
              className="font-medium text-black underline dark:text-zinc-50"
              href="/exclusao-dos-dados"
            >
              como solicitar a exclusão de dados
            </Link>
            .
          </p>
        </section>
      </main>
    </div>
  );
}
