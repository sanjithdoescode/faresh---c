interface AccessibleInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  supportingText?: string;
  errorText?: string;
  language: 'en' | 'ta';
}

const AccessibleInput: React.FC<AccessibleInputProps> = ({
  label,
  value,
  onChange,
  supportingText,
  errorText,
  language
}) => {
  return (
    <div className="input-container">
      <label className={`label-${language}`}>
        {label}
        {/* Voice input support for low literacy users */}
        <VoiceInputButton onVoiceInput={onChange} language={language} />
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={`${label}-help`}
        className="large-touch-target"
      />
      {supportingText && (
        <div id={`${label}-help`} className="supporting-text">
          {supportingText}
        </div>
      )}
    </div>
  );
}; 