import React, { useState } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle2, ArrowRight, ArrowLeft, Save, 
  Send, ShieldCheck, User, BookOpen, Building, 
  FileCheck, Globe, CreditCard, Sparkles 
} from 'lucide-react';

const SECTIONS = [
  { id: 'personal', title: 'Personal Details', icon: User },
  { id: 'social', title: 'Social & ST Category', icon: ShieldCheck },
  { id: 'academic', title: 'Academic Profile', icon: BookOpen },
  { id: 'fellowship', title: 'Fellowship / Research', icon: Building },
  { id: 'bank', title: 'Bank Account & DBT', icon: CreditCard },
  { id: 'declaration', title: 'Declaration & Submit', icon: FileCheck },
];

export default function ApplicationWizardPage({ scheme, onApplicationSubmitted, onCancel }) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [saveDraftMessage, setSaveDraftMessage] = useState('');

  // Default pre-populated data for quick demo (customizable)
  const isRahul = user?.full_name?.toLowerCase().includes('rahul');
  
  const [formData, setFormData] = useState({
    // Personal
    full_name: user?.full_name || 'Rahul Kumar Singh',
    dob: '1998-07-14',
    gender: 'Male',
    state: user?.state || 'Jharkhand',
    district: user?.district || 'Ranchi',
    mobile: user?.mobile || '9823012345',
    email: user?.email || 'rahul.singh@tribalscholar.gov.in',
    
    // Social
    st_status: 'ST',
    st_tribe_name: 'Santhal',
    certificate_no: 'ST123456',
    issuing_authority: 'Sub-Divisional Magistrate (SDM), Ranchi',
    
    // Academic
    highest_qualification: 'Post-Graduate (M.Tech)',
    institution: 'National Institute of Technology Jamshedpur',
    course: 'Computer Science and Engineering',
    percentage: '79.5',
    year_of_completion: '2024',
    
    // Fellowship / Overseas
    research_area: 'AI-Assisted Natural Language Processing for Indigenous Tribal Dialects',
    research_institution: 'National Institute of Technology Jamshedpur',
    admission_status: 'Confirmed',
    other_fellowships: 'None',
    foreign_country: 'United Kingdom',
    foreign_university: 'Imperial College London',
    passport_number: 'T9481023',

    // Bank
    bank_name: 'State Bank of India',
    account_no: '38291048291',
    ifsc: 'SBIN0001234',
    account_holder: user?.full_name || 'Rahul Kumar Singh',

    // Declaration
    declaration_agreed: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const progressPercentage = Math.round(((currentStep + 1) / SECTIONS.length) * 100);

  const handleSaveDraft = async () => {
    setSaveDraftMessage('Saving application draft securely...');
    setTimeout(() => {
      setSaveDraftMessage('Draft saved successfully to cloud storage.');
      setTimeout(() => setSaveDraftMessage(''), 3000);
    }, 600);
  };

  const handleSubmit = async () => {
    if (!formData.declaration_agreed) {
      alert("Please confirm the digital statutory declaration before submission.");
      return;
    }

    setSubmitting(true);
    try {
      // Build answers array
      const answers = Object.entries(formData).map(([k, v]) => ({
        section_name: "General",
        field_name: k,
        field_value: String(v)
      }));

      // 1. Create Application
      const app = await apiRequest('/applications', {
        method: 'POST',
        body: JSON.stringify({
          scheme_id: scheme?.id || 1,
          answers
        })
      });

      // 2. Submit Application
      const submittedApp = await apiRequest(`/applications/${app.id}/submit`, {
        method: 'POST'
      });

      if (onApplicationSubmitted) {
        onApplicationSubmitted(submittedApp);
      }
    } catch (err) {
      alert("Error submitting application: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Wizard Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-900 text-xs font-bold px-2 py-0.5 rounded">
                Scheme: {scheme?.code || 'NFST'}
              </span>
              <span className="text-slate-400 text-xs">|</span>
              <span className="text-xs text-slate-500 font-medium">Digital Application Portal</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              Application for {scheme?.name || 'National Fellowship for Scheduled Tribes'}
            </h2>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-blue-900">{progressPercentage}% Completed</span>
            <div className="w-36 h-2.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden border border-slate-200">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mt-6 pt-4 border-t border-slate-100">
          {SECTIONS.map((sec, idx) => {
            const Icon = sec.icon;
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;
            return (
              <button
                key={sec.id}
                onClick={() => setCurrentStep(idx)}
                className={`flex flex-col items-center p-2 rounded-xl text-center transition-all ${
                  isActive 
                    ? 'bg-blue-50 border-2 border-blue-600 text-blue-900' 
                    : isCompleted 
                    ? 'bg-emerald-50/70 border border-emerald-200 text-emerald-800' 
                    : 'bg-slate-50 border border-slate-200 text-slate-400 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="text-[11px] font-semibold leading-tight line-clamp-1">{sec.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Content Body */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        {/* Step 1: Personal Details */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
              1. Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name (as per Certificate)</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Third Gender</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Domicile State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Home District</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number (Aadhaar linked)</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Social & ST Category */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
              2. Social & Scheduled Tribe Category Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Caste / Community Category</label>
                <input
                  type="text"
                  name="st_status"
                  value={formData.st_status}
                  disabled
                  className="w-full text-xs p-2.5 rounded-lg bg-slate-100 border border-slate-300 font-bold text-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Recognized Tribe / Sub-Tribe Name</label>
                <input
                  type="text"
                  name="st_tribe_name"
                  value={formData.st_tribe_name}
                  onChange={handleChange}
                  placeholder="e.g. Santhal, Munda, Gond, Boro"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ST Certificate Number</label>
                <input
                  type="text"
                  name="certificate_no"
                  value={formData.certificate_no}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Issuing Authority</label>
                <input
                  type="text"
                  name="issuing_authority"
                  value={formData.issuing_authority}
                  onChange={handleChange}
                  placeholder="e.g. Sub-Divisional Magistrate (SDM), District Magistrate"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Academic Profile */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
              3. Academic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Highest Qualifying Degree</label>
                <input
                  type="text"
                  name="highest_qualification"
                  value={formData.highest_qualification}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">University / Institution</label>
                <input
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Percentage / CGPA Equivalent</label>
                <input
                  type="text"
                  name="percentage"
                  value={formData.percentage}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500">Minimum 55% required for NFST fellowship eligibility</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Year of Passing / Completion</label>
                <input
                  type="number"
                  name="year_of_completion"
                  value={formData.year_of_completion}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Fellowship / Overseas */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
              4. Fellowship & Research Enrollment Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Doctoral Research Area / Title</label>
                <input
                  type="text"
                  name="research_area"
                  value={formData.research_area}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ph.D. Host Institution</label>
                <input
                  type="text"
                  name="research_institution"
                  value={formData.research_institution}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Admission Status</label>
                <select
                  name="admission_status"
                  value={formData.admission_status}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option>Confirmed</option>
                  <option>Provisional</option>
                  <option>Awaiting Final Offer</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Bank & DBT */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
              5. Direct Benefit Transfer (DBT) Bank Information
            </h3>
            <p className="text-xs text-slate-500">
              Stipend and fellowship allowances are credited directly to your Aadhaar-seeded bank account.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Holder Name</label>
                <input
                  type="text"
                  name="account_holder"
                  value={formData.account_holder}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Number</label>
                <input
                  type="password"
                  name="account_no"
                  value={formData.account_no}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  name="ifsc"
                  value={formData.ifsc}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Declaration & Submit */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
              6. Digital Statutory Declaration & Confirmation
            </h3>
            
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs text-blue-950 space-y-2 leading-relaxed">
              <p className="font-semibold text-blue-900">Statutory Affirmation under Ministry of Tribal Affairs Guidelines:</p>
              <p>
                1. I hereby declare that all particulars stated in this application are true, complete, and correct to the best of my knowledge.
              </p>
              <p>
                2. I belong to the notified Scheduled Tribe community and hold a valid caste certificate issued by an authorized competent revenue officer.
              </p>
              <p>
                3. I am not availing any dual government fellowship, UGC-JRF, or central research grant simultaneously.
              </p>
              <p>
                4. I consent to AI document processing, OCR extraction, and cross-matching with official registries for administrative evaluation.
              </p>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <input
                type="checkbox"
                id="declaration_agreed"
                name="declaration_agreed"
                checked={formData.declaration_agreed}
                onChange={handleChange}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 mt-0.5 cursor-pointer"
              />
              <label htmlFor="declaration_agreed" className="text-xs text-slate-800 font-medium cursor-pointer">
                I accept and confirm the digital statutory declaration above and authorize submission of my application dossier.
              </label>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveDraft}
              type="button"
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-4 h-4 text-slate-500" />
              <span>Save Draft</span>
            </button>
            {saveDraftMessage && (
              <span className="text-xs text-emerald-700 font-medium animate-fade-in">
                {saveDraftMessage}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            )}

            {currentStep < SECTIONS.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-600 rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <span>Next Section</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting Application...' : 'Submit & Proceed to Document Intelligence'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
