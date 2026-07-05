import { NextRequest, NextResponse } from 'next/server'
import { runPipeline } from '@/lib/pipeline'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('user_id')
  if (!userId) {
    return NextResponse.json({ error: 'user_id param required' }, { status: 400 })
  }

  try {
    const result = await runPipeline(userId)
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[personalize]', err)
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 })
  }
}
