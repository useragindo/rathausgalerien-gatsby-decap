export type LotteryInputProps = {
	id: string;
	name: string;
	value: string;
	invalid?: boolean;
	onChange: (value: string) => void;
};

export type LotteryOption = {
	label: string;
	value: string;
};
