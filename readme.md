# CyberQuiz FATEC

Um quiz interativo em tempo real sobre a FATEC, desenvolvido com Node.js, Socket.IO e design cyberpunk.

![CyberQuiz FATEC](https://img.shields.io/badge/CyberQuiz-FATEC-ff0040?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)

## Características

- **Sistema Multiplayer**: Múltiplos jogadores em tempo real
- **Comunicação Instantânea**: Socket.IO para atualizações em tempo real
- **Design Cyberpunk**: Interface moderna com efeitos neon
- **Painel Admin**: Monitoramento e controle em tempo real
- **Responsivo**: Funciona em desktop e mobile
- **Seguro**: Validação de dados e proteção admin

## Tecnologias Utilizadas

- **Backend**: Node.js + Express
- **Real-time**: Socket.IO
- **Frontend**: HTML5 + CSS3 + JavaScript
- **Segurança**: Helmet + CORS
- **Fonts**: Google Fonts (JetBrains Mono + Orbitron)

## Deploy Rápido

### Render

1. **Conecte seu GitHub** no [Render](https://render.com)
2. **Crie um Web Service**
3. **Configure**:
   - Build Command: `npm install`
   - Start Command: `npm start`

## Estrutura do Projeto

```
cyberquiz-fatec/
├── 📄 server.js          # Servidor principal
├── 📄 package.json       # Dependências do projeto
├── 📁 public/           # Arquivos estáticos
│   └── 📄 index.html    # Interface do usuário
└── 📄 README.md         # Documentação
```

## Como Usar

### Para Estudantes:
1. **Acesse a URL** do sistema
2. **Selecione sua Squad** (6 opções disponíveis)
3. **Responda as 10 missões** sobre FATEC
4. **Veja seus resultados** em tempo real

### Para Administradores:
1. **Clique em "ÁREA ADMIN"**
2. **Digite a senha**: 
3. **Monitore respostas** em tempo real
4. **Gere relatórios** completos
5. **Reinicie o quiz** quando necessário

## Funcionalidades

### Sistema Multiplayer
- 6 squads simultâneas
- Sincronização em tempo real
- Histórico de respostas

### Painel Admin
- Estatísticas em tempo real
- Monitor de respostas
- Relatórios detalhados
- Controle de reinicialização

### Interface
- Design cyberpunk responsivo
- Animações e efeitos visuais
- Notificações em tempo real
- Progresso visual

## 🔧 Configuração

### Variáveis de Ambiente

```bash
PORT=3000                    # Porta do servidor
NODE_ENV=production         # Ambiente de produção
```

### Personalizações

**Alterar senha do admin** (server.js):
```javascript
const ADMIN_PASSWORD = 'sua_nova_senha';
```

## 📊 API Endpoints

```bash
GET  /                      # Interface principal
POST /api/admin/responses  # Obter respostas (admin)
```

## 🔌 Socket.IO Events

### Cliente → Servidor:
- `submit-answer`: Enviar resposta
- `finish-quiz`: Finalizar quiz
- `admin-login`: Login admin
- `admin-reset`: Reset quiz (admin)

### Servidor → Cliente:
- `answer-received`: Confirmação de resposta
- `quiz-completed`: Quiz finalizado
- `admin-authenticated`: Admin autenticado
- `admin-update`: Atualização admin

## Segurança

- Helmet para headers de segurança
- CORS configurado
- Validação de dados
- Senha protegida do admin

## Compatibilidade

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile (iOS/Android)

## Contribuição

1. **Fork** o projeto
2. **Crie** uma branch: `git checkout -b feature/nova-funcionalidade`
3. **Commit** suas mudanças: `git commit -m 'Add: nova funcionalidade'`
4. **Push** para a branch: `git push origin feature/nova-funcionalidade`
5. **Abra** um Pull Request

## Licença

Este projeto está sob a licença MIT.

## Autor

Desenvolvido para a comunidade FATEC

---

### Links Úteis

- [Render Deploy](https://render.com/docs)
- [Socket.IO Documentation](https://socket.io/docs/)
