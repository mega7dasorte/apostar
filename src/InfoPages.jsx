//src/InfoPages.jsx
import React from "react";
import { useLocation } from "react-router-dom";

const InfoPages = () => {
  const location = useLocation();

  const pages = {
    "/sobre": {
      title: "Sobre a Mega da Sorte",
      content: (
        <>
          <p>
            A <strong>Mega da Sorte</strong> nasceu com o propósito de transformar pequenas apostas em grandes oportunidades. Nosso compromisso é oferecer uma experiência segura, divertida e 100% transparente para quem acredita na sorte e quer sonhar alto.
          </p>
          <p>
            Com tecnologia moderna e regulamentação dentro das normas brasileiras, você participa de sorteios com prêmios instantâneos e acumulados. Tudo de forma simples: escolha seus números, confirme a aposta e acompanhe os resultados diretamente aqui no site.
          </p>
          <p>
            Na Mega da Sorte, acreditamos que a sorte é feita de oportunidades. E a próxima pode ser a sua.
          </p>
        </>
      ),
    },
    "/como-jogar": {
      title: "Como Jogar",
      content: (
        <>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              <strong>Escolha seu jogo:</strong> selecione o tipo de sorteio que deseja participar e veja os valores e prêmios disponíveis.
            </li>
            <li>
              <strong>Monte sua aposta:</strong> escolha seus números ou use a opção “Surpresinha” para gerar números aleatórios.
            </li>
            <li>
              <strong>Finalize e pague:</strong> confirme sua aposta com segurança usando Pix, cartão ou saldo disponível.
            </li>
            <li>
              <strong>Acompanhe o resultado:</strong> se for premiado, o valor cai direto na sua conta Mega da Sorte — sem burocracia!
            </li>
          </ol>
          <p className="mt-4">
            Simples assim. Aposte, acompanhe e torça. A próxima história de sorte pode ser a sua!
          </p>
        </>
      ),
    },
    "/politica-privacidade": {
      title: "Política de Privacidade",
      content: (
        <>
          <p>
            Levamos a sua privacidade a sério. Todas as informações coletadas pela <strong>Mega da Sorte</strong> são usadas exclusivamente para garantir segurança e transparência na sua experiência com nossos serviços.
          </p>
          <p>
            Coletamos apenas dados necessários para a identificação de usuários e para processar pagamentos e prêmios. Nunca vendemos ou compartilhamos suas informações pessoais com terceiros sem o seu consentimento.
          </p>
          <p>
            Você pode solicitar a exclusão ou alteração de seus dados a qualquer momento, de acordo com a Lei Geral de Proteção de Dados (LGPD).
          </p>
          <p>
            Nosso compromisso é claro: segurança, confidencialidade e respeito total à sua privacidade.
          </p>
        </>
      ),
    },
    "/termos": {
      title: "Termos e Condições de Uso",
      content: (
        <>
          <p>
            Ao utilizar os serviços da <strong>Mega da Sorte</strong>, você concorda com os seguintes termos:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>É necessário ter 18 anos ou mais para participar.</li>
            <li>Todos os sorteios são realizados de forma transparente, conforme a legislação vigente.</li>
            <li>Valores de prêmios e taxas estão sujeitos a atualização sem aviso prévio.</li>
            <li>A Mega da Sorte se reserva o direito de suspender contas que violem as políticas da plataforma.</li>
          </ul>
          <p className="mt-4">
            Recomendamos a leitura integral deste documento antes de efetuar qualquer aposta. Participar implica concordar com todas as regras aqui descritas.
          </p>
        </>
      ),
    },
    "/responsabilidade": {
      title: "Jogo Responsável",
      content: (
        <>
          <p>
            Na <strong>Mega da Sorte</strong>, promovemos o entretenimento responsável. Apostar deve ser uma atividade divertida e equilibrada, nunca uma fonte de preocupação ou prejuízo.
          </p>
          <p>
            Por isso, incentivamos o controle financeiro e o jogo consciente. Se você sentir que está perdendo o controle, recomendamos fazer uma pausa e buscar ajuda especializada.
          </p>
          <p>
            O jogo é permitido apenas para maiores de 18 anos. Jogue com responsabilidade — a sorte é um prazer, não um vício.
          </p>
        </>
      ),
    },
  };

  const currentPage = pages[location.pathname];

  if (!currentPage) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center text-gray-600">
        <h1 className="text-2xl font-semibold mb-4">Página não encontrada</h1>
        <p>Verifique o endereço e tente novamente.</p>
      </div>
    );
  }

  return (
    <section className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-10 text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-center text-green-700">
        {currentPage.title}
      </h1>
      <div className="space-y-4 text-lg leading-relaxed">{currentPage.content}</div>
    </section>
  );
};

export default InfoPages;
