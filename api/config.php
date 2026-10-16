<?php
declare(strict_types=1);

// No passwords or API keys are needed when the host supports PHP mail().
// Ask your web host to approve/create this sender and configure SPF/DKIM.
return [
    'recipient' => 'devoceandivers.mexico@gmail.com',
    'sender' => 'website@devoceandivers.com.mx',
    'allowed_origins' => [
        'https://www.devoceandivers.com.mx',
        'https://devoceandivers.com.mx',
    ],
];
