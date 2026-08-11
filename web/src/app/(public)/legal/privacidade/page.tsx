export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-[#cfcfcf]">
      <h1 className="text-3xl font-semibold text-white">Política de privacidade</h1>
      <p className="mt-2 text-sm text-[#A8A8AF]">Última atualização: 8 de agosto de 2026 · LGPD (Lei 13.709/2018)</p>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold text-white">1. Controlador</h2>
        <p>
          A Jornada SAP EWM Academy trata dados pessoais para operar contas, matrículas, suporte e comunicações sobre
          o serviço. Contato para privacidade: área LGPD na Academia ou e-mail de contato do site.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold text-white">2. Dados coletados</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Identificação e contato: nome, e-mail, telefone, empresa, cargo, cidade/UF.</li>
          <li>Conta e segurança: hash de senha, logs de autenticação e auditoria administrativa.</li>
          <li>Uso educacional: progresso de aulas, certificados emitidos, pedidos e cupons.</li>
          <li>Técnicos: endereço IP e user-agent em consentimentos e eventos de segurança.</li>
        </ul>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold text-white">3. Finalidades e bases</h2>
        <p>
          Execução de contrato (acesso ao conteúdo), legítimo interesse (melhoria e prevenção a fraude) e consentimento
          quando aplicável (ex.: marketing). Não vendemos dados pessoais.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold text-white">4. Compartilhamento</h2>
        <p>
          Podemos usar operadores (hospedagem, e-mail, processamento de pagamento e streaming de vídeo) estritamente
          para prestar o serviço, sob contratos adequados. Autoridades podem ser atendidas quando houver obrigação legal.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold text-white">5. Retenção e segurança</h2>
        <p>
          Mantemos dados pelo tempo necessário às finalidades e obrigações legais. Aplicamos medidas técnicas e
          organizacionais razoáveis (controle de acesso, hashing de senhas, auditoria).
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold text-white">6. Seus direitos</h2>
        <p>
          Você pode solicitar confirmação de tratamento, acesso, correção, anonimização, portabilidade, eliminação e
          informação sobre compartilhamentos, nos termos da LGPD. Na Academia, a área LGPD permite fluxos de exportação
          e solicitação de exclusão. Também é possível reclamar à ANPD.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold text-white">7. Cookies</h2>
        <p>
          Usamos cookies essenciais de sessão/autenticação. Cookies não essenciais, se adotados, serão comunicados com
          opção de gestão quando aplicável.
        </p>
      </section>
    </div>
  );
}
