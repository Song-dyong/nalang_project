import { Range, getTrackBackground } from "react-range";

interface Props {
  values: [number, number];
  onChange: (values: [number, number]) => void;
}

export const AgeRangeSlider = ({ values, onChange }: Props) => {
  const MIN = 10;
  const MAX = 80;

  return (
    <div className="w-full px-2">
      <div className="flex items-center space-x-2">
        <span className="text-xs bg-[#fca17d] text-white px-2 py-1 rounded-full min-w-[48px] text-center shadow-sm">
          {values[0]}세
        </span>
        <div className="flex-1">
          <Range
            step={1}
            min={MIN}
            max={MAX}
            values={values}
            onChange={(newValues) => onChange(newValues as [number, number])}
            renderTrack={({ props, children }) => {
              const { key, ...restProps } = props as {
                key?: string | number;
              } & typeof props;
              return (
                <div
                  key={key}
                  {...restProps}
                  className="h-2 w-full rounded-full"
                  style={{
                    background: getTrackBackground({
                      values,
                      colors: ["#d3d3d3", "#fca17d", "#d3d3d3"],
                      min: MIN,
                      max: MAX,
                    }),
                  }}
                >
                  {children}
                </div>
              );
            }}
            renderThumb={({ props }) => {
              const { key, ...restProps } = props; // ✅ key 분리
              return (
                <div
                  key={key}
                  {...restProps}
                  className="h-4 w-4 rounded-full bg-[#fca17d] shadow-md"
                />
              );
            }}
          />
        </div>
        <span className="text-xs bg-[#fca17d] text-white px-2 py-1 rounded-full min-w-[48px] text-center shadow-sm">
          {values[1]}세
        </span>
      </div>
    </div>
  );
};
