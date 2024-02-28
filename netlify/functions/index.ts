import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import dotenv from "dotenv";
dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// bot.command("branca", (ctx) => {});

bot.command("quit", async (ctx) => {
  await ctx.telegram.leaveChat(ctx.message.chat.id);
  await ctx.leaveChat();
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
