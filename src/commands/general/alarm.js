const alarmDatabase = require('../../models/alarm');
const moment = require('moment');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports.run = async (client, message, args, embed) => {

    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setLabel("Pazartesi")
                .setStyle("PRIMARY")
                .setCustomId("btnPazartesi"),
            new MessageButton()
                .setLabel("Salı")
                .setStyle("PRIMARY")
                .setCustomId("btnSali"),
            new MessageButton()
                .setLabel("Çarşamba")
                .setStyle("PRIMARY")
                .setCustomId("btnCarsamba"),
        );
    const row2 = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setLabel("Perşembe")
                .setStyle("PRIMARY")
                .setCustomId("btnPersembe"),
            new MessageButton()
                .setLabel("Cuma")
                .setStyle("PRIMARY")
                .setCustomId("btnCuma"),
            new MessageButton()
                .setLabel("Cumartesi")
                .setStyle("PRIMARY")
                .setCustomId("btnCumartesi"),
        )
    const row3 = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setLabel("Pazar")
                .setStyle("PRIMARY")
                .setCustomId("btnPazar"),
            new MessageButton()
                .setLabel("Tekrarla")
                .setStyle("SUCCESS")
                .setCustomId("btnTekrarla"),
        );

    let secim = args[0];
    if (secim == "oluştur" || secim == "olustur") {
        let date = args[1];
        let name = args[2];
        if (!date) return message.reply({ content: `Saat ve dakika belirtilmedi, örnek kullanım: \`${settings.bot.prefix}alarm oluştur <17:30> <alarm ismi>\`` });
        let dateMatch = date.match(/\d\d:\d\d/);
        let hourMatch = date.match(/\d\d:/);
        let minuteMatch = date.match(/:\d\d/);
        if (!hourMatch || !minuteMatch) return message.reply({ content: `Saat ve dakika belirtilmedi, örnek kullanım: \`${settings.bot.prefix}alarm oluştur <17:30> <alarm ismi>\`` });
        hourMatch = hourMatch[0].slice(0, 2);
        minuteMatch = minuteMatch[0].slice(1);
        if (hourMatch > 24) return message.reply({ content: `Hatalı saat belirtildi, örnek kullanım: \`${settings.bot.prefix}alarm oluştur <17:30> <alarm ismi>\`` })
        if (minuteMatch > 60) return message.reply({ content: `Hatalı dakika belirtildi, örnek kullanım: \`${settings.bot.prefix}alarm oluştur <17:30> <alarm ismi>\`` })
        if (hourMatch.length > 0 && !hourMatch && isNaN(hourMatch)) return message.reply({ content: `Saat belirtilmedi, örnek kullanım: \`${settings.bot.prefix}alarm oluştur <17:00> <alarm ismi>\`` });
        if (minuteMatch.length > 0 && !minuteMatch && isNaN(minuteMatch)) return message.reply({ content: `Dakika belirtilmedi, örnek kullanım: \`${settings.bot.prefix}alarm oluştur <17:00> <alarm ismi>\`` });
        
        
        /*let hourData = await alarmDatabase.findOne({ memberID: message.author.id });
        const sayi = hourData.indexOf(dateMatch[0]);
        return console.log(sayi);
        if (hourData.length > 0 && hourData.find(a => a.alarm.saat == dateMatch[0])) {
            const sayi = bütünveriler.indexOf(dateMatch[0]);
            console.log(sayi);
            return message.reply({ content: `\`${dateMatch[0]}\` saatine oluşturduğun bir alarmın bulunuyor.` })
        }*/

        let alarmData = await alarmDatabase.find({ memberID: message.author.id });
        let alarmId = alarmData.length + 1;
        await new alarmDatabase({
            memberID: message.author.id,
            alarmID: alarmData.length + 1,
            alarm: {
                name: name || "belirtilmedi",
                saat: dateMatch[0]
            }
        }).save();

        let alarmDat = await alarmDatabase.findOne({ memberID: message.author.id, alarmID: alarmId });
        if (!alarmDat) return message.reply({ content: `Her hangi bir alarm verisi bulunamadı.` });
        let dateNow = Date.now();
        let dayName = moment(dateNow).format('dddd');
        alarmDat.alarm.gunler.pazartesi = dayName == "Pazartesi" ? true : false;
        alarmDat.alarm.gunler.sali = dayName == "Salı" ? true : false;
        alarmDat.alarm.gunler.carsamba = dayName == "Perşembe" ? true : false;
        alarmDat.alarm.gunler.persembe = dayName == "Çarşamba" ? true : false;
        alarmDat.alarm.gunler.cuma = dayName == "Cuma" ? true : false;
        alarmDat.alarm.gunler.cumartesi = dayName == "Cumartesi" ? true : false;
        alarmDat.alarm.gunler.pazar = dayName == "Pazar" ? true : false;
        await alarmDat.save();
        message.reply({
            embeds: [embed.setDescription(`
        Alarmın başarıyla \`${dateMatch[0]}\` saatine kuruldu. Alarm ID \`#${alarmId}\`.
        Hangi günlerde sana ulaşılmasını istiyorsan aşağıdan düğmelere tıklayarak ayarla.
        
        • Alarm ismi: \`${alarmDat.alarm.name || "belirtilmedi"}\`

        • Pazartesi: \`${alarmDat.alarm.gunler.pazartesi ? "✅" : "❌"}\`
        • Salı: \`${alarmDat.alarm.gunler.sali ? "✅" : "❌"}\`
        • Çarşamba: \`${alarmDat.alarm.gunler.carsamba ? "✅" : "❌"}\`
        • Perşembe: \`${alarmDat.alarm.gunler.persembe ? "✅" : "❌"}\`
        • Cuma: \`${alarmDat.alarm.gunler.cuma ? "✅" : "❌"}\`
        • Cumartesi: \`${alarmDat.alarm.gunler.cumartesi ? "✅" : "❌"}\`
        • Pazar: \`${alarmDat.alarm.gunler.pazar ? "✅" : "❌"}\`

        • Tekrarlama: \`${alarmDat.alarm.repeat ? "✅" : "❌"}\``)], components: [row, row2, row3]
        }).then(async (msg) => {
            const filter = (interaction) => interaction.user.id == message.author.id;
            let collector = msg.createMessageComponentCollector({ filter, componentType: 'BUTTON', time: 120000 })
            collector.on('collect', async (button) => {
                if (button.customId == "btnPazartesi") {
                    alarmDat.alarm.gunler.pazartesi = alarmDat.alarm.gunler.pazartesi ? false : true;
                    await alarmDat.save();
                    await messageUpdate(embed, button, message.author, alarmId);
                } else if (button.customId == "btnSali") {
                    alarmDat.alarm.gunler.sali = alarmDat.alarm.gunler.sali ? false : true;
                    await alarmDat.save();
                    await messageUpdate(embed, button, message.author, alarmId);
                } else if (button.customId == "btnCarsamba") {
                    alarmDat.alarm.gunler.carsamba = alarmDat.alarm.gunler.carsamba ? false : true;
                    await alarmDat.save();
                    await messageUpdate(embed, button, message.author, alarmId);
                } else if (button.customId == "btnPersembe") {
                    alarmDat.alarm.gunler.persembe = alarmDat.alarm.gunler.persembe ? false : true;
                    await alarmDat.save();
                    await messageUpdate(embed, button, message.author, alarmId);
                } else if (button.customId == "btnCuma") {
                    alarmDat.alarm.gunler.cuma = alarmDat.alarm.gunler.cuma ? false : true;
                    await alarmDat.save();
                    await messageUpdate(embed, button, message.author, alarmId);
                } else if (button.customId == "btnCumartesi") {
                    alarmDat.alarm.gunler.cumartesi = alarmDat.alarm.gunler.cumartesi ? false : true;
                    await alarmDat.save();
                    await messageUpdate(embed, button, message.author, alarmId);
                } else if (button.customId == "btnPazar") {
                    alarmDat.alarm.gunler.pazar = alarmDat.alarm.gunler.pazar ? false : true;
                    await alarmDat.save();
                    await messageUpdate(embed, button, message.author, alarmId);
                } else if (button.customId == "btnTekrarla") {
                    alarmDat.alarm.repeat = alarmDat.alarm.repeat ? false : true;
                    await alarmDat.save();
                    await messageUpdate(embed, button, message.author, alarmId);
                }
            });
            collector.on("end", async (button) => {
                msg.delete()
            });
        });
    } else if (secim == "sil") {

    } else if (secim == "düzenle") {
        let id = args[1];
        if (!isNaN(id)) {
            let idData = await alarmDatabase.findOne({ memberID: message.author.id, alarmID: id });
            if (!idData) return message.reply({ content: `Veri tabanında böyle bir **id** bulamadım.` });
            message.reply({
                embeds: [embed.setDescription(`
            \`#${idData.alarmID}\` idli alarmını güncellemek için düğmeleri kullanabilirsin.
            
            • Alarm ismi: \`${idData.alarm.name || "belirtilmedi"}\`

            • Pazartesi: \`${idData.alarm.gunler.pazartesi ? "✅" : "❌"}\`
            • Salı: \`${idData.alarm.gunler.sali ? "✅" : "❌"}\`
            • Çarşamba: \`${idData.alarm.gunler.carsamba ? "✅" : "❌"}\`
            • Perşembe: \`${idData.alarm.gunler.persembe ? "✅" : "❌"}\`
            • Cuma: \`${idData.alarm.gunler.cuma ? "✅" : "❌"}\`
            • Cumartesi: \`${idData.alarm.gunler.cumartesi ? "✅" : "❌"}\`
            • Pazar: \`${idData.alarm.gunler.pazar ? "✅" : "❌"}\`
    
            • Tekrarlama: \`${idData.alarm.repeat ? "✅" : "❌"}\``)], components: [row, row2, row3]
            }).then(async (msg) => {
                const filter = (interaction) => interaction.user.id == message.author.id;
                let collector = msg.createMessageComponentCollector({ filter, componentType: 'BUTTON', time: 120000 })
                collector.on('collect', async (button) => {
                    if (button.customId == "btnPazartesi") {
                        idData.alarm.gunler.pazartesi = idData.alarm.gunler.pazartesi ? false : true;
                        await idData.save();
                        await messageUpdate(embed, button, message.author, idData.alarmID);
                    } else if (button.customId == "btnSali") {
                        idData.alarm.gunler.sali = idData.alarm.gunler.sali ? false : true;
                        await idData.save();
                        await messageUpdate(embed, button, message.author, idData.alarmID);
                    } else if (button.customId == "btnCarsamba") {
                        idData.alarm.gunler.carsamba = idData.alarm.gunler.carsamba ? false : true;
                        await idData.save();
                        await messageUpdate(embed, button, message.author, idData.alarmID);
                    } else if (button.customId == "btnPersembe") {
                        idData.alarm.gunler.persembe = idData.alarm.gunler.persembe ? false : true;
                        await idData.save();
                        await messageUpdate(embed, button, message.author, idData.alarmID);
                    } else if (button.customId == "btnCuma") {
                        idData.alarm.gunler.cuma = idData.alarm.gunler.cuma ? false : true;
                        await idData.save();
                        await messageUpdate(embed, button, message.author, idData.alarmID);
                    } else if (button.customId == "btnCumartesi") {
                        idData.alarm.gunler.cumartesi = idData.alarm.gunler.cumartesi ? false : true;
                        await idData.save();
                        await messageUpdate(embed, button, message.author, idData.alarmID);
                    } else if (button.customId == "btnPazar") {
                        idData.alarm.gunler.pazar = idData.alarm.gunler.pazar ? false : true;
                        await idData.save();
                        await messageUpdate(embed, button, message.author, idData.alarmID);
                    } else if (button.customId == "btnTekrarla") {
                        idData.alarm.repeat = idData.alarm.repeat ? false : true;
                        await idData.save();
                        await messageUpdate(embed, button, message.author, idData.alarmID);
                    }
                });
                collector.on("end", async (button) => {
                    msg.delete()
                });
            })
        } else return message.reply({ content: `ID sadece sayıdan oluşabilir!` });
    } else if (secim == "liste") {
        let alarmData = await alarmDatabase.find({ memberID: message.author.id });
        message.reply({
            embeds: [embed.setDescription(`**Şuan aktif olan alarmların;**
        ${alarmData.length > 0 && alarmData ? alarmData.map(alarmDat => `• Alarm id: \`${alarmDat.alarmID}\``).join("\n") : `Alarm bulunamadı.`}
        
        *Alarmların hakkında detaylı bilgi almak için; \`${settings.bot.prefix}alarm bilgi <id>\``)]
        })
    } else if (secim == "bilgi") {
        let id = args[1];
        if (isNaN(id) || !id) return message.reply({ content: `Geçerli bir id belirtmediniz.` });
        let alarmData = await alarmDatabase.findOne({ memberID: message.author.id, alarmID: id });
        if (!alarmData) return message.reply({ content: `Verileriniz arasında böyle bir **id** bulunamadı.` });
        message.reply({
            embeds: [
                embed.setDescription(`
            \`${alarmData.alarmID}\` idli alarm \`${alarmData.alarm.saat}\` zamanına kurulmuş. Kurulan günler aşağıda belirtildi;
            
            • Alarm ismi: \`${alarmData.alarm.name || "belirtilmedi"}\`
            
            • Pazartesi: \`${alarmData.alarm.gunler.pazartesi ? "✅" : "❌"}\`
            • Salı: \`${alarmData.alarm.gunler.sali ? "✅" : "❌"}\`
            • Çarşamba: \`${alarmData.alarm.gunler.carsamba ? "✅" : "❌"}\`
            • Perşembe: \`${alarmData.alarm.gunler.persembe ? "✅" : "❌"}\`
            • Cuma: \`${alarmData.alarm.gunler.cuma ? "✅" : "❌"}\`
            • Cumartesi: \`${alarmData.alarm.gunler.cumartesi ? "✅" : "❌"}\`
            • Pazar: \`${alarmData.alarm.gunler.pazar ? "✅" : "❌"}\`

            • Tekrarlama: \`${alarmData.alarm.repeat ? "✅" : "❌"}\`
            `)
            ]
        })
    } else {
        let alarmData = await alarmDatabase.find({ memberID: message.author.id });
        message.reply({ content: `${alarmData.length > 0 && alarmData ? `${alarmData.map(alarmDat => `• Alarm id: \`${alarmDat.alarmID}\``).join("\n")}\n\nAlarmların hakkında detaylı bilgi almak için: \`${settings.bot.prefix}alarm bilgi <id>\`` : `Her hangi bir alarmınız bulunmuyor. Alarm oluşturmak için \`${settings.bot.prefix}alarm oluştur\``}` })
    }
};
exports.config = {
    category: "member",
    name: "alarm",
    usage: `${settings.bot.prefix}alarm`,
    guildOnly: true,
    aliases: ["alarm"],
};

async function messageUpdate(embed, button, member, alarmID) {
    if (!button) return;
    let alarmDat = await alarmDatabase.findOne({ memberID: member.id, alarmID: alarmID });
    if (!alarmDat) return;
    button.update({
        embeds: [embed.setDescription(`
    \`#${alarmID}\` idli alarmın güncellendi.
    Alarmında yapılan değişikleri güncel olarak aşağıdan izleyebilirsin.
    
    • Pazartesi: \`${alarmDat.alarm.gunler.pazartesi ? "✅" : "❌"}\`
    • Salı: \`${alarmDat.alarm.gunler.sali ? "✅" : "❌"}\`
    • Çarşamba: \`${alarmDat.alarm.gunler.carsamba ? "✅" : "❌"}\`
    • Perşembe: \`${alarmDat.alarm.gunler.persembe ? "✅" : "❌"}\`
    • Cuma: \`${alarmDat.alarm.gunler.cuma ? "✅" : "❌"}\`
    • Cumartesi: \`${alarmDat.alarm.gunler.cumartesi ? "✅" : "❌"}\`
    • Pazar: \`${alarmDat.alarm.gunler.pazar ? "✅" : "❌"}\`

    • Tekrarlama: \`${alarmDat.alarm.repeat ? "✅" : "❌"}\``)]
    })
}