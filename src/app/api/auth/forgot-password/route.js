import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import clientPromise from '@/lib/mongodb'
import crypto from 'crypto'

const APP_NAME = 'LearningHub'
const TOKEN_COLLECTION = 'verification_tokens'
const RESET_TTL_HOURS = 1

export async function POST(request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('mindabove')
    const usersCollection = db.collection('users')
    const tokensCollection = db.collection(TOKEN_COLLECTION)

    const user = await usersCollection.findOne({ email })

    if (!user) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 400 }
      )
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + RESET_TTL_HOURS * 60 * 60 * 1000)

    await tokensCollection.updateOne(
      { email, type: 'password-reset' },
      {
        $set: {
          email,
          token,
          type: 'password-reset',
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
      console.log('[ForgotPassword] SMTP credentials missing. Using Nodemailer test account.')
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
      console.log('[ForgotPassword] SMTP configuration check', {
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
    const resetLink = `${origin}/create-new-password?token=${token}&email=${encodeURIComponent(email)}`

    try {
      const mailOptions = {
        from: smtpUser,
        to: email,
        subject: `Reset Your Password - ${APP_NAME}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #00796B; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">${APP_NAME}</h1>
            </div>
            <div style="padding: 30px; background-color: #f9f9f9;">
              <h2 style="color: #333;">Password Reset Request</h2>
              <p style="color: #666;">Hello ${user.fullName},</p>
              <p style="color: #666;">You requested to reset your password. Click the button below to continue.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #00796B; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
                  Reset Password
                </a>
              </div>
              <p style="color: #666;">This link will expire in ${RESET_TTL_HOURS} hour.</p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">If you didn't request this, please ignore this email.</p>
            </div>
          </div>
        `,
      }

      const info = await transporter.sendMail(mailOptions)
      console.log('✓ Password reset email sent to:', email)
      if (nodemailer.getTestMessageUrl) {
        const previewUrl = nodemailer.getTestMessageUrl(info)
        if (previewUrl) {
          console.log('📨 Preview URL:', previewUrl)
        }
      }
    } catch (emailError) {
      console.error('Forgot password email error:', emailError)
      return NextResponse.json(
        { error: 'Failed to send password reset email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset link sent',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    )
  }
}

