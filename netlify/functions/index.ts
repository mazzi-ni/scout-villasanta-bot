import { Telegraf } from "telegraf";
import { Markup } from "telegraf";
import { format, parseISO } from "date-fns";
import { message, callbackQuery } from "telegraf/filters";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export enum EBranca {
  "LC" = "LC",
  "EG" = "EG",
  "RS" = "RS",
  "COCA" = "COCA",
}

type Album = {
  name: string;
  date: string;
  album_link: string;
  album_cover: string;
  branca: EBranca;
  place?: string;
};

const bot = new Telegraf(process.env.BOT_TOKEN);
const album_regex = /https:\/\/photos\.app\.goo\.gl\/[A-Za-z0-9]+/i;
const fetch_album_url = "https://fetch-google-album.netlify.app/api/";
var branca: EBranca = EBranca.EG;
var album: Album;

bot.command("quit", async (ctx) => {
  await ctx.telegram.leaveChat(ctx.message.chat.id);
  await ctx.leaveChat();
});

bot.hears(album_regex, (ctx) => {
  let id = ctx.message.text.replace("https://photos.app.goo.gl/", "");

  let images: string[] = [];
  let cover_link: string;
  let today = new Date();
  let new_album: Album = {
    name: "",
    date: format(today, "dd/MM/yyyy"),
    album_link: ctx.message.text,
    album_cover: "",
    branca: EBranca.LC,
    place: "",
  };

  // image_cover
  axios
    .get(fetch_album_url + id)
    .then((res) => {
      images = res.data;
      new_album.album_cover = images[0];
      // ctx.reply(images[0]);
    })
    .catch((err) => ctx.reply(err));

  // branca:
  ctx.reply(
    "invia le info dell'album in questo formato:\n \nnome: [nome_album]\nluogo: [posto] \n\n e scegli una branca:",
    Markup.inlineKeyboard([
      Markup.button.callback(EBranca.LC, EBranca.LC),
      Markup.button.callback(EBranca.EG, EBranca.EG),
      Markup.button.callback(EBranca.RS, EBranca.RS),
      Markup.button.callback(EBranca.COCA, EBranca.COCA),
    ]),
  );

  bot.on(callbackQuery("data"), (ctx) => {
    new_album.branca = ctx.callbackQuery.data as EBranca;
    ctx.reply(new_album.branca);
  });

  
  bot.hears(/.*/, (ctx) => {
    const match = ctx.message.text.match(
      /nome:\s*([^\s]+)\s*luogo:\s*([^\s]+)/i,
    );
    if (match) {
      new_album.name = match[1].trim();
      new_album.place = match[2].trim();
      album = new_album;

      ctx.replyWithMarkdown(
        `*Album:* \n- nome: ${new_album.name} \n- luogo: ${new_album.place} \n- date: ${new_album.date} \n- branca: ${new_album.branca} \n- cover: [cover](${new_album.album_cover}) \n- url: [link](${new_album.album_link}`,
        {
          reply_markup: {
            inline_keyboard: [[{ text: "Conferma", callback_data: "confirm" }]],
          },
        },
      );
    } else {
      ctx.reply(
        "Messaggio non valido. Invia il tuo messaggio nel formato: \nnome: [nome] \nluogo: [posto]",
      );
    }
  });
});

bot.action("confirm", (ctx) => {
  axios
    .post("https://sheetdb.io/api/v1/szlv36k1mncvl", {
      id: "INCREMENT",
      ...album,
    })
    .then((res) => {
      // console.log(res);
      ctx.reply("Album Aggiunto! " + res.status.toString());
    })
    .catch((err) => ctx.reply(err));

  ctx.answerCbQuery("Operazione confermata");
});

// local ?
bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

// functions:
// exports.handler = async event => {
//   try {
//     await bot.handleUpdate(JSON.parse(event.body))
//     return { statusCode: 200, body: "" }
//   } catch (e) {
//     console.error("error in handler:", e)
//     return { statusCode: 400, body: "This endpoint is meant for bot and telegram communication" }
//   }
// }
