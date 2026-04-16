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
  FlagTriangleRightIcon,
  X,
  ChevronDown,
  Mail,
  MailIcon,
  Star,
  Heart,
  HeartPlus,
  User,
  Grid,
  FlashlightIcon,
  ArrowRight,
  HomeIcon,
  LandPlot,
  ArrowLeft,
  FilterIcon,
  ArrowLeftCircle,
  AlignLeftIcon,
  Filter,
  FilterXIcon,
} from "lucide-react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";
import { forwardRef } from "react";

export default function HomeScreen() {

  const menuRef = useRef(null);
  const router = useRouter();

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
  const [dob, setDob] = useState(null);
  const [showAlmostThere, setShowAlmostThere] = useState(false);

  const [properties, setProperties] = useState([]);
  const [activeTab, setActiveTab] = useState(""); 
  const [activeCategory, setActiveCategory] = useState("All");
  const categories = [
    { label: "All", icon: Home },
    { label: "Staycations", icon: Tent },
    { label: "Feels", icon: Map },
    { label: "Hiking/Trekking", icon: Mountain },
  ];

  const [activeImageIndex, setActiveImageIndex] = useState({});
  const [activeSection, setActiveSection] = useState(null);

  const today = new Date();
  const minDate = new Date(
    today.getFullYear() - 100,
    today.getMonth(),
    today.getDate()
  );
  const maxDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - 1 
  );

  const clearAuthStates = () => {
    setEmail("");
    setLockedEmail("");
    setOtp("");
    setPassword("");
    setError("");
    setStep("email");
  };

  const sendPhoneOtp = async () => {
    if (!phone || phone.trim().length < 10) {
      setError("Enter valid phone number");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formattedPhone = phone.startsWith("+")
        ? phone
        : `+91${phone}`;

      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: formattedPhone }),
      });

      const data = await response.json();
      console.log("WhatsApp API Response:", data);

      if (!response.ok) {
        setError(data?.error?.message || "Failed to send OTP");
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

      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error?.message || "Invalid OTP");
        return;
      }

      alert("OTP Verified");

      setOpenLogin(false);
      router.replace("/");

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

    // Name must start with capital
    const nameRegex = /^[A-Z][a-zA-Z]*$/;

    if (!nameRegex.test(firstName)) {
      setError("First name must start with a capital letter");
      return;
    }

    if (!nameRegex.test(lastName)) {
      setError("Last name must start with a capital letter");
      return;
    }

    // 100 year limit validation (extra safety)
    const today = new Date();
    const minAllowedDate = new Date(
      today.getFullYear() - 100,
      today.getMonth(),
      today.getDate()
    );

    if (dob < minAllowedDate) {
      setError("Age cannot be more than 100 years");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const {
        data: { session },
        error: sessionError,
      } = await client.auth.getSession();

      if (sessionError || !session?.user) {
        setError("User session not found. Please login again.");
        setLoading(false);
        return;
      }

      const user = session.user;

      const { data: existingProfile, error: selectError } =
        await client
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

      if (selectError) {
        setError(selectError.message);
        setLoading(false);
        return;
      }

      // Convert to yyyy-mm-dd for database
      const dbDob = dob.toISOString().split("T")[0];

      if (!existingProfile) {
        const { error: insertError } = await client
          .from("profiles")
          .insert({
            id: user.id,
            first_name: firstName,
            last_name: lastName,
            dob: dbDob,
            onboarded: true,
            password_set: false,
            role: "traveler",
          });

        if (insertError) {
          setError(insertError.message);
          setLoading(false);
          return;
        }
      } else {
        const { error: updateError } = await client
          .from("profiles")
          .update({
            first_name: firstName,
            last_name: lastName,
            dob: dbDob,
            onboarded: true,
          })
          .eq("id", user.id);

        if (updateError) {
          setError(updateError.message);
          setLoading(false);
          return;
        }
      }

      setOpenFinishSignup(false);
      setShowAlmostThere(true);

    } catch (err) {
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

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await client
        .from("properties")
        .select(`
          id,
          title,
          location,
          price_per_night,
          duration,
          property_type,
          property_category,
          property_images (
            image_url,
            is_cover
          )
        `);

      if (error) {
        console.error("Error fetching:", error);
        return;
      }

      const formatted = data.map((item) => {
        const cover = item.property_images.find(
          (img) => img.is_cover === true
        );

        return {
          ...item,
          image: cover?.image_url || null,
        };
      });

      console.log("PROPERTIES DATA:", formatted);
      setProperties(formatted);
    };

    fetchProperties();
  }, []);



  return (
    <div className="w-full min-h-screen bg-white pb-24">

      {/* ================= HEADER ================= */}
      {!activeSection && (
        <header className="hidden md:flex sticky top-0 z-50 bg-white mx-auto max-w-7xl items-center justify-between px-4 py-4 md:px-8 md:static">
          {/* Logo */}
          <div className="h-9 w-28 cursor-pointer rounded bg-zinc-300" />

          {/* Actions */}
          <div className="flex items-center gap-6">
            <button className="hidden md:block cursor-pointer text-sm text-zinc-700">
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
              <div ref={menuRef} className="relative cursor-pointer">
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
      )}

      {/* ================= HERO ================= */}
      {!activeSection && (
        <section className="relative h-[420px] w-full sm:h-[480px] lg:h-[600px] hidden md:block">
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
      )}

      {/* ================= CATEGORIES ================= */}
      {!activeSection && (
        <section className="mx-auto mt-6 mb-6 max-w-2xl px-4 pb-4 sm:mt-8 hidden md:block cursor-pointer">
          <div className="flex justify-between sm:justify-around cursor-pointer">
            {categories.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => setActiveCategory(label)}
                className="flex flex-col items-center gap-1 text-xs sm:text-sm transition cursor-pointer"
              >
                {/* Icon */}
                <Icon
                  size={28}
                  className={
                    activeCategory === label
                      ? "text-[#205107]"
                      : "text-zinc-400"
                  }
                />

                {/* Text */}
                <span
                  className={
                    activeCategory === label
                      ? "text-[#205107]"
                      : "text-zinc-500"
                  }
                >
                  {label}
                </span>

                {/* Underline */}
                <span
                  className={`mt-1 h-[2px] w-full rounded-full ${
                    activeCategory === label
                      ? "bg-[#205107]"
                      : "bg-[#D9D9D9]"
                  }`}
                />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ================= MOBILE TOP AREA ================= */}
      {/* DEFAULT (Search + Categories) */}
      {!activeSection && (
        <div className="sticky top-0 z-50 bg-white border-b rounded-b-[25px] shadow-md px-4 pt-3 md:hidden">
          
          <div className="max-w-7xl mx-auto flex flex-col gap-3">

            {/* Input Row */}
            <div className="flex items-center gap-2 mt-3 mb-2">
              <button className="flex items-center gap-2 w-full h-[44px] bg-[#F7F7F7] border border-[#C6C6C6] rounded-[64px] px-3 text-sm font-medium">
                <Search size={16} /> 
                <span className="text-[#2E4454]">Search</span>
              </button>
            </div>

            {/* Categories */}
            <div className="flex overflow-x-auto no-scrollbar mt-2">
              <div className="flex gap-6 px-2 min-w-max">

                {categories.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    onClick={() => setActiveCategory(label)}
                    className="relative flex flex-col items-center gap-1 pb-3 shrink-0"
                  >
                    <Icon
                      size={22}
                      className={
                        activeCategory === label
                          ? "text-[#056300]"
                          : "text-[#2E4454]"
                      }
                    />

                    <span
                      className={`text-[13px] ${
                        activeCategory === label
                          ? "text-[#056300]"
                          : "text-[#2E4454]"
                      }`}
                    >
                      {label}
                    </span>

                    {activeCategory === label && (
                      <span className="absolute bottom-0 h-[2px] w-full bg-[#056300] rounded-full" />
                    )}
                  </button>
                ))}

              </div>
            </div>

          </div>
        </div>
      )}

      {/* BANNER */}
      {!activeSection && (
        <div className="relative w-[91%] max-w-sm h-36 mx-auto my-5 rounded-xl overflow-hidden shadow-md md:hidden">
          <Image
            src="/hero.jpg"
            alt="Nature stay"
            fill
            priority
            className="object-cover"
          />
        </div>
      )}

     {activeSection && (
        <div className="sticky top-0 z-50 bg-white border-b rounded-b-[25px] shadow-md px-4 py-5 flex items-center gap-3">

          {/* Back */}
          <button
            onClick={() => setActiveSection(null)}
            className="flex items-center justify-center h-8 w-8 rounded-full bg-[#F7F7F7] border border-[#C6C6C6]  hover:bg-zinc-100 transition"
          >
            <ArrowLeft size={16} strokeWidth={3} className="text-[#2E4454]" />
          </button>

          <div className="flex-1 md:flex-none md:w-[320px] lg:w-[360px]">
            <button className="flex items-center gap-2 w-full h-8 bg-[#F7F7F7] border border-[#C6C6C6] rounded-[64px] px-3 py-4 text-sm font-medium">
              <Search size={16} />
              <span className="text-[#2E4454]">Search a destination</span>
            </button>
          </div>

          {/* Filter */}
          <button className="flex items-center justify-center h-8 w-8 bg-[#F7F7F7] border border-[#C6C6C6] rounded-full">
            <FilterIcon size={16} className="text-[#2E4454]" />
          </button>

        </div>
      )}
      

      {/* ================= CONTENT SECTION ================= */}
      <section className="mx-auto mt-4 max-w-7xl px-5 md:px-5 space-y-5">
        {[
          { title: "Popular for you in Kerala", key: "all" },
          { title: "Staycation in Kerala", key: "staycation" },
          { title: "Feels - Experience - driven Stays", key: "feels" },
          { title: "Hiking/Trekking for you", key: "hiking" },
        ]

          .filter((section) => {
            if (activeSection) return section.key === activeSection;
            return true;
          })

          .map((section, idx) => {

            const filteredProperties =
              section.key === "all"
                ? (properties || []).filter((item) => item.property_type !== "hiking")
                : (properties || []).filter(
                    (item) => item.property_type === section.key
                  );

            return (
              <div key={idx}>

                {/* Header */}
                <div className={`flex items-center ${activeSection ? "justify-center" : "justify-between"}`}>
                  
                  <h1 className="text-base font-bold sm:text-lg lg:text-xl text-center">
                    {section.title}
                  </h1>

                  {/* Arrow hide when activeSection */}
                  {!activeSection && (
                    <button
                      onClick={() => setActiveSection(section.key)}
                      className="flex items-center justify-center h-8 w-8 rounded-full bg-[#F7F7F7] hover:bg-zinc-100 transition"
                    >
                      <ArrowRight size={16} strokeWidth={3} className="text-[#2E4454]" />
                    </button>
                  )}
                </div>

                {/* Cards */}
                <div
                  className={`
                    mt-4 gap-3 no-scrollbar
                    ${
                      activeSection
                        ? "flex flex-col md:flex-row md:overflow-x-auto md:snap-x md:snap-mandatory"
                        : "flex overflow-x-auto snap-x snap-mandatory"
                    }
                  `}
                >
                  {filteredProperties.length > 0 ? (
                    filteredProperties.map((item, i) => {

                      const isHiking = section.key === "hiking";

                      return (
                        <div
                          key={item.id || i}
                          className={`
                            cursor-pointer overflow-hidden 
                            ${activeSection 
                              ? "w-full" 
                              : "min-w-[45%] sm:min-w-[30%] lg:min-w-[23%]"
                            }
                          `}
                        >

                          {/* Image */}
                          <div
                            className={`
                              relative overflow-hidden rounded-lg
                              ${activeSection ? "h-[200px]" : "h-40 sm:h-44 lg:h-48"}
                            `}
                          >

                            <div
                              className="flex h-full w-full overflow-x-auto snap-x snap-proximity no-scrollbar scroll-smooth"
                              onScroll={(e) => {
                                const scrollLeft = e.target.scrollLeft;
                                const width = e.target.clientWidth;
                                const index = Math.round(scrollLeft / width);

                                setActiveImageIndex((prev) => ({
                                  ...prev,
                                  [item.id]: index,
                                }));
                              }}
                            >
                              {(item.property_images || []).map((img, index) => (
                                <img
                                  key={index}
                                  src={img.image_url}
                                  alt="property"
                                  className="w-full h-full object-cover flex-shrink-0 snap-start"
                                />
                              ))}
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent z-[5] pointer-events-none" />

                            {/* Wishlist */}
                            <button className="absolute top-2 right-2 z-10">
                              <Heart size={18} className="text-white drop-shadow-md" />
                            </button>

                            {/* Rating */}
                            <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 text-white text-xs drop-shadow-md">
                              <Star size={12} className="fill-white text-white" />
                              <span>4.9</span>
                            </div>

                            {/* Dots */}
                            <div className="absolute bottom-2 right-2 z-10 flex gap-1">
                              {(item.property_images || []).map((_, dotIndex) => (
                                <span
                                  key={dotIndex}
                                  className={`h-[5px] w-[5px] rounded-full ${
                                    (activeImageIndex[item.id] ?? 0) === dotIndex
                                      ? "bg-white"
                                      : "bg-white/50"
                                  }`}
                                />
                              ))}
                            </div>

                          </div>

                          {/* Content */}
                          <div className="p-1">

                            {isHiking ? (
                              <>
                                <p className="mt-1 text-[11px]">
                                  Available from {item.available_from || "N/A"}
                                </p>

                                <h3 className="mt-2 text-[11px] font-bold line-clamp-2">
                                  {item.title || "No Title"}
                                </h3>

                                <div className="flex items-center justify-between mt-2">
                                  <p className="text-[11px]">
                                    ₹{item.price_per_night || "0"} / head
                                  </p>

                                  <button className="bg-[#A4133C] text-white text-[10px] px-2 py-1 rounded-xl">
                                    Fast Filling
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-500">
                                  <Tent size={13} />
                                  <span>{item.property_category || "Individual Property"}</span>
                                </div>

                                <h3 className="mt-2 text-[11px] font-bold line-clamp-2">
                                  {item.title || "No Title"}, {item.location}
                                </h3>

                                <p className="mt-2 text-[11px]">
                                  ₹{item.price_per_night || "0"} for {item.duration}
                                </p>
                              </>
                            )}

                          </div>

                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-zinc-400 px-2">
                      No properties found
                    </p>
                  )}
                </div>

              </div>
            );
          })}
      </section>

      {/* ================= BOTTOM NAV (MOBILE ONLY) ================= */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white md:hidden">
        <div className="flex justify-around py-2 text-xs">

          {[
            { label: "My Feed", icon: Grid },
            { label: "Journeys", icon: Map },
            { label: "Bucket List", icon: HeartPlus },
            { label: user ? "Account" : "Login", icon: User },
          ].map(({ label, icon: Icon }, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (!user) {
                  resetLoginState(); // open login modal
                  return;
                }
                setActiveTab(label); // mark clicked tab as active
                console.log(`Navigate to ${label}`);
              }}
              className={`flex flex-col items-center ${
                activeTab === label ? "text-green-600" : "text-zinc-500"
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}

        </div>
      </div>

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
              className="absolute right-6 top-6 text-zinc-400 hover:text-zinc-600 cursor-pointer"
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
                className={`flex-1 cursor-pointer rounded-lg py-2 text-sm font-medium ${
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
                className={`flex-1 cursor-pointer rounded-lg py-2 text-sm font-medium ${
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
                      className="h-11 flex-1 rounded-xl border px-4 text-sm outline-none focus:ring-2 focus:ring-green-600 cursor-pointer"
                    />

                    <button
                      onClick={sendEmailOtp}
                      disabled={loading}
                      className="h-11 rounded-xl bg-green-600 px-4 text-sm font-semibold text-white cursor-pointer"
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
                    className="h-11 flex-1 rounded-xl border px-4 text-sm outline-none focus:ring-2 focus:ring-green-600 cursor-pointer"
                  />

                  <button
                    onClick={sendPhoneOtp}
                    disabled={loading}
                    className="h-11 rounded-xl bg-green-600 px-4 text-sm font-semibold text-white cursor-pointer"
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
                <label className="mb-2 block text-sm font-medium text-zinc-700 cursor-pointer">
                  Enter OTP
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="h-11 flex-1 rounded-xl border px-4 text-sm outline-none focus:ring-2 focus:ring-green-600 cursor-pointer"
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
                    className="text-sm text-zinc-500 hover:underline cursor-pointer"
                  >
                    ← Change Email address
                  </button>

                  <button
                    onClick={verifyEmailOtp}
                    disabled={loading}
                    className="h-11 rounded-xl bg-green-600 px-4 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60 cursor-pointer"
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
                  className="h-11 w-full rounded-xl border px-4 text-sm outline-none focus:ring-2 focus:ring-green-600 cursor-pointer"
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
                    className="h-11 rounded-xl bg-green-600 px-4 text-sm font-semibold text-white cursor-pointer"
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
                    className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border text-sm font-medium hover:bg-zinc-50 cursor-pointer"
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
          <div className="relative z-10 w-full max-w-md mx-4 sm:mx-auto">
            <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-zinc-100 cursor-pointer">
              
              <h2 className="text-2xl font-semibold text-zinc-900">
                Finish Signing up
              </h2>
              <p className="text-sm text-zinc-500 mt-1 mb-8">
                Just a few more details to get started
              </p>

              {/* First Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">
                  First Name
                </label>
                <input
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e) =>
                    setFirstName(
                      e.target.value.charAt(0).toUpperCase() +
                      e.target.value.slice(1)
                    )
                  }
                  className="h-12 w-full rounded-xl border border-zinc-300 px-4 text-sm outline-none focus:ring-2 focus:ring-black focus:border-black transition cursor-pointer"
                />
              </div>
              {/* Last Name */}
              <div className="space-y-2 mt-5">
                <label className="text-sm font-medium text-zinc-700">
                  Last Name
                </label>
                <input
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-12 w-full rounded-xl border border-zinc-300 px-4 text-sm outline-none focus:ring-2 focus:ring-black focus:border-black transition cursor-pointer"
                />
              </div>
              {/* Date of Birth */}
              <div className="space-y-2 mt-5 w-full">
                <label className="text-sm font-medium text-zinc-700">
                  Date of Birth
                </label>

                <div className="relative w-full">
                  <DatePicker
                    selected={dob}
                    onChange={(date) => {
                      setError("");
                      setDob(date);
                    }}
                    dateFormat="dd/MM/yyyy"
                    minDate={minDate}
                    maxDate={maxDate}
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                    placeholderText="Select your date of birth"
                    className="h-12 w-full rounded-xl border border-zinc-300 px-4 pr-12 text-sm cursor-pointer outline-none focus:ring-2 focus:ring-black focus:border-black transition"
                  />

                  {/* Calendar Icon */}
                  <Calendar
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
                  />
                </div>
              </div>
              {error && (
                <p className="mt-3 text-sm text-red-500">{error}</p>
              )}

              <button
                onClick={submitFinishSignup}
                disabled={loading}
                className="mt-8 h-12 w-full rounded-xl bg-black text-white text-sm font-medium hover:bg-zinc-800 transition disabled:opacity-60 cursor-pointer"
              >
                {loading ? "Saving..." : "Continue"}
              </button>
            </div>
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
              className="mt-2 h-11 w-full rounded-xl border px-4 bg-gray-100 cursor-pointer"
            />

            <label className="mt-4 block text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 h-11 w-full rounded-xl border px-4 cursor-pointer"
            />

            {error && (
              <p className="mt-3 text-sm text-red-500">{error}</p>
            )}

            <button
              onClick={handleContinue}
              className="mt-6 h-12 w-full rounded-xl bg-black text-white font-medium cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
