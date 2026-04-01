"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Stack,
  Divider,
  Chip,
  List,
  ListItemButton,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import PaymentRoundedIcon from "@mui/icons-material/PaymentRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import CopyrightRoundedIcon from "@mui/icons-material/CopyrightRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import PolicyRoundedIcon from "@mui/icons-material/PolicyRounded";
import UpdateRoundedIcon from "@mui/icons-material/UpdateRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import BalanceRoundedIcon from "@mui/icons-material/BalanceRounded";
import { greenColor, bggreen, grayColor, borderColor } from "@/utils/Colors";

const LAST_UPDATED = "28 March 2026";
const EFFECTIVE_DATE = "28 March 2026";

const tocItems = [
  { id: "introduction", label: "Introduction & acceptance" },
  { id: "definitions", label: "Definitions" },
  { id: "eligibility", label: "Eligibility & accounts" },
  { id: "courses", label: "Courses & access" },
  { id: "payments", label: "Fees & payments" },
  { id: "refunds", label: "Refunds & cancellations" },
  { id: "intellectual-property", label: "Intellectual property" },
  { id: "conduct", label: "Acceptable use" },
  { id: "disclaimers", label: "Disclaimers & liability" },
  { id: "privacy", label: "Privacy" },
  { id: "changes", label: "Changes to terms" },
  { id: "contact", label: "Contact & notices" },
  { id: "governing-law", label: "Governing law" },
];

function SectionCard({ id, icon, title, children }) {
  return (
    <Paper
      id={id}
      elevation={0}
      sx={{
        scrollMarginTop: { xs: 88, md: 96 },
        border: `1px solid ${borderColor}`,
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "#fff",
      }}
    >
      <Box
        sx={{
          px: { xs: 2.5, md: 3.5 },
          py: { xs: 2, md: 2.5 },
          borderBottom: `1px solid ${borderColor}`,
          bgcolor: bggreen,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            color: greenColor,
            display: "flex",
            alignItems: "center",
            "& svg": { fontSize: 28 },
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" fontWeight={700} sx={{ color: grayColor, fontSize: { xs: "1rem", md: "1.125rem" } }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ px: { xs: 2.5, md: 3.5 }, py: { xs: 2.5, md: 3 } }}>{children}</Box>
    </Paper>
  );
}

function BodyParagraph({ children, ...props }) {
  return (
    <Typography
      variant="body1"
      sx={{
        color: grayColor,
        lineHeight: 1.75,
        mb: 2,
        fontSize: { xs: "0.9375rem", md: "1rem" },
        "&:last-child": { mb: 0 },
      }}
      {...props}
    >
      {children}
    </Typography>
  );
}

function Subheading({ children }) {
  return (
    <Typography
      variant="subtitle2"
      fontWeight={700}
      sx={{ color: grayColor, mt: 2.5, mb: 1, letterSpacing: 0.02 }}
    >
      {children}
    </Typography>
  );
}

export default function TermsConditionsView() {
  const router = useRouter();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/user/explore-courses");
    }
  }, [router]);

  const scrollToId = (hashId) => {
    const el = document.getElementById(hashId);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const tocList = (
    <List dense disablePadding sx={{ py: 0 }}>
      {tocItems.map((item) => (
        <ListItemButton
          key={item.id}
          onClick={() => scrollToId(item.id)}
          sx={{
            borderRadius: 1,
            mb: 0.25,
            py: 0.75,
            "&:hover": { bgcolor: "rgba(76, 188, 153, 0.12)" },
          }}
        >
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{
              variant: "body2",
              sx: { color: grayColor, fontWeight: 500, fontSize: "0.8125rem", lineHeight: 1.45 },
            }}
          />
        </ListItemButton>
      ))}
    </List>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#FAFBFC",
        pb: { xs: 6, md: 10 },
      }}
    >
      {/* Top bar */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          bgcolor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ py: 1.5, gap: 2, flexWrap: "wrap" }}
          >
            <Button
              variant="text"
              startIcon={<ArrowBackIosNewRoundedIcon sx={{ fontSize: 16 }} />}
              onClick={handleBack}
              sx={{
                color: grayColor,
                fontWeight: 600,
                textTransform: "none",
                px: 1,
                "&:hover": { bgcolor: "rgba(76, 188, 153, 0.08)", color: greenColor },
              }}
            >
              Back
            </Button>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Chip
                label="Legal"
                size="small"
                sx={{
                  bgcolor: bggreen,
                  color: greenColor,
                  fontWeight: 600,
                  border: `1px solid rgba(76, 188, 153, 0.35)`,
                }}
              />
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Last updated {LAST_UPDATED}
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Hero */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${bggreen} 0%, #ffffff 55%, rgba(76, 188, 153, 0.08) 100%)`,
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          <Stack spacing={2} sx={{ maxWidth: 720 }}>
            <Typography
              variant="overline"
              sx={{ color: greenColor, fontWeight: 700, letterSpacing: 0.12 }}
            >
              Learning Hub · Legal centre
            </Typography>
            <Typography
              variant="h3"
              component="h1"
              fontWeight={800}
              sx={{
                color: grayColor,
                fontSize: { xs: "1.75rem", sm: "2.125rem", md: "2.5rem" },
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
              }}
            >
              General Terms &amp; Conditions
            </Typography>
            <Typography variant="body1" sx={{ color: grayColor, opacity: 0.92, lineHeight: 1.7, maxWidth: 640 }}>
              These terms set out the rules for using our platform, purchasing courses, and your rights
              and responsibilities as a learner. Please read them carefully before enrolling or making a
              payment.
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ pt: 1 }}>
              <Chip
                label={`Effective ${EFFECTIVE_DATE}`}
                variant="outlined"
                sx={{ borderColor, color: grayColor, fontWeight: 500 }}
              />
              <Chip
                label="English (UK)"
                variant="outlined"
                sx={{ borderColor, color: grayColor, fontWeight: 500 }}
              />
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: { xs: 3, md: 4 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "280px 1fr" },
            gap: { xs: 2, md: 4 },
            alignItems: "start",
          }}
        >
          {/* TOC — desktop sticky */}
          {isMdUp ? (
            <Paper
              elevation={0}
              sx={{
                position: "sticky",
                top: 88,
                p: 2,
                border: `1px solid ${borderColor}`,
                borderRadius: 2,
                bgcolor: "#fff",
                maxHeight: "calc(100vh - 112px)",
                overflow: "auto",
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: grayColor, mb: 1.5, px: 0.5 }}>
                On this page
              </Typography>
              <Divider sx={{ mb: 1 }} />
              {tocList}
            </Paper>
          ) : (
            <Accordion
              elevation={0}
              sx={{
                border: `1px solid ${borderColor}`,
                borderRadius: "8px !important",
                "&:before": { display: "none" },
                overflow: "hidden",
              }}
            >
              <AccordionSummary expandIcon={<MenuBookRoundedIcon sx={{ color: greenColor }} />}>
                <Typography fontWeight={700} sx={{ color: grayColor }}>
                  Table of contents
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>{tocList}</AccordionDetails>
            </Accordion>
          )}

          {/* Main content */}
          <Stack spacing={3}>
            <SectionCard id="introduction" icon={<GavelRoundedIcon />} title="Introduction & acceptance">
              <BodyParagraph>
                Welcome to Learning Hub (“we”, “us”, “our”). By accessing our website, creating an account,
                browsing courses, or completing a purchase, you (“you”, “your”, “user”) agree to be bound by
                these General Terms &amp; Conditions (“Terms”), together with any policies referenced
                herein (including our Privacy practices as described below).
              </BodyParagraph>
              <BodyParagraph>
                If you do not agree to these Terms, you must not use the platform or purchase any course.
                Where you are using the service on behalf of an organisation, you confirm that you have
                authority to bind that organisation to these Terms.
              </BodyParagraph>
              <BodyParagraph>
                We may offer additional terms for specific promotions, enterprise agreements, or
                instructor-led programmes; where those terms conflict with these Terms, the additional terms
                will govern for that specific offering only.
              </BodyParagraph>
            </SectionCard>

            <SectionCard id="definitions" icon={<MenuBookRoundedIcon />} title="Definitions">
              <BodyParagraph>
                <strong>Platform</strong> means our websites, applications, APIs, and related services
                operated under the Learning Hub brand.
              </BodyParagraph>
              <BodyParagraph>
                <strong>Content</strong> means text, graphics, videos, audio, software, assessments, and
                other materials made available through the Platform, including instructor-provided materials.
              </BodyParagraph>
              <BodyParagraph>
                <strong>Course</strong> means a structured learning product listed on the Platform, whether
                free or paid, including any updates we reasonably make available during your access period.
              </BodyParagraph>
              <BodyParagraph>
                <strong>Learner</strong> means a registered user who enrols in or accesses a Course.
              </BodyParagraph>
            </SectionCard>

            <SectionCard id="eligibility" icon={<PersonRoundedIcon />} title="Eligibility & accounts">
              <BodyParagraph>
                You must be at least the age of majority in your jurisdiction (or have verifiable parental or
                guardian consent where required) to create an account. You agree to provide accurate,
                current registration information and to keep your credentials confidential.
              </BodyParagraph>
              <Subheading>Account security</Subheading>
              <BodyParagraph>
                You are responsible for all activity under your account. Notify us promptly of any
                unauthorised use. We may suspend or terminate accounts that violate these Terms or pose a
                security risk.
              </BodyParagraph>
            </SectionCard>

            <SectionCard id="courses" icon={<SchoolRoundedIcon />} title="Courses & access">
              <BodyParagraph>
                Course descriptions, curriculum outlines, and instructor information are provided to help you
                make informed decisions. We strive to keep listings accurate but do not warrant that every
                description is error-free; material errors may be corrected where reasonable.
              </BodyParagraph>
              <Subheading>Licence to learn</Subheading>
              <BodyParagraph>
                Subject to payment and these Terms, we grant you a limited, non-exclusive, non-transferable,
                revocable licence to access and view Course Content for your personal, non-commercial learning
                during the access period stated at purchase (or lifetime access where explicitly offered).
              </BodyParagraph>
              <BodyParagraph>
                You may not redistribute, resell, publicly perform, scrape, or systematically download Course
                Content except as expressly permitted. Certain materials may include third-party notices;
                those notices form part of your obligations.
              </BodyParagraph>
            </SectionCard>

            <SectionCard id="payments" icon={<PaymentRoundedIcon />} title="Fees & payments">
              <BodyParagraph>
                Prices are displayed in the currency shown at checkout unless stated otherwise. Taxes,
                duties, or local charges may apply based on your billing address and applicable law.
              </BodyParagraph>
              <Subheading>Payment processing</Subheading>
              <BodyParagraph>
                Payments are processed by secure third-party providers. By submitting payment details, you
                authorise us and our payment partners to charge the applicable fees. You represent that you
                are authorised to use the payment method provided.
              </BodyParagraph>
              <BodyParagraph>
                Failed or disputed charges may result in suspension of access until resolved. We may update
                pricing for future purchases; price changes do not affect Courses you have already paid for,
                except where required by law.
              </BodyParagraph>
            </SectionCard>

            <SectionCard id="refunds" icon={<ReplayRoundedIcon />} title="Refunds & cancellations">
              <BodyParagraph>
                Refund eligibility depends on the policy shown on the Course page and at checkout at the time
                of purchase (for example, a cooling-off period where offered, or no refund after content
                access). Where a statutory right to cancel exists in your region, we will honour those
                requirements and communicate any steps or deadlines clearly in the order confirmation flow.
              </BodyParagraph>
              <BodyParagraph>
                Subscription or bundle products, if offered, may renew according to the terms presented at
                purchase; you may cancel renewal in your account settings where that feature is available.
              </BodyParagraph>
            </SectionCard>

            <SectionCard id="intellectual-property" icon={<CopyrightRoundedIcon />} title="Intellectual property">
              <BodyParagraph>
                The Platform, our branding, and our proprietary software are owned by us or our licensors.
                Course Content is owned by instructors or licensors and is licensed to you as described in
                these Terms—not sold.
              </BodyParagraph>
              <BodyParagraph>
                Feedback you voluntarily provide about the Platform may be used by us without obligation to
                you, except where personal data is involved and governed by applicable privacy law.
              </BodyParagraph>
            </SectionCard>

            <SectionCard id="conduct" icon={<SecurityRoundedIcon />} title="Acceptable use">
              <BodyParagraph>You agree not to:</BodyParagraph>
              <Box component="ul" sx={{ m: 0, pl: 2.5, color: grayColor }}>
                <Typography component="li" variant="body1" sx={{ mb: 1.25, lineHeight: 1.75 }}>
                  Circumvent technical protections, access controls, or payment requirements.
                </Typography>
                <Typography component="li" variant="body1" sx={{ mb: 1.25, lineHeight: 1.75 }}>
                  Harass, abuse, or discriminate against instructors, staff, or other learners.
                </Typography>
                <Typography component="li" variant="body1" sx={{ mb: 1.25, lineHeight: 1.75 }}>
                  Upload malware, spam, or unlawful content through any user-submission feature.
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.75 }}>
                  Use the Platform in any way that violates applicable law or infringes third-party rights.
                </Typography>
              </Box>
            </SectionCard>

            <SectionCard id="disclaimers" icon={<PolicyRoundedIcon />} title="Disclaimers & limitation of liability">
              <BodyParagraph>
                Courses are provided for educational purposes. We do not guarantee employment, certification
                success, or specific business outcomes unless explicitly stated in writing for a particular
                programme.
              </BodyParagraph>
              <BodyParagraph>
                To the fullest extent permitted by law, we disclaim implied warranties where disclaimable.
                Our aggregate liability arising out of these Terms or your use of the Platform will not
                exceed the greater of (a) the fees you paid us for the Course giving rise to the claim in the
                twelve (12) months before the claim, or (b) where no fees apply, fifty pounds sterling (GBP
                50), except where liability cannot be limited by law (such as death or personal injury caused
                by negligence, or fraud).
              </BodyParagraph>
            </SectionCard>

            <SectionCard id="privacy" icon={<LockRoundedIcon />} title="Privacy">
              <BodyParagraph>
                We process personal data in accordance with our privacy practices and applicable data
                protection laws. By using the Platform, you acknowledge that we may collect and use
                information as needed to deliver Courses, process payments, improve services, and comply with
                legal obligations.
              </BodyParagraph>
              <BodyParagraph>
                For full details on categories of data, legal bases, retention, and your rights, refer to our
                Privacy Policy when published on this site, or contact us using the details below.
              </BodyParagraph>
            </SectionCard>

            <SectionCard id="changes" icon={<UpdateRoundedIcon />} title="Changes to these terms">
              <BodyParagraph>
                We may update these Terms from time to time. We will post the revised version on this page and
                update the “Last updated” date. Where changes are material, we will provide reasonable notice
                by email or an in-product notice before they take effect for continued use.
              </BodyParagraph>
              <BodyParagraph>
                Your continued use of the Platform after the effective date of revised Terms constitutes
                acceptance of the changes, except where applicable law requires your explicit consent.
              </BodyParagraph>
            </SectionCard>

            <SectionCard id="contact" icon={<EmailRoundedIcon />} title="Contact & notices">
              <BodyParagraph>
                For questions about these Terms, billing, or your account, contact us through the support
                channels provided in the Platform. Legal notices may be sent to the address or email we
                designate for such purposes; we may send notices to the email associated with your account.
              </BodyParagraph>
            </SectionCard>

            <SectionCard id="governing-law" icon={<BalanceRoundedIcon />} title="Governing law">
              <BodyParagraph>
                These Terms are governed by the laws of England and Wales, without regard to conflict-of-law
                rules, unless mandatory consumer protections in your country of residence require otherwise.
                Courts in England and Wales will have exclusive jurisdiction for business users; consumers may
                have additional rights to bring claims in their home courts where such rights cannot be waived
                by contract.
              </BodyParagraph>
            </SectionCard>

            {/* Footer CTA */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                border: `1px dashed rgba(76, 188, 153, 0.45)`,
                bgcolor: bggreen,
              }}
            >
              <Stack spacing={2} alignItems={{ xs: "stretch", sm: "flex-start" }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: grayColor }}>
                  Ready to continue?
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button
                    variant="contained"
                    onClick={handleBack}
                    sx={{
                      bgcolor: greenColor,
                      fontWeight: 700,
                      px: 3,
                      py: 1.25,
                      "&:hover": { bgcolor: "#3da884" },
                    }}
                  >
                    Go back
                  </Button>
                  <Button
                    component={Link}
                    href="/user/explore-courses"
                    variant="outlined"
                    sx={{
                      borderColor: greenColor,
                      color: greenColor,
                      fontWeight: 700,
                      px: 3,
                      py: 1.25,
                      "&:hover": { borderColor: "#3da884", bgcolor: "rgba(76, 188, 153, 0.08)" },
                    }}
                  >
                    Explore courses
                  </Button>
                  <Button component={Link} href="/" color="inherit" sx={{ fontWeight: 600 }}>
                    Home
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
