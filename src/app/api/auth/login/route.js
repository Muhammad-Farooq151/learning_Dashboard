import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import clientPromise from '@/lib/mongodb'

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db('mindabove')
    const usersCollection = db.collection('users')

    // Find user
    const user = await usersCollection.findOne({ email })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Block login if email not verified
    if (!user.verified) {
      return NextResponse.json(
        { error: 'Email verification pending. Please verify your email before logging in.' },
        { status: 403 }
      )
    }

    // Determine JWT secret
    const jwtSecret = process.env.JWT_SECRET
      ? process.env.JWT_SECRET.trim()
      : process.env.JWT_KEY
        ? process.env.JWT_KEY.trim()
        : 'default_dev_jwt_secret_change_me'

    if (!jwtSecret) {
      return NextResponse.json(
        { error: 'JWT secret is not configured.' },
        { status: 500 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        fullName: user.fullName
      },
      jwtSecret,
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id?.toString(),
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Failed to process login. Please try again.' },
      { status: 500 }
    )
  }
}

