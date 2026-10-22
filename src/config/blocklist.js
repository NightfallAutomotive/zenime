// Channels and services that should never appear on the site, matched
// against the channel or service name.
export const BLOCKED = /\bBBC\b|CBeebies|CBBC/i;

export const isBlocked = (name) => BLOCKED.test(name);
