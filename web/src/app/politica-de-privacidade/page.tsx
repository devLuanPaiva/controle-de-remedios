import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | ChegaMed",
  description:
    "Como o ChegaMed coleta, usa e protege os dados de usuários, pacientes e prescrições.",
};

const LAST_UPDATED = "23 de julho de 2026";
const SUPPORT_EMAIL = "suporte@chegamed.com.br";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black">
      <main className="w-full max-w-3xl px-6 py-16 sm:px-10">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Política de Privacidade do ChegaMed
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Última atualização: {LAST_UPDATED}
        </p>

        <div className="mt-10 flex flex-col gap-8 text-base leading-7 text-zinc-700 dark:text-zinc-300">
          <section>
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
              1. Sobre o ChegaMed
            </h2>
            <p className="mt-3">
              O ChegaMed é uma plataforma utilizada por farmácias e clínicas parceiras para
              gerenciar pacientes, prescrições médicas e a entrega de medicamentos. O acesso à
              plataforma é feito por profissionais autorizados pela empresa parceira (farmácia ou
              clínica), e não por meio de cadastro público.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
              2. Quais dados coletamos
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong>Dados de conta:</strong> nome, e-mail, CPF e cargo do profissional que
                utiliza o aplicativo.
              </li>
              <li>
                <strong>Dados de pacientes e prescrições:</strong> nome do paciente, medicamentos
                prescritos, dosagens e datas, informados pela empresa parceira para viabilizar o
                controle de entregas.
              </li>
              <li>
                <strong>Fotos de receitas e de caixas de medicamentos:</strong> capturadas pela
                câmera do dispositivo para agilizar o cadastro de prescrições e medicamentos.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
              3. Uso de inteligência artificial
            </h2>
            <p className="mt-3">
              As fotos de receitas e de caixas de medicamentos podem ser processadas pela API do
              Google Gemini para extrair automaticamente informações como nome do paciente,
              medicamento, dosagem e datas, reduzindo a digitação manual. Esse processamento é
              feito por meio de uma conta paga (tier pago) da API do Google Gemini, cujos termos
              comerciais excluem o uso dos dados enviados para o treinamento dos modelos do
              Google. As imagens são usadas apenas para responder à solicitação de extração e não
              são compartilhadas com terceiros para qualquer outra finalidade.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
              4. Como protegemos os dados
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                O CPF é armazenado de forma completa apenas quando necessário para identificação
                do usuário, mas é exibido de forma mascarada (ex.: 123.***.***-**) nas telas e
                listagens do sistema.
              </li>
              <li>
                As senhas são armazenadas com hash criptográfico e nunca em texto plano.
              </li>
              <li>
                Os tokens de sessão do aplicativo móvel são armazenados em área segura do
                dispositivo (Keychain no iOS e armazenamento criptografado no Android).
              </li>
              <li>
                O acesso aos dados é restrito por papel (cargo) do usuário: cada profissional só
                visualiza os pacientes e registros da(s) empresa(s) às quais está vinculado.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
              5. Com quem compartilhamos dados
            </h2>
            <p className="mt-3">
              Não vendemos nem compartilhamos dados pessoais para fins de publicidade. Os dados
              são compartilhados apenas com prestadores de serviço estritamente necessários para o
              funcionamento da plataforma, como o provedor de infraestrutura em nuvem e a API do
              Google Gemini (para extração de dados de imagens, conforme descrito na seção 3).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
              6. Exclusão de conta e de dados
            </h2>
            <p className="mt-3">
              Qualquer usuário pode excluir a própria conta diretamente pelo aplicativo móvel, no
              menu de opções da tela de Perfil (ícone de três pontos), selecionando &quot;Excluir
              conta&quot; e confirmando com a senha. A exclusão remove permanentemente os dados de
              acesso do usuário e não pode ser desfeita. Caso prefira solicitar a exclusão por
              outro meio, entre em contato pelo e-mail abaixo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
              7. Contato
            </h2>
            <p className="mt-3">
              Dúvidas sobre esta política ou sobre o tratamento dos seus dados podem ser enviadas
              para{" "}
              <a
                className="font-medium text-black underline dark:text-zinc-50"
                href={`mailto:${SUPPORT_EMAIL}`}
              >
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
