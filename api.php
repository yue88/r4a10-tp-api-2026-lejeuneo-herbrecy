<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$steamApiKey = '847C531FE8FB222847926854D016ABA7';
$action = $_GET['action'] ?? '';

$genreToTag = [
    'action' => 19,
    'aventure' => 21,
    'adventure' => 21,
    'independant' => 492,
    'independent' => 492,
    'indie' => 492,
    'rpg' => 122,
    'strategie' => 9,
    'strategy' => 9,
    'simulation' => 599,
    'course' => 699,
    'racing' => 699,
    'sport' => 701,
    'sports' => 701,
    'casual' => 597,
    'acces anticipe' => 493,
    'early access' => 493,
    'free to play' => 113,
    'gratuit' => 113,
    'massively multiplayer' => 128,
    'multijoueur massif' => 128,
    'violent' => 4667,
    'horror' => 1667,
    'horreur' => 1667,
    'anime' => 4085,
    'survival' => 1662,
    'sandbox' => 3810,
    'open world' => 1695,
    'monde ouvert' => 1695,
    'fps' => 1663,
    'story rich' => 1742,
    'narratif' => 1742,
    'puzzle' => 1664,
];

try {
    switch ($action) {
        case 'owned-games':
            $steamId = requireQuery('steamid');
            respond(fetchJson(
                "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key={$steamApiKey}&steamid=" . rawurlencode($steamId) . "&include_appinfo=true&include_played_free_games=true"
            ));
            break;

        case 'profile':
            $steamId = requireQuery('steamid');
            $payload = fetchJson(
                "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key={$steamApiKey}&steamids=" . rawurlencode($steamId)
            );
            respond($payload['response']['players'][0] ?? null);
            break;

        case 'app-details':
            $appId = requireQuery('appid');
            $payload = fetchJson(
                "https://store.steampowered.com/api/appdetails?appids=" . rawurlencode($appId) . "&l=french"
            );
            $details = $payload[$appId] ?? null;

            if (!$details || empty($details['success'])) {
                respond(null);
            }

            respond($details['data'] ?? null);
            break;

        case 'top-category':
            $genre = requireQuery('genre');
            $tagId = $genreToTag[normalizeGenre($genre)] ?? null;

            if ($tagId === null) {
                respond(enrichSearchItems(fetchTopSellers()));
            }

            $payload = fetchJson(
                "https://store.steampowered.com/search/results/?json=1&filter=topsellers&category1=998&tags={$tagId}&supportedlang=french&hidef2p=1&page=1"
            );

            if (empty($payload['items'])) {
                $payload = fetchJson(
                    "https://store.steampowered.com/search/results/?json=1&filter=topsellers&category1=998&tags={$tagId}&page=1"
                );
            }

            if (empty($payload['items'])) {
                $payload = fetchTopSellers();
            }

            respond(enrichSearchItems($payload));
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

    return trim($value);
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

function fetchTopSellers(): array
{
    return fetchJson(
        "https://store.steampowered.com/search/results/?json=1&filter=topsellers&category1=998&page=1"
    );
}

function enrichSearchItems(array $payload): array
{
    $items = $payload['items'] ?? [];

    foreach ($items as &$item) {
        $appId = $item['id'] ?? $item['appid'] ?? null;

        if ($appId !== null) {
            $item['image_url'] = "https://cdn.cloudflare.steamstatic.com/steam/apps/{$appId}/library_hero.jpg";
            $item['image_fallback_url'] = "https://cdn.cloudflare.steamstatic.com/steam/apps/{$appId}/header.jpg";
            $item['steam_url'] = "https://store.steampowered.com/app/{$appId}";
        } else {
            $item['image_url'] = $item['logo'] ?? '';
            $item['image_fallback_url'] = $item['logo'] ?? '';
            $item['steam_url'] = "https://store.steampowered.com/search/?term=" . rawurlencode((string) ($item['name'] ?? ''));
        }
    }

    $payload['items'] = $items;

    return $payload;
}

function normalizeGenre(string $genre): string
{
    $genre = trim($genre);
    $genre = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $genre) ?: $genre;
    $genre = strtolower($genre);

    return preg_replace('/\s+/', ' ', $genre) ?? $genre;
}
