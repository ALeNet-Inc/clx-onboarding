<?php
function request_verification() {
  global $pdo; $in = json_input(); $email = strtolower(trim($in['email'] ?? ''));
  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { http_response_code(422); return ['error'=>'invalid_email']; }
  $pdo->beginTransaction();
  $stmt = $pdo->prepare('INSERT INTO users(email,email_verified) VALUES(?,0) ON DUPLICATE KEY UPDATE email=email');
  $stmt->execute([$email]);
  $userId = $pdo->lastInsertId() ?: ($pdo->query("SELECT id FROM users WHERE email=".$pdo->quote($email))->fetch()['id']);
  $token = bin2hex(random_bytes(32));
  $expires = (new DateTimeImmutable('+15 minutes'))->format('Y-m-d H:i:s');
  $pdo->prepare('INSERT INTO email_verifications(user_id,purpose,token,expires_at) VALUES(?,?,?,?)')
      ->execute([$userId,'signup',$token,$expires]);
  $pdo->commit();
  // TODO: send mail via SMTP/SES with link: https://app.example.com/verify?token=$token
  return ['ok'=>true];
}

function verify_email() {
  global $pdo; $in = json_input(); $token = $in['token'] ?? '';
  $stmt = $pdo->prepare('SELECT * FROM email_verifications WHERE token=? AND consumed_at IS NULL AND expires_at>NOW()');
  $stmt->execute([$token]); $row = $stmt->fetch(); if(!$row){ http_response_code(400); return ['error'=>'invalid_or_expired']; }
  $pdo->prepare('UPDATE users SET email_verified=1 WHERE id=?')->execute([$row['user_id']]);
  $pdo->prepare('UPDATE email_verifications SET consumed_at=? WHERE id=?')->execute([now(),$row['id']]);
  return ['ok'=>true, 'jwt'=>sign_jwt($row['user_id'])];
}

function login() {
  global $pdo; $in = json_input(); $email=strtolower(trim($in['email']??'')); $pwd=$in['password']??'';
  $u = $pdo->prepare('SELECT * FROM users WHERE email=?'); $u->execute([$email]); $user=$u->fetch();
  if(!$user || !$user['password_hash'] || !password_verify($pwd,$user['password_hash'])) { http_response_code(401); return ['error'=>'invalid_credentials']; }
  if(!$user['email_verified']) { http_response_code(403); return ['error'=>'email_not_verified']; }
  return ['ok'=>true, 'jwt'=>sign_jwt($user['id'])];
}