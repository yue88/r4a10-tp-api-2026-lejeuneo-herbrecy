<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$steamApiKey = '847C531FE8FB222847926854D016ABA7';
$action = $_GET['action'] ?? '';

$genreToTag = [
    'Action' => 19,
    'Aventure' => 21,
    'Adventure' => 21,
    'Indépendant' => 492,
    'Independent' => 492,
    'Indie' => 492,
    'RPG' => 122,
    'Stratégie' => 9,
    'Strategy' => 9,
    'Simulation' => 599,
    'Course' => 699,
    'Racing' => 699,
    'Sport' => 701,
    'Sports' => 701,
    'Casual' => 597,
    'Accès anticipé' => 493,
    'Early Access' => 493,
];

try {
    switch ($action) {
        case 'owned-games':
            $steamId = requireQuery('steamid');
            respond(fetchJson(
                "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key={$steamApiKey}&steamid={$steamId}&include_appinfo=true&include_played_free_games=true"
            ));
            break;

        case 'profile':
            $steamId = requireQuery('steamid');
            $payload = fetchJson(
                "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key={$steamApiKey}&steamids={$steamId}"
            );
            respond($payload['response']['players'][0] ?? null);
            break;

        case 'app-details':
            $appId = requireQuery('appid');
            $payload = fetchJson("https://store.steampowered.com/api/appdetails?appids={$appId}&l=french");
            $details = $payload[$appId] ?? null;

            if (!$details || empty($details['success'])) {
                respond(null);
            }

            respond($details['data'] ?? null);
            break;

        case 'top-category':
            $genre = requireQuery('genre');
            $tagId = $genreToTag[$genre] ?? null;

            if ($tagId === null) {
                respond(['items' => []]);
            }

            respond(fetchJson(
                "https://store.steampowered.com/search/results/?json=1&filter=topsellers&category1=998&tags={$tagId}&supportedlang=french&hidef2p=1&page=1"
            ));
            break;

        default:
            http_response_code(400);
            respond(['error' => 'Action invalide']);
    }
} catch (Throwable $e) {
    http_response_code(500);
    respond(['error' => $e->getMessage()]);
}

function requireQuery(string $key): string
{
    $value = $_GET[$key] ?? '';

    if ($value === '') {
        throw new RuntimeException("Parametre manquant : {$key}");
    }

    return rawurlencode($value);
}

function fetchJson(string $url): array
{
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => "User-Agent: SteamMiniBackend/1.0\r\n",
            'timeout' => 20,
        ],
    ]);

    $response = @file_get_contents($url, false, $context);

    if ($response === false) {
        throw new RuntimeException('Echec de la requete distante');
    }

    $decoded = json_decode($response, true);

    if (!is_array($decoded)) {
        throw new RuntimeException('Reponse JSON invalide');
    }

    return $decoded;
}

function respond($payload): void
{
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
