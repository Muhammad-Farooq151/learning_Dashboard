import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'

const normalizeString = (value = '') => value.trim()
const normalizeId = (value) => {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    if (value.$oid) return value.$oid
    if (typeof value.toString === 'function') return value.toString()
  }
  return null
}

export async function POST(request) {
  try {
    const body = await request.json()
    const userIdRaw = body?.userId
    const userId = normalizeId(userIdRaw)

    if (!userId) {
      return NextResponse.json(
        { error: 'User id is required' },
        { status: 400 }
      )
    }

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user id' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('mindabove')
    const usersCollection = db.collection('users')

    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      {
        projection: {
          fullName: 1,
          email: 1,
          phoneNumber: 1,
          createdAt: 1,
        },
      }
    )

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile. Please try again.' },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    const body = await request.json()
    const userIdRaw = body?.userId
    const userId = normalizeId(userIdRaw)
    const { fullName, phoneNumber } = body || {}

    if (!userId) {
      return NextResponse.json(
        { error: 'User id is required' },
        { status: 400 }
      )
    }

    const normalizedFullName = normalizeString(fullName || '')
    const normalizedPhone = normalizeString(phoneNumber || '')

    if (!normalizedFullName) {
      return NextResponse.json(
        { error: 'Full name is required' },
        { status: 400 }
      )
    }

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user id' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('mindabove')
    const usersCollection = db.collection('users')

    const updateResult = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      {
        $set: {
          fullName: normalizedFullName,
          phoneNumber: normalizedPhone,
          updatedAt: new Date(),
        },
      },
      {
        returnDocument: 'after',
        projection: {
          fullName: 1,
          email: 1,
          phoneNumber: 1,
          createdAt: 1,
        },
      }
    )

    const updatedUser = updateResult.value

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser._id.toString(),
        fullName: updatedUser.fullName || '',
        email: updatedUser.email || '',
        phoneNumber: updatedUser.phoneNumber || '',
        createdAt: updatedUser.createdAt,
      },
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile. Please try again.' },
      { status: 500 }
    )
  }
}


