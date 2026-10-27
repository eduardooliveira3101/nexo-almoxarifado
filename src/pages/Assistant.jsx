import { useState } from 'react';
import { answerQuestion } from '../domain/assistant.js';
const questions = [
  'Quem está com os equipamentos?',
  'Calibrações nos próximos 30 dias',
  'Equipamentos disponíveis',
  'Devoluções atrasadas',
];
export default function Assistant({ data }) {
  const [messages, setMessages] = useState([]),
    [query, setQuery] = useState('');
  function ask(question) {
    if (!question.trim()) return;
    setMessages((previous) => [...previous, { question, answer: answerQuestion(data, question) }]);
    setQuery('');
  }
  return (
    <section className="panel chat">
      <h2>Assistente do almoxarifado</h2>
      <p>Consulta por palavras-chave aos registros carregados. Sem integração com IA externa.</p>
      <div className="quick">
        {questions.map((q) => (
          <button className="subtle" key={q} onClick={() => ask(q)}>
            {q}
          </button>
        ))}
      </div>
      <div className="messages" role="log" aria-label="Respostas das consultas">
        {messages.map((m, i) => (
          <div key={i}>
            <p className="bubble user">{m.question}</p>
            <p className="bubble">{m.answer}</p>
          </div>
        ))}
      </div>
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          ask(query);
        }}
      >
        <label className="search">
          Sua pergunta
          <input
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
            placeholder="Pergunte ou informe a identificação do equipamento"
            required
            maxLength={500}
          />
        </label>
        <button>Consultar</button>
      </form>
    </section>
  );
}
