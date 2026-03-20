<?php
// analyze_mood.php
// Backend proxy for Gemini mood analysis so the API key is never exposed to the browser.

header('Content-Type: application/json');

// Allow only POST with JSON
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

$text = isset($data['text']) ? trim($data['text']) : '';
if ($text === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing text to analyze']);
    exit;
}

// Load API key from config.local.php (gitignored) — never commit the real key.
$apiKey = getenv('GEMINI_API_KEY');
if (!$apiKey) {
    $localConfig = @include __DIR__ . '/config.local.php';
    // Check both GEMINI_API_KEY (for backward compatibility) and HF_API_KEY
    $apiKey = is_array($localConfig) ? ($localConfig['HF_API_KEY'] ?? $localConfig['GEMINI_API_KEY'] ?? '') : '';
}
if (!$apiKey) {
    http_response_code(500);
    echo json_encode(['error' => 'Hugging Face API key not configured in config.local.php.']);
    exit;
}

// Using a robust, supported chat model on Hugging Face Inference Providers
$model = 'meta-llama/Llama-3.1-8B-Instruct';

$prompt = sprintf(
    "Analyze the following text and categorize the mood into exactly one of these six categories: \"happy\", \"sad\", \"energetic\", \"chill\", \"romantic\", or \"nostalgic\". Reply with ONLY the exact single word, no punctuation, no explanation.\n\nText: \"%s\"",
    $text
);

$url = "https://router.huggingface.co/v1/chat/completions";

$payload = json_encode([
    'model' => $model,
    'messages' => [
        ['role' => 'user', 'content' => $prompt]
    ],
    'max_tokens' => 10,
]);

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey
    ],
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_TIMEOUT => 20,
]);

$responseBody = curl_exec($ch);

if ($responseBody === false) {
    http_response_code(502);
    echo json_encode(['error' => 'Could not reach Hugging Face API: ' . curl_error($ch)]);
    curl_close($ch);
    exit;
}

$httpStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$apiData = json_decode($responseBody, true);

if ($httpStatus < 200 || $httpStatus >= 300) {
    $msg = "Unexpected error from Hugging Face API (HTTP $httpStatus). Response: " . $responseBody;
    if (isset($apiData['error'])) {
        $msg = is_array($apiData['error']) ? implode(', ', $apiData['error']) : (isset($apiData['error']['message']) ? $apiData['error']['message'] : $apiData['error']);
        $msg .= " (HTTP $httpStatus)";
    }
    http_response_code($httpStatus);
    echo json_encode(['error' => $msg]);
    exit;
}

$rawText = '';
// OpenAI-compatible response format
if (isset($apiData['choices'][0]['message']['content'])) {
    $rawText = $apiData['choices'][0]['message']['content'];
}

$mood = strtolower(trim($rawText));
$validMoods = ['happy', 'sad', 'energetic', 'chill', 'romantic', 'nostalgic'];
if (!in_array($mood, $validMoods, true)) {
    // If the model returned extra text, try to find one of the valid moods in it
    foreach ($validMoods as $vm) {
        if (strpos($mood, $vm) !== false) {
            $mood = $vm;
            break;
        }
    }
    if (!in_array($mood, $validMoods, true)) {
        $mood = 'chill';
    }
}

echo json_encode([
    'mood' => $mood,
]);

