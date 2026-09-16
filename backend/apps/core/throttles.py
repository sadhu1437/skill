from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class PublicReadThrottle(AnonRateThrottle):
    scope = "public_read"


class AuthenticatedReadThrottle(UserRateThrottle):
    scope = "authenticated_read"


class ArticleWriteThrottle(UserRateThrottle):
    scope = "article_write"


class ArticleActionThrottle(UserRateThrottle):
    scope = "article_action"


class CommentThrottle(UserRateThrottle):
    scope = "comment_write"


class AnonymousAuthThrottle(AnonRateThrottle):
    scope = "authentication"
