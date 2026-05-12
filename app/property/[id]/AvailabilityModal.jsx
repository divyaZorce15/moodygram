"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

export default function AvailabilityModal({
  isOpen,
  onClose,
  property,
}) {
  const today = new Date();

  // ONLY TODAY + FUTURE
  const minDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const [selectedDates, setSelectedDates] = useState([]);

  // MONTHS
  const months = useMemo(() => {
    const arr = [];

    for (let i = 0; i < 12; i++) {
      arr.push(
        new Date(
          today.getFullYear(),
          today.getMonth() + i,
          1
        )
      );
    }

    return arr;
  }, []);

  if (!isOpen) return null;

  // FORMAT DATE
  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
    }).format(date);
  };

  // RANGE BG
  const isInRange = (date) => {
    if (selectedDates.length < 2) return false;

    const start = selectedDates[0];
    const end = selectedDates[1];

    return date > start && date < end;
  };

  // DATE CLICK
  const handleDateClick = (date) => {
    if (date < minDate) return;

    // START NEW RANGE
    if (
      selectedDates.length === 0 ||
      selectedDates.length >= 2
    ) {
      setSelectedDates([date]);
      return;
    }

    // END DATE
    if (selectedDates.length === 1) {
      const firstDate = selectedDates[0];

      // SAME DATE REMOVE
      if (
        firstDate.toDateString() ===
        date.toDateString()
      ) {
        setSelectedDates([]);
        return;
      }

      // SORT START + END
      const start =
        firstDate < date ? firstDate : date;

      const end =
        firstDate > date ? firstDate : date;

      setSelectedDates([start, end]);
    }
  };

  // TOTAL NIGHTS
  const totalNights =
    selectedDates.length === 2
      ? Math.ceil(
          (selectedDates[1] - selectedDates[0]) /
            (1000 * 60 * 60 * 24)
        )
      : 1;

  // TOTAL PRICE
  const totalPrice =
    (property?.price_per_night || 0) *
    totalNights;

  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/30 z-[999]"
      />

      {/* MODAL */}
      <div
        className="
          fixed inset-x-0 bottom-0 z-[1000]
          bg-white
          rounded-t-[34px]
          h-[92vh]
          flex flex-col
          animate-slideUp
        "
      >

        {/* HEADER */}
        <div className="shrink-0 flex items-center justify-between px-4 pt-5 pb-3 bg-white rounded-t-[34px]">

          {/* CLOSE */}
          <button
            onClick={onClose}
            className="h-9 w-9 flex items-center justify-center"
          >
            <X size={20} />
          </button>

          {/* TITLE */}
          <div className="text-center">
            <h2 className="text-[14px] font-semibold">
              Select check-in date
            </h2>

            {/* {selectedDates.length > 0 && (
              <p className="text-[11px] text-gray-500 mt-0.5">
                {formatDate(selectedDates[0])}

                {selectedDates.length > 1 &&
                  ` - ${formatDate(
                    selectedDates[1]
                  )}`}
              </p>
            )} */}
          </div>

          {/* CLEAR */}
          <button
            onClick={() => setSelectedDates([])}
            className="text-[12px] font-medium"
          >
            Clear dates
          </button>
        </div>

        {/* CALENDAR */}
        <div className="flex-1 overflow-y-auto px-3 pb-5 bg-white">

          {months.map((month, idx) => {
            const year = month.getFullYear();
            const monthIndex = month.getMonth();

            const firstDay = new Date(
              year,
              monthIndex,
              1
            );

            const lastDay = new Date(
              year,
              monthIndex + 1,
              0
            );

            const daysInMonth =
              lastDay.getDate();

            const startDay =
              firstDay.getDay();

            const days = [];

            // EMPTY SPACES
            for (let i = 0; i < startDay; i++) {
              days.push(null);
            }

            // DAYS
            for (
              let d = 1;
              d <= daysInMonth;
              d++
            ) {
              days.push(
                new Date(year, monthIndex, d)
              );
            }

            return (
              <div
                key={idx}
                className="border rounded-[24px] p-3 mt-3 bg-white"
              >

                {/* MONTH HEADER */}
                <div className="flex items-center justify-between mb-3">

                  <button className="text-gray-400">
                    <ChevronLeft size={16} />
                  </button>

                  <h2 className="text-[13px] font-semibold">
                    {month.toLocaleString(
                      "default",
                      {
                        month: "long",
                      }
                    )}{" "}
                    {year}
                  </h2>

                  <button className="text-gray-400">
                    <ChevronRight size={16} />
                  </button>

                </div>

                {/* WEEK DAYS */}
                <div className="grid grid-cols-7 text-center text-[8px] tracking-wide text-gray-400 mb-2">
                  {[
                    "SUN",
                    "MON",
                    "TUE",
                    "WED",
                    "THU",
                    "FRI",
                    "SAT",
                  ].map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>

                {/* DAYS */}
                <div className="grid grid-cols-7 gap-y-1">

                  {days.map((date, i) => {
                    if (!date) {
                      return (
                        <div
                          key={i}
                          className="h-8"
                        />
                      );
                    }

                    const isPast =
                      date < minDate;

                    const inRange =
                      isInRange(date);

                    const isStart =
                      selectedDates[0] &&
                      date.toDateString() ===
                        selectedDates[0].toDateString();

                    const isEnd =
                      selectedDates[1] &&
                      date.toDateString() ===
                        selectedDates[1].toDateString();

                    return (
                      <div
                        key={i}
                        className="
                          relative
                          flex
                          items-center
                          justify-center
                          h-8
                        "
                      >

                        {/* RANGE BG */}
                        {inRange && (
                          <div className="absolute h-8  w-8 rounded-full bg-[#F0F0F0]" />
                        )}

                        {/* DATE */}
                        <button
                          disabled={isPast}
                          onClick={() =>
                            handleDateClick(date)
                          }
                          className={`
                            relative
                            z-10
                            h-8
                            w-8
                            rounded-full
                            text-[12px]
                            flex
                            items-center
                            justify-center

                            ${
                              isPast
                                ? "text-gray-300"
                                : "text-[#2E4454]"
                            }

                            ${
                              isStart || isEnd
                                ? "bg-green-700 text-white font-semibold"
                                : ""
                            }
                          `}
                        >
                          {date.getDate()}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* FIXED FOOTER */}
        {selectedDates.length > 0 && (
          <div
            className="
              shrink-0
              bg-white
              border-t
              border-gray-200
              px-4
              py-3
              flex
              items-center
              justify-between
              relative
              z-20
            "
          >

            {/* LEFT */}
            <div>
              <p className="font-semibold text-sm">
                ₹ {totalPrice.toLocaleString()}
              </p>

              <p className="text-[11px] text-gray-500">

                {/* ONE DATE */}
                {selectedDates.length === 1 && (
                  <>
                    1 night ·{" "}
                    {formatDate(selectedDates[0])}
                  </>
                )}

                {/* RANGE */}
                {selectedDates.length === 2 && (
                  <>
                    {totalNights} nights ·{" "}
                    {formatDate(selectedDates[0])}
                    {" - "}
                    {formatDate(selectedDates[1])}
                  </>
                )}
              </p>
            </div>

            {/* BUTTON */}
            <button className="bg-green-700 text-white px-5 py-2.5 rounded-full text-sm font-medium">
              Continue
            </button>
          </div>
        )}
      </div>
    </>
  );
}