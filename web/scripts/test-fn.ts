import { handler } from "../netlify/functions/ask";

const questions: [string, string][] = [
  ["菲律宾有什么美食？", "zh"],
  ["缅甸有什么必去的地方？", "zh"],
  ["老挝的泼水节是什么时候？", "zh"],
  ["东盟各国有什么代表美食？", "zh"],
  ["阿斗波是什么？", "zh"],
];

(async () => {
  for (const [question, lang] of questions) {
    const result: any = await handler({
      httpMethod: "POST",
      body: JSON.stringify({ question, lang }),
    });
    const data = JSON.parse(result.body);
    console.log("\nQ:", question);
    console.log(
      `  status=${data.answer_status} mode=${data.mode} cites=${data.citations.length} verify=${data.verification.verified}/${data.verification.sentences}`,
    );
    console.log("  A:", data.answer_md.slice(0, 220).replace(/\n+/g, " | "));
  }
})();
