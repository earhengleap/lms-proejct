type Props = {
  value: number;
};

const QuizzProgressBar = (props: Props) => {
  return (
    <div className="w-full bg-slate-100 rounded-full h-2.5">
      <div
        className="bg-green-500 h-2.5 rounded-md"
        style={{
          width: `${props.value}%`,
        }}
      ></div>
    </div>
  );
};
export default QuizzProgressBar;
