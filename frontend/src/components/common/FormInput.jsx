const FormInput = ({
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  readOnly = false,
  required = false
}) => {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}      
      readOnly={readOnly}
      required={required}
      className="
        w-full 
        border 
        border-orange-200 
        p-3 
        rounded-lg
        focus:outline-none 
        focus:ring-2 
        focus:ring-orange-400
      "
    />
  );
};

export default FormInput;
