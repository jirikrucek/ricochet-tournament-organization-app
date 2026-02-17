import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import './LanguageSelector.css';

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'cs', label: 'Čeština' },
    { code: 'de', label: 'Deutsch' },
    { code: 'nl', label: 'Nederlands' },
    { code: 'pl', label: 'Polski' }
];

const LanguageSelector = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const changeLanguage = (langCode) => {
        i18n.changeLanguage(langCode);
        setIsOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="language-selector" ref={dropdownRef}>
            <button
                className="lang-toggle-btn"
                onClick={toggleDropdown}
                aria-label="Select Language"
            >
                <Globe size={20} />
            </button>

            {isOpen && (
                <div className="lang-dropdown">
                    {LANGUAGES.map((lang) => {
                        const currentLang = i18n.language || 'pl';
                        const isActive = currentLang.startsWith(lang.code);
                        return (
                            <button
                                key={lang.code}
                                className={`lang-option ${isActive ? 'active' : ''}`}
                                onClick={() => changeLanguage(lang.code)}
                            >
                                <span className="lang-label">{lang.label}</span>
                                {isActive && <Check size={16} className="lang-check" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
