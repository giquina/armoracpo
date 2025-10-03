import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaArrowRight, FaCheck, FaEye, FaEyeSlash, FaPlus, FaTimes } from 'react-icons/fa';
import { SignupStepper } from '../../components/signup/SignupStepper';
import { FormInput } from '../../components/ui/FormInput';
import { FormSelect, SelectOption } from '../../components/ui/FormSelect';
import { FormFileUpload } from '../../components/ui/FormFileUpload';
import { Button } from '../../components/ui/Button';
import { IconWrapper } from '../../utils/IconWrapper';
import { authService, type SignUpData } from '../../services/auth.service';
import './Signup.css';

// Form data interface
interface SignupFormData {
  // Step 1: Account Creation
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;

  // Step 2: Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postcode: string;
  country: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;

  // Step 3: SIA License & Certifications
  siaLicenseNumber: string;
  siaLicenseExpiry: string;
  siaLicenseDocument: File | null;
  dbsCertificateNumber: string;
  dbsIssueDate: string;
  dbsDocument: File | null;

  // Step 4: Professional Information
  yearsOfExperience: number;
  specializations: string[];
  languages: Array<{ language: string; proficiency: string }>;

  // Step 5: Terms & Conditions
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  acceptBackgroundCheck: boolean;
}

// Language proficiency options
const proficiencyOptions: SelectOption[] = [
  { value: 'basic', label: 'Basic' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'fluent', label: 'Fluent' },
  { value: 'native', label: 'Native' },
];

// Specialization options
const specializationOptions: SelectOption[] = [
  { value: 'close_protection', label: 'Close Protection' },
  { value: 'event_security', label: 'Event Security' },
  { value: 'executive_protection', label: 'Executive Protection' },
  { value: 'residential_security', label: 'Residential Security' },
  { value: 'transport_security', label: 'Transport Security' },
];

// Country options (UK focused)
const countryOptions: SelectOption[] = [
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ireland', label: 'Ireland' },
  { value: 'other', label: 'Other' },
];

const STORAGE_KEY = 'armora_signup_form_data';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState<SignupFormData>(() => {
    // Load saved form data from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved form data:', e);
      }
    }
    return {
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      postcode: '',
      country: 'uk',
      emergencyContactName: '',
      emergencyContactRelationship: '',
      emergencyContactPhone: '',
      siaLicenseNumber: '',
      siaLicenseExpiry: '',
      siaLicenseDocument: null,
      dbsCertificateNumber: '',
      dbsIssueDate: '',
      dbsDocument: null,
      yearsOfExperience: 0,
      specializations: [],
      languages: [],
      acceptTerms: false,
      acceptPrivacy: false,
      acceptBackgroundCheck: false,
    };
  });

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    const dataToSave = { ...formData, siaLicenseDocument: null, dbsDocument: null };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [formData]);

  const steps = [
    { id: 1, label: 'Account' },
    { id: 2, label: 'Personal' },
    { id: 3, label: 'SIA License' },
    { id: 4, label: 'Professional' },
    { id: 5, label: 'Terms' },
  ];

  // Password strength calculation
  const calculatePasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    if (password.length < 8) return 'weak';

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const strength = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

    if (strength >= 3 && password.length >= 12) return 'strong';
    if (strength >= 2 && password.length >= 8) return 'medium';
    return 'weak';
  };

  const passwordStrength = formData.password ? calculatePasswordStrength(formData.password) : null;

  // Validation functions
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^(\+44|0)[0-9]{10}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Invalid UK phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const dob = new Date(formData.dateOfBirth);
      const age = Math.floor((new Date().getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 21) {
        newErrors.dateOfBirth = 'You must be at least 21 years old';
      }
    }

    if (!formData.addressLine1) newErrors.addressLine1 = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.postcode) newErrors.postcode = 'Postcode is required';
    if (!formData.country) newErrors.country = 'Country is required';

    if (!formData.emergencyContactName) newErrors.emergencyContactName = 'Emergency contact name is required';
    if (!formData.emergencyContactRelationship) newErrors.emergencyContactRelationship = 'Relationship is required';
    if (!formData.emergencyContactPhone) newErrors.emergencyContactPhone = 'Emergency contact phone is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.siaLicenseNumber) newErrors.siaLicenseNumber = 'SIA license number is required';
    if (!formData.siaLicenseExpiry) newErrors.siaLicenseExpiry = 'SIA license expiry is required';
    if (!formData.siaLicenseDocument) newErrors.siaLicenseDocument = 'SIA license document is required';

    if (!formData.dbsCertificateNumber) newErrors.dbsCertificateNumber = 'DBS certificate number is required';
    if (!formData.dbsIssueDate) newErrors.dbsIssueDate = 'DBS issue date is required';
    if (!formData.dbsDocument) newErrors.dbsDocument = 'DBS document is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.yearsOfExperience < 0) {
      newErrors.yearsOfExperience = 'Years of experience must be 0 or greater';
    }

    if (formData.specializations.length === 0) {
      newErrors.specializations = 'Select at least one specialization';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep5 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept the terms and conditions';
    if (!formData.acceptPrivacy) newErrors.acceptPrivacy = 'You must accept the privacy policy';
    if (!formData.acceptBackgroundCheck) newErrors.acceptBackgroundCheck = 'You must consent to background check';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        break;
      case 5:
        isValid = validateStep5();
        break;
    }

    if (isValid && currentStep < 5) {
      setCurrentStep(currentStep + 1);
      setErrors({});
    } else if (isValid && currentStep === 5) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare signup data
      const signupData: SignUpData = {
        email: formData.email,
        password: formData.password,
        fullName: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phoneNumber,
        userType: 'cpo',
        // CPO-specific fields
        siaLicenseNumber: formData.siaLicenseNumber,
        siaLicenseType: 'Close Protection', // Default to Close Protection
        siaLicenseExpiry: formData.siaLicenseExpiry,
        dateOfBirth: formData.dateOfBirth,
        addressLine1: formData.addressLine1,
        city: formData.city,
        postcode: formData.postcode,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
      };

      // Call auth service
      const { user, error } = await authService.signUp(signupData);

      if (error) {
        throw new Error(error.message);
      }

      if (!user) {
        throw new Error('User creation failed. Please try again.');
      }

      // Clear stored form data on success
      localStorage.removeItem(STORAGE_KEY);

      // Success - redirect to login with success message
      navigate('/login', {
        state: {
          message: 'Registration successful! Please check your email to verify your account, then log in.'
        }
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      setSubmitError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addLanguage = () => {
    setFormData({
      ...formData,
      languages: [...formData.languages, { language: '', proficiency: 'basic' }],
    });
  };

  const removeLanguage = (index: number) => {
    setFormData({
      ...formData,
      languages: formData.languages.filter((_, i) => i !== index),
    });
  };

  const updateLanguage = (index: number, field: 'language' | 'proficiency', value: string) => {
    const updatedLanguages = [...formData.languages];
    updatedLanguages[index][field] = value;
    setFormData({ ...formData, languages: updatedLanguages });
  };

  // Step animation variants
  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const [direction, setDirection] = useState(0);

  const handleStepChange = (newStep: number) => {
    setDirection(newStep > currentStep ? 1 : -1);
  };

  useEffect(() => {
    handleStepChange(currentStep);
  }, [currentStep]);

  return (
    <div className="armora-signup">
      <div className="armora-signup__container">
        {/* Header */}
        <div className="armora-signup__header">
          <h1 className="armora-signup__title">Join ArmoraCPO</h1>
          <p className="armora-signup__subtitle">SIA Licensed Close Protection Officer Registration</p>
        </div>

        {/* Stepper */}
        <SignupStepper currentStep={currentStep} totalSteps={5} steps={steps} />

        {/* Form Steps */}
        <div className="armora-signup__form-container">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="armora-signup__form"
            >
              {/* Step 1: Account Creation */}
              {currentStep === 1 && (
                <div className="armora-signup__step">
                  <h2 className="armora-signup__step-title">Create Your Account</h2>

                  <FormInput
                    type="email"
                    label="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={errors.email}
                    required
                    placeholder="your.email@example.com"
                  />

                  <div className="armora-signup__password-field">
                    <FormInput
                      type={showPassword ? 'text' : 'password'}
                      label="Password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      error={errors.password}
                      required
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="armora-signup__password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      <IconWrapper icon={showPassword ? FaEyeSlash : FaEye} />
                    </button>
                  </div>

                  {formData.password && passwordStrength && (
                    <div className="armora-signup__password-strength">
                      <div className="armora-signup__password-strength-label">
                        Password Strength: <span className={`armora-signup__password-strength-text armora-signup__password-strength-text--${passwordStrength}`}>{passwordStrength}</span>
                      </div>
                      <div className="armora-signup__password-strength-bar">
                        <div className={`armora-signup__password-strength-fill armora-signup__password-strength-fill--${passwordStrength}`} />
                      </div>
                    </div>
                  )}

                  <div className="armora-signup__password-field">
                    <FormInput
                      type={showConfirmPassword ? 'text' : 'password'}
                      label="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      error={errors.confirmPassword}
                      required
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="armora-signup__password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label="Toggle confirm password visibility"
                    >
                      <IconWrapper icon={showConfirmPassword ? FaEyeSlash : FaEye} />
                    </button>
                  </div>

                  <FormInput
                    type="phone"
                    label="Phone Number"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    error={errors.phoneNumber}
                    required
                    placeholder="+44 7700 900000"
                    helperText="UK format: +44 or 0 followed by 10 digits"
                  />

                  <p className="armora-signup__login-link">
                    Already have an account? <Link to="/login">Sign in</Link>
                  </p>
                </div>
              )}

              {/* Step 2: Personal Information */}
              {currentStep === 2 && (
                <div className="armora-signup__step">
                  <h2 className="armora-signup__step-title">Personal Information</h2>

                  <div className="armora-signup__row">
                    <FormInput
                      type="text"
                      label="First Name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      error={errors.firstName}
                      required
                      placeholder="John"
                    />

                    <FormInput
                      type="text"
                      label="Last Name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      error={errors.lastName}
                      required
                      placeholder="Smith"
                    />
                  </div>

                  <FormInput
                    type="text"
                    label="Date of Birth"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    error={errors.dateOfBirth}
                    required
                    placeholder="YYYY-MM-DD"
                    helperText="Must be 21 years or older"
                  />

                  <h3 className="armora-signup__section-title">Address</h3>

                  <FormInput
                    type="text"
                    label="Address Line 1"
                    value={formData.addressLine1}
                    onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                    error={errors.addressLine1}
                    required
                    placeholder="123 Main Street"
                  />

                  <FormInput
                    type="text"
                    label="Address Line 2"
                    value={formData.addressLine2}
                    onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                    placeholder="Apartment, suite, etc. (optional)"
                  />

                  <div className="armora-signup__row">
                    <FormInput
                      type="text"
                      label="City"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      error={errors.city}
                      required
                      placeholder="London"
                    />

                    <FormInput
                      type="text"
                      label="Postcode"
                      value={formData.postcode}
                      onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                      error={errors.postcode}
                      required
                      placeholder="SW1A 1AA"
                    />
                  </div>

                  <FormSelect
                    label="Country"
                    options={countryOptions}
                    value={formData.country}
                    onChange={(value) => setFormData({ ...formData, country: value as string })}
                    error={errors.country}
                    required
                  />

                  <h3 className="armora-signup__section-title">Emergency Contact</h3>

                  <FormInput
                    type="text"
                    label="Contact Name"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    error={errors.emergencyContactName}
                    required
                    placeholder="Jane Doe"
                  />

                  <div className="armora-signup__row">
                    <FormInput
                      type="text"
                      label="Relationship"
                      value={formData.emergencyContactRelationship}
                      onChange={(e) => setFormData({ ...formData, emergencyContactRelationship: e.target.value })}
                      error={errors.emergencyContactRelationship}
                      required
                      placeholder="Spouse, Parent, etc."
                    />

                    <FormInput
                      type="phone"
                      label="Contact Phone"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                      error={errors.emergencyContactPhone}
                      required
                      placeholder="+44 7700 900000"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: SIA License & Certifications */}
              {currentStep === 3 && (
                <div className="armora-signup__step">
                  <h2 className="armora-signup__step-title">SIA License & Certifications</h2>

                  <h3 className="armora-signup__section-title">SIA License</h3>

                  <FormInput
                    type="text"
                    label="SIA License Number"
                    value={formData.siaLicenseNumber}
                    onChange={(e) => setFormData({ ...formData, siaLicenseNumber: e.target.value })}
                    error={errors.siaLicenseNumber}
                    required
                    placeholder="e.g., 12345678901234"
                  />

                  <FormInput
                    type="text"
                    label="License Expiry Date"
                    value={formData.siaLicenseExpiry}
                    onChange={(e) => setFormData({ ...formData, siaLicenseExpiry: e.target.value })}
                    error={errors.siaLicenseExpiry}
                    required
                    placeholder="YYYY-MM-DD"
                  />

                  <FormFileUpload
                    label="SIA License Document"
                    accept="image/*,application/pdf"
                    onUpload={(files) => setFormData({ ...formData, siaLicenseDocument: files[0] })}
                    maxSize={5 * 1024 * 1024}
                    error={errors.siaLicenseDocument}
                  />

                  <h3 className="armora-signup__section-title">DBS Certificate</h3>

                  <FormInput
                    type="text"
                    label="DBS Certificate Number"
                    value={formData.dbsCertificateNumber}
                    onChange={(e) => setFormData({ ...formData, dbsCertificateNumber: e.target.value })}
                    error={errors.dbsCertificateNumber}
                    required
                    placeholder="e.g., 001234567890"
                  />

                  <FormInput
                    type="text"
                    label="DBS Issue Date"
                    value={formData.dbsIssueDate}
                    onChange={(e) => setFormData({ ...formData, dbsIssueDate: e.target.value })}
                    error={errors.dbsIssueDate}
                    required
                    placeholder="YYYY-MM-DD"
                  />

                  <FormFileUpload
                    label="DBS Certificate Document"
                    accept="image/*,application/pdf"
                    onUpload={(files) => setFormData({ ...formData, dbsDocument: files[0] })}
                    maxSize={5 * 1024 * 1024}
                    error={errors.dbsDocument}
                  />
                </div>
              )}

              {/* Step 4: Professional Information */}
              {currentStep === 4 && (
                <div className="armora-signup__step">
                  <h2 className="armora-signup__step-title">Professional Information</h2>

                  <FormInput
                    type="number"
                    label="Years of Experience"
                    value={formData.yearsOfExperience.toString()}
                    onChange={(e) => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                    error={errors.yearsOfExperience}
                    required
                    placeholder="5"
                    helperText="Total years in close protection or security"
                  />

                  <FormSelect
                    label="Specializations"
                    options={specializationOptions}
                    value={formData.specializations}
                    onChange={(value) => setFormData({ ...formData, specializations: value as string[] })}
                    error={errors.specializations}
                    required
                    multiple
                    placeholder="Select your specializations"
                  />

                  <h3 className="armora-signup__section-title">Languages</h3>

                  {formData.languages.map((lang, index) => (
                    <div key={index} className="armora-signup__language-item">
                      <div className="armora-signup__row">
                        <FormInput
                          type="text"
                          label="Language"
                          value={lang.language}
                          onChange={(e) => updateLanguage(index, 'language', e.target.value)}
                          placeholder="e.g., English, Spanish"
                        />

                        <FormSelect
                          label="Proficiency"
                          options={proficiencyOptions}
                          value={lang.proficiency}
                          onChange={(value) => updateLanguage(index, 'proficiency', value as string)}
                        />
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeLanguage(index)}
                        icon={<IconWrapper icon={FaTimes} />}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="secondary"
                    onClick={addLanguage}
                    icon={<IconWrapper icon={FaPlus} />}
                  >
                    Add Language
                  </Button>
                </div>
              )}

              {/* Step 5: Terms & Conditions */}
              {currentStep === 5 && (
                <div className="armora-signup__step">
                  <h2 className="armora-signup__step-title">Terms & Conditions</h2>

                  <div className="armora-signup__terms">
                    <label className="armora-signup__checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.acceptTerms}
                        onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                        className="armora-signup__checkbox"
                      />
                      <span>
                        I accept the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms and Conditions</a>
                      </span>
                    </label>
                    {errors.acceptTerms && <p className="armora-signup__error">{errors.acceptTerms}</p>}
                  </div>

                  <div className="armora-signup__terms">
                    <label className="armora-signup__checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.acceptPrivacy}
                        onChange={(e) => setFormData({ ...formData, acceptPrivacy: e.target.checked })}
                        className="armora-signup__checkbox"
                      />
                      <span>
                        I accept the <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                      </span>
                    </label>
                    {errors.acceptPrivacy && <p className="armora-signup__error">{errors.acceptPrivacy}</p>}
                  </div>

                  <div className="armora-signup__terms">
                    <label className="armora-signup__checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.acceptBackgroundCheck}
                        onChange={(e) => setFormData({ ...formData, acceptBackgroundCheck: e.target.checked })}
                        className="armora-signup__checkbox"
                      />
                      <span>
                        I consent to a background check as required by SIA regulations
                      </span>
                    </label>
                    {errors.acceptBackgroundCheck && <p className="armora-signup__error">{errors.acceptBackgroundCheck}</p>}
                  </div>

                  <div className="armora-signup__summary">
                    <h3 className="armora-signup__section-title">Registration Summary</h3>
                    <div className="armora-signup__summary-item">
                      <span className="armora-signup__summary-label">Email:</span>
                      <span className="armora-signup__summary-value">{formData.email}</span>
                    </div>
                    <div className="armora-signup__summary-item">
                      <span className="armora-signup__summary-label">Name:</span>
                      <span className="armora-signup__summary-value">{formData.firstName} {formData.lastName}</span>
                    </div>
                    <div className="armora-signup__summary-item">
                      <span className="armora-signup__summary-label">SIA License:</span>
                      <span className="armora-signup__summary-value">{formData.siaLicenseNumber}</span>
                    </div>
                    <div className="armora-signup__summary-item">
                      <span className="armora-signup__summary-label">Experience:</span>
                      <span className="armora-signup__summary-value">{formData.yearsOfExperience} years</span>
                    </div>
                  </div>

                  {submitError && (
                    <div className="armora-signup__error-banner" style={{
                      backgroundColor: '#ff4444',
                      color: 'white',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      marginTop: '16px',
                      fontSize: '14px',
                    }}>
                      {submitError}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="armora-signup__navigation">
          {currentStep > 1 && (
            <Button
              variant="secondary"
              onClick={handleBack}
              icon={<IconWrapper icon={FaArrowLeft} />}
              iconPosition="left"
            >
              Back
            </Button>
          )}

          <Button
            variant="primary"
            onClick={handleNext}
            icon={<IconWrapper icon={currentStep === 5 ? FaCheck : FaArrowRight} />}
            iconPosition="right"
            disabled={isSubmitting}
          >
            {currentStep === 5 ? (isSubmitting ? 'Submitting...' : 'Submit Registration') : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
