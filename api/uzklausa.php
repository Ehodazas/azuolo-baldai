<?php
/* =========================================================
   Ąžuolo Baldai — užklausų priėmimas (PHP 7.4+)
   ---------------------------------------------------------
   Priima abi svetainės formas, dar kartą tikrina duomenis,
   apsaugo nuo brukalo ir išsiunčia laišką su priedais.

   NUSTATYMAI — TIK SERVERIO APLINKOS KINTAMIEJI (ne šiame faile):
     AB_MAIL_TO         gavėjo el. paštas (privaloma)
     AB_MAIL_FROM       siuntėjo adresas jūsų domene, pvz. svetaine@azuolobaldai.lt (privaloma)
     AB_ALLOWED_ORIGIN  leidžiamas svetainės adresas, pvz. https://azuolobaldai.lt (rekomenduojama)

   Laiškas siunčiamas PHP mail() funkcija. Jei talpinimo
   paslauga reikalauja SMTP, žr. INTEGRACIJA.md.
   ========================================================= */

declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function respond(int $status, array $body): void {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

/* ---------- Konfigūracija ---------- */
$mailTo   = trim((string) getenv('AB_MAIL_TO'));
$mailFrom = trim((string) getenv('AB_MAIL_FROM'));
$origin   = trim((string) getenv('AB_ALLOWED_ORIGIN'));

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'error' => 'Leidžiamas tik POST metodas.']);
}
if (!filter_var($mailTo, FILTER_VALIDATE_EMAIL) || !filter_var($mailFrom, FILTER_VALIDATE_EMAIL)) {
    error_log('[uzklausa] Nenustatyti AB_MAIL_TO arba AB_MAIL_FROM aplinkos kintamieji.');
    respond(500, ['ok' => false, 'error' => 'Užklausų siuntimas serveryje dar nesukonfigūruotas.']);
}
if ($origin !== '' && isset($_SERVER['HTTP_ORIGIN']) && rtrim($_SERVER['HTTP_ORIGIN'], '/') !== rtrim($origin, '/')) {
    respond(403, ['ok' => false, 'error' => 'Užklausa atmesta.']);
}
/* per didelis POST (viršyta post_max_size) — PHP palieka $_POST tuščią */
if (empty($_POST) && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
    respond(413, ['ok' => false, 'error' => 'Pridėti failai per dideli.']);
}

/* ---------- Brukalo apsauga ---------- */
if (trim((string) ($_POST['website'] ?? '')) !== '') {
    respond(400, ['ok' => false, 'error' => 'Užklausa atmesta.']);
}
if ((int) ($_POST['elapsed_ms'] ?? 0) < 3000) {
    respond(400, ['ok' => false, 'error' => 'Forma pateikta per greitai. Pabandykite dar kartą.']);
}
/* paprastas ribojimas: ne daugiau kaip 5 užklausos per 10 min. iš vieno IP */
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rlFile = rtrim(sys_get_temp_dir(), '/\\') . DIRECTORY_SEPARATOR . 'ab_rl_' . hash('sha256', $ip) . '.json';
$now = time();
$hits = [];
if (is_file($rlFile)) {
    $hits = array_filter((array) json_decode((string) @file_get_contents($rlFile), true), fn($t) => is_int($t) && $t > $now - 600);
}
if (count($hits) >= 5) {
    respond(429, ['ok' => false, 'error' => 'Per daug užklausų per trumpą laiką.']);
}

/* ---------- Laukų tikrinimas ---------- */
$clean = fn($v, int $max) => mb_substr(trim(str_replace(["\r\n", "\r"], "\n", (string) $v)), 0, $max);
$oneLine = fn($v, int $max) => preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $clean($v, $max));

$formType = ($_POST['form_type'] ?? '') === 'quick' ? 'quick' : 'full';
$name    = $oneLine($_POST['name'] ?? '', 100);
$phone   = $oneLine($_POST['phone'] ?? '', 25);
$email   = $oneLine($_POST['email'] ?? '', 150);
$type    = (string) ($_POST['type'] ?? '');
$budget  = (string) ($_POST['budget'] ?? '');
$message = $clean($_POST['msg'] ?? '', 3000);
$project = $oneLine($_POST['project'] ?? '', 200);
$cart    = $clean($_POST['cart'] ?? '', 5000);
$favs    = $oneLine($_POST['favorites'] ?? '', 1500);
$visitType = (string) ($_POST['visit_type'] ?? '');
$visitDate = (string) ($_POST['visit_date'] ?? '');
$visitTime = (string) ($_POST['visit_time'] ?? '');
$page    = $oneLine($_POST['page'] ?? '', 300);
$consent = ($_POST['consent'] ?? '') === '1';

$types = ['virtuve' => 'Virtuvė', 'spinta' => 'Spinta / drabužinė', 'stalai' => 'Stalas ar kėdės', 'miegamasis' => 'Miegamojo baldai',
          'svetaine' => 'Svetainės baldai', 'restauravimas' => 'Restauravimas', 'garantija' => 'Garantinis aptarnavimas', 'kita' => 'Kita'];
$budgets = ['iki-1000' => 'Iki 1 000 €', '1000-3000' => '1 000–3 000 €', '3000-7000' => '3 000–7 000 €', 'virs-7000' => 'Daugiau nei 7 000 €', 'nezinau' => 'Dar nežinau'];

$errors = [];
if (mb_strlen($name) < 2) $errors['name'] = 'Įrašykite vardą.';
if (!preg_match('/^\+?[0-9 ()-]{6,20}$/', $phone) || strlen(preg_replace('/\D/', '', $phone)) < 6) $errors['phone'] = 'Patikrinkite telefono numerį.';
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['email'] = 'Patikrinkite el. pašto adresą.';
if (!isset($types[$type])) $errors['type'] = 'Pasirinkite gaminį.';
if ($formType === 'full') {
    if ($budget !== '' && !isset($budgets[$budget])) $errors['budget'] = 'Pasirinkite biudžetą.';
    if (!$consent) $errors['consent'] = 'Reikalingas sutikimas.';
}

/* matavimas / vizitas (neprivaloma) */
$visitTypes = ['matavimas' => 'Matavimas pas klientą', 'vizitas' => 'Vizitas į dirbtuvę'];
$visitTimes = ['8-10' => '8:00–10:00', '10-12' => '10:00–12:00', '12-14' => '12:00–14:00', '14-17' => '14:00–17:00'];
if ($formType === 'full' && $visitType !== '') {
    if (!isset($visitTypes[$visitType])) $errors['visit_type'] = 'Pasirinkite vizito tipą.';
    $d = DateTime::createFromFormat('!Y-m-d', $visitDate);
    $tomorrow = new DateTime('tomorrow');
    $limit = (new DateTime('today'))->modify('+90 days');
    if (!$d || $d->format('Y-m-d') !== $visitDate) $errors['visit_date'] = 'Patikrinkite datą.';
    elseif ($d < $tomorrow || $d > $limit) $errors['visit_date'] = 'Pasirinkite datą per artimiausius 3 mėnesius, nuo rytojaus.';
    elseif ($d->format('w') === '0') $errors['visit_date'] = 'Sekmadieniais nedirbame.';
    if (!isset($visitTimes[$visitTime])) $errors['visit_time'] = 'Pasirinkite laiką.';
}

/* ---------- Failų tikrinimas ---------- */
const MAX_FILE = 10 * 1024 * 1024;
const MAX_TOTAL = 20 * 1024 * 1024;
const MAX_FILES = 5;
$allowed = ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'pdf' => 'application/pdf'];
$attachments = [];
if ($formType === 'full' && !empty($_FILES['files']) && is_array($_FILES['files']['name'])) {
    $f = $_FILES['files'];
    $count = 0; $total = 0;
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    foreach ($f['name'] as $i => $origName) {
        if ($f['error'][$i] === UPLOAD_ERR_NO_FILE) continue;
        $count++;
        if ($f['error'][$i] !== UPLOAD_ERR_OK) { $errors['files'] = 'Nepavyko įkelti failo „' . $oneLine($origName, 80) . '“.'; break; }
        $ext = strtolower(pathinfo((string) $origName, PATHINFO_EXTENSION));
        $mime = $finfo->file($f['tmp_name'][$i]);
        if (!isset($allowed[$ext]) || $allowed[$ext] !== $mime) { $errors['files'] = 'Leidžiami tik JPG, PNG ir PDF failai.'; break; }
        if ($f['size'][$i] > MAX_FILE) { $errors['files'] = 'Kiekvienas failas turi būti ne didesnis nei 10 MB.'; break; }
        $total += $f['size'][$i];
        $safeName = preg_replace('/[^A-Za-z0-9._-]+/', '_', basename((string) $origName)) ?: ('failas.' . $ext);
        $attachments[] = ['name' => $safeName, 'mime' => $mime, 'path' => $f['tmp_name'][$i]];
    }
    if (!isset($errors['files']) && $count > MAX_FILES) $errors['files'] = 'Galima pridėti ne daugiau kaip 5 failus.';
    if (!isset($errors['files']) && $total > MAX_TOTAL) $errors['files'] = 'Bendras failų dydis viršija 20 MB.';
}

if ($errors) {
    respond(422, ['ok' => false, 'error' => 'Patikrinkite pažymėtus laukus.', 'errors' => $errors]);
}

/* ---------- Laiško sudarymas ---------- */
$subjectText = ($formType === 'quick' ? 'Skambučio užsakymas' : 'Nauja užklausa') . ': ' . $types[$type] . ' — ' . $name;
$subject = '=?UTF-8?B?' . base64_encode($subjectText) . '?=';
$lines = [
    'Forma: ' . ($formType === 'quick' ? 'Greita konsultacija' : 'Išsami užklausa'),
    'Vardas: ' . $name,
    'Telefonas: ' . $phone,
    'El. paštas: ' . ($email !== '' ? $email : '—'),
    'Gaminys: ' . $types[$type],
];
if ($formType === 'full') $lines[] = 'Biudžetas: ' . ($budgets[$budget] ?? '—');
if ($project !== '') $lines[] = 'Domina projektas: ' . $project;
if ($favs !== '') $lines[] = 'Mėgstami projektai: ' . $favs;
if ($formType === 'full' && $visitType !== '') $lines[] = 'Pageidauja: ' . $visitTypes[$visitType] . ', ' . $visitDate . ', ' . $visitTimes[$visitTime] . ' (patvirtinti telefonu)';
if ($cart !== '') { $lines[] = ''; $lines[] = 'Užsakymo krepšelis (orientacinės kainos):'; $lines[] = $cart; }
if ($message !== '') { $lines[] = ''; $lines[] = 'Žinutė:'; $lines[] = $message; }
$lines[] = '';
$lines[] = 'Pridėti failai: ' . (count($attachments) ?: 'nėra');
$lines[] = 'Puslapis: ' . ($page !== '' ? $page : '—');
$lines[] = 'Išsiųsta: ' . date('Y-m-d H:i');
$text = implode("\n", $lines);

$boundary = 'ab_' . bin2hex(random_bytes(12));
$headers = [
    'From: =?UTF-8?B?' . base64_encode('Ąžuolo Baldai svetainė') . '?= <' . $mailFrom . '>',
    'MIME-Version: 1.0',
    'Content-Type: multipart/mixed; boundary="' . $boundary . '"',
];
if ($email !== '') $headers[] = 'Reply-To: ' . $email; /* jau patikrintas filter_var */

$body  = "--$boundary\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n";
$body .= chunk_split(base64_encode($text)) . "\r\n";
foreach ($attachments as $a) {
    $body .= "--$boundary\r\nContent-Type: {$a['mime']}; name=\"{$a['name']}\"\r\nContent-Transfer-Encoding: base64\r\n";
    $body .= "Content-Disposition: attachment; filename=\"{$a['name']}\"\r\n\r\n";
    $body .= chunk_split(base64_encode((string) file_get_contents($a['path']))) . "\r\n";
}
$body .= "--$boundary--\r\n";

$sent = @mail($mailTo, $subject, $body, implode("\r\n", $headers));
/* įkelti failai yra laikini — PHP juos ištrina pasibaigus užklausai */

if (!$sent) {
    error_log('[uzklausa] mail() grąžino false.');
    respond(502, ['ok' => false, 'error' => 'Serveriui nepavyko išsiųsti laiško.']);
}

$hits[] = $now;
@file_put_contents($rlFile, json_encode(array_values($hits)), LOCK_EX);
respond(200, ['ok' => true]);
