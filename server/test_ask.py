import app

QUESTIONS = [
    ("印尼和越南的街头美食有什么不同？", "zh"),
    ("泰国泼水节是什么时候？", "zh"),
    ("吴哥窟最适合什么时候去？", "zh"),
    ("新加坡的货币是什么？", "zh"),
    ("What is the signature dish of Malaysia?", "en"),
    ("Apa hidangan khas Indonesia?", "id"),
    ("火星上的美食推荐", "zh"),
]

for question, lang in QUESTIONS:
    result = app.ask(app.AskRequest(question=question, lang=lang))
    print("Q:", question)
    print(
        "  status=%s mode=%s cites=%s verify=%s/%s removed=%s"
        % (
            result["answer_status"],
            result["mode"],
            len(result["citations"]),
            result["verification"]["verified"],
            result["verification"]["sentences"],
            result["verification"]["removed"],
        )
    )
    print("  A:", result["answer_md"][:320].replace("\n", " | "))
    print()
