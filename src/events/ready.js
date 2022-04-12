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
      let member = guild.members.cache.get(data.memberID);
      if (!member) return;
      if (!client.alarm.has(member.id)) {
        dayCheck(member, data.alarm.gunler.pazartesi, data, "Pazartesi");
        dayCheck(member, data.alarm.gunler.sali, data, "Salı");
        dayCheck(member, data.alarm.gunler.carsamba, data, "Çarşamba");
        dayCheck(member, data.alarm.gunler.persembe, data, "Perşembe");
        dayCheck(member, data.alarm.gunler.cuma, data, "Cuma");
      }

    })
  }, 1000)
}

//@Fahrettin Enes#9583 - 875060734969655307
async function dayCheck(member, gun, data, gunString) {
  let dayName = moment().format('dddd');
  let hourAndMin = moment().format('HH:mm');

  if (gun && data.alarm.saat == hourAndMin && dayName == gunString) {
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
    if (client.findChannel("alarm-log")) client.findChannel("alarm-log").send({ components: [row], content: `${member}, ${gunString} günü için \`${data.alarm.saat}\` saatine kurduğun alarm çalıyor.` }).then(async (msg) => {
      alarmResult(data, member, msg);
    });
    if (!data.alarm.repeat) {
      await alarmDatabase.updateOne({
        memberID: member.id,
        alarmID: data.alarmID
      },
        {
          $set: {
            alarm: {
              saat: data.alarm.saat,
              repeat: false,
              gunler: {
                [gunString.toLowerCase()]: false
              }
            }
          }
        });
    }
  }
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