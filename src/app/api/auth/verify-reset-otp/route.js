import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

const TOKEN_COLLECTION = 'verification_tokens'

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, token } = body

    if (!email || !token) {
      return NextResponse.json(
        { error: 'Email and token are required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('mindabove')
    const tokensCollection = db.collection(TOKEN_COLLECTION)

    const tokenRecord = await tokensCollection.findOne({
      email,
      type: 'password-reset',
    })

    if (!tokenRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link' },
        { status: 400 }
      )
    }

    if (new Date() > new Date(tokenRecord.expiresAt)) {
      await tokensCollection.deleteOne({ email, type: 'password-reset' })
      return NextResponse.json(
        { error: 'Reset link has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    if (tokenRecord.token !== token) {
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Reset token verified successfully',
    })
  } catch (error) {
    console.error('Verify reset token error:', error)
    return NextResponse.json(
      { error: 'Failed to verify reset token. Please try again.' },
      { status: 500 }
    )
  }
}

