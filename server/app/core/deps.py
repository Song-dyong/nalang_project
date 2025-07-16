from fastapi import Request


async def get_locale(request: Request) -> str:
    accept_language = request.headers.get("accept-language", "ko")
    locale = accept_language.split(",")[0].strip().lower()

    supported_locales = {"en", "ko", "ja"}
    return locale if locale in supported_locales else "ko"
