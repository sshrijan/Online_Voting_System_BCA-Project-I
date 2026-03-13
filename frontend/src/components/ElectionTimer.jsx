import React, { useState, useEffect, useCallback } from 'react';

const TimeBlock = ({ value, label }) => (
    <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 p-2 rounded-3 shadow-sm"
        style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-main)', minWidth: "60px" }}>
        <span className="fs-3 fw-bold font-monospace lh-1 mb-1">{String(value).padStart(2, '0')}</span>
        <span className="text-uppercase" style={{ fontSize: "0.65rem", letterSpacing: "1px", opacity: 0.8 }}>{label}</span>
    </div>
);

const ElectionTimer = ({ targetDate, t }) => {
    const calculateTimeLeft = useCallback(() => {
        if (!targetDate) return null;

        const end = new Date(targetDate).getTime();
        const now = new Date().getTime();
        const difference = end - now;

        if (difference <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true };
        }

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
            isEnded: false
        };
    }, [targetDate]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        if (!targetDate) return;

        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);

            if (newTimeLeft && newTimeLeft.isEnded) {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate, calculateTimeLeft]);

    if (!targetDate || !timeLeft) {
        return (
            <div className="text-center p-3 rounded-3 shadow-sm border"
                style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                <i className="bi bi-clock-history fs-3 mb-2 d-block"></i>
                <span className="small fw-semibold">{t?.noTimerSet || "No active election timer set"}</span>
            </div>
        );
    }

    return (
        <div className="election-timer-container">
            <div className="d-flex align-items-center justify-content-between mb-3"
                style={{ color: 'var(--text-main)' }}>
                <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                    <i className="bi bi-stopwatch text-danger"></i>
                    {timeLeft.isEnded ? (t?.electionEnded || "Election Ended") : (t?.timeRemaining || "Time Remaining")}
                </h6>
                {!timeLeft.isEnded && (
                    <span className="badge rounded-pill bg-danger d-flex align-items-center gap-1 animate-pulse">
                        <span className="spinner-grow spinner-grow-sm" style={{ width: '0.5rem', height: '0.5rem' }}></span>
                        Live
                    </span>
                )}
            </div>

            <div className="d-flex gap-2 w-100">
                <TimeBlock value={timeLeft.days} label={t?.days || "Days"} />
                <TimeBlock value={timeLeft.hours} label={t?.hours || "Hrs"} />
                <TimeBlock value={timeLeft.minutes} label={t?.minutes || "Min"} />
                <TimeBlock value={timeLeft.seconds} label={t?.seconds || "Sec"} />
            </div>
        </div>
    );
};

export default ElectionTimer;
