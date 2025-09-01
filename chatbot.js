// leitor de qr code
const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const client = new Client();

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');
});

client.initialize();

const delay = ms => new Promise(res => setTimeout(res, ms));

// Armazena o estado de cada usuário
const userState = {};

client.on('message', async msg => {
    const chat = await msg.getChat();
    const from = msg.from;

    if (!userState[from]) userState[from] = { step: 0 };

    // === RESET PARA O MENU PRINCIPAL ===
    if (/menu/i.test(msg.body) && from.endsWith('@c.us')) {
        userState[from].step = 1;

        await delay(2000);
        await chat.sendStateTyping();
        await delay(2000);

        const contact = await msg.getContact();
        const name = contact.pushname.split(" ")[0];

        await client.sendMessage(from,
            'Olá! ' + name + '. Coordenadoria de Alimentação e Nutrição Escolar agradece seu contato. Como podemos te ajudar? Por favor, digite uma das opções abaixo:\n\n1 - Gêneros alimentícios\n2 - Aluno com necessidade nutricional\n3 - Palestra com os pais\n4 - Ação educativa com alunos\n5 - Caixa escolar'
        );
        return;
    }

    // === GATILHO DE INÍCIO (SEM MENU) ===
    if (/(dia|tarde|noite|oi|olá|ola|)/i.test(msg.body) && from.endsWith('@c.us')) {
        userState[from].step = 1;

        await delay(2000);
        await chat.sendStateTyping();
        await delay(2000);

        const contact = await msg.getContact();
        const name = contact.pushname.split(" ")[0];

        await client.sendMessage(from,
            'Olá! ' + name + '. Coordenadoria de Alimentação e Nutrição Escolar agradece seu contato. Como podemos te ajudar? Por favor, digite uma das opções abaixo:\n\n1 - Gêneros alimentícios\n2 - Aluno com necessidade nutricional\n3 - Palestra com os pais\n4 - Ação educativa com alunos\n5 - Caixa escolar\n\nObs: para voltar a esse menu a qualquer momento, digite "menu".'
        );
        return;
    }

    // === OPÇÃO 1 - Gêneros alimentícios ===
    if (userState[from].step === 1 && msg.body === '1') {
        userState[from].step = 2;
        await delay(2000);
        await chat.sendStateTyping();
        await delay(2000);
        await client.sendMessage(from, 'Digite uma das opções:\n\n6 - Agricultura familiar\n\n7 - Outros Fornecedores');
        return;
    }

    // === OPÇÃO 6 - Agricultura familiar ===
    if (userState[from].step === 2 && msg.body === '6') {
        userState[from].step = 3;
        await delay(2000);
        await chat.sendStateTyping();
        await delay(2000);
        await client.sendMessage(from, 'Digite uma das opções: \n\n8 - Atraso na entrega\n\n9 - Alimento deteriorado');
        return;
    }

    if (userState[from].step === 3 && msg.body === '8') {
        await client.sendMessage(from, 'Informe os seguintes dados: data de envio do pedido e o nome do fornecedor.\n\nEm breve entraremos em contato.');
        return;
    }

    if (userState[from].step === 3 && msg.body === '9') {
        await client.sendMessage(from, 'Informe os seguintes dados: nome do item, data de recebimento, quantidade recebida, quantidade deteriorada.\n\nEm breve entraremos em contato');
        return;
    }

    // === OPÇÃO 7 - Outros fornecedores ===
    if (userState[from].step === 2 && msg.body === '7') {
        userState[from].step = 4;
        await delay(2000);
        await chat.sendStateTyping();
        await delay(2000);
        await client.sendMessage(from, 'Digite uma das opções: \n\n10 - Atraso na entrega\n\n11 - Alimento deteriorado');
        return;
    }

    if (userState[from].step === 4 && msg.body === '10') {
        await client.sendMessage(from, 'Informe os seguintes dados: data de envio do pedido e o nome do fornecedor\n\nEm breve entraremos em contato');
        return;
    }

    if (userState[from].step === 4 && msg.body === '11') {
        await client.sendMessage(from, 'Informe os seguintes dados: nome do item, data de recebimento, quantidade recebida, quantidade deteriorada\n\nEm breve entaremos em contato');
        return;
    }

    // === OPÇÃO 2 - Aluno com necessidade alimentar nutricional ===
    if (userState[from].step === 1 && msg.body === '2') {
        userState[from].step = 5;
        await delay(2000);
        await chat.sendStateTyping();
        await delay(2000);
        await client.sendMessage(from, 'Digite uma das opções:\n\n12 - Novo aluno\n\n13 - Aluno já está cadastrado');
        return;
    }

    if (userState[from].step === 5 && msg.body === '12') {
        await client.sendMessage(from, 'Enviar para o e-mail: sme.merenda@educacao.prefeiturademossoro.com.br os seguintes documentos: Laudo/atestado médico + Ficha de cadastro de alunos com necessidade alimentares especias (completamente preenchida, assinada e carimbada pelo diretor da escola e assinada pelo responsável do aluno).');
        return;
    }

    if (userState[from].step === 5 && msg.body === '13') {
        userState[from].step = 6;
        await client.sendMessage(from, 'Digite uma das opções: \n\n14 - Atraso no recebimento do item\n\n15 - Alta da dieta\n\n16 - Aluno transferido');
        return;
    }

    if (userState[from].step === 6 && msg.body === '14') {
        await client.sendMessage(from, 'Em breve entraremos em contato');
        return;
    }

    if (userState[from].step === 6 && msg.body === '15') {
        await client.sendMessage(from, 'Enviar para o e-mail sme.merenda@educacao.prefeiturademossoro.com.br uma declaração com os dados do aluno (nome completo, data de nascimento e turma) informando a alta médica.');
        return;
    }

    if (userState[from].step === 6 && msg.body === '16') {
        await client.sendMessage(from, 'Enviar para o e-mail sme.merenda@educacao.prefeiturademossoro.com.br uma declaração com os dados do aluno (nome completo, data de nascimento e turma) informando o local para onde o aluno foi transferido.');
        return;
    }

    // === OPÇÃO 3 ===
    if (userState[from].step === 1 && msg.body === '3') {
        await client.sendMessage(from, 'Informe os seguintes dados: nome da UEI/ESCOLA, data e horário previstos e temática.\n\nEm breve entraremos em contato.');
        return;
    }

    // === OPÇÃO 4 ===
    if (userState[from].step === 1 && msg.body === '4') {
        await client.sendMessage(from, 'Informe os seguintes dados: nome da UEI/ESCOLA, etapa de ensino, data e horários previstos\n\nEm breve entraremos em contato');
        return;
    }

    // === OPÇÃO 5 ===
    if (userState[from].step === 1 && msg.body === '5') {
        userState[from].step = 7;
        await client.sendMessage(from, 'Escolha uma das opções abaixo: \n\n17 - Caixa vencido\n\n18 - Saldo de repasse');
        return;
    }

    if (userState[from].step === 7 && msg.body === '17') {
        await client.sendMessage(from, 'Informe os seguintes dados: data de vencimento. data de entrada no cartório e prazo no cartório\n\n Em breve entraremos em contato');
        return;
    }

    if (userState[from].step === 7 && msg.body === '18') {
        await client.sendMessage(from, 'Informe os seguintes dados: extrato do dia e notas fiscais em aberto.\n\n Em breve entraremos em contato');
        return;
    }
});