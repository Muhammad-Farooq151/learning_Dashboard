"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Stack,
  Grid,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  Divider,
  IconButton,
  Chip,
} from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { getJSON, postJSON } from "@/utils/http";
import { getStoredUser, getStoredUserId } from "@/utils/authStorage";
import { greenColor } from "@/utils/Colors";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "./checkout-phone-input.css";
import Swal from "sweetalert2";
import Link from "next/link";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

// Stripe Card Element Options - zip code false
const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#424770",
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#9e2146",
    },
  },
  hidePostalCode: true, // This disables zip code
};

function CheckoutForm({ course, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    cardName: "",
    expirationDate: "",
    cvv: "",
    acceptTerms: false,
  });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [errors, setErrors] = useState({});
  const [paymentError, setPaymentError] = useState("");
  const [clientSecret, setClientSecret] = useState(null);

  const handleInputChange = (field) => (e) => {
    setFormData({
      ...formData,
      [field]: e.target.value,
    });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: "",
      });
    }
  };

  const handlePhoneChange = (value) => {
    setFormData({
      ...formData,
      phoneNumber: value || "",
    });
  };

  const handleExpirationChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 2) {
      value = value.slice(0, 2) + " / " + value.slice(2, 4);
    }
    setFormData({
      ...formData,
      expirationDate: value,
    });
  };

  const calculateTotal = () => {
    if (!course) return { original: 0, discount: 0, discountPercentage: 0, tax: 0, total: 0 };
    
    const originalPrice = parseFloat(course.price) || 0;
    const discountPercentage = course.discountPercentage || 0;
    
    // Calculate discount amount
    const discountAmount = discountPercentage > 0 
      ? (originalPrice * discountPercentage) / 100 
      : 0;
    
    // Calculate price after discount
    const priceAfterDiscount = originalPrice - discountAmount;
    
    // Calculate tax using course taxPercentage (dynamic, default to 0 if not provided)
    const taxPercentage = course.taxPercentage || 0;
    const tax = priceAfterDiscount * (taxPercentage / 100);
    
    // Total = discounted price + tax
    const total = priceAfterDiscount + tax;
    
    return {
      original: originalPrice,
      discount: discountAmount,
      discountPercentage: discountPercentage,
      taxPercentage: taxPercentage,
      tax: tax,
      total: total,
    };
  };

  const pricing = calculateTotal();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required";
    if (!formData.acceptTerms) newErrors.acceptTerms = "You must accept the terms";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setPaymentError("");

    try {
      const user = getStoredUser();
      const userId = getStoredUserId();
      if (!userId) {
        setPaymentError("You must be logged in to complete the payment.");
        setLoading(false);
        return;
      }

      // Create payment intent on backend (secure)
      const intentResponse = await postJSON("payments/create-payment-intent", {
        courseId: course._id || course.id,
        userId,
      });

      if (!intentResponse?.success || !intentResponse.clientSecret) {
        throw new Error(intentResponse?.message || "Failed to initialize payment.");
      }

      const clientSecretValue = intentResponse.clientSecret;
      setClientSecret(clientSecretValue);

      const cardElement = elements.getElement(CardElement);
      
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecretValue,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: formData.fullName,
              phone: formData.phoneNumber,
            },
          },
        }
      );

      if (confirmError) {
        console.error("Stripe confirm error:", confirmError);
        setPaymentError(confirmError.message || "Payment failed. Please try again.");
        setLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        const pricing = calculateTotal();
        
        // Create transaction record
        try {
          await postJSON("transactions", {
            userId,
            courseId: course._id || course.id,
            amount: pricing.total,
            originalPrice: pricing.original,
            discountPercentage: pricing.discountPercentage,
            discountAmount: pricing.discount,
            tax: pricing.tax,
            total: pricing.total,
            stripePaymentIntentId: paymentIntent.id,
            paymentMethod: "card",
            currency: "usd",
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber,
          });
        } catch (transactionError) {
          console.error("Error creating transaction:", transactionError);
        }

        // Mark course as enrolled for this user
        try {
          await postJSON("users/enroll", {
            userId,
            courseId: course._id || course.id,
          });
        } catch (enrollError) {
          console.error("Error enrolling user in course:", enrollError);
        }

        // SweetAlert2 success popup
        await Swal.fire({
          icon: "success",
          title: "Payment Successful",
          text: `You have successfully enrolled in "${course.title || "this course"}".`,
          confirmButtonColor: greenColor,
          confirmButtonText: "Go to My Learnings",
        });

        onSuccess();
      } else {
        const message = "Payment was not successful. Please try again.";
        setPaymentError(message);
        Swal.fire({
          icon: "error",
          title: "Payment Failed",
          text: message,
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      const message = error.message || "Payment failed. Please try again.";
      setPaymentError(message);
      Swal.fire({
        icon: "error",
        title: "Payment Failed",
        text: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        {/* Billing Information */}
        <Box>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Billing information
          </Typography>
          <Stack spacing={2}>
            <Box>
              <TextField
                fullWidth
                label="Full Name"
                placeholder="eg: John Doe"
                value={formData.fullName}
                onChange={handleInputChange("fullName")}
                error={!!errors.fullName}
                helperText={errors.fullName}
                sx={{ mb: 1 }}
              />
            </Box>

            <Box>
              <Typography variant="body2" fontWeight={500} mb={1}>
                Phone Number
              </Typography>
              <PhoneInput
                international
                defaultCountry="US"
                value={formData.phoneNumber}
                onChange={handlePhoneChange}
                className={`checkout-phone-input ${errors.phoneNumber ? "phone-input-error" : ""}`}
              />
              {errors.phoneNumber && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                  {errors.phoneNumber}
                </Typography>
              )}
            </Box>
          </Stack>
        </Box>

        {/* Payment Method */}
        <Box>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Choose Payment Method
          </Typography>
          <Stack direction="row" spacing={2} mb={3}>
            <Button
              variant={paymentMethod === "card" ? "contained" : "outlined"}
              onClick={() => setPaymentMethod("card")}
              startIcon={paymentMethod === "card" && <CheckCircleRoundedIcon />}
              sx={{
                flex: 1,
                textTransform: "none",
                backgroundColor: paymentMethod === "card" ? greenColor : "transparent",
                borderColor: greenColor,
                color: paymentMethod === "card" ? "#fff" : greenColor,
                "&:hover": {
                  backgroundColor: paymentMethod === "card" ? greenColor : "transparent",
                  borderColor: greenColor,
                },
              }}
            >
              Debit/Credit Card
            </Button>
            <Button
              variant={paymentMethod === "paypal" ? "contained" : "outlined"}
              onClick={() => setPaymentMethod("paypal")}
              startIcon={paymentMethod === "paypal" && <CheckCircleRoundedIcon />}
              sx={{
                flex: 1,
                textTransform: "none",
                backgroundColor: paymentMethod === "paypal" ? greenColor : "transparent",
                borderColor: greenColor,
                color: paymentMethod === "paypal" ? "#fff" : greenColor,
                "&:hover": {
                  backgroundColor: paymentMethod === "paypal" ? greenColor : "transparent",
                  borderColor: greenColor,
                },
              }}
            >
              PayPal
            </Button>
          </Stack>

          {paymentMethod === "card" && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" fontWeight={500} mb={1}>
                  Card Number*
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    border: errors.card ? "1px solid #d32f2f" : "1px solid #e0e0e0",
                    borderRadius: 1,
                    "&:hover": {
                      borderColor: errors.card ? "#d32f2f" : greenColor,
                    },
                    "&:focus-within": {
                      borderColor: greenColor,
                      borderWidth: "2px",
                    },
                  }}
                >
                  <CardElement options={cardElementOptions} />
                </Box>
                {errors.card && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                    {errors.card}
                  </Typography>
                )}
              </Box>

              {/* <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Name on Card*"
                    placeholder="eg: John Doe"
                    value={formData.cardName}
                    onChange={handleInputChange("cardName")}
                    error={!!errors.cardName}
                    helperText={errors.cardName}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Expiration Date*"
                    placeholder="eg: MM / YY"
                    value={formData.expirationDate}
                    onChange={handleExpirationChange}
                    error={!!errors.expirationDate}
                    helperText={errors.expirationDate}
                    inputProps={{ maxLength: 7 }}
                  />
                </Grid>
              </Grid>

              <Box>
                <TextField
                  fullWidth
                  label="CVV*"
                  placeholder="eg: 123"
                  value={formData.cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 3);
                    setFormData({ ...formData, cvv: value });
                  }}
                  error={!!errors.cvv}
                  helperText={errors.cvv}
                />
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                  Note: 3-digit code on the back of your card
                </Typography>
              </Box> */}
            </Stack>
          )}
        </Box>

        {/* Terms and Conditions */}
        <Box>
          <Typography variant="body2" color="text.secondary" mb={1}>
            By providing your card information, you allow Learning HUB to charge your card for
            future payments in accordance with their terms.
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.acceptTerms}
                onChange={(e) =>
                  setFormData({ ...formData, acceptTerms: e.target.checked })
                }
              />
            }
            label={
              <Typography variant="body2" component="span">
                I accept the{" "}
                <Link
                  href="/terms-conditions"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    color: greenColor,
                    fontWeight: 600,
                    textDecoration: "underline",
                  }}
                >
                  General Terms & Conditions
                </Link>
              </Typography>
            }
          />
          {errors.acceptTerms && (
            <Typography variant="caption" color="error" sx={{ display: "block", mt: 0.5 }}>
              {errors.acceptTerms}
            </Typography>
          )}
        </Box>

        {/* Global payment error */}
        {paymentError && (
          <Typography
            variant="body2"
            color="error"
            sx={{ mb: 1 }}
          >
            {paymentError}
          </Typography>
        )}

        {/* Confirm & Pay Button */}
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={loading || !stripe}
          sx={{
            backgroundColor: greenColor,
            textTransform: "none",
            py: 1.5,
            fontSize: "16px",
            fontWeight: 600,
            "&:hover": {
              backgroundColor: greenColor,
              opacity: 0.9,
            },
          }}
        >
          {loading ? "Processing..." : `Confirm & Pay - $${pricing.total.toFixed(2)}`}
        </Button>
      </Stack>
    </form>
  );
}

function CheckoutPage({ courseId }) {
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await getJSON(`courses/${courseId}`);
        
        if (response && response.success && response.data) {
          setCourse(response.data);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const calculateTotal = () => {
    if (!course) return { original: 0, discount: 0, discountPercentage: 0, tax: 0, total: 0 };
    
    const originalPrice = parseFloat(course.price) || 0;
    const discountPercentage = course.discountPercentage || 0;
    
    // Calculate discount amount
    const discountAmount = discountPercentage > 0 
      ? (originalPrice * discountPercentage) / 100 
      : 0;
    
    // Calculate price after discount
    const priceAfterDiscount = originalPrice - discountAmount;
    
    // Calculate tax using course taxPercentage (dynamic, default to 0 if not provided)
    const taxPercentage = course.taxPercentage || 0;
    const tax = priceAfterDiscount * (taxPercentage / 100);
    
    // Total = discounted price + tax
    const total = priceAfterDiscount + tax;
    
    return {
      original: originalPrice,
      discount: discountAmount,
      discountPercentage: discountPercentage,
      taxPercentage: taxPercentage,
      tax: tax,
      total: total,
    };
  };

  const pricing = calculateTotal();

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    // Redirect to My Learnings after success alert
    router.push("/user/my-leaning");
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!course) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Course not found
        </Typography>
        <Button onClick={() => router.push("/user/explore-courses")} variant="contained">
          Back to Courses
        </Button>
      </Box>
    );
  }

  // Calculate duration from lessons
  const totalDuration = course.lessons?.reduce((total, lesson) => {
    return total + (lesson.duration || 0);
  }, 0) || 0;
  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);
  const duration = hours > 0 ? `${hours} hours` : `${minutes} minutes`;

  return (
    <Box sx={{ minHeight: "100vh", }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: greenColor,
          color: "#fff",
          py: 2,
          px: 4,
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" fontWeight={700}>
              LEARNING HUB
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <PeopleAltRoundedIcon />
              <Typography variant="body2">
                81,276 already enrolled
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Left Panel - Checkout Form */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={3}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <IconButton onClick={() => router.back()} size="small">
                  <ArrowBackIosNewRoundedIcon />
                </IconButton>
                <Typography variant="h6" fontWeight={600}>
                  Checkout
                </Typography>
              </Stack>

              <Card sx={{ p: 3 }}>
                <Elements stripe={stripePromise}>
                  <CheckoutForm course={course} onSuccess={handlePaymentSuccess} />
                </Elements>
              </Card>
            </Stack>
          </Grid>

          {/* Right Panel - Order Summary */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={3}>
              {/* 30-Day Money-Back Guarantee */}
              <Card sx={{ p: 3, bgcolor: "#f0f9ff", border: "1px solid #bae6fd" }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  30-Day Money-Back Guarantee
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Not satisfied? Get a full refund within 30 days. Simple and straightforward!
                </Typography>
              </Card>

              {/* Order Summary */}
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Order Summary
                </Typography>
                <Stack spacing={1.5} mb={2}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Original Price (1 Course)
                    </Typography>
                    <Typography 
                      variant="body2"
                      sx={pricing.discountPercentage > 0 ? { 
                        textDecoration: "line-through",
                        textDecorationColor: "#64748B",
                        color: "text.secondary"
                      } : {}}
                    >
                      ${pricing.original.toFixed(2)}
                    </Typography>
                  </Stack>
                  {pricing.discountPercentage > 0 && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Discount ({pricing.discountPercentage}% Off)
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        -${pricing.discount.toFixed(2)}
                      </Typography>
                    </Stack>
                  )}
                  {pricing.discountPercentage > 0 && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Price After Discount
                      </Typography>
                      <Typography variant="body2" color="success.main" fontWeight={600}>
                        ${(pricing.original - pricing.discount).toFixed(2)}
                      </Typography>
                    </Stack>
                  )}
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Tax {pricing.taxPercentage > 0 ? `(${pricing.taxPercentage}%)` : ''}
                    </Typography>
                    <Typography variant="body2">${pricing.tax.toFixed(2)}</Typography>
                  </Stack>
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h6" fontWeight={700}>
                    Total
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    ${pricing.total.toFixed(2)}
                  </Typography>
                </Stack>
              </Card>

              {/* Course Details */}
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Course Name
                </Typography>
                <Typography variant="h6" fontWeight={600} mb={1}>
                  {course.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {course.description?.substring(0, 100)}...
                </Typography>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <AccessTimeRoundedIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {duration}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <PeopleAltRoundedIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {course.enrolled || 0}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <StarRoundedIcon fontSize="small" sx={{ color: "#FFB400" }} />
                    <Typography variant="body2" color="text.secondary">
                      4.8
                    </Typography>
                  </Stack>
                </Stack>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default CheckoutPage;
