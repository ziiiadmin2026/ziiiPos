import base64
import hashlib
import hmac
import json
import secrets
import time


def base64url(data: bytes) -> str:
  return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def sign_jwt(payload: dict, secret: str) -> str:
  header = {"alg": "HS256", "typ": "JWT"}
  header_segment = base64url(json.dumps(header, separators=(",", ":")).encode("utf-8"))
  payload_segment = base64url(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
  signing_input = f"{header_segment}.{payload_segment}".encode("ascii")
  signature = hmac.new(secret.encode("utf-8"), signing_input, hashlib.sha256).digest()
  return f"{header_segment}.{payload_segment}.{base64url(signature)}"


def main() -> None:
  jwt_secret = base64url(secrets.token_bytes(48))
  postgres_password = base64url(secrets.token_bytes(24))
  dashboard_password = base64url(secrets.token_bytes(24))
  expires_at = int(time.time()) + 60 * 60 * 24 * 365 * 10

  anon_payload = {
    "role": "anon",
    "iss": "supabase",
    "iat": int(time.time()),
    "exp": expires_at,
  }
  service_payload = {
    "role": "service_role",
    "iss": "supabase",
    "iat": int(time.time()),
    "exp": expires_at,
  }

  anon_key = sign_jwt(anon_payload, jwt_secret)
  service_role_key = sign_jwt(service_payload, jwt_secret)

  print("# Self-hosted Supabase keys for local VM deployment")
  print(f"POSTGRES_PASSWORD={postgres_password}")
  print(f"JWT_SECRET={jwt_secret}")
  print(f"ANON_KEY={anon_key}")
  print(f"SERVICE_ROLE_KEY={service_role_key}")
  print(f"NEXT_PUBLIC_SUPABASE_ANON_KEY={anon_key}")
  print(f"SUPABASE_SERVICE_ROLE_KEY={service_role_key}")
  print(f"DASHBOARD_PASSWORD={dashboard_password}")


if __name__ == "__main__":
  main()