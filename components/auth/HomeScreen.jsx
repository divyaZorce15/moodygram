'use client';

import client from "../../api/client";
import useAuth from "@/hooks/useAuth";
import { useState } from "react";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  Tent,
  Home,
  Map,
  Mountain,
  X,
  ChevronDown,
  Mail,
  MailIcon,
} from "lucide-react";



export default function HomeScreen() {

  const { user } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);

  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [loginMethod, setLoginMethod] = useState("email"); 

  const [openLogin, setOpenLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [lockedEmail, setLockedEmail] = useState("");
  const [step, setStep] = useState("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [openFinishSignup, setOpenFinishSignup] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [showAlmostThere, setShowAlmostThere] = useState(false);

  const menuRef = useRef(null);
  const router = useRouter();

  const clearAuthStates = () => {
    setEmail("");
    setLockedEmail("");
    setOtp("");
    setPassword("");
    setError("");
    setStep("email");
  };

  // const sendPhoneOtp = async () => {
  //   if (!phone || phone.trim().length < 10) {
  //     setError("Enter valid phone number");
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     setError("");

  //     const formattedPhone = phone.startsWith("+")
  //       ? phone
  //       : `+91${phone}`;

  //     const { error } = await client.auth.signInWithOtp({
  //       phone: formattedPhone,
  //     });

  //     if (error) {
  //       setError(error.message);
  //       return;
  //     }

  //     setStep("phone-otp");

  //   } catch (err) {
  //     setError("Something went wrong. Try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const verifyPhoneOtp = async () => {
  //   if (!otp || otp.length < 4) {
  //     setError("Enter valid OTP");
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     setError("");

  //     const formattedPhone = phone.startsWith("+")
  //       ? phone
  //       : `+91${phone}`;

  //     const { data, error } = await client.auth.verifyOtp({
  //       phone: formattedPhone,
  //       token: otp,
  //       type: "sms",
  //     });

  //     if (error) {
  //       setError(error.message);
  //       return;
  //     }

  //     if (!data?.user) {
  //       setError("User verification failed");
  //       return;
  //     }

  //     const { data: sessionData } = await client.auth.getSession();

  //     if (!sessionData?.session) {
  //       setError("Session not created");
  //       return;
  //     }

  //     await handlePostAuth(data.user);

  //     setOpenLogin(false);

  //     router.replace("/home");

  //   } catch (err) {
  //     setError("Verification failed. Try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const sendPhoneOtp = async () => {
    if (!phone || phone.trim().length < 10) {
      setError("Enter valid phone number");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Convert to E.164 format (+91 for India)
      const formattedPhone = phone.startsWith("+")
        ? phone
        : `+91${phone}`;

      const { error } = await client.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          shouldCreateUser: true, // auto-create user if not exists
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      setStep("phone-otp");
    } catch (err) {
      setError("Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };


  const verifyPhoneOtp = async () => {
    if (!otp || otp.length < 4) {
      setError("Enter valid OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formattedPhone = phone.startsWith("+")
        ? phone
        : `+91${phone}`;

      const { data, error } = await client.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: "sms",
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (!data || !data.session || !data.user) {
        setError("Authentication failed");
        return;
      }

      await handlePostAuth(data.user);

      setOpenLogin(false);
      router.replace("/home");

    } catch (err) {
      setError("Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  
  const signInWithGoogle = async () => {
    setGoogleLoading(true);
    setError("");

    await client.auth.signOut(); 

    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  };


  const sendEmailOtp = async () => {
    if (!email) return;

    setEmailLoading(true);
    setError("");

    const { error } = await client.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    if (error) {
      setError(error.message);
    } else {
      setLockedEmail(email);
      setStep("otp");
    }

    setEmailLoading(false);
  };

  const verifyEmailOtp = async () => {
    if (!otp) {
      setError("Enter OTP");
      return;
    }

    setLoading(true);
    setError("");

    console.log("Locked Email:", lockedEmail);
    console.log("OTP:", otp);


    const { data, error } = await client.auth.verifyOtp({
      email: lockedEmail,   
      token: otp,
      type: "email",
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    await handlePostAuth(data.user);
    setOpenLogin(false);
    setLoading(false);

  };

  const submitFinishSignup = async () => {
    if (!firstName || !lastName || !dob) {
      setError("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Get session safely
      const {
        data: { session },
        error: sessionError,
      } = await client.auth.getSession();

      if (sessionError || !session?.user) {
        console.log("SESSION ERROR:", sessionError);
        setError("User session not found. Please login again.");
        setLoading(false);
        return;
      }

      const user = session.user;

      console.log("USER ID:", user.id);

      // First check if profile exists
      const { data: existingProfile, error: selectError } =
        await client
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

      if (selectError) {
        console.log("SELECT ERROR:", selectError);
        setError(selectError.message);
        setLoading(false);
        return;
      }

      // If profile does not exist -- insert
      if (!existingProfile) {
        const { error: insertError } = await client
          .from("profiles")
          .insert({
            id: user.id,
            first_name: firstName,
            last_name: lastName,
            dob,
            onboarded: true,
            password_set: false,
            role: "traveler",
          });

        if (insertError) {
          console.log("INSERT ERROR:", insertError);
          setError(insertError.message);
          setLoading(false);
          return;
        }
      } else {
        // Profile exists -- update
        const { data: updatedData, error: updateError } =
          await client
            .from("profiles")
            .update({
              first_name: firstName,
              last_name: lastName,
              dob,
              onboarded: true,
            })
            .eq("id", user.id)
            .select();

        console.log("UPDATE RESULT:", updatedData);
        console.log("UPDATE ERROR:", updateError);

        if (updateError) {
          setError(updateError.message);
          setLoading(false);
          return;
        }
      }

      // Success
      setOpenFinishSignup(false);
      setShowAlmostThere(true);
    } catch (err) {
      console.log("UNEXPECTED ERROR:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    const { error: authError } = await client.auth.updateUser({
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await client.auth.getUser();

    await client
      .from("profiles")
      .update({
        password_set: true,
      })
      .eq("id", user.id);

    setShowAlmostThere(false);
    setOpenFinishSignup(false);
    setOpenLogin(false);
    setStep("email");

    setLoading(false);

    router.replace("/");
  };

  const handlePostAuth = async (user) => {
    const { data: profile, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    console.log("PROFILE:", profile);
    // If profile does not exist create it
    if (!profile) {
      const { error: insertError } = await client
        .from("profiles")
        .insert({
          id: user.id,
          onboarded: false,
          password_set: false,
        });

      if (insertError) {
        console.error(insertError);
        return;
      }

      setOpenFinishSignup(true);
      return;
    }

    // If profile exists but not onboarded
    if (!profile.onboarded) {
      setOpenFinishSignup(true);
      return;
    }

    // If onboarded but password not set
    if (!profile.password_set) {
      setShowAlmostThere(true);
      return;
    }

    // Fully completed user
    setOpenLogin(false);
    setOpenFinishSignup(false);
    setShowAlmostThere(false);
    router.replace("/");
  };

  const resetLoginState = () => {
    clearAuthStates();   
    setOpenLogin(true);
  };

  const logout = async () => {
    await client.auth.signOut();

    clearAuthStates();  
    setOpenLogin(false);   
    setOpenFinishSignup(false);
    setShowAlmostThere(false);

    router.replace("/"); 
  };


  useEffect(() => {
    const checkExistingSession = async () => {
      const {
        data: { session },
      } = await client.auth.getSession();

      if (!session) return;

      const { data: profile } = await client
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!profile) return;

      if (!profile.onboarded) {
        setOpenFinishSignup(true);
        return;
      }

      if (!profile.password_set) {
        setShowAlmostThere(true);
        return;
      }

      // Fully onboarded user
      setOpenLogin(false);
    };

    checkExistingSession();
  }, []);



  return (
    <div className="w-full min-h-screen bg-white pb-24">

      {/* ================= HEADER ================= */}
      <header className="relative z-50 mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        {/* Logo */}
        <div className="h-9 w-28 cursor-pointer rounded bg-zinc-300" />

        {/* Actions */}
        <div className="flex items-center gap-6">
          <button className="hidden cursor-pointer text-sm text-zinc-700 md:block">
            Become a Host
          </button>
          {!user ? (
            <button
              className="cursor-pointer rounded-full bg-green-600 px-5 py-2 text-sm font-medium text-white"
              onClick={resetLoginState}
            >
              Login / Sign Up
            </button>
          ) : (
              <div  ref={menuRef}  className="relative cursor-pointer">
                <button
                  onClick={() => setOpenMenu((v) => !v)}
                  className="flex items-center justify-center rounded-full border bg-white p-2 cursor-pointer"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white text-sm font-semibold">
                    {user.user_metadata?.full_name
                      ? user.user_metadata.full_name[0].toUpperCase()
                      : user.email?.[0]?.toUpperCase() || "U"}
                  </div>
                </button>


                {openMenu && (
                  <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border bg-white shadow-lg">
                    
                    {/* User Info */}
                    <div className="flex items-center gap-3 border-b px-4 py-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white font-semibold">
                        {user.user_metadata?.full_name
                          ? user.user_metadata.full_name[0].toUpperCase()
                          : user.email?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-900">
                          {user.user_metadata?.full_name || "User"}
                        </p>
                        <p className="truncate text-xs text-zinc-500">
                          {user.email || user.phone}
                        </p>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-50 rounded-xl cursor-pointer">
                      My Profile
                    </button>

                    <button
                      onClick={() => {
                        setOpenMenu(false);
                        logout();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-zinc-50 rounded-xl cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                )}

              </div>
          )}

        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="relative h-[420px] w-full sm:h-[480px] lg:h-[600px]">
        <Image
          src="/hero.jpg"
          alt="Nature stay"
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
          <h1 className="text-2xl font-semibold sm:text-3xl lg:text-4xl">
            Explore your way into nature
          </h1>

          <p className="mt-3 max-w-2xl text-sm text-zinc-200 sm:text-base lg:text-lg">
            the one of a kind locations that connect with you to nature
          </p>

          {/* SEARCH BAR */}
          <div className="mt-8 max-w-xl sm:max-w-2xl lg:max-w-4xl">
            <div className="flex items-center gap-3">

              {/* Destination */}
              <div className="flex flex-1 items-center gap-3 rounded-full bg-white px-5 py-2 text-sm font-medium">
                <div className="h-5 w-5 rounded-full bg-zinc-300" />
                <input
                  placeholder="Search Destinations"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-500"
                />
              </div>

              {/* People */}
              <div className="flex flex-1 items-center gap-3 rounded-full bg-white px-5 py-2 text-sm font-medium">
                <div className="h-5 w-5 rounded-full bg-zinc-300" />
                <input
                  placeholder="People"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-500"
                />
              </div>

              {/* Search Button */}
              <button className="ml-2 flex cursor-pointer items-center gap-2 rounded-full bg-green-600 px-5 py-2 text-sm font-medium text-white">
                <Search size={16} />
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="mx-auto mt-6 max-w-6xl border-b px-4 pb-4 sm:mt-8">
        <div className="flex justify-between sm:justify-around">
          {[
            { label: "All", icon: Home },
            { label: "Staycations", icon: Tent },
            { label: "Feels", icon: Map },
            { label: "Hiking/Trekking", icon: Mountain },
          ].map(({ label, icon: Icon }, i) => (
            <button
              key={label}
              className={`group flex cursor-pointer flex-col items-center gap-1 text-xs sm:text-sm transition ${
                i === 0
                  ? "text-green-600"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <Icon
                size={22}
                className={`${
                  i === 0 ? "text-green-600" : "text-zinc-400"
                }`}
              />
              <span>{label}</span>
              <span
                className={`mt-1 h-0.5 w-6 rounded-full transition ${
                  i === 0
                    ? "bg-green-600"
                    : "bg-transparent group-hover:bg-zinc-300"
                }`}
              />
            </button>
          ))}
        </div>
      </section>

      {/* ================= CONTENT SECTION ================= */}
      <section className="mx-auto mt-8 max-w-7xl px-4 md:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold sm:text-lg lg:text-xl">
            Curated for you in Kerala
          </h2>
          <button className="cursor-pointer text-sm text-zinc-600 hover:underline">
            See all →
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="cursor-pointer overflow-hidden rounded-xl border bg-white shadow-sm"
            >
              <div className="h-40 bg-zinc-200 sm:h-44 lg:h-48" />
              <div className="p-3">
                <h3 className="text-sm font-medium">
                  Forest Stay Cabin
                </h3>
                <p className="text-xs text-zinc-500">
                  Wayanad, Kerala
                </p>
                <p className="mt-1 text-sm font-semibold">
                  ₹4,500 / night
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= LOGIN MODAL ================= */}

      {openLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
             setOpenLogin(false);
             clearAuthStates();
            }}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-md rounded-3xl bg-white px-4 sm:px-8 py-7 shadow-xl mx-3 sm:mx-auto">
            
            {/* Close */}
            <button
              onClick={() => {
                setOpenLogin(false);
                clearAuthStates();
              }}
              className="absolute right-6 top-6 text-zinc-400 hover:text-zinc-600"
            >
              ✕
            </button>

            {/* Title */}
            <h2 className="text-center text-xl font-semibold tracking-tight">
              Welcome to MOODYGRAM
            </h2>

            <div className="mt-4 flex rounded-xl bg-zinc-100 p-1">
              <button
                onClick={() => {
                  clearAuthStates();
                  setLoginMethod("email");
                  setStep("email");
                }}
                className={`flex-1 rounded-lg py-2 text-sm font-medium ${
                  loginMethod === "email"
                    ? "bg-white shadow"
                    : "text-zinc-500"
                }`}
              >
                Email
              </button>

              <button
                onClick={() => {
                  clearAuthStates();
                  setLoginMethod("phone");
                  setStep("phone");
                }}
                className={`flex-1 rounded-lg py-2 text-sm font-medium ${
                  loginMethod === "phone"
                    ? "bg-white shadow"
                    : "text-zinc-500"
                }`}
              >
                Phone
              </button>
            </div>

            <p className="mt-1 text-center text-sm text-zinc-500">
              {step === "email" || step === "phone"
                ? "Login to explore curated eco-friendly stays"
                : loginMethod === "email"
                ? "Enter the OTP sent to your Gmail"
                : "Enter the OTP sent to your phone"}
            </p>

            {/* ================= Email STEP ================= */}
            {loginMethod === "email" && step === "email" && (
              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Email address
                  </label>

                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      disabled={step === "otp"}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 flex-1 rounded-xl border px-4 text-sm outline-none focus:ring-2 focus:ring-green-600"
                    />

                    <button
                      onClick={sendEmailOtp}
                      disabled={loading}
                      className="h-11 rounded-xl bg-green-600 px-4 text-sm font-semibold text-white"
                    >
                      {emailLoading ? "Sending..." : "Send OTP"}
                    </button>
                  </div>


                {error && (
                  <p className="mt-2 text-sm text-red-500">{error}</p>
                )}
              </div>
            )}

            {loginMethod === "phone" && step === "phone" && (
              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Phone number
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-11 flex-1 rounded-xl border px-4 text-sm outline-none focus:ring-2 focus:ring-green-600"
                  />

                  <button
                    onClick={sendPhoneOtp}
                    disabled={loading}
                    className="h-11 rounded-xl bg-green-600 px-4 text-sm font-semibold text-white"
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                </div>

                {error && (
                  <p className="mt-2 text-sm text-red-500">{error}</p>
                )}
              </div>
            )}

            {/* ================= Email OTP STEP ================= */}
            {loginMethod === "email" &&  step === "otp" && (
              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Enter OTP
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="h-11 flex-1 rounded-xl border px-4 text-sm outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>

                {error && (
                  <p className="mt-2 text-sm text-red-500">{error}</p>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setStep("email");
                      setOtp("");
                      setError("");
                    }}
                    className="text-sm text-zinc-500 hover:underline"
                  >
                    ← Change Email address
                  </button>

                  <button
                    onClick={verifyEmailOtp}
                    disabled={loading}
                    className="h-11 rounded-xl bg-green-600 px-4 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                  >
                    {loading ? "Verifying..." : "Verify"}
                  </button>
                </div>


              </div>
            )}

            {loginMethod === "phone" && step === "phone-otp" && (
              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Enter OTP
                </label>

                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="h-11 w-full rounded-xl border px-4 text-sm outline-none focus:ring-2 focus:ring-green-600"
                />

                {error && (
                  <p className="mt-2 text-sm text-red-500">{error}</p>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setStep("phone");
                      setOtp("");
                      setError("");
                    }}
                    className="text-sm text-zinc-500 hover:underline"
                  >
                    ← Change Phone number
                  </button>

                  <button
                    onClick={verifyPhoneOtp}
                    disabled={loading}
                    className="h-11 rounded-xl bg-green-600 px-4 text-sm font-semibold text-white"
                  >
                    {loading ? "Verifying..." : "Verify"}
                  </button>
                </div>
              </div>
            )}

            {step === "email" && (
              <>
                {/* Divider */}
                <div className="my-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-zinc-200" />
                  <span className="text-sm text-zinc-400">or</span>
                  <div className="h-px flex-1 bg-zinc-200" />
                </div>

                {/* Google */}
                  <button
                    onClick={signInWithGoogle}
                    disabled={loading}
                    className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border text-sm font-medium hover:bg-zinc-50"
                  >
                    <MailIcon size={18} />
                    {googleLoading ? "Redirecting..." : "Continue with Google"}
                  </button>
                </>
              )}
          </div>
        </div>
      )}


      {openFinishSignup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpenFinishSignup(false)}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-md rounded-3xl bg-white px-4 sm:px-8 py-7 shadow-xl mx-3 sm:mx-auto">
            <h2 className="text-xl font-semibold mb-1">
              Finish Signing up
            </h2>
            <p className="text-sm text-zinc-500 mb-6">
              Just a few more details to get started
            </p>

            {/* Name */}
            <label className="text-sm font-medium">Name</label>
            <input
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-2 h-11 w-full rounded-xl border px-4"
            />
            <input
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-3 h-11 w-full rounded-xl border px-4"
            />

            {/* DOB */}
            <label className="mt-6 block text-sm font-medium">
              Date of Birth
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="mt-2 h-11 w-full rounded-xl border px-4"
            />

            {error && (
              <p className="mt-3 text-sm text-red-500">{error}</p>
            )}

            <button
              onClick={submitFinishSignup}
              disabled={loading}
              className="mt-8 h-12 w-full rounded-xl bg-black text-white font-medium disabled:opacity-60"
            >
              {loading ? "Saving..." : "Continue"}
            </button>
          </div>
        </div>
      )}

      {showAlmostThere && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAlmostThere(false)}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-md rounded-3xl bg-white px-4 sm:px-8 py-7 shadow-xl mx-3 sm:mx-auto">
            <h2 className="text-xl font-semibold mb-2">
              Almost there!
            </h2>

            <label className="text-sm font-medium">Email</label>
            <input
              value={email}
              disabled
              className="mt-2 h-11 w-full rounded-xl border px-4 bg-gray-100"
            />

            <label className="mt-4 block text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 h-11 w-full rounded-xl border px-4"
            />

            {error && (
              <p className="mt-3 text-sm text-red-500">{error}</p>
            )}

            <button
              onClick={handleContinue}
              className="mt-6 h-12 w-full rounded-xl bg-black text-white font-medium"
            >
              Continue
            </button>
          </div>
        </div>
      )}


    </div>
  );
}
