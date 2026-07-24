# ChegaMed - Contexto do Projeto

## Visão Geral

O ChegaMed é um sistema de gestão de medicamentos destinado inicialmente à Prefeitura Municipal da minha cidade, mas projetado desde o início para atender qualquer prefeitura brasileira.

Seu principal objetivo é controlar a distribuição de medicamentos de uso contínuo ou tratamentos prolongados realizados pelas farmácias públicas municipais.

O sistema não possui foco em estoque hospitalar, farmácia comercial ou venda de medicamentos. Seu foco exclusivo é o controle de entrega de medicamentos fornecidos gratuitamente pelas prefeituras.

---

# Problema Atual

Hoje o processo é praticamente manual.

O cidadão apresenta uma receita médica.

A prefeitura realiza a compra (quando necessário) e entrega os medicamentos.

Entretanto, não existe um controle eficiente sobre a duração do tratamento.

Isso permite situações onde o cidadão solicita novamente um medicamento antes do prazo esperado de consumo.

Exemplo:

Data da entrega:

01/07/2026

Receita:

| Medicamento | Quantidade     | Posologia             |
| ----------- | -------------- | --------------------- |
| Glifage XR  | 30 comprimidos | 1 comprimido por dia  |
| Losartana   | 30 comprimidos | 2 comprimidos por dia |

Duração esperada:

- Glifage XR → 30 dias
- Losartana → 15 dias

No dia 20/07/2026 o cidadão retorna com outra receita contendo os mesmos medicamentos.

Hoje a prefeitura normalmente realiza uma nova entrega dos dois medicamentos.

Entretanto:

Glifage XR ainda deveria possuir aproximadamente 10 comprimidos restantes.

Já a Losartana realmente estaria próxima do fim.

Isso gera desperdício de recursos públicos e favorece solicitações indevidas.

---

# Objetivo do Sistema

Controlar matematicamente o tempo de duração de cada medicamento entregue.

Ao cadastrar uma entrega, o sistema deve calcular automaticamente a previsão de término daquele medicamento considerando:

- quantidade entregue;
- unidade de medida;
- frequência de uso;
- dose prescrita.

Quando o paciente retornar com uma nova receita, o sistema deverá informar:

- quais medicamentos já podem ser entregues;
- quais ainda estão dentro do prazo previsto;
- quais já estão vencidos;
- quais nunca foram entregues.

A decisão final continua sendo do servidor público, porém o sistema deve fornecer essas informações automaticamente.

---

# Regras de Negócio

## Controle individual por medicamento

Cada medicamento possui seu próprio prazo.

Exemplo:

Receita:

- Glifage XR
- Losartana

Mesmo pertencendo à mesma receita, cada medicamento possui uma duração diferente.

Portanto:

O sistema pode liberar apenas parte da receita.

Exemplo:

✔ Liberar Losartana.

✖ Bloquear Glifage XR.

---

## Cálculo da duração

A duração depende de:

- quantidade entregue;
- dose por administração;
- frequência diária.

Exemplo:

30 comprimidos

1 comprimido

1 vez por dia

Resultado:

30 dias.

Outro exemplo:

30 comprimidos

2 comprimidos

2 vezes por dia

Consumo diário:

4 comprimidos

Duração:

7,5 dias.

O sistema deve realizar esse cálculo automaticamente.

---

## Entregas parciais

A prefeitura pode não possuir todo o medicamento em estoque.

Exemplo:

Receita solicita:

120 comprimidos.

A prefeitura possui apenas:

30 comprimidos.

O sistema deve registrar:

- quantidade prescrita;
- quantidade entregue;
- quantidade pendente.

Posteriormente novas entregas poderão ser realizadas até completar a quantidade prescrita.

---

## Histórico

Todo medicamento entregue deve permanecer registrado.

Nunca deve existir atualização que apague uma entrega anterior.

O histórico é essencial para auditoria.

---

## Receitas

Uma receita pode possuir vários medicamentos.

Cada medicamento da receita possui:

- quantidade prescrita;
- dose;
- frequência;
- duração prevista;
- observações.

---

## Controle por paciente

Cada paciente possui um histórico completo de:

- receitas;
- entregas;
- medicamentos;
- datas;
- duração prevista.

---

# Funcionalidades Futuras

## Fila de entrega

Quando um medicamento chegar ao estoque, o sistema deverá identificar automaticamente quais pacientes aguardam aquele medicamento.

Exemplo:

Existem:

10 pacientes aguardando Losartana.

Chegam:

7 caixas.

O sistema deverá indicar:

Entregar para os sete pacientes mais antigos da fila.

---

## Gestão de estoque

Controlar:

- entrada de medicamentos;
- saída;
- saldo;
- validade;
- lote.

---

## Dashboard

Indicadores como:

- medicamentos mais distribuídos;
- pacientes atendidos;
- medicamentos em falta;
- compras necessárias;
- economia gerada;
- tempo médio de espera.

---

# Público-alvo

Secretarias Municipais de Saúde.

Farmácias Populares Municipais.

Centrais de Assistência Farmacêutica.

---

# Objetivos do Projeto

Reduzir desperdício de recursos públicos.

Evitar fraudes.

Melhorar o controle das entregas.

Agilizar o atendimento.

Fornecer histórico completo dos pacientes.

Aumentar a rastreabilidade das entregas.

Permitir expansão para qualquer município brasileiro.

---

# Princípios de Desenvolvimento

Durante todo o desenvolvimento, qualquer nova funcionalidade deve respeitar os seguintes princípios:

- Toda entrega deve ser rastreável.
- Nenhuma informação histórica deve ser perdida.
- O sistema deve priorizar consistência dos dados.
- A lógica de negócio deve ficar no backend.
- O frontend deve apenas apresentar as informações.
- O sistema deve ser escalável para múltiplas prefeituras (multi-tenant).
- Todas as regras devem ser configuráveis sempre que possível.
- Sempre considerar futuras integrações com sistemas públicos.

---

# Estado Atual do Projeto

## Implementado

- Multiempresa (Company)
- Usuários
- Autenticação JWT
- Controle de permissões
- Auditoria
- Estrutura inicial do backend
- Pacientes
- Medicamentos
- Receitas
- Itens da Receita
- Entregas
- Estoque
- Movimentações de Estoque

## Próximos módulos

- Fila de Entrega
- Dashboard
