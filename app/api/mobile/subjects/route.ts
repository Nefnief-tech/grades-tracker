import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getSubjectsFromCloud } from '@/lib/appwrite';

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get subjects from cloud (already decrypted)
    const subjects = await getSubjectsFromCloud(user.id);
    
    return NextResponse.json({ 
      success: true, 
      subjects: subjects 
    });

  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch subjects',
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subjects } = await request.json();
    
    if (!subjects || !Array.isArray(subjects)) {
      return NextResponse.json({ 
        error: 'Invalid subjects data' 
      }, { status: 400 });
    }

    // Sync subjects to cloud (handles encryption internally)
    const { syncSubjectsToCloud } = await import('@/lib/appwrite');
    const success = await syncSubjectsToCloud(user.id, subjects);
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Subjects synced successfully' 
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to sync subjects' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error syncing subjects:', error);
    return NextResponse.json({ 
      error: 'Failed to sync subjects',
      details: error.message 
    }, { status: 500 });
  }
}