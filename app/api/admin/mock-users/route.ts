import { NextResponse } from 'next/server';

// Mock user data for development
const mockUsers = [
  {
    $id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    is_suspended: false,
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
    role: 'Admin'
  },
  {
    $id: '2',
    name: 'Test User',
    email: 'test@example.com',
    is_suspended: false,
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
    role: 'User'
  },
  {
    $id: '3',
    name: 'Suspended User',
    email: 'suspended@example.com',
    is_suspended: true,
    created_at: new Date().toISOString(),
    last_login: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    role: 'User'
  },
  {
    $id: '4',
    name: 'Developer',
    email: 'dev@example.com',
    is_suspended: false,
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
    role: 'Developer'
  }
];

// Simple API route that returns mock user data
export async function GET() {
  try {
    // This does not require Appwrite to work - completely safe for testing
    console.log('Serving mock user data');
    
    return NextResponse.json({
      users: mockUsers
    });
  } catch (error) {
    console.error('Error in mock users API:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}