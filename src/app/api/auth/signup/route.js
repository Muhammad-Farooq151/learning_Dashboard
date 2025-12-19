import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const APP_NAME = 'LearningHub'
const VERIFICATION_COLLECTION = 'verification_tokens'
const VERIFICATION_TTL_HOURS = 24

const normalizeEmail = (value = '') => value.trim().toLowerCase()

export async function POST(request) {
  try {
    const body = await request.json()
    const { fullName, email, phoneNumber, password } = body
    const normalizedEmail = normalizeEmail(email)

    if (!fullName || !normalizedEmail || !phoneNumber || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('mindabove')
    const usersCollection = db.collection('users')
    const verificationCollection = db.collection(VERIFICATION_COLLECTION)

    const existingUser = await usersCollection.findOne({ email: normalizedEmail })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + VERIFICATION_TTL_HOURS * 60 * 60 * 1000)

    await verificationCollection.updateOne(
      { email: normalizedEmail, type: 'signup' },
      {
        $set: {
          email: normalizedEmail,
          token,
          type: 'signup',
          payload: {
            fullName,
            phoneNumber,
            password: hashedPassword,
          },
          createdAt: new Date(),
          expiresAt,
        },
      },
      { upsert: true }
    )

    let smtpHost = process.env.SMTP_HOST ? process.env.SMTP_HOST.trim() : ''
    let smtpUser = process.env.SMTP_USER
      ? process.env.SMTP_USER.trim()
      : process.env.EMAIL_USER
        ? process.env.EMAIL_USER.trim()
        : ''
    let smtpPass = process.env.SMTP_PASS
      ? process.env.SMTP_PASS.trim()
      : process.env.EMAIL_PASS
        ? process.env.EMAIL_PASS.trim()
        : ''
    let transporter

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.log('[Signup] SMTP credentials missing. Using Nodemailer test account.')
      const testAccount = await nodemailer.createTestAccount()
      smtpHost = testAccount.smtp.host
      smtpUser = testAccount.user
      smtpPass = testAccount.pass
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      })
    } else {
      console.log('[Signup] SMTP configuration check', {
        host: smtpHost,
        user: `${smtpUser.slice(0, 2)}***`,
        pass: '***',
      })
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: 587,
        secure: false,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      })
    }

    const origin =
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.APP_URL ||
      'http://localhost:3000'
    const verificationLink = `${origin}/verify-email?token=${token}&email=${encodeURIComponent(
      normalizedEmail
    )}`

    try {
      const mailOptions = {
        from: smtpUser,
        to: normalizedEmail,
        subject: `Verify Your Email - ${APP_NAME}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #00796B; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">${APP_NAME}</h1>
            </div>
            <div style="padding: 30px; background-color: #f9f9f9;">
              <h2 style="color: #333;">Email Verification</h2>
              <p style="color: #666;">Hello ${fullName},</p>
              <p style="color: #666;">
                Welcome to ${APP_NAME}! Click the button below to verify your email address and activate your account.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" style="background-color: #00796B; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
                  Verify Email
                </a>
              </div>
              <p style="color: #666;">This link will expire in ${VERIFICATION_TTL_HOURS} hours.</p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">If you didn't sign up for this account, please ignore this email.</p>
            </div>
          </div>
        `,
      }

      const info = await transporter.sendMail(mailOptions)
      console.log('✓ Verification email sent to:', email)
      if (nodemailer.getTestMessageUrl) {
        const previewUrl = nodemailer.getTestMessageUrl(info)
        if (previewUrl) {
          console.log('📨 Preview URL:', previewUrl)
        }
      }
    } catch (emailError) {
      console.error('Signup email error:', emailError)
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification link sent to your email address',
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to process signup. Please try again.' },
      { status: 500 }
    )
  }
}

