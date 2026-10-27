# Nexo Almoxarifado
Gestão de equipamentos, movimentações e calibrações em uma interface responsiva, construída com React e JavaScript.

**[Acessar demonstração](https://eduardooliveira3101.github.io/nexo-almoxarifado/)**

Projeto de portfólio com identidade e registros fictícios. A demonstração roda no navegador e não acessa sistemas ou bases corporativas.

## Telas do projeto

### Desktop
![Painel desktop com disponibilidade e prazos de calibração](docs/images/desktop-painel.jpg)

### Mobile
Capturas em viewport de 390 × 844 px: painel, navegação lateral e formulário de equipamento.

<p>
  <img src="docs/images/mobile-painel.jpg" alt="Painel no celular com marca centralizada e indicadores em duas colunas" width="250" />
  <img src="docs/images/mobile-menu.jpg" alt="Menu sanduíche aberto no celular" width="250" />
  <img src="docs/images/mobile-cadastro.jpg" alt="Formulário de equipamento em uma coluna no celular" width="250" />
</p>

## Do controle à consulta
- Painel com disponibilidade dos equipamentos, retiradas em aberto e prazos de calibração.
- Cadastro e busca de equipamentos, com identificação, localização e condição.
- Retiradas com responsável, destino e previsão de devolução.
- Devoluções e histórico de movimentações.
- Registro de calibração, vencimentos e anexos PDF.
- Desativação com proteção do histórico e exportação dos registros.

## Experiência mobile
A navegação se adapta a telas de até 760 px: o menu lateral dá lugar ao botão ☰, que abre uma aba com as seções do sistema.
A marca fica centralizada em três linhas e os formulários passam a uma coluna.
O menu fecha ao escolher uma seção, ao tocar fora dele ou pressionar Escape. Também permite navegação pelo teclado.

## Tecnologias e organização
React, JavaScript e CSS, com Vite para desenvolvimento e compilação.
- src/pages: telas de painel, equipamentos e movimentações.
- src/components: formulários, histórico e ações.
- src/domain: regras de retirada, devolução e ciclo de vida.
- src/services: dados fictícios e persistência local.
- shared: regras compartilhadas de equipamentos.
- tests: verificações do fluxo de movimentação e persistência.
- docs: demonstração estática para GitHub Pages.

## Executar localmente
Requer Node.js 22.12 ou superior.

~~~sh
npm install
npm run dev
~~~

~~~sh
npm test
npm run build
~~~

## Escopo da demonstração
Os dados são guardados no localStorage do navegador. Não há autenticação real, servidor ou sincronização entre dispositivos. Anexos e alterações devem conter apenas dados fictícios. Para restaurar a base de exemplo, limpe os dados deste site no navegador.
A documentação apresenta a versão pública de portfólio; não publica credenciais, registros ou identidade de uma empresa.
