<?php
require __DIR__.'/vendor/autoload.php';
$env = parse_ini_file(__DIR__.'/../../.env', true);

$pdo = new PDO($env['DB_DSN'], $env['DB_USER'], $env['DB_PASS'], [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

function json_input() { return json_decode(file_get_contents('php://input'), true) ?? []; }
function now() { return (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format('Y-m-d H:i:s'); }

function sign_jwt($userId) {
  $secret = $_ENV['JWT_SECRET'] ?? 'dev';
  $payload = ['sub'=>$userId,'iat'=>time(),'exp'=>time()+3600];
  return \Firebase\JWT\JWT::encode($payload, $secret, 'HS256');
}

function require_auth() {
  $hdr = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
  if (!preg_match('/Bearer\s+(.*)/', $hdr, $m)) { http_response_code(401); exit; }
  $secret = $_ENV['JWT_SECRET'] ?? 'dev';
  try { $tok = \Firebase\JWT\JWT::decode($m[1], new \Firebase\JWT\Key($secret,'HS256')); $_SERVER['user_id']=$tok->sub; }
  catch (Exception $e) { http_response_code(401); echo json_encode(['error'=>'invalid_token']); exit; }
}