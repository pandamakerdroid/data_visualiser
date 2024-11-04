# one fake user
fake_user = {
    "testuser": {
        "username": "testuser",
        "hashed_password": "$2b$12$DbXFTl76KvkIhfkBh.RxQ.Xw7ctpBW51fbkhA7tWu1rYkH1qBOu9e"  # hashed pw for simple auth purpose, not prod ready!
    }
}

def get_user(username: str):
    return fake_user.get(username)