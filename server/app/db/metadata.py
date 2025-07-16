from app.domains.user.models.users import User
from app.domains.user.models.language import Language, LanguageTranslation
from app.domains.user.models.interest import (
    Interest,
    InterestTranslation,
    user_interest_association,
)
from app.db.base_class import Base
