import { v4 as uuid } from 'uuid';
export const dvid = () => uuid().replace(/-/g, '').toUpperCase();
