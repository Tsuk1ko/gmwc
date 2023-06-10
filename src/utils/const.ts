import { decode } from 'js-base64';

export const mConsts = [
  // 0
  'ZTIwMjAwOTI5MTEzOTUwMQ==',
  'aHR0cHM6Ly9hcGktdGFrdW1pLm1paG95by5jb20v',
  'eC1ycGMtZGV2aWNlX2lk',
  'eC1ycGMtY2xpZW50X3R5cGU=',
  'eC1ycGMtYXBwX3ZlcnNpb24=',
  // 5
  'TW96aWxsYS81LjAgKGlQaG9uZTsgQ1BVIGlQaG9uZSBPUyAxNF8yXzEgbGlrZSBNYWMgT1MgWCkgQXBwbGVXZWJLaXQvNjA1LjEuMTUgKEtIVE1MLCBsaWtlIEdlY2tvKSBtaUhvWW9CQlMvMi4zLjA=',
  'aHR0cHM6Ly93ZWJzdGF0aWMubWlob3lvLmNvbQ==',
  'aHR0cHM6Ly93ZWJzdGF0aWMubWlob3lvLmNvbS9iYnMvZXZlbnQvc2lnbmluLXlzL2luZGV4Lmh0bWw/YmJzX2F1dGhfcmVxdWlyZWQ9dHJ1ZSZhY3RfaWQ9',
  'JnV0bV9zb3VyY2U9YmJzJnV0bV9tZWRpdW09bXlzJnV0bV9jYW1wYWlnbj1pY29u',
  'L2JpbmRpbmcvYXBpL2dldFVzZXJHYW1lUm9sZXNCeUNvb2tpZQ==',
  // 10
  'L2V2ZW50L2Jic19zaWduX3Jld2FyZC9zaWdu',
  'ejhEUklVak5EVDdJVDVJWlh2clVBeHl1cEExcGVORDk=',
  'OW5RaVUzQVYwckpTSUJXZ2R5bmZvR01HS2FrbGZiTTc=',
  'eyJ4LXJwYy1jbGllbnRfdHlwZSI6IjIiLCJ4LXJwYy1hcHBfdmVyc2lvbiI6IjIuMzQuMSIsIngtcnBjLXN5c192ZXJzaW9uIjoiNi4wLjEiLCJ4LXJwYy1jaGFubmVsIjoibWl5b3VzaGVsdW9kaSIsIngtcnBjLWRldmljZV9uYW1lIjoiWGlhb01pIiwieC1ycGMtZGV2aWNlX21vZGVsIjoiTWkgMTAiLCJ1c2VyLWFnZW50Ijoib2todHRwLzQuOC4wIn0=',
  'aHR0cHM6Ly9hcHAubWlob3lvLmNvbQ==',
  // 15
  'aHR0cHM6Ly9hcGktdGFrdW1pLm1paG95by5jb20vYXBpaHViL2FwcC9hcGkvc2lnbklu',
  'aHR0cHM6Ly9iYnMtYXBpLm1paG95by5jb20vcG9zdC93YXBpL2dldEZvcnVtUG9zdExpc3Q=',
  'aHR0cHM6Ly9iYnMtYXBpLm1paG95by5jb20vcG9zdC9hcGkvZ2V0UG9zdEZ1bGw=',
  'aHR0cHM6Ly9iYnMtYXBpLm1paG95by5jb20vYXBpaHViL3NhcGkvdXB2b3RlUG9zdA==',
  'aHR0cHM6Ly9iYnMtYXBpLm1paG95by5jb20vYXBpaHViL2FwaS9nZXRTaGFyZUNvbmY=',
  // 20
  'dDBxRWdmdWI2Y3Z1ZUFQZ1I1bTlhUVdXVmNpRWVyN3Y=',
  'aHR0cHM6Ly9iYnMtYXBpLm1paG95by5jb20vYXBpaHViL3NhcGkvZ2V0VXNlck1pc3Npb25zU3RhdGU=',
  'aHR0cHM6Ly9wYXNzcG9ydC1hcGkubWlob3lvLmNvbS9hY2NvdW50L21hLWNuLXBhc3Nwb3J0L2FwcC9sb2dpbkJ5UGFzc3dvcmQ=',
  'aHR0cHM6Ly93ZWJzdGF0aWMubWlob3lvLmNvbS9iYnMvZXZlbnQvc2lnbmluLXlzL2luZGV4Lmh0bWw/YmJzX2F1dGhfcmVxdWlyZWQ9dHJ1ZSZhY3RfaWQ9ZTIwMjAwOTI5MTEzOTUwMSZ1dG1fc291cmNlPWJicyZ1dG1fbWVkaXVtPW15cyZ1dG1fY2FtcGFpZ249aWNvbg==',
  '',
  // 25
  'aHR0cHM6Ly9hcGktdGFrdW1pLm1paG95by5jb20vZXZlbnQvYmJzX3NpZ25fcmV3YXJkL2luZm8=',
  'aHR0cHM6Ly9hcGktdGFrdW1pLm1paG95by5jb20vZXZlbnQvYmJzX3NpZ25fcmV3YXJkL2hvbWU=',
  'aGs0ZV9jbg==',
  '5Y6f55+z',
  'aGtycGdfY24=',
  // 30
  'ZTIwMjMwNDEyMTUxNjU1MQ==',
  'aHR0cHM6Ly9hcGktdGFrdW1pLm1paG95by5jb20vZXZlbnQvbHVuYS9ob21l',
  '5pif55C8',
  'aHR0cHM6Ly9hcGktdGFrdW1pLm1paG95by5jb20vZXZlbnQvbHVuYS9pbmZv',
  'aHR0cHM6Ly9hcGktdGFrdW1pLm1paG95by5jb20vZXZlbnQvbHVuYS9zaWdu',
].map(decode);

export const wConsts = [
  // 0
  'V2VpYm9PdmVyc2Vhcy80LjMuNSAoaVBob25lOyBpT1MgMTQuNjsgU2NhbGUvMy4wMCk=',
  'Xy1fcGFnZV9pbmZlZWRfYXN5bmNtaXg=',
  'aHR0cHM6Ly9rYS5zaW5hLmNvbS5jbg==',
  'd2VpY29hYnJvYWQ=',
  'aHR0cDovL2kuaHVhdGkud2VpYm8uY29tL21vYmlsZS9zdXBlci9hY3RpdmVfZmNoZWNraW4/cGFnZWlkPQ==',
  // 5
  'aHR0cHM6Ly9sb2dpbi5zaW5hLmNvbS5jbi8=',
  'aHR0cHM6Ly9rYS5zaW5hLmNvbS5jbi9odG1sNS9teWJveA==',
  'aHR0cHM6Ly93ZWliby5jb20vYWovYWNjb3VudC93YXRlcm1hcms=',
  'aHR0cHM6Ly9sb2dpbi5zaW5hLmNvbS5jbi9zc28vbG9naW4ucGhw',
  'aHR0cHM6Ly93ZWliby5jb20veXNtaWhveW8=',
  // 10
  'c2luYVNTT0NvbnRyb2xsZXIuZG9Dcm9zc0RvbWFpbkNhbGxCYWNr',
  'c3Nvc2NyaXB0MA==',
  'c3NvbG9naW4uanModjEuNC4yKQ==',
  'aHR0cHM6Ly93ZWliby5jb20vcC9hai9nZW5lcmFsL2J1dHRvbg==',
  'aHR0cDovL2kuaHVhdGkud2VpYm8uY29tL2FqL3N1cGVyL2NoZWNraW4=',
  // 15
  'aHR0cHM6Ly9hcGkud2VpYm8uY24vMi9wYWdlL2J1dHRvbg==',
  'aHR0cHM6Ly9rYS5zaW5hLmNvbS5jbi9pbm5lcmFwaS9kcmF3',
  'd2JsaW5r',
  'aHR0cHM6Ly9rYS5zaW5hLmNvbS5jbi9odG1sNS9naWZ0Lw==',
  'MTAwMDAwMTE=',
  // 20
  'Xy1fZmVlZA==',
  'aHR0cHM6Ly9tLndlaWJvLmNuL2FwaS9jb250YWluZXIvZ2V0SW5kZXg=',
  'aHR0cHM6Ly9hcGkud2VpYm8uY24vMi9jb250YWluZXIvZ2V0X2l0ZW0=',
  'MTBCOTI5MzAxMA==',
  'aHR0cHM6Ly9zaW5hLmNvbS5jbg==',
  // 25
  'aHR0cHM6Ly9nYW1lcy53ZWliby5jbi9wcml6ZS9hai9sb3R0ZXJ5',
  'aHR0cHM6Ly9nYW1lcy53ZWliby5jbi9wcml6ZS9sb3R0ZXJ5',
  'MTBDMDA5MzAxMA==',
].map(decode);
