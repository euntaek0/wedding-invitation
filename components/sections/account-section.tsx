"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Reveal } from "@/components/ui/reveal";
import type { Language } from "@/types/language";
import type { TouchEvent } from "react";

type AccountCopy = {
  heading: string;
  intro: string;
  groomParents: string;
  brideParents: string;
  coupleSide: string;
  openModal: string;
  closeModal: string;
  copy: string;
  copied: string;
};

interface AccountSectionProps {
  language: Language;
  copy: AccountCopy;
}

type AccountItem = {
  id: string;
  owner: string;
  bank: string;
  number: string;
};

const groomParentAccounts: AccountItem[] = [
  {
    id: "groom-gujihong",
    owner: "구지홍",
    bank: "SC제일은행",
    number: "617-20-170602",
  },
];

const brideParentAccounts: AccountItem[] = [
  {
    id: "bride-kimgwangil",
    owner: "김광일",
    bank: "농협",
    number: "356 0695 6249 63",
  },
];

const coupleAccounts: AccountItem[] = [
  {
    id: "bride-kimyeeun",
    owner: "김예은",
    bank: "농협",
    number: "352 0890 425053",
  },
];

export function AccountSection({ language, copy }: AccountSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dragY, setDragY] = useState(0);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [isEntering, setIsEntering] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || isClosing) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        startClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, isClosing]);

  useEffect(() => {
    if (isOpen) {
      setDragY(0);
      setTouchStartY(null);
      setIsClosing(false);
      if (isEntering) {
        const raf = window.requestAnimationFrame(() => {
          setIsEntering(false);
        });
        return () => window.cancelAnimationFrame(raf);
      }
    }
  }, [isOpen, isEntering]);

  const startClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTouchStartY(null);
    setDragY(0);
    window.setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 220);
  };

  const copyAccount = async (account: AccountItem) => {
    const payload = `${account.bank} ${account.owner} ${account.number}`;
    try {
      await navigator.clipboard.writeText(payload);
      setCopiedId(account.id);
      window.setTimeout(() => setCopiedId((prev) => (prev === account.id ? null : prev)), 1200);
    } catch {
      setCopiedId(null);
    }
  };

  const renderRows = (items: AccountItem[]) =>
    items.map((item) => (
      <li key={item.id} className="wi-account-row pt-0 pb-2.5">
        <div className="wi-account-row-head mx-1 mb-1 flex items-center justify-between gap-3">
          <p className="wi-account-bank text-xs text-[#7d6e64]">{item.bank}</p>
          <p className="wi-account-owner text-xs text-[#9a8b81]">{item.owner}</p>
        </div>
        <div className="wi-account-row-main flex items-center justify-between gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5">
          <p className="wi-account-number text-[0.9rem] text-[var(--foreground)]">{item.number}</p>
          <button
            type="button"
            onClick={() => copyAccount(item)}
            aria-label={`${item.owner} ${copy.copy}`}
            className="wi-account-copy inline-flex h-7 w-7 shrink-0 items-center justify-center text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M5 15V5a1 1 0 0 1 1-1h10" />
            </svg>
          </button>
        </div>
        {copiedId === item.id ? (
          <p className="wi-account-copied mt-1 text-right text-xs text-[var(--muted)]">{copy.copied}</p>
        ) : null}
      </li>
    ));

  const onSheetTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    setTouchStartY(event.touches[0]?.clientY ?? null);
  };

  const onSheetTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartY == null) return;
    const next = (event.touches[0]?.clientY ?? 0) - touchStartY;
    setDragY(next > 0 ? Math.min(next, 220) : 0);
  };

  const onSheetTouchEnd = () => {
    if (dragY > 90) {
      startClose();
      return;
    }
    setDragY(0);
    setTouchStartY(null);
  };

  return (
    <>
      <Reveal className="wi-section wi-section-account px-5 py-12 sm:px-8 sm:py-14">
        <section id="account" className="wi-account space-y-7 text-center">
          <div className="wi-account-header space-y-3">
            <h2 className="wi-title wi-account-title section-title text-[1.8rem] text-[#8f7f72]">{copy.heading}</h2>
            <p className="wi-account-intro mx-auto max-w-[320px] whitespace-pre-line text-base leading-relaxed text-[var(--muted)] [text-wrap:pretty]">
              {copy.intro}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsEntering(true);
              setIsOpen(true);
            }}
            className="wi-account-open-button wi-btn-primary mx-auto mt-20 flex min-w-[180px] items-center justify-center rounded-xl px-5 py-4 text-base font-medium"
          >
            <span className="inline-flex items-center gap-2">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <rect x="3" y="6" width="18" height="12" rx="2" />
                <path d="M3 10h18" />
              </svg>
              {copy.openModal}
            </span>
          </button>
        </section>
      </Reveal>

      {mounted && isOpen
        ? createPortal(
            <div
              className={`wi-account-sheet-backdrop fixed inset-0 z-50 transition-opacity duration-200 ${
                isClosing ? "bg-black/0" : "bg-black/35"
              }`}
              role="dialog"
              aria-modal="true"
              onClick={startClose}
            >
              <div
                className="wi-account-sheet fixed inset-x-0 bottom-0 mx-auto max-w-[620px] rounded-t-[22px] border border-[var(--line)] bg-[#fbfbfc] px-8 pb-5 pt-2.5 shadow-[0_-12px_28px_rgba(0,0,0,0.14)]"
                onClick={(event) => event.stopPropagation()}
                onTouchStart={onSheetTouchStart}
                onTouchMove={onSheetTouchMove}
                onTouchEnd={onSheetTouchEnd}
                style={{
                  transform: isClosing
                    ? "translateY(100%)"
                    : isEntering
                      ? "translateY(100%)"
                      : `translateY(${dragY}px)`,
                  transition: touchStartY == null ? "transform 0.22s ease" : "none",
                }}
              >
                <div className="wi-account-sheet-grabber mx-auto mb-3 h-1.5 w-[72px] rounded-full bg-[#e4e5e8]" />
                <div className="wi-account-sheet-head mb-3 text-center">
                  <h3 className="wi-account-sheet-title section-title text-[1rem] text-[#7d6154]">마음 전하는 곳</h3>
                </div>

                <div className="wi-account-sheet-cards space-y-3 overflow-y-auto pb-1 max-h-[70vh]">
                  <article className="wi-account-card px-1 py-1">
                    <h4 className="wi-account-card-title text-center text-[0.9rem] text-[var(--foreground)]">
                      {copy.groomParents}
                    </h4>
                    <ul className="wi-account-list mt-1">{renderRows(groomParentAccounts)}</ul>
                  </article>

                  <article className="wi-account-card px-1 py-1">
                    <h4 className="wi-account-card-title text-center text-[0.9rem] text-[var(--foreground)]">
                      {copy.brideParents}
                    </h4>
                    <ul className="wi-account-list mt-1">{renderRows(brideParentAccounts)}</ul>
                  </article>

                  <article className="wi-account-card px-1 py-1">
                    <h4 className="wi-account-card-title text-center text-[0.9rem] text-[var(--foreground)]">
                      {copy.coupleSide}
                    </h4>
                    <ul className="wi-account-list mt-1">{renderRows(coupleAccounts)}</ul>
                  </article>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
