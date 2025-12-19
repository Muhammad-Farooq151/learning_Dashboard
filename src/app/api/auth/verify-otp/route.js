import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

const VERIFICATION_COLLECTION = 'verification_tokens'

const normalizeEmail = (value = '') => value.trim().toLowerCase()

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, token } = body
    const normalizedEmail = normalizeEmail(email)
    const normalizedToken = token?.trim()

    if (!normalizedEmail || !normalizedToken) {
      return NextResponse.json(
        { error: 'Email and verification token are required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('mindabove')
    const usersCollection = db.collection('users')
    const verificationCollection = db.collection(VERIFICATION_COLLECTION)

    const verificationRecord = await verificationCollection.findOne({
      email: normalizedEmail,
      token: normalizedToken,
      type: 'signup',
    })

    if (!verificationRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired verification request' },
        { status: 400 }
      )
    }

    if (new Date() > new Date(verificationRecord.expiresAt)) {
      await verificationCollection.deleteOne({
        email: normalizedEmail,
        token: normalizedToken,
        type: 'signup',
      })
      return NextResponse.json(
        { error: 'Verification link has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    const existingUser = await usersCollection.findOne({ email: normalizedEmail })
    if (existingUser) {
      await verificationCollection.deleteOne({
        email: normalizedEmail,
        type: 'signup',
      })
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    const payload = verificationRecord.payload || {}

    if (!payload?.password) {
      await verificationCollection.deleteOne({ email, type: 'signup' })
      return NextResponse.json(
        { error: 'Signup data is incomplete. Please register again.' },
        { status: 400 }
      )
    }

    const user = {
      fullName: payload.fullName,
      email: normalizedEmail,
      phoneNumber: payload.phoneNumber,
      password: payload.password,
      createdAt: new Date(),
      verified: true,
    }

    await usersCollection.insertOne(user)
    await verificationCollection.deleteOne({
      email: normalizedEmail,
      type: 'signup',
    })

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      user: {
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
    })
  } catch (error) {
    console.error('Verify email error:', error)
    return NextResponse.json(
      { error: 'Failed to verify email. Please try again.' },
      { status: 500 }
    )
  }
}

