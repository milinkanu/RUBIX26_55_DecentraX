"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option {
    value: string;
    label: string;
}

interface CustomDropdownProps {
    label: string;
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function CustomDropdown({ label, options, value, onChange, placeholder = "Select..." }: CustomDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedLabel = options.find((opt) => opt.value === value)?.label || placeholder;

    return (
        <div className="relative group" ref={dropdownRef}>
            <label className="block text-sm text-gray-400 mb-2 font-medium">{label}</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex justify-between items-center bg-black/40 backdrop-blur-sm border rounded-xl p-3.5 text-white transition-all duration-300 
                ${isOpen
                        ? "border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)] bg-black/60"
                        : "border-gray-700 hover:border-yellow-400/50 hover:bg-black/50"
                    }`}
            >
                <span className={`truncate ${!value ? "text-gray-400" : "text-white font-medium"}`}>
                    {selectedLabel}
                </span>
                <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-yellow-400" : ""}`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                        {options.map((option) => (
                            <div
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`px-4 py-3 rounded-lg cursor-pointer flex justify-between items-center transition-all duration-200 gap-2
                                    ${option.value === value
                                        ? "bg-yellow-400/10 text-yellow-400 font-medium"
                                        : "text-gray-300 hover:bg-yellow-400 hover:text-black hover:font-semibold hover:shadow-lg hover:shadow-yellow-400/20"
                                    }
                                `}
                            >
                                <span>{option.label}</span>
                                {option.value === value && <Check className="w-4 h-4" />}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
