import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import clientPromise from '@/lib/mongodb'

const TOKEN_COLLECTION = 'verification_tokens'

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, token, password } = body

    if (!email || !token || !password) {
      return NextResponse.json(
        { error: 'Email, token, and new password are required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('mindabove')
    const usersCollection = db.collection('users')
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

    const user = await usersCollection.findOne({ email })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await usersCollection.updateOne(
      { email },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      }
    )

    await tokensCollection.deleteOne({ email, type: 'password-reset' })

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    )
  }
}

