const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            connectSrc: [
                "'self'",
                "ws:",
                "wss:",
                "ws://localhost:*",
                "wss://localhost:*",
                "wss://quiz-fatec.onrender.com"
            ]
        }
    }
}));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


// Dados em memória
let responses = [];
const ADMIN_PASSWORD = 'fatec2024';

// Perguntas do quiz
const questions = [
    {
        question: "O que significa a sigla FATEC?",
        options: [
            "Faculdade de Tecnologia Empresarial e Científica",
            "Faculdade de Tecnologia do Estado de São Paulo",
            "Fundação de Apoio à Tecnologia e Ciência",
            "Faculdade de Tecnologia e Computação"
        ],
        correct: "B"
    },
    {
        question: "Em que ano foi criada a primeira FATEC?",
        options: ["1968", "1969", "1970", "1971"],
        correct: "C"
    },
    {
        question: "Qual é o órgão responsável pela administração das FATECs?",
        options: [
            "USP - Universidade de São Paulo",
            "UNICAMP - Universidade Estadual de Campinas", 
            "CEETEPS - Centro Estadual de Educação Tecnológica Paula Souza",
            "UNESP - Universidade Estadual Paulista"
        ],
        correct: "C"
    },
    {
        question: "Qual foi a primeira FATEC criada no Estado de São Paulo?",
        options: [
            "FATEC São Paulo",
            "FATEC Campinas", 
            "FATEC Santos",
            "FATEC São Bernardo do Campo"
        ],
        correct: "A"
    },
    {
        question: "Qual é a duração típica dos cursos de graduação tecnológica nas FATECs?",
        options: ["2 anos", "3 anos", "4 anos", "5 anos"],
        correct: "B"
    },
    {
        question: "As FATECs são instituições de ensino:",
        options: [
            "Privadas com fins lucrativos",
            "Privadas sem fins lucrativos",
            "Públicas estaduais", 
            "Públicas federais"
        ],
        correct: "C"
    },
    {
        question: "Qual é o principal foco dos cursos oferecidos pelas FATECs?",
        options: [
            "Formação acadêmica teórica",
            "Formação tecnológica aplicada ao mercado de trabalho",
            "Pesquisa científica avançada",
            "Extensão universitária"
        ],
        correct: "B"
    },
    {
        question: "O vestibular das FATECs é realizado quantas vezes por ano?",
        options: ["1 vez por ano", "2 vezes por ano", "3 vezes por ano", "4 vezes por ano"],
        correct: "B"
    },
    {
        question: "Qual das seguintes áreas NÃO é tradicionalmente oferecida pelas FATECs?",
        options: [
            "Tecnologia da Informação",
            "Gestão e Negócios", 
            "Medicina",
            "Produção Industrial"
        ],
        correct: "C"
    },
    {
        question: "O diploma de um curso superior de tecnologia da FATEC tem o mesmo valor legal de:",
        options: [
            "Curso técnico",
            "Curso de bacharelado",
            "Curso de especialização", 
            "Curso de extensão"
        ],
        correct: "B"
    }
];

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        connections: io.engine.clientsCount 
    });
});

// API admin para obter respostas
app.post('/api/admin/responses', (req, res) => {
    const { password } = req.body;
    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Senha incorreta' });
    }
    
    const stats = {
        totalResponses: responses.length,
        uniqueTeams: [...new Set(responses.map(r => r.team))].length,
        progressPercentage: responses.length > 0 ? 
            Math.round((responses.length / (6 * questions.length)) * 100) : 0
    };
    
    res.json({
        responses: responses,
        stats: stats,
        totalQuestions: questions.length
    });
});

// Socket.IO conexões
io.on('connection', (socket) => {
    console.log(`[${new Date().toLocaleTimeString()}] Cliente conectado: ${socket.id}`);

    // Enviar status do quiz para novos clientes
    socket.emit('quiz-status', {
        totalQuestions: questions.length,
        totalResponses: responses.length
    });

    // Receber resposta do quiz
    socket.on('submit-answer', (data) => {
        try {
            const response = {
                id: Date.now(),
                socketId: socket.id,
                team: data.team,
                teamId: data.teamId,
                question: data.question,
                questionIndex: data.questionIndex,
                answer: data.answer,
                correctAnswer: data.correctAnswer,
                isCorrect: data.answer === data.correctAnswer,
                timestamp: new Date().toLocaleTimeString('pt-BR')
            };

            responses.push(response);
            console.log(`[${response.timestamp}] Resposta recebida de ${response.team}: ${response.answer} (${response.isCorrect ? 'Correto' : 'Incorreto'})`);

            // Confirmar recebimento
            socket.emit('answer-received', {
                success: true,
                message: `✅ Resposta recebida!`
            });

            // Atualizar todos os admins conectados
            const stats = {
                totalResponses: responses.length,
                uniqueTeams: [...new Set(responses.map(r => r.team))].length,
                progressPercentage: Math.min(Math.round((responses.length / (6 * questions.length)) * 100), 100)
            };

            io.emit('admin-update', {
                responses: responses,
                stats: stats
            });

        } catch (error) {
            console.error('Erro ao processar resposta:', error);
            socket.emit('answer-received', {
                success: false,
                message: `❌ Erro ao processar resposta`
            });
        }
    });

    // Login do admin
    socket.on('admin-login', (data) => {
        if (data.password === ADMIN_PASSWORD) {
            const stats = {
                totalResponses: responses.length,
                uniqueTeams: [...new Set(responses.map(r => r.team))].length,
                progressPercentage: Math.min(Math.round((responses.length / (6 * questions.length)) * 100), 100)
            };
            
            socket.emit('admin-authenticated', {
                responses: responses,
                stats: stats
            });
            
            console.log(`[${new Date().toLocaleTimeString()}] Admin autenticado: ${socket.id}`);
        } else {
            socket.emit('admin-error', 'Senha incorreta');
            console.log(`[${new Date().toLocaleTimeString()}] Tentativa de login admin falhada: ${socket.id}`);
        }
    });

    // Finalizar quiz
    socket.on('finish-quiz', (data) => {
        try {
            const teamResponses = responses.filter(r => r.team === data.team);
            const correctAnswers = teamResponses.filter(r => r.isCorrect).length;
            
            socket.emit('quiz-completed', {
                totalCorrect: correctAnswers,
                totalQuestions: questions.length,
                percentage: Math.round((correctAnswers / questions.length) * 100)
            });
            
            console.log(`[${new Date().toLocaleTimeString()}] Quiz finalizado por ${data.team}: ${correctAnswers}/${questions.length}`);
        } catch (error) {
            console.error('Erro ao finalizar quiz:', error);
        }
    });

    // Reset do quiz (admin)
    socket.on('admin-reset', (data) => {
        if (data.password === ADMIN_PASSWORD) {
            responses = [];
            io.emit('quiz-reset');
            console.log(`[${new Date().toLocaleTimeString()}] Quiz resetado pelo admin: ${socket.id}`);
        }
    });

    // Refresh dos dados do admin
    socket.on('admin-refresh', (data) => {
        if (data.password === ADMIN_PASSWORD) {
            const stats = {
                totalResponses: responses.length,
                uniqueTeams: [...new Set(responses.map(r => r.team))].length,
                progressPercentage: Math.min(Math.round((responses.length / (6 * questions.length)) * 100), 100)
            };
            
            socket.emit('admin-update', {
                responses: responses,
                stats: stats
            });
        }
    });

    // Desconexão
    socket.on('disconnect', () => {
        console.log(`[${new Date().toLocaleTimeString()}] Cliente desconectado: ${socket.id}`);
    });

    // Tratamento de erros
    socket.on('error', (error) => {
        console.error(`[${new Date().toLocaleTimeString()}] Erro no socket ${socket.id}:`, error);
    });
});

// Tratamento de erros do servidor
process.on('uncaughtException', (error) => {
    console.error('Erro não capturado:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promise rejeitada não tratada:', reason);
    process.exit(1);
});

// Iniciar servidor
const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

server.listen(port, host, () => {
    console.log('='.repeat(50));
    console.log('🚀 CYBERQUIZ FATEC - SERVIDOR INICIADO');
    console.log('='.repeat(50));
    console.log(`📡 Servidor rodando em: http://${host}:${port}`);
    console.log(`📊 Health check: http://${host}:${port}/health`);
    console.log(`📝 Total de perguntas: ${questions.length}`);
    console.log(`🔐 Senha admin: ${ADMIN_PASSWORD}`);
    console.log('='.repeat(50));
    console.log('✅ Sistema pronto para receber conexões!');
    console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Recebido SIGTERM, fechando servidor graciosamente...');
    server.close(() => {
        console.log('Servidor fechado.');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('Recebido SIGINT, fechando servidor graciosamente...');
    server.close(() => {
        console.log('Servidor fechado.');
        process.exit(0);
    });
});
