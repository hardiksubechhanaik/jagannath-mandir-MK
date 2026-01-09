const FormTextarea = ({placeholder, value, onChange, rows =4, name}) => {
    return (
        <textarea 
        rows={rows}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full border border-orange-200 p-3 rounded-lg
                 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
    )
}

export default FormTextarea;