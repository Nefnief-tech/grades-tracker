/**
 * This file provides backward compatibility with code that was importing
 * the appwriteMFA object directly from '@/lib/appwrite-mfa'.
 */

import { appwriteMFAInstance as appwriteMFA } from './appwrite-mfa';

export { appwriteMFA };