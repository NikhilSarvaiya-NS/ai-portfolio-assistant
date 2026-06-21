<?php

// Set strict error and exception handlers to output secure JSON
set_error_handler(function($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) {
        return;
    }
    throw new ErrorException($message, 0, $severity, $file, $line);
});

set_exception_handler(function($exception) {
    http_response_code(500);
    echo json_encode([
        'error' => [
            'message' => 'An unexpected server error occurred.',
            'type' => 'internal_error'
        ]
    ]);
    exit;
});

// Load environment variables if .env exists
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) {
            continue;
        }
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);
            // Remove optional enclosing quotes
            $value = trim($value, '"\'');
            if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
                putenv("{$name}={$value}");
                $_ENV[$name] = $value;
                $_SERVER[$name] = $value;
            }
        }
    }
}

// Session-based rate limiting (max 15 requests per minute for advanced interactions)
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$currentTime = time();
if (!isset($_SESSION['chat_requests'])) {
    $_SESSION['chat_requests'] = [];
}

// Keep only requests made in the last 60 seconds
$_SESSION['chat_requests'] = array_filter($_SESSION['chat_requests'], function($timestamp) use ($currentTime) {
    return ($currentTime - $timestamp) < 60;
});

if (count($_SESSION['chat_requests']) >= 15) {
    http_response_code(429);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => [
            'message' => 'Too many requests. Please wait a minute and try again.',
            'type' => 'rate_limit_error'
        ]
    ]);
    exit;
}

// Record current request timestamp
$_SESSION['chat_requests'][] = $currentTime;

// Add Security Headers
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Read JSON Input Payload
$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode([
        'error' => [
            'message' => 'Invalid JSON request payload.',
            'type' => 'bad_request'
        ]
    ]);
    exit;
}

// Load environment API key
$apiKey = getenv('OPENROUTER_API_KEY');
if (!$apiKey && isset($_ENV['OPENROUTER_API_KEY'])) {
    $apiKey = $_ENV['OPENROUTER_API_KEY'];
}

if (!$apiKey) {
    http_response_code(500);
    echo json_encode([
        'error' => [
            'message' => 'API configuration error. Please contact the administrator.',
            'type' => 'config_error'
        ]
    ]);
    exit;
}

// Load knowledge base
$knowledgePath = __DIR__ . '/knowledge.json';
if (!file_exists($knowledgePath)) {
    http_response_code(500);
    echo json_encode([
        'error' => [
            'message' => 'Knowledge base file is missing.',
            'type' => 'config_error'
        ]
    ]);
    exit;
}
$knowledge = file_get_contents($knowledgePath);

// Setup system prompt template
$systemPrompt = "You are Zakrom, the personal AI assistant for Nikhil Sarvaiya.

Your job is to help visitors learn about Nikhil, his projects, skills, education, services, experience, and portfolio.

PERSONALITY:
* Be friendly, modern and conversational.
* Sound like a smart human assistant, not a corporate support bot.
* Use natural language.
* Occasionally use light humor when appropriate.
* Be enthusiastic when discussing Nikhil's projects and skills.
* Avoid robotic phrases such as:
'According to the provided information...'
'Based on the portfolio...'
'The portfolio states...'
* Speak as if you already know Nikhil's work.

RESPONSE STYLE:
* Keep answers concise by default.
* Give detailed answers when the user asks for more information.
* Use markdown formatting.
* Use bullet points when listing skills, projects or services.
* Make responses visually pleasant and easy to read.
* Do not repeat the same wording in every answer.
* Vary your sentence structure naturally.

WHEN USERS ASK ABOUT NIKHIL:
Be confident and informative.

Example:
Instead of:
'Nikhil knows PHP, Laravel and MySQL.'
Say:
'🚀 Nikhil primarily works with PHP, Laravel and MySQL, with a strong focus on backend development and building real-world web applications.'

FOR PROJECT QUESTIONS:
Highlight the purpose and value of the project, not just the name. Refer users to the project case studies available in the portfolio section.

FOR CONTACT QUESTIONS:
Politely guide users toward the provided contact methods.

IMPORTANT:
Only use information available in the portfolio knowledge.
If information is missing, DO NOT invent anything.
Instead respond with something playful like:
😅 That's outside my current syllabus.
or
🤔 Nikhil hasn't taught me that one yet.
or
📚 That information isn't currently available in my knowledge base.

Keep these responses varied so they don't feel repetitive.
NEVER make up skills, projects, achievements, education, experience, technologies or personal details.
Do not format responses in high-column tables; instead, present tabular data using markdown lists, bold headers, and bullets.

PORTFOLIO KNOWLEDGE:
$knowledge";

// Build Multi-turn message context
$history = isset($data['history']) ? $data['history'] : [];
$messagesPayload = [];

if (is_array($history) && count($history) > 0) {
    // Limit history length to protect payloads (keep last 12 messages for thread memory)
    if (count($history) > 12) {
        $history = array_slice($history, -12);
    }
    
    foreach ($history as $msg) {
        if (isset($msg['role']) && isset($msg['content'])) {
            $role = in_array($msg['role'], ['user', 'assistant', 'system']) ? $msg['role'] : 'user';
            $content = htmlspecialchars(trim($msg['content']), ENT_QUOTES, 'UTF-8');
            $messagesPayload[] = [
                "role" => $role,
                "content" => $content
            ];
        }
    }
} else {
    // Fallback to single message format
    $userMessage = isset($data['message']) ? trim($data['message']) : '';
    if (empty($userMessage)) {
        http_response_code(400);
        echo json_encode([
            'error' => [
                'message' => 'Message is required and cannot be empty.',
                'type' => 'validation_error'
            ]
        ]);
        exit;
    }
    if (mb_strlen($userMessage) > 1000) {
        http_response_code(400);
        echo json_encode([
            'error' => [
                'message' => 'Message exceeds maximum allowed length of 1000 characters.',
                'type' => 'validation_error'
            ]
        ]);
        exit;
    }
    $userMessage = htmlspecialchars($userMessage, ENT_QUOTES, 'UTF-8');
    $messagesPayload[] = [
        "role" => "user",
        "content" => $userMessage
    ];
}

// Prepend the system prompt role
array_unshift($messagesPayload, [
    "role" => "system",
    "content" => $systemPrompt
]);

$payload = [
    "model" => "cohere/north-mini-code:free",
    "messages" => $messagesPayload
];

// Initialize cURL session
$ch = curl_init();
if ($ch === false) {
    http_response_code(500);
    echo json_encode([
        'error' => [
            'message' => 'Failed to initialize server-side request API.',
            'type' => 'internal_error'
        ]
    ]);
    exit;
}

curl_setopt_array($ch, [
    CURLOPT_URL => "https://openrouter.ai/api/v1/chat/completions",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        "Authorization: Bearer $apiKey",
        "Content-Type: application/json"
    ],
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_TIMEOUT => 25
]);

$response = curl_exec($ch);
$curlError = curl_error($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response === false) {
    http_response_code(502);
    echo json_encode([
        'error' => [
            'message' => 'Connection to assistant API failed: ' . $curlError,
            'type' => 'gateway_error'
        ]
    ]);
    exit;
}

if ($httpCode >= 400) {
    http_response_code($httpCode);
    $errorData = json_decode($response, true);
    if (json_last_error() === JSON_ERROR_NONE && isset($errorData['error'])) {
        echo $response;
    } else {
        echo json_encode([
            'error' => [
                'message' => 'Assistant service returned an error status ' . $httpCode,
                'type' => 'api_error'
            ]
        ]);
    }
    exit;
}

echo $response;