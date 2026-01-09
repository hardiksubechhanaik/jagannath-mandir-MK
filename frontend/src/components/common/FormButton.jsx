const FormButton = ({ text, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3 rounded-lg font-semibold text-white transition
        ${disabled
          ? "bg-orange-300 cursor-not-allowed"
          : "bg-orange-600 hover:bg-orange-700"
        }`}
    >
      {text}
    </button>
  )
}

export default FormButton;