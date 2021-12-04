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
  'L2JpbmRpbmcvYXBpL2dldFVzZXJHYW1lUm9sZXNCeUNvb2tpZT9nYW1lX2Jpej1oazRlX2Nu',
  // 10
  'L2V2ZW50L2Jic19zaWduX3Jld2FyZC9zaWdu',
  'aDh3NTgyd3h3Z3F2YWhjZGtwdmRoYmgydzljYXNnZmw=',
  'ZmQzeWtyaDdvMWo1NGc1ODF1cG8xdHZwYW0wZHNndGY=',
  'eyJ4LXJwYy1jbGllbnRfdHlwZSI6IjIiLCJ4LXJwYy1hcHBfdmVyc2lvbiI6IjIuNy4wIiwieC1ycGMtc3lzX3ZlcnNpb24iOiI2LjAuMSIsIngtcnBjLWNoYW5uZWwiOiJtaXlvdXNoZWx1b2RpIiwieC1ycGMtZGV2aWNlX25hbWUiOiJYaWFvTWkiLCJ4LXJwYy1kZXZpY2VfbW9kZWwiOiJNaSAxMCIsInVzZXItYWdlbnQiOiJva2h0dHAvNC44LjAifQ==',
  'aHR0cHM6Ly9hcHAubWlob3lvLmNvbQ==',
  // 15
  'aHR0cHM6Ly9iYnMtYXBpLm1paG95by5jb20vYXBpaHViL3NhcGkvc2lnbklu',
  'aHR0cHM6Ly9iYnMtYXBpLm1paG95by5jb20vcG9zdC9hcGkvZ2V0Rm9ydW1Qb3N0TGlzdA==',
  'aHR0cHM6Ly9iYnMtYXBpLm1paG95by5jb20vcG9zdC9hcGkvZ2V0UG9zdEZ1bGw=',
  'aHR0cHM6Ly9iYnMtYXBpLm1paG95by5jb20vYXBpaHViL3NhcGkvdXB2b3RlUG9zdA==',
  'aHR0cHM6Ly9iYnMtYXBpLm1paG95by5jb20vYXBpaHViL2FwaS9nZXRTaGFyZUNvbmY=',
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
].map(decode);
