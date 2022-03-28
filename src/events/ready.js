const alarmDatabase = require('../models/alarm');
const moment = require('moment');
const { MessageActionRow, MessageButton } = require('discord.js');
require('moment-duration-format')
moment.locale('tr');

module.exports = async client => {
  console.log(client.user.tag + ' ismiyle giriş yapıldı!')
  client.user.setPresence({ activities: [{ type: "PLAYING", name: settings.bot.activity }], status: 'dnd' })
  let guild = client.guilds.cache.get(settings.guild.id);
  if (guild) await alarmCheck(guild);
};

async function alarmCheck(guild) {
  setInterval(async () => {
    let alarmData = await alarmDatabase.find();
    alarmData.map(async (data) => {
      let dateNow = Date.now();
      let member = guild.members.cache.get(data.memberID);
      if (!member) return;
      let dayName = moment(dateNow).format('dddd');
      let hourAndMin = moment(dateNow).format('HH:mm');

      const row = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setLabel("Alarmı ertele")
            .setStyle("PRIMARY")
            .setCustomId("btnErtele"),
          new MessageButton()
            .setLabel("Alarmı kapat")
            .setStyle("DANGER")
            .setCustomId("btnKapat")
        );
      if (!client.alarm.has(member.id)) {
        if (data.alarm.gunler.pazartesi && data.alarm.saat == hourAndMin && dayName == "Pazartesi") {
          console.log("calisti")
          if (client.findChannel("alarm-log")) client.findChannel("alarm-log").send({ components: [row], content: `${member}, Pazartesi günü için \`${data.alarm.saat}\` saatine kurduğun alarm çalıyor.` }).then(async (msg) => {
            alarmResult(data, member, msg);
          });
          if (!data.alarm.repeat) await alarmDatabase.updateOne({ memberID: data.memberID, alarmID: data.alarmID }, { $set: { alarm: { saat: data.alarm.saat, repeat: false, gunler: { pazartesi: false } } } });
        } else if (data.alarm.gunler.sali && data.alarm.saat == hourAndMin && dayName == "Salı") {
          if (client.findChannel("alarm-log")) client.findChannel("alarm-log").send({ components: [row], content: `${member}, Salı günü için \`${data.alarm.saat}\` saatine kurduğun alarm çalıyor.` }).then(async (msg) => {
            alarmResult(data, member, msg);
          });
          if (!data.alarm.repeat) await alarmDatabase.updateOne({ memberID: data.memberID, alarmID: data.alarmID }, { $set: { alarm: { saat: data.alarm.saat, repeat: false, gunler: { sali: false } } } });
        } else if (data.alarm.gunler.carsamba && data.alarm.saat == hourAndMin && dayName == "Çarşamba") {
          if (client.findChannel("alarm-log")) client.findChannel("alarm-log").send({ components: [row], content: `${member}, Çarşamba günü için \`${data.alarm.saat}\` saatine kurduğun alarm çalıyor.` }).then(async (msg) => {
            alarmResult(data, member, msg);
          });
          if (!data.alarm.repeat) await alarmDatabase.updateOne({ memberID: data.memberID, alarmID: data.alarmID }, { $set: { alarm: { saat: data.alarm.saat, repeat: false, gunler: { carsamba: false } } } })
        } else if (data.alarm.gunler.persembe && data.alarm.saat == hourAndMin && dayName == "Perşembe") {
          if (client.findChannel("alarm-log")) client.findChannel("alarm-log").send({ components: [row], content: `${member}, Perşembe günü için \`${data.alarm.saat}\` saatine kurduğun alarm çalıyor.` }).then(async (msg) => {
            await alarmResult(data, member, msg)
          });
          if (!data.alarm.repeat) await alarmDatabase.updateOne({ memberID: data.memberID, alarmID: data.alarmID }, { $set: { alarm: { saat: data.alarm.saat, repeat: false, gunler: { persembe: false } } } });
        } else if (data.alarm.gunler.cuma && data.alarm.saat == hourAndMin && dayName == "Cuma") {
          if (client.findChannel("alarm-log")) client.findChannel("alarm-log").send({ components: [row], content: `${member}, Cuma günü için \`${data.alarm.saat}\` saatine kurduğun alarm çalıyor.` }).then(async (msg) => {
            alarmResult(data, member, msg);
          });
          if (!data.alarm.repeat) await alarmDatabase.updateOne({ memberID: data.memberID, alarmID: data.alarmID }, { $set: { alarm: { saat: data.alarm.saat, repeat: false, gunler: { cuma: false } } } })
        } else if (data.alarm.gunler.cumartesi && data.alarm.saat == hourAndMin && dayName == "Cumartesi") {
          if (client.findChannel("alarm-log")) client.findChannel("alarm-log").send({ components: [row], content: `${member}, Cumartesi günü için \`${data.alarm.saat}\` saatine kurduğun alarm çalıyor.` }).then(async (msg) => {
            alarmResult(data, member, msg);
          });
          if (!data.alarm.repeat) await alarmDatabase.updateOne({ memberID: data.memberID, alarmID: data.alarmID }, { $set: { alarm: { saat: data.alarm.saat, repeat: false, gunler: { cumartesi: false } } } });
        } else if (data.alarm.gunler.pazar && data.alarm.saat == hourAndMin && dayName == "Pazar") {
          if (client.findChannel("alarm-log")) client.findChannel("alarm-log").send({ components: [row], content: `${member}, Pazar günü için \`${data.alarm.saat}\` saatine kurduğun alarm çalıyor.` }).then(async (msg) => {
            alarmResult(data, member, msg);
          });
          if (!data.alarm.repeat) await alarmDatabase.updateOne({ memberID: data.memberID, alarmID: data.alarmID }, { $set: { alarm: { saat: data.alarm.saat, repeat: false, gunler: { pazar: false } } } });
        }
      } else return;
    })
  }, 1000)
}

async function alarmResult(data, member, msg) {
  client.alarm.set(member.id);
  const filter = (interaction) => interaction.user.id == member.id;
  let collector = msg.createMessageComponentCollector({ filter, componentType: 'BUTTON', time: 60000 });
  collector.on('collect', async (button) => {
    if (button.customId == "btnErtele") {
      button.update({ content: `Alarmın 5 dakika sonra tekrar ötecek.`, components: [] });
      setTimeout(() => {
        if (client.findChannel("alarm-log")) client.findChannel("alarm-log").send({ components: [row], content: `${member}, \`${data.alarm.saat}\` saatinden sonra ertelediğin alarm ötüyor.` });
      }, 300000)
    } else if (button.customId == "btnKapat") {
      button.update({ content: `${member}, alarm kapatıldı.`, components: [] })
    }
  });

  collector.on("end", async (button) => {
    client.alarm.delete(member.id);
    msg.edit({ content: `${member}, alarm kapatıldı.`, components: [] })
  });
}