type Props = {
  value: number;
};

const QuizzProgressBar = (props: Props) => {
  return (
    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
      <div
        className="bg-slate-900 h-2 rounded-full transition-all duration-500 ease-out"
        style={{
          width: `${props.value}%`,
        }}
      ></div>
    </div>
  );
};
export default QuizzProgressBar;
