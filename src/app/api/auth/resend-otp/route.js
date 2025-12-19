import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import clientPromise from '@/lib/mongodb'
import crypto from 'crypto'

const VERIFICATION_COLLECTION = 'verification_tokens'
const APP_NAME = 'LearningHub'
const VERIFICATION_TTL_HOURS = 24

const normalizeEmail = (value = '') => value.trim().toLowerCase()

export async function POST(request) {
  try {
    const body = await request.json()
    const { email } = body
    const normalizedEmail = normalizeEmail(email)

    if (!normalizedEmail) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('mindabove')
    const verificationCollection = db.collection(VERIFICATION_COLLECTION)

    const pendingRecord = await verificationCollection.findOne({
      email: normalizedEmail,
      type: 'signup',
    })

    if (!pendingRecord) {
      return NextResponse.json(
        { error: 'No pending verification found for this email' },
        { status: 404 }
      )
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + VERIFICATION_TTL_HOURS * 60 * 60 * 1000)

    await verificationCollection.updateOne(
      { email: normalizedEmail, type: 'signup' },
      {
        $set: {
          token,
          createdAt: new Date(),
          expiresAt,
        },
      }
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
      console.log('[ResendVerification] SMTP credentials missing. Using Nodemailer test account.')
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
      console.log('[ResendVerification] SMTP configuration check', {
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
              <p style="color: #666;">Hello ${pendingRecord?.payload?.fullName || 'there'},</p>
              <p style="color: #666;">
                Here is a fresh verification link. Click the button below to activate your account.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" style="background-color: #00796B; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
                  Verify Email
                </a>
              </div>
              <p style="color: #666;">This link will expire in ${VERIFICATION_TTL_HOURS} hours.</p>
            </div>
          </div>
        `,
      }

      const info = await transporter.sendMail(mailOptions)
      console.log('✓ Verification link resent to:', email)
      if (nodemailer.getTestMessageUrl) {
        const previewUrl = nodemailer.getTestMessageUrl(info)
        if (previewUrl) {
          console.log('📨 Preview URL:', previewUrl)
        }
      }
    } catch (emailError) {
      console.error('Resend verification email error:', emailError)
      return NextResponse.json(
        { error: 'Failed to resend verification link. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification link resent successfully',
    })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Failed to resend verification link. Please try again.' },
      { status: 500 }
    )
  }
}

