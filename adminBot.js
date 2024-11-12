const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const config = require('./config.json');  // Подключаем конфиг

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log(`Бот запущен как ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (interaction.isButton()) {
        if (interaction.customId === 'open_form') {
            // Создаем модальное окно
            const modal = new ModalBuilder()
                .setCustomId('passport_form')
                .setTitle('Отчет выдачи наказания');

            // Поля для модального окна
            const currentNickname = new TextInputBuilder()
                .setCustomId('current_nickname')
                .setLabel('Никнейм | #Static ID')
                .setPlaceholder('Alma Killa | #40413')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const newNickname = new TextInputBuilder()
                .setCustomId('new_nickname')
                .setLabel('Нарушение')
                .setPlaceholder('1.22 ПГО')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const structure = new TextInputBuilder()
                .setCustomId('structure')
                .setLabel('Доказательства')
                .setPlaceholder('youtube link')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const continuePlaying = new TextInputBuilder()
                .setCustomId('continue_playing')
                .setLabel('Дата выдачи')
                .setPlaceholder('12.11.2024 12:00')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const complaintLink = new TextInputBuilder()
                .setCustomId('complaint_link')
                .setLabel('Ссылка на жалобу')
                .setPlaceholder('Введите ссылку на жалобу')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            // Разделение на строки
            const firstRow = new ActionRowBuilder().addComponents(currentNickname);
            const secondRow = new ActionRowBuilder().addComponents(newNickname);
            const thirdRow = new ActionRowBuilder().addComponents(structure);
            const fourthRow = new ActionRowBuilder().addComponents(continuePlaying);
            const fifthRow = new ActionRowBuilder().addComponents(complaintLink);

            // Добавляем строки в модальное окно
            modal.addComponents(firstRow, secondRow, thirdRow, fourthRow, fifthRow);

            // Открываем модальное окно
            await interaction.showModal(modal);
        }
    } else if (interaction.isModalSubmit()) {
        if (interaction.customId === 'passport_form') {
            // Получаем данные из модального окна
            const currentNickname = interaction.fields.getTextInputValue('current_nickname');
            const newNickname = interaction.fields.getTextInputValue('new_nickname');
            const structure = interaction.fields.getTextInputValue('structure');
            const continuePlaying = interaction.fields.getTextInputValue('continue_playing');
            const complaintLink = interaction.fields.getTextInputValue('complaint_link');

            // Создаем Embed для отправки в канал
            const responseEmbed = new EmbedBuilder()
                .setTitle('Новая форма наказания')
                .setColor(0xFFFF00) // Начальный жёлтый цвет
                .setDescription(`**Данные формы**\n\n`
                    + `**Никнейм:** ${currentNickname}\n`
                    + `**Нарушение:** ${newNickname}\n`
                    + `**Доказательства:** ${structure}\n`
                    + `**Дата выдачи:** ${continuePlaying}\n`
                    + `**Ссылка на жалобу:** ${complaintLink}\n`
                )
                .setFooter({ text: 'by skyfizi' });

            // Создаем кнопку с галочкой
            const button = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('confirm_button')
                    .setLabel('Подтвердить')
                    .setStyle(ButtonStyle.Success)
            );

            // Получаем канал из конфигурации
            const channel = await client.channels.fetch(config.channelID);
            const message = await channel.send({ embeds: [responseEmbed], components: [button] });

            // Подтверждаем отправку формы пользователю
            await interaction.reply({ content: 'Форма успешно отправлена!', ephemeral: true });

            // Обработка нажатия на кнопку
            const filter = i => i.customId === 'confirm_button' && i.user.id === interaction.user.id;
            const collector = message.createMessageComponentCollector({ filter, time: 15000 });

            collector.on('collect', async i => {
                // Изменяем цвет Embed на зелёный, если кнопка нажата
                responseEmbed.setColor(0x00FF00); // Зеленый цвет

                // Обновляем сообщение и скрываем кнопку
                await i.update({
                    embeds: [responseEmbed],
                    components: []  // Убираем кнопку после нажатия
                });
            });

            collector.on('end', async () => {
                // Если по истечении времени никто не нажал кнопку, можно выполнить действия по окончанию
                console.log('Время для нажатия кнопки истекло');
            });
        }
    }
});

client.on('messageCreate', async message => {
    if (message.content === '!passport') {
        const embed = new EmbedBuilder()
            .setTitle('База данных')
            .setDescription('Для внесения в базу данных, заполните форму ниже.')
            .setColor(0xFF0000)
            .setImage(config.imageURL); // Используем URL из config

        const button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open_form')
                .setLabel('Заполнить форму')
                .setStyle(ButtonStyle.Primary)
        );

        await message.channel.send({ embeds: [embed], components: [button] });
    }
});

// Запускаем бота
client.login(config.token);  // Токен из config
