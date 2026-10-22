import "dotenv/config"
import OpenAI from "openai"
import readline from "readline/promises";

const client = new OpenAI({
    baseURL: process.env.API_ENDPOINT,
    apiKey: process.env.API_KEY
});
const MODEL = process.env.API_MODEL;
const prompt = 'you are an assistant that you must answer me friendly';
const history = [{role: "system", content: prompt}];

async function streamChat(userMessage){
    history.push({role: 'user', content: userMessage});
    const stream = await client.chat.completions.create({
        model: MODEL,
        max_tokens: 1024,
        messages: history,
        stream: true,
        stream_options: {include_usage: true},
    });
    let fullResponse = "";
    for await(const chunk of stream){
        const data = chunk.choices?.[0]?.delta?.content;
        if(data){
            process.stdout.write(data);
            fullResponse += data;
        }
    };
    history.push({role: 'assistant', content: fullResponse});

}
async function main(){
    const rdl = readline.createInterface({input: process.stdin, output: process.stdout});
    console.log("bot is ready:");
    console.log("end chat = exit");
    while(true){
        const question = (await rdl.question("you:")).trim();
        if(!question) continue;
        if(question === "exit") break;
        if(question === "clean"){
            history.length = 1;
            console.log("history is cleaned");
            continue;
        } 
        try {
            await streamChat(question);
        } catch (error) {
            console.log(error);
        }

    }
    rdl.close();
}
main();