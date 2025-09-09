<?php
// Very small router (for brevity). In production use Slim/Laravel & middleware.
require __DIR__.'/lib/bootstrap.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];
header('Content-Type: application/json');

function route($method, $path) {
  return $_SERVER['REQUEST_METHOD'] === $method && preg_match($path, parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
}

if (route('POST', '#^/api/auth/request-verification$#')) {
  echo json_encode(request_verification()); exit;
}
if (route('POST', '#^/api/auth/verify$#')) {
  echo json_encode(verify_email()); exit;
}
if (route('POST', '#^/api/auth/login$#')) {
  echo json_encode(login()); exit;
}
if (route('GET',  '#^/api/profile$#')) { require_auth(); echo json_encode(get_profile()); exit; }
if (route('PUT',  '#^/api/profile$#')) { require_auth(); echo json_encode(update_profile()); exit; }
if (route('PUT',  '#^/api/kyc/individual$#')) { require_auth(); echo json_encode(update_kyc_individual()); exit; }
if (route('PUT',  '#^/api/kyc/company$#')) { require_auth(); echo json_encode(update_kyc_company()); exit; }
if (route('PUT',  '#^/api/investment$#')) { require_auth(); echo json_encode(update_investment()); exit; }

http_response_code(404); echo json_encode(['error' => 'Not found']);
